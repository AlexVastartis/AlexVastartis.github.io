/** Fields that differ between the as-played and official (vacated-removed) views. */
export interface WinsVariant {
  stats: Record<StatKey, number>;
  pct: Record<StatKey, number>;
  critScore: Record<CategoryKey, number>;
  composite: Record<CategoryKey, number>;
  rating: number;
  overall: number;
  ratingRank: number;
  grouping: string;
  peer: PeerComparison;
  /** where the program sits among its grouping peers (prose) */
  comparison: string;
  /** what it would take to reach the middle of the next grouping (prose) */
  projection: string;
  note: string;
  /** the two stat percentiles trimmed out of this program's rating (1 low + 1 high) */
  trimmedLow: StatKey;
  trimmedHigh: StatKey;
}

export interface PeerComparison {
  leads: string[];
  lags: string[];
  summary: string;
}

/**
 * One program, as emitted by scripts/build-data.mjs. The wins-dependent fields
 * are mirrored at the top level (the default "as-played" view) and also carried
 * per view in `variants`; `useTeams` swaps them when the toggle changes.
 */
export interface Team extends WinsVariant {
  school: string;
  slug: string;
  conference: string;
  primary: string;
  secondary: string;
  formerFcs: boolean;
  heismans: number;
  trend: {
    score: number;
    dir: TrendDir;
    recentStanding?: number;
    priorStanding?: number;
    /** how many seasons make up the recent window (the ~20%) */
    recentSeasons: number;
    /** total seasons in the program's record used for the comparison */
    totalSeasons: number;
    /** e.g. "2008–2025" */
    recentRange: string;
    /** e.g. "1936–2025" */
    fullRange: string;
    /** the 2–3 criteria whose cross-program standing shifted most */
    movers: { label: string; dir: 'up' | 'down' }[];
  };
  label: { standard: string; personal: string };
  variants: { asPlayed: WinsVariant; official: WinsVariant };
}

export type TrendDir = 'up' | 'down' | 'even';

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
  modelBlurb: string;
  trendRecentFraction: number;
  latestSeason: number;
  latestChampion: string | null;
  conferenceYear: number | null;
  titleSelectors: string[];
  sources: { store: string; network: boolean };
  /** one sentence per criterion on exactly where its numbers come from */
  provenance: Record<CategoryKey, string>;
  granular: { allAmericans: string; nationalTitles: string; conferenceTitles: string };
  dataRange: string;
  groupings: string[];
  tierBoundaries: number[];
  tierGaps: number[];
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
