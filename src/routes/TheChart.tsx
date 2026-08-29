import { useMemo } from 'react';
import { useChartContext } from '../App';
import ChartFrame from '../components/ChartFrame';
import BellCurve from '../components/BellCurve';
import RankedList from '../components/RankedList';
import CriterionView from '../components/CriterionView';
import TeamCard from '../components/TeamCard';
import { DEBATED } from '../config/ranking';

export default function TheChart() {
  const ctx = useChartContext();
  const { data, teams, allTeams, theme, marker, favorite } = ctx;

  const highlight = useMemo(
    () =>
      new Set(
        allTeams
          .filter((t) => t.ratingRank <= 6 || DEBATED.includes(t.school))
          .map((t) => t.school),
      ),
    [allTeams],
  );
  const favTeam = favorite ? allTeams.find((t) => t.school === favorite) : null;

  return (
    <div className="flex flex-col gap-8">
      <CriterionView
        criterion="perception"
        ctx={ctx}
        title="The Chart"
        subtitle="Weeks in the AP Poll vs. weeks in the Top 10, 1936 to today — the original blue-blood argument."
      />

      <ChartFrame
        title="The Blue Blood Rating"
        subtitle="All five criteria in one number: rank each stat within FBS, average the two per criterion, then take the trimmed mean of the five — each program’s best and worst criterion dropped. Nonparametric, no weighting knobs, unbothered by disputed title counts."
        filename="blue-blood-rating.png"
        footer={
          <>
            {teams.length} of {allTeams.length} shown · the six sit alone in the right tail; Nebraska
            &amp; Texas are the next cluster, then a steep drop. Career data — one season barely moves it.
          </>
        }
      >
        <BellCurve
          teams={teams}
          value={(t) => t.overall}
          distribution={data.meta.overall}
          xLabel="Blue Blood Rating (z-score)"
          marker={marker}
          theme={theme}
          highlight={highlight}
          favorite={favorite}
        />
      </ChartFrame>

      {favTeam && <TeamCard team={favTeam} allTeams={allTeams} />}

      <section>
        <h2 className="mb-1 text-xl font-bold tracking-tight">The full ranking</h2>
        <p className="mb-4 text-sm text-muted">
          Every program ordered by rating and grouped by where a century of data places it — not by
          who is hot this year. The strip on each row is the five criteria, faint to bold; the arrow
          is the program’s trajectory within the poll era.
        </p>
        <RankedList teams={teams} favorite={favorite} />
      </section>
    </div>
  );
}
