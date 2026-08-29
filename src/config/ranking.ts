import type { Team } from '../types';

/**
 * Groupings are assigned in scripts/build-data.mjs, where boundaries are placed
 * at natural gaps in the rating distribution (see scripts/lib/tiers.mjs). This
 * file only supplies the display order and the per-grouping blurbs.
 */
export const GROUPING_ORDER = [
  'Blue Bloods',
  'Blue Blood Fringe',
  'Blue Blood Contenders',
  'National Powers',
  'National Brands',
  'The Field',
] as const;

export type Grouping = (typeof GROUPING_ORDER)[number];

/** blurbs describe the band as a whole — its range, and that it holds risers and faders */
export const GROUPING_BLURB: Record<string, string> = {
  'Blue Bloods':
    'The top six by rating, and by a clear margin. Every one has been nationally relevant across multiple eras. None is in real decline.',
  'Blue Blood Fringe':
    'The perennial “is it a blue blood?” teams — Texas and Nebraska. Résumés deep enough to argue for the top six; recent decades that argue against it. In every era’s conversation, in no era’s inner circle.',
  'Blue Blood Contenders':
    'The programs with a real, current case for the top six — a title era in living memory and a rating closing on the fringe. What separates them from blue-blood status is decades of it, not one more good year.',
  'National Powers':
    'Programs the whole country knows, with real title history. The band runs from genuine current risers to powers coasting on an era two or three decades back.',
  'National Brands':
    'Recognisable names and real trophy cases, but a clear class break below the powers. Also where newer programs still accruing the cumulative totals land.',
  'The Field':
    'Everyone else — mostly regional followings and thin résumés, plus the young programs whose ceilings haven’t been tested by the counting stats.',
};

/** group the (already-filtered) teams by their assigned grouping, in display order */
export function groupTeams(teams: Team[]): { grouping: string; blurb: string; teams: Team[] }[] {
  const by = new Map<string, Team[]>();
  for (const t of [...teams].sort((a, b) => a.ratingRank - b.ratingRank)) {
    if (!by.has(t.grouping)) by.set(t.grouping, []);
    by.get(t.grouping)!.push(t);
  }
  return GROUPING_ORDER.filter((g) => by.has(g)).map((g) => ({
    grouping: g,
    blurb: GROUPING_BLURB[g] ?? '',
    teams: by.get(g)!,
  }));
}
