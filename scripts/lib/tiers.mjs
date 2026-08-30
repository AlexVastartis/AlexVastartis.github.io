/**
 * Places grouping boundaries at the real breaks in a sorted-descending rating
 * vector — the largest rating gaps, ignoring anything in the uninteresting tail.
 *
 * A boundary sits after rank `r` when the drop from rating[r] to rating[r+1] is
 * one of the `count - 1` biggest such drops, subject to:
 *   - the rating on the HIGH side of the gap is at least `minRating` (below that
 *     the field is undifferentiated — no boundary is "interesting" down there),
 *   - each tier holds at least `minSize` programs,
 *   - no tier (other than the tail, below `minRating`) spans more than `maxSpan`
 *     rating points: if the raw gap picks leave one wider than that, the three
 *     structural boundaries (top two + the last, interesting/tail split) are kept
 *     and the middle boundaries are re-chosen to minimise the widest middle tier
 *     (ties broken toward bigger gaps at the cuts).
 *
 * This is intentionally gap-driven and self-adjusting: if a program moves up or
 * down (e.g. in the what-if editor) the tiers grow or shrink to absorb it rather
 * than a fixed rank cut-off pushing someone out.
 *
 * detectTiers(ratingsDesc, { count, minSize, minRating, maxSpan })
 *   -> { boundaries: number[]  // 1-indexed rank after which a new tier begins
 *        gaps: number[]
 *        assign: (rank) => tierIndex }
 */
export function detectTiers(
  ratingsDesc,
  { count = 6, minSize = 2, minRating = 60, maxSpan = Infinity } = {},
) {
  const n = ratingsDesc.length;
  const gapAfter = (rank) => ratingsDesc[rank - 1] - ratingsDesc[rank];

  const cands = [];
  for (let r = minSize; r <= n - minSize; r += 1) {
    if (ratingsDesc[r - 1] < minRating) break; // past the interesting band
    cands.push({ rank: r, gap: gapAfter(r) });
  }
  const candRanks = new Set(cands.map((c) => c.rank));

  let boundaries = [];
  for (const c of [...cands].sort((a, b) => b.gap - a.gap)) {
    if (boundaries.length >= count - 1) break;
    if (boundaries.some((b) => Math.abs(b - c.rank) < minSize)) continue;
    boundaries.push(c.rank);
  }
  boundaries.sort((a, b) => a - b);

  // span of the tier that starts after `lo` (rank, 0 = top) and ends at `hi`,
  // ignoring the tail below minRating
  const spanOf = (lo, hi) => {
    const top = ratingsDesc[lo]; // rating of the tier's best program
    if (top < minRating) return 0;
    return top - ratingsDesc[Math.min(hi, n) - 1];
  };
  const tierSpans = (bs) => {
    const edges = [0, ...bs, n];
    const out = [];
    for (let i = 0; i < edges.length - 1; i += 1) out.push(spanOf(edges[i], edges[i + 1]));
    return out;
  };
  const maxMiddleSpan = (bs) => {
    const edges = [0, ...bs, n];
    let m = 0;
    for (let i = 0; i < edges.length - 2; i += 1) m = Math.max(m, spanOf(edges[i], edges[i + 1]));
    return m;
  };

  // maxSpan guard: if the raw gap picks leave a middle tier too wide, keep the
  // three structural boundaries (top two + the last) and re-pick the middle ones
  // to minimise the widest middle tier.
  if (
    maxSpan < Infinity
    && boundaries.length === count - 1
    && count - 1 >= 3
    && maxMiddleSpan(boundaries) > maxSpan
  ) {
    const keep = [boundaries[0], boundaries[1], boundaries[boundaries.length - 1]];
    const need = count - 1 - keep.length; // middle boundaries to choose
    const lo = keep[1];
    const hi = keep[2];
    const pool = cands
      .map((c) => c.rank)
      .filter((r) => r > lo + minSize - 1 && r < hi - minSize + 1);

    let best = null;
    const combos = (start, picked) => {
      if (picked.length === need) {
        const bs = [...keep, ...picked].sort((a, b) => a - b);
        const span = maxMiddleSpan(bs);
        const gapSum = picked.reduce((s, r) => s + gapAfter(r), 0);
        if (!best || span < best.span - 1e-9
          || (Math.abs(span - best.span) < 1e-9 && gapSum > best.gapSum)) {
          best = { bs, span, gapSum };
        }
        return;
      }
      for (let i = start; i < pool.length; i += 1) {
        if (picked.length && pool[i] - picked[picked.length - 1] < minSize) continue;
        picked.push(pool[i]);
        combos(i + 1, picked);
        picked.pop();
      }
    };
    combos(0, []);
    if (best) boundaries = best.bs;
  }

  const gaps = boundaries.map(gapAfter);
  const assign = (rank) => boundaries.reduce((t, b) => t + (rank > b ? 1 : 0), 0);
  return { boundaries, gaps, assign };
}
