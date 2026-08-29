import type { Team } from '../types';

/**
 * The two programs whose blue-blood status is perennially argued. The numbers
 * put them a clear step below the top six and a clear step above everyone else —
 * so they get their own callout rather than a tier.
 */
export const DEBATED = ['Nebraska', 'Texas'];

export interface RankGroup {
  key: string;
  label: string;
  blurb: string;
  /** first group whose test passes, in array order, claims the team */
  test: (team: Team) => boolean;
}

/**
 * Blurbs describe the band as a whole — its rating range and the fact that it
 * holds both risers and faders. They are deliberately plain; the per-program
 * trajectory arrow and label carry the specifics.
 */
export const RANK_GROUPS: RankGroup[] = [
  {
    key: 'blueblood',
    label: 'Blue Bloods',
    blurb:
      'The top six by rating, and by a clear margin. Every one has been nationally relevant across multiple eras. A couple are near their own historical peak; none is in real decline.',
    test: (t) => t.ratingRank <= 6,
  },
  {
    key: 'debated',
    label: 'Debated',
    blurb:
      'Nebraska and Texas: résumés deep enough for the top tier, recent decades that argue otherwise. Included on some blue-blood lists, left off others. The data splits the difference.',
    test: (t) => DEBATED.includes(t.school),
  },
  {
    key: 'adjacent',
    label: 'Blue Blood Adjacent',
    blurb:
      'Rating 88+. National-caliber programs — some currently surging toward the top tier, some coasting on a title era two or three decades back.',
    test: (t) => t.rating >= 88,
  },
  {
    key: 'brand',
    label: 'National Brands',
    blurb:
      'Rating 72–88. Names the whole country knows. The band runs from genuine recent risers to former powers living on accumulated history.',
    test: (t) => t.rating >= 72,
  },
  {
    key: 'field',
    label: 'The Field',
    blurb:
      'Everyone else. Mostly regional followings and thin trophy cases, but it also holds the newer programs still accruing the totals the rating rewards.',
    test: () => true,
  },
];

/** assign every team to exactly one group, preserving rating order within */
export function groupTeams(teams: Team[]): { group: RankGroup; teams: Team[] }[] {
  const ranked = [...teams].sort((a, b) => a.ratingRank - b.ratingRank);
  const out = RANK_GROUPS.map((group) => ({ group, teams: [] as Team[] }));
  for (const t of ranked) out[RANK_GROUPS.findIndex((g) => g.test(t))].teams.push(t);
  return out.filter((g) => g.teams.length > 0);
}

/** the group a team is in, and the one above it (for "distance to next tier") */
export function tierContext(team: Team, all: Team[]) {
  const groups = RANK_GROUPS;
  const idx = groups.findIndex((g) => g.test(team));
  const current = groups[idx];
  const up = idx > 0 ? groups[idx - 1] : null;
  let gap: { ratingPoints: number; ranks: number } | null = null;
  if (up) {
    const inUp = [...all]
      .filter((t) => groups.findIndex((g) => g.test(t)) === idx - 1)
      .sort((a, b) => a.rating - b.rating)[0];
    if (inUp) {
      gap = {
        ratingPoints: Math.max(0, inUp.rating - team.rating),
        ranks: Math.max(0, team.ratingRank - inUp.ratingRank),
      };
    }
  }
  return { current, up, gap };
}
