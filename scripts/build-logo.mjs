/**
 * Derives the shipped logo assets from the master art at assets/logo-src.png
 * ("Logo A" — the crowned football in a shield, transparent):
 *
 *   public/logo.png             ~440px tall  — masthead / share / general use (transparent)
 *   public/apple-touch-icon.png  180×180     — iOS home screen  (drawn tile: white crown on blue)
 *   public/favicon-32.png         32×32      — modern browser tabs (same tile)
 *   public/favicon-16.png         16×16      — legacy tabs         (same tile)
 *
 * The masthead logo keeps its alpha. The icons are a simplified drawn tile (see below),
 * because the full mark is unreadable at 16–32px.
 *
 * If assets/logo-src-alt.png also exists ("Logo B" — the earlier design, kept for
 * comparison), it's likewise derived into public/logo-alt.png — same masthead
 * treatment, no favicon set — so the site's ?logo=alt / bbf-logo-variant toggle
 * (App.tsx) has something to swap to. No alt file → no alt output, silently.
 *
 *   node scripts/build-logo.mjs      (or: npm run logo)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(REPO, 'assets/logo-src.png');
const ALT_SRC = path.join(REPO, 'assets/logo-src-alt.png');

const trimmed = await sharp(fs.readFileSync(SRC)).trim({ threshold: 8 }).png().toBuffer();

// masthead / general: keep the natural portrait ratio, cap the height, stay transparent
await sharp(trimmed)
  .resize({ height: 440, fit: 'inside', withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(REPO, 'public/logo.png'));

// Tab / home-screen icons are NOT the masthead art scaled down — at 16–32px its detail
// (outlines, laces, shading) turns to mud, and a transparent crown vanishes on a light tab.
// They are a purpose-drawn tile instead: a solid blue rounded square with a bold white
// crown (three points and a band), which stays crisp and high-contrast at any size and on
// any browser chrome. Drawn as SVG so it's exact at every size.
const tile = (rx) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#2563eb"/>
    </linearGradient></defs>
    <rect width="64" height="64" rx="${rx}" fill="url(#g)"/>
    <path d="M10 44 L7 20 L21 30 L32 12 L43 30 L57 20 L54 44 Z" fill="#ffffff"/>
    <rect x="10" y="48" width="44" height="7" rx="2" fill="#ffffff"/>
  </svg>`,
);
for (const [name, px, rx] of [
  ['favicon-32.png', 32, 14],
  ['favicon-16.png', 16, 14],
  ['apple-touch-icon.png', 180, 0], // iOS rounds it itself — keep the corners solid
]) {
  await sharp(tile(rx), { density: 384 })
    .resize(px, px)
    .png({ compressionLevel: 9 })
    .toFile(path.join(REPO, 'public', name));
}

// alt masthead (Logo B), if kept — same trim + masthead resize as the main logo, no favicons
const shipped = ['logo.png', 'apple-touch-icon.png', 'favicon-32.png', 'favicon-16.png'];
if (fs.existsSync(ALT_SRC)) {
  await sharp(await sharp(fs.readFileSync(ALT_SRC)).trim({ threshold: 8 }).png().toBuffer())
    .resize({ height: 440, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(path.join(REPO, 'public/logo-alt.png'));
  shipped.push('logo-alt.png');
} else {
  const stale = path.join(REPO, 'public/logo-alt.png');
  if (fs.existsSync(stale)) fs.rmSync(stale); // alt source removed → drop the stale output
}

for (const name of shipped) {
  const p = path.join(REPO, 'public', name);
  console.log(`  ${name.padEnd(22)} ${(fs.statSync(p).size / 1024).toFixed(1)} KB`);
}
console.log('✓ logo assets written to public/');
