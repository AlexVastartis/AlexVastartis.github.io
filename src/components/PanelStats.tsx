import type { StatKey, Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER, STATS } from '../config/stats';

/**
 * The team panel's ten-stat breakdown, at two densities. `Full` is the standalone
 * panel (criterion-grouped rows, value + percentile columns); `Compact` is the
 * what-if strip (five paired lines). Same ten stats, same criterion order, same
 * trim rules — only the scale differs.
 */

const trimSet = (team: Team) => new Set<StatKey>([team.trimmedLow, team.trimmedHigh]);

/** the tall breakdown for the standalone team panel */
export function PanelStatsFull({ team }: { team: Team }) {
  const trimmed = trimSet(team);
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-end gap-2 text-[10px] tabular-nums text-muted">
        <span className="w-14 text-right">value</span>
        <span className="w-9 text-right">%ile</span>
      </div>
      <dl data-map="the stat breakdown" className="mt-0.5 flex flex-col gap-3">
        {CATEGORY_ORDER.map((ck) => (
          <div key={ck}>
            <dt
              className="mb-0.5 flex items-baseline justify-between gap-2 text-xs font-semibold"
              title={`${CATEGORIES[ck].label} — ${CATEGORIES[ck].blurb}`}
            >
              <span>{CATEGORIES[ck].label}</span>
              <span className="tabular-nums">{Math.round(team.critScore[ck])}</span>
            </dt>
            {CATEGORIES[ck].stats.map((sk) => {
              const isTrim = trimmed.has(sk);
              const pctl = team.pct[sk];
              const raw = (STATS[sk].format ?? String)(team.stats[sk]);
              return (
                <div
                  key={sk}
                  className={`flex items-center gap-2 ${isTrim ? 'opacity-40' : ''}`}
                  title={
                    `${STATS[sk].label}: ${raw} — ${Math.round(pctl)}th percentile of 130`
                    + (isTrim ? ' (this program’s high/low outlier, dropped from its rating)' : '')
                  }
                >
                  <span className={`w-32 shrink-0 truncate text-xs text-muted ${isTrim ? 'line-through' : ''}`}>
                    {STATS[sk].label}
                  </span>
                  <span
                    data-map="a stat bar"
                    className="h-2.5 flex-1 overflow-hidden rounded-full bg-line/60"
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${pctl}%`, background: isTrim ? 'rgb(var(--muted))' : team.primary }}
                    />
                  </span>
                  <span
                    className={`w-14 shrink-0 text-right text-xs tabular-nums text-muted ${isTrim ? 'line-through' : ''}`}
                  >
                    {raw}
                  </span>
                  <span
                    className={`w-9 shrink-0 text-right text-xs font-medium tabular-nums ${isTrim ? 'line-through' : ''}`}
                  >
                    {Math.round(pctl)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </dl>
    </div>
  );
}

/** the slim breakdown for the what-if strip — one line per criterion, its two
 *  stats side by side */
export function PanelStatsCompact({ team }: { team: Team }) {
  const trimmed = trimSet(team);
  return (
    <div data-map="the stat breakdown" className="mt-2 flex flex-col gap-0.5 text-[10px]">
      {CATEGORY_ORDER.map((ck) => (
        <div key={ck} className="flex items-center gap-3" title={CATEGORIES[ck].blurb}>
          {CATEGORIES[ck].stats.map((sk) => {
            const isTrim = trimmed.has(sk);
            const pctl = team.pct[sk];
            return (
              <span
                key={sk}
                className={`flex min-w-0 flex-1 items-center gap-1.5 ${isTrim ? 'opacity-50' : ''}`}
                title={`${STATS[sk].label}: ${(STATS[sk].format ?? String)(team.stats[sk])} — ${Math.round(pctl)}th percentile`}
              >
                <span className="min-w-0 flex-1 truncate text-muted">{STATS[sk].label}</span>
                <span className="h-1 w-8 shrink-0 overflow-hidden rounded-full bg-line/60">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${pctl}%`, background: isTrim ? 'rgb(var(--muted))' : team.primary }}
                  />
                </span>
                <span className="w-4 shrink-0 text-right tabular-nums">{Math.round(pctl)}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
