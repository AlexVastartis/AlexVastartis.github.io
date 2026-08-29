import type { Team } from '../types';

/**
 * The two programs whose blue-blood status is perennially argued. The numbers
 * (see the ranked list) put them a clear step below the top six and a clear step
 * above everyone else — so they get their own callout rather than a tier.
 */
export const DEBATED = ['Nebraska', 'Texas'];

export interface RankGroup {
  key: string;
  label: string;
  blurb: string;
  /** first group whose test passes, in array order, claims the team */
  test: (team: Team) => boolean;
}

export const RANK_GROUPS: RankGroup[] = [
  {
    key: 'blueblood',
    label: 'Blue Bloods',
    blurb: 'The six the numbers agree on. No one seriously argues these.',
    test: (t) => t.overallRank <= 6,
  },
  {
    key: 'debated',
    label: 'Debated',
    blurb:
      'Some lists include them, some don’t. The data puts them a notch below the six — and a notch above everyone else.',
    test: (t) => DEBATED.includes(t.school),
  },
  {
    key: 'adjacent',
    label: 'Blue Blood Adjacent',
    blurb: 'Modern heavyweights and faded giants. In the conversation, not in the club.',
    test: (t) => t.overall >= 1.0,
  },
  {
    key: 'brand',
    label: 'National Brands',
    blurb: 'Programs the whole country recognizes and occasionally fears.',
    test: (t) => t.overall >= 0.25,
  },
  {
    key: 'regional',
    label: 'Regional Powers',
    blurb: 'Real history, real ceilings — mostly felt within their own footprint.',
    test: (t) => t.overall >= -0.5,
  },
  {
    key: 'field',
    label: 'The Field',
    blurb: 'Everyone else on the board.',
    test: () => true,
  },
];

/** assign every team to exactly one group, preserving overall-rank order within */
export function groupTeams(teams: Team[]): { group: RankGroup; teams: Team[] }[] {
  const ranked = [...teams].sort((a, b) => a.overallRank - b.overallRank);
  const out = RANK_GROUPS.map((group) => ({ group, teams: [] as Team[] }));
  for (const t of ranked) {
    const idx = RANK_GROUPS.findIndex((g) => g.test(t));
    out[idx].teams.push(t);
  }
  return out.filter((g) => g.teams.length > 0);
}
