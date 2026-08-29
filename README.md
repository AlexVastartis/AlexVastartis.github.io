# BlueBloodFootball.com

Clean, data-driven college-football "blue blood" charts. Every program's logo plotted
on **The Chart** (Perception Poll), the other stat categories, and standard-deviation
bell curves — filterable by current conference, switchable between logos and team-colored
bubbles, light/dark aware, and exportable to PNG.

## Stack

Vite + React + TypeScript + Tailwind. Charts are hand-built SVG (`d3-scale` only).
Static SPA — deploys to Cloudflare Pages / Netlify / Vercel with no server.

## Run locally

```bash
npm install
npm run build:data   # generates public/data/teams.json from data/manual/*.csv
npm run dev
```

## Data model

| Category        | Stat X                | Stat Y                     |
| --------------- | --------------------- | -------------------------- |
| Perception Poll | Weeks in the AP Poll  | Weeks in the AP Top 10     |
| Wins            | All-Time Wins         | All-Time Winning %         |
| Championships   | National Championships| Conference Championships   |
| All-Americans   | Consensus AA          | Unanimous AA               |
| NFL Draft       | NFL Draft Picks       | First-Round Picks          |

### Sources of truth

- **`data/manual/teams.csv`** — identity: `school, slug, conference, primary_hex,
  secondary_hex, former_fcs`. Edit conference or colors here.
- **`data/manual/stats_manual.csv`** — every raw stat. This is the fallback used when
  no API key is present, and the permanent source for honors (All-Americans, Heisman).
- **CollegeFootballData.com API** (optional) — when `CFBD_API_KEY` is set,
  `npm run build:data` overrides the AP-poll weeks and NFL-draft counts with freshly
  computed API figures. Get a free key at <https://collegefootballdata.com/key> and put
  it in `.env` (see `.env.example`).

`scripts/lib/xlsx-to-csv.mjs` is a one-time seeder that regenerates the two CSVs from
the original `Blue Bloods.xlsx` / `Conference.xlsx`; you normally won't need it again.

### Generated files (committed)

`npm run build:data` writes:

- `public/data/teams.json` — `{ meta, teams[] }` with raw stats + z-scores + percentiles
  + per-category composite z-scores.
- `public/data/meta.json` — per-stat and per-category mean / σ / min / max, plus
  `generatedAt` and which sources were used.
- `data/snapshots/data-YYYY-MM-DD.json` — dated copy for history.

## Scheduled refresh

`.github/workflows/refresh-data.yml` runs `build-data.mjs` every Sunday (and on manual
dispatch), then commits `public/data/*` if it changed. Add `CFBD_API_KEY` as a repo
secret. Adjust the `cron:` line to change cadence.

## Logos

`public/logos/<slug>.svg` (+ `.png` fallback). Slugs come from `teams.csv`. Drop in
replacements any time — no code change. Optional dark-mode overrides go in
`public/logos/dark/<slug>.svg` and are picked up automatically in dark mode.

## Roadmap (slice 2)

Remaining 3 category charts, what-if stat editor with echelon tiers, AP-poll era
variations (1936 / 1968 / 1992 + AP365 / AP440), dark-mode logo set, deploy config.
