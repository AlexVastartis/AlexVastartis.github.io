import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Route, Routes, Navigate, useLocation, useOutletContext, useParams, Outlet, Link,
} from 'react-router-dom';
import { useTeams, useConferences } from './data/useTeams';
import { useViewState, type ViewMode } from './data/useViewState';
import { useTheme } from './lib/theme';
import { useFavorite } from './data/useFavorite';
import Controls from './components/Controls';
import TeamCard from './components/TeamCard';
import WhatIfEditor from './components/WhatIfEditor';
import ThemeToggle from './components/ThemeToggle';
import MapToggle from './components/MapToggle';
import MapLayer from './map/MapLayer';
import ViewTabs, { type Subject } from './components/ViewTabs';
import type { BlueBloodBenchmark, CategoryKey, StatKey, Team, TeamsPayload } from './types';
import { CATEGORIES } from './config/stats';
import { deriveScenario, statSliderMax } from './lib/scenario';
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
  /** the "average Blue Blood" line — recomputed live when a what-if edit changes the tier */
  benchmark: BlueBloodBenchmark | null;
  /** the program whose stats are being edited in a live what-if scenario (else null) */
  scenarioSchool: string | null;
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

  // what-if editor: edited raw stats for the highlighted team (reset whenever it changes)
  const [whatIf, setWhatIf] = useState<Partial<Record<StatKey, number>>>({});
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  useEffect(() => {
    setWhatIf({});
    setWhatIfOpen(false);
  }, [favorite, state.wins]);

  const scenario = useMemo(() => {
    if (!data || !favorite || Object.keys(whatIf).length === 0) return null;
    return deriveScenario(
      data.teams, favorite, whatIf, data.meta.groupings, data.meta.tierRatingThresholds,
    );
  }, [data, favorite, whatIf]);

  const baseTeams = scenario ? scenario.teams : data?.teams ?? [];
  const scenarioActive = scenario != null;
  const changeCount = Object.keys(whatIf).length;
  // the benchmark follows the what-if edit: if it moves a team in/out of the Blue
  // Bloods tier, or changes one of theirs, the "average Blue Blood" recomputes
  const benchmark = scenario?.benchmark ?? data?.meta.blueBloodBenchmark ?? null;

  // as the what-if sliders move the team up or down, keep its row centred in view
  useEffect(() => {
    if (!scenario) return;
    document
      .querySelector<HTMLElement>(`[data-school="${CSS.escape(scenario.edited.school)}"]`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [scenario?.edited.school, scenario?.edited.ratingRank]);

  const teams = useMemo(() => {
    if (baseTeams.length === 0) return [];
    if (state.conferences.length === 0) return baseTeams;
    const set = new Set(state.conferences);
    return baseTeams.filter((t) => set.has(t.conference));
  }, [baseTeams, state.conferences]);

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

  const favTeam = favorite ? baseTeams.find((t) => t.school === favorite) ?? null : null;
  const statMax = useMemo(
    () => (data ? statSliderMax(data.teams) : null),
    [data],
  );
  const jumpToFavorite = () => {
    if (!favorite) return;
    document
      .querySelector<HTMLElement>(`[data-school="${CSS.escape(favorite)}"]`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
  // a chart view (anything but the ranked list) gets the compact panel on top so the chart stays
  // near the fold; the ranked list gets the full panel as a wide side rail
  const panelMode: 'top' | 'side' | 'none' = favTeam ? (view === 'list' ? 'side' : 'top') : 'none';

  // The element map is a developer inspection tool. Its toggle button is hidden in
  // production; the layer still honours ?map=1 in the URL, so it can be summoned
  // on the live site by anyone who knows the trick.
  const mapDev = import.meta.env.DEV;

  return (
    <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-4 px-4 py-6">
      <header data-map="the masthead" className="flex items-start justify-between gap-3">
        <Link to={{ pathname: '/', search }} className="group flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="-my-1 h-16 w-auto shrink-0" />
          <div>
            <h1 className="text-2xl font-black leading-none tracking-tight">
              BlueBlood<span className="text-accent">Football</span>
            </h1>
            <p className="mt-1 text-sm text-muted">A century-long ledger of college football prestige.</p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {mapDev && <MapToggle on={state.map} onToggle={() => update({ map: !state.map })} />}
          <div data-map="the theme buttons">
            <ThemeToggle mode={mode} onSetMode={setMode} />
          </div>
        </div>
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

          {/* on list views the tabs live inside the list column so the team panel
              (right rail) can rise level with them; elsewhere they span the page */}
          {panelMode !== 'side' && (
            <ViewTabs
              subject={subject}
              view={view}
              onSetView={(v) => update({ view: v })}
              search={search}
              notesOn={state.notes}
              onToggleNotes={() => update({ notes: !state.notes })}
            />
          )}

          <div className={panelMode === 'side' ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_27rem] lg:gap-6' : ''}>
            {panelMode === 'top' && favTeam && (
              <aside className="mb-3">
                {/* jump is only useful next to a ranked list, so it's not offered on chart views */}
                <TeamCard team={favTeam} variant="strip" onClear={() => setFavorite(null)} />
              </aside>
            )}
            {panelMode === 'side' && favTeam && (
              <aside
                className="mb-4 lg:col-start-2 lg:row-start-1 lg:mb-0 lg:self-start lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto"
              >
                <TeamCard
                  team={favTeam}
                  variant="panel"
                  statMax={statMax}
                  onClear={subject === 'rating' ? undefined : () => setFavorite(null)}
                  onJump={jumpToFavorite}
                  onOpenWhatIf={() => setWhatIfOpen(true)}
                  onPreviewProjection={(targets) => {
                    const diff: Partial<Record<StatKey, number>> = {};
                    for (const [k, v] of Object.entries(targets) as [StatKey, number][]) {
                      if (Math.abs(v - favTeam.stats[k]) > (k === 'winPct' ? 0.0005 : 0.5)) diff[k] = v;
                    }
                    setWhatIf(diff);
                    setWhatIfOpen(true);
                  }}
                  whatIf={
                    whatIfOpen && statMax ? (
                      <WhatIfEditor
                        base={scenario?.base ?? favTeam}
                        edited={scenario?.edited ?? favTeam}
                        overrides={scenario ? whatIf : {}}
                        statMax={statMax}
                        benchmark={benchmark}
                        onChange={setWhatIf}
                        onReset={() => setWhatIf({})}
                        onClose={() => { setWhatIfOpen(false); setWhatIf({}); }}
                      />
                    ) : undefined
                  }
                />
              </aside>
            )}
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              {panelMode === 'side' && (
                <div className="mb-4">
                  <ViewTabs
                    subject={subject}
                    view={view}
                    onSetView={(v) => update({ view: v })}
                    search={search}
                    notesOn={state.notes}
                    onToggleNotes={() => update({ notes: !state.notes })}
                  />
                </div>
              )}
              {scenarioActive && (
                <div
                  data-map="the what-if banner"
                  className="sticky top-1 z-20 mb-3 flex items-center gap-2 rounded-md border border-dashed border-whatif/50 bg-whatif/10 px-2.5 py-1 text-[11px] font-semibold text-whatif backdrop-blur"
                >
                  <span aria-hidden>⚡</span>
                  <span className="min-w-0 truncate">
                    What-if — {favorite}: {changeCount} stat{changeCount === 1 ? '' : 's'} edited ·
                    live re-ranking
                  </span>
                  <button
                    onClick={() => setWhatIf({})}
                    className="ml-auto shrink-0 rounded border border-whatif/50 px-1.5 py-0.5 uppercase tracking-wide hover:bg-whatif/20"
                  >
                    Reset
                  </button>
                </div>
              )}
              <Outlet
                context={
                  {
                    data,
                    teams,
                    allTeams: baseTeams,
                    marker: state.marker,
                    setMarker: (m: 'logo' | 'bubble') => update({ marker: m }),
                    view,
                    setView: (v: ViewMode) => update({ view: v }),
                    favorite,
                    setFavorite,
                    showNotes: state.notes,
                    benchmark,
                    scenarioSchool: scenarioActive ? favorite : null,
                  } satisfies ChartContext
                }
              />
            </div>
          </div>

          <footer data-map="the footer" className="mt-2 text-xs text-muted">
            Data generated {new Date(data.meta.generatedAt).toLocaleDateString()} ·{' '}
            AP poll &amp; records via CollegeFootballData · titles &amp; All-Americans hand-maintained ·
            conferences: {data.meta.conferenceYear ?? '—'} alignment · logos are each school’s
            trademarks, used for identification ·{' '}
            <a className="underline hover:text-accent" href="#/the-chart">The Chart</a>
          </footer>
        </>
      )}

      <MapLayer on={state.map} />
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
