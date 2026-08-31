/**
 * The conference filter is collapsed to four buckets. The Blue Bloods, the
 * Fringe and the Contenders all sit in the ACC / Big Ten / SEC (Notre Dame
 * aside, and Notre Dame is in no conference), so those three get their own
 * chip and everything else — Big 12, the Group of Five, Independents — folds
 * into "Other". "All" (no selection) is still the default.
 */
export const CONF_GROUPS = ['ACC', 'Big Ten', 'SEC', 'Other'] as const;
export type ConfGroup = (typeof CONF_GROUPS)[number];

/** a team's raw conference name → its filter bucket */
export function confGroup(conference: string): ConfGroup {
  return conference === 'ACC' || conference === 'Big Ten' || conference === 'SEC'
    ? conference
    : 'Other';
}
