import { useMemo } from 'react';
import { NavLink, Route, Routes, Navigate, useOutletContext, Outlet } from 'react-router-dom';
import { useTeams, useConferences } from './data/useTeams';
import { useViewState } from './data/useViewState';
import { useTheme, type Theme } from './lib/theme';
import Controls from './components/Controls';
import type { Team, TeamsPayload } from './types';
import TheChart from './routes/TheChart';
import CategoryChart from './routes/CategoryChart';
import BellCurves from './routes/BellCurves';

export interface ChartContext {
  data: TeamsPayload;
  teams: Team[];
  allTeams: Team[];
  theme: Theme;
  marker: 'logo' | 'bubble';
}

export function useChartContext() {
  return useOutletContext<ChartContext>();
}

const NAV = [
  { to: '/', label: 'The Chart', end: true },
  { to: '/category/wins', label: 'Categories', end: false },
  { to: '/bell-curves', label: 'Bell Curves', end: false },
];

function Layout() {
  const { loading, error, data } = useTeams();
  const { state, update, toggleConference } = useViewState();
  const [theme, toggleTheme] = useTheme();
  const conferences = useConferences(data);

  const teams = useMemo(() => {
    if (!data) return [];
    if (state.conferences.length === 0) return data.teams;
    const set = new Set(state.conferences);
    return data.teams.filter((t) => set.has(t.conference));
  }, [data, state.conferences]);

  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-4 px-4 py-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            BlueBlood<span className="text-accent">Football</span>
          </h1>
          <p className="text-sm text-muted">Where programs actually rank — plotted from the data.</p>
        </div>
        <nav className="flex gap-1 rounded-lg border border-line bg-panel/40 p-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-accent text-white' : 'hover:bg-panel'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {loading && <Placeholder>Loading data…</Placeholder>}
      {error && (
        <Placeholder>
          Couldn’t load <code>data/teams.json</code>. Run <code>npm run build:data</code>.
          <div className="mt-1 text-xs opacity-70">{error}</div>
        </Placeholder>
      )}

      {data && (
        <>
          <Controls
            conferences={conferences}
            state={state}
            onToggleConference={toggleConference}
            onClearConferences={() => update({ conferences: [] })}
            onSetMarker={(m) => update({ marker: m })}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
          {teams.length === 0 ? (
            <Placeholder>No teams match this conference filter.</Placeholder>
          ) : (
            <Outlet
              context={
                { data, teams, allTeams: data.teams, theme, marker: state.marker } satisfies ChartContext
              }
            />
          )}
          <footer className="mt-2 text-xs text-muted">
            Data generated {new Date(data.meta.generatedAt).toLocaleDateString()} · {data.meta.dataRange} ·
            sources: {data.meta.sources.cfbd ? 'CFBD + ' : ''}manual sheets · logos are each school’s
            trademarks, used for identification.
          </footer>
        </>
      )}
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-panel/30 p-8 text-center text-sm text-muted">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TheChart />} />
        <Route path="category/:key" element={<CategoryChart />} />
        <Route path="bell-curves" element={<BellCurves />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
