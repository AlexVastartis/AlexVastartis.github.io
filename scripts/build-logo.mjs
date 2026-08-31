/**
 * Derives the shipped logo assets from the master art at assets/logo-src.png
 * (a crowned football, portrait, transparent):
 *
 *   public/logo.png             ~440px tall  — masthead / share / general use (transparent)
 *   public/apple-touch-icon.png  180×180     — iOS home screen  (rounded ICON_BG panel)
 *   public/favicon-32.png         32×32      — modern browser tabs (rounded ICON_BG panel)
 *   public/favicon-16.png         16×16      — legacy tabs         (rounded ICON_BG panel)
 *
 * The masthead logo keeps its alpha; the favicons sit the mark on a rounded
 * solid panel so it reads against a light or dark browser chrome.
 *
 *   node scripts/build-logo.mjs      (or: npm run logo)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(REPO, 'assets/logo-src.png');

const ICON_BG = '#ffffff'; // favicon panel colour
const trimmed = await sharp(fs.readFileSync(SRC)).trim({ threshold: 8 }).png().toBuffer();

// masthead / general: keep the natural portrait ratio, cap the height, stay transparent
await sharp(trimmed)
  .resize({ height: 440, fit: 'inside', withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(REPO, 'public/logo.png'));

// square icons: the mark, inset, on a rounded solid panel
for (const [name, px] of [['apple-touch-icon.png', 180], ['favicon-32.png', 32], ['favicon-16.png', 16]]) {
  const r = Math.round(px * 0.22); // corner radius ≈ iOS squircle
  const pad = Math.round(px * 0.12); // breathing room around the mark
  const panel = Buffer.from(
    `<svg width="${px}" height="${px}"><rect width="${px}" height="${px}" rx="${r}" ry="${r}" fill="${ICON_BG}"/></svg>`,
  );
  const mark = await sharp(trimmed)
    .resize(px - pad * 2, px - pad * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp(panel)
    .composite([{ input: mark, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(REPO, 'public', name));
}

for (const name of ['logo.png', 'apple-touch-icon.png', 'favicon-32.png', 'favicon-16.png']) {
  const p = path.join(REPO, 'public', name);
  console.log(`  ${name.padEnd(22)} ${(fs.statSync(p).size / 1024).toFixed(1)} KB`);
}
console.log('✓ logo assets written to public/');
