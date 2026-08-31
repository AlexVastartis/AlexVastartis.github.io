import {
  useEffect, useLayoutEffect, useMemo, useRef, useState,
  type MouseEvent, type ReactNode,
} from 'react';
import type { BlueBloodBenchmark, StatKey, Team, TrendDir } from '../types';
import { groupTeams } from '../config/ranking';
import { TREND_CLASS, TREND_GLYPH } from '../config/labels';
import { StatBreakdownList, STAT_KEYS } from './StatBreakdown';
import TeamLogo from './TeamLogo';

type HoverState = { team: Team; side: 'blurb' | 'stats' } | null;

/** trajectory mark: one arrow, or — for an emphatic move — two of the same arrow
 *  stacked vertically (▲ over ▲ / ▼ over ▼), not a side-by-side pair. */
function TrendMark({ dir, strong }: { dir: TrendDir; strong?: boolean }) {
  const glyph = TREND_GLYPH[dir];
  if (strong && dir !== 'even') {
    return (
      <span
        className={`inline-flex flex-col items-center ${TREND_CLASS[dir]}`}
        style={{ fontSize: '7px', lineHeight: 0.7 }}
        aria-label={dir === 'up' ? 'ascending sharply' : 'descending sharply'}
      >
        <span aria-hidden>{glyph}</span>
        <span aria-hidden>{glyph}</span>
      </span>
    );
  }
  return <span className={`text-[10px] leading-none ${TREND_CLASS[dir]}`}>{glyph}</span>;
}

interface Props {
  teams: Team[];
  favorite?: string | null;
  onPick?: (team: Team) => void;
  /** show the hand-drawn gap / range margin notes */
  showNotes?: boolean;
  /** per-tier descriptions from meta.tierDescriptions */
  descriptions?: Record<string, string>;
  /** the "average Blue Blood" marker line, from meta.blueBloodBenchmark */
  benchmark?: BlueBloodBenchmark | null;
  /** program being edited in a live what-if scenario — its rating shows in the what-if hue */
  scenarioSchool?: string | null;
}

// the rating spread within a grouping is only really interesting for the top of the table
const RANGE_GROUPS = new Set(['Blue Bloods', 'Blue Blood Contenders']);

export default function RankedList({
  teams, favorite, onPick, showNotes, descriptions, benchmark, scenarioSchool,
}: Props) {
  const groups = groupTeams(teams, descriptions);

  // ONE hover card for the whole list — a single element that follows the cursor
  // and swaps content as you cross rows. Nothing mounts/unmounts per row, so
  // scanning a tier never flickers; a single onMouseMove on the container decides
  // which team (if any) the cursor is over, so headers / gaps clear it cleanly.
  const bySchool = useMemo(() => new Map(teams.map((t) => [t.school, t])), [teams]);
  const [hover, setHover] = useState<HoverState>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const place = () => {
    const el = cardRef.current;
    if (!el) return;
    const pad = 16;
    const cw = el.offsetWidth || 380;
    const ch = el.offsetHeight || 240;
    let x = lastPos.current.x + pad;
    let y = lastPos.current.y + pad;
    if (x + cw > window.innerWidth - 8) x = lastPos.current.x - cw - pad;
    if (y + ch > window.innerHeight - 8) y = Math.max(8, window.innerHeight - ch - 8);
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    lastPos.current = { x: e.clientX, y: e.clientY };
    const zone = (e.target as HTMLElement).closest<HTMLElement>('[data-row-zone]');
    const school = zone?.closest<HTMLElement>('[data-school]')?.dataset.school;
    const team = school ? bySchool.get(school) : undefined;
    if (!team || !zone) {
      setHover((h) => (h ? null : h));
      return;
    }
    const side = zone.dataset.rowZone as 'blurb' | 'stats';
    setHover((h) => (h && h.team === team && h.side === side ? h : { team, side }));
    place();
  };
  // position the freshly-mounted card before paint (no flash at 0,0)
  useLayoutEffect(place, [hover]);
  useEffect(() => {
    if (!hover) return;
    const clear = () => setHover(null);
    window.addEventListener('scroll', clear, true);
    return () => window.removeEventListener('scroll', clear, true);
  }, [hover]);

  return (
    <div
      className="relative flex flex-col gap-7"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      {hover && (
        <div
          ref={cardRef}
          className="pointer-events-none fixed left-0 top-0 z-50 rounded-md border border-line bg-panel text-left font-normal normal-case tracking-normal shadow-xl"
          style={{ width: hover.side === 'blurb' ? '26rem' : '20rem', maxWidth: 'calc(100vw - 1rem)' }}
        >
          {hover.side === 'blurb'
            ? <BlurbCardBody team={hover.team} />
            : <StatCardBody team={hover.team} />}
        </div>
      )}
      {groups.map((g, i) => {
        const gap = i > 0 ? groups[i - 1].teams.at(-1)!.rating - g.teams[0].rating : 0;
        const spread = g.teams[0].rating - g.teams.at(-1)!.rating;
        const showRange = showNotes && RANGE_GROUPS.has(g.grouping);
        return (
          <div key={g.grouping} data-map={i === 0 ? 'a tier' : undefined} className="relative">
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
              <header
                data-map={i === 0 ? 'the tier header' : undefined}
                className="mb-1.5 flex items-baseline gap-2 px-1"
              >
                <h3 className="text-sm font-bold uppercase tracking-wide">{g.grouping}</h3>
                <span className="text-xs text-muted" title={`${g.teams.length} programs`}>
                  {g.teams.length}
                </span>
              </header>
              <p
                data-map={i === 0 ? 'the tier description' : undefined}
                className="mb-2 px-1 text-xs leading-snug text-muted"
              >
                {g.blurb}
              </p>

              <ol className="flex flex-col">
                {withBenchmark(
                  g.grouping === 'Blue Bloods' ? benchmark : null,
                  g.teams,
                  g.teams.map((t, j) => {
                  const fav = t.school === favorite;
                  const edited = t.school === scenarioSchool;
                  const firstRow = i === 0 && j === 0;
                  return (
                    <li
                      key={t.slug || t.school}
                      data-school={t.school}
                      data-map={firstRow ? 'a ranking row' : undefined}
                    >
                      <button
                        onClick={() => onPick?.(t)}
                        title={t.trend.insufficient ? 'Too few seasons on record to weigh with the rest — shown for completeness' : undefined}
                        className={`flex w-full items-stretch rounded-md border-l-2 text-left hover:bg-panel ${
                          t.trend.insufficient && !fav && !edited ? 'opacity-60' : ''
                        } ${
                          edited
                            ? 'border-whatif bg-whatif/10'
                            : fav
                              ? 'border-accent bg-accent/10'
                              : 'border-transparent'
                        }`}
                      >
                        {/* the two zones TILE the row edge-to-edge AND fill its full height
                            (the y-padding lives on the zones, not the button) — so there's no
                            dead band between rows. The hover card is a single, cursor-following
                            element (top of file) that never re-mounts or jumps. */}
                        {/* LEFT zone (≈60%) — rank, trajectory, logo, name/subline → the blurb card */}
                        <span
                          data-map={firstRow ? 'the ranking row blurb hover' : undefined}
                          data-row-zone="blurb"
                          className="flex min-w-0 flex-[3] items-center gap-3 py-1.5 pl-1.5 pr-3"
                        >
                          <span
                            data-map={firstRow ? 'the rank cell' : undefined}
                            className="flex w-7 shrink-0 items-center justify-end gap-0.5 text-sm font-semibold tabular-nums text-muted"
                          >
                            <span data-map={firstRow ? 'the trajectory arrow' : undefined} className="inline-flex">
                              <TrendMark dir={t.trend.dir} strong={t.trend.strong} />
                            </span>
                            {t.ratingRank}
                          </span>
                          <TeamLogo slug={t.slug} className="h-7 w-7 shrink-0" />
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-medium">{t.school}</span>
                              {fav && <span className="text-xs text-accent">★</span>}
                            </span>
                            <span
                              data-map={firstRow ? 'the ranking row subline' : undefined}
                              className="block truncate text-xs text-muted"
                            >
                              {t.label.standard}
                            </span>
                          </span>
                        </span>
                        {/* RIGHT zone (≈40%) — stat strip + rating → the stat-breakdown card */}
                        <span
                          data-map={firstRow ? 'the ranking row stat hover' : undefined}
                          data-row-zone="stats"
                          className="flex flex-[2] items-center justify-end gap-3 py-1.5 pl-3 pr-1.5"
                        >
                          <StatStrip team={t} mapLabel={firstRow ? 'the stat strip' : undefined} />
                          <span
                            data-map={firstRow ? 'the rating number' : undefined}
                            className={`w-12 text-right text-sm font-bold tabular-nums ${edited ? 'text-whatif' : ''}`}
                            title={edited ? 'edited in the what-if scenario' : undefined}
                          >
                            {edited && <span aria-hidden>⚡</span>}
                            {t.rating.toFixed(1)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                }),
                )}
              </ol>
            </section>
          </div>
        );
      })}
    </div>
  );
}

/** splice the Blue Blood benchmark marker into the tier's rows at the spot its
 *  rating would place it (no rank / no rating shown inline; detail on hover). */
function withBenchmark(
  benchmark: BlueBloodBenchmark | null | undefined,
  teams: Team[],
  rows: ReactNode[],
): ReactNode[] {
  if (!benchmark) return rows;
  const at = teams.filter((t) => t.rating >= benchmark.rating).length;
  return [
    ...rows.slice(0, at),
    <BenchmarkRule key="bb-benchmark" benchmark={benchmark} />,
    ...rows.slice(at),
  ];
}

/** a dashed rule across the Blue Bloods tier marking the "average Blue Blood".
 *  Rating and the ten-stat breakdown are on hover only. */
function BenchmarkRule({ benchmark }: { benchmark: BlueBloodBenchmark }) {
  return (
    <li data-map="the blue blood benchmark" className="group relative my-0.5 list-none">
      <div className="flex items-center gap-2 px-1.5 py-1">
        <span className="h-px flex-1 border-t border-dashed border-accent/50" />
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-accent/80">
          Blue Blood benchmark
        </span>
        <span className="h-px flex-1 border-t border-dashed border-accent/50" />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 hidden w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-md border border-line bg-panel p-2.5 text-left shadow-lg group-hover:block">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-xs font-bold">Blue Blood benchmark</span>
          <span className="text-xs font-bold tabular-nums text-accent">
            {benchmark.rating.toFixed(1)} rating
          </span>
        </div>
        <p className="mb-2 text-[10px] leading-snug text-muted">
          The Blue Bloods’ average, stat by stat — {benchmark.members.join(', ')}. Same trimmed-mean
          formula every program uses; the greyed rows are its own high/low outliers, dropped from
          the rating.
        </p>
        <StatBreakdownList
          pct={benchmark.pct}
          stats={benchmark.stats}
          trimmedLow={benchmark.trimmedLow}
          trimmedHigh={benchmark.trimmedHigh}
          dense
        />
      </div>
    </li>
  );
}

/** ten bars, one per rating stat — darker = higher percentile; the program's own
 *  high/low outliers (dropped from its rating) are greyed. Detail is on the
 *  right-side row hover, not per bar. */
function StatStrip({ team, mapLabel }: { team: Team; mapLabel?: string }) {
  const trimmed = new Set<StatKey>([team.trimmedLow, team.trimmedHigh]);
  return (
    <span data-map={mapLabel} className="hidden items-center gap-[3px] sm:flex">
      {STAT_KEYS.map((sk) => {
        const pctl = team.pct[sk];
        const isTrim = trimmed.has(sk);
        return (
          <span
            key={sk}
            className="block h-4 w-2.5 rounded-sm"
            style={{
              background: isTrim ? 'rgb(var(--muted))' : team.primary,
              opacity: (isTrim ? 0.22 : 0.2) + (isTrim ? 0.4 : 0.8) * (pctl / 100),
            }}
          />
        );
      })}
    </span>
  );
}

/** shared header for the two row-hover cards: logo, name, identity, trajectory */
function TeamHoverHeader({ team }: { team: Team }) {
  return (
    <div className="mb-2 flex items-start gap-2 border-b border-line pb-2">
      <TeamLogo slug={team.slug} className="h-8 w-8 shrink-0" />
      <div className="min-w-0">
        <div className="text-sm font-bold leading-tight">{team.school}</div>
        <div className="text-[10px] text-muted">{team.identity}</div>
        <div className={`flex items-center gap-1 text-[10px] ${TREND_CLASS[team.trend.dir]}`}>
          <TrendMark dir={team.trend.dir} strong={team.trend.strong} />
          <span>{team.label.standard}</span>
        </div>
      </div>
    </div>
  );
}

/** left-side row hover body — the three narrative blurbs + team details */
function BlurbCardBody({ team }: { team: Team }) {
  return (
    <div className="p-3">
      <TeamHoverHeader team={team} />
      <dl className="flex flex-col gap-2 text-[11px] leading-relaxed">
        <div>
          <dt className="font-semibold text-muted">Trajectory</dt>
          <dd>{team.label.trajectoryTooltip}</dd>
        </div>
        <div>
          <dt className="font-semibold text-muted">Standing</dt>
          <dd>{team.standing}</dd>
        </div>
        <div>
          <dt className="font-semibold text-muted">Path Forward</dt>
          <dd>{team.pathForward}</dd>
        </div>
      </dl>
    </div>
  );
}

/** right-side row hover body — the ten-stat breakdown + team details */
function StatCardBody({ team }: { team: Team }) {
  return (
    <div className="p-2.5">
      <TeamHoverHeader team={team} />
      <div className="mb-1 flex items-baseline justify-between text-[10px] font-semibold uppercase tracking-wide text-muted">
        <span>Stat · value · percentile</span>
        <span>Rating {team.rating.toFixed(1)}</span>
      </div>
      <StatBreakdownList
        pct={team.pct}
        stats={team.stats}
        trimmedLow={team.trimmedLow}
        trimmedHigh={team.trimmedHigh}
        color={team.primary}
        dense
      />
      <p className="mt-1.5 text-[10px] leading-snug text-muted">
        Greyed rows are this program&rsquo;s single highest and lowest percentiles — dropped before
        the other eight are averaged into the {team.rating.toFixed(1)} rating.
      </p>
    </div>
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
      data-map="the gap note"
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
      data-map="the range note"
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
