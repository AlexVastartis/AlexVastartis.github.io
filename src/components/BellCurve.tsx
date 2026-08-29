import { useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import type { StatDistribution, Team } from '../types';
import { DEFAULT_MARGINS } from '../lib/scale';
import { normalPdf } from '../lib/stats';
import type { MarkerMode } from '../data/useViewState';
import TeamMarker from './TeamMarker';
import FavoriteHalo from './FavoriteHalo';

interface Props {
  teams: Team[];
  /** the value that positions a team along the curve (e.g. a composite or overall z) */
  value: (t: Team) => number;
  /** league distribution the curve is drawn from */
  distribution: StatDistribution;
  xLabel: string;
  marker: MarkerMode;
  /** schools to keep at full strength while the rest dim (optional storytelling) */
  highlight?: Set<string>;
  favorite?: string | null;
  onPick?: (school: string) => void;
  width?: number;
  height?: number;
  markerSize?: number;
}

export default function BellCurve({
  teams,
  value,
  distribution,
  xLabel,
  marker,
  highlight,
  favorite,
  onPick,
  width = 1000,
  height = 460,
  markerSize = 26,
}: Props) {
  const m = { ...DEFAULT_MARGINS, left: 44, right: 44 };
  const [hover, setHover] = useState<Team | null>(null);

  const mu = distribution.mean;
  const sd = distribution.stddev || 1;
  const lo = mu - 3.6 * sd;
  const hi = mu + 3.6 * sd;
  const baseline = height - m.bottom;
  const peakY = m.top + 6;
  const peak = normalPdf(0);

  const x = useMemo(
    () => scaleLinear().domain([lo, hi]).range([m.left, width - m.right]),
    [lo, hi, width, m.left, m.right],
  );

  // y on the theoretical curve for a given raw value
  const curveY = (v: number) => {
    const z = (v - mu) / sd;
    return baseline - (normalPdf(z) / peak) * (baseline - peakY);
  };

  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 160; i += 1) {
      const v = lo + (i / 160) * (hi - lo);
      pts.push(`${i === 0 ? 'M' : 'L'}${x(v).toFixed(1)} ${curveY(v).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [lo, hi, x, mu, sd]);

  // draw least-impressive first so the best land on top
  const ordered = useMemo(
    () => [...teams].sort((a, b) => value(a) - value(b)),
    [teams, value],
  );

  const band = (a: number, b: number) => {
    const x0 = x(Math.max(lo, mu + a * sd));
    const x1 = x(Math.min(hi, mu + b * sd));
    return { x: x0, w: x1 - x0 };
  };
  const b1 = band(-1, 1);
  const b2a = band(-2, -1);
  const b2b = band(1, 2);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto select-none"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <g>
        <rect x={b2a.x} y={m.top} width={b2a.w} height={baseline - m.top} fill="rgb(var(--chart-grid))" opacity={0.45} />
        <rect x={b2b.x} y={m.top} width={b2b.w} height={baseline - m.top} fill="rgb(var(--chart-grid))" opacity={0.45} />
        <rect x={b1.x} y={m.top} width={b1.w} height={baseline - m.top} fill="rgb(var(--chart-grid))" opacity={0.75} />
      </g>

      <line x1={x(mu)} x2={x(mu)} y1={m.top} y2={baseline} stroke="rgb(var(--chart-axis))" strokeDasharray="4 4" />
      <path d={curvePath} fill="none" stroke="rgb(var(--accent))" strokeWidth={2} opacity={0.85} />
      <line x1={m.left} x2={width - m.right} y1={baseline} y2={baseline} stroke="rgb(var(--chart-axis))" strokeWidth={1.5} />

      <g fill="rgb(var(--chart-label))" fontSize={11} textAnchor="middle">
        {[-3, -2, -1, 0, 1, 2, 3].map((s) => (
          <text key={s} x={x(mu + s * sd)} y={baseline + 16}>
            {s === 0 ? 'mean' : `${s > 0 ? '+' : ''}${s}σ`}
          </text>
        ))}
      </g>
      <text x={(m.left + width - m.right) / 2} y={height - 8} textAnchor="middle" fill="rgb(var(--chart-label))" fontSize={13} fontWeight={600}>
        {xLabel}
      </text>

      {ordered.map((t) => {
        if (t.school === favorite) return null;
        const v = value(t);
        const cx = x(Math.max(lo, Math.min(hi, v)));
        const cy = curveY(v) - markerSize * 0.12;
        const dim = highlight ? (highlight.has(t.school) ? 1 : 0.45) : 1;
        return (
          <g key={t.slug || t.school} opacity={dim} style={{ transition: 'opacity 120ms' }}>
            {highlight?.has(t.school) && (
              <circle cx={cx} cy={cy} r={markerSize * 0.62} fill="none" stroke={t.primary} strokeWidth={2} />
            )}
            <TeamMarker team={t} cx={cx} cy={cy} size={markerSize} mode={marker} onHover={setHover} onPick={onPick} />
          </g>
        );
      })}

      {favorite &&
        (() => {
          const f = teams.find((t) => t.school === favorite);
          if (!f) return null;
          const v = value(f);
          return (
            <FavoriteHalo
              team={f}
              cx={x(Math.max(lo, Math.min(hi, v)))}
              cy={curveY(v) - markerSize * 0.12}
              size={markerSize + 8}
              marker={marker}
              onHover={setHover}
              onPick={onPick}
            />
          );
        })()}

      {hover && (
        <text x={width - m.right} y={m.top + 2} textAnchor="end" fontSize={13} fontWeight={700} fill="rgb(var(--ink))">
          {hover.school} · {value(hover).toFixed(2)}σ
        </text>
      )}
    </svg>
  );
}
