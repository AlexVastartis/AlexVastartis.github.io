/** Small statistics helpers shared by the data pipeline and the what-if panel. */

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** population standard deviation (matches Excel STDEVP / the BBR summary rows) */
export function stddev(xs: number[], mu = mean(xs)): number {
  if (xs.length === 0) return 0;
  const v = xs.reduce((a, b) => a + (b - mu) * (b - mu), 0) / xs.length;
  return Math.sqrt(v);
}

export function zScore(x: number, mu: number, sd: number): number {
  return sd === 0 ? 0 : (x - mu) / sd;
}

/** percentile rank (0..100) of x within sorted-ascending `sorted` */
export function percentile(x: number, sorted: number[]): number {
  if (sorted.length === 0) return 0;
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  let hiEq = lo;
  while (hiEq < sorted.length && sorted[hiEq] === x) hiEq += 1;
  return ((lo + hiEq) / 2 / sorted.length) * 100;
}

/** standard normal probability density */
export function normalPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}
