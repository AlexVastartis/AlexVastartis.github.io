import { useMemo } from 'react';
import { NavLink, Route, Routes, Navigate, useLocation, useOutletContext, useParams, Outlet } from 'react-router-dom';
import { useTeams, useConferences } from './data/useTeams';
import { useViewState, type Lens } from './data/useViewState';
import { useTheme, type Theme } from './lib/theme';
import Controls from './components/Controls';
import type { Team, TeamsPayload } from './types';
import { CRITERIA_LABEL } from './config/stats';
import TheChart from './routes/TheChart';
import CriteriaChart from './routes/CriteriaChart';

export interface ChartContext {
  data: TeamsPayload;
  teams: Team[];
  allTeams: Team[];
  theme: Theme;
  marker: 'logo' | 'bubble';
  lens: Lens;
  setLens: (l: Lens) => void;
}

export function useChartContext() {
  return useOutletContext<ChartContext>();
}

function Layout() {
  const { loading, error, data } = useTeams();
  const { state, update, toggleConference } = useViewState();
  const [theme, toggleTheme] = useTheme();
  const conferences = useConferences(data);
  const { search } = useLocation();

  // carry conference / marker / lens across the top-level nav
  const NAV = [
    { to: { pathname: '/', search }, label: 'The Chart', end: true },
    { to: { pathname: '/criteria/perception', search }, label: CRITERIA_LABEL, end: false },
  ];

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
              key={n.label}
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
                {
                  data,
                  teams,
                  allTeams: data.teams,
                  theme,
                  marker: state.marker,
                  lens: state.lens,
                  setLens: (l: Lens) => update({ lens: l }),
                } satisfies ChartContext
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
        <Route path="criteria/:key" element={<CriteriaChart />} />
        {/* legacy paths */}
        <Route path="category/:key" element={<LegacyCategory />} />
        <Route path="bell-curves" element={<Navigate to="/criteria/perception?lens=curve" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function LegacyCategory() {
  const { key } = useParams<{ key: string }>();
  return <Navigate to={`/criteria/${key ?? 'perception'}`} replace />;
}
