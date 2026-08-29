/**
 * AP-poll era presets. Slice 1 exposes only "All-Time" (the data the pipeline
 * currently emits). Slice 2's ApVariations route will scope the poll math to a
 * `sinceYear` and add the AP365 / AP440 cumulative variants.
 *
 * Inspired by r/CFB "AP 365 / AP 440-forever" and the era comment
 * (modern era = 1968, championship/BCS/playoff era = 1992).
 */
export interface Era {
  key: string;
  label: string;
  sinceYear: number;
  note: string;
}

export const ERAS: Era[] = [
  { key: 'alltime', label: 'All-Time (1936–)', sinceYear: 1936, note: 'Every AP poll ever released.' },
  { key: 'modern', label: 'Modern Era (1968–)', sinceYear: 1968, note: 'Post-desegregation; bowls count in the final poll.' },
  { key: 'title', label: 'Title Era (1992–)', sinceYear: 1992, note: 'Bowl Coalition / BCS / Playoff.' },
];

export const DEFAULT_ERA = ERAS[0];
