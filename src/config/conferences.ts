import { IS_BASKETBALL } from './site';

/**
 * The conference filter is collapsed to a few buckets.
 *
 * Football: the Blue Bloods, the Fringe and the Contenders all sit in the ACC / Big Ten /
 * SEC (Notre Dame aside, and Notre Dame is in no conference), so those three get their
 * own chip and everything else — Big 12, the Group of Five, Independents — folds into
 * "Other".
 *
 * Basketball: the five high-major leagues (ACC, Big Ten, Big 12, SEC, Big East) each get
 * a chip; the other 26 Division I conferences fold into "Other".
 *
 * "All" (no selection) is still the default.
 */
const OWN_CHIP: readonly string[] = IS_BASKETBALL
  ? ['ACC', 'Big Ten', 'Big 12', 'SEC', 'Big East']
  : ['ACC', 'Big Ten', 'SEC'];

export const CONF_GROUPS: readonly string[] = [...OWN_CHIP, 'Other'];
export type ConfGroup = string;

/** a team's raw conference name → its filter bucket */
export function confGroup(conference: string): ConfGroup {
  return OWN_CHIP.includes(conference) ? conference : 'Other';
}
