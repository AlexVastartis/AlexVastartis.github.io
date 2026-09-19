import type { StatKey, Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER, STATS } from '../config/stats';

/**
 * The team panel's ten-stat breakdown, at three densities:
 *   Full    — the default list-view panel: criterion-grouped rows, value + %ile columns.
 *   Compact — the reduced list-view panel (what-if / analysis modes): 5 rows × 2 stats.
 *   Strip   — the bar above the chart / bell-curve views: 2 rows × 5 stats.
 * Same ten stats, same criterion order, same trim rules — only the scale differs.
 */

const trimSet = (team: Team) => new Set<StatKey>([team.trimmedLow, team.trimmedHigh]);

/** Full — the tall criterion-grouped breakdown (list-view panel, default mode) */
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
              <span className="tabular-nums">{team.critScore[ck].toFixed(1)}</span>
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
                    `${STATS[sk].label}: ${raw} — ${pctl.toFixed(1)} percentile of 136`
                    + (isTrim ? ' (this program’s high/low outlier, dropped from its rating)' : '')
                  }
                >
                  <span className={`w-32 shrink-0 truncate text-xs text-muted ${isTrim ? 'line-through' : ''}`}>
                    {STATS[sk].label}
                  </span>
                  <span data-map="a stat bar" className="h-2.5 flex-1 overflow-hidden rounded-full bg-line/60">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${pctl}%`, background: isTrim ? 'rgb(var(--muted))' : team.primary }}
                    />
                  </span>
                  <span className={`w-14 shrink-0 text-right text-xs tabular-nums text-muted ${isTrim ? 'line-through' : ''}`}>
                    {raw}
                  </span>
                  <span className={`w-11 shrink-0 text-right text-xs tabular-nums text-muted ${isTrim ? 'line-through' : ''}`}>
                    {pctl.toFixed(1)}
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

/** one compact "label · bar · pctl" cell, shared by Compact and Strip */
function MiniStat({ team, sk, trimmed }: { team: Team; sk: StatKey; trimmed: boolean }) {
  const pctl = team.pct[sk];
  return (
    <span
      className={`flex min-w-0 items-center gap-1.5 ${trimmed ? 'opacity-50' : ''}`}
      title={`${STATS[sk].label}: ${(STATS[sk].format ?? String)(team.stats[sk])} — ${pctl.toFixed(1)} percentile`}
    >
      <span className={`min-w-0 flex-1 truncate text-muted ${trimmed ? 'line-through' : ''}`}>{STATS[sk].label}</span>
      <span className="h-1 w-8 shrink-0 overflow-hidden rounded-full bg-line/60">
        <span
          className="block h-full rounded-full"
          style={{ width: `${pctl}%`, background: trimmed ? 'rgb(var(--muted))' : team.primary }}
        />
      </span>
      <span className="w-8 shrink-0 text-right tabular-nums">{pctl.toFixed(1)}</span>
    </span>
  );
}

/** Compact — 5 rows (one per criterion) × its 2 stats. List-view panel, reduced. */
export function PanelStatsCompact({ team }: { team: Team }) {
  const trimmed = trimSet(team);
  return (
    <div data-map="the stat breakdown" className="mt-2 flex flex-col gap-0.5 text-[10px]">
      {CATEGORY_ORDER.map((ck) => (
        <div key={ck} className="flex items-center gap-3" title={CATEGORIES[ck].blurb}>
          {CATEGORIES[ck].stats.map((sk) => (
            <span key={sk} className="flex-1">
              <MiniStat team={team} sk={sk} trimmed={trimmed.has(sk)} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Strip — 2 rows × 5 columns (one column per criterion). Chart / bell-curve views.
 *  Each cell stacks the label directly over its own bar so there is no ambiguity
 *  about which stat a label belongs to. */
export function PanelStatsStrip({ team }: { team: Team }) {
  const trimmed = trimSet(team);
  // row-major fill of a 5-col grid: row 1 = first stat of each criterion, row 2 = second
  return (
    <div
      data-map="the stat breakdown"
      className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1.5 text-[10px] sm:grid-cols-5"
    >
      {[0, 1].flatMap((i) =>
        CATEGORY_ORDER.map((ck) => {
          const sk = CATEGORIES[ck].stats[i];
          const isTrim = trimmed.has(sk);
          const pctl = team.pct[sk];
          return (
            <div
              key={sk}
              className={`min-w-0 ${isTrim ? 'opacity-50' : ''}`}
              title={`${STATS[sk].label}: ${(STATS[sk].format ?? String)(team.stats[sk])} — ${pctl.toFixed(1)} percentile`}
            >
              <span className={`block truncate text-muted ${isTrim ? 'line-through' : ''}`}>{STATS[sk].label}</span>
              <span className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-line/60">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${pctl}%`, background: isTrim ? 'rgb(var(--muted))' : team.primary }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right tabular-nums">{pctl.toFixed(1)}</span>
              </span>
            </div>
          );
        }),
      )}
    </div>
  );
}
