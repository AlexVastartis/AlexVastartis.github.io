/**
 * Derives the shipped logo assets from the master art at assets/logo-src.png
 * (a crowned football, portrait, transparent):
 *
 *   public/logo.png             ~440px tall  — masthead / share / general use
 *   public/apple-touch-icon.png  180×180     — iOS home screen
 *   public/favicon-32.png         32×32      — modern browser tabs
 *   public/favicon-16.png         16×16      — legacy tabs
 *
 * The source is trimmed of transparent margin first, then contained (never
 * cropped) into each square so the whole mark always shows. All outputs keep
 * the alpha channel.
 *
 *   node scripts/build-logo.mjs      (or: npm run logo)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(REPO, 'assets/logo-src.png');

const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const trimmed = await sharp(fs.readFileSync(SRC)).trim({ threshold: 8 }).png().toBuffer();

// masthead / general: keep the natural portrait ratio, cap the height
await sharp(trimmed)
  .resize({ height: 440, fit: 'inside', withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(REPO, 'public/logo.png'));

// square icons: contain the whole mark, transparent padding
for (const [name, px] of [['apple-touch-icon.png', 180], ['favicon-32.png', 32], ['favicon-16.png', 16]]) {
  await sharp(trimmed)
    .resize(px, px, { fit: 'contain', background: clear })
    .png({ compressionLevel: 9 })
    .toFile(path.join(REPO, 'public', name));
}

for (const name of ['logo.png', 'apple-touch-icon.png', 'favicon-32.png', 'favicon-16.png']) {
  const p = path.join(REPO, 'public', name);
  console.log(`  ${name.padEnd(22)} ${(fs.statSync(p).size / 1024).toFixed(1)} KB`);
}
console.log('✓ logo assets written to public/');
