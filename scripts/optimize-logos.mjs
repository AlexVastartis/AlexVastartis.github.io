/**
 * Downscales the full-size image sets for shipping.
 *
 *   assets/logos-src/<slug>.png       (500px originals, git-tracked, not served)
 *        →  public/logos/<slug>.png   (160px square, palette PNG, served)
 *   assets/logos-src/<slug>-dark.png  →  public/logos/<slug>-dark.png
 *
 *   assets/coaches-src/<id>.png       (450–600px headshots)
 *        →  public/coaches/<id>.png   (128px square, centre-cropped)
 *
 * Nothing on the site renders a logo larger than ~56px or a headshot larger than
 * ~40px, so these edges are generous. Runs from `prebuild`, so `npm run build`
 * always ships fresh output regenerated from the originals. `LOGO_PX=<n>` /
 * `COACH_PX=<n>` override the edges.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;

const SETS = [
  {
    name: 'logos',
    src: 'assets/logos-src',
    out: 'public/logos',
    px: Number(process.env.LOGO_PX) || 160,
    fit: 'inside',
  },
  {
    name: 'coaches',
    src: 'assets/coaches-src',
    out: 'public/coaches',
    px: Number(process.env.COACH_PX) || 128,
    fit: 'cover', // headshots fill the circle
  },
];

let hadFailure = false;

for (const set of SETS) {
  const SRC = path.join(REPO, set.src);
  const OUT = path.join(REPO, set.out);
  if (!fs.existsSync(SRC)) {
    console.log(`skip ${set.name} — no ${set.src}`);
    continue;
  }
  const files = fs.readdirSync(SRC).filter((f) => f.toLowerCase().endsWith('.png'));
  if (!files.length) {
    console.log(`skip ${set.name} — ${set.src} has no PNGs`);
    continue;
  }
  fs.mkdirSync(OUT, { recursive: true });
  // clear stale outputs so a renamed/removed source doesn't leave an orphan behind
  for (const f of fs.readdirSync(OUT)) {
    if (f.toLowerCase().endsWith('.png')) fs.rmSync(path.join(OUT, f));
  }

  let srcBytes = 0;
  let outBytes = 0;
  let n = 0;
  const failures = [];

  await Promise.all(
    files.map(async (file) => {
      const from = path.join(SRC, file);
      try {
        srcBytes += fs.statSync(from).size;
        const buf = await sharp(from)
          .resize(set.px, set.px, {
            fit: set.fit,
            withoutEnlargement: true,
            position: 'centre',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
          .toBuffer();
        fs.writeFileSync(path.join(OUT, file), buf);
        outBytes += buf.length;
        n += 1;
      } catch (e) {
        failures.push(`${file} (${e.message})`);
      }
    }),
  );

  console.log(`optimized ${n} ${set.name} @ ${set.px}px  ·  ${mb(srcBytes)} → ${mb(outBytes)}`);
  if (failures.length) {
    console.error(`  ${set.name} failures:`, failures.join(', '));
    hadFailure = true;
  }
}

if (hadFailure) process.exit(1);
