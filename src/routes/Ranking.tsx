import { useMemo } from 'react';
import { useChartContext } from '../App';
import ChartFrame from '../components/ChartFrame';
import BellCurve from '../components/BellCurve';
import RankedList from '../components/RankedList';

export default function Ranking() {
  const { data, teams, allTeams, marker, favorite, setFavorite, view } = useChartContext();

  const highlight = useMemo(
    () =>
      new Set(
        allTeams
          .filter((t) => t.grouping === 'Blue Bloods' || t.grouping === 'Blue Blood Fringe')
          .map((t) => t.school),
      ),
    [allTeams],
  );

  return (
    <div className="flex flex-col gap-4">
      {view === 'curve' ? (
        <ChartFrame
          title="Blue Blood Rating — the distribution"
          subtitle="Every program on the normal curve by its rating (z-score). The six sit alone in the right tail; Texas & Nebraska are the next cluster."
          filename="blue-blood-rating-curve.png"
          footer={
            <>
              {teams.length === allTeams.length ? `all ${allTeams.length} programs` : `${teams.length} shown`} ·
              where logos overlap, the higher rating sits on top
            </>
          }
        >
          <BellCurve
            teams={teams}
            value={(t) => t.overall}
            distribution={data.meta.overall}
            xLabel="Blue Blood Rating (z-score)"
            marker={marker}
            highlight={highlight}
            favorite={favorite}
            onPick={setFavorite}
          />
        </ChartFrame>
      ) : (
        <RankedList teams={teams} favorite={favorite} onPick={(t) => setFavorite(t.school)} />
      )}

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
