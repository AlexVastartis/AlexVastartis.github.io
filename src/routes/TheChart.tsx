import { useMemo } from 'react';
import { useChartContext } from '../App';
import ChartFrame from '../components/ChartFrame';
import BellCurve from '../components/BellCurve';
import RankedList from '../components/RankedList';
import CriterionView from '../components/CriterionView';
import { DEBATED } from '../config/ranking';

export default function TheChart() {
  const ctx = useChartContext();
  const { data, teams, allTeams, theme, marker } = ctx;

  const highlight = useMemo(
    () =>
      new Set(
        allTeams
          .filter((t) => t.overallRank <= 6 || DEBATED.includes(t.school))
          .map((t) => t.school),
      ),
    [allTeams],
  );

  return (
    <div className="flex flex-col gap-8">
      <CriterionView
        criterion="perception"
        ctx={ctx}
        title="The Chart"
        subtitle="Weeks in the AP Poll vs. weeks in the Top 10 — the original blue-blood argument."
      />

      <ChartFrame
        title="The Blue Blood Ranking"
        subtitle="All five criteria in one number: the z-score of a program’s average standing across Wins, Championships, All-Americans, NFL Draft, and Perception."
        filename="blue-blood-ranking.png"
        footer={
          <>
            {teams.length} of {allTeams.length} shown · the six true blue bloods sit alone in the right
            tail; Nebraska &amp; Texas are the next cluster, then a steep drop.
          </>
        }
      >
        <BellCurve
          teams={teams}
          value={(t) => t.overall}
          distribution={data.meta.overall}
          xLabel="Overall Blue Blood score (z-score)"
          marker={marker}
          theme={theme}
          highlight={highlight}
        />
      </ChartFrame>

      <section>
        <h2 className="mb-1 text-xl font-bold tracking-tight">The full ranking</h2>
        <p className="mb-4 text-sm text-muted">
          Every program ordered by overall score, grouped by where the numbers place them. The strip
          on each row is that team’s five criteria, faint to bold.
        </p>
        <RankedList teams={teams} />
      </section>
    </div>
  );
}
