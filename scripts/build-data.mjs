/**
 * Builds public/data/teams.json (+ meta.json + a dated snapshot) from the
 * committed data store — NEVER the network.
 *
 * Inputs — the staging layer (data/staging/, all hand-maintained, `_staging_` =
 * raw inputs, `_blurb_` = narrative text). Nothing here is written by an automated
 * process; the maintainer edits the CSVs directly and re-runs this build:
 *   _staging_identity.csv             slug, colours, conference fallback, former-FCS flag
 *   _staging_wins.csv                 wins/losses/ties (+ wins_vacated/losses_vacated) per (school, season)
 *   _staging_ap_poll_success.csv      AP weeks / top-10 / final rank per (school, season)
 *   _staging_nfl_draft_success.csv    picks + first-round picks per (school, season)
 *   _staging_championships.csv        one title per row, scope=national|conference
 *   _staging_all_americans.csv        one consensus selection per row
 *   _staging_heisman.csv              one Heisman winner per row (team-panel only)
 *   _staging_summary_fallback.csv     legacy per-program counts, used only where a granular file has no rows
 *   _staging_blue_blood_rating.csv    the rating knobs (trim fraction, tier anchors, title selectors, …)
 *   _staging_grouping_overrides.csv   force a program's grouping
 *   _blurb_tier_descriptions.csv / _blurb_tagline.csv                       (source of truth)
 *   _blurb_identity_line.csv / _blurb_ranking_row_subline.csv / _blurb_trajectory.csv
 *   _blurb_comparison.csv / _blurb_projection.csv                           (blank row = use computed)
 *   conferences.json                  current conference per school (year + bySchool map)
 *
 * Model — "percentile-trimmed-mean": each of the 10 stats -> within-FBS percentile;
 * drop each program's single highest and single lowest; Rating = mean of the other 8.
 *
 * Everything is computed twice: `official` (the default view — NCAA-vacated wins
 * removed) and `asPlayed` (vacated wins counted). The default variant is mirrored
 * onto the top level of each team; both live under `variants`. Trajectory is
 * computed once (from asPlayed rows) and shared by both.
 *
 * Run: npm run build:data
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords, writeRecords } from './lib/csv.mjs';
import { detectTiers } from './lib/tiers.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGING = path.join(REPO, 'data/staging');
const PUBLIC = path.join(REPO, 'public/data');
const SNAP = path.join(REPO, 'data/snapshots');

/* ---- rating knobs from data/staging/_staging_blue_blood_rating.csv ---- */
let AP_FROM = 1936;
let TREND_RECENT_FRAC = 0.2; // legacy — kept for meta.trendRecentFraction
let TREND_RECENT_YEARS = 10; // trajectory: how many recent seasons to weigh
let TREND_DELTA_POINTS = 8; // trajectory: |recent − baseline| this big = a real move
let TREND_SURGE_POINTS = 25; // trajectory: |recent − baseline| this big = an emphatic move (▲▲ / ▼▼)
let TREND_MIN_HISTORY = 30; // trajectory: fewer seasons on record than this → "not enough history", no arrow
let TRIM_FRAC = 0.2;
let TIER_MAX_SPAN = 12; // no grouping may span more than this many rating points
let ZERO_PCT_NO_TITLE = false; // experiment: force the nationalTitles percentile to 0
//   (not the ~34th-pct mid-rank of the ~90-team pileup at zero) for any program
//   with 0 recognized national titles. Set zero_pct_no_national_title=1 to try it.
// which national-title selectors count toward the Championships criterion. A title
// YEAR counts when a program has >=1 championships row (scope=national) with one of
// these selectors and a status other than 'not-claimed'. 'claim' rows (a school's
// own unbacked claim) are never in this set. Pre-1936: CFRA / HAF / NCF.
let TITLE_SELECTORS = new Set([
  'AP', 'UPI', 'FWAA', 'NFF', 'USA/CNN', 'USA/ESPN', 'AFCA', 'BCS', 'CFP', 'CFRA', 'HAF', 'NCF',
]);
function loadConfig() {
  const p = path.join(STAGING, '_staging_blue_blood_rating.csv');
  if (!fs.existsSync(p)) return;
  const cfg = Object.fromEntries(readRecords(fs.readFileSync(p, 'utf8')).map((r) => [r.key, r.value]));
  if (cfg.ap_from) AP_FROM = Number(cfg.ap_from);
  if (cfg.trend_recent_fraction) TREND_RECENT_FRAC = Number(cfg.trend_recent_fraction);
  if (cfg.trend_recent_years) TREND_RECENT_YEARS = Number(cfg.trend_recent_years);
  if (cfg.trend_delta_points) TREND_DELTA_POINTS = Number(cfg.trend_delta_points);
  if (cfg.trend_surge_points) TREND_SURGE_POINTS = Number(cfg.trend_surge_points);
  if (cfg.trend_min_history) TREND_MIN_HISTORY = Number(cfg.trend_min_history);
  if (cfg.trim_fraction) TRIM_FRAC = Number(cfg.trim_fraction);
  if (cfg.tier_max_span) TIER_MAX_SPAN = Number(cfg.tier_max_span);
  if (cfg.zero_pct_no_national_title) ZERO_PCT_NO_TITLE = /^(1|true|yes)$/i.test(String(cfg.zero_pct_no_national_title).trim());
  if (cfg.title_selectors) TITLE_SELECTORS = new Set(cfg.title_selectors.split(/\s+/).filter(Boolean));
  // tier_anchor_N keys are ignored now — groupings come purely from rating gaps (tiers.mjs)
}

// display order — criterion, then its two stats (the rating is a mean, so order
// doesn't affect it; this just keeps every list/strip/tab consistent)
const CRITERIA = {
  perception: ['weeksApPoll', 'weeksApTop10'],
  allAmericans: ['consensusAA', 'unanimousAA'],
  championships: ['nationalTitles', 'conferenceTitles'],
  nflDraft: ['nflDraftPicks', 'firstRoundPicks'],
  wins: ['allTimeWins', 'winPct'],
};
const CK = Object.keys(CRITERIA);
const STAT_KEYS = CK.flatMap((c) => CRITERIA[c]);
const CRIT_LABEL = {
  perception: 'AP Poll Success', allAmericans: 'All-Americans', championships: 'Championships',
  nflDraft: 'NFL Draft Success', wins: 'Wins',
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

// Short, plain descriptions of what each criterion's data is and how far it reaches.
// Our own compilation — the staging paths are for the curious, not attributions.
const PROVENANCE = {
  perception: 'Weeks in the AP poll and weeks in the AP top 10, every poll since it began in 1936, preseason polls included (data/staging/_staging_ap_poll_success.csv).',
  wins: 'Wins/losses/ties season by season from 1869; a tie is half a win. A few pre-modern programs carry one lump total for the years before ~1936 where game-level records don’t survive — anchored to the NCAA "FBS Records" all-time line where the book publishes one (data/staging/_staging_wins.csv, _staging_wins_ncaa.csv).',
  championships: 'One row per (school, year, selector) from 1901. A year counts only when a recognized selector picked the team — AP, UPI, FWAA, NFF, USA (CFRA/HAF/NCF before 1936); "claim"/"not-claimed" never count. Shared titles count in full (data/staging/_staging_championships.csv).',
  allAmericans: 'Every consensus All-America selection, one row per player, since 1898; unanimous flagged since 1924 (data/staging/_staging_all_americans.csv).',
  nflDraft: 'Every NFL Draft pick by school since 1936, plus the separate AFL drafts of 1960–66; a player taken by both leagues counts once per league (data/staging/_staging_nfl_draft_picks{,_afl}.csv → _staging_nfl_draft_success.csv).',
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
const stg = (name) => readRecords(fs.readFileSync(path.join(STAGING, name), 'utf8'));
/** optional staging override file — Map<school, row>; empty if absent or header-only */
const overrideMap = (name) => {
  const p = path.join(STAGING, name);
  if (!fs.existsSync(p)) return new Map();
  return new Map(readRecords(fs.readFileSync(p, 'utf8')).filter((r) => r.school).map((r) => [r.school, r]));
};

/* ---- source-sheet school spelling -> our canonical school ---- */
const SCHOOL_ALIAS = {
  'NC State': 'North Carolina State', 'App State': 'Appalachian State', Massachusetts: 'UMass',
  Connecticut: 'UConn', 'Louisiana Monroe': 'Louisiana-Monroe', 'UL Monroe': 'Louisiana-Monroe',
  'Southern Mississippi': 'Southern Miss', Miami: 'Miami (FL)', "Hawai'i": 'Hawaii',
  'San José State': 'San Jose State', 'Florida International': 'FIU',
};
const CONF_DISPLAY = {
  'American Athletic': 'American', 'Mid-American': 'MAC', 'Conference USA': 'C-USA', 'FBS Independents': 'Independent',
};
const alias = (s) => SCHOOL_ALIAS[s] || s;

/* ---- load (everything from data/staging/) ---- */
function load() {
  // active=0 rows are carried in identity for a future season but not built/shown yet
  const teams = stg('_staging_identity.csv').filter((r) => r.school && r.active !== '0');
  const summary = new Map(stg('_staging_summary_fallback.csv').map((r) => [r.school, r]));
  const blurbs = new Map(stg('_blurb_tagline.csv').filter((r) => r.text).map((r) => [r.school, r.text]));
  const tierDesc = Object.fromEntries(
    stg('_blurb_tier_descriptions.csv').filter((r) => r.grouping).map((r) => [r.grouping, r.text]),
  );

  // championships: scope=national (selector/status) → counting title YEARS;
  //                scope=conference → a count (fallback to summary while empty)
  const champ = stg('_staging_championships.csv');
  const titles = new Map();
  for (const r of champ) {
    if (r.scope !== 'national') continue;
    if (r.status === 'not-claimed') continue; // a selector named them; the school doesn't claim it
    if (!TITLE_SELECTORS.has(r.selector)) continue; // excludes 'claim' rows
    if (!titles.has(r.school)) titles.set(r.school, new Set());
    titles.get(r.school).add(r.year); // distinct years
  }
  // conference titles: one row per (school, year) from _staging_conference_titles.csv
  // (parsed from the NCAA "Conference Standings & Champions" book — regular-season
  // champion, or the title-game winner where a league had one; co-champions each
  // count in full). Distinct YEARS per program. Programs the parse didn't reach
  // fall back to the summary count in buildRows().
  const confTitles = new Map();
  const confTitleYears = new Map(); // school -> [year, ...] (for point-in-time snapshots)
  {
    const p = path.join(STAGING, '_staging_conference_titles.csv');
    if (fs.existsSync(p)) {
      const byYear = new Map();
      for (const r of readRecords(fs.readFileSync(p, 'utf8'))) {
        if (!r.school || !r.year) continue;
        if (!byYear.has(r.school)) byYear.set(r.school, new Set());
        byYear.get(r.school).add(Number(r.year));
      }
      for (const [school, years] of byYear) {
        confTitles.set(school, years.size);
        confTitleYears.set(school, [...years]);
      }
    }
  }

  // one row per consensus selection (Yes/No flags) → per-(school) totals + per-year {c,u}
  const aa = new Map();
  for (const r of stg('_staging_all_americans.csv')) {
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
  const heismanYears = new Map();
  for (const r of stg('_staging_heisman.csv')) {
    heisman.set(r.school, (heisman.get(r.school) || 0) + 1);
    if (r.year) (heismanYears.get(r.school) || heismanYears.set(r.school, []).get(r.school)).push(Number(r.year));
  }

  // AP poll: per-(school, season) csv → the per-team summary shape build-data expects
  const apTeams = {};
  const finalNo1 = {};
  let apMin = Infinity;
  let apMax = -Infinity;
  for (const r of stg('_staging_ap_poll_success.csv')) {
    if (!r.school || !r.season) continue;
    const y = Number(r.season);
    apMin = Math.min(apMin, y);
    apMax = Math.max(apMax, y);
    const wp = Number(r.weeks_poll || 0);
    const wt = Number(r.weeks_top10 || 0);
    const fr = Number(r.final_rank || 0);
    const e = apTeams[r.school] || { weeksPoll: 0, weeksTop10: 0, perSeason: {}, perSeasonTop10: {}, finalRank: {} };
    e.weeksPoll += wp;
    e.weeksTop10 += wt;
    if (wp) e.perSeason[y] = wp;
    if (wt) e.perSeasonTop10[y] = wt;
    if (fr) e.finalRank[y] = fr;
    apTeams[r.school] = e;
    if (String(r.final_rank) === '1') finalNo1[y] = r.school;
  }
  const apSummary = { fromYear: apMin, toYear: apMax, finalNo1, teams: apTeams };

  // NFL draft: per-(school, season) totals → per-team totals + per-season series
  const draft = new Map();
  for (const r of stg('_staging_nfl_draft_success.csv')) {
    if (!r.school || !r.season) continue;
    const picks = Number(r.picks || 0);
    const fr = Number(r.first_round_picks || 0);
    const e = draft.get(r.school) || { picks: 0, firstRound: 0, perSeason: {}, firstBySeason: {} };
    e.picks += picks;
    e.firstRound += fr;
    if (picks) e.perSeason[r.season] = picks;
    if (fr) e.firstBySeason[r.season] = fr;
    draft.set(r.school, e);
  }

  const conferences = fs.existsSync(path.join(STAGING, 'conferences.json'))
    ? readJson(path.join(STAGING, 'conferences.json')).bySchool
    : {};

  // wins: per-(school, season) → per-team totals + per-season w/l/t (from AP_FROM on).
  // wins_vacated / losses_vacated on a row feed the 'official' variant (summed per school).
  const records = new Map();
  const recFull = new Map(); // EVERY season row incl. the pre-1936 lump — for point-in-time snapshots
  const vacated = new Map();
  for (const r of stg('_staging_wins.csv')) {
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

    const y = Number(r.season) || 0;
    const rf = recFull.get(r.school) || { perYear: {} };
    const cur = rf.perYear[y] || { w: 0, l: 0, t: 0 };
    cur.w += w; cur.l += l; cur.t += ti;
    rf.perYear[y] = cur;
    recFull.set(r.school, rf);

    const vw = Number(r.wins_vacated || 0);
    const vl = Number(r.losses_vacated || 0);
    if (vw + vl > 0) {
      const v = vacated.get(r.school) || { w: 0, l: 0 };
      v.w += vw;
      v.l += vl;
      vacated.set(r.school, v);
    }
  }

  // counting title years per program (filtered national rows) — for the trajectory
  const titleYears = new Map();
  for (const [school, yrs] of titles) titleYears.set(school, [...yrs].map(Number).sort((a, b) => a - b));

  const overrides = {
    grouping: overrideMap('_staging_grouping_overrides.csv'),
    trend: overrideMap('_blurb_trajectory.csv'),
    standing: overrideMap('_blurb_standing.csv'),
    pathForward: overrideMap('_blurb_path_forward.csv'),
    identity: overrideMap('_blurb_identity_line.csv'),
    subline: overrideMap('_blurb_ranking_row_subline.csv'),
  };

  return {
    teams, summary, blurbs, tierDesc, titles, titleYears, confTitles, confTitleYears,
    aa, heisman, heismanYears, vacated,
    apSummary, conferences, records, recFull, draft, overrides,
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
        // _staging_championships.csv is the complete record: no counting row → genuinely 0.
        // (No summary fallback — that only ever mis-fired, e.g. Navy's stray 0.5.)
        nationalTitles: D.titles.has(t.school) ? D.titles.get(t.school).size : 0,
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
  for (const [k, v] of Object.entries(SCHOOL_ALIAS)) if (v === school) return k;
  return school;
}

/* ---- trajectory: last decade vs. all time -----------------------------------
 *
 *   Runs the same rank → (trim) → mean the headline rating uses, but only on the
 *   FIVE stats that actually separate teams over a ten-year window — wins, win
 *   rate, AP-poll weeks, AP-top-10 weeks and draft picks. The rarer counters
 *   (titles, All-Americans, first-round picks, conference titles) are too sparse
 *   in a decade to rank cleanly, so they sit this one out.
 *
 *   trend.recentRating   = those five, over the last TREND_RECENT_YEARS seasons,
 *                          each ranked against every program's last decade.
 *   trend.baselineRating = the same five, all-time, ranked all-time.
 *   trend.delta          = recentRating − baselineRating.
 *   |delta| ≥ TREND_DELTA_POINTS → Ascending / Descending; ≥ TREND_SURGE_POINTS →
 *   emphatic (stacked arrow). Under TREND_MIN_HISTORY seasons on record → no
 *   arrow (`insufficient`).
 * ---- */
const TREND_KEYS = ['allTimeWins', 'winPct', 'weeksApPoll', 'weeksApTop10', 'nflDraftPicks'];
const rate5 = (pct) => trimmean(TREND_KEYS.map((k) => pct[k]), TRIM_FRAC);
const TREND_CRIT_OF = {
  weeksApPoll: 'perception', weeksApTop10: 'perception',
  consensusAA: 'allAmericans', unanimousAA: 'allAmericans',
  nationalTitles: 'championships',
  nflDraftPicks: 'nflDraft', firstRoundPicks: 'nflDraft',
  allTimeWins: 'wins', winPct: 'wins',
};

/** every rating stat, totalled over seasons FROM..TO only (same shape as row.raw) */
function recentRaw(D, school, FROM, TO) {
  const ap = D.apSummary.teams[school] || D.apSummary.teams[revAlias(school)] || {};
  const rec = D.records.get(school) || { perSeason: {} };
  const dr = D.draft.get(school) || { perSeason: {}, firstBySeason: {} };
  const tYears = D.titleYears.get(school) || [];
  const A = D.aa.get(school) || { perYear: {} };
  const inWin = (y) => y >= FROM && y <= TO;
  const winSum = (obj) => Object.entries(obj || {})
    .reduce((s, [y, v]) => s + (inWin(Number(y)) ? Number(v || 0) : 0), 0);

  const seasons = Object.keys(rec.perSeason).map(Number).sort((a, b) => a - b);
  const recentYears = seasons.filter(inWin);
  let rw = 0; let rl = 0; let rt = 0;
  let winningSeasons = 0; let tenWinSeasons = 0;
  for (const y of recentYears) {
    const s = rec.perSeason[y];
    if (!s) continue;
    rw += s.w; rl += s.l; rt += s.t;
    if (s.w > s.l) winningSeasons += 1;
    if (s.w >= 10) tenWinSeasons += 1;
  }
  const rg = rw + rl + rt;
  const rankedSeasons = recentYears.filter((y) => Number(ap.perSeason?.[y] || 0) > 0).length;
  // a genuine top-ten finish: end the year ranked 1–10 (falls back to "half a season
  // spent in the top ten" only for the pre-final-rank era, which the 10-year window never is)
  const hasFinalRank = ap.finalRank && Object.keys(ap.finalRank).length;
  const top10Seasons = hasFinalRank
    ? recentYears.filter((y) => { const r = Number(ap.finalRank[y] || 0); return r >= 1 && r <= 10; }).length
    : recentYears.filter((y) => Number(ap.perSeasonTop10?.[y] || 0) >= 6).length;
  const top25Seasons = hasFinalRank
    ? recentYears.filter((y) => { const r = Number(ap.finalRank[y] || 0); return r >= 1 && r <= 25; }).length
    : rankedSeasons;
  return {
    winningSeasons,
    tenWinSeasons,
    rankedSeasons,
    top10Seasons,
    top25Seasons,
    record: `${rw}-${rl}${rt ? `-${rt}` : ''}`,
    raw: {
      allTimeWins: rw,
      winPct: rg ? (rw + 0.5 * rt) / rg : 0,
      nationalTitles: tYears.filter(inWin).length,
      conferenceTitles: 0, // no season-level source; overwritten with the all-time pct upstream
      consensusAA: Object.entries(A.perYear).reduce((s, [y, v]) => s + (inWin(Number(y)) ? (v.c || 0) : 0), 0),
      unanimousAA: Object.entries(A.perYear).reduce((s, [y, v]) => s + (inWin(Number(y)) ? (v.u || 0) : 0), 0),
      nflDraftPicks: winSum(dr.perSeason),
      firstRoundPicks: winSum(dr.firstBySeason),
      weeksApPoll: winSum(ap.perSeason),
      weeksApTop10: winSum(ap.perSeasonTop10),
    },
    games: rg,
    recentN: recentYears.length,
    totalN: seasons.length,
    recentRange: recentYears.length ? `${recentYears[0]}–${recentYears.at(-1)}` : `${FROM}–${TO}`,
    fullRange: seasons.length ? `${seasons[0]}–${seasons.at(-1)}` : '',
  };
}

/** per-school season-count metadata (variant-independent) */
function trendMeta(D) {
  const TO = D.apSummary.toYear;
  const FROM = TO - TREND_RECENT_YEARS + 1;
  return new Map(D.teams.map((t) => {
    const rr = recentRaw(D, t.school, FROM, TO);
    const tYears = (D.titleYears.get(t.school) || []).slice().sort((a, b) => a - b);
    return [t.school, {
      recentSeasons: rr.recentN,
      totalSeasons: rr.totalN,
      recentRange: rr.recentRange,
      fullRange: rr.fullRange,
      insufficient: rr.totalN < TREND_MIN_HISTORY,
      lastTitleYear: tYears.length ? tYears.at(-1) : null,
      allTimeTitles: tYears.length,
      from: FROM,
      to: TO,
    }];
  }));
}

/** build `t.recentRating` / `t.recentPct` / `t.recentRaw` and the `t.trend` object
 *  for one already-derived variant (`teams` carry all-time pct + rating + grouping) */
function attachTrend(teams, D, tmeta, pctByKey, dirOverride) {
  const TO = D.apSummary.toYear;
  const FROM = TO - TREND_RECENT_YEARS + 1;
  const recBy = new Map(teams.map((t) => [t.school, recentRaw(D, t.school, FROM, TO)]));

  // recent percentile functions: nine stats ranked among all programs' last decades,
  // conference titles ranked among all programs' ALL-TIME totals (the frozen slot)
  const recPctByKey = {};
  for (const k of STAT_KEYS) {
    if (k === 'conferenceTitles') { recPctByKey[k] = pctByKey[k]; continue; }
    recPctByKey[k] = pctFn([...teams.map((t) => recBy.get(t.school).raw[k])].sort((a, b) => a - b));
  }

  for (const t of teams) {
    const rr = recBy.get(t.school);
    const rraw = { ...rr.raw, conferenceTitles: t.raw.conferenceTitles };
    const rp = profileFrom(rraw, recPctByKey);
    t.recentRaw = rr.raw;
    t.recentGames = rr.games;
    // tangible last-decade counts — the stuff a fan actually tracks
    t.recentFacts = {
      seasons: rr.recentN,
      record: rr.record,
      winningSeasons: rr.winningSeasons,
      tenWinSeasons: rr.tenWinSeasons,
      rankedSeasons: rr.rankedSeasons,
      top10Seasons: rr.top10Seasons,
      top25Seasons: rr.top25Seasons,
      titles: rr.raw.nationalTitles,
      consensusAA: rr.raw.consensusAA,
      firstRoundPicks: rr.raw.firstRoundPicks,
      draftPicks: rr.raw.nflDraftPicks,
      winPct: rr.raw.winPct,
    };
    t.recentPct = rp.pct;
    t.recentCritScore = rp.critScore;
    // the trajectory rating: the five decade-scale stats only, recent vs. all-time
    t.recentRating = rate5(rp.pct);
    const baseline = rate5(t.pct);
    t.recentTrimmedLow = rp.trimmedLow;
    t.recentTrimmedHigh = rp.trimmedHigh;

    const m = tmeta.get(t.school);
    const delta = t.recentRating - baseline;
    let dir = 'even';
    if (!m.insufficient && m.recentSeasons >= 5) {
      if (delta >= TREND_DELTA_POINTS) dir = 'up';
      else if (delta <= -TREND_DELTA_POINTS) dir = 'down';
    }
    const ov = dirOverride.get(t.school);
    if (ov?.dir && ['up', 'down', 'even'].includes(ov.dir)) dir = ov.dir;
    const strong = dir !== 'even' && Math.abs(delta) >= TREND_SURGE_POINTS;

    // biggest movers: the criterion whose recent percentile moved most from its
    // all-time percentile, one stat per criterion, with the raw numbers behind it
    const perCrit = {};
    for (const k of STAT_KEYS) {
      if (k === 'conferenceTitles') continue;
      const d = t.recentPct[k] - t.pct[k];
      const c = TREND_CRIT_OF[k];
      if (!perCrit[c] || Math.abs(d) > Math.abs(perCrit[c].d)) {
        perCrit[c] = {
          d, crit: c, label: CRIT_LABEL[c], stat: k,
          allRaw: t.raw[k], recRaw: t.recentRaw[k],
        };
      }
    }
    const movers = dir === 'even' ? [] : Object.values(perCrit)
      .filter((x) => Math.abs(x.d) >= 10)
      .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
      .slice(0, 3)
      .map((x) => ({
        label: x.label, stat: x.stat, dir: x.d > 0 ? 'up' : 'down',
        allRaw: x.allRaw, recRaw: x.recRaw,
        allPct: Math.round(t.pct[x.stat]), recPct: Math.round(t.recentPct[x.stat]),
      }));

    t.trend = {
      dir,
      strong,
      insufficient: m.insufficient,
      score: Number((delta / 10).toFixed(3)),
      delta: Number(delta.toFixed(1)),
      recentRating: Number(t.recentRating.toFixed(1)),
      baselineRating: Number(baseline.toFixed(1)),
      recentSeasons: m.recentSeasons,
      totalSeasons: m.totalSeasons,
      recentRange: m.recentRange,
      fullRange: m.fullRange,
      lastTitleYear: m.lastTitleYear,
      allTimeTitles: m.allTimeTitles,
      facts: t.recentFacts,
      movers,
    };
  }
}

/* ---- the Blue Blood Rating for one program from a set of raw stat totals and a
 *      set of per-stat percentile functions. Identical maths whether the totals
 *      are all-time or a 10-year window — that's what makes the two directly
 *      comparable. Returns 0-100 percentiles, criterion scores, the trimmed mean
 *      rating, and which two stats were trimmed. ---- */
function profileFrom(raw, pctByKey) {
  const pt = {};
  for (const k of STAT_KEYS) pt[k] = pctByKey[k](raw[k]) * 100;
  if (ZERO_PCT_NO_TITLE && raw.nationalTitles === 0) pt.nationalTitles = 0;
  const critScore = {};
  for (const [c, [a, b]] of Object.entries(CRITERIA)) critScore[c] = (pt[a] + pt[b]) / 2;
  const rating = trimmean(STAT_KEYS.map((k) => pt[k]), TRIM_FRAC);
  let trimmedLow = STAT_KEYS[0];
  let trimmedHigh = STAT_KEYS[0];
  for (const k of STAT_KEYS) {
    if (pt[k] < pt[trimmedLow]) trimmedLow = k;
    if (pt[k] > pt[trimmedHigh]) trimmedHigh = k;
  }
  return { pct: pt, critScore, rating, trimmedLow, trimmedHigh };
}

/* ---- derive percentiles, criterion scores, rating, rank ---- */
function derive(rows) {
  const sorted = {};
  const pctByKey = {};
  const z = {};
  for (const k of STAT_KEYS) {
    const xs = rows.map((r) => r.raw[k]);
    sorted[k] = [...xs].sort((a, b) => a - b);
    pctByKey[k] = pctFn(sorted[k]);
    z[k] = zfun(xs);
  }
  const teams = rows.map((r) => {
    const p = profileFrom(r.raw, pctByKey);
    const zt = {};
    for (const k of STAT_KEYS) zt[k] = z[k](r.raw[k]);
    const composite = {};
    for (const [c, [a, b]] of Object.entries(CRITERIA)) composite[c] = (zt[a] + zt[b]) / 2;
    return {
      ...r, pct: p.pct, z: zt, critScore: p.critScore, composite,
      rating: p.rating, trimmedLow: p.trimmedLow, trimmedHigh: p.trimmedHigh,
    };
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
  return { teams, composites, overall, sorted, pctByKey };
}

/* ---- groupings ----
 * All six boundaries fall out of the natural rating gaps (tiers.mjs) — the
 * largest drops in the top ~45, so a tier flexes to absorb a program that moves
 * rather than a fixed rank cut-off pushing someone out. Per-program forcing is
 * still available via data/staging/_staging_grouping_overrides.csv. */

/* ---- Blue Blood benchmark: the "average Blue Blood" ---------------------------
 * Mean of the Blue Bloods' stat percentiles — however many currently sit in that
 * tier (a true independent — 0 conference titles — is dropped from the
 * conference-title average only), run through the same criterion + trimmed-mean
 * rating formulas every program uses. Rendered as a marker line inside the Blue
 * Bloods tier; the rating and per-stat detail are on hover. */
function computeBenchmark(teams) {
  const bb = [...teams]
    .filter((t) => t.grouping === 'Blue Bloods')
    .sort((a, b) => a.ratingRank - b.ratingRank);
  if (bb.length < 2) return null;
  const pct = {};
  const stats = {};
  for (const k of STAT_KEYS) {
    const members = k === 'conferenceTitles' ? bb.filter((t) => t.raw[k] > 0) : bb;
    pct[k] = mean(members.map((t) => t.pct[k]));
    stats[k] = mean(bb.map((t) => t.raw[k]));
  }
  const critScore = {};
  for (const [c, [a, b]] of Object.entries(CRITERIA)) critScore[c] = (pct[a] + pct[b]) / 2;
  let lo = STAT_KEYS[0];
  let hi = STAT_KEYS[0];
  for (const k of STAT_KEYS) {
    if (pct[k] < pct[lo]) lo = k;
    if (pct[k] > pct[hi]) hi = k;
  }
  return {
    members: bb.map((t) => t.school),
    rating: trimmean(STAT_KEYS.map((k) => pct[k]), TRIM_FRAC),
    pct,
    stats,
    critScore,
    trimmedLow: lo,
    trimmedHigh: hi,
  };
}

const TIER_MIN_RATING = 60;

/* ---- projection scenario: "today + one ambitious-but-attested dynasty decade" ---
 * The concrete numbers behind a program's projection blurb, sized for the what-if
 * "Preview" button so it loads a realistic run — not 500 wins in ten years. The
 * per-decade gains are from DYNASTIES.md (a strong run, between the
 * Ohio-State-consistency and Saban-max extremes). Each stat moves toward the Blue
 * Blood benchmark by at most one decade; `shortStats` names the stats where even
 * a full decade doesn't reach the bar (those are the multi-decade asks the blurb
 * spells out). Returned only for programs in the "interesting" band. */
const DECADE_GAIN = {
  allTimeWins: 45, nationalTitles: 3, conferenceTitles: 7,
  consensusAA: 22, unanimousAA: 8, nflDraftPicks: 75, firstRoundPicks: 18,
  weeksApPoll: 155, weeksApTop10: 150,
};
function projectionScenario(raw, benchmark, sliderMax) {
  if (!benchmark) return null;
  const targets = {};
  const shortStats = [];
  for (const k of STAT_KEYS) {
    if (k === 'winPct') continue;
    const today = raw[k];
    const bar = Math.round(benchmark.stats[k]);
    const reach = today + DECADE_GAIN[k];
    targets[k] = today >= bar ? today : Math.min(reach, bar, sliderMax[k]);
    if (today < bar && reach < bar) shortStats.push(k);
  }
  // win % follows from the wins a dynasty decade actually adds (~110-20, ~.846)
  const games = raw.winPct > 0 ? Math.round(raw.allTimeWins / raw.winPct) : raw.allTimeWins;
  targets.winPct = raw.winPct >= benchmark.stats.winPct
    ? raw.winPct
    : Math.min((raw.allTimeWins + 110) / (games + 130), benchmark.stats.winPct);
  return { targets, shortStats };
}

function applyGroupings(teams) {
  const desc = [...teams].sort((a, b) => a.ratingRank - b.ratingRank).map((t) => t.rating);
  const { boundaries, gaps } = detectTiers(desc, {
    count: GROUPS.length, minSize: 2, minRating: TIER_MIN_RATING, maxSpan: TIER_MAX_SPAN,
  });
  // each boundary becomes a fixed RATING threshold (the midpoint of its gap). Tiers
  // are then rating bands, not rank cut-offs — so a program that moves in the
  // what-if editor only changes its own tier; nobody else is pushed up or down.
  const thresholds = boundaries.map((b) => (desc[b - 1] + desc[b]) / 2);
  const assign = (rating) => thresholds.filter((th) => rating < th).length;
  for (const t of teams) t.grouping = GROUPS[assign(t.rating)] || GROUPS.at(-1);
  const counts = GROUPS.map((g) => teams.filter((t) => t.grouping === g).length);
  return { boundaries, gaps, thresholds, counts };
}

/* ---- the three narrative blurbs: Trajectory, Standing, Path Forward.
 *   Trajectory  = the 10-year twin rating vs the headline rating, plus the
 *                 tangible last-decade facts that explain the direction.
 *   Standing    = where the program sits against the tier it wants (the blue-blood
 *                 line for Blue Bloods / Fringe / Contenders, the next tier up
 *                 otherwise), told in recent-decade terms. Gushes about the
 *                 blue bloods that have earned it.
 *   Path Forward = what to add to get there, in modern-season terms.
 *   Each pulls a different slice of the data so the three don't echo each other.
 *   All overridable in data/staging/_blurb_{trajectory,standing,path_forward}.csv.
 * ---- */
const withGroup = (g) => (/^The\b/.test(g) ? g : `the ${g}`);
const listOf = (a) => (a.length <= 1 ? (a[0] || '') : `${a.slice(0, -1).join(', ')} and ${a.at(-1)}`);
const pct0 = (x) => (x * 100).toFixed(0);
const plur = (n, one, many) => (Math.round(Math.abs(n)) === 1 ? one : many);
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
/** every rating — all-time or 10-year twin — is shown to one decimal, always (even .0) */
const R = (n) => Number(n).toFixed(1);
/** "a" / "an" for a number or record string read aloud (an 8 / an 80 / an 11-2; a 72 / a 10-3) */
const artNum = (s) => (/^(8|11|18)/.test(String(s)) ? 'an' : 'a');
const modernRecord = (wp, gpy) => {
  const g = Math.max(11, Math.round(gpy || 13));
  const w = Math.round(g * wp);
  return `${w}-${Math.max(0, g - w)}`;
};
const TIER_SHORT = {
  'Blue Bloods': 'the top six', 'Blue Blood Fringe': 'the Fringe', 'Blue Blood Contenders': 'the Contenders',
  'National Powers': 'the Powers', 'National Brands': 'the Brands', 'The Field': 'the Field',
};
const HIGHER_TIERS = new Set(['Blue Bloods', 'Blue Blood Fringe', 'Blue Blood Contenders', 'National Powers']);

/** tangible last-decade facts as ready-to-drop phrases */
function factPhrases(f) {
  const allWin = f.winningSeasons === f.seasons && f.seasons > 0;
  return {
    record: `${f.record} decade`,
    winning: allWin ? 'a winning record every year' : `${f.winningSeasons} winning ${plur(f.winningSeasons, 'season', 'seasons')} in ${f.seasons}`,
    tenWin: `${f.tenWinSeasons} ${plur(f.tenWinSeasons, 'ten-win season', 'ten-win seasons')}`,
    ranked: f.rankedSeasons === f.seasons && f.seasons > 0 ? 'ranked every year' : `ranked in ${f.rankedSeasons} of ${f.seasons}`,
    top10: f.top10Seasons === 0 ? 'no top-ten team in the stretch' : `${f.top10Seasons} ${plur(f.top10Seasons, 'year', 'years')} with a top-ten team`,
    aa: `${f.consensusAA} consensus All-${plur(f.consensusAA, 'American', 'Americans')}`,
    firsts: `${f.firstRoundPicks} first-round ${plur(f.firstRoundPicks, 'pick', 'picks')}`,
    picks: `${f.draftPicks} draft picks`,
    titles: f.titles > 0 ? `${f.titles} national ${plur(f.titles, 'title', 'titles')}` : '',
  };
}

/* ---- Trajectory (the hover + the ranked-row sub-line suffix) ---- */
function trajectoryTooltip(t) {
  const tr = t.trend;
  if (tr.insufficient) {
    return `${t.school} has ${tr.totalSeasons} ${plur(tr.totalSeasons, 'season', 'seasons')} on record — not enough history to establish a trajectory (needs ${TREND_MIN_HISTORY}+).`;
  }
  const f = tr.facts;
  const P = factPhrases(f);
  const rr = R(tr.recentRating);
  const ar = R(tr.baselineRating);
  const d = Math.abs(tr.delta).toFixed(1);

  if (tr.dir === 'even') {
    return `Maintaining — ${t.school}'s last decade rates ${rr}, right on its ${ar} all-time. ${cap(P.record)}, ${P.winning}, ${P.ranked}.`;
  }
  if (tr.dir === 'up') {
    const bits = [];
    if (P.titles) bits.push(P.titles);
    if (f.top10Seasons >= 3) bits.push(P.top10);
    else if (f.tenWinSeasons >= 3) bits.push(P.tenWin);
    if (bits.length < 2 && f.firstRoundPicks >= 4) bits.push(P.firsts);
    if (bits.length < 2) bits.push(P.winning);
    return `${tr.strong ? 'Surging' : 'Ascending'} — ${t.school}'s last decade (${rr}) tops its ${ar} all-time by ${d}. ${cap(P.record)} with ${listOf(bits.slice(0, 2))}, where the résumé had little.`;
  }
  // down — lead with the concrete shortfall
  const bits = [];
  if (f.titles === 0 && tr.allTimeTitles > 0) bits.push(`nothing added to the trophy case since ${tr.lastTitleYear}`);
  if (f.top10Seasons <= 2) bits.push(P.top10);
  if (bits.length < 2) bits.push(P.winning);
  if (bits.length < 2 && f.firstRoundPicks <= 3) bits.push(P.firsts);
  return `${tr.strong ? 'Collapsing' : 'Descending'} — ${t.school}'s last decade rates ${rr}, ${d} below its ${ar} all-time. ${cap(P.record)}: ${listOf(bits.slice(0, 2))}.`;
}

/** the short pointed phrase after Ascending / Descending on the ranked-list row */
function trajectoryNote(t) {
  const tr = t.trend;
  if (tr.dir === 'even') return '';
  const f = tr.facts;
  if (tr.dir === 'down') {
    if (f.titles === 0 && tr.allTimeTitles >= 3) return `no title since ${tr.lastTitleYear}`;
    if (f.top10Seasons === 0) return 'no top-ten team in the decade';
    return `${f.winningSeasons} winning ${plur(f.winningSeasons, 'season', 'seasons')} in ${f.seasons}`;
  }
  if (f.titles > 0) return `${f.titles} national ${plur(f.titles, 'title', 'titles')} in the decade`;
  if (f.top10Seasons >= 3) return `${f.top10Seasons} top-ten teams in the decade`;
  return `${f.tenWinSeasons || f.winningSeasons} big seasons where there'd been none`;
}

/* ---- Standing ---- */
function standingBlurb(t, benchmark, medians, recentMedians, ratingMed) {
  const g = t.grouping;
  const target = TARGET_GROUP[g];
  const isBench = target === 'Blue Bloods';
  const tr = t.trend;
  const f = tr.facts;
  const P = factPhrases(f);
  const S = t.school;
  const arN = t.rating;
  const rrN = t.recentRating;
  const ar = R(arN);
  const rr = R(rrN);
  const dd = rrN - arN;
  const bb = recentMedians['Blue Bloods'] || {};
  const tgt = recentMedians[target] || {};
  const want = R(isBench ? benchmark.rating : (ratingMed[target] ?? 0));
  const chaseLine = isBench ? 'the blue-blood line' : `${TIER_SHORT[target]}`;
  const v3 = t.ratingRank % 3;

  // Blue Bloods holding the standard — gush, three ways
  if (g === 'Blue Bloods' && dd >= -3) {
    if (v3 === 0) {
      return `${S} isn't chasing the line — it is the line. ${cap(f.record)} over the decade, ${P.winning}, ${P.firsts}${P.titles ? `, ${P.titles}` : ''}. The only argument left is which banner hangs next.`;
    }
    if (v3 === 1) {
      return `Ten years, ${f.record}, ${f.tenWinSeasons} of them double digits. ${S} has spent the decade turning "best in the sport" from a claim into a spreadsheet — ${P.firsts}, ${P.aa}, ${P.titles || 'a permanent seat in the title race'}.`;
    }
    return `The blue-blood bar sits where ${S} lives: ${f.record}, a top-ten team in ${f.top10Seasons} of ${f.seasons} ${plur(f.top10Seasons, 'year', 'years')}, a first-rounder in nearly every draft. Nobody is measured against it and comes out ahead.`;
  }
  // Blue Blood whose last decade hasn't kept up with the others'
  if (g === 'Blue Bloods') {
    const bbTop10 = Math.round(bb.top10Seasons ?? 8);
    const weak = f.top10Seasons <= 2 ? P.top10
      : f.top10Seasons <= bbTop10 - 3 ? `just ${f.top10Seasons} top-ten finishes to the rest of the six's ${bbTop10}`
        : f.titles === 0 && tr.allTimeTitles ? `a trophy case quiet since ${tr.lastTitleYear}`
          : 'pieces that never quite became a title run';
    return `${S}'s banner says blue blood; the last decade hasn't carried it like the rest of the six — ${cap(f.record)}, ${P.winning}, but ${weak}.`;
  }

  // anyone sliding — frame WHY the last ten years lag the résumé
  if (tr.dir === 'down') {
    const promise = tr.allTimeTitles > 0
      ? `${tr.allTimeTitles} national ${plur(tr.allTimeTitles, 'title', 'titles')} and generations of ranked football`
      : `an all-time rating (${ar}) the last decade hasn't matched`;
    const reality = [P.winning, f.top10Seasons === 0 ? 'not one top-ten team' : `${f.top10Seasons} with a top-ten team`];
    if (f.titles === 0 && tr.allTimeTitles) reality.push(`nothing new in the trophy case since ${tr.lastTitleYear}`);
    return `${S}'s résumé is built on ${promise}. The last ten years read differently — ${f.record}, ${listOf(reality)}.`;
  }

  // Fringe / Contenders whose form already looks blue-blood
  if (isBench && (tr.dir === 'up' || rrN >= 90)) {
    return `${S} has been blue-blood for a decade already — ${f.record}, ${P.top10}${P.titles ? `, ${P.titles}` : ''}. What is missing is the century of it: the all-time ${ar} still trails the ~${want} line.`;
  }
  // Fringe / Contenders knocking without breaking through
  if (isBench) {
    return `${S} keeps knocking without the door opening — ${f.record}, ${P.top10}, where the six average ${Math.round(bb.top10Seasons)} ${plur(bb.top10Seasons, 'year', 'years')} with a top-ten team. Close, and parked there.`;
  }

  // Powers / Brands / Field on the rise
  if (tr.dir === 'up') {
    const past = rrN >= Number(want) + 5;
    return `${S} has made the last decade its best stretch on record — ${f.record}, ${P.winning}, ${P.ranked} — ${past ? `already past ${chaseLine}` : `pushing at ${chaseLine}`}.`;
  }
  // new — too little history
  if (tr.insufficient) {
    return `${S} has ${tr.totalSeasons} FBS ${plur(tr.totalSeasons, 'season', 'seasons')}: ${f.record}, ${P.winning}. Too little to set against ${chaseLine} yet.`;
  }
  // steady / stalled — held its tier without threatening to leave it
  const flat = t.ratingRank % 2
    ? `${S} has held ${TIER_SHORT[g]} for a decade without pushing to leave it — ${f.record}, ${P.winning}, ${f.top10Seasons ? P.top10 : 'no top-ten team'}. Steady is the whole story.`
    : `A ${f.record} over ten years, ${P.winning}, ${f.top10Seasons ? P.top10 : 'no top-ten team'} — ${S} is exactly the ${TIER_SHORT[g].replace(/^the /, '')} program the rating says it is, no more, no less.`;
  return flat;
}

/* ---- Path Forward — the specific gap to close and how hard, in modern-season
 *      terms. Narrative, not a checklist; pulls the asks + the difficulty read
 *      (win-rate gap as a record, schedule, whether the trend helps). ---- */
function pathForwardBlurb(t, medians, recentMedians, latestSeason, recRaw) {
  const g = t.grouping;
  const target = TARGET_GROUP[g];
  const isBench = target === 'Blue Bloods';
  const rec = recentMedians[g] || {};
  const tgt = recentMedians[target] || {};
  const RY = TREND_RECENT_YEARS;
  const gpy = (m) => (m && m.games ? m.games / RY : 13);
  const targetLabel = target === 'Blue Bloods' && g !== 'Blue Blood Contenders' ? 'the top six' : `the ${target}`;
  const tShort = TIER_SHORT[target];
  const S = t.school;
  const tr = t.trend;
  const f = tr.facts;
  const v = t.ratingRank % 2;

  if (g === 'Blue Bloods') {
    const lo = rec.winPct || 0;
    const hi = rec.winPctHi || rec.winPct || 0;
    const loR = modernRecord(lo, gpy(rec));
    const hiR = modernRecord(hi, gpy(rec) + 2);
    const slip = tr.dir === 'down' ? ` ${S}'s last decade has dipped under it — arresting that is the only assignment.` : '';
    return `The bar here isn't a target, it's a line to stay above. Over the last ten years the six have won at about .${pct0(lo)} and up — ${artNum(loR)} ${loR} season at the low end, ${hiR} at the top, conference title game and playoff folded in — sat in the AP poll nearly every week, and put a player in the first round of most drafts. A national title is never far from the group. Slip under that for a decade and "top six" starts to look generous.${slip}`;
  }
  if (tr.insufficient || !recRaw || recRaw.games < 20) {
    return `${S} has ${tr.totalSeasons} ${plur(tr.totalSeasons, 'season', 'seasons')} at this level — too little to set a target against ${targetLabel}. The near-term markers are the ordinary ones: a winning record most years, a conference title, the odd ranked week.`;
  }

  // a Contender/Fringe whose last decade already grades blue-blood — just needs time
  if (isBench && tr.recentRating >= 90) {
    return v === 0
      ? `Nothing to add — ${S} is already playing blue-blood football. The gap left is arithmetic, not talent: five or six more years like the last ten and the ${R(t.rating)} all-time number climbs into the top six on its own.`
      : `${S}'s last decade already rates like a blue blood; the résumé just hasn't caught up. Keep the line where it is and the all-time ${R(t.rating)} gets there — that's the whole project.`;
  }

  const wpTeam = recRaw.games ? recRaw.winPct : 0;
  const wpTgt = tgt.winPct || 0;
  const behindOnWins = wpTgt > wpTeam + 0.015;
  const recordGap = `${modernRecord(wpTeam, gpy(recRaw))} where ${tShort} run ${modernRecord(wpTgt, gpy(tgt))}`;

  // the concrete asks, biggest first
  const asks = [];
  if (isBench && f.titles === 0) asks.push('a national title');
  const top10Gap = Math.round((tgt.top10Seasons ?? 0) - (f.top10Seasons ?? 0));
  const winGap = Math.round((tgt.winningSeasons ?? 0) - (f.winningSeasons ?? 0));
  const frGap = Math.round((tgt.firstRoundPicks ?? 0) - (recRaw.firstRoundPicks ?? 0));
  const aaGap = Math.round((tgt.consensusAA ?? 0) - (recRaw.consensusAA ?? 0));
  if (top10Gap >= 1) asks.push(`${top10Gap} more top-ten ${plur(top10Gap, 'season', 'seasons')} a decade`);
  if (winGap >= 1 && asks.length < 3) asks.push(`${winGap} more winning ${plur(winGap, 'year', 'years')}`);
  if (frGap >= 2 && asks.length < 3) asks.push(`${frGap} more first-round picks`);
  if (aaGap >= 3 && asks.length < 3) asks.push(`${aaGap} more consensus All-Americans`);
  const askStr = asks.length ? listOf(asks.slice(0, 3))
    : behindOnWins ? 'a better record, first of all'
      : 'nothing new — just more of the same, for longer';

  const climb = tr.dir === 'up'
    ? " The last decade's already bending that way, so it's a decade-or-two climb, not a moonshot."
    : tr.dir === 'down'
      ? ' But the trend points the other way — steadying the slide and holding the tier comes first.'
      : ` It's a real gap, and a decade of holding ${TIER_SHORT[g]} steady hasn't moved it.`;

  const conf = tr.dir === 'down' ? ''
    : g === 'National Brands'
      ? ` In the ${t.conference}, the schedule runs straight through the tier above — those are the games that decide it.`
      : g === 'The Field'
        ? ' A conference title or two is the near-term step; the tier itself is a longer build.'
        : '';

  const lead = g === 'Blue Blood Fringe' ? `Back into the middle of the pack, ${S} needs`
    : g === 'Blue Blood Contenders' ? `To break the top six, ${S} needs`
      : `To look like ${tShort}, ${S} needs`;
  const gapClause = behindOnWins ? ` — ${recordGap}` : '';
  return `${lead} ${askStr}${gapClause}.${climb}${conf}`;
}

/* ---- assemble one full variant ---- */
function computeVariant(D, mode, tmeta, dirOverride) {
  const { rows, granularAA } = buildRows(D, mode);
  const d = derive(rows);
  const teams = d.teams;
  const groupInfo = applyGroupings(teams);
  // manual grouping overrides win over the gap-detected tier
  for (const t of teams) {
    const o = D.overrides.grouping.get(t.school);
    if (o?.grouping && GROUPS.includes(o.grouping)) t.grouping = o.grouping;
  }
  // the 10-year twin rating + trajectory, consistent with THIS variant's headline rating
  attachTrend(teams, D, tmeta, d.pctByKey, dirOverride);

  const byGroup = Object.fromEntries(GROUPS.map((g) => [g, teams.filter((t) => t.grouping === g)]));
  const benchmark = computeBenchmark(teams);

  const medians = {};
  const recentMedians = {}; // per group: median of each stat over the last TREND_RECENT_YEARS seasons
  const ratingMed = {}; // per group: median headline rating and median 10-year rating
  const recentRatingMed = {};
  for (const g of GROUPS) {
    medians[g] = Object.fromEntries(STAT_KEYS.map((k) => [k, median(byGroup[g].map((x) => x.raw[k]))]));
    recentMedians[g] = Object.fromEntries(STAT_KEYS.map((k) => [k, median(byGroup[g].map((x) => x.recentRaw[k]))]));
    recentMedians[g].games = median(byGroup[g].map((x) => x.recentGames));
    const wps = byGroup[g].map((x) => x.recentRaw.winPct).sort((a, b) => a - b);
    recentMedians[g].winPctLo = wps[0] ?? 0;
    recentMedians[g].winPctHi = wps.at(-1) ?? 0;
    recentMedians[g].firstRoundMean = mean(byGroup[g].map((x) => x.recentRaw.firstRoundPicks));
    // tangible last-decade tier norms (winning seasons, top-10 teams, ...)
    for (const fk of ['winningSeasons', 'tenWinSeasons', 'rankedSeasons', 'top10Seasons', 'top25Seasons', 'titles', 'consensusAA', 'firstRoundPicks']) {
      recentMedians[g][fk] = median(byGroup[g].map((x) => x.recentFacts[fk]));
    }
    ratingMed[g] = median(byGroup[g].map((x) => x.rating));
    recentRatingMed[g] = median(byGroup[g].map((x) => x.recentRating));
  }

  for (const t of teams) {
    const trO = D.overrides.trend.get(t.school);
    t.note = trO && trO.note !== '' && trO.note != null ? trO.note.trim() : trajectoryNote(t);
    t.trajectoryTooltip = trO?.tooltip ? trO.tooltip : trajectoryTooltip(t);
    t.standing = D.overrides.standing.get(t.school)?.text
      || standingBlurb(t, benchmark, medians, recentMedians, ratingMed);
    t.pathForward = D.overrides.pathForward.get(t.school)?.text
      || pathForwardBlurb(t, medians, recentMedians, D.apSummary.toYear, { ...t.recentRaw, games: t.recentGames });
  }
  const counts = GROUPS.map((g) => byGroup[g].length);
  return {
    teams, ...d, benchmark, groupInfo: { ...groupInfo, counts }, granularAA,
  };
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
    const get = (t) => t.variants?.official ?? t;
    if (get(t0)?.rating == null) return null;
    return Object.fromEntries(p.teams.map((t) => [t.school, { ratingRank: get(t).ratingRank, rating: get(t).rating }]));
  } catch {
    return null;
  }
}

/* ---- point-in-time snapshots -------------------------------------------------
 *   "If the site had been built in the {YEAR} off-season, what would it look
 *   like?" The {YEAR} off-season means every season through {YEAR}-1 — the 1960
 *   snapshot covers everything up to and including the 1959 season. Each rating
 *   stat is re-totalled over that window and the exact same rank → trim → mean →
 *   tier pipeline runs. Experimental, and it leans on the per-season data hardest
 *   at the early marks: AP-poll data starts in 1936, and for the ~35 programs
 *   whose pre-1936 wins are a single lumped total that lump lands on 1935, so it
 *   is in every snapshot but is not spread across those seasons. ---- */
const TIMEPOINT_YEARS = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

// hand-set tier boundaries for a snapshot — the historical field is flatter than
// today's, so the automatic gap detection occasionally draws the blue-blood line
// a rank or two off where the era's actually sat. Each array = the rank AFTER
// which a new tier starts (Blue Bloods, Fringe, Contenders, Powers, Brands).
const TIMEPOINT_TIERS = {
  1970: [4, 9, 20, 30, 47], // Blue Bloods 4 · Fringe = Texas, Oklahoma, Minnesota, Alabama, Tennessee
  2000: [8, 10, 22, 32, 50], // Blue Bloods 8 · Fringe = Penn State, Tennessee
};

/** the ten rating stats as of the YEAR off-season — i.e. every season through
 *  YEAR-1 (the 1960 off-season = everything up to and including the 1959 season) */
function asOfRaw(D, school, Y) {
  const S = Y - 1; // last season included
  const ap = D.apSummary.teams[school] || D.apSummary.teams[revAlias(school)] || {};
  const dr = D.draft.get(school) || { perSeason: {}, firstBySeason: {} };
  const rf = D.recFull.get(school) || { perYear: {} };
  const A = D.aa.get(school) || { perYear: {} };
  const tY = D.titleYears.get(school) || [];
  const cY = D.confTitleYears.get(school) || [];
  const le = (obj) => Object.entries(obj || {})
    .reduce((s, [y, v]) => s + (Number(y) <= S ? Number(v || 0) : 0), 0);
  const leAA = (key) => Object.entries(A.perYear)
    .reduce((s, [y, v]) => s + (Number(y) <= S ? (v[key] || 0) : 0), 0);

  let w = 0; let l = 0; let t = 0;
  for (const [y, s] of Object.entries(rf.perYear)) {
    if (Number(y) > S) continue;
    w += s.w; l += s.l; t += s.t;
  }
  const g = w + l + t;
  return {
    allTimeWins: w,
    winPct: g ? (w + 0.5 * t) / g : 0,
    nationalTitles: tY.filter((y) => y <= S).length,
    conferenceTitles: cY.filter((y) => y <= S).length,
    consensusAA: leAA('c'),
    unanimousAA: leAA('u'),
    nflDraftPicks: le(dr.perSeason),
    firstRoundPicks: le(dr.firstBySeason),
    weeksApPoll: le(ap.perSeason),
    weeksApTop10: le(ap.perSeasonTop10),
  };
}

/** earliest GAME-LEVEL season on record (from recFull). The synthetic pre-1936
 *  "lump" row sits on 1935 for every NCAA-record-book program regardless of when
 *  it actually started playing — James Madison (1972), Boise State (1968) and
 *  Delaware (no per-season game data at all) all carry one — so it is not
 *  evidence the program existed that early. Only seasons from 1936 on, when real
 *  per-season records begin, count here. null = no game-level season on record. */
function firstSeasonOf(rf) {
  let min = Infinity;
  for (const [y, s] of Object.entries(rf?.perYear || {})) {
    if (Number(y) <= 1935) continue; // skip the synthetic pre-1936 lump
    if ((s.w + s.l + s.t) > 0 && Number(y) < min) min = Number(y);
  }
  return Number.isFinite(min) ? min : null;
}

/** a full { meta, teams } payload for the site as of the YEAR off-season
 *  (every season through YEAR-1) */
function buildTimepoint(D, Y) {
  const S = Y - 1; // last season included — "the {S}–{Y} season"
  // a program is only in the snapshot if we hold at least one season of record
  // for it before YEAR — otherwise it either didn't exist yet (South Alabama,
  // Charlotte, …) or we have nothing to rate it on, and a "tied at zero"
  // percentile would hand it a phantom mid-pack rating.
  const eligible = D.teams.filter((t) => {
    const fs = firstSeasonOf(D.recFull.get(t.school));
    return fs != null && fs < Y;
  });
  const omitted = D.teams.length - eligible.length;

  const rows = eligible.map((t) => ({
    school: t.school,
    slug: t.slug,
    primary: t.primary_hex,
    secondary: t.secondary_hex,
    formerFcs: String(t.former_fcs) === '1',
    conference: (() => {
      const c = D.conferences[t.school] || t.conference || 'Independent';
      return CONF_DISPLAY[c] || c;
    })(),
    heismans: (D.heismanYears.get(t.school) || []).filter((y) => y <= S).length,
    raw: asOfRaw(D, t.school, Y),
  }));

  const d = derive(rows);
  const teams = d.teams;
  let gi;
  if (TIMEPOINT_TIERS[Y]) {
    // fixed rank boundaries → rating thresholds (midpoint of the gap at each rank)
    const desc = [...teams].sort((a, b) => a.ratingRank - b.ratingRank).map((t) => t.rating);
    const boundaries = TIMEPOINT_TIERS[Y];
    const thresholds = boundaries.map((b) => (desc[b - 1] + desc[b]) / 2);
    const assign = (r) => thresholds.filter((th) => r < th).length;
    for (const t of teams) t.grouping = GROUPS[assign(t.rating)] || GROUPS.at(-1);
    gi = {
      boundaries,
      gaps: boundaries.map((b) => desc[b - 1] - desc[b]),
      thresholds,
      counts: GROUPS.map((g) => teams.filter((t) => t.grouping === g).length),
    };
  } else {
    gi = applyGroupings(teams); // mutates teams[].grouping
  }
  const benchmark = computeBenchmark(teams);

  const outTeams = [...teams]
    .sort((a, b) => a.ratingRank - b.ratingRank)
    .map((t) => {
      // "insufficient" here = not a major program yet at this point, so its rating
      // is greyed rather than trusted. Two ways to qualify: a thin win total, or a
      // résumé with no national footprint at all by then — never AP-ranked, never
      // an NFL draft pick, no national title. That catches the small-college era
      // of programs like Appalachian State / Georgia Southern, whose pre-1936 win
      // lump inflates the count without meaning they belonged in the national
      // conversation. (Season counts can't be used — the lump is a single row.)
      const thin = t.raw.allTimeWins < 40
        || (t.raw.weeksApPoll === 0 && t.raw.nflDraftPicks === 0 && t.raw.nationalTitles === 0);
      return {
      school: t.school, slug: t.slug, conference: t.conference,
      primary: t.primary, secondary: t.secondary, formerFcs: t.formerFcs, heismans: t.heismans,
      stats: t.raw, pct: t.pct, critScore: t.critScore, composite: t.composite,
      rating: t.rating, overall: t.overall, ratingRank: t.ratingRank, grouping: t.grouping,
      trimmedLow: t.trimmedLow, trimmedHigh: t.trimmedHigh,
      // the twin-rating slots the panel/blurbs expect — a snapshot has no "recent"
      // window, so they mirror the snapshot itself
      recentRating: t.rating, recentPct: t.pct, recentCritScore: t.critScore, recentStats: t.raw,
      // a barely-there program at this point is greyed, not trusted
      trend: {
        score: 0, dir: 'even', recentSeasons: 0, totalSeasons: 0,
        insufficient: thin, recentRange: '', fullRange: '',
      },
      standing: `A point-in-time view — where ${t.school} stood after the ${S}–${Y} season, `
        + 'computed only from what had happened by then.',
      pathForward: 'Pick “Now” in the year selector for the present-day rating, trajectory and path forward.',
      identity: `#${t.ratingRank} · ${t.rating.toFixed(1)} rating · ${t.grouping} · ${Y} off-season`,
      label: {
        standard: `As of the ${Y} off-season`,
        trajectoryTooltip: `A static snapshot after the ${S}–${Y} season — trajectory isn’t computed for historical points in time.`,
        personal: D.blurbs.get(t.school) || '',
      },
      projectionScenario: null,
      // wins toggle is inert in a snapshot; keep the shape the client type expects
      variants: {},
      };
    });

  const statDist = Object.fromEntries(STAT_KEYS.map((k) => {
    const xs = teams.map((x) => x.raw[k]);
    const mu = mean(xs);
    return [k, { mean: mu, stddev: stddev(xs, mu), min: Math.min(...xs), max: Math.max(...xs) }];
  }));

  const meta = {
    generatedAt: new Date().toISOString(),
    model: 'percentile-trimmed-mean',
    modelBlurb: 'Rank each of the ten stats within FBS, drop each program’s single best and single worst percentile, average the other eight.',
    timepoint: Y,
    timepointCount: rows.length,
    timepointOmitted: omitted,
    timepointNote: `${rows.length} programs with a season on record before ${Y}`
      + (omitted ? `; ${omitted} omitted (founded later, or no games on file yet)` : '')
      + `. Every stat re-totalled from seasons through ${S}. AP-poll data starts in 1936, and a few programs’ pre-1936 wins are one lumped figure, so the earliest snapshots run light for them.`,
    trendRecentFraction: TREND_RECENT_FRAC,
    trendRecentYears: TREND_RECENT_YEARS,
    trendDeltaPoints: TREND_DELTA_POINTS,
    trendSurgePoints: TREND_SURGE_POINTS,
    trendMinHistory: TREND_MIN_HISTORY,
    latestSeason: S,
    latestChampion: null,
    conferenceYear: Y,
    titleSelectors: [...TITLE_SELECTORS],
    sources: { store: 'point-in-time snapshot of data/staging', network: false },
    provenance: PROVENANCE,
    granular: {
      allAmericans: 'per-year consensus selections through the snapshot year',
      nationalTitles: 'per-year, recognized selectors only, through the snapshot year',
      conferenceTitles: 'per-year, through the snapshot year',
    },
    tierDescriptions: D.tierDesc,
    blueBloodBenchmark: benchmark,
    dataRange: `everything through the ${S}–${Y} season`,
    groupings: GROUPS,
    tierBoundaries: gi.boundaries,
    tierGaps: gi.gaps,
    tierRatingThresholds: gi.thresholds,
    tierMinRating: TIER_MIN_RATING,
    tierMaxSpan: TIER_MAX_SPAN,
    stats: statDist,
    composites: d.composites,
    overall: d.overall,
  };

  return { meta, teams: outTeams, counts: gi.counts };
}

function main() {
  loadConfig();
  const D = load();
  const tmeta = trendMeta(D); // season-count metadata; the 10-year twin rating is built per variant
  const dirOverride = D.overrides.trend; // _blurb_trajectory.csv dir column

  const asPlayed = computeVariant(D, 'asPlayed', tmeta, dirOverride);
  const official = computeVariant(D, 'official', tmeta, dirOverride);

  const benchmark = official.benchmark;
  const sliderMax = Object.fromEntries(STAT_KEYS.map((k) => [
    k, k === 'winPct' ? 1 : Math.ceil(Math.max(...official.teams.map((t) => t.raw[k])) * 1.5),
  ]));

  // per-team payload: shared fields top-level, wins-dependent fields per variant.
  // the DEFAULT view is `official` — it is what gets mirrored onto the top level.
  const asPlayedBy = new Map(asPlayed.teams.map((t) => [t.school, t]));
  const teams = official.teams.map((o) => {
    const a = asPlayedBy.get(o.school);
    const variantFields = (t) => ({
      stats: t.raw,
      pct: t.pct,
      critScore: t.critScore,
      composite: t.composite,
      rating: t.rating,
      overall: t.overall,
      ratingRank: t.ratingRank,
      grouping: t.grouping,
      // the 10-year twin: same formula, last TREND_RECENT_YEARS seasons only
      recentRating: t.recentRating,
      recentPct: t.recentPct,
      recentCritScore: t.recentCritScore,
      recentStats: t.recentRaw,
      standing: t.standing,
      pathForward: t.pathForward,
      note: t.note,
      // team-panel identity line — overridable in _blurb_identity_line.csv
      identity: D.overrides.identity.get(t.school)?.text
        || `#${t.ratingRank} · ${t.rating.toFixed(1)} rating · ${t.grouping}`,
      trimmedLow: t.trimmedLow,
      trimmedHigh: t.trimmedHigh,
    });
    return {
      school: o.school,
      slug: o.slug,
      conference: o.conference,
      primary: o.primary,
      secondary: o.secondary,
      formerFcs: o.formerFcs,
      heismans: o.heismans,
      trend: o.trend,
      label: {
        // ranked-list sub-line: the trajectory, described — no grouping (the section header has it).
        // Overridable in _blurb_ranking_row_subline.csv.
        standard: D.overrides.subline.get(o.school)?.text || (o.trend.insufficient
          ? 'Too new to chart — under 30 seasons on record'
          : {
            // a doubled-arrow (emphatic) move reads as Surging / Collapsing
            up: `${o.trend.strong ? 'Surging' : 'Ascending'}${o.note ? ` — ${o.note}` : ''}`,
            down: `${o.trend.strong ? 'Collapsing' : 'Descending'}${o.note ? ` — ${o.note}` : ''}`,
            even: 'Level with its all-time standing',
          }[o.trend.dir]),
        // trajectory hover — overridable in _blurb_trajectory.csv (tooltip column)
        trajectoryTooltip: o.trajectoryTooltip,
        personal: D.blurbs.get(o.school) || '',
      },
      // the concrete numbers behind the projection blurb + the what-if "Preview" run
      // (from the official view; only for programs in the interesting band)
      projectionScenario: o.rating >= TIER_MIN_RATING
        ? projectionScenario(o.raw, benchmark, sliderMax)
        : null,
      // default view is `official` — mirror onto the top level so components read team.rating directly
      ...variantFields(o),
      variants: { official: variantFields(o), asPlayed: variantFields(a) },
    };
  });

  const previous = readPrevious();
  const champ = D.apSummary.finalNo1?.[String(D.apSummary.toYear)];

  const meta = {
    generatedAt: new Date().toISOString(),
    model: 'percentile-trimmed-mean',
    modelBlurb: 'Rank each of the ten stats within FBS, drop each program’s single best and single worst percentile, average the other eight.',
    trendRecentFraction: TREND_RECENT_FRAC,
    trendRecentYears: TREND_RECENT_YEARS,
    trendDeltaPoints: TREND_DELTA_POINTS,
    trendSurgePoints: TREND_SURGE_POINTS,
    trendMinHistory: TREND_MIN_HISTORY,
    latestSeason: D.apSummary.toYear,
    latestChampion: champ ? alias(champ) : null,
    conferenceYear: fs.existsSync(path.join(STAGING, 'conferences.json')) ? readJson(path.join(STAGING, 'conferences.json')).year : null,
    titleSelectors: [...TITLE_SELECTORS],
    sources: { store: 'data/staging', network: false },
    provenance: PROVENANCE,
    tierDescriptions: D.tierDesc,
    blueBloodBenchmark: benchmark,
    granular: {
      allAmericans: `per-player list for ${official.granularAA.consensus}/${official.granularAA.consensus + official.granularAA.summaryC} programs; the rest (no consensus selections) sit at zero.`,
      nationalTitles: 'per-year, one row per selector (data/staging/_staging_championships.csv)',
      conferenceTitles: `per-year for ${D.confTitles.size}/136 programs (_staging_conference_titles.csv); the rest use a summary total`,
    },
    dataRange: `AP poll ${AP_FROM}–${D.apSummary.toYear}; wins season-by-season from 1869; All-Americans from 1898; titles from 1901; drafts from 1936 — our own compilation`,
    groupings: GROUPS,
    // meta distributions reflect the DEFAULT (official) variant
    tierBoundaries: official.groupInfo.boundaries,
    tierGaps: official.groupInfo.gaps,
    tierRatingThresholds: official.groupInfo.thresholds,
    tierMinRating: TIER_MIN_RATING,
    tierMaxSpan: TIER_MAX_SPAN,
    stats: Object.fromEntries(STAT_KEYS.map((k) => {
      const xs = official.teams.map((t) => t.raw[k]);
      const mu = mean(xs);
      return [k, { mean: mu, stddev: stddev(xs, mu), min: Math.min(...xs), max: Math.max(...xs) }];
    })),
    composites: official.composites,
    overall: official.overall,
    previous: previous || undefined,
  };

  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.mkdirSync(SNAP, { recursive: true });
  const payload = { meta, teams };
  fs.writeFileSync(path.join(PUBLIC, 'teams.json'), JSON.stringify(payload));
  fs.writeFileSync(path.join(PUBLIC, 'meta.json'), JSON.stringify(meta, null, 2));
  fs.writeFileSync(path.join(SNAP, `data-${new Date().toISOString().slice(0, 10)}.json`), JSON.stringify(payload));

  // point-in-time snapshots: public/data/timepoints/{YEAR}.json
  const tpDir = path.join(PUBLIC, 'timepoints');
  fs.mkdirSync(tpDir, { recursive: true });
  const tpLog = [];
  for (const Y of TIMEPOINT_YEARS) {
    const tp = buildTimepoint(D, Y);
    fs.writeFileSync(path.join(tpDir, `${Y}.json`), JSON.stringify({ meta: tp.meta, teams: tp.teams }));
    tpLog.push(`${Y}:${tp.teams[0].school}`);
  }
  fs.writeFileSync(path.join(tpDir, 'index.json'), JSON.stringify({ years: TIMEPOINT_YEARS }));
  console.log(`  timepoints → ${TIMEPOINT_YEARS.length} snapshots (${tpLog.join(' · ')})`);

  // human-readable dump of every derived string — review here, override in data/staging/_blurb_*.csv
  const dirWord = (t) => t.trend.insufficient ? 'Too new' : t.trend.strong
    ? (t.trend.dir === 'up' ? 'Surging' : 'Collapsing')
    : { up: 'Ascending', down: 'Descending', even: 'Maintaining' }[t.trend.dir];
  fs.writeFileSync(
    path.join(PUBLIC, 'breakdown.csv'),
    writeRecords(
      ['school', 'rating', 'ratingRank', 'grouping', 'trajectory', 'note', 'standing', 'pathForward', 'tagline'],
      [...teams]
        .sort((a, b) => a.ratingRank - b.ratingRank)
        .map((t) => ({
          school: t.school,
          rating: t.rating.toFixed(1),
          ratingRank: t.ratingRank,
          grouping: t.grouping,
          trajectory: dirWord(t),
          note: t.note,
          standing: t.standing,
          pathForward: t.pathForward,
          tagline: t.label.personal,
        })),
    ),
  );

  /* ---- build log ---- */
  const gi = official.groupInfo;
  console.log(`\n✓ ${teams.length} teams → public/data/teams.json  (model: ${meta.model}, no network)`);
  console.log(`  tier boundaries after ranks: ${gi.boundaries.map((b, i) => `#${b} (gap ${gi.gaps[i].toFixed(1)})`).join(' | ')}`);
  console.log(`  grouping counts: ${GROUPS.map((g, i) => `${g} ${gi.counts[i]}`).join(' · ')}`);
  console.log(`  ${AP_FROM} AP champion → latest: ${meta.latestChampion}`);
  console.log('  Blue Blood Rating — top 12 (NCAA official, the default view):');
  for (const t of [...official.teams].sort((a, b) => a.ratingRank - b.ratingRank).slice(0, 12)) {
    console.log(`   ${String(t.ratingRank).padStart(2)}. ${t.school.padEnd(15)} ${t.rating.toFixed(1).padStart(5)}  ${t.trend.dir.padEnd(5)} ${t.grouping.padEnd(20)} ${t.note}`);
  }
  const dirs = official.teams.reduce((m, t) => ((m[t.trend.dir] = (m[t.trend.dir] || 0) + 1), m), {});
  console.log('  trend split:', dirs);
  const surging = official.teams.filter((t) => t.trend.strong)
    .sort((a, b) => a.trend.delta - b.trend.delta);
  console.log(`  emphatic (|Δ| ≥ ${TREND_SURGE_POINTS}):`,
    surging.map((t) => `${t.trend.dir === 'up' ? '▲▲' : '▼▼'} ${t.school} ${t.trend.delta > 0 ? '+' : ''}${t.trend.delta}`).join(' · ') || '(none)');
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
