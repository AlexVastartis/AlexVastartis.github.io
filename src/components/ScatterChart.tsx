import { useMemo, useState } from 'react';
import type { StatKey, Team } from '../types';
import { STATS } from '../config/stats';
import { DEFAULT_MARGINS, linearScales } from '../lib/scale';
import type { MarkerMode } from '../data/useViewState';
import TeamMarker from './TeamMarker';
import FavoriteHalo from './FavoriteHalo';
import ChartReadout from './ChartReadout';

interface Props {
  /** the teams to draw (already conference-filtered) — also sets the axis range */
  teams: Team[];
  xStat: StatKey;
  yStat: StatKey;
  marker: MarkerMode;
  favorite?: string | null;
  onPick?: (school: string) => void;
  /** z-order key — bigger renders on top. defaults to x-percentile + y-percentile. */
  order?: (t: Team) => number;
  width?: number;
  height?: number;
  markerSize?: number;
  /** svg sizing classes — default fills width and keeps aspect ratio */
  className?: string;
}

export default function ScatterChart({
  teams,
  xStat,
  yStat,
  marker,
  favorite,
  onPick,
  order,
  width = 1000,
  height = 600,
  markerSize = 26,
  className = 'w-full h-auto select-none',
}: Props) {
  const m = DEFAULT_MARGINS;
  const [hover, setHover] = useState<Team | null>(null);
  // picking a team unmounts the marker under the cursor (it moves into FavoriteHalo,
  // or back out on deselect), so no mouseleave fires — drop the hover readout by hand
  const pick = onPick ? (school: string) => { setHover(null); onPick(school); } : undefined;
  // the readout defaults to the highlighted team and is replaced while hovering another
  const readout = hover ?? teams.find((t) => t.school === favorite) ?? null;

  // axis range follows the teams actually on screen, so a filtered view isn't
  // squished against data that's no longer plotted
  const { x, y, xTicks, yTicks } = useMemo(
    () =>
      linearScales(
        teams.map((t) => t.stats[xStat]),
        teams.map((t) => t.stats[yStat]),
        width,
        height,
        m,
      ),
    [teams, xStat, yStat, width, height, m],
  );

  // no de-overlap: overlap is part of the fun. sort so higher-<criterion> lands on top.
  const placed = useMemo(() => {
    const rank = order ?? ((t: Team) => t.pct[xStat] + t.pct[yStat]);
    return [...teams]
      .sort((a, b) => rank(a) - rank(b))
      .map((team) => ({ team, x: x(team.stats[xStat]), y: y(team.stats[yStat]) }));
  }, [teams, x, y, xStat, yStat, order]);

  const fmtX = STATS[xStat].format ?? ((v: number) => String(v));
  const fmtY = STATS[yStat].format ?? ((v: number) => String(v));
  const fill = className.includes('h-full');

  return (
   <div className={`relative ${fill ? 'h-full w-full' : 'w-full'}`}>
    {readout && (
      <ChartReadout
        team={readout}
        rows={[
          { label: STATS[xStat].label, value: `${fmtX(readout.stats[xStat])} · ${readout.pct[xStat].toFixed(1)}` },
          { label: STATS[yStat].label, value: `${fmtY(readout.stats[yStat])} · ${readout.pct[yStat].toFixed(1)}` },
        ]}
      />
    )}
    <svg
      data-map="the scatter"
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
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
        <title>{`${STATS[xStat].label} — raw total across all 130 FBS programs`}</title>
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
        <title>{`${STATS[yStat].label} — raw total across all 130 FBS programs`}</title>
        {STATS[yStat].axisLabel}
      </text>

      {/* markers — the favourite is drawn once, by FavoriteHalo below */}
      {placed.map((n) =>
        n.team.school === favorite ? null : (
          <TeamMarker
            key={n.team.slug || n.team.school}
            team={n.team}
            cx={n.x}
            cy={n.y}
            size={markerSize}
            mode={marker}
            dimmed={favorite != null}
            onHover={setHover}
            onPick={pick}
          />
        ),
      )}

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
              onHover={setHover}
              onPick={pick}
            />
          ) : null;
        })()}

    </svg>
   </div>
  );
}
