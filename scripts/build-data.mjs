/**
 * Builds public/data/teams.json (+ meta.json + a dated snapshot).
 *
 * Overall model — "percentile-trimmed-mean":
 *   each of the 10 raw stats -> its within-FBS percentile; drop each program's
 *   single highest and single lowest percentile; the Blue Blood Rating is the
 *   mean of the remaining 8. Nonparametric, no weighting knobs, unbothered by the
 *   skew / disputed counts in the honors data.
 *
 * Data provenance (see PROVENANCE below):
 *   CFBD API  — AP-poll weeks (1936+), all-time records/wins (1900+), NFL draft
 *               counts (1936+), current conference, per-season history for trend.
 *   manual    — national & conference titles, consensus & unanimous All-Americans
 *               (data/manual/stats_manual.csv; not adjudicating claims).
 *
 * Run: npm run build:data
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords } from './lib/csv.mjs';
import {
  hasKey, CURRENT_SEASON, LATEST_SEASON, CURRENT_YEAR,
  getApBySeason, getRecordsBySeason, getDraftBySeason, getConferences,
} from './fetch-cfbd.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const MANUAL = path.join(REPO, 'data/manual');
const PUBLIC = path.join(REPO, 'public/data');
const SNAP = path.join(REPO, 'data/snapshots');

const AP_FROM = 1936;
const RECORDS_FROM = 1900;
const DRAFT_FROM = 1936;
const CONF_YEAR = 2026; // current alignment
const TREND_RECENT = 18; // "recent era" (~2 coaching generations) vs. everything before it

/* ---- stat + criterion definitions (keep in sync with src/config/stats.ts) ---- */
const STAT_COLS = {
  allTimeWins: 'all_time_wins',
  winPct: 'win_pct',
  nationalTitles: 'national_titles',
  conferenceTitles: 'conference_titles',
  consensusAA: 'consensus_aa',
  unanimousAA: 'unanimous_aa',
  nflDraftPicks: 'nfl_draft_picks',
  firstRoundPicks: 'first_round_picks',
  weeksApPoll: 'weeks_ap_poll',
  weeksApTop10: 'weeks_ap_top10',
};
const STAT_KEYS = Object.keys(STAT_COLS);
const CRITERIA = {
  perception: ['weeksApPoll', 'weeksApTop10'],
  wins: ['allTimeWins', 'winPct'],
  championships: ['nationalTitles', 'conferenceTitles'],
  allAmericans: ['consensusAA', 'unanimousAA'],
  nflDraft: ['nflDraftPicks', 'firstRoundPicks'],
};
const CK = Object.keys(CRITERIA);
const DEBATED = ['Nebraska', 'Texas'];

const PROVENANCE = {
  perception: 'AP poll ballots, weekly, 1936–present (CollegeFootballData).',
  wins: 'Season-by-season W-L records, 1900–present (CollegeFootballData).',
  championships:
    'National titles and conference titles — hand-maintained (data/manual/stats_manual.csv); claimed vs. consensus counts are not adjudicated.',
  allAmericans: 'Consensus & unanimous All-America selections — hand-maintained (data/manual/stats_manual.csv).',
  nflDraft: 'NFL draft picks by school, 1936–present (CollegeFootballData).',
};

/* ---- stats helpers ---- */
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const stddev = (xs, mu = mean(xs)) =>
  xs.length ? Math.sqrt(xs.reduce((a, b) => a + (b - mu) ** 2, 0) / xs.length) : 0;
/** Excel-style TRIMMEAN: drop floor(n*prop/2) from each end, average the rest */
const trimmean = (arr, prop) => {
  const s = [...arr].sort((a, b) => a - b);
  const k = Math.floor((s.length * prop) / 2);
  return mean(s.slice(k, s.length - k));
};
function percentileFn(sortedAsc) {
  return (x) => {
    let lo = 0;
    let hi = sortedAsc.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sortedAsc[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    let hiEq = lo;
    while (hiEq < sortedAsc.length && sortedAsc[hiEq] === x) hiEq += 1;
    return (lo + hiEq) / 2 / sortedAsc.length;
  };
}
/** raw value at percentile p (0..1) within a sorted-ascending array, nearest-rank */
const valueAtPct = (sortedAsc, p) =>
  sortedAsc[Math.max(0, Math.min(sortedAsc.length - 1, Math.round(p * (sortedAsc.length - 1))))];
const zfun = (xs) => {
  const mu = mean(xs);
  const sd = stddev(xs, mu);
  return (x) => (sd === 0 ? 0 : (x - mu) / sd);
};

/* ---- CFBD school name -> our canonical school ---- */
const CFBD_ALIAS = {
  'NC State': 'North Carolina State',
  'App State': 'Appalachian State',
  UMass: 'UMass',
  Massachusetts: 'UMass',
  Connecticut: 'UConn',
  'Louisiana Monroe': 'Louisiana-Monroe',
  'UL Monroe': 'Louisiana-Monroe',
  'Southern Mississippi': 'Southern Miss',
  Miami: 'Miami (FL)',
  "Hawai'i": 'Hawaii',
  'San José State': 'San Jose State',
  'Sam Houston': 'Sam Houston State',
  'Florida International': 'FIU',
};
const CONF_DISPLAY = {
  'American Athletic': 'American',
  'Mid-American': 'MAC',
  'Conference USA': 'C-USA',
  'FBS Independents': 'Independent',
};

function loadManual() {
  const teams = readRecords(fs.readFileSync(path.join(MANUAL, 'teams.csv'), 'utf8'));
  const stats = readRecords(fs.readFileSync(path.join(MANUAL, 'stats_manual.csv'), 'utf8'));
  const statBySchool = new Map(stats.map((s) => [s.school, s]));
  const blurbs = new Map();
  const blurbFile = path.join(MANUAL, 'blurbs.csv');
  if (fs.existsSync(blurbFile)) {
    for (const b of readRecords(fs.readFileSync(blurbFile, 'utf8'))) {
      if (b.school && b.personal_label) blurbs.set(b.school, b.personal_label);
    }
  }
  const rows = teams.map((t) => {
    const s = statBySchool.get(t.school) || {};
    const raw = {};
    for (const [key, col] of Object.entries(STAT_COLS)) raw[key] = Number(s[col] || 0);
    return {
      school: t.school,
      slug: t.slug,
      conference: t.conference,
      primary: t.primary_hex,
      secondary: t.secondary_hex,
      formerFcs: String(t.former_fcs) === '1',
      raw,
      trend: null,
    };
  });
  return { rows, blurbs };
}

/** overlay CFBD figures for a cutoff season onto rows[].raw */
function applyCfbd(rows, cfbd, cutoffSeason) {
  if (!cfbd) return { apHit: 0, recHit: 0, drHit: 0 };
  const bySchool = new Map(rows.map((r) => [r.school, r]));
  const resolve = (name) => bySchool.get(CFBD_ALIAS[name] || name) || null;
  let apHit = 0;
  let recHit = 0;
  let drHit = 0;

  for (const [name, v] of cfbd.ap) {
    if (name === 'finalNo1') continue;
    const row = resolve(name);
    if (!row) continue;
    let weeksPoll = 0;
    let weeksTop10 = 0;
    for (const [y, w] of Object.entries(v.perSeason)) if (Number(y) <= cutoffSeason) weeksPoll += w;
    for (const [y, w] of Object.entries(v.perSeasonTop10 || {})) if (Number(y) <= cutoffSeason) weeksTop10 += w;
    row.raw.weeksApPoll = weeksPoll;
    row.raw.weeksApTop10 = weeksTop10;
    apHit += 1;
  }
  for (const [name, v] of cfbd.records) {
    const row = resolve(name);
    if (!row) continue;
    let wins = 0;
    let games = 0;
    for (const [y, r] of Object.entries(v.perSeason)) {
      if (Number(y) <= cutoffSeason) {
        wins += r.wins;
        games += r.games;
      }
    }
    if (games > 0) {
      row.raw.allTimeWins = wins;
      row.raw.winPct = wins / games;
      recHit += 1;
    }
  }
  const draftCutoff = cutoffSeason + 1; // draft happens the spring after the season
  for (const [name, v] of cfbd.draftByYear) {
    const row = resolve(name);
    if (!row) continue;
    let picks = 0;
    let firstRound = 0;
    for (const [y, d] of Object.entries(v)) {
      if (Number(y) <= draftCutoff) {
        picks += d.picks;
        firstRound += d.firstRound;
      }
    }
    row.raw.nflDraftPicks = picks;
    row.raw.firstRoundPicks = firstRound;
    drHit += 1;
  }
  return { apHit, recHit, drHit };
}

/**
 * Trajectory: compare where a program sits among all 130 today (its recent era,
 * last TREND_RECENT seasons) with where it sits across its ENTIRE history, on
 * five stats — AP weeks, AP top-10 weeks, win %, AP national titles (final-poll
 * #1), and NFL draft picks. Working in cross-program percentile *position* (not
 * raw rate) cancels the era inflation, so "always elite" reads as `even` and only
 * a real change of station reads as `up` / `down`. Sparse by construction.
 */
function computeTrend(rows, cfbd) {
  if (!cfbd) {
    for (const r of rows) r.trend = { score: 0, dir: 'even' };
    return;
  }
  const rEnd = LATEST_SEASON;
  const rStart = LATEST_SEASON - TREND_RECENT + 1;
  const titlesByTeam = {};
  for (const [year, school] of Object.entries(cfbd.ap.finalNo1 || {})) {
    const s = CFBD_ALIAS[school] || school;
    (titlesByTeam[s] = titlesByTeam[s] || []).push(Number(year));
  }

  const sumRange = (obj, a, b, pick = (v) => v || 0) => {
    let s = 0;
    for (let y = a; y <= b; y += 1) s += pick(obj[y]);
    return s;
  };
  const sumAll = (obj, pick = (v) => v || 0) => Object.values(obj).reduce((s, v) => s + pick(v), 0);

  // gather recent-window and career values per stat
  const recent = { apW: [], apT: [], win: [], title: [], draft: [] };
  const career = { apW: [], apT: [], win: [], title: [], draft: [] };
  const meta = [];
  for (const r of rows) {
    const ap = cfbd.ap.get(CFBD_ALIAS[r.school] || r.school) || cfbd.ap.get(r.school);
    const rec = cfbd.records.get(CFBD_ALIAS[r.school] || r.school) || cfbd.records.get(r.school);
    const draft = cfbd.draftByYear.get(CFBD_ALIAS[r.school] || r.school) || cfbd.draftByYear.get(r.school) || {};
    const apPS = ap?.perSeason || {};
    const apT10 = ap?.perSeasonTop10 || {};
    const recPS = rec?.perSeason || {};
    const firstRecord = Object.keys(recPS).length ? Math.min(...Object.keys(recPS).map(Number)) : rStart;
    const apSpan = Math.max(1, rEnd - Math.max(AP_FROM, firstRecord) + 1);
    const draftSpan = Math.max(1, rEnd - DRAFT_FROM + 1);
    const wp = (a, b) => {
      let w = 0;
      let g = 0;
      for (let y = a; y <= b; y += 1) {
        w += recPS[y]?.wins || 0;
        g += recPS[y]?.games || 0;
      }
      return g ? w / g : 0;
    };
    // career = the program's whole history BEFORE the recent window, so the
    // surge we're measuring doesn't dilute its own baseline
    const priorApSpan = Math.max(1, rStart - 1 - Math.max(AP_FROM, firstRecord) + 1);
    const priorDraftSpan = Math.max(1, rStart - 1 - DRAFT_FROM + 1);
    const beforeRecent = (obj, pick) => sumRange(obj, AP_FROM, rStart - 1, pick);
    const titles = titlesByTeam[r.school] || [];
    recent.apW.push(sumRange(apPS, rStart, rEnd) / TREND_RECENT);
    career.apW.push(beforeRecent(apPS) / priorApSpan);
    recent.apT.push(sumRange(apT10, rStart, rEnd) / TREND_RECENT);
    career.apT.push(beforeRecent(apT10) / priorApSpan);
    recent.win.push(wp(rStart, rEnd));
    career.win.push(wp(Math.max(RECORDS_FROM, firstRecord), rStart - 1));
    recent.title.push(titles.filter((y) => y >= rStart && y <= rEnd).length / TREND_RECENT);
    career.title.push(titles.filter((y) => y < rStart).length / priorApSpan);
    recent.draft.push(sumRange(draft, rStart, rEnd, (d) => d?.picks || 0) / TREND_RECENT);
    career.draft.push(sumRange(draft, DRAFT_FROM, rStart - 1, (d) => d?.picks || 0) / priorDraftSpan);
    meta.push({
      recentApW: recent.apW.at(-1),
      recentWp: recent.win.at(-1),
      careerWp: career.win.at(-1),
      hasTitleRecent: titles.some((y) => y >= rStart && y <= rEnd),
    });
  }

  const pctOf = (arr) => {
    const s = [...arr].sort((a, b) => a - b);
    const f = percentileFn(s);
    return arr.map((x) => f(x));
  };
  const rPct = Object.fromEntries(Object.keys(recent).map((k) => [k, pctOf(recent[k])]));
  const cPct = Object.fromEntries(Object.keys(career).map((k) => [k, pctOf(career[k])]));
  const W = { apW: 0.32, apT: 0.24, win: 0.18, title: 0.16, draft: 0.1 };

  const shifts = rows.map((_, i) =>
    Object.keys(W).reduce((s, k) => s + W[k] * (rPct[k][i] - cPct[k][i]), 0),
  );
  const zShift = zfun(shifts);
  rows.forEach((r, i) => {
    const m = meta[i];
    const score = zShift(shifts[i]);
    // recent / prior standing among all programs (AP weeks + win %), for gates
    const recentStanding = (rPct.apW[i] + rPct.win[i]) / 2;
    const priorStanding = (cPct.apW[i] + cPct.win[i]) / 2;
    const material = Math.abs(m.recentWp - m.careerWp) >= 0.03 || m.recentApW >= 1 || m.hasTitleRecent;
    let dir = 'even';
    // up: clear positive shift AND the program is now genuinely respectable …
    if (material && score >= 1.1 && recentStanding >= 0.5) dir = 'up';
    // … or it won a national title in the recent era and climbed doing it
    else if (m.hasTitleRecent && score >= 0.55 && recentStanding >= 0.7) dir = 'up';
    // down: clear negative shift AND the program actually had height to fall from
    else if (material && score <= -1.1 && priorStanding >= 0.55) dir = 'down';
    r.trend = { score: Number(score.toFixed(3)), dir };
  });
}

function derive(rows) {
  const sorted = {};
  const pct = {};
  const z = {};
  const dist = {};
  for (const key of STAT_KEYS) {
    const xs = rows.map((r) => r.raw[key]);
    sorted[key] = [...xs].sort((a, b) => a - b);
    pct[key] = percentileFn(sorted[key]);
    z[key] = zfun(xs);
    const mu = mean(xs);
    dist[key] = { mean: mu, stddev: stddev(xs, mu), min: sorted[key][0], max: sorted[key].at(-1) };
  }

  const teams = rows.map((r) => {
    const zt = {};
    const pt = {};
    for (const key of STAT_KEYS) {
      zt[key] = z[key](r.raw[key]);
      pt[key] = pct[key](r.raw[key]) * 100;
    }
    const composite = {};
    const critScore = {};
    for (const [ck, [a, b]] of Object.entries(CRITERIA)) {
      composite[ck] = (zt[a] + zt[b]) / 2;
      critScore[ck] = (pt[a] + pt[b]) / 2;
    }
    // Blue Blood Rating: drop the single highest and single lowest of the 10
    // stat percentiles, average the remaining 8
    const rating = trimmean(STAT_KEYS.map((k) => pt[k]), 0.2);
    const spread = stddev(CK.map((c) => critScore[c]));
    const consistency = Math.max(0, Math.round(100 - spread * 2.5));
    return {
      school: r.school,
      slug: r.slug,
      conference: r.conference,
      primary: r.primary,
      secondary: r.secondary,
      formerFcs: r.formerFcs,
      stats: r.raw,
      z: zt,
      pct: pt,
      composite,
      critScore,
      rating,
      spread,
      consistency,
      trend: r.trend || { score: 0, dir: 'even' },
    };
  });

  const zRating = zfun(teams.map((t) => t.rating));
  teams.forEach((t) => {
    t.overall = zRating(t.rating);
  });
  [...teams].sort((a, b) => b.rating - a.rating).forEach((t, i) => {
    t.ratingRank = i + 1;
  });

  const composites = {};
  for (const ck of CK) {
    const xs = teams.map((t) => t.composite[ck]);
    const mu = mean(xs);
    composites[ck] = { mean: mu, stddev: stddev(xs, mu), min: Math.min(...xs), max: Math.max(...xs) };
  }
  const overall = {
    mean: 0,
    stddev: stddev(teams.map((t) => t.overall)),
    min: Math.min(...teams.map((t) => t.overall)),
    max: Math.max(...teams.map((t) => t.overall)),
  };
  return { teams, stats: dist, composites, overall, sorted };
}

/* ---- grouping (mirrors src/config/ranking.ts) ---- */
const GROUPS = [
  { key: 'blueblood', label: 'Blue Bloods', test: (t) => t.ratingRank <= 6 },
  { key: 'debated', label: 'Debated', test: (t) => DEBATED.includes(t.school) },
  { key: 'adjacent', label: 'Blue Blood Adjacent', test: (t) => t.rating >= 88 },
  { key: 'brand', label: 'National Brands', test: (t) => t.rating >= 72 },
  { key: 'field', label: 'The Field', test: () => true },
];
const groupIndex = (t) => GROUPS.findIndex((g) => g.test(t));
const groupLabel = (t) => GROUPS[groupIndex(t)].label;

function trajectory(dir) {
  return { up: 'Ascending', down: 'Receding', even: 'Holding' }[dir] || 'Holding';
}

/**
 * Pointed suffix — only when it genuinely bears on the rating, and only for the
 * handful of programs where it's the real story. Two cases:
 *   "· needs the decades"  a riser whose rating is capped by cumulative totals
 *                          (all-time wins, poll weeks, draft picks), not by
 *                          current quality — a young/recent arrival.
 *   "· a former power"     a receder whose rating still rests on one genuinely
 *                          elite bygone strength (a criterion in the top ~10%).
 */
function suffixFor(t) {
  const cum = mean([t.pct.allTimeWins, t.pct.weeksApPoll, t.pct.nflDraftPicks, t.pct.consensusAA]);
  const quality = mean([t.pct.winPct, t.pct.weeksApTop10, t.pct.firstRoundPicks]);
  const peak = Math.max(...CK.map((c) => t.critScore[c]));
  if (t.trend.dir === 'up' && quality - cum >= 20 && cum < 45 && t.ratingRank > 12) {
    return ' · needs the decades';
  }
  if (t.trend.dir === 'down' && peak >= 90 && t.ratingRank > 15) return ' · a former power';
  return '';
}

/**
 * One concrete, decade-scale path into the next grouping up. The rating is the
 * mean of 8 of 10 stat percentiles, so we concentrate the needed lift on the
 * program's lowest few percentiles and translate the implied raw gains into
 * plain phrases — each capped at what a genuinely strong decade produces.
 */
function nextTierPath(t, all, sorted) {
  const gi = groupIndex(t);
  if (gi <= 0) return null;
  // "Debated" is a 2-team hardcoded callout, not a tier you climb into — skip it
  let ti = gi - 1;
  if (GROUPS[ti].key === 'debated') ti -= 1;
  if (ti < 0) return null;
  const target = GROUPS[ti];
  const inTarget = all.filter((x) => groupIndex(x) === ti);
  const bar = Math.min(...inTarget.map((x) => x.rating));
  const gap = bar - t.rating;
  if (gap <= 0.2) return null;

  // per-decade ceilings for a top-tier program
  const CAP = {
    weeksApPoll: 130, weeksApTop10: 55, allTimeWins: 115, winPct: 0.15,
    nationalTitles: 2, conferenceTitles: 4, consensusAA: 12, unanimousAA: 6,
    nflDraftPicks: 55, firstRoundPicks: 12,
  };
  const PHRASE = {
    weeksApPoll: (d) => `~${Math.round(d / 13)} more ranked seasons`,
    weeksApTop10: (d) => `~${Math.max(1, Math.round(d / 10))} more top-10 finishes`,
    allTimeWins: (d) => `~${Math.round(d / 10) * 10} more wins`,
    winPct: () => 'a clear step up in the all-time win rate',
    nationalTitles: (d) => `${Math.max(1, Math.ceil(d))} national title${Math.ceil(d) > 1 ? 's' : ''}`,
    conferenceTitles: (d) => `${Math.max(1, Math.ceil(d))} more league titles`,
    consensusAA: (d) => `${Math.max(1, Math.ceil(d))} more consensus All-Americans`,
    unanimousAA: (d) => `${Math.max(1, Math.ceil(d))} more unanimous All-Americans`,
    nflDraftPicks: (d) => `~${Math.round(d / 10) * 10} more draft picks`,
    firstRoundPicks: (d) => `${Math.max(1, Math.ceil(d))} more first-round picks`,
  };

  const ranked = STAT_KEYS.map((k) => ({ k, p: t.pct[k], head: 100 - t.pct[k] }))
    .filter((r) => r.k !== 'winPct') // implied by wins; not independently actionable
    .sort((a, b) => a.p - b.p)
    .slice(0, 4);
  const headTotal = ranked.reduce((s, r) => s + r.head, 0) || 1;
  const need = 8 * gap;

  let covered = 0;
  const moves = [];
  for (const { k, head } of ranked) {
    const addPct = Math.min(head, (need * head) / headTotal);
    if (addPct < 3) continue;
    const newRaw = valueAtPct(sorted[k], Math.min(1, (t.pct[k] + addPct) / 100));
    let delta = newRaw - t.stats[k];
    if (delta <= 0) continue;
    const capped = Math.min(delta, CAP[k] ?? delta);
    covered += capped / (delta || 1);
    moves.push({ stat: k, phrase: PHRASE[k](capped) });
  }
  if (!moves.length) return null;
  const enough = covered >= moves.length * 0.8;
  const items = moves.slice(0, 3).map((m) => m.phrase).join(', ');
  const summary = enough
    ? `One path to ${target.label}: a strong decade — ${items}.`
    : `${target.label} is a long way off: it would take more than a decade of ${items}, sustained.`;
  return { label: target.label, gapPoints: Number(gap.toFixed(1)), moves: moves.slice(0, 3), summary };
}

function finalize(teams, sorted, blurbs) {
  for (const t of teams) {
    const standard = `${groupLabel(t)} · ${trajectory(t.trend.dir)}${suffixFor(t)}`;
    t.label = { standard, personal: blurbs.get(t.school) || standard };
    t.nextTier = nextTierPath(t, teams, sorted);
    delete t.spread;
  }
}

function readPreviousSnapshot() {
  if (!fs.existsSync(SNAP)) return null;
  const files = fs
    .readdirSync(SNAP)
    .filter((f) => /^data-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  const today = `data-${new Date().toISOString().slice(0, 10)}.json`;
  const prev = files.filter((f) => f !== today).pop();
  if (!prev) return null;
  try {
    const p = JSON.parse(fs.readFileSync(path.join(SNAP, prev), 'utf8'));
    if (p.teams?.[0]?.rating == null) return null;
    return Object.fromEntries(p.teams.map((t) => [t.school, { ratingRank: t.ratingRank, rating: t.rating }]));
  } catch {
    return null;
  }
}

async function main() {
  const notes = [];
  const { rows, blurbs } = loadManual();

  let cfbd = null;
  let conferences = null;
  if (hasKey()) {
    console.log('Fetching CFBD history (cached per year under data/snapshots/cfbd/) …');
    const [ap, records] = await Promise.all([
      getApBySeason(AP_FROM, LATEST_SEASON),
      getRecordsBySeason(RECORDS_FROM, LATEST_SEASON),
    ]);
    await getDraftBySeason(DRAFT_FROM, CURRENT_YEAR);
    cfbd = { ap, records, draftByYear: await draftPerYear() };
    conferences = await getConferences(CONF_YEAR);
  } else {
    notes.push('CFBD_API_KEY not set — manual sheet values only; trend flat; conferences from CSV.');
  }

  // current conference from CFBD (falls back to the CSV value)
  if (conferences) {
    let updated = 0;
    for (const r of rows) {
      const c = conferences.get(r.school) || conferences.get(reverseAlias(r.school));
      if (c) {
        const disp = CONF_DISPLAY[c] || c;
        if (disp !== r.conference) updated += 1;
        r.conference = disp;
      }
    }
    notes.push(`conference alignment set from CFBD ${CONF_YEAR} (${updated} changed).`);
  }

  applyCfbd(rows, cfbd, LATEST_SEASON);
  computeTrend(rows, cfbd);
  const now = derive(rows.map((r) => ({ ...r, raw: { ...r.raw } })));
  finalize(now.teams, now.sorted, blurbs);

  // prior-season dataset for the year-over-year note
  let previous = readPreviousSnapshot();
  if (!previous && cfbd) {
    const priorRows = loadManual().rows;
    if (conferences) {
      for (const r of priorRows) {
        const c = conferences.get(r.school);
        if (c) r.conference = CONF_DISPLAY[c] || c;
      }
    }
    applyCfbd(priorRows, cfbd, LATEST_SEASON - 1);
    const prior = derive(priorRows);
    previous = Object.fromEntries(
      prior.teams.map((t) => [t.school, { ratingRank: t.ratingRank, rating: t.rating }]),
    );
  }

  const champRaw = cfbd?.ap.finalNo1?.[LATEST_SEASON] || null;
  const latestChampion = champRaw ? CFBD_ALIAS[champRaw] || champRaw : null;

  const missingLogo = now.teams
    .filter(
      (t) =>
        !t.slug ||
        (!fs.existsSync(path.join(REPO, 'public/logos', `${t.slug}.svg`)) &&
          !fs.existsSync(path.join(REPO, 'public/logos', `${t.slug}.png`))),
    )
    .map((t) => t.school);

  const meta = {
    generatedAt: new Date().toISOString(),
    model: 'percentile-trimmed-mean',
    modelBlurb:
      'Rank each of the ten stats within FBS, drop each program’s single best and single worst percentile, average the other eight.',
    trendRecentYears: TREND_RECENT,
    latestSeason: LATEST_SEASON,
    latestChampion,
    conferenceYear: conferences ? CONF_YEAR : null,
    sources: { cfbd: Boolean(cfbd), manual: true },
    provenance: PROVENANCE,
    dataRange: cfbd
      ? `AP poll ${AP_FROM}–${LATEST_SEASON} and all-time records via CollegeFootballData; titles & All-Americans hand-maintained`
      : 'data/manual/*.csv only',
    stats: now.stats,
    composites: now.composites,
    overall: now.overall,
    previous: previous || undefined,
  };
  const payload = { meta, teams: now.teams };

  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.mkdirSync(SNAP, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC, 'teams.json'), JSON.stringify(payload));
  fs.writeFileSync(path.join(PUBLIC, 'meta.json'), JSON.stringify(meta, null, 2));
  fs.writeFileSync(
    path.join(SNAP, `data-${new Date().toISOString().slice(0, 10)}.json`),
    JSON.stringify(payload),
  );

  console.log(`\n✓ ${now.teams.length} teams → public/data/teams.json  (model: ${meta.model})`);
  for (const n of notes) console.log(`  · ${n}`);
  if (latestChampion) console.log(`  · ${LATEST_SEASON} AP champion: ${latestChampion}`);
  if (missingLogo.length) console.log(`  ! missing logo: ${missingLogo.join(', ')}`);
  const top = [...now.teams].sort((a, b) => a.ratingRank - b.ratingRank).slice(0, 12);
  console.log('  Blue Blood Rating — top 12:');
  for (const t of top) {
    console.log(
      `   ${String(t.ratingRank).padStart(2)}. ${t.school.padEnd(15)} ${t.rating.toFixed(1).padStart(5)}  ` +
        `${t.trend.dir.padEnd(5)}  ${t.conference.padEnd(12)}  ${t.label.standard}`,
    );
  }
  const dirs = now.teams.reduce((m, t) => ((m[t.trend.dir] = (m[t.trend.dir] || 0) + 1), m), {});
  console.log('  trend split:', dirs);
}

function reverseAlias(school) {
  for (const [cfbd, ours] of Object.entries(CFBD_ALIAS)) if (ours === school) return cfbd;
  return school;
}

async function draftPerYear() {
  const dir = path.join(SNAP, 'cfbd');
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^draft-(\d{4})\.json$/);
    if (!m) continue;
    const year = Number(m[1]);
    for (const p of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      const school = p.collegeTeam || p.college;
      if (!school) continue;
      let e = out.get(school);
      if (!e) {
        e = {};
        out.set(school, e);
      }
      e[year] = e[year] || { picks: 0, firstRound: 0 };
      e[year].picks += 1;
      if (p.round === 1) e[year].firstRound += 1;
    }
  }
  return out;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
