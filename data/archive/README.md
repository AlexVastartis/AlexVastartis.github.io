# data/archive/ — frozen raw source dumps

Nothing in the build reads this folder. It is kept only as the provenance trail
behind the hand-maintained store in `data/staging/`, and as raw material for the
occasional offline recompute.

| File(s) | What it is |
| --- | --- |
| `records-<year>.json` | per-year team season records (W-L-T), 1900–2026 |
| `rankings-<year>.json` | per-year weekly AP poll ballots, 1936–2026 |
| `draft-<year>.json` | per-year NFL draft picks by college, 1936–2026 |
| `ap-poll.json` | the same AP history, consolidated into one file |
| `games-pre1936.csv` | every game 1869–1935 the pre-1936 `source=history` win rows were compiled from (`season,week,date,winner,winner_pts,loser,loser_pts,winner_venue,notes`) |
| `games-pre1936-supplemental/` | single-season CSVs folded into the above (1934 was missing from the main export) |

These were downloaded once, years ago, and will not change — historical seasons
are immutable. There is no script that refreshes them and no network access
anywhere in the project. To revise a number, edit the relevant CSV in
`data/staging/` directly and re-run `npm run build:data`.
