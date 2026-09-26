import type { CategoryKey, CategoryMeta, StatKey, StatMeta } from '../types';
import { IS_BASKETBALL as BB } from './site';

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
    key: 'nationalTitles',
    label: BB ? 'NCAA Championships' : 'National Championships',
    axisLabel: BB ? 'NCAA Championships' : 'National Championships',
    higherIsBetter: true, weight: 1.5, format: int,
  },
  conferenceTitles: {
    key: 'conferenceTitles',
    label: BB ? 'Conference Regular-Season Titles' : 'Conference Championships',
    axisLabel: BB ? 'Conference Regular-Season Titles' : 'Conference Championships',
    higherIsBetter: true, weight: 0.25, format: int,
  },
  consensusAA: {
    key: 'consensusAA',
    label: BB ? 'Consensus First-Team All-Americans' : 'Consensus All-Americans',
    axisLabel: BB ? 'Consensus First-Team All-Americans' : 'Consensus All-Americans',
    higherIsBetter: true, weight: 0.1, format: int,
  },
  unanimousAA: {
    key: 'unanimousAA',
    label: BB ? 'National Players of the Year' : 'Unanimous All-Americans',
    axisLabel: BB ? 'National Players of the Year' : 'Unanimous All-Americans',
    higherIsBetter: true, weight: 0.2, format: int,
  },
  nflDraftPicks: {
    key: 'nflDraftPicks',
    label: BB ? 'Sweet 16s' : 'NFL Draft Picks',
    axisLabel: BB ? 'Sweet 16 Appearances' : 'NFL Draft Picks',
    higherIsBetter: true, weight: 0.02, format: int,
  },
  firstRoundPicks: {
    key: 'firstRoundPicks',
    label: BB ? 'Final Fours' : 'First-Round NFL Draft Picks',
    axisLabel: BB ? 'Final Four Appearances' : 'First-Round NFL Draft Picks',
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
    blurb: BB
      ? 'How often, and how highly, the country has ranked you since 1949-50 — weeks in the poll against weeks in the top ten.'
      : 'How often, and how highly, the country has ranked you since 1936 — weeks in the poll against weeks in the top ten.',
  },
  allAmericans: {
    key: 'allAmericans', label: 'All-Americans',
    stats: ['consensusAA', 'unanimousAA'],
    blurb: BB
      ? 'Consensus first-team All-Americans against national players of the year — a proxy for era-by-era star power.'
      : 'Consensus honorees against the unanimous ones — a proxy for era-by-era star power.',
  },
  championships: {
    key: 'championships', label: 'Championships',
    stats: ['nationalTitles', 'conferenceTitles'],
    blurb: BB
      ? 'NCAA titles against conference regular-season titles — the banner that matters most, and the one that shows up every winter.'
      : 'National titles against league titles. The rarest, noisiest data on the site.',
  },
  nflDraft: {
    key: 'nflDraft', label: BB ? 'NCAA Tournament' : 'NFL Draft Success',
    stats: ['nflDraftPicks', 'firstRoundPicks'],
    blurb: BB
      ? 'Tournament finishes: how often the program reaches the second weekend (the Sweet 16), against how often it reaches the Final Four.'
      : 'Total picks the program has sent to the NFL, against how many went in the first round.',
  },
  wins: {
    key: 'wins', label: 'Wins',
    stats: ['allTimeWins', 'winPct'],
    blurb: BB
      ? 'Total Division I wins piled up over a century, against how often the program actually wins.'
      : 'Total wins piled up over a century, against how often the program actually wins.',
  },
};

/** user-facing name for a criterion (the AP Poll criterion is internally "perception") */
export const criterionName = (k: CategoryKey) => CATEGORIES[k].label;

export const CATEGORY_ORDER: CategoryKey[] = [
  'perception', 'allAmericans', 'championships', 'nflDraft', 'wins',
];

/** user-facing name for the whole group of category charts */
export const CRITERIA_LABEL = 'Criteria';
