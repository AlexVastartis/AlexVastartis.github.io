# The staging layer

Every input the site is built from — hand-maintained CSVs, committed to the repo.
`scripts/build-data.mjs` reads **only** this folder and never touches the network.
There is no fetch step and no API key: to change a number, edit the CSV and re-run
`npm run build:data`.

```
_staging_*        raw inputs      (numbers)
_blurb_*          narrative text  (words)
conferences.json  current conference per school (year + bySchool map)
```

`#`-prefixed lines are comments. Most files carry a `source` column — cite it
(a URL, `ncaa-records`, `heisman.com`, …). The frozen raw dumps these were
originally compiled from live in `data/archive/` and are read by nothing.

## Inputs — one per Tab Row entry

| File | One row is | Feeds | Filled by |
| --- | --- | --- | --- |
| `_staging_blue_blood_rating.csv` | `key,value` | the rating knobs: trim fraction, trend window, `ap_from`, `title_selectors`, the three `tier_anchor_N` (last program in grouping N, 1-based) | hand |
| `_staging_ap_poll_success.csv` | `school,season` → weeks in poll / top-10 / top-5 / at #1, and `final_rank` | **AP Poll Success** + trajectory | hand |
| `_staging_wins.csv` | `school,season` → `wins,losses,ties,wins_vacated,losses_vacated,vacated_note,source` | **Wins** + trajectory; `wins_vacated`/`losses_vacated` feed the **NCAA official** toggle only (dated to their season, so the As Of snapshots and By Decade columns honor it too) | hand. `source=history` per-season W-L-T (1936→present for all; 1869–1935 where game-level records survive). `source=ncaa` = one calibration row per program in `_staging_wins_ncaa.csv` (all-time matched to the NCAA FBS Records book). `source=ncaa-history` = per-season rows for programs with no game data and no book line. `source=manual` = hand lumps / corrections |
| `_staging_wins_ncaa.csv` | `school` → `ncaa_wins,ncaa_losses,ncaa_ties,ncaa_pct,through` | the pre-1936 `source=ncaa` calibration rows in `_staging_wins.csv` (the ~33 programs the book lists) | hand — NCAA "FBS Records" book, "All-Time Won-Loss Records" (official, through 2024) |
| `_staging_championships.csv` | one title: `school,year,scope,selector,conference,shared,status,source` | **Championships** + trajectory | hand |
| `_staging_all_americans.csv` | one consensus selection: `year,school,player,pos,consensus,unanimous,source` | **All-Americans** + trajectory | hand (NCAA record book) |
| `_staging_nfl_draft_success.csv` | `school,season` → `picks,first_round_picks` | **NFL Draft Success** + trajectory | `npm run draft` from `_staging_nfl_draft_picks.csv`; hand between |
| `_staging_identity.csv` | `school,slug,conference,primary_hex,secondary_hex,former_fcs` | colours, logo filename, FCS flag; `conference` is a fallback (`conferences.json` wins) | hand |
| `_staging_heisman.csv` | one winner: `year,player,school,source` | shown on the team panel (not a rating stat) | hand |
| `_staging_summary_fallback.csv` | one program: legacy totals | fallback **only** where a granular file above has no rows (mostly conference titles; All-Americans for ~21 newer programs) | hand; shrinks over time |
| `_staging_grouping_overrides.csv` | `school,grouping,note` | forces a program's grouping | optional |

### `_staging_championships.csv` detail

`scope=national`: a title **year** counts once when the school has ≥1 row whose
`selector` is in `title_selectors` and `status` is not `not-claimed`. `selector=claim`
(a school's own unbacked claim) never counts.
`status=vacated` (USC 2004): counts in the **as played** view only — the **NCAA official** toggle
strikes it, in the present day and in every point-in-time snapshot. A year is struck only if
EVERY counting row for it is vacated.
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

The pre-1936 per-season `source=history` rows in `_staging_wins.csv` were compiled
from a game-level export now frozen at `data/archive/games-pre1936.csv` (~20,800
games, seasons **1869–1935**; every game in which one side maps to a current FBS
program contributes a W / L / T, opponent caliber irrelevant per project rule).
Coverage is complete ~1905→1935 but thin before that — Ohio State's game-level
pre-1936 total (~126 wins) runs well below the NCAA book's 244 — which is why the
~33 programs the book lists carry a `source=ncaa` calibration row instead. Nothing
in the build reads the archived game file; to revise a pre-1936 total, edit the
rows in `_staging_wins.csv` directly.

`_staging_games.csv` — every game result 1869–2025 (`season,date,team1,score1,team2,score2`).
**Not fed into anything.** Kept only as raw material for a future head-to-head /
margins feature; safe to delete otherwise.

## Reviewing the output

`build-data.mjs` also writes `public/data/breakdown.csv` every run — the *effective*
grouping / trajectory / note / standing / pathForward / tagline for all 130
programs. Read it there, then paste rows into the `_blurb_*` files to change them.
The build log prints what moved (title counts vs. the old summary, tier boundaries,
trajectory split).
