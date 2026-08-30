import { useEffect, useMemo, useState } from 'react';
import type { Team } from '../types';
import type { MarkerMode } from '../data/useViewState';
import { abbrev } from '../lib/abbrev';
import { useIsDark } from '../lib/theme';
import { logoLightSrc, logoSrc } from '../lib/logoSrc';

interface Props {
  team: Team;
  cx: number;
  cy: number;
  size: number;
  mode: MarkerMode;
  dimmed?: boolean;
  onHover?: (team: Team | null) => void;
  onPick?: (school: string) => void;
}

export default function TeamMarker({ team, cx, cy, size, mode, dimmed, onHover, onPick }: Props) {
  const dark = useIsDark();
  // resolved asset first (dark-knockout in dark mode, bar the LIGHT_IN_DARK teams),
  // then the light asset, then a team-colour bubble
  const candidates = useMemo(() => {
    const primary = logoSrc(team.slug, dark);
    const light = logoLightSrc(team.slug);
    return primary === light ? [light] : [primary, light];
  }, [team.slug, dark]);

  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [candidates]);
  const failed = idx >= candidates.length || !team.slug;
  const showBubble = mode === 'bubble' || failed;

  const handlers = {
    onMouseEnter: () => onHover?.(team),
    onMouseLeave: () => onHover?.(null),
    onClick: onPick ? () => onPick(team.school) : undefined,
    style: {
      opacity: dimmed ? 0.25 : 1,
      transition: 'opacity 120ms',
      imageRendering: 'auto' as const,
      cursor: onPick ? 'pointer' : 'default',
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
