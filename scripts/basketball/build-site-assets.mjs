/**
 * Builds the static assets for BlueBloodBasketball into sites/basketball/public/
 * (the Vite publicDir for `--mode basketball`). Offline and deterministic:
 *
 *   logo.png                 the masthead mark — a crowned basketball in a shield, drawn
 *                            here as SVG in the same style as the football Logo A
 *   favicon-16/32, apple-touch-icon.png   copied from public/ (the crown tile is sport-neutral)
 *   CNAME, robots.txt        bluebloodbasketball.com
 *   logos/<slug>.png (+ -dark.png)
 *                            a program that is also on BlueBloodFootball reuses that logo
 *                            (public/logos/, from assets/logos-src/); every other program
 *                            gets a monogram badge in its ESPN team colours, until real
 *                            logo art is added to assets/logos-src-basketball/<slug>.png
 *                            (which wins over both when present).
 *
 *   node scripts/basketball/build-site-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { readRecords } from '../lib/csv.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(REPO, 'sites/basketball/public');
const FB_PUBLIC = path.join(REPO, 'public');
const OWN_SRC = path.join(REPO, 'assets/logos-src-basketball');
fs.mkdirSync(path.join(OUT, 'logos'), { recursive: true });

/* ---- masthead logo ---- */
const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="440" viewBox="0 0 300 440">
  <defs>
    <linearGradient id="blue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#1d4ed8"/>
    </linearGradient>
    <radialGradient id="ball" cx="0.38" cy="0.32" r="0.8">
      <stop offset="0" stop-color="#4b5563"/><stop offset="0.55" stop-color="#1f2937"/><stop offset="1" stop-color="#030712"/>
    </radialGradient>
    <clipPath id="ballclip"><circle cx="150" cy="268" r="106"/></clipPath>
  </defs>
  <!-- shield -->
  <path d="M150 432 C80 400 22 340 22 262 C22 196 58 150 150 138 C242 150 278 196 278 262 C278 340 220 400 150 432 Z"
        fill="#e0f2fe" stroke="#0f172a" stroke-width="6"/>
  <path d="M150 414 C90 384 40 332 40 262 C40 206 72 166 150 156 C228 166 260 206 260 262 C260 332 210 384 150 414 Z"
        fill="url(#blue)" stroke="#0f172a" stroke-width="4"/>
  <!-- ball -->
  <circle cx="150" cy="268" r="106" fill="url(#ball)" stroke="#0f172a" stroke-width="6"/>
  <g clip-path="url(#ballclip)" fill="none" stroke="#e0f2fe" stroke-width="7" stroke-linecap="round">
    <line x1="150" y1="158" x2="150" y2="378"/>
    <line x1="40" y1="268" x2="260" y2="268"/>
    <path d="M78 186 C120 222 120 314 78 350"/>
    <path d="M222 186 C180 222 180 314 222 350"/>
  </g>
  <ellipse cx="116" cy="214" rx="34" ry="16" fill="#ffffff" opacity="0.10" transform="rotate(-28 116 214)"/>
  <!-- crown -->
  <path d="M40 150 L22 42 L92 96 L150 8 L208 96 L278 42 L260 150 Z" fill="#e0f2fe" stroke="#0f172a" stroke-width="6" stroke-linejoin="round"/>
  <path d="M56 138 L44 68 L96 110 L150 34 L204 110 L256 68 L244 138 Z" fill="url(#blue)" stroke="#0f172a" stroke-width="4" stroke-linejoin="round"/>
  <rect x="50" y="130" width="200" height="30" rx="8" fill="url(#blue)" stroke="#0f172a" stroke-width="5"/>
  <rect x="62" y="139" width="176" height="6" rx="3" fill="#bfdbfe" opacity="0.7"/>
</svg>`;
await sharp(Buffer.from(logo), { density: 288 })
  .resize({ height: 440, fit: 'inside' })
  .png({ compressionLevel: 9 })
  .toFile(path.join(OUT, 'logo.png'));

/* ---- icons (sport-neutral crown tile), CNAME, robots ---- */
for (const f of ['favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png']) {
  fs.copyFileSync(path.join(FB_PUBLIC, f), path.join(OUT, f));
}
fs.writeFileSync(path.join(OUT, 'CNAME'), 'bluebloodbasketball.com\n');
fs.writeFileSync(path.join(OUT, 'robots.txt'), '# BlueBloodBasketball.com — static hobby site, nothing to disallow.\nUser-agent: *\nAllow: /\n');

/* ---- team logos ---- */
const ident = readRecords(fs.readFileSync(path.join(REPO, 'data/basketball/staging/_staging_identity.csv'), 'utf8'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
// readable text on the team colour: white unless the colour is light
const lum = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const badge = (abbr, primary, secondary) => {
  const bg = /^#[0-9a-f]{6}$/i.test(primary) ? primary : '#475569';
  const ring = /^#[0-9a-f]{6}$/i.test(secondary) ? secondary : '#cbd5e1';
  const fg = lum(bg) > 0.45 ? '#111827' : '#ffffff';
  const t = abbr.slice(0, 5);
  const size = t.length <= 2 ? 70 : t.length === 3 ? 58 : t.length === 4 ? 46 : 38;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
    <circle cx="80" cy="80" r="74" fill="${bg}" stroke="${ring}" stroke-width="8"/>
    <text x="80" y="${80 + size * 0.36}" font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold"
          font-size="${size}" fill="${fg}" text-anchor="middle">${esc(t)}</text>
  </svg>`);
};

let reused = 0; let own = 0; let made = 0;
for (const t of ident) {
  const dst = (suffix) => path.join(OUT, 'logos', `${t.slug}${suffix}.png`);
  const ownSrc = path.join(OWN_SRC, `${t.slug}.png`);
  if (fs.existsSync(ownSrc)) {
    await sharp(ownSrc).resize(160, 160, { fit: 'inside' }).png({ palette: true }).toFile(dst(''));
    const ownDark = path.join(OWN_SRC, `${t.slug}-dark.png`);
    if (fs.existsSync(ownDark)) await sharp(ownDark).resize(160, 160, { fit: 'inside' }).png({ palette: true }).toFile(dst('-dark'));
    own += 1;
    continue;
  }
  const fb = path.join(FB_PUBLIC, 'logos', `${t.slug}.png`);
  if (fs.existsSync(fb)) {
    fs.copyFileSync(fb, dst(''));
    const fbDark = path.join(FB_PUBLIC, 'logos', `${t.slug}-dark.png`);
    if (fs.existsSync(fbDark)) fs.copyFileSync(fbDark, dst('-dark'));
    reused += 1;
    continue;
  }
  await sharp(badge(t.abbr || t.school.slice(0, 4).toUpperCase(), t.primary_hex, t.secondary_hex))
    .png({ compressionLevel: 9, palette: true })
    .toFile(dst(''));
  made += 1;
}
// drop logos for programs no longer in the identity file
const keep = new Set(ident.flatMap((t) => [`${t.slug}.png`, `${t.slug}-dark.png`]));
for (const f of fs.readdirSync(path.join(OUT, 'logos'))) if (!keep.has(f)) fs.rmSync(path.join(OUT, 'logos', f));
console.log(`✓ sites/basketball/public: logo, icons, CNAME · team logos: ${reused} from football, ${own} basketball art, ${made} monogram badges`);
