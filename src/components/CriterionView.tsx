import type { CategoryKey } from '../types';
import type { ChartContext } from '../App';
import { CATEGORIES, STATS } from '../config/stats';
import ChartFrame from './ChartFrame';
import ScatterChart from './ScatterChart';
import BellCurve from './BellCurve';
import LensToggle from './LensToggle';

interface Props {
  criterion: CategoryKey;
  ctx: ChartContext;
  title?: string;
  subtitle?: string;
}

/**
 * One criterion, shown as either the logo scatter or the bell curve of the same
 * data. The lens toggle lets people flip between the two tellings of the story.
 */
export default function CriterionView({ criterion, ctx, title, subtitle }: Props) {
  const { data, teams, allTeams, theme, marker, lens, setLens, favorite } = ctx;
  const cat = CATEGORIES[criterion];
  const [xk, yk] = cat.stats;

  return (
    <ChartFrame
      title={title ?? cat.label}
      subtitle={subtitle ?? cat.blurb}
      filename={`${criterion}-${lens}.png`}
      actions={<LensToggle value={lens} onChange={setLens} />}
      footer={
        lens === 'plot' ? (
          <>
            {teams.length} of {allTeams.length} shown · X: {STATS[xk].label} · Y: {STATS[yk].label} ·
            more impressive logos sit on top
          </>
        ) : (
          <>
            {teams.length} of {allTeams.length} shown · position = {cat.label} composite (mean of the
            two stats’ z-scores) · shaded bands are ±1σ / ±2σ
          </>
        )
      }
    >
      {lens === 'plot' ? (
        <ScatterChart
          teams={teams}
          allTeams={allTeams}
          xStat={xk}
          yStat={yk}
          meta={data.meta}
          marker={marker}
          theme={theme}
          favorite={favorite}
          order={(t) => t.composite[criterion]}
        />
      ) : (
        <BellCurve
          teams={teams}
          value={(t) => t.composite[criterion]}
          distribution={data.meta.composites[criterion]}
          xLabel={`${cat.label} — composite (z-score)`}
          marker={marker}
          theme={theme}
          favorite={favorite}
        />
      )}
    </ChartFrame>
  );
}
