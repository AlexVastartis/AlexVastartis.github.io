import { useMemo, useState } from 'react';
import type { CategoryKey, StatKey, Team } from '../types';
import { CATEGORIES, STATS } from '../config/stats';
import TeamLogo from './TeamLogo';

type SortCol = 'pctl' | 'team' | 'x' | 'y';

/** column headers are always two lines tall (so the row height never changes
 *  between criteria) — spell the break out rather than leave it to wrap */
const HDR: Record<StatKey, [string, string]> = {
  weeksApPoll: ['Weeks in the', 'AP Poll'],
  weeksApTop10: ['Weeks in the', 'AP Top 10'],
  consensusAA: ['Consensus', 'All-Americans'],
  unanimousAA: ['Unanimous', 'All-Americans'],
  nationalTitles: ['National', 'Championships'],
  conferenceTitles: ['Conference', 'Championships'],
  nflDraftPicks: ['NFL Draft', 'Picks'],
  firstRoundPicks: ['First-Round', 'NFL Draft Picks'],
  allTimeWins: ['All-Time', 'Wins'],
  winPct: ['All-Time', 'Winning %'],
};

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
    <ol data-map="the criterion list" className="flex flex-col rounded-xl border border-line">
      <li
        data-map="the sortable headers"
        className="grid grid-cols-[2rem_1.75rem_minmax(0,10rem)_1fr_auto] items-center gap-3 border-b border-line px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted"
      >
        <span className="text-right">#</span>
        <span />
        <button className={`${hCls(sort.col === 'team')} self-center text-left`} onClick={() => toggle('team')}>
          Program{ind('team')}
        </button>
        <span />
        <span className="flex items-stretch gap-3">
          {([['x', xk], ['y', yk]] as const).map(([col, sk]) => (
            <button
              key={col}
              className={`${hCls(sort.col === col)} hidden h-9 w-28 flex-col items-center justify-center leading-tight sm:flex`}
              onClick={() => toggle(col)}
            >
              <span className="block">{HDR[sk][0]}</span>
              <span className="block">{HDR[sk][1]}{ind(col)}</span>
            </button>
          ))}
          <button
            className={`${hCls(sort.col === 'pctl')} flex h-9 w-20 items-center justify-center`}
            onClick={() => toggle('pctl')}
          >
            <span className="hidden sm:inline">Percentile</span>
            <span className="sm:hidden">Pctl</span>
            {ind('pctl')}
          </button>
        </span>
      </li>
      {rows.map((t, i) => {
        const fav = t.school === favorite;
        return (
          <li key={t.slug || t.school} data-school={t.school}>
            <button
              onClick={() => onPick?.(t.school)}
              className={`grid w-full grid-cols-[2rem_1.75rem_minmax(0,10rem)_1fr_auto] items-center gap-3 border-l-2 px-2 py-1.5 text-left hover:bg-panel ${
                fav ? 'border-accent bg-accent/10' : 'border-transparent'
              }`}
            >
              <span
                className="text-right text-sm font-semibold tabular-nums text-muted"
                title={`#${i + 1} of ${rows.length} on ${CATEGORIES[criterion].label}`}
              >
                {i + 1}
              </span>
              <TeamLogo slug={t.slug} className="h-7 w-7" />
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-sm font-medium">{t.school}</span>
                {fav && <span className="text-xs text-accent">★</span>}
              </span>
              <span />
              <span className="flex items-center gap-3 text-sm tabular-nums">
                <span className="hidden w-28 text-center text-muted sm:inline" title={`${STATS[xk].label}: ${fmtX(t.stats[xk])}`}>
                  {fmtX(t.stats[xk])}
                </span>
                <span className="hidden w-28 text-center text-muted sm:inline" title={`${STATS[yk].label}: ${fmtY(t.stats[yk])}`}>
                  {fmtY(t.stats[yk])}
                </span>
                <span
                  className="w-20 text-center font-bold"
                  title={`${CATEGORIES[criterion].label} score ${t.critScore[criterion].toFixed(1)} — mean of the two stats’ FBS percentiles`}
                >
                  {t.critScore[criterion].toFixed(1)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
