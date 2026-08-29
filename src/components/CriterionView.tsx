import type { CategoryKey } from '../types';
import type { ChartContext } from '../App';
import { CATEGORIES } from '../config/stats';
import ChartFrame from './ChartFrame';
import ScatterChart from './ScatterChart';
import BellCurve from './BellCurve';
import CriterionList from './CriterionList';
import MarkerToggle from './MarkerToggle';

interface Props {
  criterion: CategoryKey;
  ctx: ChartContext;
}

/** one criterion as the logo scatter, its bell curve, or a plain ranked list —
 *  which one is chosen by the shared view toggle in the layout */
export default function CriterionView({ criterion, ctx }: Props) {
  const { data, teams, allTeams, marker, setMarker, favorite, setFavorite, view } = ctx;
  const cat = CATEGORIES[criterion];
  const [xk, yk] = cat.stats;
  const scope =
    teams.length === allTeams.length
      ? `all ${allTeams.length} FBS programs`
      : `${teams.length} of ${allTeams.length} programs (filtered)`;

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{cat.label}</h2>
          <p className="text-sm text-muted">{cat.blurb}</p>
        </div>
        <CriterionList criterion={criterion} teams={teams} favorite={favorite} onPick={setFavorite} />
        <p className="text-xs text-muted">
          {scope} · ranked by criterion percentile (mean of the two stats’ FBS percentiles) ·{' '}
          <span className="italic">{data.meta.provenance[criterion]}</span>
        </p>
      </div>
    );
  }

  return (
    <ChartFrame
      title={cat.label}
      subtitle={cat.blurb}
      filename={`${criterion}-${view}.png`}
      actions={<MarkerToggle marker={marker} onSet={setMarker} />}
      footer={
        <>
          {scope}
          {view === 'plot'
            ? ` · where logos overlap, the higher ${cat.label} sits on top · axes scale to the teams shown`
            : ' · position = the criterion score (mean of the two stats’ FBS percentiles) · bands are ±1σ / ±2σ'}
          {' · '}
          <span className="italic">{data.meta.provenance[criterion]}</span>
        </>
      }
    >
      {view === 'plot' ? (
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
          criterion={criterion}
        />
      )}
    </ChartFrame>
  );
}
