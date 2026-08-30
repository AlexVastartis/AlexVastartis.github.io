import type { ReactNode } from 'react';
import type { StatKey, Team } from '../types';
import PanelHeader from './PanelHeader';
import { PanelStatsCompact, PanelStatsFull } from './PanelStats';
import DynastyRunPicker from './DynastyRunPicker';

interface Props {
  team: Team;
  /**
   * `panel` — the tall right-rail Team Panel. Two modes, chosen by whether a
   *   `whatIf` node is passed:
   *     default   → PanelHeader · full StatBreakdown · Standing · Path Forward · coach runs · "What if?" button
   *     what-if   → PanelHeader · compact StatBreakdown · the what-if editor
   * `strip` — the slim bar that sits on top of the chart views.
   */
  variant?: 'panel' | 'strip';
  onClear?: () => void;
  /** scroll this team's row into view in whatever list is on screen (list views only) */
  onJump?: () => void;
  /** panel/default: show the "What if?" button, which calls this */
  onOpenWhatIf?: () => void;
  /** panel/default: load a set of what-if targets (from the coach-run row) */
  onPreviewProjection?: (targets: Partial<Record<StatKey, number>>) => void;
  /** slider ceilings — needed to size a coach run's targets */
  statMax?: Record<StatKey, number> | null;
  /** panel/what-if: the editor, rendered in place of Standing / Path Forward / button */
  whatIf?: ReactNode;
}

export default function TeamCard({
  team, variant = 'panel', onClear, onJump, onOpenWhatIf, onPreviewProjection, statMax, whatIf,
}: Props) {
  if (variant === 'strip') {
    return (
      <figure
        data-map="the team strip"
        className="flex flex-col rounded-xl border border-accent/40 bg-panel p-3"
      >
        <PanelHeader team={team} size="compact" onClear={onClear} onJump={onJump} />
        <PanelStatsCompact team={team} />
      </figure>
    );
  }

  const inWhatIf = whatIf != null;

  return (
    <figure
      data-map="the team panel"
      className="flex flex-col rounded-xl border border-accent/40 bg-panel p-4 sm:p-5"
    >
      <PanelHeader team={team} size="full" onClear={onClear} onJump={onJump} />

      {inWhatIf ? <PanelStatsCompact team={team} /> : <PanelStatsFull team={team} />}

      {inWhatIf ? (
        whatIf
      ) : (
        <>
          <p
            data-map="the standing blurb"
            className="mt-3 rounded-md bg-paper/70 px-3 py-2 text-xs leading-relaxed"
            title="Standing — where this program sits against the tier it wants (the blue-blood line for the top three tiers), told in last-decade terms"
          >
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted">Standing</span>
            {team.standing}
          </p>
          <div
            data-map="the path-forward blurb"
            className="mt-2 rounded-md border border-line px-3 py-2 text-xs leading-relaxed"
            title="Path Forward — what it would take, in modern-season terms, to reach that tier (or, for the top six, to hold it)"
          >
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted">Path Forward</span>
            {team.pathForward}
          </div>
          {team.projectionScenario && onPreviewProjection && statMax && (
            <DynastyRunPicker team={team} statMax={statMax} onApply={onPreviewProjection} />
          )}
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
