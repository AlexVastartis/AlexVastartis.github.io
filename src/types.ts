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
  /** composite z-score per category (mean of the category's two stat z-scores) */
  composite: Record<CategoryKey, number>;
}

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
  sources: { cfbd: boolean; manual: boolean };
  dataRange: string;
  stats: Record<StatKey, StatDistribution>;
  composites: Record<CategoryKey, StatDistribution>;
}

export interface TeamsPayload {
  meta: DataMeta;
  teams: Team[];
}
