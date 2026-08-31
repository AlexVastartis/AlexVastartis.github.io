import { useEffect, useState } from 'react';
import type { CategoryKey } from '../types';
import type { ChartContext } from '../App';
import { CATEGORIES } from '../config/stats';
import ChartFrame from './ChartFrame';
import ScatterChart from './ScatterChart';
import BellCurve from './BellCurve';
import CriterionList from './CriterionList';
import MarkerToggle from './MarkerToggle';

interface Props {
  criterion: CategoryKey;
  ctx: ChartContext;
}

/** one criterion as the logo scatter, its bell curve, or a plain ranked list —
 *  which one is chosen by the shared view toggle in the layout */
export default function CriterionView({ criterion, ctx }: Props) {
  const { data, teams, allTeams, marker, setMarker, favorite, setFavorite, view } = ctx;
  const [big, setBig] = useState(false);
  // on a criterion view, clicking the already-highlighted program clears it
  const pick = (school: string) => setFavorite(school === favorite ? null : school);
  const cat = CATEGORIES[criterion];
  const [xk, yk] = cat.stats;
  const scope =
    teams.length === allTeams.length
      ? `all ${allTeams.length} FBS programs`
      : `${teams.length} of ${allTeams.length} programs (filtered)`;

  // Esc leaves the expanded view; lock body scroll while it's open
  useEffect(() => {
    if (!big) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setBig(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [big]);

  // switching to the list view can't stay "expanded"
  useEffect(() => {
    if (view === 'list' && big) setBig(false);
  }, [view, big]);

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{cat.label}</h2>
          <p className="text-sm text-muted">{cat.blurb}</p>
        </div>
        <CriterionList criterion={criterion} teams={teams} favorite={favorite} onPick={pick} />
        <p className="text-xs text-muted">
          {scope} · ranked by criterion percentile (mean of the two stats’ FBS percentiles) ·{' '}
          <span className="italic">{data.meta.provenance[criterion]}</span>
        </p>
      </div>
    );
  }

  const chart =
    view === 'plot' ? (
      <ScatterChart
        teams={teams}
        xStat={xk}
        yStat={yk}
        marker={marker}
        favorite={favorite}
        onPick={pick}
        order={(t) => t.critScore[criterion]}
        className={big ? 'h-full w-full select-none' : 'h-auto w-full select-none'}
      />
    ) : (
      <BellCurve
        teams={teams}
        value={(t) => t.composite[criterion]}
        distribution={data.meta.composites[criterion]}
        xLabel={`${cat.label} — criterion score (z)`}
        marker={marker}
        favorite={favorite}
        onPick={pick}
        criterion={criterion}
        className={big ? 'h-full w-full select-none' : 'h-auto w-full select-none'}
      />
    );

  const footer = (
    <>
      {scope}
      {view === 'plot'
        ? ` · where logos overlap, the higher ${cat.label} sits on top · axes scale to the teams shown`
        : ' · position = the criterion score (mean of the two stats’ FBS percentiles) · bands are ±1σ / ±2σ'}
      {' · '}
      <span className="italic">{data.meta.provenance[criterion]}</span>
    </>
  );

  // ---- expanded: a near-fullscreen overlay, like "The Chart" ----
  if (big) {
    return (
      <div data-map="the expanded chart" className="fixed inset-0 z-50 flex flex-col gap-1 bg-paper px-3 py-2.5">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold tracking-tight">{cat.label}</h2>
            <p className="truncate text-xs text-muted">{cat.blurb}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <MarkerToggle marker={marker} onSet={setMarker} />
            <button
              data-map="the chart expand toggle"
              onClick={() => setBig(false)}
              className="inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-xs font-medium text-muted hover:text-ink"
            >
              <span aria-hidden>⤡</span> Shrink <span className="text-muted/70">·  Esc</span>
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1">{chart}</div>
        <p className="shrink-0 truncate text-[11px] text-muted">{footer}</p>
      </div>
    );
  }

  const expandBtn = (
    <button
      data-map="the chart expand toggle"
      onClick={() => setBig(true)}
      title="Expand the chart to full screen"
      className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium text-muted hover:text-ink"
    >
      <span aria-hidden>⤢</span> Expand
    </button>
  );

  return (
    <ChartFrame
      title={cat.label}
      subtitle={cat.blurb}
      filename={`${criterion}-${view}.png`}
      actions={<>{expandBtn}<MarkerToggle marker={marker} onSet={setMarker} /></>}
      footer={footer}
    >
      {chart}
    </ChartFrame>
  );
}
