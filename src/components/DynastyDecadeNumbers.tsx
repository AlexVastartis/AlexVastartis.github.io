import type { StatKey, Team } from '../types';
import { STATS } from '../config/stats';

const fmtStat = (k: StatKey, v: number) => (STATS[k].format ?? String)(v);

/**
 * "One dynasty decade — the numbers": the flat target list + a single "Preview in
 * what-if" button, driven by `team.projectionScenario`.
 *
 * SUPERSEDED by <DynastyRunPicker> (the coach row). Kept, unwired, in case we want
 * the plain-numbers view back — import it into the team panel to restore.
 */
export default function DynastyDecadeNumbers({ team, onPreview }: { team: Team; onPreview: () => void }) {
  const sc = team.projectionScenario!;
  const short = new Set<StatKey>(sc.shortStats);
  const changed = (Object.keys(sc.targets) as StatKey[]).filter(
    (k) => Math.abs(sc.targets[k] - team.stats[k]) > (k === 'winPct' ? 0.0005 : 0.5),
  );
  if (changed.length === 0) return null;
  return (
    <div className="mt-2 border-t border-line pt-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          One dynasty decade — the numbers
        </span>
        <button
          onClick={onPreview}
          className="rounded border border-accent/50 px-1.5 py-0.5 text-[10px] font-semibold text-accent hover:bg-accent/10"
        >
          Preview in what-if →
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] tabular-nums">
        {changed.map((k) => (
          <div key={k} className="flex justify-between gap-1">
            <dt className="truncate text-muted">{STATS[k].label}</dt>
            <dd className="shrink-0">
              {fmtStat(k, team.stats[k])} → <span className="font-semibold">{fmtStat(k, sc.targets[k])}</span>
              {short.has(k) && <span className="text-accent" title="a full decade still doesn’t reach the benchmark here"> *</span>}
            </dd>
          </div>
        ))}
      </dl>
      {sc.shortStats.length > 0 && (
        <p className="mt-1 text-[10px] leading-snug text-muted">
          <span className="text-accent">*</span> one decade closes most of the gap but not this — a
          multi-decade ask, as the blurb spells out.
        </p>
      )}
    </div>
  );
}
