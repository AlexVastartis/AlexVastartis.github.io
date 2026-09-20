import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Route, Routes, Navigate, useLocation, useOutletContext, useParams, Outlet, Link,
} from 'react-router-dom';
import { useTeams } from './data/useTeams';
import { useViewState, type ViewMode, type WinsMode } from './data/useViewState';
import { useTheme } from './lib/theme';
import { useFavorite } from './data/useFavorite';
import Controls from './components/Controls';
import TeamCard from './components/TeamCard';
import WhatIfEditor from './components/WhatIfEditor';
import RatingMathModal from './components/RatingMathModal';
import ThemeToggle from './components/ThemeToggle';
import MapToggle from './components/MapToggle';
import LogoToggle from './components/LogoToggle';
import { useLogoVariant } from './lib/logoVariant';
import { useIsMobile } from './lib/useMedia';
import MapLayer from './map/MapLayer';
import ViewTabs, { type Subject } from './components/ViewTabs';
import type { BlueBloodBenchmark, CategoryKey, StatKey, Team, TeamsPayload } from './types';
import { CATEGORIES } from './config/stats';
import { SHOW_ELEMENT_MAP, SHOW_LOGO_TOGGLE, SHOW_TIMEPOINTS } from './config/flags';
import { CONF_GROUPS, confGroup } from './config/conferences';
import { deriveScenario, statSliderMax } from './lib/scenario';
import { DYNASTY_RUNS, runTargets } from './config/dynastyRuns';
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
  /** NCAA-official vs. as-played wins — the By Decade chart's Now column follows it */
  wins: WinsMode;
}

export function useChartContext() {
  return useOutletContext<ChartContext>();
}

/** a program by school name, matched loosely (any casing, or its slug) — for hand-typed links */
function findTeam(data: TeamsPayload, name: string) {
  const q = name.toLowerCase();
  return data.teams.find((t) => t.school.toLowerCase() === q || t.slug.toLowerCase() === q);
}

function Layout() {
  const { state, update, toggleConference } = useViewState();
  const { search, pathname } = useLocation();
  const criteriaKey = pathname.match(/^\/criteria\/([A-Za-z]+)/)?.[1];
  const subject: Subject = criteriaKey && criteriaKey in CATEGORIES ? (criteriaKey as CategoryKey) : 'rating';
  // a phone has no room for the team panel, the As Of picker or the vacated-wins mode — they're
  // dropped there (and their URL state ignored). The charts aren't OFFERED there either (see
  // ViewTabs), but a direct link to one still opens it.
  const mobile = useIsMobile();
  const wins = mobile ? 'official' : state.wins;
  const view: ViewMode = subject === 'rating'
    ? (state.view === 'decades' ? 'decades' : 'list')
    : (state.view === 'decades' ? 'list' : state.view);
  // By Decade already shows every point in time, so the As Of snapshot does not apply there
  const activeYear = view === 'decades' || mobile ? null : state.year;
  const { loading, error, data } = useTeams(wins, SHOW_TIMEPOINTS ? activeYear : null);
  const snapshot = SHOW_TIMEPOINTS ? (data?.meta.timepoint ?? null) : null;
  const { mode, setMode } = useTheme();
  const [logoVariant, setLogoVariant] = useLogoVariant();
  // The highlighted team lives in the URL (?team=Ohio+State) so a link can point at one program.
  // The URL wins; the saved local pick is the fallback for a bare URL, and only an explicit
  // choice is saved — opening someone's link never overwrites your own favourite.
  const [storedFavorite, storeFavorite] = useFavorite();
  const favorite = state.team ?? storedFavorite;
  // (used where the app itself picks the team — the default, and echoing a saved pick)
  const assignFavorite = useCallback(
    (school: string | null) => {
      update({ team: school });
      storeFavorite(school);
    },
    [update, storeFavorite],
  );
  // (a user's pick — a different team starts clean, so any coach in the URL is dropped)
  const setFavorite = useCallback(
    (school: string | null) => {
      if (school === favorite) return;
      update({ team: school, coach: null });
      storeFavorite(school);
    },
    [update, storeFavorite, favorite],
  );

  // what-if editor: edited raw stats for the highlighted team (reset whenever it changes)
  const [whatIf, setWhatIf] = useState<Partial<Record<StatKey, number>>>({});
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const [ratingMathOpen, setRatingMathOpen] = useState(false);
  useEffect(() => {
    setWhatIf({});
    setWhatIfOpen(false);
    setRatingMathOpen(false);
  }, [favorite, wins, activeYear]);

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
    return baseTeams.filter((t) => set.has(confGroup(t.conference)));
  }, [baseTeams, state.conferences]);

  // keep ?team= honest: accept a slug or any casing and rewrite it to the school's canonical
  // name, drop an unknown one (the default below then applies), and echo a saved pick into a
  // bare URL — so the address bar always names the team on screen and can be copied as a link
  useEffect(() => {
    if (!data || activeYear != null) return;
    if (!state.team) {
      if (storedFavorite && findTeam(data, storedFavorite)) update({ team: storedFavorite });
      return;
    }
    const hit = findTeam(data, state.team);
    if (hit && hit.school !== state.team) update({ team: hit.school });
    else if (!hit) update({ team: null });
  }, [data, activeYear, state.team, storedFavorite, update]);

  // the Blue Blood Rating page always keeps a team highlighted — default to #1 whenever it's
  // empty there; elsewhere, only default it once (so people see the feature exists)
  const didInit = useRef(false);
  useEffect(() => {
    if (!data) return;
    const firstRun = !didInit.current;
    didInit.current = true;
    if (favorite && !(activeYear == null && !findTeam(data, favorite))) return;
    // default to #1 on first load anywhere, and any time the rating page has no team
    if (firstRun || subject === 'rating') {
      assignFavorite(data.teams.find((t) => t.ratingRank === 1)?.school ?? null);
    }
  }, [data, favorite, subject, assignFavorite, activeYear]);

  const favTeam = favorite ? baseTeams.find((t) => t.school === favorite) ?? null : null;
  // the program's REAL, unedited line — coach-run "preview" always builds from this
  // (base + coach), never from the already-edited scenario stats
  const favBase = favorite ? data?.teams.find((t) => t.school === favorite) ?? null : null;
  const statMax = useMemo(
    () => (data ? statSliderMax(data.teams) : null),
    [data],
  );
  // ---- coach runs: ?coach=saban lays that coach's tenure onto the highlighted team ----
  const coachRun = state.coach ? DYNASTY_RUNS.find((r) => r.id === state.coach) : undefined;
  // preview a set of targets as a what-if on the highlighted team. Targets are built from the
  // REAL line (favBase), so diffing against it gives base + coach, never a compounding stack
  const previewTargets = (targets: Partial<Record<StatKey, number>>) => {
    const ref = favBase ?? favTeam;
    if (!ref) return;
    const diff: Partial<Record<StatKey, number>> = {};
    for (const [k, v] of Object.entries(targets) as [StatKey, number][]) {
      if (Math.abs(v - ref.stats[k]) > (k === 'winPct' ? 0.0005 : 0.5)) diff[k] = v;
    }
    setWhatIf(diff);
    setWhatIfOpen(true);
  };
  // apply a coach named in the URL once the data is in (a link opened cold), and again if the
  // team / record / year under it changes. Skipped on a phone (no panel) and in a snapshot.
  const appliedCoach = useRef<string | null>(null);
  useEffect(() => {
    if (!state.coach) {
      appliedCoach.current = null;
      return;
    }
    if (!data) return;
    if (!coachRun) {
      update({ coach: null }); // an unknown coach id — drop it
      return;
    }
    if (!favBase || !statMax || snapshot || mobile) return;
    const key = [favBase.school, coachRun.id, wins, activeYear].join('|');
    if (appliedCoach.current === key) return;
    appliedCoach.current = key;
    previewTargets(runTargets(favBase, coachRun, statMax));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.coach, coachRun, data, favBase, statMax, snapshot, mobile, wins, activeYear]);
  // leaving the what-if (reset / close / a manual slider edit) leaves the coach too — the URL
  // only ever names a coach when the scenario on screen IS that coach's run
  const resetWhatIf = () => {
    setWhatIf({});
    if (state.coach) update({ coach: null });
  };

  const jumpToFavorite = () => {
    if (!favorite) return;
    const el = document.querySelector<HTMLElement>(`[data-school="${CSS.escape(favorite)}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    // brief flare so the action reads even when the row was already centred
    el.classList.remove('row-flare');
    void el.offsetWidth; // restart the animation
    el.classList.add('row-flare');
    window.setTimeout(() => el.classList.remove('row-flare'), 1100);
  };
  // a chart view (anything but the ranked list) gets the compact panel on top so the chart stays
  // near the fold; the ranked list gets the full panel as a wide side rail
  const panelMode: 'top' | 'side' | 'none' = !favTeam || view === 'decades' || mobile ? 'none' : view === 'list' ? 'side' : 'top';

  // The element map is a developer inspection tool. It is gated on SHOW_ELEMENT_MAP
  // (dev builds only) — the toggle button, the ?map=1 URL param, and the overlay
  // are all off in the production bundle. See src/config/flags.ts.
  const mapDev = SHOW_ELEMENT_MAP;

  return (
    <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-4 px-4 py-6">
      <header data-map="the masthead" className="flex items-start justify-between gap-2 sm:gap-3">
        <Link to={{ pathname: '/', search }} className="group flex items-center gap-2.5">
          <img
            src={logoVariant === 'alt' ? '/logo-alt.png' : '/logo.png'}
            alt=""
            className="-my-1 h-14 w-auto shrink-0 sm:-mb-1 sm:-mt-5 sm:h-20"
          />
          <div>
            <h1 className="text-xl font-black leading-none tracking-tight sm:text-2xl">
              BlueBlood<span className="text-accent">Football</span>
            </h1>
            <p className="mt-1 hidden text-sm text-muted sm:block">A century-long ledger of college football prestige.</p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {SHOW_LOGO_TOGGLE && !mobile && <LogoToggle variant={logoVariant} onSetVariant={setLogoVariant} />}
          {mapDev && !mobile && <MapToggle on={state.map} onToggle={() => update({ map: !state.map })} />}
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
          {/* the tab row leads — full width, same in every view, so the
              List / Chart / Bell buttons never move; the filter bar drops into
              the content column below so the team panel can rise level with it */}
          <ViewTabs
            subject={subject}
            view={view}
            onSetView={(v) => update({ view: v })}
            search={search}
            notesOn={state.notes}
            mobile={mobile}
            onToggleNotes={() => update({ notes: !state.notes })}
          />

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
                  runBase={favBase ?? favTeam}
                  variant="panel"
                  statMax={statMax}
                  onClear={subject === 'rating' ? undefined : () => setFavorite(null)}
                  onJump={jumpToFavorite}
                  onOpenWhatIf={snapshot ? undefined : () => setWhatIfOpen(true)}
                  onOpenRatingMath={snapshot ? undefined : () => setRatingMathOpen(true)}
                  onPreviewProjection={snapshot ? undefined : (targets, coachId) => {
                    previewTargets(targets);
                    update({ coach: coachId ?? null });
                  }}
                  whatIf={
                    whatIfOpen && statMax ? (
                      <WhatIfEditor
                        base={scenario?.base ?? favTeam}
                        edited={scenario?.edited ?? favTeam}
                        overrides={scenario ? whatIf : {}}
                        statMax={statMax}
                        benchmark={benchmark}
                        onChange={(v) => { setWhatIf(v); if (state.coach) update({ coach: null }); }}
                        onReset={resetWhatIf}
                        onClose={() => { setWhatIfOpen(false); resetWhatIf(); }}
                      />
                    ) : undefined
                  }
                />
              </aside>
            )}
            <div className="flex min-w-0 flex-col gap-3 lg:col-start-1 lg:row-start-1">
              <Controls
                conferences={[...CONF_GROUPS]}
                state={state}
                onToggleConference={toggleConference}
                onClearConferences={() => update({ conferences: [] })}
                schools={data.teams.map((t) => t.school).sort()}
                favorite={favorite}
                onSetFavorite={setFavorite}
                canClearFavorite={subject !== 'rating'}
                wins={wins}
                compact={mobile}
                onSetWins={(w) => update({ wins: w })}
                year={activeYear}
                onSetYear={(y) => update({ year: y })}
                hideYear={view === 'decades'}
              />

              {snapshot && (
                <div
                  data-map="the snapshot banner"
                  className="flex flex-col gap-0.5 rounded-md border border-dashed border-accent/50 bg-accent/10 px-2.5 py-1.5 text-[11px] text-ink"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold uppercase tracking-wide text-accent">Snapshot · {snapshot} off-season</span>
                    <button
                      onClick={() => update({ year: null })}
                      className="shrink-0 rounded border border-accent/50 px-1.5 py-0.5 font-semibold uppercase tracking-wide text-accent hover:bg-accent/15"
                    >
                      Back to now
                    </button>
                  </div>
                  <span className="min-w-0">
                    the Blue Blood Rating as it would have stood after the {snapshot - 1}–{snapshot} season.
                    {' '}{data.meta.timepointNote}
                  </span>
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
                    onClick={resetWhatIf}
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
                    wins,
                  } satisfies ChartContext
                }
              />
            </div>
          </div>

          <footer data-map="the footer" className="mt-2 text-xs leading-relaxed text-muted">
            Current through the 2026 off-season · vibecoded in a weekend with Claude · logos are each
            school’s trademarks, used for identification ·{' '}
            <a className="underline hover:text-accent" href="#/the-chart">The Chart</a>
          </footer>
        </>
      )}

      <MapLayer on={mapDev && state.map} />

      {ratingMathOpen && favTeam && (
        <RatingMathModal team={favTeam} wins={wins} onClose={() => setRatingMathOpen(false)} />
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
