import { useChartContext } from '../App';
import ChartFrame from '../components/ChartFrame';
import ScatterChart from '../components/ScatterChart';
import { CATEGORIES } from '../config/stats';

export default function TheChart() {
  const { data, teams, allTeams, theme, marker } = useChartContext();
  const cat = CATEGORIES.perception;

  return (
    <ChartFrame
      title="The Chart"
      subtitle={`${cat.blurb}  Weeks in the AP Poll vs. weeks in the Top 10.`}
      filename="the-chart.png"
      footer={
        <>
          {teams.length} of {allTeams.length} programs shown · X: {cat.stats[0]} · Y: {cat.stats[1]} ·{' '}
          {data.meta.dataRange}
        </>
      }
    >
      <ScatterChart
        teams={teams}
        allTeams={allTeams}
        xStat={cat.stats[0]}
        yStat={cat.stats[1]}
        meta={data.meta}
        marker={marker}
        theme={theme}
      />
    </ChartFrame>
  );
}
