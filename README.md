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
npm run build:data        # data/staging  ->  public/data/teams.json   (no network)
npm run dev
```

**Nothing in this project touches the network.** The entire data store lives in
`data/staging/` as hand-maintained CSVs, committed to the repo. `build:data` reads
those, recomputes every rating and derived string offline, and writes
`public/data/`. To update the numbers, edit the CSVs and re-run `build:data`.

## The Blue Blood Rating

`meta.model = "percentile-trimmed-mean"`. Rank each of the ten raw stats within FBS
(kills the skew / disputed-count problems in the honors data). Average the two
percentiles in each criterion. Then take a program's **ten stat percentiles, drop the
single highest and single lowest, and average the other eight** — that's the Rating,
0–100. `team.overall` is its z-score (drives the bell curve).

| Criterion    | Stat A                | Stat B                     | Source file |
| ------------ | --------------------- | -------------------------- | ----------- |
| AP Poll      | Weeks in the AP Poll  | Weeks in the AP Top 10     | `data/staging/_staging_ap_poll_success.csv` |
| Wins         | All-Time Wins         | All-Time Winning %         | `data/staging/_staging_wins.csv` |
| Championships| National Championships| Conference Championships   | `data/staging/_staging_championships.csv` |
| All-Americans| Consensus AA          | Unanimous AA               | `data/staging/_staging_all_americans.csv` |
| NFL Draft    | Draft Picks           | First-Round Picks          | `data/staging/_staging_nfl_draft_picks{,_afl}.csv` |

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
data/staging/            the whole store — hand-maintained CSVs, committed
  _staging_wins.csv        wins/losses/ties per (school, season), 1869→present
  _staging_ap_poll_success.csv   AP weeks / top-10 / final rank per (school, season)
  _staging_championships.csv     one national/conference title per row
  _staging_all_americans.csv     one consensus All-America selection per row
  _staging_nfl_draft_picks.csv   one NFL draft pick per row (+ _afl.csv for 1960–66)
  _staging_*.csv            identity, heisman, rating knobs, grouping overrides
  _blurb_*.csv             the site's narrative text
  conferences.json         current conference per school (year + bySchool map)
data/archive/             frozen raw source dumps the CSVs were originally built from —
                          read by nothing; kept for provenance and the odd recompute
public/data/teams.json    the built output; each team carries variants: { asPlayed, official }
```

`build:data` reads only `data/staging/` and never the network. Vacated wins
(`wins_vacated`/`losses_vacated` columns in `_staging_wins.csv`) are subtracted only
in the **NCAA official** view; the trajectory always uses as-played wins.

## Updating the data

Edit the CSVs in `data/staging/` by hand and re-run `npm run build:data`. There is
no fetch step and no API key. `npm run draft` and `npm run archive` are optional
offline helpers that recompute derived sheets / `PROGRAMS.md` from the staging CSVs.

## Roadmap

- What-if stat editor (recompute rating/critScore client-side).
- Fill `all_americans.csv` / `conference_titles.csv` with granular rows.
- AP-poll era variations (1936 / 1968 / 1992).
