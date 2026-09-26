/**
 * Writes src/config/dynastyRunsBasketball.ts — the basketball coach runs for the
 * "Apply a coach's run" picker — by totalling each tenure straight from the staging
 * CSVs in data/basketball/staging/ (as played: NCAA vacations are NOT applied, the
 * same rule the football runs use). Offline; re-run after the staging data changes:
 *
 *   node scripts/basketball/build-coach-runs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords } from '../lib/csv.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const STG = path.join(REPO, 'data/basketball/staging');
const rd = (f) => readRecords(fs.readFileSync(path.join(STG, f), 'utf8'));

// seasons are the year each season ENDS (Wooden's first, 1948-49, is 1949)
const RUNS = [
  { id: 'wooden', coach: 'John Wooden', program: 'UCLA', from: 1949, to: 1975, shape: 'Ten titles in twelve years — the run nobody has come close to since' },
  { id: 'krzyzewski', coach: 'Mike Krzyzewski', program: 'Duke', from: 1981, to: 2022, shape: 'Forty-two years, five titles, thirteen Final Fours — the modern standard' },
  { id: 'rupp', coach: 'Adolph Rupp', program: 'Kentucky', from: 1931, to: 1972, shape: 'The Baron — four titles and the program every other one is measured against' },
  { id: 'smith', coach: 'Dean Smith', program: 'North Carolina', from: 1962, to: 1997, shape: 'Thirty-six years, eleven Final Fours, 33 straight top-three ACC finishes' },
  { id: 'calhoun', coach: 'Jim Calhoun', program: 'UConn', from: 1987, to: 2012, shape: 'Built a blue blood out of a Big East afterthought — three titles' },
  { id: 'knight', coach: 'Bob Knight', program: 'Indiana', from: 1972, to: 2000, shape: 'Three titles, including the last unbeaten season (1976)' },
  { id: 'self', coach: 'Bill Self', program: 'Kansas', from: 2004, to: 2026, shape: 'A Big 12 title nearly every year and two national championships' },
  { id: 'calipari', coach: 'John Calipari', program: 'Kentucky', from: 2010, to: 2024, shape: 'One-and-done Kentucky — a title, four Final Fours, a 38-1 season' },
  { id: 'williams', coach: 'Roy Williams', program: 'North Carolina', from: 2004, to: 2021, shape: 'Home to Chapel Hill — three titles in thirteen years' },
  { id: 'hurley', coach: 'Dan Hurley', program: 'UConn', from: 2019, to: 2026, shape: 'Back-to-back titles and a third final in four years — eight seasons at a sprint' },
  { id: 'izzo', coach: 'Tom Izzo', program: 'Michigan State', from: 1996, to: 2026, shape: 'Thirty years of March — a title and eight Final Fours' },
  { id: 'wright', coach: 'Jay Wright', program: 'Villanova', from: 2002, to: 2022, shape: 'Two titles in three years and a Big East machine' },
  { id: 'crum', coach: 'Denny Crum', program: 'Louisville', from: 1972, to: 2001, shape: 'Two titles and six Final Fours in the Metro Conference' },
  { id: 'olson', coach: 'Lute Olson', program: 'Arizona', from: 1984, to: 2007, shape: 'Made Arizona a national power — the 1997 title, 23 straight tournaments' },
  { id: 'allen', coach: 'Phog Allen', program: 'Kansas', from: 1920, to: 1956, shape: 'The father of basketball coaching — the 1952 title, 24 league crowns', note: 'AP-poll weeks count from 1949-50, the first season on record; All-Americans from 1949-50.' },
];

const inRun = (r, school, y) => r.program === school && y >= r.from && y <= r.to;
const wins = rd('_staging_wins.csv');
const tour = rd('_staging_ncaa_tournament.csv');
const ap = rd('_staging_ap_poll_success.csv');
const conf = rd('_staging_conference_titles.csv').filter((r) => Number(r.count || 1) === 1);
const aa = rd('_staging_all_americans.csv');
const poy = rd('_staging_player_of_year.csv');

const out = RUNS.map((r) => {
  const sum = (rows, f, yk = 'season') => rows.filter((x) => inRun(r, x.school, Number(x[yk]))).reduce((s, x) => s + f(x), 0);
  const w = sum(wins, (x) => Number(x.wins));
  const l = sum(wins, (x) => Number(x.losses));
  const seasons = wins.filter((x) => inRun(r, x.school, Number(x.season))).length;
  const confYears = new Set(conf.filter((x) => inRun(r, x.school, Number(x.year))).map((x) => x.year));
  return {
    id: r.id,
    coach: r.coach,
    program: r.program,
    years: `${r.from - 1}–${String(r.to).slice(r.to >= 2000 && r.from - 1 < 2000 ? 0 : 2)}`,
    seasons,
    shape: r.shape,
    tenure: {
      allTimeWins: w,
      nationalTitles: sum(tour, (x) => Number(x.champion)),
      conferenceTitles: confYears.size,
      consensusAA: sum(aa, () => 1, 'year'),
      unanimousAA: sum(poy, () => 1, 'year'),
      nflDraftPicks: sum(tour, (x) => Number(x.sweet16)),
      firstRoundPicks: sum(tour, (x) => Number(x.final_four)),
      weeksApPoll: sum(ap, (x) => Number(x.weeks_poll)),
      weeksApTop10: sum(ap, (x) => Number(x.weeks_top10)),
    },
    tenureWinPct: Number((w / (w + l)).toFixed(3)),
    ...(r.note ? { note: r.note } : {}),
  };
});

const ts = `import type { DynastyRun } from './dynastyRuns';

/**
 * Basketball head-coach tenures for the "Apply a coach's run" picker.
 * GENERATED by scripts/basketball/build-coach-runs.mjs from data/basketball/staging —
 * don't hand-edit the numbers; change the run list there and re-run it. Totals are the
 * coach's full as-played record over the exact seasons (NCAA vacations not applied).
 * Conference titles count only seasons from 1950 on (earlier ones aren't dated).
 * Stat keys follow the shared mapping in src/config/site.ts (nflDraftPicks = Sweet 16s,
 * firstRoundPicks = Final Fours, consensusAA = first-team All-Americans,
 * unanimousAA = national players of the year).
 */
export const BASKETBALL_RUNS: DynastyRun[] = ${JSON.stringify(out, null, 2)};
`;
fs.writeFileSync(path.join(REPO, 'src/config/dynastyRunsBasketball.ts'), ts);
for (const r of out) {
  const t = r.tenure;
  console.log(`${r.coach.padEnd(16)} ${r.program.padEnd(15)} ${r.years.padEnd(10)} ${t.allTimeWins}-W ${t.nationalTitles}T ${t.firstRoundPicks}FF ${t.nflDraftPicks}S16 ${t.conferenceTitles}C ${t.consensusAA}AA ${t.unanimousAA}POY ${t.weeksApPoll}wk ${r.tenureWinPct}`);
}
