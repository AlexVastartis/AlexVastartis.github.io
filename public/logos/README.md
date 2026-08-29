# Logos

One set of marks per program, keyed by the `slug` column in
`data/manual/teams.csv` (e.g. `southern-california`, `ole-miss`, `miami-fl`).

```
public/logos/<slug>.svg        light-theme mark (preferred when present)
public/logos/<slug>.png        light-theme mark, 500px full-colour (CFBD)
public/logos/dark/<slug>.svg   dark-theme override (optional)
public/logos/dark/<slug>.png   dark-theme mark, 500px (CFBD)
```

## Fallback order (see `src/components/TeamMarker.tsx`)

- **dark mode:** `dark/<slug>.svg` → `dark/<slug>.png` → `<slug>.svg` → `<slug>.png`
- **light mode:** `<slug>.svg` → `<slug>.png` → `dark/<slug>.svg` → `dark/<slug>.png`

If everything 404s, the marker renders as a team-colour bubble.

## Regenerating

- `npm run logos:sync` — downloads the full 500px full-colour set (light + dark)
  from CollegeFootballData. Needs `CFBD_API_KEY`. Curated `<slug>.svg` files are
  left in place; only PNGs are (re)written.
- `npm run logos:recolor` — one-off: repaints any remaining white-knockout SVGs
  with the team's primary colour (+ a near-white `dark/` copy). Originals are kept
  in `data/manual/logos-original/`. `logos:sync` retires these once a colour PNG
  exists.

## Manual overrides

Drop a file at any of the paths above and it wins per the fallback order — no code
change. Prefer a clean SVG or a ≥ 256px transparent PNG.
