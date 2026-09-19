import type { StatKey } from '../types';

/** the five decade-scale stats the trajectory formula ranks — wins, win rate,
 *  AP-poll weeks, AP top-10 weeks, draft picks. Must match TREND_KEYS in
 *  scripts/build-data.mjs. */
export const TREND_KEYS: StatKey[] = [
  'allTimeWins', 'winPct', 'weeksApPoll', 'weeksApTop10', 'nflDraftPicks',
];
