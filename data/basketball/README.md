# BlueBloodBasketball data

The basketball twin of `data/staging/`. `npm run build:data:bb` reads **only**
`data/basketball/staging/` (never the network) and writes
`sites/basketball/public/data/` — the same `teams.json` / `meta.json` / timepoints the
football site ships, so the app runs unchanged.

## The 10 rating stats

Same model as football — rank each stat within the field (all **365** current Division I
programs), drop each program's best and worst percentile, average the other eight.

| Criterion | Stat | Why it's the basketball equivalent | Source file |
| --- | --- | --- | --- |
| **AP Poll Success** | Weeks in the AP poll | identical to football | `_staging_ap_poll_success.csv` |
| | Weeks in the AP top 10 | identical to football | same |
| **Wins** | All-time wins | identical (Division I seasons) | `_staging_wins.csv` |
| | All-time win % | identical | same |
| **Championships** | NCAA championships | the national title (1939 →) | `_staging_championships.csv` |
| | Conference regular-season titles | football's conference titles | `_staging_conference_titles.csv` |
| **All-Americans** | Consensus first-team All-Americans | football's consensus AAs (basketball teams are 5 deep, so first team is the comparable honour) | `_staging_all_americans.csv` |
| | National players of the year | football's unanimous AAs — the elite subset (UPI 1955–60, AP 1961–68, Naismith 1969 →) | `_staging_player_of_year.csv` |
| **NCAA Tournament** (replaces NFL Draft) | Sweet 16s | the "volume" stat, like draft picks: reaching the second weekend | `_staging_ncaa_tournament.csv` |
| | Final Fours | the "elite" stat, like first-round picks | same |

Why Sweet 16 + Final Four: the draft measures how much talent a program produces; for
basketball the draft is a poor proxy (one-and-dones, international picks), so the
criterion becomes **tournament finishes**. Appearances alone are too easy to pile up in a
68-team field, and titles are already counted under Championships — the Sweet 16 (breadth)
and Final Four (peak) are the two levels that separate programs without double-counting.
Tournament appearances are still tracked (the team-panel extra, where football shows
Heismans).

Internally basketball reuses the football stat keys — see `src/config/site.ts` for the
mapping (`nflDraftPicks` = Sweet 16s, `firstRoundPicks` = Final Fours, …).

## Where the numbers come from

| Data | Seasons | Source |
| --- | --- | --- |
| W-L, conference, NCAA result per (school, season) | 1893 → 2015-16 | Sports-Reference (college basketball), via the public scrape in [github.com/octonion/basketball](https://github.com/octonion/basketball) (`ncaa_sr/csv/years.csv`) |
| Every weekly AP poll | 1949-50 → 2015-16 | same scrape (`ncaa_sr/csv/polls.csv`) |
| Conference regular-season titles | 1950 → 2016 computed from game logs (`games.csv.gz`); earlier from Sports-Reference's all-time totals (`schools.csv`) | same scrape |
| Every game: results, conference games, NCAA rounds | 2016-17 → 2025-26 | ESPN, via [sportsdataverse-data releases](https://github.com/sportsdataverse/sportsdataverse-data/releases) (`espn_mens_college_basketball_schedules`) |
| AP rank per poll week | 2016-17 → 2021-22 | ESPN game JSON ([sportsdataverse/hoopR-mbb-raw](https://github.com/sportsdataverse/hoopR-mbb-raw)) → `archive/espn_ranks_*.csv` |
| AP rank per poll week | 2022-23 → 2025-26 | the ESPN schedule files' rank columns |
| NCAA vacations | — | hand-curated, `_staging_vacated.csv` |
| Consensus 1st-team All-Americans, players of the year | 1949-50 → 2024-25 | **hand-compiled from memory — unverified** (see below) |

### Known gaps / to verify

- **All-Americans and players of the year are unverified.** sports-reference.com, ncaa.org
  and wikipedia.org were all blocked from the build environment, so both lists were typed
  from memory of the NCAA record book and are marked `source=memory-unverified`. Expect a
  handful of wrong or missing names. Check them against the NCAA record book, add
  2025-26, and optionally extend before 1950.
- **Vacated results** (`_staging_vacated.csv`) cover every vacated Final Four and the big
  season-wide cases. Some small tournament-only vacations are probably missing, and
  Syracuse's 101 wins are split across seasons approximately.
- **The final AP poll of 2016-17 → 2025-26** comes out after the conference tournaments,
  and no game carries its ranks (NCAA tournament games show seeds). It is assumed equal
  to the last in-season poll.
- **Pre-1950 conference titles** are a per-program lump (`year=1949`, `count=N`) — the
  game logs start in 1950. They count in full; the As-Of snapshots date them all to 1949.
- The Sports-Reference win totals are its own; they can differ by a few from each school's
  media guide (exhibition and pre-Division I games).
- **Logos**: the 136 programs also on BlueBloodFootball reuse those logos. The other 229
  get monogram badges in their team colours — drop real art into
  `assets/logos-src-basketball/<slug>.png` (and `-dark.png`) and rebuild.

## Refreshing

```bash
# 1. fetch the raw sources into $RAW (network) —
#    git clone https://github.com/octonion/basketball $RAW/ob   (only ncaa_sr/csv is needed)
#    curl -L -o $RAW/espn/mbb_schedule_$Y.csv \
#      https://github.com/sportsdataverse/sportsdataverse-data/releases/download/espn_mens_college_basketball_schedules/mbb_schedule_$Y.csv
#    RAW=$RAW python3 scripts/basketball/fetch_espn_ranks.py <seasons without a rank column>
# 2. recompile the staging CSVs (needs python3 + pandas)
RAW=$RAW python3 scripts/basketball/compile_sources.py
# 3. offline from here on
npm run build:data:bb      # staging → sites/basketball/public/data
npm run coach-runs:bb      # coach tenures → src/config/dynastyRunsBasketball.ts
```

A new season only needs its ESPN schedule file (which has AP ranks) and steps 2–3. The
hand-curated files (`_staging_vacated.csv`, `_staging_all_americans.csv`,
`_staging_player_of_year.csv`, `_blurb_*.csv`, `_staging_blue_blood_rating.csv`) are never
overwritten by the compile.
