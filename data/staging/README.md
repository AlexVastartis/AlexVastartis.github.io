# The staging layer

Every input the site is built from. `scripts/build-data.mjs` reads **only** this
folder (plus `data/api/conferences.json`) and never touches the network. Re-run it
any time with `npm run build:data`.

```
_staging_*  raw inputs / API landing spots      (numbers)
_blurb_*    the narrative text on the site      (words)
```

`_staging_` files fed by the API (`_staging_ap_poll_success.csv`,
`_staging_nfl_draft_success.csv`, and the `source=cfbd` rows of `_staging_wins.csv`)
are **rebuilt by `npm run data:api`** from the committed CFBD cache in `data/api/cfbd/`.
Hand edits to those rows are overwritten on the next refresh — edit the manual rows
(`source=manual`) or the other files, which are never touched by the API step.

`#`-prefixed lines are comments. Most files carry a `source` column — cite it
(a URL, `ncaa-records`, `heisman.com`, …).

## Inputs — one per Tab Row entry

| File | One row is | Feeds | Filled by |
| --- | --- | --- | --- |
| `_staging_blue_blood_rating.csv` | `key,value` | the rating knobs: trim fraction, trend window, `ap_from`, `title_selectors`, the three `tier_anchor_N` (last program in grouping N, 1-based) | hand |
| `_staging_ap_poll_success.csv` | `school,season` → weeks in poll / top-10 / top-5 / at #1, and `final_rank` | **AP Poll Success** + trajectory | `npm run data:api`; hand between refreshes |
| `_staging_wins.csv` | `school,season` → `wins,losses,ties,wins_vacated,losses_vacated,vacated_note,source` | **Wins** + trajectory; `wins_vacated`/`losses_vacated` feed the **NCAA official** toggle only | `data:api` (`source=cfbd`, 1936→present). Pre-1936 rebuilt by `npm run wins:pre1936`: one `source=ncaa` row per program in `_staging_wins_ncaa.csv` (all-time calibrated to the NCAA FBS Records book), `source=cfbref` per-season 1869–1935 game logs for everyone else. `source=cfbd` and `source=ncaa`/`cfbref`/`manual` rows are both left alone by the refresh; the `*_vacated` columns are carried forward by (school, season) |
| `_staging_wins_ncaa.csv` | `school` → `ncaa_wins,ncaa_losses,ncaa_ties,ncaa_pct,through` | the pre-1936 `source=ncaa` calibration rows in `_staging_wins.csv` (the ~31 programs the book lists) | hand — NCAA "FBS Records" book, "All-Time Won-Loss Records" (official, through 2024) |
| `_staging_championships.csv` | one title: `school,year,scope,selector,conference,shared,status,source` | **Championships** + trajectory | hand |
| `_staging_all_americans.csv` | one consensus selection: `year,school,player,pos,consensus,unanimous,source` | **All-Americans** + trajectory | hand (NCAA record book) |
| `_staging_nfl_draft_success.csv` | `school,season` → `picks,first_round_picks` | **NFL Draft Success** + trajectory | `npm run data:api`; hand between refreshes |
| `_staging_identity.csv` | `school,slug,conference,primary_hex,secondary_hex,former_fcs` | colours, logo filename, FCS flag; `conference` is a fallback (API wins) | hand |
| `_staging_heisman.csv` | one winner: `year,player,school,source` | shown on the team panel (not a rating stat) | hand |
| `_staging_summary_fallback.csv` | one program: legacy totals | fallback **only** where a granular file above has no rows (mostly conference titles; All-Americans for ~21 newer programs) | hand; shrinks over time |
| `_staging_grouping_overrides.csv` | `school,grouping,note` | forces a program's grouping | optional |

### `_staging_championships.csv` detail

`scope=national`: a title **year** counts once when the school has ≥1 row whose
`selector` is in `title_selectors` and `status` is not `not-claimed`. `selector=claim`
(a school's own unbacked claim) never counts.
`scope=conference`: `shared=1` for a co-championship (still one). While a program has
**no** conference rows it falls back to its `conference_titles` in the summary file.

## Blurbs

**Every blurb file ships pre-filled** — all 130 rows carry the string `build-data.mjs`
would otherwise compute, so you can edit any of them in place. A filled row is shown
verbatim; **clear a row** (delete its value, keep the `school`) to hand it back to the
build.

| File | One row | What it is |
| --- | --- | --- |
| `_blurb_tier_descriptions.csv` | `grouping,text` | the line under each tier header (6 rows) |
| `_blurb_tagline.csv` | `school,text` | the team-panel tagline — history/peak, ≤ ~12 words, no disputed claims |
| `_blurb_identity_line.csv` | `school,text` | the team-panel identity line. **Shipped cleared** — `build-data.mjs` computes `#rank · rating · grouping` live per wins-mode each build, so the panel and the ranked-list row never disagree. Fill a row only to hand-override one program (a filled row then shows verbatim in both wins modes) |
| `_blurb_ranking_row_subline.csv` | `school,text` | the ranked-list row sub-line (the trajectory, described) |
| `_blurb_trajectory.csv` | `school,dir,note,tooltip` | `dir` ∈ up/down/even — **clear the cell** to let the algorithm set it from the data each build (a value pins it permanently). `note` = suffix after Ascending/Descending (empty for "even"; a single space forces none). `tooltip` = the full hover string |
| `_blurb_standing.csv` | `school,text` | the team-panel **Standing** blurb — the program vs the tier it wants, in last-decade terms |
| `_blurb_path_forward.csv` | `school,text` | the team-panel **Path Forward** blurb — what it would take to get there, modern-season terms |

Re-seed all of them from the current build with
`node scripts/build-data.mjs && node scripts/seed-blurbs.mjs`.

## Game-level sources

`_staging_games_cfbref.csv` — 20,841 games, seasons **1869–1935** (1871/1873 n/a — no
games played), from a College Football Reference season-page export
(`season,week,date,winner,winner_pts,loser,loser_pts,winner_venue,notes`; `winner_venue`
∈ home/away/neutral, Jan bowls fold into the prior season). Built by
`npm run games:cfbref` from `Book 2.xlsx` plus any single-season `*.csv` fills in
`cfbref-supplemental/` (1934 lives there — it was missing from the workbook export).
**Pre-1936 wins source for programs the NCAA book doesn't list:** `npm run wins:pre1936`
sums every game in which one side maps to a current FBS program (opponent caliber
irrelevant, per project rule) into the `source=cfbref` rows of `_staging_wins.csv`.
Coverage is complete ~1905→1935 but thin before that and light on small-college opponents
throughout — Ohio State shows ~126 pre-1936 wins here vs. 244 in the NCAA book — which is
why the ~31 programs the book does list are calibrated from `_staging_wins_ncaa.csv`
instead. This file is a College Football Reference scrape (`All College Football Games
Scrape.xlsx` also has 1936→present but is the same source with the same pre-1913 gap, so
it isn't wired in). Also usable for head-to-head and margins.

`_staging_games.csv` — every game result 1869–2025 (`season,date,team1,score1,team2,score2`),
a separate CFBD-derived dump. **Not fed into anything.** Superseded pre-1936 by the cfbref
file above; kept only as raw material for a future head-to-head / margins feature.

## Reviewing the output

`build-data.mjs` also writes `public/data/breakdown.csv` every run — the *effective*
grouping / trajectory / note / standing / pathForward / tagline for all 130
programs. Read it there, then paste rows into the `_blurb_*` files to change them.
The build log prints what moved (title counts vs. the old summary, tier boundaries,
trajectory split).
