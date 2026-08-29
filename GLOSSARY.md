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
| **Relative comparison** (a.k.a. **peer comparison**) | on the team card: where a program leads / trails the other teams *near it* on each criterion | `team.comparison`; default in `scripts/build-data.mjs`, override in `data/manual/relative_comparison.csv` |
| **Favourable projection** | on the team card: what it would take to reach the middle of the grouping the program is chasing (for Blue Bloods, the standard to hold), plus a trend-aware line | `team.projection`; default in `scripts/build-data.mjs`, override in `data/manual/projection_overrides.csv` |

## Trajectory

| Term | What it is |
| --- | --- |
| **Trajectory** | the arrow: **Ascending ▲** / **Holding –** / **Receding ▼**. Compares a program's most recent ~20% of seasons with its whole history, in cross-program percentile position, across all ten rating stats (eight with a per-season series). The hover names the season counts, the year ranges, and the biggest movers. Overridable in `data/manual/trend_overrides.csv` | `team.trend` |
| **Trajectory note** | the short pointed phrase after an Ascending/Receding label — *needs the decades*, *a former power*, *still climbing*, *back from the wilderness*, *new money*, *off its peak*, *trading on history*, *a long slide*. Never shown for Holding | `team.note` |
| **Standard label** | `<Grouping> · <Trajectory>[ · <Trajectory note>]` — the muted line on each ranked-list row | `team.label.standard` |
| **Tagline** | the hand-written one-liner about a program's history / peak eras (fan-proud, no disputed claims) | `data/manual/blurbs.csv` → `team.label.personal` |

## Views & pages

| Term | What it is |
| --- | --- |
| **Subject tabs** | one row of six: **Blue Blood Rating** + the five criteria. Blue Blood Rating is `/`; each criterion is `/criteria/:key`. Always in the same place |
| **View toggle** | the three visualisations, in a fixed row under the subject tabs: **Ranked list · Logo plot · Bell curve** (`?view=`). Blue Blood Rating offers list + curve only (no two-stat scatter) |
| **The Chart** | the AP-poll scatter on its own bare full-viewport page (`/the-chart`), no chrome. Reached only by direct link or the small "The Chart" link in the site footer. The shareable hook |
| **Team card** | the highlighted-team panel. On the **ranked list** it's a wide sticky side rail (`variant="full"`): the 8 rating stats grouped by criterion (percentile bars, raw on hover, trimmed stats greyed + struck), trajectory, relative comparison, favourable projection, tagline. On a **chart view** it's a slim top strip (`variant="compact"`): identity + the five criterion scores only, no scroll — `src/components/TeamCard.tsx` |
| **Favourite / highlighted team** | the program you pick (or click); it gets a ring + name on every chart and the team card |
| **Marker** | a logo or a coloured **bubble** on a chart |

## Data

| Term | What it is |
| --- | --- |
| **as-played** wins | wins as they happened on the field (the default). A tie counts as half a win in the win-% stat |
| **NCAA official** wins | as-played minus NCAA-vacated wins/losses (`data/manual/vacated_wins.csv`); the toggle |
| **All-time wins** | one hand-entered "through 1935" row per program in `data/season-records.csv`, set so the program's all-time total matches its Wikipedia figure; CollegeFootballData fills 1936→present |
| **The store** | `data/api/` + `data/season-records.csv` + `data/manual/` — everything the site is built from. `build-data.mjs` never hits the network |
| **Title selectors** | which national-championship selectors count toward the Championships criterion — AP, UPI, FWAA, NFF, USA/CNN, USA/ESPN, AFCA, BCS, CFP, plus CFRA/HAF/NCF pre-1936. One line in `scripts/build-data.mjs` (`TITLE_SELECTORS`); a program's own `claim`-only entries and `not-claimed` rows never count |
| **breakdown.csv** | `public/data/breakdown.csv` — a generated dump of every derived string (grouping, trajectory, note, comparison, projection, tagline) per program. Review here; override in the `data/manual/*_overrides.csv` files |

See `data/manual/README.md` for the schema of every hand-curated file.
