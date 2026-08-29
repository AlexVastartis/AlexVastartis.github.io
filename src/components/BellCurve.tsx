import { useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import type { CategoryKey, DataMeta, Team } from '../types';
import { CATEGORIES } from '../config/stats';
import { DEFAULT_MARGINS } from '../lib/scale';
import { normalPdf } from '../lib/stats';
import type { MarkerMode } from '../data/useViewState';
import type { Theme } from '../lib/theme';
import TeamMarker from './TeamMarker';

interface Props {
  category: CategoryKey;
  teams: Team[];
  allTeams: Team[];
  meta: DataMeta;
  marker: MarkerMode;
  theme: Theme;
  width?: number;
  height?: number;
  markerSize?: number;
}

export default function BellCurve({
  category,
  teams,
  allTeams,
  meta,
  marker,
  theme,
  width = 1000,
  height = 460,
  markerSize = 24,
}: Props) {
  const m = { ...DEFAULT_MARGINS, left: 40, right: 40 };
  const [hover, setHover] = useState<Team | null>(null);
  const dist = meta.composites[category];
  const sd = dist.stddev || 1;

  const x = useMemo(
    () =>
      scaleLinear()
        .domain([dist.mean - 3.4 * sd, dist.mean + 3.4 * sd])
        .range([m.left, width - m.right]),
    [dist.mean, sd, width, m.left, m.right],
  );

  // histogram-style stacking: one column per marker-width bucket, teams piled upward.
  // row height shrinks if a tall stack would overflow the plot area.
  const { placed, curveTop } = useMemo(() => {
    const sorted = [...allTeams].sort((a, b) => a.composite[category] - b.composite[category]);
    const visible = new Set(teams.map((t) => t.slug || t.school));
    const baseline = height - m.bottom;
    const bucketOf = (t: Team) => Math.round(x(t.composite[category]) / markerSize);

    const counts = new Map<number, number>();
    for (const t of sorted) counts.set(bucketOf(t), (counts.get(bucketOf(t)) ?? 0) + 1);
    const maxStack = Math.max(1, ...counts.values());

    const availH = baseline - m.top - 12;
    const rowH = Math.min(markerSize * 0.86, availH / maxStack);

    const seen = new Map<number, number>();
    const out: { team: Team; cx: number; cy: number; visible: boolean }[] = [];
    for (const t of sorted) {
      const b = bucketOf(t);
      const n = seen.get(b) ?? 0;
      seen.set(b, n + 1);
      out.push({
        team: t,
        cx: b * markerSize,
        cy: baseline - markerSize / 2 - n * rowH,
        visible: visible.has(t.slug || t.school),
      });
    }
    return { placed: out, curveTop: baseline - maxStack * rowH - 8 };
  }, [allTeams, teams, category, x, markerSize, height, m.bottom, m.top]);

  const curve = useMemo(() => {
    const peak = normalPdf(0);
    const pts: string[] = [];
    for (let i = 0; i <= 120; i += 1) {
      const xv = dist.mean - 3.4 * sd + (i / 120) * 6.8 * sd;
      const z = (xv - dist.mean) / sd;
      const yv = height - m.bottom - (normalPdf(z) / peak) * (height - m.bottom - curveTop);
      pts.push(`${i === 0 ? 'M' : 'L'}${x(xv).toFixed(1)} ${yv.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [dist.mean, sd, x, height, m.bottom, curveTop]);

  const band = (lo: number, hi: number) => ({ x: x(dist.mean + lo * sd), w: x(dist.mean + hi * sd) - x(dist.mean + lo * sd) });
  const b1 = band(-1, 1);
  const b2a = band(-2, -1);
  const b2b = band(1, 2);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* sigma bands */}
      <g>
        <rect x={b2a.x} y={m.top} width={b2a.w} height={height - m.bottom - m.top} fill="rgb(var(--chart-grid))" opacity={0.4} />
        <rect x={b2b.x} y={m.top} width={b2b.w} height={height - m.bottom - m.top} fill="rgb(var(--chart-grid))" opacity={0.4} />
        <rect x={b1.x} y={m.top} width={b1.w} height={height - m.bottom - m.top} fill="rgb(var(--chart-grid))" opacity={0.7} />
      </g>

      {/* mean line */}
      <line x1={x(dist.mean)} x2={x(dist.mean)} y1={m.top} y2={height - m.bottom} stroke="rgb(var(--chart-axis))" strokeDasharray="4 4" />

      {/* theoretical normal curve */}
      <path d={curve} fill="none" stroke="rgb(var(--accent))" strokeWidth={2} opacity={0.8} />

      {/* baseline */}
      <line x1={m.left} x2={width - m.right} y1={height - m.bottom} y2={height - m.bottom} stroke="rgb(var(--chart-axis))" strokeWidth={1.5} />

      {/* sigma tick labels */}
      <g fill="rgb(var(--chart-label))" fontSize={11} textAnchor="middle">
        {[-2, -1, 0, 1, 2].map((s) => (
          <text key={s} x={x(dist.mean + s * sd)} y={height - m.bottom + 16}>
            {s === 0 ? 'mean' : `${s > 0 ? '+' : ''}${s}σ`}
          </text>
        ))}
      </g>
      <text x={(m.left + width - m.right) / 2} y={height - 8} textAnchor="middle" fill="rgb(var(--chart-label))" fontSize={13} fontWeight={600}>
        {CATEGORIES[category].label} — composite score (z)
      </text>

      {/* teams */}
      {placed.map((p) => (
        <TeamMarker
          key={p.team.slug || p.team.school}
          team={p.team}
          cx={p.cx}
          cy={p.cy}
          size={markerSize}
          mode={marker}
          theme={theme}
          dimmed={!p.visible}
          onHover={setHover}
        />
      ))}

      {hover && (
        <text x={width - m.right} y={m.top + 4} textAnchor="end" fontSize={13} fontWeight={700} fill="rgb(var(--ink))">
          {hover.school}: {hover.composite[category].toFixed(2)}z
        </text>
      )}
    </svg>
  );
}
