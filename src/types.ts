/** Fields that differ between the official (vacated-removed, default) and as-played views. */
export interface WinsVariant {
  stats: Record<StatKey, number>;
  pct: Record<StatKey, number>;
  critScore: Record<CategoryKey, number>;
  composite: Record<CategoryKey, number>;
  rating: number;
  overall: number;
  ratingRank: number;
  grouping: string;
  /** the 10-year twin: the rating formula run on the last ~10 seasons only */
  recentRating: number;
  recentPct: Record<StatKey, number>;
  recentCritScore: Record<CategoryKey, number>;
  recentStats: Record<StatKey, number>;
  /** "Standing" — where the program sits vs the tier it wants, in recent-decade terms (prose) */
  standing: string;
  /** "Path Forward" — what it would take to get there, in modern-season terms (prose) */
  pathForward: string;
  note: string;
  /** team-panel identity line, e.g. "#1 · 99.0 rating · Blue Bloods" (overridable) */
  identity: string;
  /** the two stat percentiles trimmed out of this program's rating (1 low + 1 high) */
  trimmedLow: StatKey;
  trimmedHigh: StatKey;
}

/**
 * One program, as emitted by scripts/build-data.mjs. The wins-dependent fields
 * are mirrored at the top level (the default "NCAA official" view) and also
 * carried per view in `variants`; `useTeams` swaps them when the toggle changes.
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
    /** an emphatic move — |delta| ≥ meta.trendSurgePoints; renders ⏫ / ⏬ */
    strong?: boolean;
    /** too few seasons on record (< meta.trendMinHistory) to call a trend — no arrow */
    insufficient?: boolean;
    /** recentRating − baselineRating, on the 0–100 scale */
    delta?: number;
    /** the 10-year twin rating (all ten stats, last ~10 seasons, ranked among last decades) */
    recentRating?: number;
    /** the headline all-time rating (identical number to the variant's `rating`) */
    baselineRating?: number;
    /** how many seasons make up the recent window */
    recentSeasons: number;
    /** total seasons in the program's record used for the comparison */
    totalSeasons: number;
    /** e.g. "2008–2025" */
    recentRange: string;
    /** e.g. "1936–2025" */
    fullRange: string;
    /** the 2–3 criteria whose all-time→recent percentile shifted most, with the raw numbers */
    movers: {
      label: string; dir: 'up' | 'down'; stat?: StatKey;
      allRaw?: number; recRaw?: number; allPct?: number; recPct?: number;
    }[];
  };
  label: {
    /** ranked-list row sub-line — the trajectory, described (overridable) */
    standard: string;
    /** trajectory hover text (overridable) */
    trajectoryTooltip: string;
    /** the hand-written tagline */
    personal: string;
  };
  variants: { asPlayed: WinsVariant; official: WinsVariant };
  /** concrete numbers behind the projection blurb + the what-if "Preview" run */
  projectionScenario: ProjectionScenario | null;
}

export interface ProjectionScenario {
  /** target raw value per stat — "today + one ambitious-but-attested dynasty decade" */
  targets: Record<StatKey, number>;
  /** stats where even a full decade doesn't reach the benchmark (multi-decade asks) */
  shortStats: StatKey[];
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
  trendRecentYears?: number;
  trendDeltaPoints?: number;
  trendSurgePoints?: number;
  trendMinHistory?: number;
  latestSeason: number;
  latestChampion: string | null;
  conferenceYear: number | null;
  titleSelectors: string[];
  sources: { store: string; network: boolean };
  /** one sentence per criterion on exactly where its numbers come from */
  provenance: Record<CategoryKey, string>;
  granular: { allAmericans: string; nationalTitles: string; conferenceTitles: string };
  /** the one-line description shown under each tier header, from _blurb_tier_descriptions.csv */
  tierDescriptions: Record<string, string>;
  /** the "average Blue Blood" — a marker line inside the Blue Bloods tier */
  blueBloodBenchmark: BlueBloodBenchmark | null;
  dataRange: string;
  groupings: string[];
  tierBoundaries: number[];
  tierGaps: number[];
  /** fixed rating thresholds (midpoint of each real gap) — grouping = which band a rating falls in */
  tierRatingThresholds: number[];
  /** ratings below this don't create a grouping boundary (the tail is undifferentiated) */
  tierMinRating: number;
  tierMaxSpan?: number;
  stats: Record<StatKey, StatDistribution>;
  composites: Record<CategoryKey, StatDistribution>;
  /** distribution of the overall Blue Blood score (standardized: mean 0, σ 1) */
  overall: StatDistribution;
  /** prior-snapshot rank/rating per school, for the year-over-year note */
  previous?: Record<string, { ratingRank: number; rating: number }>;
}

export interface BlueBloodBenchmark {
  members: string[];
  rating: number;
  pct: Record<StatKey, number>;
  stats: Record<StatKey, number>;
  critScore: Record<CategoryKey, number>;
  trimmedLow: StatKey;
  trimmedHigh: StatKey;
}

/** "Criterion" is the user-facing name for a category. */
export type CriterionKey = CategoryKey;

export interface TeamsPayload {
  meta: DataMeta;
  teams: Team[];
}
