import type { CategoryKey, DataMeta, StatKey, Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import { zScore } from './stats';

const STAT_KEYS = Object.keys(CATEGORIES).flatMap((k) => CATEGORIES[k as CategoryKey].stats) as StatKey[];

/**
 * Recompute z-scores, percentiles and criterion composites for a single team's
 * raw stat line, holding the league distribution (`meta`) fixed. For the future
 * what-if panel.
 *
 * TODO(what-if): also recompute `critScore` (percentile-based), `rating`
 * (40% trimmed mean of the five critScores) and `ratingRank` so the panel can
 * show tier movement — see scripts/build-data.mjs `derive()`.
 */
export function deriveTeam(
  base: Team,
  rawStats: Record<StatKey, number>,
  meta: DataMeta,
): Team {
  const z = { ...base.z };
  const pct = { ...base.pct };

  for (const key of STAT_KEYS) {
    const d = meta.stats[key];
    z[key] = zScore(rawStats[key], d.mean, d.stddev);
    // approximate percentile from z using the logistic CDF (good enough for UI)
    pct[key] = 100 / (1 + Math.exp(-1.702 * z[key]));
  }

  const composite = { ...base.composite };
  for (const ck of CATEGORY_ORDER) {
    const [a, b] = CATEGORIES[ck].stats;
    composite[ck] = (z[a] + z[b]) / 2;
  }

  return { ...base, stats: { ...rawStats }, z, pct, composite };
}
