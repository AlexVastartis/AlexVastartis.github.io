/**
 * Builds public/data/teams.json (+ meta.json + a dated snapshot) from the
 * committed data store — NEVER the network.
 *
 * Inputs
 *   data/api/ap-poll-summary.json   AP weeks / top-10 / final #1, per team per season   (CFBD)
 *   data/api/draft.json             every NFL draft pick                                 (CFBD)
 *   data/api/conferences.json       current conference per school                        (CFBD)
 *   data/season-records.csv         wins/losses/ties per (school, season)                (CFBD + manual pre-1936)
 *   data/manual/national_titles.csv one row per title (school, year, selector)           (manual)
 *   data/manual/conference_titles.csv / all_americans.csv                                (manual; summary fallback)
 *   data/manual/heisman.csv / vacated_wins.csv / teams.csv / blurbs.csv                  (manual)
 *   data/manual/stats_summary.csv   fallback counts where granular rows are absent       (manual)
 *
 * Model — "percentile-trimmed-mean": each of the 10 stats -> within-FBS percentile;
 * drop each program's single highest and single lowest; Rating = mean of the other 8.
 *
 * Everything is computed twice: `asPlayed` (default, vacated wins counted) and
 * `official` (vacated wins removed). Trajectory always uses asPlayed.
 *
 * Run: npm run build:data   (run `npm run data:api` first if the store is stale)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords, writeRecords } from './lib/csv.mjs';
import { detectTiers } from './lib/tiers.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = path.join(REPO, 'data/api');
const MANUAL = path.join(REPO, 'data/manual');
const PUBLIC = path.join(REPO, 'public/data');
const SNAP = path.join(REPO, 'data/snapshots');

const AP_FROM = 1936;
const TREND_RECENT_FRAC = 0.2;
// which national-title selectors count toward the Championships criterion. A title
// YEAR counts when a program has >=1 national_titles.csv row with one of these
// selectors and a status other than 'not-claimed'. 'claim' rows (a school's own
// unbacked claim) are never in this set, so they never count. Pre-1936 the major
// retroactive selectors are CFRA / HAF / NCF.
const TITLE_SELECTORS = new Set([
  'AP', 'UPI', 'FWAA', 'NFF', 'USA/CNN', 'USA/ESPN', 'AFCA', 'BCS', 'CFP', 'CFRA', 'HAF', 'NCF',
]);

const STAT_KEYS = [
  'allTimeWins', 'winPct', 'nationalTitles', 'conferenceTitles', 'consensusAA',
  'unanimousAA', 'nflDraftPicks', 'firstRoundPicks', 'weeksApPoll', 'weeksApTop10',
];
const CRITERIA = {
  perception: ['weeksApPoll', 'weeksApTop10'],
  wins: ['allTimeWins', 'winPct'],
  championships: ['nationalTitles', 'conferenceTitles'],
  allAmericans: ['consensusAA', 'unanimousAA'],
  nflDraft: ['nflDraftPicks', 'firstRoundPicks'],
};
const CK = Object.keys(CRITERIA);
const CRIT_LABEL = {
  perception: 'AP Poll Success', wins: 'Wins', championships: 'Championships',
  allAmericans: 'All-Americans', nflDraft: 'NFL Draft Success',
};

const GROUPS = ['Blue Bloods', 'Blue Blood Fringe', 'Blue Blood Contenders', 'National Powers', 'National Brands', 'The Field'];
// where a program should look next — the grouping whose median it must reach
const TARGET_GROUP = {
  'Blue Bloods': 'Blue Bloods', // hold the standard
  'Blue Blood Fringe': 'Blue Bloods',
  'Blue Blood Contenders': 'Blue Bloods',
  'National Powers': 'Blue Blood Contenders',
  'National Brands': 'National Powers',
  'The Field': 'National Brands',
};

const PROVENANCE = {
  perception: 'Every weekly AP poll ballot, 1936–present (CollegeFootballData → data/api/ap-poll.json).',
  wins: 'Wins/losses/ties per season (CollegeFootballData 1936+; one hand-entered "through 1935" row per program set so the all-time total matches the program’s Wikipedia figure → data/season-records.csv). A tie counts as half a win.',
  championships: 'National-title list, one row per (school, year, selector); AP/UPI/FWAA/NFF/USA + CFRA/HAF/NCF count, "claim"/"not-claimed" do not (data/manual/national_titles.csv).',
  allAmericans: 'Every consensus All-America selection from the NCAA "Football Award Winners" record book, one row per player; unanimous flagged from 1924 (data/manual/all_americans.csv).',
  nflDraft: 'Every NFL draft pick by school, 1936–present (CollegeFootballData → data/api/draft.json).',
};

/* ---- helpers ---- */
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const median = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const stddev = (xs, mu = mean(xs)) => (xs.length ? Math.sqrt(xs.reduce((a, b) => a + (b - mu) ** 2, 0) / xs.length) : 0);
const trimmean = (arr, prop) => {
  const s = [...arr].sort((a, b) => a - b);
  const k = Math.floor((s.length * prop) / 2);
  return mean(s.slice(k, s.length - k));
};
const zfun = (xs) => {
  const mu = mean(xs);
  const sd = stddev(xs, mu);
  return (x) => (sd === 0 ? 0 : (x - mu) / sd);
};
function pctFn(sortedAsc) {
  return (x) => {
    let lo = 0;
    let hi = sortedAsc.length;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (sortedAsc[m] < x) lo = m + 1;
      else hi = m;
    }
    let he = lo;
    while (he < sortedAsc.length && sortedAsc[he] === x) he += 1;
    return (lo + he) / 2 / sortedAsc.length;
  };
}
const pctOf = (arr) => {
  const f = pctFn([...arr].sort((a, b) => a - b));
  return arr.map(f);
};
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const csv = (name) => readRecords(fs.readFileSync(path.join(MANUAL, name), 'utf8'));
/** optional override file in data/manual/ — Map<school, row>; empty if the file is absent */
const overrideMap = (name) => {
  const p = path.join(MANUAL, name);
  if (!fs.existsSync(p)) return new Map();
  return new Map(readRecords(fs.readFileSync(p, 'utf8')).filter((r) => r.school).map((r) => [r.school, r]));
};

/* ---- CFBD school name -> our canonical school ---- */
const CFBD_ALIAS = {
  'NC State': 'North Carolina State', 'App State': 'Appalachian State', Massachusetts: 'UMass',
  Connecticut: 'UConn', 'Louisiana Monroe': 'Louisiana-Monroe', 'UL Monroe': 'Louisiana-Monroe',
  'Southern Mississippi': 'Southern Miss', Miami: 'Miami (FL)', "Hawai'i": 'Hawaii',
  'San José State': 'San Jose State', 'Sam Houston': 'Sam Houston State', 'Florida International': 'FIU',
};
const CONF_DISPLAY = {
  'American Athletic': 'American', 'Mid-American': 'MAC', 'Conference USA': 'C-USA', 'FBS Independents': 'Independent',
};
const alias = (s) => CFBD_ALIAS[s] || s;

/* ---- load ---- */
function load() {
  const teams = csv('teams.csv');
  const summary = new Map(csv('stats_summary.csv').map((r) => [r.school, r]));
  const blurbs = new Map(csv('blurbs.csv').filter((r) => r.tagline).map((r) => [r.school, r.tagline]));

  const titles = new Map();
  for (const r of csv('national_titles.csv')) {
    if (r.status === 'not-claimed') continue; // a selector named them; the school doesn't claim it
    if (!TITLE_SELECTORS.has(r.selector)) continue; // excludes 'claim' rows
    if (!titles.has(r.school)) titles.set(r.school, new Set());
    titles.get(r.school).add(r.year); // distinct years
  }
  const confTitles = new Map();
  for (const r of csv('conference_titles.csv')) {
    confTitles.set(r.school, (confTitles.get(r.school) || 0) + 1);
  }
  // all_americans.csv is one row per consensus selection (Yes/No flags); aggregate
  // to per-(school) totals and a per-season {c,u} series for the trajectory.
  const aa = new Map(); // school -> { c, u, perYear:{yr:{c,u}} }
  for (const r of csv('all_americans.csv')) {
    if (!r.school || !r.year) continue;
    const e = aa.get(r.school) || { c: 0, u: 0, perYear: {} };
    const c = /^y/i.test(r.consensus) ? 1 : Number(r.consensus) || 0;
    const u = /^y/i.test(r.unanimous) ? 1 : Number(r.unanimous) || 0;
    e.c += c;
    e.u += u;
    const py = e.perYear[r.year] || { c: 0, u: 0 };
    py.c += c;
    py.u += u;
    e.perYear[r.year] = py;
    aa.set(r.school, e);
  }
  const heisman = new Map();
  for (const r of csv('heisman.csv')) heisman.set(r.school, (heisman.get(r.school) || 0) + 1);
  // vacated_wins.csv: one row per (school, season); sum per school for the 'official' variant
  const vacated = new Map(); // school -> { w, l }
  for (const r of csv('vacated_wins.csv')) {
    const w = Number(r.wins_vacated || 0);
    const l = Number(r.losses_vacated || 0);
    if (w + l === 0) continue;
    const e = vacated.get(r.school) || { w: 0, l: 0 };
    e.w += w;
    e.l += l;
    vacated.set(r.school, e);
  }

  const apSummary = readJson(path.join(API, 'ap-poll-summary.json'));
  const draftRows = readJson(path.join(API, 'draft.json'));
  const conferences = fs.existsSync(path.join(API, 'conferences.json'))
    ? readJson(path.join(API, 'conferences.json')).bySchool
    : {};

  // season records -> per team totals + per-season (w/l/t so a per-season win % keeps ties)
  const sr = readRecords(fs.readFileSync(path.join(REPO, 'data/season-records.csv'), 'utf8'));
  const records = new Map();
  for (const r of sr) {
    const e = records.get(r.school) || { wins: 0, losses: 0, ties: 0, games: 0, perSeason: {} };
    const w = Number(r.wins || 0);
    const l = Number(r.losses || 0);
    const ti = Number(r.ties || 0);
    e.wins += w;
    e.losses += l;
    e.ties += ti;
    e.games += w + l + ti;
    if (Number(r.season) >= AP_FROM) e.perSeason[r.season] = { w, l, t: ti, wins: w, games: w + l + ti };
    records.set(r.school, e);
  }

  // draft -> per team totals + per-season picks (+ per-season first-rounders)
  const draft = new Map();
  for (const p of draftRows) {
    const s = alias(p.school);
    const e = draft.get(s) || { picks: 0, firstRound: 0, perSeason: {}, firstBySeason: {} };
    e.picks += 1;
    e.perSeason[p.year] = (e.perSeason[p.year] || 0) + 1;
    if (p.round === 1) {
      e.firstRound += 1;
      e.firstBySeason[p.year] = (e.firstBySeason[p.year] || 0) + 1;
    }
    draft.set(s, e);
  }

  // title years per program (national_titles.csv, filtered) — for trajectory
  const titleYears = new Map();
  for (const [school, yrs] of titles) titleYears.set(school, [...yrs].map(Number).sort((a, b) => a - b));

  const overrides = {
    grouping: overrideMap('grouping_overrides.csv'),
    trend: overrideMap('trend_overrides.csv'),
    comparison: overrideMap('relative_comparison.csv'),
    projection: overrideMap('projection_overrides.csv'),
  };

  return {
    teams, summary, blurbs, titles, titleYears, confTitles, aa, heisman, vacated,
    apSummary, draftRows, conferences, records, draft, overrides,
  };
}

/** raw stat line per team for a given wins mode ('asPlayed' | 'official') */
function buildRows(D, mode) {
  const granularAA = { consensus: 0, summaryC: 0 };
  const rows = D.teams.map((t) => {
    const ap = D.apSummary.teams[t.school] || D.apSummary.teams[revAlias(t.school)] || {};
    const rec = D.records.get(t.school) || { wins: 0, losses: 0, ties: 0, games: 0, perSeason: {} };
    const dr = D.draft.get(t.school) || { picks: 0, firstRound: 0, perSeason: {} };
    const sum = D.summary.get(t.school) || {};

    let wins = rec.wins;
    let games = rec.games;
    const ties = rec.ties;
    if (mode === 'official' && D.vacated.has(t.school)) {
      const v = D.vacated.get(t.school);
      wins -= v.w;
      games -= v.w + v.l;
    }
    // college-football convention: a tie counts as half a win
    const winPct = games ? (wins + 0.5 * ties) / games : 0;

    // consensus & unanimous AA from the per-player list where a program has rows,
    // else the summary count (a handful of newer programs with no selections).
    const aaRec = D.aa.get(t.school);
    let consensusAA;
    let unanimousAA;
    if (aaRec && Object.keys(aaRec.perYear).length) {
      consensusAA = aaRec.c;
      unanimousAA = aaRec.u;
      granularAA.consensus += 1;
    } else {
      consensusAA = Number(sum.consensus_aa || 0);
      unanimousAA = Number(sum.unanimous_aa || 0);
      granularAA.summaryC += 1;
    }

    const confT = D.confTitles.has(t.school) ? D.confTitles.get(t.school) : Number(sum.conference_titles || 0);

    return {
      school: t.school,
      slug: t.slug,
      primary: t.primary_hex,
      secondary: t.secondary_hex,
      formerFcs: String(t.former_fcs) === '1',
      conference: (() => {
        const c = D.conferences[t.school] || t.conference || 'Independent';
        return CONF_DISPLAY[c] || c;
      })(),
      heismans: D.heisman.get(t.school) || 0,
      raw: {
        allTimeWins: wins,
        winPct,
        nationalTitles: D.titles.has(t.school) ? D.titles.get(t.school).size : Number(sum.national_titles || 0),
        conferenceTitles: confT,
        consensusAA,
        unanimousAA,
        nflDraftPicks: dr.picks || Number(sum.nfl_draft_picks || 0),
        firstRoundPicks: dr.firstRound || Number(sum.first_round_picks || 0),
        weeksApPoll: ap.weeksPoll || 0,
        weeksApTop10: ap.weeksTop10 || 0,
      },
    };
  });
  return { rows, granularAA };
}

function revAlias(school) {
  for (const [k, v] of Object.entries(CFBD_ALIAS)) if (v === school) return k;
  return school;
}

/* ---- trajectory: a program's most recent ~20% of seasons vs. its whole history,
 *      across all ten rating stats (eight of which have a usable per-season series:
 *      conference titles and unanimous All-Americans do not). Each of the five
 *      criteria carries roughly equal weight. ---- */
// per-season feature -> { criterion, weight, label }; weights sum to 1
const TREND_FEATURES = {
  apW: { crit: 'perception', w: 0.15, label: 'AP weeks' },
  apT: { crit: 'perception', w: 0.15, label: 'AP top-10 weeks' },
  win: { crit: 'wins', w: 0.10, label: 'win rate' },
  wins: { crit: 'wins', w: 0.10, label: 'wins per season' },
  title: { crit: 'championships', w: 0.20, label: 'national titles' },
  aa: { crit: 'allAmericans', w: 0.15, label: 'consensus All-Americans' },
  draft: { crit: 'nflDraft', w: 0.075, label: 'NFL draft picks' },
  fr: { crit: 'nflDraft', w: 0.075, label: 'first-round picks' },
};
const TF_KEYS = Object.keys(TREND_FEATURES);

function computeTrend(rows, D) {
  const feat = Object.fromEntries(TF_KEYS.map((k) => [k, []]));
  const recentFeat = Object.fromEntries(TF_KEYS.map((k) => [k, []]));
  const meta = [];

  for (const r of rows) {
    const ap = D.apSummary.teams[r.school] || D.apSummary.teams[revAlias(r.school)] || {};
    const rec = D.records.get(r.school) || { perSeason: {} };
    const dr = D.draft.get(r.school) || { perSeason: {}, firstBySeason: {} };
    const tYears = D.titleYears.get(r.school) || [];
    const aaYears = D.aa.get(r.school)?.perYear || {};
    const seasons = Object.keys(rec.perSeason).map(Number).sort((a, b) => a - b);
    const N = seasons.length || 1;
    const recentN = Math.max(3, Math.ceil(TREND_RECENT_FRAC * N));
    const recentYears = seasons.slice(-recentN);
    const priorYears = seasons.slice(0, -recentN);

    const rate = (obj, years) => {
      let s = 0;
      for (const y of years) s += Number(obj[y] || 0);
      return years.length ? s / years.length : 0;
    };
    const wpr = (years) => {
      let w = 0; let g = 0;
      for (const y of years) {
        const s = rec.perSeason[y];
        if (!s) continue;
        w += s.w + 0.5 * s.t; g += s.w + s.l + s.t;
      }
      return g ? w / g : 0;
    };
    const winsRate = (years) => rate(Object.fromEntries(years.map((y) => [y, rec.perSeason[y]?.w || 0])), years);
    const titlesRate = (years) => {
      const set = new Set(years);
      return years.length ? tYears.filter((y) => set.has(y)).length / years.length : 0;
    };
    const aaRate = (years) => rate(Object.fromEntries(Object.entries(aaYears).map(([y, v]) => [y, v.c + v.u])), years);

    const F = (years) => ({
      apW: rate(ap.perSeason || {}, years),
      apT: rate(ap.perSeasonTop10 || {}, years),
      win: wpr(years),
      wins: winsRate(years),
      title: titlesRate(years),
      aa: aaRate(years),
      draft: rate(dr.perSeason || {}, years),
      fr: rate(dr.firstBySeason || {}, years),
    });
    const prior = F(priorYears);
    const recent = F(recentYears);
    for (const k of TF_KEYS) { feat[k].push(prior[k]); recentFeat[k].push(recent[k]); }

    meta.push({
      recentN,
      totalN: N,
      recentRange: recentYears.length ? `${recentYears[0]}–${recentYears.at(-1)}` : '',
      fullRange: seasons.length ? `${seasons[0]}–${seasons.at(-1)}` : '',
      recentWp: recent.win,
      histWp: prior.win,
      hasTitleRecent: tYears.some((y) => recentYears.includes(y)),
    });
  }

  const histPct = Object.fromEntries(TF_KEYS.map((k) => [k, pctOf(feat[k])]));
  const recPct = Object.fromEntries(TF_KEYS.map((k) => [k, pctOf(recentFeat[k])]));
  const shifts = rows.map((_, i) => TF_KEYS.reduce((s, k) => s + TREND_FEATURES[k].w * (recPct[k][i] - histPct[k][i]), 0));
  const zShift = zfun(shifts);

  return rows.map((_, i) => {
    const m = meta[i];
    const score = zShift(shifts[i]);
    const recentStanding = (recPct.apW[i] + recPct.win[i] + recPct.wins[i]) / 3;
    const priorStanding = (histPct.apW[i] + histPct.win[i] + histPct.wins[i]) / 3;
    const material = Math.abs(m.recentWp - m.histWp) >= 0.03 || recentFeat.apW[i] >= 1 || m.hasTitleRecent;
    let dir = 'even';
    if (material && score >= 1.1 && recentStanding >= 0.5) dir = 'up';
    else if (m.hasTitleRecent && score >= 0.55 && recentStanding >= 0.7) dir = 'up';
    else if (material && score <= -1.1 && priorStanding >= 0.55) dir = 'down';

    // biggest movers: features whose cross-program percentile shifted most, de-duped to criteria
    const perCrit = {};
    for (const k of TF_KEYS) {
      const d = recPct[k][i] - histPct[k][i];
      const c = TREND_FEATURES[k].crit;
      if (!perCrit[c] || Math.abs(d) > Math.abs(perCrit[c].d)) perCrit[c] = { d, label: CRIT_LABEL[c] };
    }
    const movers = Object.values(perCrit)
      .filter((x) => Math.abs(x.d) >= 0.06)
      .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
      .slice(0, 3)
      .map((x) => ({ label: x.label, dir: x.d > 0 ? 'up' : 'down' }));

    return {
      dir,
      score: Number(score.toFixed(3)),
      recentStanding: Number(recentStanding.toFixed(2)),
      priorStanding: Number(priorStanding.toFixed(2)),
      recentSeasons: m.recentN,
      totalSeasons: m.totalN,
      recentRange: m.recentRange,
      fullRange: m.fullRange,
      movers,
    };
  });
}

/* ---- derive percentiles, criterion scores, rating, rank ---- */
function derive(rows) {
  const sorted = {};
  const pct = {};
  const z = {};
  for (const k of STAT_KEYS) {
    const xs = rows.map((r) => r.raw[k]);
    sorted[k] = [...xs].sort((a, b) => a - b);
    pct[k] = pctFn(sorted[k]);
    z[k] = zfun(xs);
  }
  const teams = rows.map((r) => {
    const pt = {};
    const zt = {};
    for (const k of STAT_KEYS) {
      pt[k] = pct[k](r.raw[k]) * 100;
      zt[k] = z[k](r.raw[k]);
    }
    const critScore = {};
    const composite = {};
    for (const [c, [a, b]] of Object.entries(CRITERIA)) {
      critScore[c] = (pt[a] + pt[b]) / 2;
      composite[c] = (zt[a] + zt[b]) / 2;
    }
    const rating = trimmean(STAT_KEYS.map((k) => pt[k]), 0.2);
    // the two stat percentiles trimmed away for this program (1 low + 1 high at prop 0.2)
    let trimmedLow = STAT_KEYS[0];
    let trimmedHigh = STAT_KEYS[0];
    for (const k of STAT_KEYS) {
      if (pt[k] < pt[trimmedLow]) trimmedLow = k;
      if (pt[k] > pt[trimmedHigh]) trimmedHigh = k;
    }
    return { ...r, pct: pt, z: zt, critScore, composite, rating, trimmedLow, trimmedHigh };
  });
  const zRating = zfun(teams.map((t) => t.rating));
  teams.forEach((t) => (t.overall = zRating(t.rating)));
  [...teams].sort((a, b) => b.rating - a.rating).forEach((t, i) => (t.ratingRank = i + 1));

  const composites = {};
  for (const c of CK) {
    const xs = teams.map((t) => t.composite[c]);
    const mu = mean(xs);
    composites[c] = { mean: mu, stddev: stddev(xs, mu), min: Math.min(...xs), max: Math.max(...xs) };
  }
  const ov = teams.map((t) => t.overall);
  const overall = { mean: 0, stddev: stddev(ov), min: Math.min(...ov), max: Math.max(...ov) };
  return { teams, composites, overall, sorted };
}

/* ---- groupings ----
 * Blue Bloods and the Fringe fall out of the natural rating gaps (tiers.mjs);
 * the lower boundaries are hand-anchored to a program because the argued-about
 * ones ("is Auburn a contender", "where do the Powers end") don't line up with
 * a clean gap. If an anchor program is missing, that boundary falls back to gap
 * detection. TIER_LAST_TEAM[i] = the last program in GROUPS[i]. */
const TIER_LAST_TEAM = {
  2: 'Auburn', // Blue Blood Contenders
  3: 'Minnesota', // National Powers
  4: 'North Carolina State', // National Brands
};
function applyGroupings(teams) {
  const desc = [...teams].sort((a, b) => a.ratingRank - b.ratingRank).map((t) => t.rating);
  const det = detectTiers(desc, { count: 6, minSize: 2, maxBoundaryRank: 60 });
  const boundaries = det.boundaries.slice();
  for (const [idx, school] of Object.entries(TIER_LAST_TEAM)) {
    const r = teams.find((t) => t.school === school)?.ratingRank;
    if (r != null) boundaries[Number(idx)] = r;
  }
  boundaries.sort((a, b) => a - b);
  const assign = (rank) => boundaries.reduce((t, b) => t + (rank > b ? 1 : 0), 0);
  const gaps = boundaries.map((b) => desc[b - 1] - desc[b]);
  for (const t of teams) t.grouping = GROUPS[assign(t.ratingRank)] || GROUPS.at(-1);
  const counts = GROUPS.map((g) => teams.filter((t) => t.grouping === g).length);
  return { boundaries, gaps, counts };
}

/* ---- trajectory note (exhaustive for up/down, none for even) ---- */
function trajectoryNote(t) {
  if (t.trend.dir === 'even') return '';
  const cum = mean([t.pct.allTimeWins, t.pct.weeksApPoll, t.pct.nflDraftPicks, t.pct.consensusAA]);
  const rate = mean([t.pct.winPct, t.pct.weeksApTop10, t.pct.firstRoundPicks]);
  const peak = Math.max(...CK.map((c) => t.critScore[c]));
  const downCrit = CK.filter((c) => t.composite[c] < 0).length;
  if (t.trend.dir === 'up') {
    if (t.ratingRank <= 20) return 'still climbing';
    if (rate - cum >= 18 && cum < 45) return 'needs the decades';
    if (t.trend.priorStanding >= 0.55) return 'back from the wilderness';
    return 'new money';
  }
  // down
  if (t.ratingRank <= 20) return 'off its peak';
  if (peak >= 90) return 'a former power';
  if (cum - rate >= 15) return 'trading on history';
  if (downCrit >= 4) return 'a long slide';
  return 'off its peak';
}

/* ---- peer comparison ---- */
function peerComparison(t, peers, groupName) {
  const within = /^The\b/.test(groupName) ? groupName : `the ${groupName}`;
  const bigGroup = peers.length > 10;
  const leadCut = bigGroup ? Math.ceil(peers.length * 0.2) : 2;
  const lagCut = bigGroup ? Math.floor(peers.length * 0.8) : peers.length - 2;
  const leads = [];
  const lags = [];
  for (const c of CK) {
    const ranked = [...peers].sort((a, b) => b.critScore[c] - a.critScore[c]);
    const pos = ranked.findIndex((x) => x.school === t.school) + 1;
    if (pos <= leadCut) leads.push(CRIT_LABEL[c]);
    else if (pos > lagCut) lags.push(CRIT_LABEL[c]);
  }
  const list = (a) => (a.length === 1 ? a[0] : `${a.slice(0, -1).join(', ')} and ${a.at(-1)}`);
  let summary;
  if (leads.length && lags.length) {
    summary = `Within ${within}, ${t.school} leads on ${list(leads)} and trails on ${list(lags)}.`;
  } else if (leads.length) {
    summary = `Within ${within}, ${t.school} leads on ${list(leads)}; it doesn't trail its peers in any criterion.`;
  } else if (lags.length) {
    summary = `Within ${within}, ${t.school} trails on ${list(lags)}; it doesn't lead its peers in any criterion.`;
  } else {
    summary = `Within ${within}, ${t.school} sits mid-pack on every criterion — no clear edge or gap against its peers.`;
  }
  return { leads, lags, summary };
}

/* ---- favourable projection: what it would take to reach the middle of the group
 *      this program is chasing (or, for Blue Bloods, the standard to hold) ---- */
const withGroup = (g) => (/^The\b/.test(g) ? g : `the ${g}`);
const STAT_GAP_PHRASE = {
  allTimeWins: (d) => `${Math.round(d)} more all-time wins`,
  winPct: (d) => `${(d * 100).toFixed(0)} percentage points of win rate`,
  nationalTitles: (d) => `${Math.max(1, Math.round(d))} more national title${Math.round(d) === 1 ? '' : 's'}`,
  conferenceTitles: (d) => `${Math.max(1, Math.round(d))} more conference titles`,
  consensusAA: (d) => `${Math.round(d)} more consensus All-Americans`,
  unanimousAA: (d) => `${Math.round(d)} more unanimous All-Americans`,
  nflDraftPicks: (d) => `${Math.round(d)} more NFL draft picks`,
  firstRoundPicks: (d) => `${Math.max(1, Math.round(d))} more first-round picks`,
  weeksApPoll: (d) => `${Math.round(d)} more weeks ranked`,
  weeksApTop10: (d) => `${Math.round(d)} more weeks in the AP top ten`,
};
const listOf = (a) => (a.length <= 1 ? (a[0] || '') : `${a.slice(0, -1).join(', ')} and ${a.at(-1)}`);

function projectionFor(t, medians, groupAvgSeasons, statSd, latestSeason) {
  const g = t.grouping;
  const target = TARGET_GROUP[g];
  const span = Math.max(1, latestSeason - 1900);

  let coda = '';
  if (t.trend.dir === 'up') {
    const rising = (t.trend.movers || []).filter((m) => m.dir === 'up').map((m) => m.label);
    coda = rising.length
      ? ` The recent trend already points that way — ${listOf(rising)} have all climbed — so sustained, that move is realistic within a decade or two.`
      : ' The recent trend already points that way, so sustained, that move is realistic within a decade or two.';
  } else if (t.trend.dir === 'down') {
    const falling = (t.trend.movers || []).filter((m) => m.dir === 'down').map((m) => m.label);
    coda = falling.length
      ? ` The recent trend runs the other way, though — holding ${withGroup(g)} comes first, and that means arresting the slide in ${listOf(falling)}.`
      : ` The recent trend runs the other way, though — the nearer task is simply holding ${withGroup(g)}.`;
  }

  if (g === 'Blue Bloods') {
    const bb = medians['Blue Bloods'] || {};
    const parts = [`about ${(bb.allTimeWins / span).toFixed(1)} wins a year`];
    if (bb.nationalTitles) parts.push(`a national title roughly every ${Math.round(span / bb.nationalTitles)} seasons`);
    if (bb.consensusAA) parts.push(`around ${Math.round((bb.consensusAA / (latestSeason - 1924)) * 10)} consensus All-Americans a decade`);
    if (t.heismans) parts.push(`a Heisman-calibre season every generation`);
    return `The bar here isn't a target, it's a standard to keep clearing: ${listOf(parts)}. Fall under it for a decade and the group starts to look overstated.${coda}`;
  }

  const tgt = medians[target] || {};
  // conference titles are era/conference-driven noise and have no per-season trend — leave them out of the "what it takes" list
  const skip = new Set(['conferenceTitles']);
  const deficits = STAT_KEYS
    .filter((k) => !skip.has(k))
    .map((k) => ({ k, d: (tgt[k] ?? 0) - t.raw[k], norm: statSd[k] ? ((tgt[k] ?? 0) - t.raw[k]) / statSd[k] : 0 }))
    .filter((x) => x.d > 0 && x.norm > 0.15)
    .sort((a, b) => b.norm - a.norm)
    .slice(0, 3);
  const targetLabel = target === 'Blue Bloods' && g !== 'Blue Blood Contenders' ? 'the top six' : `the ${target}`;

  if (!deficits.length) {
    return `${t.school} already sits at or above the ${target} median on the counting stats — from here the case is a sustained run at that level, not a rebuild.${coda}`;
  }
  const gap = listOf(deficits.map((x) => STAT_GAP_PHRASE[x.k](x.d)));

  if (g === 'National Brands') {
    return `Reaching ${targetLabel} means closing ${gap}, measured against the ${target} median. In the ${t.conference} that runs straight through the National Powers on the schedule — the tier that has capped ${t.school}; beating them more often than not is the route.${coda}`;
  }
  if (g === 'The Field') {
    return `The near-term climb is sustained winning and a conference title or two. Squarely into ${targetLabel} is a longer project — the counting-stat gap to the ${target} median runs to ${gap}.${coda}`;
  }
  const verb = g === 'Blue Blood Fringe'
    ? 'Getting back into the middle of the Blue Blood pack'
    : g === 'Blue Blood Contenders'
      ? 'Breaking into the top six'
      : `Moving up to ${targetLabel}`;
  return `${verb} means closing ${gap}, measured against the ${target} median.${coda}`;
}

/* ---- assemble one full variant ---- */
function computeVariant(D, mode, trend) {
  const { rows, granularAA } = buildRows(D, mode);
  const d = derive(rows);
  const teams = d.teams;
  for (let i = 0; i < teams.length; i += 1) teams[i].trend = trend[i];
  const groupInfo = applyGroupings(teams);
  // manual grouping overrides win over the gap-detected tier
  for (const t of teams) {
    const o = D.overrides.grouping.get(t.school);
    if (o?.grouping && GROUPS.includes(o.grouping)) t.grouping = o.grouping;
  }
  const byGroup = Object.fromEntries(GROUPS.map((g) => [g, teams.filter((t) => t.grouping === g)]));

  const medians = {};
  const groupAvgSeasons = {};
  for (const g of GROUPS) {
    medians[g] = Object.fromEntries(STAT_KEYS.map((k) => [k, median(byGroup[g].map((x) => x.raw[k]))]));
    groupAvgSeasons[g] = median(byGroup[g].map((x) => x.trend.totalSeasons || 0));
  }
  const statSd = Object.fromEntries(STAT_KEYS.map((k) => [k, stddev(rows.map((r) => r.raw[k]))]));

  for (const t of teams) {
    // a small tier borrows the tiers directly above and below so the read is
    // against "teams near it", not only teams above it
    const trO = D.overrides.trend.get(t.school);
    t.note = trO && trO.note !== '' && trO.note != null ? trO.note.trim() : trajectoryNote(t);
    let peers = byGroup[t.grouping];
    const gi = GROUPS.indexOf(t.grouping);
    if (peers.length < 6) {
      peers = [
        ...(gi > 0 ? byGroup[GROUPS[gi - 1]] : []),
        ...peers,
        ...(gi < GROUPS.length - 1 ? byGroup[GROUPS[gi + 1]] : []),
      ];
    }
    t.peer = peerComparison(t, peers, t.grouping);
    t.comparison = D.overrides.comparison.get(t.school)?.text || t.peer.summary;
    t.projection = D.overrides.projection.get(t.school)?.text
      || projectionFor(t, medians, groupAvgSeasons, statSd, D.apSummary.toYear);
  }
  const counts = GROUPS.map((g) => byGroup[g].length);
  return { teams, ...d, groupInfo: { ...groupInfo, counts }, granularAA };
}

function readPrevious() {
  if (!fs.existsSync(SNAP)) return null;
  const files = fs.readdirSync(SNAP).filter((f) => /^data-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  const today = `data-${new Date().toISOString().slice(0, 10)}.json`;
  const prev = files.filter((f) => f !== today).pop();
  if (!prev) return null;
  try {
    const p = JSON.parse(fs.readFileSync(path.join(SNAP, prev), 'utf8'));
    const t0 = p.teams?.[0];
    const get = (t) => t.variants?.asPlayed ?? t;
    if (get(t0)?.rating == null) return null;
    return Object.fromEntries(p.teams.map((t) => [t.school, { ratingRank: get(t).ratingRank, rating: get(t).rating }]));
  } catch {
    return null;
  }
}

function main() {
  const D = load();
  const trend = computeTrend(buildRows(D, 'asPlayed').rows, D);
  // manual direction overrides (data/manual/trend_overrides.csv) — note override applied per variant
  D.teams.forEach((tm, i) => {
    const o = D.overrides.trend.get(tm.school);
    if (o?.dir && ['up', 'down', 'even'].includes(o.dir)) trend[i].dir = o.dir;
  });

  const asPlayed = computeVariant(D, 'asPlayed', trend);
  const official = computeVariant(D, 'official', trend);

  // per-team payload: shared fields top-level, wins-dependent fields per variant
  const officialBy = new Map(official.teams.map((t) => [t.school, t]));
  const teams = asPlayed.teams.map((a) => {
    const o = officialBy.get(a.school);
    const variantFields = (t) => ({
      stats: t.raw,
      pct: t.pct,
      critScore: t.critScore,
      composite: t.composite,
      rating: t.rating,
      overall: t.overall,
      ratingRank: t.ratingRank,
      grouping: t.grouping,
      peer: t.peer,
      comparison: t.comparison,
      projection: t.projection,
      note: t.note,
      trimmedLow: t.trimmedLow,
      trimmedHigh: t.trimmedHigh,
    });
    return {
      school: a.school,
      slug: a.slug,
      conference: a.conference,
      primary: a.primary,
      secondary: a.secondary,
      formerFcs: a.formerFcs,
      heismans: a.heismans,
      trend: a.trend,
      label: {
        standard: `${a.grouping} · ${{ up: 'Ascending', down: 'Receding', even: 'Holding' }[a.trend.dir]}${a.note ? ` · ${a.note}` : ''}`,
        personal: D.blurbs.get(a.school) || '',
      },
      // default view is asPlayed — mirror onto the top level so components read team.rating directly
      ...variantFields(a),
      variants: { asPlayed: variantFields(a), official: variantFields(o) },
    };
  });

  const previous = readPrevious();
  const champ = D.apSummary.finalNo1?.[String(D.apSummary.toYear)];

  const meta = {
    generatedAt: new Date().toISOString(),
    model: 'percentile-trimmed-mean',
    modelBlurb: 'Rank each of the ten stats within FBS, drop each program’s single best and single worst percentile, average the other eight.',
    trendRecentFraction: TREND_RECENT_FRAC,
    latestSeason: D.apSummary.toYear,
    latestChampion: champ ? alias(champ) : null,
    conferenceYear: fs.existsSync(path.join(API, 'conferences.json')) ? readJson(path.join(API, 'conferences.json')).year : null,
    titleSelectors: [...TITLE_SELECTORS],
    sources: { store: 'data/api + data/season-records.csv + data/manual', network: false },
    provenance: PROVENANCE,
    granular: {
      allAmericans: `NCAA record-book per-player list for ${asPlayed.granularAA.consensus}/${asPlayed.granularAA.consensus + asPlayed.granularAA.summaryC} programs; the rest (no consensus selections) use a summary count.`,
      nationalTitles: 'granular (data/manual/national_titles.csv, one row per selector)',
      conferenceTitles: 'granular where filed, else summary',
    },
    dataRange: `AP poll ${AP_FROM}–${D.apSummary.toYear}; all-time records via CFBD + hand-entered pre-1936; titles & honors hand-curated`,
    groupings: GROUPS,
    tierBoundaries: asPlayed.groupInfo.boundaries,
    tierGaps: asPlayed.groupInfo.gaps,
    stats: Object.fromEntries(STAT_KEYS.map((k) => {
      const xs = asPlayed.teams.map((t) => t.raw[k]);
      const mu = mean(xs);
      return [k, { mean: mu, stddev: stddev(xs, mu), min: Math.min(...xs), max: Math.max(...xs) }];
    })),
    composites: asPlayed.composites,
    overall: asPlayed.overall,
    previous: previous || undefined,
  };

  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.mkdirSync(SNAP, { recursive: true });
  const payload = { meta, teams };
  fs.writeFileSync(path.join(PUBLIC, 'teams.json'), JSON.stringify(payload));
  fs.writeFileSync(path.join(PUBLIC, 'meta.json'), JSON.stringify(meta, null, 2));
  fs.writeFileSync(path.join(SNAP, `data-${new Date().toISOString().slice(0, 10)}.json`), JSON.stringify(payload));

  // human-readable dump of every derived string — review here, override in data/manual/*_overrides.csv
  const dirWord = { up: 'Ascending', down: 'Receding', even: 'Holding' };
  fs.writeFileSync(
    path.join(PUBLIC, 'breakdown.csv'),
    writeRecords(
      ['school', 'rating', 'ratingRank', 'grouping', 'trend', 'note', 'comparison', 'projection', 'tagline'],
      [...teams]
        .sort((a, b) => a.ratingRank - b.ratingRank)
        .map((t) => ({
          school: t.school,
          rating: t.rating.toFixed(1),
          ratingRank: t.ratingRank,
          grouping: t.grouping,
          trend: dirWord[t.trend.dir],
          note: t.note,
          comparison: t.comparison,
          projection: t.projection,
          tagline: t.label.personal,
        })),
    ),
  );

  /* ---- build log ---- */
  const gi = asPlayed.groupInfo;
  console.log(`\n✓ ${teams.length} teams → public/data/teams.json  (model: ${meta.model}, no network)`);
  console.log(`  tier boundaries after ranks: ${gi.boundaries.map((b, i) => `#${b} (gap ${gi.gaps[i].toFixed(1)})`).join(' | ')}`);
  console.log(`  grouping counts: ${GROUPS.map((g, i) => `${g} ${gi.counts[i]}`).join(' · ')}`);
  console.log(`  ${AP_FROM} AP champion → latest: ${meta.latestChampion}`);
  console.log('  Blue Blood Rating — top 12 (as-played):');
  for (const t of [...asPlayed.teams].sort((a, b) => a.ratingRank - b.ratingRank).slice(0, 12)) {
    console.log(`   ${String(t.ratingRank).padStart(2)}. ${t.school.padEnd(15)} ${t.rating.toFixed(1).padStart(5)}  ${t.trend.dir.padEnd(5)} ${t.grouping.padEnd(20)} ${t.note}`);
  }
  const dirs = asPlayed.teams.reduce((m, t) => ((m[t.trend.dir] = (m[t.trend.dir] || 0) + 1), m), {});
  console.log('  trend split:', dirs);
  // national-title reconciliation vs old summary
  const deltas = asPlayed.teams
    .map((t) => ({ s: t.school, now: t.raw.nationalTitles, was: Number(D.summary.get(t.school)?.national_titles || 0) }))
    .filter((x) => x.now !== x.was)
    .sort((a, b) => Math.abs(b.now - b.was) - Math.abs(a.now - a.was))
    .slice(0, 12);
  if (deltas.length) console.log('  national-title count changes vs old summary:', deltas.map((d) => `${d.s} ${d.was}→${d.now}`).join(', '));
  console.log(`  all-Americans: ${meta.granular.allAmericans}`);
}

main();
