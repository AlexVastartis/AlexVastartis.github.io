/**
 * Downloads the full 500px full-colour logo set (light + dark) from
 * CollegeFootballData into public/logos/<slug>.png and public/logos/dark/<slug>.png.
 *
 * The 108 already-good curated SVGs stay in place and remain the first choice in
 * TeamMarker; this just gives every team a crisp 500px PNG fallback and a real
 * dark-mode variant. For the ~24 white-knockout teams whose recoloured SVG we
 * want to retire, the SVG is deleted so the colour PNG wins the fallback chain.
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

const teams = readRecords(fs.readFileSync(path.join(REPO, 'data/manual/teams.csv'), 'utf8'));
const slugBySchool = new Map(teams.map((t) => [t.school, t.slug]));
const recolored = new Set(fs.existsSync(BACKUP) ? fs.readdirSync(BACKUP).map((f) => f.replace('.svg', '')) : []);

fs.mkdirSync(DARK, { recursive: true });

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) throw new Error(`tiny response ${buf.length}b ${url}`);
  fs.writeFileSync(dest, buf);
}

const meta = await getTeamsMeta();
let ok = 0;
let miss = 0;
const unresolved = [];
for (const [cfbdName, m] of meta) {
  const school = CFBD_ALIAS[cfbdName] || cfbdName;
  const slug = slugBySchool.get(school);
  if (!slug) continue; // not one of our 130
  try {
    if (m.logo) await download(m.logo, path.join(LOGOS, `${slug}.png`));
    if (m.logoDark) await download(m.logoDark, path.join(DARK, `${slug}.png`));
    else if (m.logo) fs.copyFileSync(path.join(LOGOS, `${slug}.png`), path.join(DARK, `${slug}.png`));
    // retire the recoloured white-knockout SVG so the colour PNG wins
    if (recolored.has(slug)) {
      for (const p of [path.join(LOGOS, `${slug}.svg`), path.join(DARK, `${slug}.svg`)]) {
        if (fs.existsSync(p)) fs.rmSync(p);
      }
    }
    ok += 1;
  } catch (e) {
    miss += 1;
    unresolved.push(`${slug} (${e.message})`);
  }
}
const covered = new Set([...meta.keys()].map((n) => slugBySchool.get(CFBD_ALIAS[n] || n)).filter(Boolean));
const ourMissing = teams.filter((t) => !covered.has(t.slug)).map((t) => t.school);
console.log(`synced ${ok} logo pairs; ${miss} failed.`);
if (unresolved.length) console.log('  failures:', unresolved.join(', '));
if (ourMissing.length) console.log('  no CFBD match for:', ourMissing.join(', '));
