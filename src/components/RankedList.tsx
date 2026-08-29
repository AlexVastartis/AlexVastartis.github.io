import type { StatKey, Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER, STATS } from '../config/stats';
import { groupTeams } from '../config/ranking';
import { TREND_CLASS, TREND_GLYPH, trendTitle } from '../config/labels';

const BASE = import.meta.env.BASE_URL;

// the 10 stats in criterion order (2 per criterion)
const STAT_KEYS = CATEGORY_ORDER.flatMap((c) => CATEGORIES[c].stats) as StatKey[];

interface Props {
  teams: Team[];
  favorite?: string | null;
  onPick?: (team: Team) => void;
  /** show the hand-drawn gap / range margin notes */
  showNotes?: boolean;
}

// the rating spread within a grouping is only really interesting for the top of the table
const RANGE_GROUPS = new Set(['Blue Bloods', 'Blue Blood Contenders']);

export default function RankedList({ teams, favorite, onPick, showNotes }: Props) {
  const groups = groupTeams(teams);

  return (
    <div className="flex flex-col gap-7">
      {groups.map((g, i) => {
        const gap = i > 0 ? groups[i - 1].teams.at(-1)!.rating - g.teams[0].rating : 0;
        const spread = g.teams[0].rating - g.teams.at(-1)!.rating;
        const showRange = showNotes && RANGE_GROUPS.has(g.grouping);
        return (
          <div key={g.grouping} className="relative">
            {showNotes && i > 0 && gap > 0 && <GapNote gap={gap} />}
            {showRange && <RangeBrace spread={spread} />}
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
                <span className="text-xs text-muted" title={`${g.teams.length} programs`}>
                  {g.teams.length}
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
                        <span
                          className="flex items-center justify-end gap-0.5 text-sm font-semibold tabular-nums text-muted"
                          title={`#${t.ratingRank} of 130 by Blue Blood Rating`}
                        >
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
                          <StatStrip team={t} />
                          <span
                            className="w-12 text-right text-sm font-bold tabular-nums"
                            title={`Blue Blood Rating ${t.rating.toFixed(1)} — mean of the 8 middle stat percentiles`}
                          >
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

/** ten bars, one per rating stat — darker = higher percentile; the program's own
 *  high/low outliers (dropped from its rating) are greyed. Hover is instant. */
function StatStrip({ team }: { team: Team }) {
  const trimmed = new Set<StatKey>([team.trimmedLow, team.trimmedHigh]);
  return (
    <span className="hidden items-center gap-[3px] sm:flex">
      {STAT_KEYS.map((sk) => {
        const pctl = team.pct[sk];
        const isTrim = trimmed.has(sk);
        const raw = (STATS[sk].format ?? String)(team.stats[sk]);
        return (
          <span key={sk} className="group relative">
            <span
              className="block h-4 w-1.5 rounded-sm"
              style={{
                background: isTrim ? 'rgb(var(--muted))' : team.primary,
                opacity: (isTrim ? 0.22 : 0.2) + (isTrim ? 0.4 : 0.8) * (pctl / 100),
              }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded border border-line bg-panel px-1.5 py-0.5 text-[10px] font-normal normal-case tracking-normal text-ink shadow-sm group-hover:block">
              {STATS[sk].label}: {raw} · {Math.round(pctl)}th pctl
              {isTrim && ' · outlier, not in rating'}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** a hand-drawn arrow that points straight into the gap (not at either corner) */
function GapArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      width="38"
      height="12"
      viewBox="0 0 38 12"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 6 C 13 5, 22 7, 32 6" />
      <path d="M25 2 L 34 6 L 25 10" />
    </svg>
  );
}

/**
 * The rating gap between this group and the one above it — hand-lettered out in
 * the true left margin (wide desktop), vertically centred on the gap so the
 * arrow points straight between the two groupings.
 */
function GapNote({ gap }: { gap: number }) {
  return (
    <div
      className="pointer-events-none absolute hidden -translate-x-full -translate-y-1/2 items-center gap-1.5 whitespace-nowrap pr-2 font-hand text-accent 2xl:flex"
      style={{ left: '-0.75rem', top: '-0.875rem' }}
    >
      <span className="-rotate-2 text-xl leading-none">≈{gap.toFixed(1)}% gap</span>
      <GapArrow className="-rotate-1" />
    </div>
  );
}

/**
 * Wide-desktop only: a hand-drawn curly brace in the left margin spanning the
 * whole grouping, labelled with the rating spread (top team minus base team).
 */
function RangeBrace({ spread }: { spread: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-y-1 hidden -translate-x-full items-center gap-1 pr-1 font-hand text-accent/90 2xl:flex"
      style={{ left: '-0.75rem' }}
    >
      <span className="-rotate-2 whitespace-nowrap text-lg leading-none">≈{spread.toFixed(1)}% range</span>
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
