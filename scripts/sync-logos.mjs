/**
 * Downloads the 500px full-colour logo set from CollegeFootballData into
 * public/logos/<slug>.png. One logo per team, used in BOTH light and dark mode —
 * CFBD's white-knockout "dark" variants are intentionally NOT used.
 *
 * Curated <slug>.svg files are left in place and stay first choice in
 * TeamMarker; this gives every team a crisp 500px colour PNG fallback and
 * replaces the retired white-knockout SVGs outright.
 *
 * `npm run logos:sync`  (needs CFBD_API_KEY)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords } from './lib/csv.mjs';
import { hasKey, getTeamsMeta } from './fetch-cfbd.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOGOS = path.join(REPO, 'public/logos');
const DARK = path.join(LOGOS, 'dark');
const BACKUP = path.join(REPO, 'data/manual/logos-original');

const CFBD_ALIAS = {
  'NC State': 'North Carolina State', 'App State': 'Appalachian State',
  Massachusetts: 'UMass', Connecticut: 'UConn', 'Louisiana Monroe': 'Louisiana-Monroe',
  'UL Monroe': 'Louisiana-Monroe', 'Southern Mississippi': 'Southern Miss', Miami: 'Miami (FL)',
  "Hawai'i": 'Hawaii', 'San José State': 'San Jose State', 'Florida International': 'FIU',
};

if (!hasKey()) {
  console.error('CFBD_API_KEY not set — cannot sync logos. Add it to .env.');
  process.exit(1);
}

const teams = readRecords(fs.readFileSync(path.join(REPO, 'data/staging/_staging_identity.csv'), 'utf8'));
const slugBySchool = new Map(teams.map((t) => [t.school, t.slug]));
const recolored = new Set(fs.existsSync(BACKUP) ? fs.readdirSync(BACKUP).map((f) => f.replace('.svg', '')) : []);

// the old dark/ directory is no longer used
if (fs.existsSync(DARK)) {
  fs.rmSync(DARK, { recursive: true, force: true });
  console.log('removed stale public/logos/dark/');
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) throw new Error(`tiny response ${buf.length}b ${url}`);
  fs.writeFileSync(dest, buf);
}

const meta = await getTeamsMeta();
let ok = 0;
const failures = [];
for (const [cfbdName, m] of meta) {
  const slug = slugBySchool.get(CFBD_ALIAS[cfbdName] || cfbdName);
  if (!slug || !m.logo) continue;
  try {
    await download(m.logo, path.join(LOGOS, `${slug}.png`));
    // retire the recoloured white-knockout SVG so the colour PNG wins
    if (recolored.has(slug)) {
      const svg = path.join(LOGOS, `${slug}.svg`);
      if (fs.existsSync(svg)) fs.rmSync(svg);
    }
    ok += 1;
  } catch (e) {
    failures.push(`${slug} (${e.message})`);
  }
}
const covered = new Set([...meta.keys()].map((n) => slugBySchool.get(CFBD_ALIAS[n] || n)).filter(Boolean));
const ourMissing = teams.filter((t) => !covered.has(t.slug)).map((t) => t.school);
console.log(`synced ${ok} colour logos.`);
if (failures.length) console.log('  failures:', failures.join(', '));
if (ourMissing.length) console.log('  no CFBD match for:', ourMissing.join(', '));
