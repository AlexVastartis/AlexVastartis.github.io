import type { TrendDir } from '../types';

export const TREND_GLYPH: Record<TrendDir, string> = {
  up: '▲',
  down: '▼',
  even: '–',
};

export const TREND_WORD: Record<TrendDir, string> = {
  up: 'Ascending',
  down: 'Receding',
  even: 'Holding',
};

export const TREND_TITLE: Record<TrendDir, string> = {
  up: 'Ascending — the program’s recent era ranks higher among all of FBS than its prior history did',
  down: 'Receding — the program’s recent era ranks lower among all of FBS than its prior history did',
  even: 'Holding — roughly the same standing now as across its prior history',
};

export const TREND_CLASS: Record<TrendDir, string> = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-rose-600 dark:text-rose-400',
  even: 'text-muted',
};
