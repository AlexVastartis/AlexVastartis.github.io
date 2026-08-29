import { useMemo } from 'react';
import {
  NavLink, Route, Routes, Navigate, useLocation, useOutletContext, useParams, Outlet, Link,
} from 'react-router-dom';
import { useTeams, useConferences } from './data/useTeams';
import { useViewState, type Lens, type RankView } from './data/useViewState';
import { useTheme, type ThemeMode } from './lib/theme';
import { useFavorite } from './data/useFavorite';
import Controls from './components/Controls';
import TeamCard from './components/TeamCard';
import type { Team, TeamsPayload } from './types';
import { CRITERIA_LABEL } from './config/stats';
import Ranking from './routes/Ranking';
import TheChartStandalone from './routes/TheChartStandalone';
import CriteriaChart from './routes/CriteriaChart';
import Notes from './routes/Notes';

export interface ChartContext {
  data: TeamsPayload;
  teams: Team[];
  allTeams: Team[];
  marker: 'logo' | 'bubble';
  lens: Lens;
  setLens: (l: Lens) => void;
  rankView: RankView;
  setRankView: (v: RankView) => void;
  favorite: string | null;
  setFavorite: (school: string | null) => void;
}

export function useChartContext() {
  return useOutletContext<ChartContext>();
}

function Layout() {
  const { state, update, toggleConference } = useViewState();
  const { loading, error, data } = useTeams(state.wins);
  const { mode, setMode } = useTheme();
  const [favorite, setFavorite] = useFavorite();
  const conferences = useConferences(data);
  const { search } = useLocation();

  const NAV = [
    { to: { pathname: '/', search }, label: 'Ranking', end: true },
    { to: { pathname: '/criteria/perception', search }, label: CRITERIA_LABEL, end: false },
    { to: { pathname: '/notes', search }, label: 'Notes', end: false },
  ];

  const teams = useMemo(() => {
    if (!data) return [];
    if (state.conferences.length === 0) return data.teams;
    const set = new Set(state.conferences);
    return data.teams.filter((t) => set.has(t.conference));
  }, [data, state.conferences]);

  const favTeam = data && favorite ? data.teams.find((t) => t.school === favorite) ?? null : null;

  return (
    <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-4 px-4 py-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <Link to={{ pathname: '/', search }} className="group">
          <h1 className="text-2xl font-black tracking-tight">
            BlueBlood<span className="text-accent">Football</span>
          </h1>
          <p className="text-sm text-muted">A century-long ledger of college football prestige.</p>
        </Link>
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
            themeMode={mode}
            onSetThemeMode={(m: ThemeMode) => setMode(m)}
            schools={data.teams.map((t) => t.school).sort()}
            favorite={favorite}
            onSetFavorite={setFavorite}
            wins={state.wins}
            onSetWins={(w) => update({ wins: w })}
          />
          <div
            className={
              favTeam
                ? 'xl:grid xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-6'
                : ''
            }
          >
            {favTeam && (
              <aside className="mb-4 xl:col-start-2 xl:row-start-1 xl:mb-0 xl:sticky xl:top-4 xl:self-start xl:max-h-[calc(100vh-2rem)] xl:overflow-auto">
                <TeamCard team={favTeam} onClear={() => setFavorite(null)} />
              </aside>
            )}
            <div className="min-w-0 xl:col-start-1 xl:row-start-1">
              <Outlet
                context={
                  {
                    data,
                    teams,
                    allTeams: data.teams,
                    marker: state.marker,
                    lens: state.lens,
                    setLens: (l: Lens) => update({ lens: l }),
                    rankView: state.rankView,
                    setRankView: (v: RankView) => update({ rankView: v }),
                    favorite,
                    setFavorite,
                  } satisfies ChartContext
                }
              />
            </div>
          </div>
          <footer className="mt-2 text-xs text-muted">
            Data generated {new Date(data.meta.generatedAt).toLocaleDateString()} ·{' '}
            AP poll &amp; records via CollegeFootballData · titles &amp; All-Americans hand-maintained ·
            conferences: {data.meta.conferenceYear ?? '—'} alignment · logos are each school’s
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
      {/* standalone, no site chrome — the shareable hook */}
      <Route path="the-chart" element={<TheChartStandalone />} />
      <Route element={<Layout />}>
        <Route index element={<Ranking />} />
        <Route path="criteria/:key" element={<CriteriaChart />} />
        <Route path="notes" element={<Notes />} />
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
