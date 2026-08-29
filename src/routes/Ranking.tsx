import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useChartContext } from '../App';
import ChartFrame from '../components/ChartFrame';
import BellCurve from '../components/BellCurve';
import RankedList from '../components/RankedList';
import TeamCard from '../components/TeamCard';
import LensToggle from '../components/LensToggle';
import { DEBATED } from '../config/ranking';
import type { RankView } from '../data/useViewState';

const OPTS: { value: RankView; label: string }[] = [
  { value: 'list', label: 'Ranked list' },
  { value: 'curve', label: 'Bell curve' },
];

export default function Ranking() {
  const { data, teams, allTeams, marker, favorite, setFavorite, rankView, setRankView } = useChartContext();
  const { search } = useLocation();

  const highlight = useMemo(
    () => new Set(allTeams.filter((t) => t.ratingRank <= 6 || DEBATED.includes(t.school)).map((t) => t.school)),
    [allTeams],
  );
  const favTeam = favorite ? allTeams.find((t) => t.school === favorite) : null;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight">The Blue Blood Ranking</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              {data.meta.modelBlurb} A century of data — one season barely moves it.{' '}
              <Link className="text-accent underline" to={{ pathname: '/the-chart', search }}>
                The Chart
              </Link>{' '}
              and the five{' '}
              <Link className="text-accent underline" to={{ pathname: '/criteria/perception', search }}>
                criteria
              </Link>{' '}
              show the same programs from other angles.
            </p>
          </div>
          <LensToggle value={rankView} onChange={setRankView} options={OPTS} />
        </div>
      </section>

      {favTeam && <TeamCard team={favTeam} allTeams={allTeams} />}

      {rankView === 'list' ? (
        <RankedList teams={teams} favorite={favorite} onPick={(t) => setFavorite(t.school)} />
      ) : (
        <ChartFrame
          title="Rating distribution"
          subtitle="Every program placed on the normal curve by its Blue Blood Rating (z-score). The six sit alone in the right tail; Nebraska & Texas are the next cluster."
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
      )}

      <p className="text-xs leading-relaxed text-muted">
        <strong>How it’s built.</strong> {data.meta.modelBlurb} Wins and AP-poll weeks come from
        CollegeFootballData (1936–{data.meta.latestSeason}); national &amp; conference titles and
        All-America selections are hand-maintained and not adjudicated for “claimed vs. consensus”.
        The trajectory arrow compares a program’s last {data.meta.trendRecentYears} seasons with its
        entire prior history across AP standing, win rate, titles and draft output.
      </p>
    </div>
  );
}
