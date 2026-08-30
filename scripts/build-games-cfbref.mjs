/**
 * Convert a College Football Reference season-page export (one workbook, blocks
 * separated by repeated `Rk,Wk,Date,Day,Winner,Pts,,Loser,Pts,Notes` headers)
 * into data/staging/_staging_games_cfbref.csv.
 *
 *   node scripts/build-games-cfbref.mjs [--src "<path to .xlsx>"]
 *
 * Source resolves to: --src arg  ->  $BBF_CFBREF_XLSX  ->  ~/Desktop/Book 2.xlsx
 *
 * Any *.csv in data/staging/cfbref-supplemental/ is folded in on top of the
 * workbook — one file per season the export was missing, same column layout as a
 * CFBRef block (Rk,Wk,Date,Day,Winner,Pts,,Loser,Pts,Notes, with a header row).
 *
 * Output columns: season,week,date,winner,winner_pts,loser,loser_pts,winner_venue,notes
 *   - season   = the block's fall year; Jan/Feb/Mar rows (bowls) fold into it
 *   - date     = ISO YYYY-MM-DD
 *   - winner_venue: blank marker -> home, "@" -> away, "N" -> neutral
 * Duplicate rows (same season/date/teams/score) are dropped; rows sorted chronologically.
 *
 * This is the pre-1936 wins source — after regenerating it, run
 * `npm run wins:pre1936` to fold it into _staging_wins.csv.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import xlsx from 'xlsx';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argSrc = process.argv.includes('--src')
  ? process.argv[process.argv.indexOf('--src') + 1]
  : null;
const SRC = argSrc || process.env.BBF_CFBREF_XLSX || path.join(os.homedir(), 'Desktop', 'Book 2.xlsx');
const SUPP_DIR = path.join(REPO, 'data/staging/cfbref-supplemental');
const OUT = path.join(REPO, 'data/staging/_staging_games_cfbref.csv');

if (!fs.existsSync(SRC)) {
  console.error(`source workbook not found: ${SRC}\n  pass --src "<path>" or set BBF_CFBREF_XLSX`);
  process.exit(1);
}

const wb = xlsx.read(fs.readFileSync(SRC), { type: 'buffer' });
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });

// minimal CSV line split (handles quoted fields); trims each cell
const splitCsv = (line) => {
  const cells = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { cells.push(cur); cur = ''; }
    else cur += c;
  }
  cells.push(cur);
  return cells.map((s) => s.trim());
};

const suppFiles = fs.existsSync(SUPP_DIR)
  ? fs.readdirSync(SUPP_DIR).filter((f) => f.toLowerCase().endsWith('.csv')).sort()
  : [];

const MONTH = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const isHeader = (r) => String(r[0]).trim() === 'Rk' && String(r[2]).trim() === 'Date';
const parseDate = (s) => {
  const m = String(s).trim().match(/^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})$/);
  if (!m) return null;
  const mo = MONTH[m[1]];
  if (!mo) return null;
  return { y: +m[3], mo, iso: `${m[3]}-${String(mo).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}` };
};

const blocks = [];
const pushRows = (src) => {
  let cur = null;
  for (const r of src) {
    if (isHeader(r)) { cur = []; blocks.push(cur); continue; }
    if (!cur) continue;
    if (r.every((x) => x === '' || x == null)) continue;
    cur.push(r);
  }
};

pushRows(rows);
for (const f of suppFiles) {
  const lines = fs.readFileSync(path.join(SUPP_DIR, f), 'utf8').split(/\r?\n/).filter((l) => l.trim() !== '');
  pushRows(lines.map(splitCsv));
}

const out = [];
const seen = new Set();
let dupCount = 0, badDate = 0, badScore = 0;

for (const blk of blocks) {
  const dated = blk.map((r) => parseDate(r[2])).filter(Boolean);
  if (!dated.length) continue;
  const fallYears = dated.filter((d) => d.mo >= 8).map((d) => d.y);
  const season = fallYears.length ? Math.min(...fallYears) : Math.min(...dated.map((d) => d.y));
  for (const r of blk) {
    const dt = parseDate(r[2]);
    if (!dt) { badDate++; continue; }
    const wp = Number(r[5]), lp = Number(r[8]);
    if (!Number.isFinite(wp) || !Number.isFinite(lp)) { badScore++; continue; }
    const winner = String(r[4]).trim();
    const loser = String(r[7]).trim();
    const mark = String(r[6]).trim();
    const venue = mark === '@' ? 'away' : mark === 'N' ? 'neutral' : 'home';
    const key = `${season}|${dt.iso}|${winner}|${wp}|${loser}|${lp}`;
    if (seen.has(key)) { dupCount++; continue; }
    seen.add(key);
    out.push({
      season, week: String(r[1]).trim(), date: dt.iso,
      winner, winner_pts: wp, loser, loser_pts: lp,
      winner_venue: venue, notes: String(r[9]).trim(),
    });
  }
}

out.sort((a, b) => a.season - b.season || a.date.localeCompare(b.date) || a.winner.localeCompare(b.winner));

const q = (v) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const cols = ['season', 'week', 'date', 'winner', 'winner_pts', 'loser', 'loser_pts', 'winner_venue', 'notes'];
fs.writeFileSync(OUT, cols.join(',') + '\n' + out.map((g) => cols.map((c) => q(g[c])).join(',')).join('\n') + '\n');

const bySeason = new Map();
for (const g of out) bySeason.set(g.season, (bySeason.get(g.season) || 0) + 1);
const yrs = [...bySeason.keys()].sort((a, b) => a - b);
const missing = [];
for (let y = yrs[0]; y <= yrs.at(-1); y++) if (!bySeason.has(y)) missing.push(y);

console.log(`✓ ${path.relative(REPO, OUT)}: ${out.length} games, seasons ${yrs[0]}–${yrs.at(-1)}`);
console.log(`  blocks: ${blocks.length} (${suppFiles.length} supplemental: ${suppFiles.join(', ') || 'none'})`);
console.log(`  dropped dup rows: ${dupCount}   unparseable date: ${badDate}   bad score: ${badScore}`);
console.log(`  missing seasons in span: ${missing.join(', ') || '(none)'}`);
