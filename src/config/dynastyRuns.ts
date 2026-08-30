import type { StatKey, Team } from '../types';

/** the 8 counting stats a run adds to (everything but win %) */
export type CountingKey = Exclude<StatKey, 'winPct'>;

export interface DynastyRun {
  /** slug — also the coach photo filename: public/coaches/<id>.png */
  id: string;
  coach: string;
  program: string;
  /** the tenure, as a label — e.g. "2007–23" */
  years: string;
  /** seasons coached in that span */
  seasons: number;
  /** the one-line "shape" of the run */
  shape: string;
  /** the actual totals that coach put up at that school across the tenure */
  tenure: Record<CountingKey, number>;
  /** the actual W-L% across the tenure */
  tenureWinPct: number;
  /** caveat shown on the hover card, if a figure isn't fully covered by the data */
  note?: string;
  /** kept in the data but not shown in the picker for now */
  hidden?: boolean;
}

/**
 * Head-coach tenures. Wins / titles / All-Americans / AP weeks are summed from the
 * site's own staging data over the exact seasons coached (Leahy's 1944–45 Navy
 * years excluded; Alabama's vacated 2007 wins removed). NFL-draft counts come
 * from the project draft sheet (nfl-draft-clean.csv) over the same seasons; the
 * AFL's parallel 1960–66 drafts are not included, so Bryant's / Hayes's figures
 * are a slight undercount. Conference titles are hand-counted (the granular file
 * doesn't itemise them for these programs). Clicking a coach loads "today + this
 * exact run" into the what-if editor.
 */
export const DYNASTY_RUNS: DynastyRun[] = [
  {
    id: 'saban',
    coach: 'Nick Saban',
    program: 'Alabama',
    years: '2007–23',
    seasons: 17,
    shape: 'Everything at once — the run that reset the standard',
    tenure: {
      allTimeWins: 201, nationalTitles: 6, conferenceTitles: 9,
      consensusAA: 47, unanimousAA: 26, nflDraftPicks: 126, firstRoundPicks: 44,
      weeksApPoll: 264, weeksApTop10: 246,
    },
    tenureWinPct: 0.874,
  },
  {
    id: 'bryant',
    coach: 'Bear Bryant',
    program: 'Alabama',
    years: '1958–82',
    seasons: 25,
    shape: 'A quarter-century at the top — six titles across three decades',
    tenure: {
      allTimeWins: 232, nationalTitles: 6, conferenceTitles: 13,
      consensusAA: 19, unanimousAA: 6, nflDraftPicks: 81, firstRoundPicks: 13,
      weeksApPoll: 279, weeksApTop10: 238,
    },
    tenureWinPct: 0.824,
    note: 'NFL-draft only for now — the AFL’s parallel 1960–66 drafts aren’t in the data yet.',
  },
  {
    id: 'hayes',
    coach: 'Woody Hayes',
    program: 'Ohio State',
    years: '1951–78',
    seasons: 28,
    shape: 'Three Yards and a Cloud of Dust — 28 years, 13 Big Ten titles',
    tenure: {
      allTimeWins: 205, nationalTitles: 5, conferenceTitles: 13,
      consensusAA: 26, unanimousAA: 13, nflDraftPicks: 161, firstRoundPicks: 26,
      weeksApPoll: 269, weeksApTop10: 223,
    },
    tenureWinPct: 0.761,
    note: 'NFL-draft only for now — the AFL’s parallel 1960–66 drafts aren’t in the data yet.',
  },
  {
    id: 'bierman',
    coach: 'Bernie Bierman',
    program: 'Minnesota',
    years: '1932–41',
    seasons: 10,
    shape: 'The Golden Gophers — five national titles in eight seasons',
    tenure: {
      allTimeWins: 63, nationalTitles: 5, conferenceTitles: 7,
      consensusAA: 9, unanimousAA: 1, nflDraftPicks: 29, firstRoundPicks: 4,
      weeksApPoll: 38, weeksApTop10: 34,
    },
    tenureWinPct: 0.802,
    note: 'AP-poll weeks count from 1936, the poll’s first year.',
  },
  {
    id: 'leahy',
    coach: 'Frank Leahy',
    program: 'Notre Dame',
    years: '1941–53',
    seasons: 11,
    shape: 'Eleven seasons, four national titles, one loss a decade',
    tenure: {
      allTimeWins: 87, nationalTitles: 4, conferenceTitles: 0,
      consensusAA: 22, unanimousAA: 6, nflDraftPicks: 80, firstRoundPicks: 9,
      weeksApPoll: 92, weeksApTop10: 84,
    },
    tenureWinPct: 0.855,
    note: 'Excludes the 1944–45 Navy years.',
  },
  {
    id: 'switzer',
    coach: 'Barry Switzer',
    program: 'Oklahoma',
    years: '1973–88',
    seasons: 16,
    shape: 'The wishbone years — All-Americans by the dozen',
    tenure: {
      allTimeWins: 157, nationalTitles: 3, conferenceTitles: 12,
      consensusAA: 28, unanimousAA: 17, nflDraftPicks: 66, firstRoundPicks: 12,
      weeksApPoll: 232, weeksApTop10: 198,
    },
    tenureWinPct: 0.837,
  },
  {
    id: 'osborne',
    coach: 'Tom Osborne',
    program: 'Nebraska',
    years: '1973–97',
    seasons: 25,
    shape: '25 years never outside the top 25 — a title run to finish',
    tenure: {
      allTimeWins: 255, nationalTitles: 3, conferenceTitles: 12,
      consensusAA: 30, unanimousAA: 14, nflDraftPicks: 109, firstRoundPicks: 17,
      weeksApPoll: 397, weeksApTop10: 331,
    },
    tenureWinPct: 0.836,
  },
  {
    id: 'swinney',
    coach: 'Dabo Swinney',
    program: 'Clemson',
    years: '2009–25',
    seasons: 17,
    shape: 'Built a superpower from scratch — two titles, seven ACC crowns',
    tenure: {
      allTimeWins: 183, nationalTitles: 2, conferenceTitles: 7,
      consensusAA: 13, unanimousAA: 4, nflDraftPicks: 86, firstRoundPicks: 18,
      weeksApPoll: 208, weeksApTop10: 140,
    },
    tenureWinPct: 0.785,
  },
  {
    id: 'smart',
    coach: 'Kirby Smart',
    program: 'Georgia',
    years: '2016–25',
    seasons: 10,
    shape: 'The NFL factory — back-to-back titles, first-rounders by the handful',
    tenure: {
      allTimeWins: 117, nationalTitles: 2, conferenceTitles: 3,
      consensusAA: 11, unanimousAA: 7, nflDraftPicks: 81, firstRoundPicks: 21,
      weeksApPoll: 152, weeksApTop10: 137,
    },
    tenureWinPct: 0.848,
    hidden: true,
  },
  {
    id: 'meyer',
    coach: 'Urban Meyer',
    program: 'Florida',
    years: '2005–10',
    seasons: 6,
    shape: 'The Tebow era — two titles in three years, then gone',
    tenure: {
      allTimeWins: 65, nationalTitles: 2, conferenceTitles: 2,
      consensusAA: 8, unanimousAA: 2, nflDraftPicks: 29, firstRoundPicks: 7,
      weeksApPoll: 85, weeksApTop10: 63,
    },
    tenureWinPct: 0.813,
    hidden: true,
  },
];

/** the runs shown in the picker (Kirby Smart & Urban Meyer are kept but hidden for now) */
export const VISIBLE_RUNS = DYNASTY_RUNS.filter((r) => !r.hidden);

const COUNTING_KEYS = Object.keys(DYNASTY_RUNS[0].tenure) as CountingKey[];

/** absolute what-if targets for `team` after a run exactly like `run` — its real
 *  tenure totals added on — clamped to the slider ceilings. Same `{stat: value}`
 *  shape the what-if "preview" takes. */
export function runTargets(
  team: Team,
  run: DynastyRun,
  statMax: Record<StatKey, number>,
): Partial<Record<StatKey, number>> {
  const out: Partial<Record<StatKey, number>> = {};
  for (const k of COUNTING_KEYS) {
    out[k] = Math.min(team.stats[k] + run.tenure[k], statMax[k]);
  }
  // win %: fold the tenure record into the program's game history
  const games = team.stats.winPct > 0
    ? Math.round(team.stats.allTimeWins / team.stats.winPct)
    : team.stats.allTimeWins;
  const runWins = run.tenure.allTimeWins;
  const runGames = Math.max(runWins, Math.round(runWins / run.tenureWinPct));
  out.winPct = Math.min(
    (team.stats.allTimeWins + runWins) / (games + runGames),
    statMax.winPct,
  );
  return out;
}
