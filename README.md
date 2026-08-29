# BlueBloodFootball.com

A century-long ledger of college-football prestige. **The Chart** (`/the-chart`) plots
every program on the AP-poll scatter — the shareable one. **The Blue Blood Ranking**
(`/`) is the grouped ranked list, with a bell-curve alternate. Five **Criteria** pages
break it down. Pick a favourite team (or click any logo) and it's highlighted
everywhere with a detail card. Conference filter, logos / team-colour bubbles,
three-way theme, as-played vs. NCAA-official wins toggle, PNG export.

New here? Read **[GLOSSARY.md](GLOSSARY.md)** for the name of every piece, and
**[data/manual/README.md](data/manual/README.md)** for the hand-curated data schema.

## Stack

Vite + React + TypeScript + Tailwind. Charts are hand-built SVG (`d3-scale` only).
Static SPA — deploys to any static host with no server.

## Run locally

```bash
npm install
cp .env.example .env      # add CFBD_API_KEY (free: collegefootballdata.com/key)
npm run data:api          # consolidate the CFBD store  (first run fetches ~250 years, then it's committed)
npm run logos:sync        # 128px full-colour logos
npm run build:data        # data/api + data/manual  ->  public/data/teams.json   (no network)
npm run dev
```

`build:data` **never hits the network** — it reads the committed store. `data:api`
is the only script that fetches, and only to fill gaps in `data/api/cfbd/`.

## The Blue Blood Rating

`meta.model = "percentile-trimmed-mean"`. Rank each of the ten raw stats within FBS
(kills the skew / disputed-count problems in the honors data). Average the two
percentiles in each criterion. Then take a program's **ten stat percentiles, drop the
single highest and single lowest, and average the other eight** — that's the Rating,
0–100. `team.overall` is its z-score (drives the bell curve).

| Criterion    | Stat A                | Stat B                     | Source |
| ------------ | --------------------- | -------------------------- | ------ |
| AP Poll      | Weeks in the AP Poll  | Weeks in the AP Top 10     | CFBD (`data/api/ap-poll*`) |
| Wins         | All-Time Wins         | All-Time Winning %         | per-season records (`data/season-records.csv`) |
| Championships| National Championships| Conference Championships   | hand-curated (`data/manual/national_titles.csv`, `conference_titles.csv`) |
| All-Americans| Consensus AA          | Unanimous AA               | hand-curated per season, else summary (`data/manual/all_americans.csv`, `stats_summary.csv`) |
| NFL Draft    | Draft Picks           | First-Round Picks          | CFBD (`data/api/draft.json`) |

**Groupings** are placed at natural gaps in the Rating list (`scripts/lib/tiers.mjs`),
not round-number thresholds: Blue Bloods · Blue Blood Fringe · Blue Blood Adjacent ·
National Powers · National Brands · The Field. The build log prints the boundary at
each cut and its gap size.

## Trajectory (the ▲ / – / ▼ arrow)

Compares a program's most recent **20% of its seasons** with its whole prior history,
in cross-program percentile position, across AP weeks, AP top-10 weeks, win rate, AP
national titles and draft picks. Static per build. Every Ascending/Receding program
also gets a one-word **note** (`needs the decades`, `a former power`, …); Holding
programs get none.

## Data layer

```
data/api/                consolidated CFBD store — committed, self-sufficient
  ap-poll.json           every weekly AP ranking row, 1936+
  ap-poll-summary.json   per-team / per-season weeks ranked / top-10 / #1
  draft.json             every NFL draft pick
  conferences.json       current conference per school
  cfbd/…                 raw per-year responses (the cache)
data/season-records.csv  wins/losses/ties per (school, season); source=cfbd 1936+, source=manual before
data/manual/…            hand-curated, one fact per row, every row cites a source — see its README
public/data/teams.json   the built output; each team carries variants: { asPlayed, official }
```

Vacated wins (`data/manual/vacated_wins.csv`) are subtracted only in the **NCAA
official** view; the trajectory always uses as-played wins.

## Scheduled refresh

`.github/workflows/refresh-data.yml` runs `data:api` then `build:data` weekly and
commits the changes. Add `CFBD_API_KEY` as a repo secret. **Rotate the key** if it's
been shared.

## Roadmap

- What-if stat editor (recompute rating/critScore client-side).
- Fill `all_americans.csv` / `conference_titles.csv` with granular rows.
- AP-poll era variations (1936 / 1968 / 1992).
