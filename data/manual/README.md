# Hand-curated data

Everything in this folder is entered by hand. Every file except `teams.csv` and
`blurbs.csv` has a **`source`** column on every row — put a citation there (a URL,
"ncaa-records", "heisman.com", …). `#`-prefixed lines are treated as comments.

`scripts/build-data.mjs` aggregates these rows into the counts the model needs and
can be re-run any time (`npm run build:data`). None of this is fetched.

| File | One row is… | Feeds | Notes |
| --- | --- | --- | --- |
| `../season-records.csv` | one (school, season) record: `wins,losses,ties,source` | all-time wins & win % | `source=cfbd` rows are (re)written by `npm run data:api`; **`source=manual` rows are never touched** — that's where pre-1936 seasons go. Convention: one `season=1899` lump row per program for all pre-1900 football. The current pre-1900 rows are rough estimates — correct them. |
| `national_titles.csv` | one claimed title: `school,year,selector,note,source` | Championships criterion (national side) | `selector` ∈ AP, BCS, CFP, Coaches, Historical, … A team's count = **distinct years** with a title from a selector in `TITLE_SELECTORS` (set in `build-data.mjs`). `Coaches` = split-title co-champions, currently **off** by default. |
| `conference_titles.csv` | one league title: `school,year,conference,shared,source` | Championships criterion (conference side) | `shared=1` for a co-championship (still counts as 1). While a team has **no** rows here it falls back to the summary count in `stats_summary.csv`. |
| `all_americans.csv` | one (school, year): `consensus,unanimous,source` | All-Americans criterion (+ eventually trajectory) | Per-season **counts**, not per-player. While a team has no rows it falls back to `stats_summary.csv` and drops the All-Americans term from its trajectory. |
| `heisman.csv` | one winner: `year,player,school,source` | shown on the team card | ~90 rows, complete. |
| `vacated_wins.csv` | one program's vacated wins: `school,seasons,wins_vacated,note,source` | the **NCAA official** wins toggle only | Trajectory always uses as-played wins. |
| `teams.csv` | one program's identity: `school,slug,primary_hex,secondary_hex,former_fcs` | colours, logo filename, FCS flag | **No source** — this is our own identity data. Conference now comes from the API (`data/api/conferences.json`). |
| `stats_summary.csv` | one program: legacy summary counts | fallback only, where a granular file above has no rows for that team | Trim/replace as the granular files fill in. |
| `blurbs.csv` | one program: `school,tagline` | the team-card tagline | **No source.** History/peak, fan-proud, ≤ ~9 words. No "winningest" unless true, no figures under a cloud, no "Position U" claims. |

## Adding rows

Append to the relevant file and re-run `npm run build:data`. The build log prints
what changed (e.g. national-title counts vs. the old summary, grouping boundaries,
trajectory split) so you can sanity-check.
