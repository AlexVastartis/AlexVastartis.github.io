import { useMemo, useState } from 'react';
import type { CategoryKey, Team } from '../types';
import { CATEGORIES, STATS } from '../config/stats';

const BASE = import.meta.env.BASE_URL;

type SortCol = 'pctl' | 'team' | 'x' | 'y';

interface Props {
  criterion: CategoryKey;
  teams: Team[];
  favorite?: string | null;
  onPick?: (school: string) => void;
}

/** one criterion as a flat, sortable ranked list — no groupings */
export default function CriterionList({ criterion, teams, favorite, onPick }: Props) {
  const [xk, yk] = CATEGORIES[criterion].stats;
  const fmtX = STATS[xk].format ?? String;
  const fmtY = STATS[yk].format ?? String;
  const [sort, setSort] = useState<{ col: SortCol; dir: 'asc' | 'desc' }>({ col: 'pctl', dir: 'desc' });

  const toggle = (col: SortCol) =>
    setSort((s) =>
      s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: col === 'team' ? 'asc' : 'desc' },
    );

  const rows = useMemo(() => {
    const mul = sort.dir === 'asc' ? 1 : -1;
    return [...teams].sort((a, b) => {
      let v: number;
      if (sort.col === 'team') v = a.school.localeCompare(b.school);
      else if (sort.col === 'x') v = a.stats[xk] - b.stats[xk];
      else if (sort.col === 'y') v = a.stats[yk] - b.stats[yk];
      else v = a.critScore[criterion] - b.critScore[criterion];
      return v * mul || b.critScore[criterion] - a.critScore[criterion];
    });
  }, [teams, sort, criterion, xk, yk]);

  const ind = (col: SortCol) => (sort.col === col ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '');
  const hCls = (active: boolean) =>
    `rounded px-1 py-0.5 hover:bg-panel ${active ? 'text-accent' : 'text-muted'}`;

  return (
    <ol className="flex flex-col rounded-xl border border-line">
      <li className="grid grid-cols-[2rem_1.75rem_1fr_auto] items-center gap-3 border-b border-line px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        <span className="text-right">#</span>
        <span />
        <button className={`${hCls(sort.col === 'team')} text-left`} onClick={() => toggle('team')}>
          Program{ind('team')}
        </button>
        <span className="flex items-center gap-4">
          <button className={`${hCls(sort.col === 'x')} hidden w-20 text-right sm:inline`} onClick={() => toggle('x')}>
            {STATS[xk].label}
            {ind('x')}
          </button>
          <button className={`${hCls(sort.col === 'y')} hidden w-20 text-right sm:inline`} onClick={() => toggle('y')}>
            {STATS[yk].label}
            {ind('y')}
          </button>
          <button className={`${hCls(sort.col === 'pctl')} w-10 text-right`} onClick={() => toggle('pctl')}>
            Pctl{ind('pctl')}
          </button>
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
