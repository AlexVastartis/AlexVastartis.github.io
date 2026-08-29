# Hand-curated data

Everything in this folder is entered by hand. Every file except `teams.csv` and
`blurbs.csv` has a **`source`** column on every row — put a citation there (a URL,
"ncaa-records", "heisman.com", …). `#`-prefixed lines are treated as comments.

`scripts/build-data.mjs` aggregates these rows into the counts the model needs and
can be re-run any time (`npm run build:data`). None of this is fetched.

| File | One row is… | Feeds | Notes |
| --- | --- | --- | --- |
| `../season-records.csv` | one (school, season) record: `wins,losses,ties,source` | all-time wins & win % | `source=cfbd` rows are rebuilt every `npm run data:api` (CFBD names canonicalised to ours, non-FBS dropped); **`source=manual` rows are never touched**. Convention: one `season=1935` "through 1935" lump row per pre-1936 program. For the marquee programs the lump = *published all-time − CFBD(1936+)*, so all-time matches the record books; elsewhere it's `CFBD(1900–1935) + a small pre-1900 estimate`. Correct any that look off. |
| `national_titles.csv` | one (school, year, selector): `school,year,selector,status,source` | Championships criterion (national side) | `selector` ∈ AP, UPI, FWAA, NFF, USA/CNN, USA/ESPN, AFCA, BCS, CFP (pre-1936: CFRA, HAF, NCF), or `claim` for a school's own unbacked claim. `status` ∈ `` (counts), `not-claimed` (a selector named them, the school doesn't claim it — doesn't count), `vacated`, `disputed`. A team's count = **distinct years** with a row whose `selector` ∈ `TITLE_SELECTORS` (`build-data.mjs`) and `status ≠ not-claimed`. `claim` rows never count. |
| `conference_titles.csv` | one league title: `school,year,conference,shared,source` | Championships criterion (conference side) | `shared=1` for a co-championship (still counts as 1). While a team has **no** rows here it falls back to the summary count in `stats_summary.csv`. |
| `all_americans.csv` | one (school, year): `consensus,unanimous,source` | All-Americans criterion (+ trajectory) | Per-season **counts** of consensus All-Americans (Wikipedia year lists, 1924–present). `unanimous` is left blank — the source doesn't flag it, so `build-data.mjs` takes the unanimous stat from `stats_summary.csv`. While a team has no `consensus` rows it falls back to `stats_summary.csv`. |
| `heisman.csv` | one winner: `year,player,school,source` | shown on the team card | complete, 1935–present. |
| `vacated_wins.csv` | one (school, season): `school,year,wins_vacated,losses_vacated,note,source` | the **NCAA official** wins toggle only | `build-data.mjs` sums per school; the `official` variant removes `wins_vacated` from wins & games and `losses_vacated` from games. Trajectory always uses as-played wins. |
| `teams.csv` | one program's identity: `school,slug,primary_hex,secondary_hex,former_fcs` | colours, logo filename, FCS flag | **No source** — this is our own identity data. Conference now comes from the API (`data/api/conferences.json`). |
| `stats_summary.csv` | one program: legacy summary counts | fallback only, where a granular file above has no rows for that team | Trim/replace as the granular files fill in. |
| `blurbs.csv` | one program: `school,tagline` | the team-card tagline | **No source.** History/peak, fan-proud, ≤ ~12 words. All 130 programs have one. No "winningest" unless true, no figures under a cloud, no "Position U" claims. |
| `grouping_overrides.csv` | `school,grouping,note` | forces a program's grouping | Optional. Overrides the gap-detected tier. `grouping` must be one of the six exact names. |
| `trend_overrides.csv` | `school,dir,note` | forces trajectory direction / note | Optional. `dir` ∈ `up`/`down`/`even` (blank = keep computed). `note` blank = keep computed; a single space = force no note. |
| `relative_comparison.csv` | `school,text` | replaces the peer-comparison sentence | Optional. `text` is shown verbatim on the team card. |
| `projection_overrides.csv` | `school,text` | replaces the favourable-projection paragraph | Optional. `text` is shown verbatim on the team card. |

`build-data.mjs` also writes **`public/data/breakdown.csv`** on every run — the effective
grouping / trajectory / note / comparison / projection / tagline for all 130 programs.
Review it there, then paste rows into the `*_overrides.csv` files above to change them.

## Adding rows

Append to the relevant file and re-run `npm run build:data`. The build log prints
what changed (e.g. national-title counts vs. the old summary, grouping boundaries,
trajectory split) so you can sanity-check.
