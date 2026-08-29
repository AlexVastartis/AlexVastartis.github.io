# BlueBloodFootball.com

Clean, data-driven college-football "blue blood" charts. Every program's logo plotted
on **The Chart** (Perception Poll) and on four more **Criteria**, each viewable two ways —
a logo scatter or the bell curve of the same data (one toggle). Plus **The Blue Blood
Ranking**: all five criteria as a single score, shown as a bell curve and a grouped
ranked list (Blue Bloods → Debated → the field). Filterable by current conference,
logos or team-colored bubbles, light/dark, PNG export. Overlap is intentional — more
impressive logos are drawn on top.

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

Five **criteria**, each = two raw stats. Per criterion, each team gets a *composite*
z-score (mean of the two stats' z-scores). The **overall Blue Blood score** is the
z-score of a team's mean composite across all five.

| Criterion       | Stat X (scatter)      | Stat Y (scatter)           |
| --------------- | --------------------- | -------------------------- |
| Perception Poll | Weeks in the AP Poll  | Weeks in the AP Top 10     |
| Wins            | All-Time Wins         | All-Time Winning %         |
| Championships   | National Championships| Conference Championships   |
| All-Americans   | Consensus AA          | Unanimous AA               |
| NFL Draft       | NFL Draft Picks       | First-Round Picks          |

Ranked-list groupings (`src/config/ranking.ts`): **Blue Bloods** = overall rank ≤ 6;
**Debated** = Nebraska & Texas (hardcoded — the perennial argument); then z-score bands
(Blue Blood Adjacent ≥ 1.0, National Brands ≥ 0.25, Regional Powers ≥ −0.5, The Field).

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
  + per-criterion composite z-scores + `overall` / `overallRank` / `overallPct`.
- `public/data/meta.json` — per-stat and per-criterion mean / σ / min / max, the
  `overall` distribution, `generatedAt`, and which sources were used.
- `data/snapshots/data-YYYY-MM-DD.json` — dated copy for history.

## Scheduled refresh

`.github/workflows/refresh-data.yml` runs `build-data.mjs` every Sunday (and on manual
dispatch), then commits `public/data/*` if it changed. Add `CFBD_API_KEY` as a repo
secret. Adjust the `cron:` line to change cadence.

## Logos

`public/logos/<slug>.svg` (+ `.png` fallback). Slugs come from `teams.csv`. Drop in
replacements any time — no code change. Optional dark-mode overrides go in
`public/logos/dark/<slug>.svg` and are picked up automatically in dark mode.

## Roadmap

- What-if stat editor: override a team's raw stats, replot live, see which echelon it
  moves into (`src/lib/derive.ts` already recomputes z / composite / overall).
- AP-poll era variations (1936 / 1968 / 1992 + AP365 / AP440) — `src/config/eras.ts`.
- Dark-mode logo set (`public/logos/dark/`), deploy config.
