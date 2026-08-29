import { useEffect, useMemo, useRef } from 'react';
import {
  Route, Routes, Navigate, useLocation, useOutletContext, useParams, Outlet, Link,
} from 'react-router-dom';
import { useTeams, useConferences } from './data/useTeams';
import { useViewState, type ViewMode } from './data/useViewState';
import { useTheme } from './lib/theme';
import { useFavorite } from './data/useFavorite';
import Controls from './components/Controls';
import TeamCard from './components/TeamCard';
import ThemeToggle from './components/ThemeToggle';
import ViewTabs, { type Subject } from './components/ViewTabs';
import type { CategoryKey, Team, TeamsPayload } from './types';
import { CATEGORIES } from './config/stats';
import Ranking from './routes/Ranking';
import TheChartStandalone from './routes/TheChartStandalone';
import CriteriaChart from './routes/CriteriaChart';

export interface ChartContext {
  data: TeamsPayload;
  teams: Team[];
  allTeams: Team[];
  marker: 'logo' | 'bubble';
  setMarker: (m: 'logo' | 'bubble') => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  favorite: string | null;
  setFavorite: (school: string | null) => void;
  /** show the hand-drawn margin notes on the Blue Blood Rating list */
  showNotes: boolean;
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
  const { search, pathname } = useLocation();

  const teams = useMemo(() => {
    if (!data) return [];
    if (state.conferences.length === 0) return data.teams;
    const set = new Set(state.conferences);
    return data.teams.filter((t) => set.has(t.conference));
  }, [data, state.conferences]);

  const criteriaKey = pathname.match(/^\/criteria\/([A-Za-z]+)/)?.[1];
  const subject: Subject = criteriaKey && criteriaKey in CATEGORIES ? (criteriaKey as CategoryKey) : 'rating';
  const view: ViewMode = subject === 'rating' ? 'list' : state.view;

  // the Blue Blood Rating page always keeps a team highlighted — default to #1 whenever it's
  // empty there; elsewhere, only default it once (so people see the feature exists)
  const didInit = useRef(false);
  useEffect(() => {
    if (!data) return;
    const firstRun = !didInit.current;
    didInit.current = true;
    if (favorite) return;
    // default to #1 on first load anywhere, and any time the rating page has no team
    if (firstRun || subject === 'rating') {
      setFavorite(data.teams.find((t) => t.ratingRank === 1)?.school ?? null);
    }
  }, [data, favorite, subject, setFavorite]);

  const favTeam = data && favorite ? data.teams.find((t) => t.school === favorite) ?? null : null;
  const jumpToFavorite = () => {
    if (!favorite) return;
    document
      .querySelector<HTMLElement>(`[data-school="${CSS.escape(favorite)}"]`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
  // a chart view (anything but the ranked list) gets the compact panel on top so the chart stays
  // near the fold; the ranked list gets the full panel as a wide side rail
  const panelMode: 'top' | 'side' | 'none' = favTeam ? (view === 'list' ? 'side' : 'top') : 'none';

  return (
    <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-4 px-4 py-6">
      <header className="flex items-start justify-between gap-3">
        <Link to={{ pathname: '/', search }} className="group">
          <h1 className="text-2xl font-black tracking-tight">
            BlueBlood<span className="text-accent">Football</span>
          </h1>
          <p className="text-sm text-muted">A century-long ledger of college football prestige.</p>
        </Link>
        <ThemeToggle mode={mode} onSetMode={setMode} />
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
            schools={data.teams.map((t) => t.school).sort()}
            favorite={favorite}
            onSetFavorite={setFavorite}
            canClearFavorite={subject !== 'rating'}
            wins={state.wins}
            onSetWins={(w) => update({ wins: w })}
          />

          <ViewTabs
            subject={subject}
            view={view}
            onSetView={(v) => update({ view: v })}
            search={search}
            notesOn={state.notes}
            onToggleNotes={() => update({ notes: !state.notes })}
          />

          <div className={panelMode === 'side' ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-6' : ''}>
            {panelMode === 'top' && favTeam && (
              <aside className="mb-3">
                <TeamCard team={favTeam} variant="compact" onClear={() => setFavorite(null)} onJump={jumpToFavorite} />
              </aside>
            )}
            {panelMode === 'side' && favTeam && (
              <aside className="mb-4 lg:col-start-2 lg:row-start-1 lg:mb-0 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
                <TeamCard
                  team={favTeam}
                  variant="full"
                  onClear={subject === 'rating' ? undefined : () => setFavorite(null)}
                  onJump={jumpToFavorite}
                />
              </aside>
            )}
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <Outlet
                context={
                  {
                    data,
                    teams,
                    allTeams: data.teams,
                    marker: state.marker,
                    setMarker: (m: 'logo' | 'bubble') => update({ marker: m }),
                    view,
                    setView: (v: ViewMode) => update({ view: v }),
                    favorite,
                    setFavorite,
                    showNotes: state.notes,
                  } satisfies ChartContext
                }
              />
            </div>
          </div>

          <footer className="mt-2 text-xs text-muted">
            Data generated {new Date(data.meta.generatedAt).toLocaleDateString()} ·{' '}
            AP poll &amp; records via CollegeFootballData · titles &amp; All-Americans hand-maintained ·
            conferences: {data.meta.conferenceYear ?? '—'} alignment · logos are each school’s
            trademarks, used for identification ·{' '}
            <a className="underline hover:text-accent" href="#/the-chart">The Chart</a>
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
        {/* legacy paths */}
        <Route path="category/:key" element={<LegacyCategory />} />
        <Route path="bell-curves" element={<Navigate to="/criteria/perception?view=curve" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function LegacyCategory() {
  const { key } = useParams<{ key: string }>();
  return <Navigate to={`/criteria/${key ?? 'perception'}`} replace />;
}
