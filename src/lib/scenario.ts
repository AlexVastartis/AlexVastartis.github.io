/**
 * Client-side re-derivation for the what-if editor. Given the full 130-team set,
 * one team's edited raw stats, and the (fixed) tier boundaries, recompute every
 * team's percentiles, criterion scores, rating, rank and grouping — matching
 * scripts/build-data.mjs `derive()` / `applyGroupings()`.
 *
 * Only the edited team's raw values change; the other 129 shift only because the
 * edited team moved within each stat's distribution.
 */
import type { BlueBloodBenchmark, CategoryKey, StatKey, Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import { mean, percentile, stddev, zScore } from './stats';

/** the 10 stats, criterion order (2 per criterion) */
export const STAT_KEYS = CATEGORY_ORDER.flatMap((c) => CATEGORIES[c].stats) as StatKey[];
/** criterion -> its two stat keys */
const CRIT_PAIRS = Object.fromEntries(
  (Object.keys(CATEGORIES) as CategoryKey[]).map((c) => [c, CATEGORIES[c].stats]),
) as Record<CategoryKey, [StatKey, StatKey]>;

/** matches build-data's trimmean(arr, 0.2): drop the single lowest + single highest of 10, mean the rest */
function trimmean(xs: number[], prop = 0.2): number {
  const s = [...xs].sort((a, b) => a - b);
  const k = Math.floor((s.length * prop) / 2);
  return mean(s.slice(k, s.length - k));
}

/** slider ceiling per stat: 1.5x the largest value any team holds (win% caps at 1). */
export function statSliderMax(teams: Team[]): Record<StatKey, number> {
  const out = {} as Record<StatKey, number>;
  for (const k of STAT_KEYS) {
    const max = Math.max(...teams.map((t) => t.stats[k]));
    out[k] = k === 'winPct' ? 1 : Math.ceil(max * 1.5);
  }
  return out;
}

export interface Scenario {
  teams: Team[];
  /** the edited team, after re-derivation */
  edited: Team;
  /** the same team before any edits */
  base: Team;
  /** the "average Blue Blood" recomputed from the scenario's Blue Bloods tier —
   *  so the benchmark line moves when the edit adds/removes a member or changes one */
  benchmark: BlueBloodBenchmark | null;
}

/** the "average Blue Blood", from whichever teams currently sit in that tier.
 *  Mirrors scripts/build-data.mjs `computeBenchmark()`. */
function computeBenchmark(derived: Team[]): BlueBloodBenchmark | null {
  const bb = derived
    .filter((t) => t.grouping === 'Blue Bloods')
    .sort((a, b) => a.ratingRank - b.ratingRank);
  if (bb.length < 2) return null;

  const pct = {} as Record<StatKey, number>;
  const stats = {} as Record<StatKey, number>;
  for (const k of STAT_KEYS) {
    // a true independent (0 conference titles) is dropped from that average only
    const members = k === 'conferenceTitles' ? bb.filter((t) => t.stats[k] > 0) : bb;
    pct[k] = mean((members.length ? members : bb).map((t) => t.pct[k]));
    stats[k] = mean(bb.map((t) => t.stats[k]));
  }
  const critScore = {} as Record<CategoryKey, number>;
  for (const c of Object.keys(CRIT_PAIRS) as CategoryKey[]) {
    const [a, b] = CRIT_PAIRS[c];
    critScore[c] = (pct[a] + pct[b]) / 2;
  }
  let lo: StatKey = STAT_KEYS[0];
  let hi: StatKey = STAT_KEYS[0];
  for (const k of STAT_KEYS) {
    if (pct[k] < pct[lo]) lo = k;
    if (pct[k] > pct[hi]) hi = k;
  }
  return {
    members: bb.map((t) => t.school),
    rating: trimmean(STAT_KEYS.map((k) => pct[k])),
    pct,
    stats,
    critScore,
    trimmedLow: lo,
    trimmedHigh: hi,
  };
}

export function deriveScenario(
  teams: Team[],
  school: string,
  overrides: Partial<Record<StatKey, number>>,
  groupings: string[],
  /** fixed rating thresholds (midpoint of each real gap) — tiers are rating BANDS,
   *  so a moved program only changes its own tier, never pushing anyone else. */
  tierRatingThresholds: number[],
): Scenario {
  const base = teams.find((t) => t.school === school)!;

  // 1. edited raw lines
  const rawLines = teams.map((t) =>
    t.school === school ? ({ ...t.stats, ...overrides }) : t.stats,
  );

  // 2. per-stat sorted arrays + moments
  const sorted = {} as Record<StatKey, number[]>;
  const mu = {} as Record<StatKey, number>;
  const sd = {} as Record<StatKey, number>;
  for (const k of STAT_KEYS) {
    const col = rawLines.map((r) => r[k]);
    sorted[k] = [...col].sort((a, b) => a - b);
    mu[k] = mean(col);
    sd[k] = stddev(col, mu[k]);
  }

  // 3. re-derive every team
  const derived = teams.map((t, i) => {
    const raw = rawLines[i];
    const pct = {} as Record<StatKey, number>;
    const zt = {} as Record<StatKey, number>;
    for (const k of STAT_KEYS) {
      pct[k] = percentile(raw[k], sorted[k]);
      zt[k] = zScore(raw[k], mu[k], sd[k]);
    }
    const critScore = {} as Record<CategoryKey, number>;
    const composite = {} as Record<CategoryKey, number>;
    for (const c of Object.keys(CRIT_PAIRS) as CategoryKey[]) {
      const [a, b] = CRIT_PAIRS[c];
      critScore[c] = (pct[a] + pct[b]) / 2;
      composite[c] = (zt[a] + zt[b]) / 2;
    }
    const rating = trimmean(STAT_KEYS.map((k) => pct[k]));
    let lo: StatKey = STAT_KEYS[0];
    let hi: StatKey = STAT_KEYS[0];
    for (const k of STAT_KEYS) {
      if (pct[k] < pct[lo]) lo = k;
      if (pct[k] > pct[hi]) hi = k;
    }
    return { ...t, stats: raw, pct, critScore, composite, rating, trimmedLow: lo, trimmedHigh: hi };
  });

  // 4. rank (desc by rating); grouping is by FIXED rating band (midpoint thresholds
  //    from the real distribution) so only the edited team can change tier
  const ratingMu = mean(derived.map((t) => t.rating));
  const ratingSd = stddev(derived.map((t) => t.rating), ratingMu);

  [...derived]
    .sort((a, b) => b.rating - a.rating)
    .forEach((t, idx) => {
      t.ratingRank = idx + 1;
    });

  const bandOf = (rating: number) => tierRatingThresholds.filter((th) => rating < th).length;

  for (const t of derived) {
    t.overall = zScore(t.rating, ratingMu, ratingSd);
    t.grouping = groupings[bandOf(t.rating)] ?? groupings[groupings.length - 1];
    t.identity = `#${t.ratingRank} · ${t.rating.toFixed(1)} rating · ${t.grouping}`;
  }

  return {
    teams: derived,
    edited: derived.find((t) => t.school === school)!,
    base,
    benchmark: computeBenchmark(derived),
  };
}
