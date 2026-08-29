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

/** blurbs lean on history — this is a century-long ledger, not a power poll */
export const RANK_GROUPS: RankGroup[] = [
  {
    key: 'blueblood',
    label: 'Blue Bloods',
    blurb:
      'Six programs that have mattered in every era of the sport — the leather-helmet 1920s, the wishbone 1970s, the BCS, the Playoff. The list the numbers have never really argued about.',
    test: (t) => t.ratingRank <= 6,
  },
  {
    key: 'debated',
    label: 'Debated',
    blurb:
      'Decades inside the sport’s biggest moments, then a generation in the cold. The century-long résumé says blue blood; the last twenty years don’t.',
    test: (t) => DEBATED.includes(t.school),
  },
  {
    key: 'adjacent',
    label: 'Blue Blood Adjacent',
    blurb:
      'Genuine national programs with a title era or two on the shelf. Close enough to the top that a decade of momentum puts them in the conversation, and a quiet decade drops them out.',
    test: (t) => t.rating >= 88,
  },
  {
    key: 'brand',
    label: 'National Brands',
    blurb:
      'Names the whole country knows, usually for something that happened a while ago. Real trophies in the case; the ceiling is lower than the history suggests.',
    test: (t) => t.rating >= 72,
  },
  {
    key: 'field',
    label: 'The Field',
    blurb:
      'The other ninety-odd. Long institutional memories, mostly local legends — where a program goes to wait for its era.',
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
