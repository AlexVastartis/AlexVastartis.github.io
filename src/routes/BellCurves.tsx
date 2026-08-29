import { useChartContext } from '../App';
import ChartFrame from '../components/ChartFrame';
import BellCurve from '../components/BellCurve';
import { CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import { TIERS } from '../config/tiers';

export default function BellCurves() {
  const { data, teams, allTeams, theme, marker } = useChartContext();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-line bg-panel/40 p-4 text-sm text-muted">
        Each curve standardizes a category into a composite z-score (mean of its two stats) across all{' '}
        {allTeams.length} programs, then stacks logos where they land. Shaded bands are ±1σ / ±2σ.
        <div className="mt-2 flex flex-wrap gap-2">
          {TIERS.filter((t) => Number.isFinite(t.minZ)).map((t) => (
            <span key={t.key} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: t.color }} />
              {t.label} (≥ {t.minZ}σ)
            </span>
          ))}
        </div>
      </div>

      {CATEGORY_ORDER.map((ck) => (
        <ChartFrame
          key={ck}
          title={`${CATEGORIES[ck].label} — distribution`}
          subtitle={CATEGORIES[ck].blurb}
          filename={`${ck}-bell-curve.png`}
          footer={
            <>
              composite mean {data.meta.composites[ck].mean.toFixed(2)} · σ{' '}
              {data.meta.composites[ck].stddev.toFixed(2)} ·{' '}
              {teams.length === allTeams.length
                ? 'all programs'
                : `${teams.length} highlighted, rest dimmed`}
            </>
          }
        >
          <BellCurve
            category={ck}
            teams={teams}
            allTeams={allTeams}
            meta={data.meta}
            marker={marker}
            theme={theme}
          />
        </ChartFrame>
      ))}
    </div>
  );
}
