/**
 * Echelon bands for the bell-curve view, expressed in composite z-score space.
 * Used to shade the curve and (in slice 2) to tell a team how far it must move
 * to reach the next echelon.
 */
export interface Tier {
  key: string;
  label: string;
  /** inclusive lower bound in z-score units; upper bound is the next tier's min */
  minZ: number;
  color: string;
}

export const TIERS: Tier[] = [
  { key: 'blueblood', label: 'Blue Blood', minZ: 1.5, color: '#1e40af' },
  { key: 'adjacent', label: 'Blue-Blood Adjacent', minZ: 0.75, color: '#2563eb' },
  { key: 'brand', label: 'Brand Name', minZ: 0.0, color: '#0d9488' },
  { key: 'solid', label: 'Solid Program', minZ: -0.75, color: '#65a30d' },
  { key: 'building', label: 'Building', minZ: -1.5, color: '#a16207' },
  { key: 'basement', label: 'Basement', minZ: -Infinity, color: '#78716c' },
];

export function tierForZ(z: number): Tier {
  return TIERS.find((t) => z >= t.minZ) ?? TIERS[TIERS.length - 1];
}

export function nextTierUp(z: number): Tier | null {
  const idx = TIERS.findIndex((t) => z >= t.minZ);
  return idx > 0 ? TIERS[idx - 1] : null;
}
