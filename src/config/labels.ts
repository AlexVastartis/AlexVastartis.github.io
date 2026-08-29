import type { TrendDir } from '../types';

export const TREND_GLYPH: Record<TrendDir, string> = {
  up: '▲',
  down: '▼',
  even: '–',
  emerging: '✦',
};

export const TREND_WORD: Record<TrendDir, string> = {
  up: 'Ascending',
  down: 'Receding',
  even: 'Holding',
  emerging: 'Emerging',
};

export const TREND_TITLE: Record<TrendDir, string> = {
  up: 'Trending up — better over the last decade than its 20-year baseline',
  down: 'Trending down — off its historical ceiling',
  even: 'Holding — roughly where it has always been (poll era)',
  emerging: 'Emerging — a young riser on the stats that take time',
};

export const TREND_CLASS: Record<TrendDir, string> = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-rose-600 dark:text-rose-400',
  even: 'text-muted',
  emerging: 'text-sky-600 dark:text-sky-400',
};
