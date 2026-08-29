import type { Team } from '../types';
import type { MarkerMode } from '../data/useViewState';
import type { ResolvedTheme } from '../lib/theme';
import TeamMarker from './TeamMarker';

interface Props {
  team: Team;
  cx: number;
  cy: number;
  size: number;
  marker: MarkerMode;
  theme: ResolvedTheme;
  onHover?: (team: Team | null) => void;
}

/** the viewer's favourite: a team-colour ring + name pill, marker redrawn on top */
export default function FavoriteHalo({ team, cx, cy, size, marker, theme, onHover }: Props) {
  const r = size / 2 + 4;
  const label = team.school;
  const w = label.length * 6.4 + 14;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={team.primary} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgb(var(--paper))" strokeWidth={1} />
      <g transform={`translate(${cx}, ${cy + r + 11})`}>
        <rect x={-w / 2} y={-9} width={w} height={16} rx={8} fill={team.primary} />
        <text x={0} y={2} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">
          {label}
        </text>
      </g>
      <g style={{ pointerEvents: 'auto' }}>
        <TeamMarker team={team} cx={cx} cy={cy} size={size} mode={marker} theme={theme} onHover={onHover} />
      </g>
    </g>
  );
}
