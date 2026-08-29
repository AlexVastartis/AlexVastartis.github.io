import { Navigate, NavLink, useParams } from 'react-router-dom';
import { useChartContext } from '../App';
import ChartFrame from '../components/ChartFrame';
import ScatterChart from '../components/ScatterChart';
import { ACTIVE_CATEGORIES, CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import type { CategoryKey } from '../types';

export default function CategoryChart() {
  const { key } = useParams<{ key: string }>();
  const { data, teams, allTeams, theme, marker } = useChartContext();

  if (!key || !(key in CATEGORIES)) return <Navigate to="/category/wins" replace />;
  const ck = key as CategoryKey;
  const cat = CATEGORIES[ck];
  const active = ACTIVE_CATEGORIES.includes(ck);

  return (
    <div className="flex flex-col gap-3">
      <nav className="flex flex-wrap gap-1.5">
        {CATEGORY_ORDER.map((c) => {
          const enabled = ACTIVE_CATEGORIES.includes(c);
          return (
            <NavLink
              key={c}
              to={`/category/${c}`}
              className={({ isActive }) =>
                `rounded-full px-3 py-1 text-xs font-medium ring-1 ring-line ${
                  isActive ? 'bg-accent text-white' : enabled ? 'hover:bg-panel' : 'opacity-40'
                }`
              }
            >
              {CATEGORIES[c].label}
              {!enabled && ' · soon'}
            </NavLink>
          );
        })}
      </nav>

      {active ? (
        <ChartFrame
          title={cat.label}
          subtitle={cat.blurb}
          filename={`${ck}-chart.png`}
          footer={
            <>
              {teams.length} of {allTeams.length} programs · X: {cat.stats[0]} · Y: {cat.stats[1]}
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
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-panel/30 p-8 text-center text-sm text-muted">
          <strong>{cat.label}</strong> comes online in the next slice. The composite for this category
          is already on the <NavLink className="text-accent underline" to="/bell-curves">Bell Curves</NavLink> page.
        </div>
      )}
    </div>
  );
}
