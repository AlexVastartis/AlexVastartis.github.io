import { useEffect, useMemo, useRef } from 'react';
import type { CategoryKey, Team } from '../types';
import { CATEGORIES, STATS } from '../config/stats';

const BASE = import.meta.env.BASE_URL;

interface Props {
  criterion: CategoryKey;
  teams: Team[];
  favorite?: string | null;
  onPick?: (school: string) => void;
}

/** one criterion as a flat ranked list — no groupings */
export default function CriterionList({ criterion, teams, favorite, onPick }: Props) {
  const [xk, yk] = CATEGORIES[criterion].stats;
  const fmtX = STATS[xk].format ?? String;
  const fmtY = STATS[yk].format ?? String;
  const listRef = useRef<HTMLOListElement>(null);

  const rows = useMemo(
    () => [...teams].sort((a, b) => b.critScore[criterion] - a.critScore[criterion]),
    [teams, criterion],
  );

  const firstRun = useRef(true);
  useEffect(() => {
    if (!favorite) return;
    const wasFirst = firstRun.current;
    firstRun.current = false;
    const id = requestAnimationFrame(() => {
      const el = listRef.current?.querySelector<HTMLElement>(`[data-school="${CSS.escape(favorite)}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (wasFirst && r.top >= 0 && r.bottom <= window.innerHeight) return;
      el.scrollIntoView({ block: 'center', behavior: wasFirst ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(id);
  }, [favorite, criterion]);

  return (
    <ol ref={listRef} className="flex flex-col rounded-xl border border-line">
      <li className="grid grid-cols-[2rem_1.75rem_1fr_auto] items-center gap-3 border-b border-line px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        <span className="text-right">#</span>
        <span />
        <span>Program</span>
        <span className="flex items-center gap-4">
          <span className="hidden w-20 text-right sm:inline">{STATS[xk].label}</span>
          <span className="hidden w-20 text-right sm:inline">{STATS[yk].label}</span>
          <span className="w-10 text-right">Pctl</span>
        </span>
      </li>
      {rows.map((t, i) => {
        const fav = t.school === favorite;
        return (
          <li key={t.slug || t.school} data-school={t.school}>
            <button
              onClick={() => onPick?.(t.school)}
              className={`grid w-full grid-cols-[2rem_1.75rem_1fr_auto] items-center gap-3 border-l-2 px-2 py-1.5 text-left hover:bg-panel ${
                fav ? 'border-accent bg-accent/10' : 'border-transparent'
              }`}
            >
              <span className="text-right text-sm font-semibold tabular-nums text-muted">{i + 1}</span>
              <img
                src={`${BASE}logos/${t.slug}.svg`}
                alt=""
                className="h-7 w-7 object-contain"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  if (!el.dataset.png) {
                    el.dataset.png = '1';
                    el.src = `${BASE}logos/${t.slug}.png`;
                  }
                }}
              />
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-sm font-medium">{t.school}</span>
                {fav && <span className="text-xs text-accent">★</span>}
              </span>
              <span className="flex items-center gap-4 text-sm tabular-nums">
                <span className="hidden w-20 text-right text-muted sm:inline" title={`${STATS[xk].label}: ${fmtX(t.stats[xk])}`}>
                  {fmtX(t.stats[xk])}
                </span>
                <span className="hidden w-20 text-right text-muted sm:inline" title={`${STATS[yk].label}: ${fmtY(t.stats[yk])}`}>
                  {fmtY(t.stats[yk])}
                </span>
                <span className="w-10 text-right font-bold">{Math.round(t.critScore[criterion])}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
