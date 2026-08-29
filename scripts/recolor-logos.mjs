/**
 * Immediate fix for the ~24 "white knockout" logo SVGs that are invisible on the
 * light theme. Repaints their white fill with the team's primary colour for
 * public/logos/<slug>.svg and a near-white tint for public/logos/dark/<slug>.svg
 * (TeamMarker prefers the dark/ copy in dark mode).
 *
 * Originals are backed up to data/manual/logos-original/ once. Idempotent.
 * `npm run logos:recolor` — safe to re-run; a later `npm run logos:sync` replaces
 * these with full-colour CFBD PNGs and removes the recoloured SVGs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords } from './lib/csv.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOGOS = path.join(REPO, 'public/logos');
const DARK = path.join(LOGOS, 'dark');
const BACKUP = path.join(REPO, 'data/manual/logos-original');
const DARK_TINT = '#f4f4f5';

const WHITE_RE = /(fill\s*[:=]\s*["']?\s*)(#f{3}(?:f{3})?|#fefefe|white)(["']?)/gi;
const isWhiteOnly = (svg) => {
  const fills = [...svg.matchAll(/fill\s*[:=]\s*["']?\s*(#[0-9a-fA-F]{3,6}|white|black|none|currentColor)/g)]
    .map((m) => m[1].toLowerCase());
  const uniq = [...new Set(fills)];
  return uniq.length > 0 && uniq.every((c) => /white|#f{3,6}|#fefefe|none|currentcolor/i.test(c));
};

const teams = readRecords(fs.readFileSync(path.join(REPO, 'data/manual/teams.csv'), 'utf8'));
const primaryBySlug = new Map(teams.map((t) => [t.slug, t.primary_hex]));

fs.mkdirSync(BACKUP, { recursive: true });
fs.mkdirSync(DARK, { recursive: true });

let done = 0;
const touched = [];
for (const file of fs.readdirSync(LOGOS)) {
  if (!file.endsWith('.svg')) continue;
  const slug = file.replace('.svg', '');
  const full = path.join(LOGOS, file);
  const svg = fs.readFileSync(full, 'utf8');
  if (!isWhiteOnly(svg)) continue;
  const primary = primaryBySlug.get(slug);
  if (!primary) {
    console.warn(`  no primary colour for ${slug}, skipped`);
    continue;
  }
  const backup = path.join(BACKUP, file);
  if (!fs.existsSync(backup)) fs.writeFileSync(backup, svg);
  const base = fs.readFileSync(backup, 'utf8'); // always recolour from the pristine original
  fs.writeFileSync(full, base.replace(WHITE_RE, `$1${primary}$3`));
  fs.writeFileSync(path.join(DARK, file), base.replace(WHITE_RE, `$1${DARK_TINT}$3`));
  touched.push(slug);
  done += 1;
}
console.log(`recoloured ${done} white-knockout logos: ${touched.join(', ')}`);
