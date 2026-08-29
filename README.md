# BlueBloodFootball.com

A century-long ledger of college-football prestige. Every program's logo plotted on
**The Chart** (Perception Poll) and four more **Criteria**, each viewable two ways — a
logo scatter or the bell curve of the same data (one toggle). Plus **The Blue Blood
Rating**: all five criteria as a single number, shown as a bell curve and a grouped
ranked list with a per-program trajectory arrow. Pick a favourite team and it's
highlighted everywhere with a detail card. Conference filter, logos or team-colour
bubbles, three-way theme (System / Light / Dark), PNG export. Overlap is intentional —
more impressive logos are drawn on top.

## Stack

Vite + React + TypeScript + Tailwind. Charts are hand-built SVG (`d3-scale` only).
Static SPA — deploys to Cloudflare Pages / Netlify / Vercel with no server.

## Run locally

```bash
npm install
cp .env.example .env          # add your CFBD_API_KEY (free: collegefootballdata.com/key)
npm run build:data            # -> public/data/teams.json  (first run fetches ~300 years of API data, then caches)
npm run logos:sync            # -> public/logos/*.png  (500px full-colour, light + dark)
npm run dev
```

Without a key, `build:data` falls back to `data/manual/*.csv` and the trend indicator
stays flat.

## The Blue Blood Rating (overall model)

`meta.model = "percentile-trimmed-mean"`. For each of the ten raw stats, take the
program's **within-FBS percentile** (kills the skew and disputed-count problems —
national titles are skew 3.0 / 69% zeros / leader +6σ under a z-score). Average the two
percentiles in each criterion, then combine the five criteria with a **40% trimmed
mean**: each program's single best and single worst criterion are dropped. The trim is
the point — it neutralises the championship spike for the bluest bloods and the
structural conference-title zero for independents in one operation, and it encodes
"blue blood" as sustained breadth rather than one dominant facet. Companion
**Consistency** = dispersion of the five criterion percentiles (portfolio vs. peak).
`overall` in the data is the z-score of the rating (drives the bell curve).

| Criterion       | Stat X (scatter)      | Stat Y (scatter)           |
| --------------- | --------------------- | -------------------------- |
| Perception Poll | Weeks in the AP Poll  | Weeks in the AP Top 10     |
| Wins            | All-Time Wins         | All-Time Winning %         |
| Championships   | National Championships| Conference Championships   |
| All-Americans   | Consensus AA          | Unanimous AA               |
| NFL Draft       | NFL Draft Picks       | First-Round Picks          |

Ranked-list groups (`src/config/ranking.ts`): **Blue Bloods** = rating rank ≤ 6;
**Debated** = Nebraska & Texas (hardcoded — the perennial argument); **Blue Blood
Adjacent** ≥ 88 rating; **National Brands** ≥ 72; **The Field** = everyone else.

## Trend indicator

Sparse ▲ / ▼ / – (most programs hold). Two poll-era signals, z-scored across FBS:
`formZ` = last 10 seasons vs. the prior 20 (AP weeks + win %); `zDecay` = how far a
program sits below its own all-time ceiling (best 15-yr AP window + best 20-yr win-%
window). `up` needs strong positive form; `down` needs weak form **or** heavy decay.
Pre-1936 dynasties (e.g. Minnesota) are only partly captured — the calculation sees the
poll era, where they've been steadily mid.

## Data sources & cadence

| Cadence | Data | Source |
| --- | --- | --- |
| Live, in-season | AP poll weeks, records/wins, NFL draft counts, trend | CFBD API (`CFBD_API_KEY`) |
| Annual (~Feb) | Consensus/Unanimous All-Americans, Heisman, national & conference titles | `data/manual/stats_manual.csv` (re-seed from `Blue Bloods.xlsx` via `npm run seed`, or edit the CSV) |
| Rare | Realignment, colours, personalised blurbs, logo overrides | `data/manual/teams.csv`, `data/manual/blurbs.csv`, `public/logos/` |

Per-year CFBD responses are cached under `data/snapshots/cfbd/` (gitignored); only the
current season is re-fetched. `data/manual/blurbs.csv` (`school,personal_label`) holds
the hand-written era-anchored program labels; blank → the standardised label is used.

### Generated files (committed)

- `public/data/teams.json` — `{ meta, teams[] }`: raw stats, z-scores, percentiles,
  `critScore`, `rating`, `ratingRank`, `consistency`, `trend`, `label`, `overall`.
- `public/data/meta.json` — distributions, `model`, `trendWindowYears`, `previous`
  (prior snapshot ranks for the year-over-year note).
- `data/snapshots/data-YYYY-MM-DD.json` — dated copy.

## Scheduled refresh

`.github/workflows/refresh-data.yml` runs `build-data.mjs` weekly (and on manual
dispatch), commits `public/data/*` if it changed. Add `CFBD_API_KEY` as a repo secret.
**Rotate the key** at collegefootballdata.com if it has been shared anywhere.

## Logos

See `public/logos/README.md`. `npm run logos:sync` pulls the full 500px colour set
(light + dark) from CFBD; `npm run logos:recolor` is a one-off that repaints any
white-knockout SVGs. Manual overrides: drop a file at `public/logos/<slug>.{svg,png}`
or `public/logos/dark/<slug>.png`.

## Roadmap

- What-if stat editor: override a team's raw stats, replot live, see the tier it moves
  into (`src/lib/derive.ts` recomputes; `tierContext` in `ranking.ts` gives the gap).
- AP-poll era variations (1936 / 1968 / 1992 + AP365 / AP440) — `src/config/eras.ts`.
