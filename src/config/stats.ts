import type { CategoryKey, CategoryMeta, StatKey, StatMeta } from '../types';

const int = (v: number) => Math.round(v).toLocaleString('en-US');
const pct3 = (v: number) => (v < 1 ? v.toFixed(3).replace(/^0/, '') : v.toFixed(3));

/**
 * The 10 raw stats (5 criteria x 2). Every value is compiled in the committed
 * data store under data/staging/ and recomputed offline by scripts/build-data.mjs.
 * `weight` is legacy (unused by the current model).
 */
export const STATS: Record<StatKey, StatMeta> = {
  allTimeWins: {
    key: 'allTimeWins', label: 'All-Time Wins', axisLabel: 'All-Time Wins',
    higherIsBetter: true, weight: 0.01, format: int,
  },
  winPct: {
    key: 'winPct', label: 'All-Time Winning %', axisLabel: 'All-Time Winning %',
    higherIsBetter: true, weight: 10, format: pct3,
  },
  nationalTitles: {
    key: 'nationalTitles', label: 'National Championships', axisLabel: 'National Championships',
    higherIsBetter: true, weight: 1.5, format: int,
  },
  conferenceTitles: {
    key: 'conferenceTitles', label: 'Conference Championships', axisLabel: 'Conference Championships',
    higherIsBetter: true, weight: 0.25, format: int,
  },
  consensusAA: {
    key: 'consensusAA', label: 'Consensus All-Americans', axisLabel: 'Consensus All-Americans',
    higherIsBetter: true, weight: 0.1, format: int,
  },
  unanimousAA: {
    key: 'unanimousAA', label: 'Unanimous All-Americans', axisLabel: 'Unanimous All-Americans',
    higherIsBetter: true, weight: 0.2, format: int,
  },
  nflDraftPicks: {
    key: 'nflDraftPicks', label: 'NFL Draft Picks', axisLabel: 'NFL Draft Picks',
    higherIsBetter: true, weight: 0.02, format: int,
  },
  firstRoundPicks: {
    key: 'firstRoundPicks', label: 'First-Round NFL Draft Picks', axisLabel: 'First-Round NFL Draft Picks',
    higherIsBetter: true, weight: 0.1, format: int,
  },
  weeksApPoll: {
    key: 'weeksApPoll', label: 'Weeks in the AP Poll', axisLabel: 'Weeks in the AP Poll',
    higherIsBetter: true, weight: 0.01, format: int,
  },
  weeksApTop10: {
    key: 'weeksApTop10', label: 'Weeks in the AP Top 10', axisLabel: 'Weeks in the AP Top 10',
    higherIsBetter: true, weight: 0.02, format: int,
  },
};

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  perception: {
    key: 'perception', label: 'AP Poll Success',
    stats: ['weeksApPoll', 'weeksApTop10'],
    blurb: 'How often, and how highly, the country has ranked you since 1936 — weeks in the poll against weeks in the top ten.',
  },
  allAmericans: {
    key: 'allAmericans', label: 'All-Americans',
    stats: ['consensusAA', 'unanimousAA'],
    blurb: 'Consensus honorees against the unanimous ones — a proxy for era-by-era star power.',
  },
  championships: {
    key: 'championships', label: 'Championships',
    stats: ['nationalTitles', 'conferenceTitles'],
    blurb: 'National titles against league titles. The rarest, noisiest data on the site.',
  },
  nflDraft: {
    key: 'nflDraft', label: 'NFL Draft Success',
    stats: ['nflDraftPicks', 'firstRoundPicks'],
    blurb: 'Total picks the program has sent to the NFL, against how many went in the first round.',
  },
  wins: {
    key: 'wins', label: 'Wins',
    stats: ['allTimeWins', 'winPct'],
    blurb: 'Total wins piled up over a century, against how often the program actually wins.',
  },
};

/** user-facing name for a criterion (the AP Poll criterion is internally "perception") */
export const criterionName = (k: CategoryKey) => CATEGORIES[k].label;

export const CATEGORY_ORDER: CategoryKey[] = [
  'perception', 'allAmericans', 'championships', 'nflDraft', 'wins',
];

/** user-facing name for the whole group of category charts */
export const CRITERIA_LABEL = 'Criteria';
