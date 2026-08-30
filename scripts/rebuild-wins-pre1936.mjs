/**
 * Rebuild the pre-1936 rows of data/staging/_staging_wins.csv.
 *
 *   node scripts/rebuild-wins-pre1936.mjs
 *
 * Two sources feed the pre-1936 era:
 *
 *  1. NCAA official (data/staging/_staging_wins_ncaa.csv) — for the ~31 programs
 *     the "FBS Records" book publishes an all-time won-loss line for. Those get
 *     ONE `source=ncaa` row (season 1935) sized so the program's all-time OFFICIAL
 *     total (all as-played rows through `through`, minus wins_vacated) equals the
 *     book exactly — e.g. Ohio State 990-337-53 official / 1002 as-played.
 *
 *  2. Game logs (data/staging/_staging_games_cfbref.csv) — every other program
 *     gets per-season `source=cfbref` rows: every game 1869-1935 in which one side
 *     maps to a current FBS program contributes a W / L / T, opponent caliber
 *     irrelevant (project rule). Scores equal => a tie for both sides.
 *
 * `source=cfbd` rows (1936+) and any `source=manual` rows are kept verbatim.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords } from './lib/csv.mjs';
import { CANON } from './lib/teams.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WINS = path.join(REPO, 'data/staging/_staging_wins.csv');
const GAMES = path.join(REPO, 'data/staging/_staging_games_cfbref.csv');
const IDENTITY = path.join(REPO, 'data/staging/_staging_identity.csv');
const NCAA = path.join(REPO, 'data/staging/_staging_wins_ncaa.csv');

// CANON (CFBD spellings) + CFBRef-specific aliases seen in the pre-1936 data
const ALIAS = {
  ...CANON,
  'Southern Methodist': 'SMU',
  'Alabama-Birmingham': 'UAB',
  'North Carolina-Charlotte': 'Charlotte',
  'Texas A&M-Commerce': null,
  'Texas A&M-Kingsville': null,
};
const fbs = new Set(readRecords(fs.readFileSync(IDENTITY, 'utf8')).map((r) => r.school).filter(Boolean));
const map = (n) => (n in ALIAS ? ALIAS[n] : fbs.has(n) ? n : null);

// --- NCAA official all-time lines (only the ~31 that are in our 130) ---
const ncaa = new Map(); // school -> { w, l, t, through }
for (const r of readRecords(fs.readFileSync(NCAA, 'utf8'))) {
  if (!r.school || !fbs.has(r.school)) continue;
  ncaa.set(r.school, {
    w: +r.ncaa_wins, l: +r.ncaa_losses, t: +r.ncaa_ties, through: +r.through || 2024,
  });
}

// --- game-log tally, seasons < 1936 ---
const games = readRecords(fs.readFileSync(GAMES, 'utf8'));
const tally = new Map(); // school -> Map(season -> {w,l,t})
const unmapped = new Map();
for (const g of games) {
  if (+g.season >= 1936) continue;
  const tie = +g.winner_pts === +g.loser_pts;
  for (const [raw, res] of [[g.winner, tie ? 't' : 'w'], [g.loser, tie ? 't' : 'l']]) {
    const s = map(raw);
    if (!s) { unmapped.set(raw, (unmapped.get(raw) || 0) + 1); continue; }
    let bySeason = tally.get(s);
    if (!bySeason) tally.set(s, (bySeason = new Map()));
    let rec = bySeason.get(g.season);
    if (!rec) bySeason.set(g.season, (rec = { w: 0, l: 0, t: 0 }));
    rec[res] += 1;
  }
}

// --- keep every 1936+ row; also fold up per-school as-played (<= NCAA `through`) + vacated ---
const keep = fs
  .readFileSync(WINS, 'utf8')
  .split('\n')
  .filter((l) => l && !l.startsWith('#') && !l.startsWith('school,'))
  .filter((l) => +l.split(',')[1] >= 1936);

const mod = new Map(); // school -> { w, l, t } as-played, 1936..through
const vac = new Map(); // school -> { w, l } vacated
for (const line of keep) {
  const c = line.split(',');
  const school = c[0];
  const season = +c[1];
  const n = ncaa.get(school);
  if (!n) continue;
  if (season <= n.through) {
    const m = mod.get(school) || { w: 0, l: 0, t: 0 };
    m.w += +c[2] || 0; m.l += +c[3] || 0; m.t += +c[4] || 0;
    mod.set(school, m);
  }
  const v = vac.get(school) || { w: 0, l: 0 };
  v.w += +c[5] || 0; v.l += +c[6] || 0;
  vac.set(school, v);
}

// --- pre-1936 rows: game-log per-season for programs NOT calibrated to NCAA ---
const pre = [];
for (const [school, bySeason] of tally) {
  if (ncaa.has(school)) continue;
  for (const [season, r] of bySeason) pre.push(`${school},${season},${r.w},${r.l},${r.t},,,,cfbref`);
}

// --- one source=ncaa calibration row per NCAA-listed program ---
const lumps = [];
const negs = [];
for (const [school, n] of ncaa) {
  const m = mod.get(school) || { w: 0, l: 0, t: 0 };
  const v = vac.get(school) || { w: 0, l: 0 };
  // as-played all-time (through n.through) - vacated  ==  n  =>  lump = n + vacated - mod
  const lw = n.w + v.w - m.w;
  const ll = n.l + v.l - m.l;
  const lt = n.t - m.t;
  if (lw < 0 || ll < 0 || lt < 0) negs.push(`${school} (${lw}/${ll}/${lt})`);
  lumps.push(`${school},1935,${lw},${ll},${lt},,,,ncaa`);
}

const banner = [
  '# One (school, season) record.',
  '#   source=cfbd   1936->present, rebuilt by `npm run data:api`.',
  '#   source=ncaa   one row (1935) per program in _staging_wins_ncaa.csv; sized so the',
  '#     all-time OFFICIAL total (as-played minus wins_vacated) matches the NCAA "FBS',
  '#     Records" book through its `through` year, with the live current season on top.',
  '#   source=cfbref 1869-1935 per-season, from _staging_games_cfbref.csv, for every',
  '#     other program (every game where one side is a current FBS team; opponent',
  '#     caliber irrelevant). Thin before ~1905, so those totals sit below the book.',
  '#   source=manual any hand rows; also never touched by the refresh.',
  '# A tie counts as half a win in win %.',
  '# wins_vacated / losses_vacated: NCAA-vacated results - removed only in the',
  '#   "NCAA official" wins toggle; the trajectory and default view use as-played.',
  'school,season,wins,losses,ties,wins_vacated,losses_vacated,vacated_note,source',
].join('\n');

const all = [...pre, ...lumps, ...keep].sort((a, b) => {
  const A = a.split(','), B = b.split(',');
  return A[0].localeCompare(B[0]) || +A[1] - +B[1];
});
fs.writeFileSync(WINS, banner + '\n' + all.join('\n') + '\n');

console.log(`✓ ${path.relative(REPO, WINS)}: ${all.length} rows`);
console.log(`  ${lumps.length} ncaa (calibrated), ${pre.length} cfbref pre-1936, ${keep.length} cfbd 1936+`);
if (negs.length) console.log(`  ⚠ negative lump (check vacated / mod sums): ${negs.join(', ')}`);
const flag = [...unmapped.entries()].filter(([, c]) => c >= 15).sort((a, b) => b[1] - a[1]);
if (flag.length) {
  console.log('  unmapped names with >=15 game-appearances (all expected non-FBS; check for a missing alias):');
  for (const [n, c] of flag.slice(0, 20)) console.log(`    ${String(c).padStart(4)}  ${n}`);
}
