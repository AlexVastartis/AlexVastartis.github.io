import { Link, useLocation } from 'react-router-dom';
import { useChartContext } from '../App';
import CriterionView from '../components/CriterionView';

/**
 * "The Chart" — the shareable one. A dedicated page: the AP-poll scatter and
 * nothing competing for attention, plus a single quiet door to the rest of the site.
 */
export default function TheChartPage() {
  const ctx = useChartContext();
  const { search } = useLocation();

  return (
    <div className="flex flex-col gap-4">
      <CriterionView
        criterion="perception"
        ctx={ctx}
        title="The Chart"
        subtitle={`Weeks in the AP Poll against weeks in the AP Top 10, every ballot since 1936. Every FBS program, one dot.`}
      />
      <p className="text-center text-sm text-muted">
        This is one of five criteria.{' '}
        <Link className="text-accent underline" to={{ pathname: '/', search }}>
          See the full Blue Blood Ranking
        </Link>{' '}
        or{' '}
        <Link className="text-accent underline" to={{ pathname: '/criteria/wins', search }}>
          break it down by wins, titles, All-Americans and the draft
        </Link>
        .
      </p>
    </div>
  );
}
