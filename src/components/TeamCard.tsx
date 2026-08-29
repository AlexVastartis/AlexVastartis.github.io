import type { CategoryKey, StatKey, Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER, STATS } from '../config/stats';
import { TREND_CLASS, TREND_GLYPH, TREND_WORD, trendTitle } from '../config/labels';

const BASE = import.meta.env.BASE_URL;

const STAT_CRIT: Record<StatKey, CategoryKey> = Object.fromEntries(
  CATEGORY_ORDER.flatMap((c) => CATEGORIES[c].stats.map((s) => [s, c])),
) as Record<StatKey, CategoryKey>;

/** deeper read on the viewer's favourite program — the 8 stats that actually drive its rating */
export default function TeamCard({ team, onClear }: { team: Team; onClear?: () => void }) {
  const trimmed = new Set<StatKey>([team.trimmedLow, team.trimmedHigh]);
  const droppedCrit =
    STAT_CRIT[team.trimmedLow] === STAT_CRIT[team.trimmedHigh] ? STAT_CRIT[team.trimmedLow] : null;

  return (
    <figure className="rounded-xl border border-accent/40 bg-panel p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <img
          src={`${BASE}logos/${team.slug}.svg`}
          alt=""
          className="h-14 w-14 shrink-0 object-contain"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (!el.dataset.png) {
              el.dataset.png = '1';
              el.src = `${BASE}logos/${team.slug}.png`;
            }
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl font-bold tracking-tight">{team.school}</h2>
            {onClear && (
              <button
                onClick={onClear}
                title="Remove favourite"
                className="text-xs text-muted hover:text-accent"
              >
                ★ clear
              </button>
            )}
          </div>
          <p className="text-sm text-muted">
            #{team.ratingRank} · {team.rating.toFixed(1)} rating ·{' '}
            <span className={TREND_CLASS[team.trend.dir]} title={trendTitle(team)}>
              {TREND_GLYPH[team.trend.dir]} {TREND_WORD[team.trend.dir]}
              {team.note ? ` · ${team.note}` : ''}
            </span>
          </p>
          {team.label.personal && <p className="mt-0.5 text-sm">{team.label.personal}</p>}
          <p className="text-xs text-muted">{team.grouping}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_2.5rem] items-baseline gap-x-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
        <span>Stat percentile within FBS · hover for the raw number</span>
        <span className="text-right">Pctl</span>
      </div>

      <dl className="mt-1 flex flex-col gap-3">
        {CATEGORY_ORDER.map((ck) => {
          const stats = CATEGORIES[ck].stats;
          if (droppedCrit === ck) {
            return (
              <div key={ck}>
                <dt className="text-xs font-semibold">{CATEGORIES[ck].label}</dt>
                <dd className="text-xs text-muted">
                  Both stats here were {team.school}’s single best and single worst percentile, so{' '}
                  {CATEGORIES[ck].label} doesn’t move its rating.
                </dd>
              </div>
            );
          }
          return (
            <div key={ck}>
              <dt className="mb-0.5 text-xs font-semibold">{CATEGORIES[ck].label}</dt>
              {stats.map((sk) => {
                const isTrim = trimmed.has(sk);
                const pctl = team.pct[sk];
                const raw = (STATS[sk].format ?? String)(team.stats[sk]);
                return (
                  <div
                    key={sk}
                    className={`flex items-center gap-2 ${isTrim ? 'opacity-45' : ''}`}
                    title={`${STATS[sk].label}: ${raw}`}
                  >
                    <span className="w-40 shrink-0 truncate text-xs text-muted">
                      {STATS[sk].label}
                      {isTrim && ' — outlier, not counted'}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-line/60">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${pctl}%`, background: isTrim ? 'rgb(var(--muted))' : team.primary }}
                      />
                    </span>
                    <span className="w-10 text-right text-xs tabular-nums">{Math.round(pctl)}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </dl>

      <p className="mt-3 rounded-md bg-paper/70 px-3 py-2 text-xs leading-relaxed">{team.comparison}</p>
      <p className="mt-2 rounded-md border border-line px-3 py-2 text-xs leading-relaxed">
        <span className="font-semibold">If it wants the next tier: </span>
        {team.projection}
      </p>
    </figure>
  );
}
