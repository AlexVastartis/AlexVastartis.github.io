# Glossary

Shared names for the pieces, so feedback can point precisely.

## The model

| Term | What it is | Where it lives |
| --- | --- | --- |
| **Stat** (×10) | a single raw number — e.g. *All-Time Wins*, *Weeks in the AP Top 10* | `src/config/stats.ts` → `STATS` |
| **Criterion** (×5) | a pair of stats treated as one theme: **AP Poll Success**, **Wins**, **Championships**, **All-Americans**, **NFL Draft Success** | `src/config/stats.ts` → `CATEGORIES` (the AP-Poll criterion's internal key is `perception`) |
| **Stat percentile** | a stat's rank within all 130 FBS programs, 0–100 | computed in `scripts/build-data.mjs` |
| **Criterion score** | 0–100, the mean of a criterion's two stat percentiles | `team.critScore[criterion]` |
| **Blue Blood Rating** (a.k.a. **Rating**) | 0–100. Take a program's 10 stat percentiles, drop the single highest and single lowest, average the other 8 | `team.rating`, `team.ratingRank` |
| **Rating distribution** | the Rating turned into a z-score and drawn on a normal curve | the "Bell curve" view on `/` |

## Groupings

| Term | What it is |
| --- | --- |
| **Grouping** (a.k.a. **tier**) | which band a program sits in. Six of them, boundaries placed at natural gaps in the Rating list (`scripts/lib/tiers.mjs`), overridable in `data/manual/grouping_overrides.csv`: **Blue Bloods** · **Blue Blood Fringe** · **Blue Blood Contenders** · **National Powers** · **National Brands** · **The Field** |
| **Grouping blurb** | the paragraph under each grouping heading in the ranked list | `src/config/ranking.ts` → `GROUPING_BLURB` |
| **Standing** | on the team card: where a program sits against the tier it wants — the **blue-blood line** for Blue Bloods / Fringe / Contenders, the next tier up otherwise — told in recent-decade terms (record, winning seasons, top-ten teams, titles). Gushes about the blue bloods that have earned it | `team.standing`; default in `scripts/build-data.mjs`, override in `data/staging/_blurb_standing.csv` |
| **Path Forward** | on the team card: what it would take to get there, in modern-season terms (12 games + conference title game + 12-team playoff). For Blue Bloods, the line to stay above | `team.pathForward`; default in `scripts/build-data.mjs`, override in `data/staging/_blurb_path_forward.csv` |

## Trajectory

| Term | What it is |
| --- | --- |
| **Trajectory** | the arrow: **Ascending ▲** / **Maintaining –** / **Descending ▼** (a doubled, stacked arrow = an emphatic move). Runs the rating formula twice — once on all-time totals, once on the last ~10 seasons ranked among every program's last decade — and compares the two. Programs with < 30 seasons on record get no arrow. The hover quotes the two ratings plus the tangible last-decade facts (record, winning seasons, top-ten teams, title drought) behind the direction. Overridable in `data/staging/_blurb_trajectory.csv` | `team.trend` |
| **Trajectory note** | the short pointed phrase after an Ascending/Descending label — a concrete last-decade fact (*no title since 1997*, *3 national titles in the decade*, *4 winning seasons in 10*). Never shown for Maintaining | `team.note` |
| **Standard label** | the muted sub-line on each ranked-list row — the trajectory, described (no grouping; the section header already has it) | `team.label.standard` |
| **Tagline** | the hand-written one-liner about a program's history / peak eras (fan-proud, no disputed claims) | `data/manual/blurbs.csv` → `team.label.personal` |

## Views & pages

| Term | What it is |
| --- | --- |
| **Subject tabs** | one fixed row: the prominent **Blue Blood Rating** (the primary view, `/`) then the five criteria (`/criteria/:key`). Never moves |
| **View toggle** | right-hand end of the subject row: **List View · Chart View · Bell Curve** (`?view=`) — shown only for a criterion. Blue Blood Rating is the ranked list only, no toggle |
| **Element map** | a site-wide inspection layer: `?map=1` in the URL, or the **Map** button next to the theme toggle. Outlines one of each visible UI region and pins a labelled chip in the nearest page gutter (hover a chip for its description). The chip label is the term to use in edit requests. Needs a window ≥ 1024px. Terms live in `src/map/registry.ts`; each region is tagged with `data-map="<term>"` in its component |
| **Gap / range notes** | hand-lettered annotations in the true left page margin of the Blue Blood Rating list (wide desktop only). **Gap note**: `≈N% gap` with an arrow pointing straight into the gap between two groupings (the rating drop across the boundary). **Range note**: a curly brace spanning the **Blue Bloods** and **Blue Blood Contenders** groupings, labelled with the rating spread (top team minus base, e.g. `3.0% range`). Off by default — toggle with the ✎ **notes toggle** in the margin left of the Blue Blood Rating tab |
| **Tier boundaries** | all six groupings fall out of the largest rating **gaps** in the top ~45 (`scripts/lib/tiers.mjs` → `detectTiers`; ratings below 60 don't create a boundary). Gap-driven so a tier grows or shrinks to absorb a program that moves — e.g. in the what-if editor — instead of a fixed rank cut-off pushing someone out. Force one program with `data/staging/_staging_grouping_overrides.csv` |
| **Blue Blood benchmark** | a dashed marker line inside the **Blue Bloods** tier at the spot the "average Blue Blood" would rank — the mean of the six's stat percentiles (a true independent is dropped from the conference-title average only), run through the same trimmed-mean rating formula. No rank or rating shown inline; the rating and the ten-stat breakdown are on hover. `meta.blueBloodBenchmark` from `build-data.mjs` → `computeBenchmark()` |
| **Column sort** | on a criterion's **List View** only, the header cells sort (Program, the two stats, Pctl). The Blue Blood Rating list is not sortable — it keeps its tier groupings and the five-bar criterion strip |
| **Marker toggle** | Logos vs. coloured bubbles — in the chart's action bar (Chart View / Bell Curve), left of the PNG button |
| **Jump** | the `⌖ jump` control in the team panel — scrolls the favourite's row to the centre of whatever list is on screen. (Picking a team no longer auto-scrolls.) |
| **The Chart** | the AP-poll scatter on its own bare full-viewport page (`/the-chart`), no chrome. Reached only by direct link or the small "The Chart" link in the site footer. The shareable hook |
| **Team card** | the highlighted-team panel. On the **ranked list** it's a wide sticky side rail (`variant="full"`): the 8 rating stats grouped by criterion (percentile bars, raw on hover, trimmed stats greyed + struck), Trajectory, Standing, Path Forward, tagline. On a **chart view** it's a slim top strip (`variant="compact"`): identity + the five criterion scores only, no scroll — `src/components/TeamCard.tsx` |
| **Favourite / highlighted team** | the program you pick (or click); it gets a ring + name on every chart and the team card |
| **Marker** | a logo or a coloured **bubble** on a chart |

## Data

| Term | What it is |
| --- | --- |
| **The staging layer** | `data/staging/` — every input, `build-data.mjs` reads only this (plus `data/api/conferences.json`) and never hits the network. `_staging_*` = numbers / API landing spots, `_blurb_*` = the site's narrative text. `npm run data:api` refreshes the CFBD-fed `_staging_*` files from `data/api/cfbd/`; `npm run build:data` compiles staging → `public/data/` |
| **Staging file per tab** | one `_staging_*` file behind each Tab Row entry: `_staging_blue_blood_rating.csv` (the rating knobs), `_staging_ap_poll_success.csv`, `_staging_wins.csv` (incl. `wins_vacated`/`losses_vacated` columns), `_staging_championships.csv` (national + conference), `_staging_all_americans.csv`, `_staging_nfl_draft_success.csv`. Plus `_staging_identity.csv`, `_staging_heisman.csv`, `_staging_summary_fallback.csv`, `_staging_grouping_overrides.csv` |
| **Blurb file** | `_blurb_*` — the editable text: `tier_descriptions`, `tagline`, `identity_line`, `ranking_row_subline`, `trajectory` (dir/note/tooltip), `standing`, `path_forward`. `build-data.mjs` computes a default for each; a filled row wins |
| **NCAA official** wins | the default view — as-played minus NCAA-vacated wins/losses (the `wins_vacated`/`losses_vacated` columns in `_staging_wins.csv`) |
| **as-played** wins | wins as they happened on the field, vacated results added back in. The right-hand toggle option. A tie counts as half a win in the win-% stat |
| **All-time wins** | sum of per-season rows in `_staging_wins.csv`. **1936→present** (`source=cfbd`): CollegeFootballData season records, rebuilt by `npm run data:api`. **Pre-1936**, rebuilt by `npm run wins:pre1936`: for the ~31 programs the NCAA "FBS Records" book publishes an all-time won-loss line for, one `source=ncaa` row (from `_staging_wins_ncaa.csv`) sized so the all-time **official** total matches the book (e.g. Ohio State 990-337-53 through 2024) with the live season on top; every other program uses `source=cfbref` per-season 1869–1935 game logs, which thin out before ~1905 and run below the book. All non-`cfbd` rows are left untouched by the API refresh |
| **Title selectors** | which national-championship selectors count toward the Championships criterion — AP, UPI, FWAA, NFF, USA/CNN, USA/ESPN, AFCA, BCS, CFP, plus CFRA/HAF/NCF pre-1936. The `title_selectors` row in `_staging_blue_blood_rating.csv`; a program's own `claim`-only entries and `not-claimed` rows never count |
| **breakdown.csv** | `public/data/breakdown.csv` — a generated dump of every derived string (grouping, trajectory, note, standing, pathForward, tagline) per program. Review here; override in the `data/staging/_blurb_*.csv` files |

See `data/staging/README.md` for the schema of every input file.
