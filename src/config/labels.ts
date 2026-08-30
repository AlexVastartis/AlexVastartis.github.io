import type { TrendDir } from '../types';

// One arrow per direction. An emphatic move (team.trend.strong) is drawn as two
// of these stacked vertically by <TrendMark> in RankedList.tsx.
export const TREND_GLYPH: Record<TrendDir, string> = {
  up: '▲',
  down: '▼',
  even: '–',
};

export const TREND_WORD: Record<TrendDir, string> = {
  up: 'Ascending',
  down: 'Descending',
  even: 'Maintaining',
};

export const TREND_CLASS: Record<TrendDir, string> = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-rose-600 dark:text-rose-400',
  even: 'text-muted',
};

// The trajectory hover string is now composed in scripts/build-data.mjs and shipped
// as team.label.trajectoryTooltip (so _blurb_trajectory.csv can override it).
