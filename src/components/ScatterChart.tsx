import { useMemo, useState } from 'react';
import type { DataMeta, StatKey, Team } from '../types';
import { STATS } from '../config/stats';
import { DEFAULT_MARGINS, linearScales } from '../lib/scale';
import type { MarkerMode } from '../data/useViewState';
import type { ResolvedTheme } from '../lib/theme';
import TeamMarker from './TeamMarker';
import FavoriteHalo from './FavoriteHalo';

interface Props {
  teams: Team[];
  allTeams: Team[];
  xStat: StatKey;
  yStat: StatKey;
  meta: DataMeta;
  marker: MarkerMode;
  theme: ResolvedTheme;
  favorite?: string | null;
  /** z-order key — bigger renders on top ("more impressive covers less impressive").
   *  defaults to the sum of the two plotted stats' z-scores. */
  order?: (t: Team) => number;
  width?: number;
  height?: number;
  markerSize?: number;
}

export default function ScatterChart({
  teams,
  allTeams,
  xStat,
  yStat,
  meta,
  marker,
  theme,
  favorite,
  order,
  width = 1000,
  height = 600,
  markerSize = 26,
}: Props) {
  const m = DEFAULT_MARGINS;
  const [hover, setHover] = useState<Team | null>(null);

  // axis domain is fixed to the full league so conference filtering doesn't rescale
  const { x, y, xTicks, yTicks } = useMemo(
    () =>
      linearScales(
        allTeams.map((t) => t.stats[xStat]),
        allTeams.map((t) => t.stats[yStat]),
        width,
        height,
        m,
      ),
    [allTeams, xStat, yStat, width, height, m],
  );

  // no de-overlap: overlap is part of the fun. just sort so the best land on top.
  const placed = useMemo(() => {
    const rank =
      order ??
      ((t: Team) => {
        const dx = meta.stats[xStat];
        const dy = meta.stats[yStat];
        const zx = dx.stddev ? (t.stats[xStat] - dx.mean) / dx.stddev : 0;
        const zy = dy.stddev ? (t.stats[yStat] - dy.mean) / dy.stddev : 0;
        return zx + zy;
      });
    return [...teams]
      .sort((a, b) => rank(a) - rank(b))
      .map((team) => ({ team, x: x(team.stats[xStat]), y: y(team.stats[yStat]) }));
  }, [teams, x, y, xStat, yStat, meta, order]);

  const fmtX = STATS[xStat].format ?? ((v: number) => String(v));
  const fmtY = STATS[yStat].format ?? ((v: number) => String(v));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto select-none"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* gridlines */}
      <g stroke="rgb(var(--chart-grid))" strokeWidth={1}>
        {xTicks.map((t) => (
          <line key={`gx${t}`} x1={x(t)} x2={x(t)} y1={m.top} y2={height - m.bottom} />
        ))}
        {yTicks.map((t) => (
          <line key={`gy${t}`} x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
        ))}
      </g>

      {/* axes */}
      <g stroke="rgb(var(--chart-axis))" strokeWidth={1.5}>
        <line x1={m.left} x2={width - m.right} y1={height - m.bottom} y2={height - m.bottom} />
        <line x1={m.left} x2={m.left} y1={m.top} y2={height - m.bottom} />
      </g>

      {/* tick labels */}
      <g fill="rgb(var(--chart-label))" fontSize={12}>
        {xTicks.map((t) => (
          <text key={`tx${t}`} x={x(t)} y={height - m.bottom + 18} textAnchor="middle">
            {fmtX(t)}
          </text>
        ))}
        {yTicks.map((t) => (
          <text key={`ty${t}`} x={m.left - 10} y={y(t) + 4} textAnchor="end">
            {fmtY(t)}
          </text>
        ))}
      </g>

      {/* axis titles */}
      <text
        x={(m.left + width - m.right) / 2}
        y={height - 12}
        textAnchor="middle"
        fill="rgb(var(--chart-label))"
        fontSize={14}
        fontWeight={600}
      >
        {STATS[xStat].axisLabel}
      </text>
      <text
        x={16}
        y={(m.top + height - m.bottom) / 2}
        textAnchor="middle"
        fill="rgb(var(--chart-label))"
        fontSize={14}
        fontWeight={600}
        transform={`rotate(-90 16 ${(m.top + height - m.bottom) / 2})`}
      >
        {STATS[yStat].axisLabel}
      </text>

      {/* markers */}
      {placed.map((n) => (
        <TeamMarker
          key={n.team.slug || n.team.school}
          team={n.team}
          cx={n.x}
          cy={n.y}
          size={markerSize}
          mode={marker}
          theme={theme}
          onHover={setHover}
        />
      ))}

      {/* favourite team, always on top */}
      {favorite &&
        (() => {
          const f = teams.find((t) => t.school === favorite);
          return f ? (
            <FavoriteHalo
              team={f}
              cx={x(f.stats[xStat])}
              cy={y(f.stats[yStat])}
              size={markerSize + 8}
              marker={marker}
              theme={theme}
              onHover={setHover}
            />
          ) : null;
        })()}

      {/* hover tooltip */}
      {hover && (
        <Tooltip
          team={hover}
          xStat={xStat}
          yStat={yStat}
          px={x(hover.stats[xStat])}
          py={y(hover.stats[yStat])}
          width={width}
        />
      )}
    </svg>
  );
}

function Tooltip({
  team,
  xStat,
  yStat,
  px,
  py,
  width,
}: {
  team: Team;
  xStat: StatKey;
  yStat: StatKey;
  px: number;
  py: number;
  width: number;
}) {
  const fmtX = STATS[xStat].format ?? String;
  const fmtY = STATS[yStat].format ?? String;
  const lines = [
    team.school,
    team.conference,
    `${STATS[xStat].label}: ${fmtX(team.stats[xStat])}`,
    `${STATS[yStat].label}: ${fmtY(team.stats[yStat])}`,
  ];
  const w = 200;
  const h = 18 + lines.length * 15;
  const bx = Math.min(Math.max(px + 14, 4), width - w - 4);
  const by = Math.max(py - h - 10, 4);
  return (
    <g pointerEvents="none">
      <rect x={bx} y={by} width={w} height={h} rx={6} fill="rgb(var(--panel))" stroke="rgb(var(--line))" />
      {lines.map((ln, i) => (
        <text
          key={i}
          x={bx + 10}
          y={by + 18 + i * 15}
          fontSize={i === 0 ? 13 : 11}
          fontWeight={i === 0 ? 700 : 400}
          fill="rgb(var(--ink))"
        >
          {ln}
        </text>
      ))}
    </g>
  );
}
