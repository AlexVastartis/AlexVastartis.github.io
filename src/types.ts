/** Raw + derived stat values for one program, as emitted by scripts/build-data.mjs. */
export interface Team {
  school: string;
  slug: string;
  conference: string;
  primary: string;
  secondary: string;
  formerFcs: boolean;
  /** raw stat values, keyed by StatKey */
  stats: Record<StatKey, number>;
  /** z-score per stat vs the full league distribution */
  z: Record<StatKey, number>;
  /** 0..100 percentile per stat */
  pct: Record<StatKey, number>;
  /** composite z-score per criterion (mean of the criterion's two stat z-scores) */
  composite: Record<CategoryKey, number>;
  /** criterion score, 0..100 = mean of the two stats' FBS percentiles */
  critScore: Record<CategoryKey, number>;
  /** Blue Blood Rating, 0..100 = 40% trimmed mean of the 5 criterion scores */
  rating: number;
  /** z-score of `rating` across FBS — drives the ranking bell curve */
  overall: number;
  /** 1 = highest rating */
  ratingRank: number;
  /** 0..100, how even a program is across the five criteria (100 = flat) */
  consistency: number;
  trend: { score: number; dir: TrendDir };
  label: { standard: string; personal: string };
}

export type TrendDir = 'up' | 'down' | 'even' | 'emerging';

export type StatKey =
  | 'allTimeWins'
  | 'winPct'
  | 'nationalTitles'
  | 'conferenceTitles'
  | 'consensusAA'
  | 'unanimousAA'
  | 'nflDraftPicks'
  | 'firstRoundPicks'
  | 'weeksApPoll'
  | 'weeksApTop10';

export type CategoryKey =
  | 'wins'
  | 'championships'
  | 'allAmericans'
  | 'nflDraft'
  | 'perception';

export interface StatMeta {
  key: StatKey;
  label: string;
  /** axis label used on scatter charts */
  axisLabel: string;
  /** true if a higher value is "better" (affects tier/echelon direction) */
  higherIsBetter: boolean;
  /** where the value comes from during a data refresh */
  source: 'cfbd' | 'manual';
  /** points-per-unit weight from the "BBR Raw Weighted" sheet, for the overall score */
  weight: number;
  /** number formatting for tooltips */
  format?: (v: number) => string;
}

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  /** [x, y] — the two stats that make up this category; x is the scatter X axis */
  stats: [StatKey, StatKey];
  blurb: string;
}

export interface StatDistribution {
  mean: number;
  stddev: number;
  min: number;
  max: number;
}

export interface DataMeta {
  generatedAt: string;
  model: string;
  trendWindowYears: number;
  sources: { cfbd: boolean; manual: boolean };
  dataRange: string;
  stats: Record<StatKey, StatDistribution>;
  composites: Record<CategoryKey, StatDistribution>;
  /** distribution of the overall Blue Blood score (standardized: mean 0, σ 1) */
  overall: StatDistribution;
  /** prior-snapshot rank/rating per school, for the year-over-year note */
  previous?: Record<string, { ratingRank: number; rating: number }>;
}

/** "Criterion" is the user-facing name for a category. */
export type CriterionKey = CategoryKey;

export interface TeamsPayload {
  meta: DataMeta;
  teams: Team[];
}
