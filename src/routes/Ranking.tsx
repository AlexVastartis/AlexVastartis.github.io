import { Link, useLocation } from 'react-router-dom';
import { useChartContext } from '../App';
import RankedList from '../components/RankedList';

export default function Ranking() {
  const { data, teams, favorite, setFavorite } = useChartContext();
  const { search } = useLocation();

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-black tracking-tight">The Blue Blood Ranking</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {data.meta.modelBlurb} A century of data — one season barely moves it. The{' '}
          <Link className="text-accent underline" to={{ pathname: '/criteria/perception', search }}>
            five criteria
          </Link>{' '}
          show the same programs from other angles.
        </p>
      </section>

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
