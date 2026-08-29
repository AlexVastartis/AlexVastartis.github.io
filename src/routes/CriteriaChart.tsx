import { Navigate, NavLink, useLocation, useParams } from 'react-router-dom';
import { useChartContext } from '../App';
import CriterionView from '../components/CriterionView';
import TeamCard from '../components/TeamCard';
import { CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import type { CategoryKey } from '../types';

export default function CriteriaChart() {
  const { key } = useParams<{ key: string }>();
  const { search } = useLocation();
  const ctx = useChartContext();

  if (!key || !(key in CATEGORIES)) return <Navigate to="/criteria/perception" replace />;
  const ck = key as CategoryKey;
  const favTeam = ctx.favorite ? ctx.allTeams.find((t) => t.school === ctx.favorite) : null;

  return (
    <div className="flex flex-col gap-3">
      <nav className="flex flex-wrap gap-1.5">
        {CATEGORY_ORDER.map((c) => (
          <NavLink
            key={c}
            to={{ pathname: `/criteria/${c}`, search }}
            className={({ isActive }) =>
              `rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-line ${
                isActive ? 'bg-accent text-white' : 'hover:bg-panel'
              }`
            }
          >
            {CATEGORIES[c].label}
          </NavLink>
        ))}
      </nav>

      <p className="px-1 text-sm text-muted">
        Pick the criterion that tells your team’s story, then flip between the logo plot and its bell
        curve — same data, two angles.
      </p>

      <CriterionView criterion={ck} ctx={ctx} />

      {favTeam && <TeamCard team={favTeam} />}
    </div>
  );
}
