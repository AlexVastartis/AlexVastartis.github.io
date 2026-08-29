import type { CategoryKey, Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER, STATS } from '../config/stats';
import { groupTeams } from '../config/ranking';
import { TREND_CLASS, TREND_GLYPH, trendTitle } from '../config/labels';

const BASE = import.meta.env.BASE_URL;

interface Props {
  teams: Team[];
  favorite?: string | null;
  onPick?: (team: Team) => void;
}

export default function RankedList({ teams, favorite, onPick }: Props) {
  const groups = groupTeams(teams);

  return (
    <div className="flex flex-col gap-7">
      {groups.map((g, i) => {
        const gap = i > 0 ? groups[i - 1].teams.at(-1)!.rating - g.teams[0].rating : 0;
        const top = g.teams[0].rating;
        const bottom = g.teams.at(-1)!.rating;
        return (
          <div key={g.grouping} className="relative">
            {i > 0 && gap > 0 && <GapNote gap={gap} />}
            <RangeBrace top={top} bottom={bottom} />
            <section
              className={
                g.grouping === 'Blue Blood Fringe'
                  ? 'rounded-xl border border-dashed border-accent/60 bg-accent/5 p-3'
                  : g.grouping === 'Blue Bloods'
                    ? 'rounded-xl border border-line bg-panel/60 p-3'
                    : 'rounded-xl border border-line p-3'
              }
            >
              <header className="mb-1.5 flex items-baseline gap-2 px-1">
                <h3 className="text-sm font-bold uppercase tracking-wide">{g.grouping}</h3>
                <span className="text-xs text-muted">{g.teams.length}</span>
                <span className="font-hand text-sm text-accent 2xl:hidden">
                  {top.toFixed(1)}–{bottom.toFixed(1)}%
                </span>
              </header>
              <p className="mb-2 px-1 text-xs leading-snug text-muted">{g.blurb}</p>

              <ol className="flex flex-col">
                {g.teams.map((t) => {
                  const fav = t.school === favorite;
                  return (
                    <li key={t.slug || t.school} data-school={t.school}>
                      <button
                        onClick={() => onPick?.(t)}
                        className={`grid w-full grid-cols-[1.6rem_1.75rem_1fr_auto] items-center gap-3 rounded-md border-l-2 px-1.5 py-1.5 text-left hover:bg-panel ${
                          fav ? 'border-accent bg-accent/10' : 'border-transparent'
                        }`}
                      >
                        <span className="flex items-center justify-end gap-0.5 text-sm font-semibold tabular-nums text-muted">
                          <span
                            className={`text-[10px] leading-none ${TREND_CLASS[t.trend.dir]}`}
                            title={trendTitle(t)}
                          >
                            {TREND_GLYPH[t.trend.dir]}
                          </span>
                          {t.ratingRank}
                        </span>
                        <img
                          src={`${BASE}logos/${t.slug}.svg`}
                          alt=""
                          className="h-7 w-7 object-contain"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            if (!el.dataset.png) {
                              el.dataset.png = '1';
                              el.src = `${BASE}logos/${t.slug}.png`;
                            }
                          }}
                        />
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium">{t.school}</span>
                            {fav && <span className="text-xs text-accent">★</span>}
                          </span>
                          <span className="block truncate text-xs text-muted">{t.label.standard}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          <CriterionStrip team={t} />
                          <span className="w-12 text-right text-sm font-bold tabular-nums">
                            {t.rating.toFixed(1)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>
        );
      })}
    </div>
  );
}

/** five bars, one per criterion — darker = higher percentile */
function CriterionStrip({ team }: { team: Team }) {
  return (
    <span className="hidden gap-1 sm:flex">
      {CATEGORY_ORDER.map((ck: CategoryKey) => {
        const [a, b] = CATEGORIES[ck].stats;
        const fa = (STATS[a].format ?? String)(team.stats[a]);
        const fb = (STATS[b].format ?? String)(team.stats[b]);
        return (
          <span
            key={ck}
            title={`${CATEGORIES[ck].label}: ${Math.round(team.critScore[ck])}th percentile · ${STATS[a].label} ${fa} · ${STATS[b].label} ${fb}`}
            className="h-4 w-2.5 rounded-sm"
            style={{ background: team.primary, opacity: 0.18 + 0.82 * (team.critScore[ck] / 100) }}
          />
        );
      })}
    </span>
  );
}

/**
 * The rating gap between this group and the one above it. On a wide desktop it
 * hangs in the true left margin (outside the page column) with a little pen
 * flick pointing at the break; on narrower screens it drops between the groups.
 */
function GapNote({ gap }: { gap: number }) {
  const text = `≈${gap.toFixed(1)}% gap`;
  return (
    <>
      {/* narrow: between the groupings */}
      <div className="pointer-events-none relative z-10 -mb-4 -mt-2 ml-1 flex items-center gap-1 font-hand text-accent 2xl:hidden">
        <svg
          width="30"
          height="22"
          viewBox="0 0 30 22"
          className="shrink-0 -rotate-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 18 C 6 8, 14 4, 26 4" />
          <path d="M19 3 L 27 4 L 24 12" />
        </svg>
        <span className="-rotate-3 text-xl leading-none">{text}</span>
      </div>

      {/* wide desktop: out in the left margin */}
      <div
        className="pointer-events-none absolute -top-4 hidden -translate-x-full items-center gap-1 whitespace-nowrap pr-2 font-hand text-accent 2xl:flex"
        style={{ left: '-0.75rem' }}
      >
        <span className="-rotate-3 text-xl leading-none">{text}</span>
        <svg
          width="34"
          height="16"
          viewBox="0 0 34 16"
          className="shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 5 C 12 5, 16 12, 30 12" />
          <path d="M24 7 L 31 12 L 23 15" />
        </svg>
      </div>
    </>
  );
}

/**
 * Wide-desktop only: a hand-drawn curly brace in the left margin spanning the
 * whole grouping, labelled with the rating range from its top team to its base.
 */
function RangeBrace({ top, bottom }: { top: number; bottom: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-y-1 hidden -translate-x-full items-center gap-1 pr-1 font-hand text-accent/90 2xl:flex"
      style={{ left: '-0.75rem' }}
    >
      <span className="-rotate-2 whitespace-nowrap text-lg leading-none">
        {top.toFixed(1)}–{bottom.toFixed(1)}%
      </span>
      <svg
        className="h-full w-3 shrink-0"
        viewBox="0 0 12 100"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      >
        <path
          d="M10 2 C 6 2, 7 12, 7 26 C 7 40, 5 46, 2 50 C 5 54, 7 60, 7 74 C 7 88, 6 98, 10 98"
          strokeWidth="2.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
