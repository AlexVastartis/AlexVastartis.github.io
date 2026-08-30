/**
 * Rebuilds data/staging/_staging_nfl_draft_success.csv from the pick-level sheet
 * data/staging/_staging_nfl_draft_picks.csv (one row per pick, 1936–2026, from a
 * pro-football-reference scrape of the per-year draft pages).
 *
 *   1936–1994 : counted straight from the sheet (`source=sheet`). This is now the
 *               authority — it covers the whole era, not just 1967-on like CFBD.
 *   1995–2026 : the sheet's scrape lost the college column for these years, so
 *               those rows are carried over unchanged from whatever is already in
 *               _staging_nfl_draft_success.csv (`source=carried`). Re-scrape the
 *               1995–2026 year pages WITH College/Univ and this cutoff moves up.
 *
 * The AFL ran its own draft 1960–66. _staging_nfl_draft_picks_afl.csv holds those
 * selections (no round column, so they add to `picks` only, not first-round). A
 * player taken by both leagues counts once per league, matching how the per-school
 * lists tally. Currently that file only has 1960 — add 1961–66 to close the rest.
 *
 *   node scripts/build-draft.mjs      (or: npm run draft)
 * Then: npm run build:data
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords, writeRecords } from './lib/csv.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGING = path.join(REPO, 'data/staging');
const PICKS = path.join(STAGING, '_staging_nfl_draft_picks.csv');
const AFL = path.join(STAGING, '_staging_nfl_draft_picks_afl.csv');
const OUT = path.join(STAGING, '_staging_nfl_draft_success.csv');
const SHEET_THROUGH = 1994; // last year the sheet has colleges for

const fbs = new Set(
  readRecords(fs.readFileSync(path.join(STAGING, '_staging_identity.csv'), 'utf8'))
    .map((r) => r.school)
    .filter(Boolean),
);

/** pro-football-reference college spelling -> our canonical school (null = not one of ours) */
const ALIAS = {
  'Southern California': 'USC',
  Mississippi: 'Ole Miss',
  'Brigham Young': 'BYU',
  'Texas Christian': 'TCU',
  'Louisiana State': 'LSU',
  'Central Florida': 'UCF',
  'Nevada-Las Vegas': 'UNLV',
  'Texas-El Paso': 'UTEP',
  'Texas-San Antonio': 'UTSA',
  'Louisiana-Lafayette': 'Louisiana',
  Massachusetts: 'UMass',
  Connecticut: 'UConn',
  'Southern Mississippi': 'Southern Miss',
  'Boston Col.': 'Boston College',
  'Middle Tenn. St.': 'Middle Tennessee',
  'Middle Tennessee State': 'Middle Tennessee',
  'La-Monroe': 'Louisiana-Monroe',
  'Sam Houston St.': 'Sam Houston',
  'Sam Houston State': 'Sam Houston',
};
function canon(col) {
  if (!col) return null;
  if (ALIAS[col]) return ALIAS[col];
  const asState = col.replace(/ St\.$/, ' State');
  if (fbs.has(asState)) return asState;
  return fbs.has(col) ? col : null;
}

/* ---- 1936–1994 from the sheet ---- */
const picks = readRecords(fs.readFileSync(PICKS, 'utf8'));
const agg = new Map(); // "school|year" -> { school, season, picks, first_round_picks, source }
let dropped = 0;
for (const p of picks) {
  const year = Number(p.Year);
  if (!year || year > SHEET_THROUGH) continue;
  const school = canon((p['College/Univ'] || '').trim());
  if (!school) { dropped += 1; continue; }
  const k = `${school}|${year}`;
  const e = agg.get(k) || { school, season: year, picks: 0, first_round_picks: 0, source: 'sheet' };
  e.picks += 1;
  if (Number(p.Rnd) === 1) e.first_round_picks += 1;
  agg.set(k, e);
}
const sheetRows = agg.size;

/* ---- AFL 1960–66 (no round data → picks only) ---- */
let aflPicks = 0;
let aflYears = [];
if (fs.existsSync(AFL)) {
  const aflSet = new Set();
  for (const p of readRecords(fs.readFileSync(AFL, 'utf8'))) {
    const year = Number(p.Year);
    if (!year || year > SHEET_THROUGH) continue;
    aflSet.add(year);
    const school = canon((p['College/Univ'] || '').trim());
    if (!school) { dropped += 1; continue; }
    const k = `${school}|${year}`;
    const e = agg.get(k) || { school, season: year, picks: 0, first_round_picks: 0, source: 'sheet' };
    e.picks += 1;
    if (e.source === 'sheet') e.source = 'sheet+afl';
    agg.set(k, e);
    aflPicks += 1;
  }
  aflYears = [...aflSet].sort();
}

/* ---- 1995–2026 carried over from the existing file ---- */
let carried = 0;
if (fs.existsSync(OUT)) {
  for (const r of readRecords(fs.readFileSync(OUT, 'utf8'))) {
    const year = Number(r.season);
    if (!r.school || !year || year <= SHEET_THROUGH) continue;
    agg.set(`${r.school}|${year}`, {
      school: r.school,
      season: year,
      picks: Number(r.picks || 0),
      first_round_picks: Number(r.first_round_picks || 0),
      source: 'carried',
    });
    carried += 1;
  }
}

const rows = [...agg.values()].sort(
  (a, b) => a.school.localeCompare(b.school) || a.season - b.season,
);
const banner = [
  'One (school, season): total NFL/AFL draft picks and how many went in round one.',
  'Built by `npm run draft` from _staging_nfl_draft_picks{,_afl}.csv (pro-football-reference).',
  'source=sheet / sheet+afl is authoritative for 1936–1994; source=carried are 1995+ rows',
  'kept from the old CFBD build until the sheet has colleges for those years.',
  `AFL selections included for: ${aflYears.join(', ') || '(none)'} (no round data → picks only).`,
].map((l) => `# ${l}`).join('\n') + '\n';

fs.writeFileSync(
  OUT,
  banner + writeRecords(['school', 'season', 'picks', 'first_round_picks', 'source'], rows),
);

const total = rows.reduce((s, r) => s + r.picks, 0);
console.log(
  `wrote ${path.relative(REPO, OUT)} — ${rows.length} rows (sheet 1936–${SHEET_THROUGH} + `
  + `${aflPicks} AFL picks [${aflYears.join(',') || 'none'}] + ${carried} carried 1995+), `
  + `${total} picks total. ${dropped} picks dropped (non-FBS schools).`,
);
