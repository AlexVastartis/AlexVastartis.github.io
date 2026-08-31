import { useState } from 'react';
import type { StatKey, Team } from '../types';
import { VISIBLE_RUNS, runTargets, type DynastyRun } from '../config/dynastyRuns';

const BASE = import.meta.env.BASE_URL;
const initials = (name: string) =>
  name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const pct = (p: number) => p.toFixed(3).slice(1); // 0.874 -> ".874"

interface Props {
  team: Team;
  statMax: Record<StatKey, number>;
  /** load these what-if targets (same shape the "preview" button uses) */
  onApply: (targets: Partial<Record<StatKey, number>>) => void;
}

/**
 * A row of dynasty head coaches. Click one to load "today + that coach's exact
 * tenure (in seasons)" into the what-if editor; hover for the run and what it adds.
 */
export default function DynastyRunPicker({ team, statMax, onApply }: Props) {
  const [hovered, setHovered] = useState<DynastyRun | null>(null);

  return (
    <div data-map="the coach runs" className="mt-2 rounded-md border border-line px-3 py-2">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        Apply a coach&rsquo;s run
      </div>
      <div className="relative flex flex-wrap gap-2">
        {VISIBLE_RUNS.map((run) => (
          <button
            key={run.id}
            type="button"
            onClick={() => onApply(runTargets(team, run, statMax))}
            onMouseEnter={() => setHovered(run)}
            onMouseLeave={() => setHovered((h) => (h === run ? null : h))}
            onFocus={() => setHovered(run)}
            onBlur={() => setHovered((h) => (h === run ? null : h))}
            aria-label={`Add ${run.coach}'s ${run.seasons}-season ${run.program} run to ${team.school}`}
            className="block h-9 w-9 overflow-hidden rounded-full border border-line bg-paper/60 transition hover:border-accent hover:ring-2 hover:ring-accent/30"
          >
            <CoachAvatar run={run} />
          </button>
        ))}
        {hovered && <RunCard run={hovered} team={team} />}
      </div>
      <p className="mt-1.5 truncate text-[10px] leading-snug text-muted">
        Click one to see where {team.school} lands with that coach&rsquo;s tenure added on.
      </p>
    </div>
  );
}

function CoachAvatar({ run }: { run: DynastyRun }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="flex h-full w-full items-center justify-center bg-line/40 text-[10px] font-bold text-muted">
        {initials(run.coach)}
      </span>
    );
  }
  return (
    <img
      src={`${BASE}coaches/${run.id}.png`}
      alt=""
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

/** hover panel — the coach, the exact tenure, and what it adds to this program.
 *  Spans the row (no clipping against the sticky panel) and opens upward. */
function RunCard({ run, team }: { run: DynastyRun; team: Team }) {
  const d = run.tenure;
  return (
    <div className="pointer-events-none absolute bottom-full left-0 right-0 z-40 mb-2 rounded-md border border-line bg-panel p-2.5 text-left shadow-lg">
      <div className="text-xs font-bold">{run.coach} — {run.program}</div>
      <div className="text-[10px] text-muted">
        {run.seasons} seasons coached ({run.years})
      </div>
      <p className="mt-1 text-[10px] italic leading-snug text-muted">{run.shape}</p>
      <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        Adds to {team.school}
      </div>
      <ul className="mt-0.5 flex flex-col gap-0.5 text-[10px] tabular-nums">
        <li>+{d.allTimeWins} wins <span className="text-muted">at {pct(run.tenureWinPct)}</span></li>
        <li>+{d.nationalTitles} national · +{d.conferenceTitles} conference titles</li>
        <li>+{d.consensusAA} consensus / +{d.unanimousAA} unanimous All-Americans</li>
        <li>+{d.nflDraftPicks} draft picks (+{d.firstRoundPicks} first-round)</li>
        <li>+{d.weeksApPoll} ranked / +{d.weeksApTop10} top-10 weeks</li>
      </ul>
      {run.note && (
        <p className="mt-1.5 border-t border-line pt-1 text-[9px] leading-snug text-muted">
          {run.note}
        </p>
      )}
    </div>
  );
}
