import type { CategoryKey } from '../types';
import type { ChartContext } from '../App';
import { CATEGORIES } from '../config/stats';
import ChartFrame from './ChartFrame';
import ScatterChart from './ScatterChart';
import BellCurve from './BellCurve';
import LensToggle from './LensToggle';
import type { Lens } from '../data/useViewState';

interface Props {
  criterion: CategoryKey;
  ctx: ChartContext;
  title?: string;
  subtitle?: string;
  /** hide the plot/curve toggle (dedicated pages that only want the plot) */
  lockLens?: Lens;
}

const LENS_OPTS: { value: Lens; label: string }[] = [
  { value: 'plot', label: 'Logo plot' },
  { value: 'curve', label: 'Bell curve' },
];

/**
 * One criterion, shown as either the logo scatter or the bell curve of the same
 * data. Two angles on one story.
 */
export default function CriterionView({ criterion, ctx, title, subtitle, lockLens }: Props) {
  const { data, teams, allTeams, marker, favorite, setFavorite } = ctx;
  const lens = lockLens ?? ctx.lens;
  const cat = CATEGORIES[criterion];
  const [xk, yk] = cat.stats;

  return (
    <ChartFrame
      title={title ?? cat.label}
      subtitle={subtitle ?? cat.blurb}
      filename={`${criterion}-${lens}.png`}
      actions={lockLens ? undefined : <LensToggle value={ctx.lens} onChange={ctx.setLens} options={LENS_OPTS} />}
      footer={
        <>
          {teams.length === allTeams.length
            ? `all ${allTeams.length} FBS programs`
            : `${teams.length} of ${allTeams.length} programs (filtered)`}
          {lens === 'plot'
            ? ` · where logos overlap, the higher ${cat.label} sits on top · axes scale to the teams shown`
            : ' · position = the criterion score (mean of the two stats’ FBS percentiles) · bands are ±1σ / ±2σ'}
          {' · '}
          <span className="italic">{data.meta.provenance[criterion]}</span>
        </>
      }
    >
      {lens === 'plot' ? (
        <ScatterChart
          teams={teams}
          xStat={xk}
          yStat={yk}
          marker={marker}
          favorite={favorite}
          onPick={setFavorite}
          order={(t) => t.critScore[criterion]}
        />
      ) : (
        <BellCurve
          teams={teams}
          value={(t) => t.composite[criterion]}
          distribution={data.meta.composites[criterion]}
          xLabel={`${cat.label} — criterion score (z)`}
          marker={marker}
          favorite={favorite}
          onPick={setFavorite}
        />
      )}
    </ChartFrame>
  );
}
