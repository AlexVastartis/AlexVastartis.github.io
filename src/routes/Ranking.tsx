import { useChartContext } from '../App';
import RankedList from '../components/RankedList';

export default function Ranking() {
  const { data, teams, favorite, setFavorite } = useChartContext();

  return (
    <div className="flex flex-col gap-4">
      <RankedList teams={teams} favorite={favorite} onPick={(t) => setFavorite(t.school)} />

      <p className="text-xs leading-relaxed text-muted">
        <strong>How it’s built.</strong> {data.meta.modelBlurb} AP-poll weeks and NFL-draft picks
        come from CollegeFootballData (1936–{data.meta.latestSeason}); wins/losses are per-season,
        CollegeFootballData from 1936 and one hand-entered “through 1935” row per program before
        that — set so each program’s all-time total matches its Wikipedia figure (a tie counts as
        half a win). National titles, All-America selections and Heismans are hand-maintained; a
        national title counts only when a major selector (AP, UPI, FWAA, NFF, USA; CFRA/HAF/NCF
        pre-1936) picked the team. The trajectory arrow compares a program’s most recent{' '}
        {Math.round(data.meta.trendRecentFraction * 100)}% of seasons with its whole prior history,
        across all ten rating stats.
      </p>
    </div>
  );
}
