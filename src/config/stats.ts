import type { CategoryKey, CategoryMeta, StatKey, StatMeta } from '../types';

const int = (v: number) => Math.round(v).toLocaleString('en-US');
const pct3 = (v: number) => (v < 1 ? v.toFixed(3).replace(/^0/, '') : v.toFixed(3));

/**
 * The 10 raw stats (5 categories x 2). `weight` mirrors the "points per unit"
 * column on the `BBR Raw Weighted` tab of Blue Bloods.xlsx and is used only for
 * the optional overall score.
 */
export const STATS: Record<StatKey, StatMeta> = {
  allTimeWins: {
    key: 'allTimeWins', label: 'All-Time Wins', axisLabel: 'All-Time Wins',
    higherIsBetter: true, source: 'cfbd', weight: 0.01, format: int,
  },
  winPct: {
    key: 'winPct', label: 'All-Time Winning %', axisLabel: 'All-Time Winning %',
    higherIsBetter: true, source: 'cfbd', weight: 10, format: pct3,
  },
  nationalTitles: {
    key: 'nationalTitles', label: 'FBS National Championships', axisLabel: 'National Championships',
    higherIsBetter: true, source: 'manual', weight: 1.5, format: int,
  },
  conferenceTitles: {
    key: 'conferenceTitles', label: 'Conference Championships', axisLabel: 'Conference Championships',
    higherIsBetter: true, source: 'manual', weight: 0.25, format: int,
  },
  consensusAA: {
    key: 'consensusAA', label: 'Consensus All-Americans', axisLabel: 'Consensus All-Americans',
    higherIsBetter: true, source: 'manual', weight: 0.1, format: int,
  },
  unanimousAA: {
    key: 'unanimousAA', label: 'Unanimous All-Americans', axisLabel: 'Unanimous All-Americans',
    higherIsBetter: true, source: 'manual', weight: 0.2, format: int,
  },
  nflDraftPicks: {
    key: 'nflDraftPicks', label: 'NFL Draft Picks', axisLabel: 'NFL Draft Picks',
    higherIsBetter: true, source: 'cfbd', weight: 0.02, format: int,
  },
  firstRoundPicks: {
    key: 'firstRoundPicks', label: 'First-Round NFL Draft Picks', axisLabel: 'First-Round NFL Draft Picks',
    higherIsBetter: true, source: 'cfbd', weight: 0.1, format: int,
  },
  weeksApPoll: {
    key: 'weeksApPoll', label: 'Weeks in the AP Poll', axisLabel: 'Weeks in the Top 25',
    higherIsBetter: true, source: 'cfbd', weight: 0.01, format: int,
  },
  weeksApTop10: {
    key: 'weeksApTop10', label: 'Weeks in the AP Top 10', axisLabel: 'Weeks in the Top 10',
    higherIsBetter: true, source: 'cfbd', weight: 0.02, format: int,
  },
};

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  perception: {
    key: 'perception', label: 'Perception Poll',
    stats: ['weeksApPoll', 'weeksApTop10'],
    blurb: 'How often, and how highly, the country has ranked you. "The Chart".',
  },
  wins: {
    key: 'wins', label: 'Wins',
    stats: ['allTimeWins', 'winPct'],
    blurb: 'Raw accumulated wins against how often you win.',
  },
  championships: {
    key: 'championships', label: 'Championships',
    stats: ['nationalTitles', 'conferenceTitles'],
    blurb: 'National titles against league titles.',
  },
  allAmericans: {
    key: 'allAmericans', label: 'All-Americans',
    stats: ['consensusAA', 'unanimousAA'],
    blurb: 'Consensus honorees against unanimous ones.',
  },
  nflDraft: {
    key: 'nflDraft', label: 'NFL Draft Success',
    stats: ['nflDraftPicks', 'firstRoundPicks'],
    blurb: 'Total draft picks produced against first-round picks.',
  },
};

export const CATEGORY_ORDER: CategoryKey[] = [
  'perception', 'wins', 'championships', 'allAmericans', 'nflDraft',
];

/** Slice-1 routes wire these two directly; the rest come online in slice 2. */
export const ACTIVE_CATEGORIES: CategoryKey[] = ['perception', 'wins'];
