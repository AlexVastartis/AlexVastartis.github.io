/**
 * Builds public/data/teams.json (+ meta.json + a dated snapshot).
 *
 *   data/manual/teams.csv        identity: slug, conference, colors, former-FCS
 *   data/manual/stats_manual.csv every raw stat — the fallback, and the permanent
 *                                source for honors (titles, All-Americans, Heisman)
 *   CollegeFootballData API      when CFBD_API_KEY is set: all-time wins/record,
 *                                AP-poll weeks, NFL-draft counts, + per-season data
 *                                for the trend indicator and the year-over-year diff
 *
 * Overall model: "percentile-trimmed-mean" (Model F). Each raw stat -> within-FBS
 * percentile; the two stats in a criterion are averaged; the five criteria are
 * combined with a 40% trimmed mean (drop each program's best & worst criterion).
 *
 * Run: npm run build:data
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords } from './lib/csv.mjs';
import {
  hasKey, CURRENT_SEASON, LATEST_SEASON, CURRENT_YEAR,
  getApBySeason, getRecordsBySeason, getDraftBySeason,
} from './fetch-cfbd.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const MANUAL = path.join(REPO, 'data/manual');
const PUBLIC = path.join(REPO, 'public/data');
const SNAP = path.join(REPO, 'data/snapshots');

const AP_FROM = 1936;
const RECORDS_FROM = 1900;
const DRAFT_FROM = 1936;
const TREND_WINDOW = 15;

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

/* ---- stats helpers ---- */
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const stddev = (xs, mu = mean(xs)) =>
  xs.length ? Math.sqrt(xs.reduce((a, b) => a + (b - mu) ** 2, 0) / xs.length) : 0;
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

function loadManual() {
  const teams = readRecords(fs.readFileSync(path.join(MANUAL, 'teams.csv'), 'utf8'));
  const stats = readRecords(fs.readFileSync(path.join(MANUAL, 'stats_manual.csv'), 'utf8'));
  const statBySchool = new Map(stats.map((s) => [s.school, s]));
  let blurbs = new Map();
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
      manualRaw: { ...raw },
      trend: null, // filled by applyCfbd
    };
  });
  return { rows, blurbs };
}

/**
 * Overlay CFBD figures for a given cutoff season. Mutates rows[].raw and, when
 * cutoff === CURRENT_SEASON, rows[].trend. Returns a notes array.
 */
async function applyCfbd(rows, cfbd, cutoffSeason, notes) {
  if (!cfbd) return;
  const bySchool = new Map(rows.map((r) => [r.school, r]));
  const resolve = (name) => bySchool.get(CFBD_ALIAS[name] || name) || null;
  const isCurrent = cutoffSeason === LATEST_SEASON;

  // --- AP poll ---
  let apHit = 0;
  const apMissed = [];
  for (const [name, v] of cfbd.ap) {
    const row = resolve(name);
    if (!row) {
      apMissed.push(name);
      continue;
    }
    let weeksPoll = 0;
    let weeksTop10 = 0;
    for (const [y, w] of Object.entries(v.perSeason)) {
      if (Number(y) <= cutoffSeason) weeksPoll += w;
    }
    for (const [y, w] of Object.entries(v.perSeasonTop10 || {})) {
      if (Number(y) <= cutoffSeason) weeksTop10 += w;
    }
    row.raw.weeksApPoll = weeksPoll;
    row.raw.weeksApTop10 = weeksTop10;
    apHit += 1;
  }

  // --- records ---
  let recHit = 0;
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

  // --- draft (calendar year; 2026 draft already happened) ---
  const draftCutoff = cutoffSeason + 1;
  let drHit = 0;
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

  if (isCurrent) {
    notes.push(`CFBD: AP poll ${apHit}, records ${recHit}, draft ${drHit} programs updated (through ${cutoffSeason}).`);
    const neverRanked = rows.filter((r) => !r.raw.weeksApPoll).length;
    notes.push(`${neverRanked} current programs have never appeared in the AP poll.`);

    // --- trend: two independent signals ---
    //   form  = last RECENT seasons vs. the BASE seasons before that (AP weeks + win%)
    //   decay = best 15-yr AP window the program ever had  −  its recent rate
    const RECENT = 10;
    const BASE = 20;
    const rEnd = LATEST_SEASON;
    const rStart = LATEST_SEASON - RECENT + 1;
    const bEnd = rStart - 1;
    const bStart = bEnd - BASE + 1;
    const rateIn = (perSeason, a, b, pick) => {
      let sum = 0;
      for (let y = a; y <= b; y += 1) sum += pick(perSeason[y]);
      return sum / (b - a + 1);
    };
    // best 15-year AP window a program ever had, to catch "faded giant" decay
    const bestApWindow = (apPS) => {
      let best = 0;
      for (let start = AP_FROM; start <= rEnd - 14; start += 1) {
        let s = 0;
        for (let y = start; y < start + 15; y += 1) s += apPS[y] || 0;
        best = Math.max(best, s / 15);
      }
      return best;
    };
    // best 20-year win% window ever (records go back to 1900) — catches pre-AP dynasties
    const bestWinPctWindow = (recPS) => {
      let best = 0;
      for (let start = RECORDS_FROM; start <= rEnd - 19; start += 1) {
        let w = 0;
        let g = 0;
        for (let y = start; y < start + 20; y += 1) {
          w += recPS[y]?.wins || 0;
          g += recPS[y]?.games || 0;
        }
        if (g >= 120) best = Math.max(best, w / g);
      }
      return best;
    };

    const perc = [];
    const win = [];
    const decay = [];
    const winDecay = [];
    for (const r of rows) {
      const ap = cfbd.ap.get(CFBD_ALIAS[r.school] || r.school) || cfbd.ap.get(r.school);
      const rec = cfbd.records.get(CFBD_ALIAS[r.school] || r.school) || cfbd.records.get(r.school);
      const apPS = ap?.perSeason || {};
      const recPS = rec?.perSeason || {};
      const recentWk = rateIn(apPS, rStart, rEnd, (w) => w || 0);
      const baseWk = rateIn(apPS, bStart, bEnd, (w) => w || 0);
      const percRaw = recentWk - baseWk;
      const decayRaw = bestApWindow(apPS) - recentWk; // >0 when off the AP ceiling

      const wp = (a, b) => {
        let w = 0;
        let g = 0;
        for (let y = a; y <= b; y += 1) {
          w += recPS[y]?.wins || 0;
          g += recPS[y]?.games || 0;
        }
        return g ? w / g : null;
      };
      const rWp = wp(rStart, rEnd);
      const bWp = wp(bStart, bEnd);
      const winRaw = rWp != null && bWp != null ? rWp - bWp : 0;
      const winDecayRaw = rWp != null ? Math.max(0, bestWinPctWindow(recPS) - rWp) : 0;

      r._trendRaw = { percRaw, winRaw, decayRaw, winDecayRaw, recentWk, baseWk };
      perc.push(percRaw);
      win.push(winRaw);
      decay.push(decayRaw);
      winDecay.push(winDecayRaw);
    }
    const zPerc = zfun(perc);
    const zWin = zfun(win);
    const zApDecay = zfun(decay);
    const zWinDecay = zfun(winDecay);
    for (const r of rows) {
      const zp = zPerc(r._trendRaw.percRaw);
      const zw = zWin(r._trendRaw.winRaw);
      const zd = 0.6 * zApDecay(r._trendRaw.decayRaw) + 0.4 * zWinDecay(r._trendRaw.winDecayRaw);
      const formZ = 0.6 * zp + 0.4 * zw;
      // material gate so tiny never-ranked programs don't flip on noise
      const material =
        Math.abs(r._trendRaw.percRaw) >= 1.5 ||
        Math.abs(r._trendRaw.winRaw) >= 0.05 ||
        r._trendRaw.decayRaw >= 4 ||
        r._trendRaw.winDecayRaw >= 0.08;
      r.trend = { score: formZ, formZ, zPerc: zp, zWin: zw, zDecay: zd, material, dir: 'even' };
      delete r._trendRaw;
    }
  }
}

function derive(rows) {
  const dist = {};
  const pct = {};
  const z = {};
  for (const key of STAT_KEYS) {
    const xs = rows.map((r) => r.raw[key]);
    const mu = mean(xs);
    dist[key] = { mean: mu, stddev: stddev(xs, mu), min: Math.min(...xs), max: Math.max(...xs) };
    pct[key] = percentileFn([...xs].sort((a, b) => a - b));
    z[key] = zfun(xs);
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
      critScore[ck] = (pt[a] + pt[b]) / 2; // 0..100
    }
    const critArr = CK.map((c) => critScore[c]);
    const rating = trimmean(critArr, 0.4); // 0..100
    const spread = stddev(critArr); // 0..~20
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

  // overall = z-score of the rating; rank
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
  return { teams, stats: dist, composites, overall };
}

/* ---- labels + trend direction (mirrors src/config/labels.ts) ---- */
function statusTier(t) {
  if (t.ratingRank <= 6) return 'Blue Blood';
  if (DEBATED.includes(t.school) || t.rating >= 88) return 'Blue Blood Adjacent';
  if (t.rating >= 72) return 'National Brand';
  return 'The Field';
}
function trajectory(dir) {
  return { up: 'Ascending', down: 'Receding', emerging: 'Emerging', even: 'Holding' }[dir];
}
/**
 * Trend direction from the poll-era signals. `formZ` is recent-decade form vs. the
 * program's prior-20-year baseline; `zDecay` is how far a program sits below its
 * own all-time ceiling (AP weeks + win %). Sparse by design — most land `even`.
 * (Pre-1936 dynasties, e.g. Minnesota, are not fully captured: the calculation
 * only sees the poll era, where they have been steadily mid.)
 */
function finishTrend(teams) {
  for (const t of teams) {
    const { formZ = 0, zPerc = 0, zDecay = 0, material = true } = t.trend;
    let dir = 'even';
    if (material && formZ >= 1.1 && zPerc >= 0.5) dir = 'up';
    else if (material && formZ < 0.5 && (formZ <= -1.1 || zDecay >= 1.5)) dir = 'down';
    if (dir === 'up' && t.ratingRank > 45 && zPerc >= 1.8) dir = 'emerging';
    t.trend = { score: Number(formZ.toFixed(3)), dir };
  }
}
function applyLabels(teams, blurbs) {
  for (const t of teams) {
    const tier = statusTier(t);
    let suffix = '';
    if (t.spread >= 9) {
      const worst = CK.reduce((w, c) => (t.critScore[c] < t.critScore[w] ? c : w), CK[0]);
      suffix =
        worst === 'championships' && (t.conference === 'Independent' || t.critScore.championships < 60)
          ? ' · portfolio gap'
          : ' · peak-driven';
    }
    const standard = `${tier} · ${trajectory(t.trend.dir)}${suffix}`;
    t.label = { standard, personal: blurbs.get(t.school) || standard };
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
    if (!p.teams?.[0] || p.teams[0].rating == null) return null;
    return Object.fromEntries(p.teams.map((t) => [t.school, { ratingRank: t.ratingRank, rating: t.rating }]));
  } catch {
    return null;
  }
}

async function main() {
  const notes = [];
  const { rows, blurbs } = loadManual();

  let cfbd = null;
  if (hasKey()) {
    console.log('Fetching CFBD history (cached per year under data/snapshots/cfbd/) …');
    const [ap, records] = await Promise.all([
      getApBySeason(AP_FROM, LATEST_SEASON),
      getRecordsBySeason(RECORDS_FROM, LATEST_SEASON),
    ]);
    await getDraftBySeason(DRAFT_FROM, CURRENT_YEAR); // populates the per-year cache
    cfbd = { ap, records, draftByYear: await draftPerYear() };
  } else {
    notes.push('CFBD_API_KEY not set — manual sheet values only; trend indicator flat.');
  }

  // "now" dataset (through the latest completed season)
  await applyCfbd(rows, cfbd, LATEST_SEASON, notes);
  const nowRows = rows.map((r) => ({ ...r, raw: { ...r.raw }, trend: r.trend }));
  const nowDerived = derive(nowRows);
  finishTrend(nowDerived.teams);
  applyLabels(nowDerived.teams, blurbs);

  // "prior" dataset (through the previous season) for the year-over-year note
  let previous = readPreviousSnapshot();
  if (!previous && cfbd) {
    const priorRows = loadManual().rows;
    await applyCfbd(priorRows, cfbd, LATEST_SEASON - 1, []);
    const priorDerived = derive(priorRows);
    previous = Object.fromEntries(
      priorDerived.teams.map((t) => [t.school, { ratingRank: t.ratingRank, rating: t.rating }]),
    );
  }

  const missingLogo = nowDerived.teams
    .filter((t) => !t.slug || !fs.existsSync(path.join(REPO, 'public/logos', `${t.slug}.svg`)) &&
      !fs.existsSync(path.join(REPO, 'public/logos', `${t.slug}.png`)))
    .map((t) => t.school);

  const meta = {
    generatedAt: new Date().toISOString(),
    model: 'percentile-trimmed-mean',
    trendWindowYears: TREND_WINDOW,
    sources: { cfbd: Boolean(cfbd), manual: true },
    dataRange: cfbd
      ? `AP poll ${AP_FROM}–${LATEST_SEASON} · records & draft via CollegeFootballData · honors from maintained sheets`
      : 'Blue Bloods.xlsx "BBR Raw" (through 2024 season)',
    stats: nowDerived.stats,
    composites: nowDerived.composites,
    overall: nowDerived.overall,
    previous: previous || undefined,
  };
  const payload = { meta, teams: nowDerived.teams };

  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.mkdirSync(SNAP, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC, 'teams.json'), JSON.stringify(payload));
  fs.writeFileSync(path.join(PUBLIC, 'meta.json'), JSON.stringify(meta, null, 2));
  fs.writeFileSync(
    path.join(SNAP, `data-${new Date().toISOString().slice(0, 10)}.json`),
    JSON.stringify(payload),
  );

  console.log(`\n✓ ${nowDerived.teams.length} teams → public/data/teams.json  (model: ${meta.model})`);
  for (const n of notes) console.log(`  · ${n}`);
  if (missingLogo.length) console.log(`  ! missing logo: ${missingLogo.join(', ')}`);
  const top = [...nowDerived.teams].sort((a, b) => a.ratingRank - b.ratingRank).slice(0, 12);
  console.log('  Blue Blood Rating — top 12:');
  for (const t of top) {
    console.log(
      `   ${String(t.ratingRank).padStart(2)}. ${t.school.padEnd(15)} ${t.rating.toFixed(1).padStart(5)}` +
        `  cons ${String(t.consistency).padStart(3)}  ${t.trend.dir.padEnd(8)}  ${t.label.standard}`,
    );
  }
  const dirs = nowDerived.teams.reduce((m, t) => ((m[t.trend.dir] = (m[t.trend.dir] || 0) + 1), m), {});
  console.log('  trend split:', dirs);
}

/** read the per-year draft cache files directly for cutoff math */
async function draftPerYear() {
  const dir = path.join(SNAP, 'cfbd');
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^draft-(\d{4})\.json$/);
    if (!m) continue;
    const year = Number(m[1]);
    const picks = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const p of picks) {
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
