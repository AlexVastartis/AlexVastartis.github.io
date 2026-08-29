/**
 * Builds public/data/teams.json (+ meta.json + a dated snapshot) from:
 *   - data/manual/teams.csv        (identity: slug, conference, colors, former-FCS)
 *   - data/manual/stats_manual.csv (all 10 raw stats — the fallback / source of truth)
 *   - CollegeFootballData.com API  (optional; overrides the auto-updatable stats when
 *                                   CFBD_API_KEY is set)
 *
 * Run: npm run build:data      (add CFBD_API_KEY=... to .env-style env for a live refresh)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords } from './lib/csv.mjs';
import { hasKey, getApWeeks, getDraft } from './fetch-cfbd.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const MANUAL = path.join(REPO, 'data/manual');
const PUBLIC = path.join(REPO, 'public/data');
const SNAP = path.join(REPO, 'data/snapshots');

/* ---- stat + category definitions (kept in sync with src/config/stats.ts) ---- */
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
const CATEGORIES = {
  perception: ['weeksApPoll', 'weeksApTop10'],
  wins: ['allTimeWins', 'winPct'],
  championships: ['nationalTitles', 'conferenceTitles'],
  allAmericans: ['consensusAA', 'unanimousAA'],
  nflDraft: ['nflDraftPicks', 'firstRoundPicks'],
};

/* ---- stats helpers ---- */
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const stddev = (xs, mu = mean(xs)) =>
  Math.sqrt(xs.reduce((a, b) => a + (b - mu) ** 2, 0) / xs.length);
function percentile(x, sortedAsc) {
  let lo = 0;
  let hi = sortedAsc.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sortedAsc[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  let hiEq = lo;
  while (hiEq < sortedAsc.length && sortedAsc[hiEq] === x) hiEq += 1;
  return ((lo + hiEq) / 2 / sortedAsc.length) * 100;
}

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
};

function loadManual() {
  const teams = readRecords(fs.readFileSync(path.join(MANUAL, 'teams.csv'), 'utf8'));
  const stats = readRecords(fs.readFileSync(path.join(MANUAL, 'stats_manual.csv'), 'utf8'));
  const statBySchool = new Map(stats.map((s) => [s.school, s]));
  return teams.map((t) => {
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
    };
  });
}

async function applyCfbd(rows, notes) {
  if (!hasKey()) {
    notes.push('CFBD_API_KEY not set — using manual sheet values for every stat.');
    return false;
  }
  const bySchool = new Map(rows.map((r) => [r.school, r]));
  const resolve = (cfbdName) => {
    if (CFBD_ALIAS[cfbdName]) return bySchool.get(CFBD_ALIAS[cfbdName]) || null;
    return bySchool.get(cfbdName) || null;
  };
  const now = new Date();
  const seasonYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;

  try {
    console.log(`Fetching AP poll history 1936–${seasonYear} …`);
    const ap = await getApWeeks(1936, seasonYear);
    let hit = 0;
    for (const [name, v] of ap) {
      const row = resolve(name);
      if (!row) continue;
      row.raw.weeksApPoll = v.weeksPoll;
      row.raw.weeksApTop10 = v.weeksTop10;
      hit += 1;
    }
    notes.push(`CFBD AP poll: updated ${hit} programs.`);

    console.log(`Fetching NFL draft picks 1967–${now.getFullYear()} …`);
    const draft = await getDraft(1967, now.getFullYear());
    let dhit = 0;
    for (const [name, v] of draft) {
      const row = resolve(name);
      if (!row) continue;
      row.raw.nflDraftPicks = v.picks;
      row.raw.firstRoundPicks = v.firstRound;
      dhit += 1;
    }
    notes.push(`CFBD draft: updated ${dhit} programs (all-time wins/record still from sheet).`);
    return true;
  } catch (e) {
    notes.push(`CFBD fetch failed (${e.message}) — fell back to manual sheet values.`);
    return false;
  }
}

function derive(rows) {
  const dist = {};
  const sorted = {};
  for (const key of STAT_KEYS) {
    const xs = rows.map((r) => r.raw[key]);
    const mu = mean(xs);
    dist[key] = { mean: mu, stddev: stddev(xs, mu), min: Math.min(...xs), max: Math.max(...xs) };
    sorted[key] = [...xs].sort((a, b) => a - b);
  }

  const teams = rows.map((r) => {
    const z = {};
    const pct = {};
    for (const key of STAT_KEYS) {
      const d = dist[key];
      z[key] = d.stddev === 0 ? 0 : (r.raw[key] - d.mean) / d.stddev;
      pct[key] = percentile(r.raw[key], sorted[key]);
    }
    const composite = {};
    for (const [ck, [a, b]] of Object.entries(CATEGORIES)) composite[ck] = (z[a] + z[b]) / 2;
    return {
      school: r.school,
      slug: r.slug,
      conference: r.conference,
      primary: r.primary,
      secondary: r.secondary,
      formerFcs: r.formerFcs,
      stats: r.raw,
      z,
      pct,
      composite,
    };
  });

  const composites = {};
  for (const ck of Object.keys(CATEGORIES)) {
    const xs = teams.map((t) => t.composite[ck]);
    const mu = mean(xs);
    composites[ck] = { mean: mu, stddev: stddev(xs, mu), min: Math.min(...xs), max: Math.max(...xs) };
  }

  // overall "Blue Blood" score: mean of the 5 category composites, re-standardized
  const overallRaw = teams.map((t) => mean(Object.keys(CATEGORIES).map((ck) => t.composite[ck])));
  const oMu = mean(overallRaw);
  const oSd = stddev(overallRaw, oMu);
  const overallAsc = [...overallRaw].sort((a, b) => a - b);
  teams.forEach((t, i) => {
    t.overall = oSd === 0 ? 0 : (overallRaw[i] - oMu) / oSd;
    t.overallPct = percentile(overallRaw[i], overallAsc);
  });
  const ranked = [...teams].sort((a, b) => b.overall - a.overall);
  ranked.forEach((t, i) => {
    t.overallRank = i + 1;
  });
  const overall = {
    mean: 0,
    stddev: stddev(teams.map((t) => t.overall)),
    min: Math.min(...teams.map((t) => t.overall)),
    max: Math.max(...teams.map((t) => t.overall)),
  };

  return { teams, stats: dist, composites, overall };
}

async function main() {
  const notes = [];
  const rows = loadManual();
  const usedCfbd = await applyCfbd(rows, notes);
  const { teams, stats, composites, overall } = derive(rows);

  // logo coverage check
  const missingLogo = teams
    .filter((t) => !t.slug || !fs.existsSync(path.join(REPO, 'public/logos', `${t.slug}.svg`)))
    .map((t) => t.school);

  const meta = {
    generatedAt: new Date().toISOString(),
    sources: { cfbd: usedCfbd, manual: true },
    dataRange: usedCfbd
      ? 'AP polls 1936–present (CFBD); all-time wins/record & honors from maintained sheets'
      : 'Blue Bloods.xlsx "BBR Raw" (through 2024 season)',
    stats,
    composites,
    overall,
  };
  const payload = { meta, teams };

  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.mkdirSync(SNAP, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC, 'teams.json'), JSON.stringify(payload));
  fs.writeFileSync(path.join(PUBLIC, 'meta.json'), JSON.stringify(meta, null, 2));
  const stamp = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(SNAP, `data-${stamp}.json`), JSON.stringify(payload));

  console.log(`\n✓ ${teams.length} teams → public/data/teams.json`);
  console.log(`  sources: ${usedCfbd ? 'CFBD + manual' : 'manual only'}`);
  for (const n of notes) console.log(`  · ${n}`);
  if (missingLogo.length) console.log(`  ! missing logo file: ${missingLogo.join(', ')}`);
  const top10 = [...teams].sort((a, b) => a.overallRank - b.overallRank).slice(0, 10);
  console.log('  Blue Blood ranking (top 10):');
  for (const t of top10) {
    console.log(`   ${String(t.overallRank).padStart(2)}. ${t.school.padEnd(16)} overall z ${t.overall.toFixed(2)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
