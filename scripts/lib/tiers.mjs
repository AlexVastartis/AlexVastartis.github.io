/**
 * Places grouping boundaries at real breaks in a sorted-descending rating vector.
 *
 * The first few boundaries are placed by `structured` rules — "the first gap of
 * at least `min`, scanning down from the previous boundary, no deeper than
 * `maxRank`" — so the elite structure (tight top cluster, then the
 * argued-about programs, then the first clear class break) is always captured
 * even when those gaps aren't the largest in the whole distribution. Remaining
 * boundaries are the largest gaps below that, size-guarded, so the long tail
 * stays one big tier.
 *
 * detectTiers(ratingsDesc, { count, minSize, maxBoundaryRank, structured })
 *   structured: [{ min, maxRank }] applied in order
 *   -> { boundaries: number[]  // 1-indexed rank after which a new tier begins
 *        gaps: number[]
 *        assign: (rank) => tierIndex }
 */
export function detectTiers(
  ratingsDesc,
  {
    count = 6,
    minSize = 2,
    maxBoundaryRank = 60,
    structured = [
      { min: 2.0, maxRank: 12 }, // Blue Bloods — the tight elite cluster
      { min: 1.4, maxRank: 12 }, // Blue Blood Fringe — the argued-about programs just outside
      { min: 1.8, maxRank: 24 }, // Blue Blood Contenders — first clear class break below the fringe
    ],
  } = {},
) {
  const n = ratingsDesc.length;
  const gapAfter = (rank) => ratingsDesc[rank - 1] - ratingsDesc[rank];

  const boundaries = [];
  for (const rule of structured) {
    if (boundaries.length >= count - 1) break;
    const from = (boundaries.at(-1) ?? 0) + minSize;
    let placed = null;
    for (let r = from; r <= Math.min(rule.maxRank, n - minSize); r += 1) {
      if (gapAfter(r) >= rule.min) {
        placed = r;
        break;
      }
    }
    if (placed) boundaries.push(placed);
  }

  const rest = [];
  for (let r = minSize; r <= Math.min(maxBoundaryRank, n - minSize); r += 1) {
    if (boundaries.some((b) => Math.abs(b - r) < minSize)) continue;
    rest.push({ rank: r, gap: gapAfter(r) });
  }
  rest.sort((a, b) => b.gap - a.gap);
  for (const c of rest) {
    if (boundaries.length >= count - 1) break;
    if (boundaries.some((b) => Math.abs(b - c.rank) < minSize)) continue;
    boundaries.push(c.rank);
  }
  boundaries.sort((a, b) => a - b);

  const gaps = boundaries.map(gapAfter);
  const assign = (rank) => boundaries.reduce((t, b) => t + (rank > b ? 1 : 0), 0);
  return { boundaries, gaps, assign };
}
