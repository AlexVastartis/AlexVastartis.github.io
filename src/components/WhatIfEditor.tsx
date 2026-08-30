import type { BlueBloodBenchmark, StatKey, Team } from '../types';
import { STATS } from '../config/stats';
import { STAT_KEYS } from '../lib/scenario';

interface Props {
  /** the program's real, unedited line */
  base: Team;
  /** the program after the current overrides are applied (or `base` if none) */
  edited: Team;
  overrides: Partial<Record<StatKey, number>>;
  /** slider ceiling per stat */
  statMax: Record<StatKey, number>;
  /** the Blue Blood benchmark line, for the second tick */
  benchmark?: BlueBloodBenchmark | null;
  onChange: (next: Partial<Record<StatKey, number>>) => void;
  onReset: () => void;
  onClose: () => void;
}

const fmt = (k: StatKey, v: number) => (STATS[k].format ?? String)(v);

export default function WhatIfEditor({
  base, edited, overrides, statMax, benchmark, onChange, onReset, onClose,
}: Props) {
  const dirty = Object.keys(overrides).length > 0;
  const rankDelta = base.ratingRank - edited.ratingRank; // positive = moved up
  const tierChanged = base.grouping !== edited.grouping;

  const set = (k: StatKey, v: number) => {
    const next = { ...overrides };
    if (v === base.stats[k]) delete next[k];
    else next[k] = v;
    onChange(next);
  };

  return (
    <section
      data-map="the what-if editor"
      className="mt-3 rounded-md border border-dashed border-whatif/60 bg-whatif/[0.05] p-2.5"
    >
      <header className="mb-1.5 flex items-center justify-between gap-2">
        <h4 className="min-w-0 truncate text-[11px] font-bold uppercase tracking-wide text-whatif">
          ⚡ What if — {base.school}
        </h4>
        <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase leading-none tracking-wide">
          {dirty && (
            <button
              onClick={onReset}
              className="rounded border border-whatif/60 px-1.5 py-0.5 text-whatif hover:bg-whatif/20"
            >
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            title="Close what-if"
            aria-label="Close what-if"
            className="rounded border border-line px-1.5 py-0.5 text-muted hover:border-whatif hover:bg-whatif/15 hover:text-whatif"
          >
            ✕ Close
          </button>
        </div>
      </header>

      <div className="mb-2 flex items-center justify-between gap-1 rounded-md bg-paper/70 px-2 py-1 text-[11px]">
        <span className="text-muted">
          #{base.ratingRank} · {base.rating.toFixed(1)} · {base.grouping}
        </span>
        <span className="text-muted">→</span>
        <span className="font-semibold">
          #{edited.ratingRank} · {edited.rating.toFixed(1)}
          {' · '}
          <span className={tierChanged ? 'text-accent' : ''}>{edited.grouping}</span>
          {rankDelta !== 0 && (
            <span className={`ml-1 ${rankDelta > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              ({rankDelta > 0 ? '▲' : '▼'}{Math.abs(rankDelta)})
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {STAT_KEYS.map((k) => {
          const cur = overrides[k] ?? base.stats[k];
          const isWinPct = k === 'winPct';
          const max = statMax[k];
          const step = isWinPct ? 0.001 : max > 400 ? 5 : 1;
          const pos = (v: number) => `${Math.min(100, Math.max(0, (v / max) * 100))}%`;
          const delta = cur - base.stats[k];
          const bench = benchmark?.stats[k];
          const atBench = bench != null && Math.abs(cur - bench) < (isWinPct ? 0.0005 : step);
          return (
            <label key={k} className="block text-[11px]">
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{STATS[k].label}</span>
                <span className="tabular-nums text-muted">
                  {fmt(k, cur)}
                  {delta !== 0 && (
                    <span className={delta > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                      {' '}({delta > 0 ? '+' : ''}{isWinPct ? delta.toFixed(3) : Math.round(delta)})
                    </span>
                  )}
                  {' · '}
                  <span title="percentile in this scenario">{Math.round(edited.pct[k])}p</span>
                  {bench != null && (
                    <button
                      type="button"
                      onClick={() => set(k, bench)}
                      className={`ml-1.5 rounded px-1 text-[10px] ${atBench ? 'bg-accent/20 text-accent' : 'text-accent hover:bg-accent/10'}`}
                      title={`Blue Blood benchmark: ${fmt(k, bench)} — click to match`}
                    >
                      ◆{fmt(k, bench)}
                    </button>
                  )}
                </span>
              </span>
              <span className="relative mt-1 block h-4">
                {/* benchmark tick (accent) */}
                {bench != null && (
                  <span
                    className="pointer-events-none absolute top-0 z-10 h-4 w-[3px] -translate-x-1/2 rounded-sm bg-accent"
                    style={{ left: pos(bench) }}
                    title={`Blue Blood benchmark: ${fmt(k, bench)}`}
                  />
                )}
                {/* current-value tick (bold, dark) */}
                <span
                  className="pointer-events-none absolute top-0 z-10 h-4 w-[3px] -translate-x-1/2 rounded-sm bg-ink"
                  style={{ left: pos(base.stats[k]) }}
                  title={`${base.school} now: ${fmt(k, base.stats[k])}`}
                />
                <input
                  type="range"
                  min={0}
                  max={max}
                  step={step}
                  value={cur}
                  onChange={(e) => set(k, Number(e.target.value))}
                  className="absolute inset-0 my-auto h-1 w-full appearance-none rounded-full bg-line/70 accent-accent"
                />
              </span>
            </label>
          );
        })}
      </div>

      <p className="mt-2 text-[10px] leading-snug text-muted">
        Sliders run to 1.5× the current FBS leader in each stat (win % to 1.000). The dark tick is
        {' '}{base.school}&rsquo;s real value, the <span className="text-accent">◆ accent tick</span> the
        Blue Blood benchmark — click the ◆ chip to snap a stat to it. Ranks, tiers and charts
        recompute live from the edited line.
      </p>
    </section>
  );
}
