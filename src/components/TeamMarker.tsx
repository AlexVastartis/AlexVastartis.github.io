import { useEffect, useMemo, useState } from 'react';
import type { Team } from '../types';
import type { MarkerMode } from '../data/useViewState';
import type { ResolvedTheme } from '../lib/theme';
import { abbrev } from '../lib/abbrev';

interface Props {
  team: Team;
  cx: number;
  cy: number;
  size: number;
  mode: MarkerMode;
  theme: ResolvedTheme;
  dimmed?: boolean;
  onHover?: (team: Team | null) => void;
}

const BASE = import.meta.env.BASE_URL;

export default function TeamMarker({ team, cx, cy, size, mode, theme, dimmed, onHover }: Props) {
  // dark SVGs are never generated (only the 24 recoloured ones, which get retired),
  // so the chains below contain no guaranteed 404s
  const candidates = useMemo(() => {
    const svg = `${BASE}logos/${team.slug}.svg`;
    const png = `${BASE}logos/${team.slug}.png`;
    const darkPng = `${BASE}logos/dark/${team.slug}.png`;
    return theme === 'dark' ? [darkPng, svg, png] : [svg, png, darkPng];
  }, [team.slug, theme]);

  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [candidates]);
  const failed = idx >= candidates.length || !team.slug;
  const showBubble = mode === 'bubble' || failed;

  const handlers = {
    onMouseEnter: () => onHover?.(team),
    onMouseLeave: () => onHover?.(null),
    style: {
      opacity: dimmed ? 0.18 : 1,
      transition: 'opacity 120ms',
      imageRendering: 'auto' as const,
    },
  };

  if (showBubble) {
    const r = size * 0.42;
    return (
      <g {...handlers} className="cursor-default">
        <circle cx={cx} cy={cy} r={r} fill={team.primary} stroke={team.secondary} strokeWidth={1.5} />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={r * 0.7}
          fontWeight={700}
          fill="#fff"
          style={{ paintOrder: 'stroke', pointerEvents: 'none' }}
        >
          {abbrev(team.school)}
        </text>
      </g>
    );
  }

  return (
    <image
      href={candidates[idx]}
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      onError={() => setIdx((i) => i + 1)}
      {...handlers}
    />
  );
}
