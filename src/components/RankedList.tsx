import { useEffect, useMemo, useRef, useState } from 'react';
import type { CategoryKey, Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import { groupTeams } from '../config/ranking';
import { TREND_CLASS, TREND_GLYPH, trendTitle } from '../config/labels';

const BASE = import.meta.env.BASE_URL;

type SortCol = 'rank' | 'team' | 'rating' | CategoryKey;

const ABBR: Record<CategoryKey, string> = {
  perception: 'AP',
  wins: 'Win',
  championships: 'Titles',
  allAmericans: 'AA',
  nflDraft: 'NFL',
};

// shared column template — header and every row use it so the columns line up
const GRID =
  'grid grid-cols-[2rem_1.75rem_minmax(0,1fr)_3.4rem] md:grid-cols-[2rem_1.75rem_minmax(0,1fr)_repeat(5,2.6rem)_3.6rem] items-center gap-2';

interface Props {
  teams: Team[];
  favorite?: string | null;
  onPick?: (team: Team) => void;
}

export default function RankedList({ teams, favorite, onPick }: Props) {
  const [sort, setSort] = useState<{ col: SortCol; dir: 'asc' | 'desc' }>({ col: 'rank', dir: 'asc' });
  const grouped = sort.col === 'rank';
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = (col: SortCol) =>
    setSort((s) =>
      s.col === col
        ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: col === 'team' ? 'asc' : col === 'rank' ? 'asc' : 'desc' },
    );

  const groups = useMemo(() => groupTeams(teams), [teams]);
  const flat = useMemo(() => {
    const mul = sort.dir === 'asc' ? 1 : -1;
    return [...teams].sort((a, b) => {
      let v: number;
      if (sort.col === 'team') v = a.school.localeCompare(b.school);
      else if (sort.col === 'rating') v = a.rating - b.rating;
      else if (sort.col === 'rank') v = a.ratingRank - b.ratingRank;
      else v = a.critScore[sort.col] - b.critScore[sort.col];
      return v * mul || a.ratingRank - b.ratingRank;
    });
  }, [teams, sort]);

  // centre the favourite in view whenever it changes or the ordering changes
  const firstRun = useRef(true);
  useEffect(() => {
    if (!favorite) return;
    const wasFirst = firstRun.current;
    firstRun.current = false;
    const id = requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector<HTMLElement>(`[data-school="${CSS.escape(favorite)}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (wasFirst && r.top >= 0 && r.bottom <= window.innerHeight) return; // already visible on load — don't yank
      el.scrollIntoView({ block: 'center', behavior: wasFirst ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(id);
  }, [favorite, sort, grouped]);

  const ind = (col: SortCol) => (sort.col === col ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '');
  const hClass = (active: boolean) =>
    `rounded px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide hover:bg-panel ${
      active ? 'text-accent' : 'text-muted'
    }`;

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      {/* sortable header */}
      <div className={`${GRID} px-2`}>
        <button className={`${hClass(sort.col === 'rank')} text-right`} onClick={() => toggle('rank')}>
          #{ind('rank')}
        </button>
        <span />
        <button className={`${hClass(sort.col === 'team')} text-left`} onClick={() => toggle('team')}>
          Team{ind('team')}
        </button>
        {CATEGORY_ORDER.map((ck) => (
          <button
            key={ck}
            title={`Sort by ${CATEGORIES[ck].label}`}
            className={`${hClass(sort.col === ck)} hidden text-center md:block`}
            onClick={() => toggle(ck)}
          >
            {ABBR[ck]}
            {ind(ck)}
          </button>
        ))}
        <button className={`${hClass(sort.col === 'rating')} text-right`} onClick={() => toggle('rating')}>
          Rtg{ind('rating')}
        </button>
      </div>

      {grouped ? (
        <div className="flex flex-col gap-7">
          {groups.map((g, i) => {
            const gap = i > 0 ? groups[i - 1].teams.at(-1)!.rating - g.teams[0].rating : 0;
            return (
              <div key={g.grouping}>
                {i > 0 && gap > 0 && <GapNote gap={gap} />}
                <section
                  className={
                    g.grouping === 'Blue Blood Fringe'
                      ? 'overflow-hidden rounded-xl border border-dashed border-accent/60 bg-accent/5'
                      : g.grouping === 'Blue Bloods'
                        ? 'overflow-hidden rounded-xl border border-line bg-panel/60'
                        : 'overflow-hidden rounded-xl border border-line'
                  }
                >
                  <header className="flex items-baseline gap-2 px-2 pt-2">
                    <h3 className="text-sm font-bold uppercase tracking-wide">{g.grouping}</h3>
                    <span className="text-xs text-muted">{g.teams.length}</span>
                  </header>
                  <p className="px-2 pb-1.5 text-xs leading-snug text-muted">{g.blurb}</p>
                  <ol>
                    {g.teams.map((t) => (
                      <Row key={t.slug || t.school} team={t} fav={t.school === favorite} onPick={onPick} />
                    ))}
                  </ol>
                </section>
              </div>
            );
          })}
        </div>
      ) : (
        <ol className="overflow-hidden rounded-xl border border-line">
          {flat.map((t) => (
            <Row key={t.slug || t.school} team={t} fav={t.school === favorite} onPick={onPick} />
          ))}
        </ol>
      )}
    </div>
  );
}

function Row({ team: t, fav, onPick }: { team: Team; fav: boolean; onPick?: (t: Team) => void }) {
  return (
    <li data-school={t.school}>
      <button
        onClick={() => onPick?.(t)}
        className={`${GRID} w-full border-l-2 px-2 py-1.5 text-left hover:bg-panel ${
          fav ? 'border-accent bg-accent/10' : 'border-transparent'
        }`}
      >
        <span className="flex items-center justify-end gap-0.5 text-sm font-semibold tabular-nums text-muted">
          <span className={`text-[10px] leading-none ${TREND_CLASS[t.trend.dir]}`} title={trendTitle(t)}>
            {TREND_GLYPH[t.trend.dir]}
          </span>
          {t.ratingRank}
        </span>
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
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{t.school}</span>
            {fav && <span className="text-xs text-accent">★</span>}
          </span>
          <span className="block truncate text-xs text-muted">{t.label.standard}</span>
        </span>
        {CATEGORY_ORDER.map((ck) => {
          const cs = t.critScore[ck];
          return (
            <span
              key={ck}
              title={`${CATEGORIES[ck].label}: ${Math.round(cs)}th percentile`}
              className="hidden text-center text-xs tabular-nums md:block"
              style={{ opacity: 0.35 + 0.65 * (cs / 100) }}
            >
              {Math.round(cs)}
            </span>
          );
        })}
        <span className="text-right text-sm font-bold tabular-nums">{t.rating.toFixed(1)}</span>
      </button>
    </li>
  );
}

/** the pen-in-the-margin note calling out the rating gap between two groups */
function GapNote({ gap }: { gap: number }) {
  return (
    <div className="pointer-events-none relative z-10 -mb-4 -mt-2 ml-1 flex items-center gap-1 font-hand text-accent">
      <svg
        width="30"
        height="22"
        viewBox="0 0 30 22"
        className="shrink-0 -rotate-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 18 C 6 8, 14 4, 26 4" />
        <path d="M19 3 L 27 4 L 24 12" />
      </svg>
      <span className="-rotate-3 text-xl leading-none">≈{gap.toFixed(1)}% gap</span>
    </div>
  );
}
