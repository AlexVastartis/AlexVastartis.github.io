import { useTeams } from '../data/useTeams';
import ScatterChart from '../components/ScatterChart';
import { CATEGORIES } from '../config/stats';

/**
 * "The Chart" — the shareable hook. Bare: no nav, no controls, no filters, and
 * sized to fill a standard desktop viewport above the fold. Reachable only by
 * direct link (/the-chart).
 */
export default function TheChartStandalone() {
  const { loading, error, data } = useTeams();
  const [xk, yk] = CATEGORIES.perception.stats;

  return (
    <div className="flex h-screen flex-col gap-2 px-4 py-3">
      <h1 className="shrink-0 text-lg font-black tracking-tight">
        The Chart
        <span className="ml-2 align-middle text-sm font-normal text-muted">
          · college football’s AP-poll pedigree
        </span>
      </h1>
      {loading && <p className="text-sm text-muted">Loading…</p>}
      {error && <p className="text-sm text-muted">Couldn’t load the data.</p>}
      {data && (
        <div className="min-h-0 flex-1">
          <ScatterChart
            teams={data.teams}
            xStat={xk}
            yStat={yk}
            marker="logo"
            markerSize={30}
            order={(t) => t.critScore.perception}
            className="h-full w-full select-none"
          />
        </div>
      )}
      <p className="shrink-0 text-xs text-muted">
        X: weeks ranked in the AP poll · Y: weeks in the AP top ten · every ballot since 1936 ·{' '}
        <a className="text-accent underline" href="#/">the full Blue Blood Ranking →</a>
      </p>
    </div>
  );
}
