import type { CategoryKey } from '../types';
import type { ChartContext } from '../App';
import { CATEGORIES } from '../config/stats';
import ChartFrame from './ChartFrame';
import ScatterChart from './ScatterChart';
import BellCurve from './BellCurve';
import CriterionList from './CriterionList';
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
  { value: 'list', label: 'Ranked list' },
];

/**
 * One criterion, shown as the logo scatter, the bell curve of the same data, or
 * a plain ranked list. Three angles on one story.
 */
export default function CriterionView({ criterion, ctx, title, subtitle, lockLens }: Props) {
  const { data, teams, allTeams, marker, favorite, setFavorite } = ctx;
  const lens = lockLens ?? ctx.lens;
  const cat = CATEGORIES[criterion];
  const [xk, yk] = cat.stats;

  if (lens === 'list') {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight">{title ?? cat.label}</h2>
            <p className="text-sm text-muted">{subtitle ?? cat.blurb}</p>
          </div>
          {!lockLens && <LensToggle value={ctx.lens} onChange={ctx.setLens} options={LENS_OPTS} />}
        </div>
        <CriterionList
          criterion={criterion}
          teams={teams}
          favorite={favorite}
          onPick={setFavorite}
        />
        <p className="text-xs text-muted">
          {teams.length === allTeams.length
            ? `all ${allTeams.length} FBS programs`
            : `${teams.length} of ${allTeams.length} programs (filtered)`}{' '}
          · ranked by criterion percentile (mean of the two stats’ FBS percentiles) ·{' '}
          <span className="italic">{data.meta.provenance[criterion]}</span>
        </p>
      </div>
    );
  }

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
          criterion={criterion}
        />
      )}
    </ChartFrame>
  );
}
