# Logos

**Generated directory.** The PNGs here are downscaled copies of the originals in
`assets/logos-src/` — do not hand-edit them; edit the source and re-run the
optimizer.

```
assets/logos-src/<slug>.png        500px original, light mode (full colour / dark ink)
assets/logos-src/<slug>-dark.png   500px original, dark mode  (knocked-out / light wordmark)
        │
        │  scripts/optimize-logos.mjs   (sharp → 160px square, palette PNG)
        ▼
public/logos/<slug>.png            shipped, ~2–7 KB
public/logos/<slug>-dark.png       shipped, ~2–7 KB
```

`npm run build` runs the optimizer via `prebuild`, so the shipped set is always
regenerated from the originals. Run it alone with `npm run logos:optimize`
(`LOGO_PX=<n>` overrides the 160px edge).

## Which file renders (`src/lib/logoSrc.ts`, used by `TeamLogo` + `TeamMarker`)

- **light mode:** `<slug>.png`
- **dark mode:** `<slug>-dark.png` → falls back to `<slug>.png` if it 404s
- **dark mode, `LIGHT_IN_DARK` teams:** `<slug>.png` — these marks read fine on
  our dark surfaces, so the more familiar full-colour version is kept. Edit that
  set in `src/lib/logoSrc.ts`.

Active theme comes from `useIsDark()` in `src/lib/theme.ts`. In the SVG charts, if
every candidate fails the marker renders as a team-colour bubble.

## Adding / replacing a team

Drop `<slug>.png` and `<slug>-dark.png` into `assets/logos-src/` (square,
transparent, ≥ 256px) and run `npm run logos:optimize`. If a program has no
dark-specific art, copy the light file to `<slug>-dark.png`, or add its slug to
`LIGHT_IN_DARK`.

## Legacy scripts

`npm run logos:recolor` predates this layout (it wrote SVGs and a `dark/`
subfolder). Not used by the current build.
