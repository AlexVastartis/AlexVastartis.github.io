import type { Team } from '../types';
import type { MarkerMode } from '../data/useViewState';
import TeamMarker from './TeamMarker';

interface Props {
  team: Team;
  cx: number;
  cy: number;
  size: number;
  marker: MarkerMode;
  onHover?: (team: Team | null) => void;
  onPick?: (school: string) => void;
}

/**
 * The viewer's favourite: a single, slightly enlarged marker with a team-colour
 * ring and a name pill. The caller must NOT also draw this team in its main
 * marker loop — this is the only copy.
 */
export default function FavoriteHalo({ team, cx, cy, size, marker, onHover, onPick }: Props) {
  const r = size / 2 + 4;
  const w = team.school.length * 6.4 + 14;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={team.primary} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgb(var(--paper))" strokeWidth={1} />
      <g transform={`translate(${cx}, ${cy + r + 11})`} style={{ pointerEvents: 'none' }}>
        <rect x={-w / 2} y={-9} width={w} height={16} rx={8} fill={team.primary} />
        <text x={0} y={2} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">
          {team.school}
        </text>
      </g>
      <TeamMarker team={team} cx={cx} cy={cy} size={size} mode={marker} onHover={onHover} onPick={onPick} />
    </g>
  );
}
