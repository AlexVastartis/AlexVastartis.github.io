import type { StatKey } from '../types';
import { CATEGORIES, CATEGORY_ORDER, STATS } from '../config/stats';

/** the 10 rating stats in criterion order (2 per criterion) */
export const STAT_KEYS = CATEGORY_ORDER.flatMap((c) => CATEGORIES[c].stats) as StatKey[];

export const fmtStat = (k: StatKey, v: number) => (STATS[k].format ?? String)(v);

interface RowProps {
  label: string;
  /** 0–100 */
  pct: number;
  /** already-formatted raw value */
  raw: string;
  /** greyed + struck (a trimmed outlier) */
  trimmed?: boolean;
  /** bar colour for a non-trimmed row; defaults to the accent */
  color?: string;
  dense?: boolean;
}

/** one "label · bar · raw · pctl" line — the shared shape used by the team panel,
 *  the ranking-row stat hover, and the Blue Blood benchmark hover. */
export function StatRow({ label, pct, raw, trimmed, color, dense }: RowProps) {
  return (
    <div className={`flex items-center gap-2 ${dense ? 'text-[10px]' : 'text-xs'} ${trimmed ? 'opacity-50' : ''}`}>
      <span className={`${dense ? 'w-32' : 'w-40'} shrink-0 truncate text-muted ${trimmed ? 'line-through' : ''}`}>
        {label}
      </span>
      <span className={`${dense ? 'h-1.5' : 'h-2'} flex-1 overflow-hidden rounded-full bg-line/60`}>
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, background: trimmed ? 'rgb(var(--muted))' : (color ?? 'rgb(var(--accent))') }}
        />
      </span>
      <span className={`${dense ? 'w-14' : 'w-16'} shrink-0 text-right tabular-nums text-muted ${trimmed ? 'line-through' : ''}`}>
        {raw}
      </span>
      <span className={`${dense ? 'w-9' : 'w-11'} shrink-0 text-right font-medium tabular-nums ${trimmed ? 'line-through' : ''}`}>
        {pct.toFixed(1)}
      </span>
    </div>
  );
}

interface ListProps {
  pct: Record<StatKey, number>;
  stats: Record<StatKey, number>;
  trimmedLow: StatKey;
  trimmedHigh: StatKey;
  color?: string;
  dense?: boolean;
}

/** the flat 10-row breakdown (no criterion headers) */
export function StatBreakdownList({ pct, stats, trimmedLow, trimmedHigh, color, dense }: ListProps) {
  const trimmed = new Set<StatKey>([trimmedLow, trimmedHigh]);
  return (
    <div className={`flex flex-col ${dense ? 'gap-0.5' : 'gap-1'}`}>
      {STAT_KEYS.map((sk) => (
        <StatRow
          key={sk}
          label={STATS[sk].label}
          pct={pct[sk]}
          raw={fmtStat(sk, stats[sk])}
          trimmed={trimmed.has(sk)}
          color={color}
          dense={dense}
        />
      ))}
    </div>
  );
}
