/**
 * Fill every _blurb_*.csv in data/staging/ with the values build-data.mjs currently
 * computes, so all 130 rows exist and can be hand-edited. Re-runnable: reads the
 * effective values straight out of public/data/teams.json (build-data.mjs first).
 *
 *   npm run build:data && npm run blurbs:seed
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeRecords } from './lib/csv.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGING = path.join(REPO, 'data/staging');
const { teams } = JSON.parse(fs.readFileSync(path.join(REPO, 'public/data/teams.json'), 'utf8'));
const ordered = [...teams].sort((a, b) => a.school.localeCompare(b.school));

const write = (name, cols, rows, banner) => {
  const body = banner.map((l) => `# ${l}`).join('\n') + '\n' + writeRecords(cols, rows);
  fs.writeFileSync(path.join(STAGING, name), body);
  console.log(`  ${name.padEnd(34)} ${rows.length} rows`);
};

write(
  '_blurb_identity_line.csv',
  ['school', 'text'],
  ordered.map((t) => ({ school: t.school, text: t.identity })),
  ['Override the team-panel identity line. Pre-filled with the computed value',
   '("#rank · rating · grouping", from the as-played view). Clear a row to let',
   'build-data.mjs recompute it; a filled row is shown verbatim in both wins modes.'],
);

write(
  '_blurb_ranking_row_subline.csv',
  ['school', 'text'],
  ordered.map((t) => ({ school: t.school, text: t.label.standard })),
  ['Override the ranked-list row sub-line (the trajectory, described).',
   'Pre-filled with the computed value; clear a row to recompute.'],
);

write(
  '_blurb_trajectory.csv',
  ['school', 'dir', 'note', 'tooltip'],
  ordered.map((t) => ({
    school: t.school,
    dir: t.trend.dir,
    note: t.note,
    tooltip: t.label.trajectoryTooltip,
  })),
  ['Override a program’s trajectory. Every column is pre-filled with the computed value.',
   'dir ∈ up|down|even — CLEAR the cell to let the trajectory algorithm set it from the',
   '  data on the next build (a filled value pins it permanently).',
   'note = the short suffix after Ascending/Descending (empty for "even"; a single space',
   '  forces no note). tooltip = the full hover string.'],
);

write(
  '_blurb_standing.csv',
  ['school', 'text'],
  ordered.map((t) => ({ school: t.school, text: t.standing })),
  ['The team-panel "Standing" blurb. Pre-filled with the computed value;',
   'edit freely, or clear a row to recompute.'],
);

write(
  '_blurb_path_forward.csv',
  ['school', 'text'],
  ordered.map((t) => ({ school: t.school, text: t.pathForward })),
  ['The team-panel "Path Forward" blurb. Pre-filled with the computed value;',
   'edit freely, or clear a row to recompute.'],
);

console.log('\n✓ blurb files seeded from public/data/teams.json');
