import type { Team, TrendDir } from '../types';

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

const VERDICT: Record<TrendDir, string> = {
  up: 'ranks higher among all of FBS now than across its prior history',
  down: 'ranks lower among all of FBS now than across its prior history',
  even:
    'holds about the same standing among all of FBS now as it did across its prior history — '
    + 'no era of clear rise or decline, it is keeping pace with itself',
};

/** the hover text on a program's trajectory — spells out exactly what is being compared */
export function trendTitle(team: Team): string {
  const t = team.trend;
  const movers = t.movers?.length
    ? ` Biggest moves: ${t.movers.map((m) => `${m.label} ${m.dir === 'up' ? '↑' : '↓'}`).join(', ')}.`
    : '';
  const window = t.recentSeasons
    ? `${team.school}'s most recent ${t.recentSeasons} seasons (${t.recentRange}) vs. all ${t.totalSeasons} of its seasons (${t.fullRange})`
    : `${team.school}'s recent era vs. its full history`;
  return `${TREND_WORD[t.dir]} — comparing ${window}, across all ten rating stats. It ${VERDICT[t.dir]}.${movers}`;
}
