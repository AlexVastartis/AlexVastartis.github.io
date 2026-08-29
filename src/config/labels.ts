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
  up: 'Ascending — the last ~18 seasons rank the program higher among all of FBS than its deeper history does',
  down: 'Receding — the last ~18 seasons rank the program lower than its deeper history does',
  even: 'Holding — roughly the same standing now as across its whole history',
};

export const TREND_CLASS: Record<TrendDir, string> = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-rose-600 dark:text-rose-400',
  even: 'text-muted',
};
