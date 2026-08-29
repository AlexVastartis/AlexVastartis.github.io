import type { StatKey, Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER, STATS } from '../config/stats';

const BASE = import.meta.env.BASE_URL;

interface Props {
  team: Team;
  variant?: 'full' | 'compact';
  onClear?: () => void;
  /** scroll this team's row into view in whatever list is on screen (list views only) */
  onJump?: () => void;
}

const RATING_HINT =
  'Blue Blood Rating: rank each of the 10 stats within FBS, drop this program’s single best and single worst percentile, average the other 8.';

/** the viewer's favourite program. `full` = deep read (used beside a ranked list);
 *  `compact` = a slim strip for chart views: identity + the five criterion scores */
export default function TeamCard({ team, variant = 'full', onClear, onJump }: Props) {
  const logo = (
    <img
      src={`${BASE}logos/${team.slug}.svg`}
      alt=""
      className={`shrink-0 object-contain ${variant === 'compact' ? 'h-10 w-10' : 'h-14 w-14'}`}
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        if (!el.dataset.png) {
          el.dataset.png = '1';
          el.src = `${BASE}logos/${team.slug}.png`;
        }
      }}
    />
  );

  const clearBtn = onClear && (
    <button onClick={onClear} title="Remove favourite" className="text-xs text-muted hover:text-accent">
      ★ clear
    </button>
  );
  const jumpBtn = onJump && (
    <button
      onClick={onJump}
      title="Jump to this team in the list"
      aria-label="Jump to this team in the list"
      className="text-xs text-muted hover:text-accent"
    >
      ⌖ jump
    </button>
  );

  if (variant === 'compact') {
    return (
      <figure className="rounded-xl border border-accent/40 bg-panel p-3">
        <div className="flex items-center gap-3">
          {logo}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h2 className="text-base font-bold tracking-tight">{team.school}</h2>
              <span className="text-xs text-muted" title={RATING_HINT}>
                #{team.ratingRank} · {team.rating.toFixed(1)} · {team.grouping}
              </span>
              {jumpBtn}
              {clearBtn}
            </div>
            {team.label.personal && <p className="truncate text-xs text-muted">{team.label.personal}</p>}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
          {CATEGORY_ORDER.map((ck) => (
            <div
              key={ck}
              className="flex items-center gap-1.5"
              title={`${CATEGORIES[ck].label}: ${Math.round(team.critScore[ck])}th percentile — ${CATEGORIES[ck].blurb}`}
            >
              <span className="w-28 shrink-0 truncate text-[10px] font-semibold uppercase tracking-wide text-muted">
                {CATEGORIES[ck].label}
              </span>
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line/60">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${team.critScore[ck]}%`, background: team.primary }}
                />
              </span>
              <span className="w-6 text-right text-[10px] tabular-nums">{Math.round(team.critScore[ck])}</span>
            </div>
          ))}
        </div>
      </figure>
    );
  }

  const trimmed = new Set<StatKey>([team.trimmedLow, team.trimmedHigh]);
  return (
    <figure className="rounded-xl border border-accent/40 bg-panel p-4 sm:p-5">
      <div className="flex items-start gap-4">
        {logo}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl font-bold tracking-tight">{team.school}</h2>
            {jumpBtn}
            {clearBtn}
          </div>
          <p className="text-sm text-muted" title={RATING_HINT}>
            #{team.ratingRank} · {team.rating.toFixed(1)} rating · {team.grouping}
          </p>
          {team.label.personal && <p className="mt-0.5 text-sm">{team.label.personal}</p>}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_2.5rem] items-baseline gap-x-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
        <span>Percentile within FBS — criterion, then its stats</span>
        <span className="text-right">Pctl</span>
      </div>

      <dl className="mt-1 flex flex-col gap-3">
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
                  <span className={`w-40 shrink-0 truncate text-xs text-muted ${isTrim ? 'line-through' : ''}`}>
                    {STATS[sk].label}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-line/60">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${pctl}%`, background: isTrim ? 'rgb(var(--muted))' : team.primary }}
                    />
                  </span>
                  <span
                    className={`w-10 text-right text-xs tabular-nums text-muted ${isTrim ? 'line-through' : ''}`}
                  >
                    {Math.round(pctl)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </dl>

      <p
        className="mt-3 rounded-md bg-paper/70 px-3 py-2 text-xs leading-relaxed"
        title="How this program compares with the other teams in its grouping, criterion by criterion"
      >
        {team.comparison}
      </p>
      <p
        className="mt-2 rounded-md border border-line px-3 py-2 text-xs leading-relaxed"
        title="What it would take, in real terms, to reach the middle of the grouping above"
      >
        <span className="font-semibold">If it wants the next tier: </span>
        {team.projection}
      </p>
    </figure>
  );
}
