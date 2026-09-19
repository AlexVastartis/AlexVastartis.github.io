import { memo, useEffect, useMemo, useState } from 'react';
import type { Team } from '../types';
import type { MarkerMode, WinsMode } from '../data/useViewState';
import { useDecadeColumns } from '../data/useDecadeRanks';
import { useIsDark } from '../lib/theme';
import TeamMarker from './TeamMarker';
import ChartReadout from './ChartReadout';

const W = 1200;
const SIDE = 84; // room for the row numbers at either edge
const TOP = 30;
const ROW = 34;
const SIZE = 26;
const HEADER_H = 46; // px — the sticky column header

/** the six groupings, top down — colour + short label for the tier bands. The
 *  cut points differ in every column, so each column draws its own bands. */
const TIERS: Record<string, { label: string; color: string }> = {
  'Blue Bloods': { label: 'BLUE BLOODS', color: '#3b82f6' },
  'Blue Blood Fringe': { label: 'FRINGE', color: '#a855f7' },
  'Blue Blood Contenders': { label: 'CONTENDERS', color: '#14b8a6' },
  'National Powers': { label: 'POWERS', color: '#f59e0b' },
  'National Brands': { label: 'BRANDS', color: '#94a3b8' },
  'The Field': { label: 'FIELD', color: '#64748b' },
};

interface Band {
  tier: string;
  from: number; // first row (0-based) of the band
  to: number; // last row
}

/** consecutive rows sharing a grouping, within one column */
function bandsOf(teams: Team[]): Band[] {
  const out: Band[] = [];
  teams.forEach((t, row) => {
    const last = out[out.length - 1];
    if (last && last.tier === t.grouping) last.to = row;
    else out.push({ tier: t.grouping, from: row, to: row });
  });
  return out;
}

/** relative luminance of a #rrggbb colour, 0 (black) – 1 (white) */
function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0.5;
  const c = [0, 2, 4].map((i) => {
    const v = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** a team colour that actually shows against the current background */
function lineColor(t: Team, dark: boolean): string {
  const ok = (h: string) => (dark ? luminance(h) >= 0.1 : luminance(h) <= 0.8);
  if (ok(t.primary)) return t.primary;
  if (ok(t.secondary)) return t.secondary;
  return dark ? '#9ca3af' : '#6b7280';
}

/** the tier bands are optional (off by default) — remember the choice between visits */
const TIERS_KEY = 'bbf-decade-tiers';
function readTiersPref(): boolean {
  try {
    return localStorage.getItem(TIERS_KEY) === 'on';
  } catch {
    return false;
  }
}

interface Pt {
  team: Team;
  col: number;
  x: number;
  y: number;
  label: string;
}

interface Hover {
  team: Team;
  label: string;
  through: number;
}

/** one program's line segments, column to column */
function ProgramLines({ pts, dark, width, opacity }: { pts: Pt[]; dark: boolean; width: number; opacity: number }) {
  return (
    <>
      {pts.slice(1).map((p, i) => {
        const q = pts[i];
        if (p.col - q.col !== 1) return null;
        const mx = (q.x + p.x) / 2;
        return (
          <path
            key={p.col}
            d={`M ${q.x} ${q.y} C ${mx} ${q.y}, ${mx} ${p.y}, ${p.x} ${p.y}`}
            fill="none"
            stroke={lineColor(p.team, dark)}
            strokeWidth={width}
            strokeLinecap="round"
            opacity={opacity}
          />
        );
      })}
    </>
  );
}

/**
 * The resting board — every line and every logo. It is memoised on the data
 * alone, so a hover never re-renders (or re-orders) the ~1,100 markers: the
 * highlight is drawn as a separate overlay above it, and the whole board is
 * simply dimmed while one program is being traced.
 */
const Board = memo(function Board({
  bySchool,
  dark,
  marker,
  onPick,
  onHover,
}: {
  bySchool: Map<string, Pt[]>;
  dark: boolean;
  marker: MarkerMode;
  onPick: (school: string) => void;
  onHover: (team: Team | null, col: number) => void;
}) {
  const all = [...bySchool.entries()];
  return (
    <>
      {all.map(([school, pts]) => (
        <ProgramLines key={school} pts={pts} dark={dark} width={1.6} opacity={0.45} />
      ))}
      {all.map(([school, pts]) =>
        pts.map((p) => (
          <TeamMarker
            key={`${school}-${p.col}`}
            team={p.team}
            cx={p.x}
            cy={p.y}
            size={SIZE}
            mode={marker}
            onHover={(t) => onHover(t, p.col)}
            onPick={onPick}
          />
        )),
      )}
    </>
  );
});

/**
 * Every program at every point in time — each As Of snapshot plus today — as a
 * bump chart: columns are points in time, rows are Blue Blood Rating rank (best
 * at the top), every program is its logo. A line follows a program from one
 * column to the next. The conference filter narrows the board and the rows
 * close up, so a filtered chart reads as that conference's own ranking.
 */
export default function DecadeRankChart({
  marker,
  favorite,
  onPick,
  schools,
  filtered,
  wins,
}: {
  marker: MarkerMode;
  favorite: string | null;
  onPick: (school: string) => void;
  /** the programs the conference filter lets through */
  schools: Set<string>;
  /** true when the conference filter is narrowing the board */
  filtered: boolean;
  wins: WinsMode;
}) {
  const { columns: all, error } = useDecadeColumns(wins);
  const dark = useIsDark();
  const [showTiers, setShowTiers] = useState(readTiersPref);
  const [big, setBig] = useState(false);
  const [hover, setHover] = useState<Hover | null>(null);

  // Esc leaves the expanded view; lock page scroll while it's open
  useEffect(() => {
    if (!big) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setBig(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [big]);

  const columns = useMemo(
    () => (all ? all.map((c) => ({ ...c, teams: c.teams.filter((t) => schools.has(t.school)) })) : null),
    [all, schools],
  );

  const layout = useMemo(() => {
    if (!columns) return null;
    const step = (W - 2 * SIDE) / (columns.length - 1);
    const xs = columns.map((_, i) => SIDE + i * step);
    const bySchool = new Map<string, Pt[]>();
    columns.forEach((c, ci) => {
      c.teams.forEach((t, row) => {
        const pt: Pt = { team: t, col: ci, x: xs[ci], y: TOP + row * ROW, label: c.label };
        const arr = bySchool.get(t.school) ?? [];
        arr.push(pt);
        bySchool.set(t.school, arr);
      });
    });
    const rows = Math.max(1, ...columns.map((c) => c.teams.length));
    return { xs, step, bySchool, rows, H: TOP + (rows - 1) * ROW + TOP };
  }, [columns]);

  // stable handler for the memoised board; looks up the column's label / "through" season
  const onHover = useMemo(
    () => (team: Team | null, col: number) =>
      setHover(team && columns ? { team, label: columns[col].label, through: columns[col].through } : null),
    [columns],
  );

  if (error) return <p className="text-sm text-rose-400">Couldn’t load the snapshots: {error}</p>;
  if (!columns || !layout) return <p className="py-10 text-center text-sm text-muted">Loading the decades…</p>;

  const { xs, step, bySchool, rows, H } = layout;
  const active = hover?.team.school ?? null;
  const half = step / 2 - 5;
  const rowTop = (row: number) => TOP + row * ROW;
  const empty = columns.every((c) => c.teams.length === 0);

  // the programs drawn as a highlight above the board: the starred one + the hovered one
  const hot = [...new Set([favorite, active].filter((s): s is string => !!s && bySchool.has(s)))];

  const toggleTiers = () => {
    setShowTiers(!showTiers);
    try {
      localStorage.setItem(TIERS_KEY, showTiers ? 'off' : 'on');
    } catch {
      /* private mode — the choice just won't persist */
    }
  };

  const bar = (
    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <p className="min-w-0 flex-1 text-xs text-muted">
        Every program’s Blue Blood Rank at each point in time. Hover a logo to trace it, click to highlight it.
        {filtered && ' Rows count within the conference filter.'}
      </p>
      {showTiers && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          {Object.entries(TIERS).map(([k, m]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm" style={{ background: `${m.color}55` }} aria-hidden />
              {k}
            </span>
          ))}
        </div>
      )}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          role="switch"
          aria-checked={showTiers}
          onClick={toggleTiers}
          title="Show or hide the tier bands behind the logos"
          className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-line ${
            showTiers ? 'bg-accent text-white' : 'text-muted hover:bg-panel hover:text-ink'
          }`}
        >
          Tiers
        </button>
        <button
          type="button"
          data-map="the chart expand toggle"
          onClick={() => setBig(!big)}
          title={big ? 'Back to the page (Esc)' : 'Expand the chart to full screen'}
          className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium text-muted hover:text-ink"
        >
          <span aria-hidden>{big ? '⤡' : '⤢'}</span> {big ? 'Shrink · Esc' : 'Expand'}
        </button>
      </div>
    </div>
  );

  const board = (
    <>
      {/* column headers stay put while the tall board scrolls under them */}
      <div
        className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur"
        style={{ height: HEADER_H }}
        aria-hidden
      >
        {columns.map((c, i) => (
          <div
            key={c.label}
            className="absolute top-1 -translate-x-1/2 text-center leading-tight"
            style={{ left: `${(xs[i] / W) * 100}%` }}
          >
            <div className="text-base font-extrabold text-ink">{c.label}</div>
            <div className="text-[10px] text-muted">through {c.through}</div>
          </div>
        ))}
      </div>

      {/* the readout rides along under the header as the board scrolls */}
      <div className="pointer-events-none sticky z-20 h-0" style={{ top: HEADER_H + 4 }}>
        {hover && (
          <ChartReadout
            team={hover.team}
            corner="tr"
            rows={[
              { label: hover.label === 'Now' ? 'Now' : `${hover.label} off-season`, value: `through ${hover.through}` },
              { label: 'Rank', value: `#${hover.team.ratingRank}` },
              { label: 'Rating', value: hover.team.rating.toFixed(1) },
              { label: 'Tier', value: hover.team.grouping },
            ]}
          />
        )}
      </div>

      {empty ? (
        <p className="py-10 text-center text-sm text-muted">No programs match the conference filter.</p>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="Every program by decade"
          onMouseLeave={() => setHover(null)}
        >
          {/* the groupings — one tinted band per tier, cut where THAT column's tiers break */}
          {showTiers &&
            columns.map((c, i) =>
              bandsOf(c.teams).map((b) => {
                const meta = TIERS[b.tier] ?? TIERS['The Field'];
                const y0 = rowTop(b.from) - ROW / 2 + 1.5;
                const y1 = rowTop(b.to) + ROW / 2 - 1.5;
                return (
                  <g key={`${c.label}-${b.tier}`}>
                    <rect
                      x={xs[i] - half}
                      y={y0}
                      width={half * 2}
                      height={y1 - y0}
                      rx={8}
                      fill={meta.color}
                      fillOpacity={0.09}
                      stroke="none"
                    />
                    {y1 - y0 > 16 && (
                      <text
                        x={xs[i] + half - 3}
                        y={y0 + 9}
                        textAnchor="end"
                        fontSize={7}
                        fontWeight={600}
                        letterSpacing={0.5}
                        fill={meta.color}
                        opacity={0.65}
                      >
                        {meta.label}
                      </text>
                    )}
                  </g>
                );
              }),
            )}

          {/* column guides */}
          {columns.map((c, i) => (
            <line
              key={c.label}
              x1={xs[i]}
              x2={xs[i]}
              y1={0}
              y2={H}
              stroke="rgb(var(--line))"
              strokeWidth={1}
              strokeDasharray="2 5"
              opacity={0.6}
            />
          ))}

          {/* rank numbers, both edges */}
          {Array.from({ length: rows }, (_, r) => (
            <g key={r}>
              <text x={16} y={rowTop(r)} textAnchor="middle" dominantBaseline="central" fontSize={11} fill="rgb(var(--muted))">
                {r + 1}
              </text>
              <text x={W - 16} y={rowTop(r)} textAnchor="middle" dominantBaseline="central" fontSize={11} fill="rgb(var(--muted))">
                {r + 1}
              </text>
            </g>
          ))}

          {/* the resting board — dimmed as a whole while one program is traced */}
          <g style={{ opacity: active ? 0.22 : 1, transition: 'opacity 120ms' }}>
            <Board bySchool={bySchool} dark={dark} marker={marker} onPick={onPick} onHover={onHover} />
          </g>

          {/* the highlight: the starred / hovered program, redrawn full-strength on top.
              pointer-events off, so the marker under the cursor keeps the hover. */}
          <g pointerEvents="none">
            {hot.map((school) => (
              <ProgramLines key={`l-${school}`} pts={bySchool.get(school)!} dark={dark} width={3.5} opacity={1} />
            ))}
            {hot.map((school) =>
              bySchool.get(school)!.map((p) => (
                <g key={`m-${school}-${p.col}`}>
                  {school === favorite && (
                    <>
                      <circle cx={p.x} cy={p.y} r={SIZE / 2 + 4} fill="rgb(var(--paper))" />
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={SIZE / 2 + 3}
                        fill="none"
                        stroke={lineColor(p.team, dark)}
                        strokeWidth={2.5}
                      />
                    </>
                  )}
                  <TeamMarker team={p.team} cx={p.x} cy={p.y} size={SIZE} mode={marker} />
                </g>
              )),
            )}
          </g>
        </svg>
      )}
    </>
  );

  // ---- expanded: a full-screen overlay; the board scrolls inside it ----
  if (big) {
    return (
      <div
        data-map="the decade chart"
        className="fixed inset-0 z-50 flex flex-col bg-paper px-3 py-2.5"
        onMouseLeave={() => setHover(null)}
      >
        {bar}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px]">{board}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-map="the decade chart"
      className="rounded-xl border border-line bg-panel/40 p-3"
      onMouseLeave={() => setHover(null)}
    >
      {bar}
      {board}
    </div>
  );
}
