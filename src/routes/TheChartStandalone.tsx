import { useTeams } from '../data/useTeams';
import ScatterChart from '../components/ScatterChart';
import { CATEGORIES } from '../config/stats';

/**
 * "The Chart" — the shareable hook. Bare: no nav, no controls, no filters.
 * Weeks in the AP poll against weeks in the AP top ten, every FBS program.
 * Reachable only by direct link (/the-chart).
 */
export default function TheChartStandalone() {
  const { loading, error, data } = useTeams('asPlayed');
  const [xk, yk] = CATEGORIES.perception.stats;

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-3 px-4 py-8">
      <h1 className="text-xl font-black tracking-tight">
        The Chart<span className="ml-2 align-middle text-sm font-normal text-muted">· college football’s AP-poll pedigree</span>
      </h1>
      {loading && <p className="text-sm text-muted">Loading…</p>}
      {error && <p className="text-sm text-muted">Couldn’t load the data.</p>}
      {data && (
        <ScatterChart
          teams={data.teams}
          xStat={xk}
          yStat={yk}
          marker="logo"
          order={(t) => t.critScore.perception}
        />
      )}
      <p className="text-xs text-muted">
        X: weeks ranked in the AP poll · Y: weeks in the AP top ten · every ballot since 1936 ·{' '}
        <a className="text-accent underline" href="#/">the full Blue Blood Ranking →</a>
      </p>
    </div>
  );
}
