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
import { readRecords } from './lib/csv.mjs';
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
  perception: 'AP Poll', wins: 'Wins', championships: 'Championships',
  allAmericans: 'All-Americans', nflDraft: 'NFL Draft',
};

const GROUPS = ['Blue Bloods', 'Blue Blood Fringe', 'Blue Blood Adjacent', 'National Powers', 'National Brands', 'The Field'];

const PROVENANCE = {
  perception: 'Every weekly AP poll ballot, 1936–present (CollegeFootballData → data/api/ap-poll.json).',
  wins: 'Wins/losses/ties per season (CollegeFootballData 1936+; one hand-entered "through 1935" row per program → data/season-records.csv).',
  championships: 'National-title list, one row per (school, year, selector); AP/UPI/FWAA/NFF/USA + CFRA/HAF/NCF count, "claim"/"not-claimed" do not (data/manual/national_titles.csv).',
  allAmericans: 'Consensus All-Americans per season 1924–present (data/manual/all_americans.csv); unanimous count from summary (data/manual/stats_summary.csv).',
  nflDraft: 'Every NFL draft pick by school, 1936–present (CollegeFootballData → data/api/draft.json).',
};

/* ---- helpers ---- */
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
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
  const aa = new Map(); // school -> { total:{c,u}, perYear:{yr:{c,u}} }
  for (const r of csv('all_americans.csv')) {
    if (!r.school) continue;
    const e = aa.get(r.school) || { c: 0, u: 0, perYear: {} };
    const c = Number(r.consensus || 0);
    const u = Number(r.unanimous || 0);
    e.c += c;
    e.u += u;
    e.perYear[r.year] = { c, u };
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

  // season records -> per team totals + per-season
  const sr = readRecords(fs.readFileSync(path.join(REPO, 'data/season-records.csv'), 'utf8'));
  const records = new Map();
  for (const r of sr) {
    const e = records.get(r.school) || { wins: 0, games: 0, perSeason: {} };
    const w = Number(r.wins || 0);
    const g = w + Number(r.losses || 0) + Number(r.ties || 0);
    e.wins += w;
    e.games += g;
    if (Number(r.season) >= AP_FROM) e.perSeason[r.season] = { wins: w, games: g };
    records.set(r.school, e);
  }

  // draft -> per team totals + per-season picks
  const draft = new Map();
  for (const p of draftRows) {
    const s = alias(p.school);
    const e = draft.get(s) || { picks: 0, firstRound: 0, perSeason: {} };
    e.picks += 1;
    if (p.round === 1) e.firstRound += 1;
    e.perSeason[p.year] = (e.perSeason[p.year] || 0) + 1;
    draft.set(s, e);
  }

  return { teams, summary, blurbs, titles, confTitles, aa, heisman, vacated, apSummary, draftRows, conferences, records, draft };
}

/** raw stat line per team for a given wins mode ('asPlayed' | 'official') */
function buildRows(D, mode) {
  const granularAA = { consensus: 0, summaryC: 0 };
  const rows = D.teams.map((t) => {
    const ap = D.apSummary.teams[t.school] || D.apSummary.teams[revAlias(t.school)] || {};
    const rec = D.records.get(t.school) || { wins: 0, games: 0, perSeason: {} };
    const dr = D.draft.get(t.school) || { picks: 0, firstRound: 0, perSeason: {} };
    const sum = D.summary.get(t.school) || {};

    let wins = rec.wins;
    let games = rec.games;
    if (mode === 'official' && D.vacated.has(t.school)) {
      const v = D.vacated.get(t.school);
      wins -= v.w;
      games -= v.w + v.l;
    }

    // consensus AA from the per-season list where a program has one; unanimous is
    // always the summary count (the per-season list doesn't flag unanimous picks).
    const aaRec = D.aa.get(t.school);
    let consensusAA;
    const unanimousAA = Number(sum.unanimous_aa || 0);
    if (aaRec && Object.keys(aaRec.perYear).length) {
      consensusAA = aaRec.c;
      granularAA.consensus += 1;
    } else {
      consensusAA = Number(sum.consensus_aa || 0);
      granularAA.summaryC += 1;
    }

    const confT = D.confTitles.has(t.school) ? D.confTitles.get(t.school) : Number(sum.conference_titles || 0);

    return {
      school: t.school,
      slug: t.slug,
      primary: t.primary_hex,
      secondary: t.secondary_hex,
      formerFcs: String(t.former_fcs) === '1',
      conference: CONF_DISPLAY[D.conferences[t.school]] || D.conferences[t.school] || t.conference || 'Independent',
      heismans: D.heisman.get(t.school) || 0,
      raw: {
        allTimeWins: wins,
        winPct: games ? wins / games : 0,
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

/* ---- trajectory: last 20% of a program's seasons vs. its whole history ---- */
function computeTrend(rows, D) {
  const finalNo1 = D.apSummary.finalNo1 || {};
  const titleYears = {};
  for (const [y, s] of Object.entries(finalNo1)) (titleYears[alias(s)] = titleYears[alias(s)] || []).push(Number(y));

  const feat = { apW: [], apT: [], win: [], title: [], draft: [] };
  const recentFeat = { apW: [], apT: [], win: [], title: [], draft: [] };
  const meta = [];
  for (const r of rows) {
    const ap = D.apSummary.teams[r.school] || D.apSummary.teams[revAlias(r.school)] || {};
    const rec = D.records.get(r.school) || { perSeason: {} };
    const dr = D.draft.get(r.school) || { perSeason: {} };
    const seasons = Object.keys(rec.perSeason).map(Number).sort((a, b) => a - b);
    const N = seasons.length || 1;
    const recentN = Math.max(3, Math.ceil(TREND_RECENT_FRAC * N));
    const recentYears = seasons.slice(-recentN);
    const priorYears = seasons.slice(0, -recentN); // the program's history BEFORE its recent era

    const rate = (obj, years) => {
      let s = 0;
      for (const y of years) s += obj[y] || 0;
      return years.length ? s / years.length : 0;
    };
    const wp = (years) => {
      let w = 0;
      let g = 0;
      for (const y of years) {
        w += rec.perSeason[y]?.wins || 0;
        g += rec.perSeason[y]?.games || 0;
      }
      return g ? w / g : 0;
    };
    const set = new Set(recentYears);
    const priorSet = new Set(priorYears);
    const titlesIn = (yrSet) => (titleYears[r.school] || []).filter((y) => yrSet.has(y)).length;

    // "hist" here = the prior era (everything before the recent window)
    feat.apW.push(rate(ap.perSeason || {}, priorYears));
    feat.apT.push(rate(ap.perSeasonTop10 || {}, priorYears));
    feat.win.push(wp(priorYears));
    feat.title.push(priorYears.length ? titlesIn(priorSet) / priorYears.length : 0);
    feat.draft.push(rate(dr.perSeason || {}, priorYears));
    recentFeat.apW.push(rate(ap.perSeason || {}, recentYears));
    recentFeat.apT.push(rate(ap.perSeasonTop10 || {}, recentYears));
    recentFeat.win.push(wp(recentYears));
    recentFeat.title.push(titlesIn(set) / recentN);
    recentFeat.draft.push(rate(dr.perSeason || {}, recentYears));
    meta.push({
      recentWp: wp(recentYears),
      histWp: wp(priorYears),
      hasTitleRecent: (titleYears[r.school] || []).some((y) => set.has(y)),
    });
  }

  const histPct = Object.fromEntries(Object.keys(feat).map((k) => [k, pctOf(feat[k])]));
  const recPct = Object.fromEntries(Object.keys(recentFeat).map((k) => [k, pctOf(recentFeat[k])]));
  const W = { apW: 0.32, apT: 0.24, win: 0.18, title: 0.16, draft: 0.1 };
  const shifts = rows.map((_, i) => Object.keys(W).reduce((s, k) => s + W[k] * (recPct[k][i] - histPct[k][i]), 0));
  const zShift = zfun(shifts);

  return rows.map((_, i) => {
    const m = meta[i];
    const score = zShift(shifts[i]);
    const recentStanding = (recPct.apW[i] + recPct.win[i]) / 2;
    const priorStanding = (histPct.apW[i] + histPct.win[i]) / 2;
    const material = Math.abs(m.recentWp - m.histWp) >= 0.03 || recentFeat.apW[i] >= 1 || m.hasTitleRecent;
    let dir = 'even';
    if (material && score >= 1.1 && recentStanding >= 0.5) dir = 'up';
    else if (m.hasTitleRecent && score >= 0.55 && recentStanding >= 0.7) dir = 'up';
    else if (material && score <= -1.1 && priorStanding >= 0.55) dir = 'down';
    return {
      dir,
      score: Number(score.toFixed(3)),
      recentStanding: Number(recentStanding.toFixed(2)),
      priorStanding: Number(priorStanding.toFixed(2)),
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
    return { ...r, pct: pt, z: zt, critScore, composite, rating };
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

/* ---- groupings from natural gaps ---- */
function applyGroupings(teams) {
  const desc = [...teams].sort((a, b) => a.ratingRank - b.ratingRank).map((t) => t.rating);
  const { boundaries, gaps, assign } = detectTiers(desc, { count: 6, minSize: 2, maxBoundaryRank: 60 });
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

/* ---- assemble one full variant ---- */
function computeVariant(D, mode, trend) {
  const { rows, granularAA } = buildRows(D, mode);
  const d = derive(rows);
  const teams = d.teams;
  for (let i = 0; i < teams.length; i += 1) teams[i].trend = trend[i];
  const groupInfo = applyGroupings(teams);
  const byGroup = Object.fromEntries(GROUPS.map((g) => [g, teams.filter((t) => t.grouping === g)]));
  for (const t of teams) {
    t.note = trajectoryNote(t);
    // a small tier borrows the tiers directly above and below so the read is
    // against "teams near it", not only teams above it
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
  }
  return { teams, ...d, groupInfo, granularAA };
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
      note: t.note,
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
      allAmericans: `${asPlayed.granularAA.consensus}/${asPlayed.granularAA.consensus + asPlayed.granularAA.summaryC} programs have per-season rows; the rest use a summary count.`,
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
