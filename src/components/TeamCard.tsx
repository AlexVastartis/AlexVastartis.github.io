import { useState, type ReactNode } from 'react';
import type { StatKey, Team, TrendDir } from '../types';
import PanelHeader from './PanelHeader';
import { PanelStatsCompact, PanelStatsFull, PanelStatsStrip } from './PanelStats';
import DynastyRunPicker from './DynastyRunPicker';
import { TREND_CLASS, TREND_GLYPH } from '../config/labels';

/** the direction word that follows "Trajectory — " in the blurb heading */
const trajWord = (dir: TrendDir, strong?: boolean, insufficient?: boolean) =>
  insufficient ? '' : strong
    ? (dir === 'up' ? 'Surging' : 'Collapsing')
    : ({ up: 'Ascending', down: 'Descending', even: 'Level' }[dir]);

interface Props {
  team: Team;
  /**
   * `panel` — the right-rail Team Panel on list views. Three modes:
   *   1 (default)  full header · FULL stat breakdown · coach runs · "What if?" button
   *   2 (what-if)  full header · compact stat breakdown · the what-if editor · coach runs
   *   3 (analysis) full header · compact stat breakdown · Trajectory · Standing · Path Forward
   *   The Stats/Analysis segmented control switches 1 ⟷ 3; "What if?" opens 2.
   * `strip` — the slim bar above the chart / bell-curve views (2×5 stat strip).
   */
  variant?: 'panel' | 'strip';
  onClear?: () => void;
  /** scroll this team's row into view in whatever list is on screen (list views only) */
  onJump?: () => void;
  /** panel/default: show the "What if?" button, which calls this */
  onOpenWhatIf?: () => void;
  /** panel: load a set of what-if targets (from the coach-run row) */
  onPreviewProjection?: (targets: Partial<Record<StatKey, number>>) => void;
  /** the program's REAL line — a coach run is always base + coach, never a compounding stack */
  runBase?: Team;
  /** slider ceilings — needed to size a coach run's targets */
  statMax?: Record<StatKey, number> | null;
  /** panel/what-if: the editor, rendered in place of the stats-mode body */
  whatIf?: ReactNode;
}

export default function TeamCard({
  team, runBase, variant = 'panel', onClear, onJump, onOpenWhatIf, onPreviewProjection, statMax, whatIf,
}: Props) {
  const [tab, setTab] = useState<'stats' | 'analysis'>('stats');

  if (variant === 'strip') {
    return (
      <figure
        data-map="the team strip"
        className="flex flex-col rounded-xl border border-accent/40 bg-panel p-3"
      >
        <PanelHeader team={team} size="compact" onClear={onClear} onJump={onJump} />
        <PanelStatsStrip team={team} />
      </figure>
    );
  }

  const inWhatIf = whatIf != null;
  const coachRuns = team.projectionScenario && onPreviewProjection && statMax
    ? <DynastyRunPicker team={runBase ?? team} statMax={statMax} onApply={onPreviewProjection} />
    : null;

  return (
    <figure
      data-map="the team panel"
      className="flex flex-col rounded-xl border border-accent/40 bg-panel p-4 sm:p-5"
    >
      <PanelHeader team={team} size="full" onClear={onClear} onJump={onJump} />

      {!inWhatIf && (
        <div data-map="the panel view toggle" className="mt-3 flex rounded-md text-[11px] font-semibold ring-1 ring-line">
          {(['stats', 'analysis'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-[5px] px-2 py-1 capitalize ${
                tab === t ? 'bg-accent text-white' : 'text-muted hover:bg-paper/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* mode 1: FULL breakdown; modes 2 & 3: compact breakdown */}
      {inWhatIf || tab === 'analysis' ? <PanelStatsCompact team={team} /> : <PanelStatsFull team={team} />}

      {inWhatIf ? (
        <>
          {whatIf}
          {coachRuns}
        </>
      ) : tab === 'analysis' ? (
        <>
          <p
            data-map="the trajectory blurb"
            className="mt-3 rounded-md bg-paper/70 px-3 py-2 text-xs leading-relaxed"
            title="Trajectory — the last decade's rating against the all-time one"
          >
            <span className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
              Trajectory
              {trajWord(team.trend.dir, team.trend.strong, team.trend.insufficient)
                && ` — ${trajWord(team.trend.dir, team.trend.strong, team.trend.insufficient)}`}
              {(team.trend.dir === 'up' || team.trend.dir === 'down') && !team.trend.insufficient && (
                <span className={`inline-flex ${TREND_CLASS[team.trend.dir]}`} aria-hidden>
                  {TREND_GLYPH[team.trend.dir]}{team.trend.strong ? TREND_GLYPH[team.trend.dir] : ''}
                </span>
              )}
            </span>
            {team.label.trajectoryTooltip}
          </p>
          <p
            data-map="the standing blurb"
            className="mt-2 rounded-md bg-paper/70 px-3 py-2 text-xs leading-relaxed"
            title="Standing — where this program sits against the tier it wants (the blue-blood line for the top three tiers), told in last-decade terms"
          >
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted">Standing</span>
            {team.standing}
          </p>
          <div
            data-map="the path-forward blurb"
            className="mt-2 rounded-md border border-line px-3 py-2 text-xs leading-relaxed"
            title="Path Forward — what it would take, in modern-season terms, to reach that tier (or, for those already there, to hold it)"
          >
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted">Path Forward</span>
            {team.pathForward}
          </div>
        </>
      ) : (
        <>
          {coachRuns}
          {onOpenWhatIf && (
            <button
              data-map="the what-if button"
              onClick={onOpenWhatIf}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-whatif/60 py-1.5 text-xs font-semibold text-whatif hover:bg-whatif/10"
            >
              <span aria-hidden>⚡</span>
              What if? — edit {team.school}&rsquo;s stats
            </button>
          )}
        </>
      )}
    </figure>
  );
}
