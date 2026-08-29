import type { CategoryKey, Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import { groupTeams } from '../config/ranking';
import { TREND_CLASS, TREND_GLYPH, TREND_TITLE } from '../config/labels';

const BASE = import.meta.env.BASE_URL;

interface Props {
  teams: Team[];
  favorite?: string | null;
  onPick?: (team: Team) => void;
}

export default function RankedList({ teams, favorite, onPick }: Props) {
  const groups = groupTeams(teams);

  return (
    <div className="flex flex-col gap-5">
      {groups.map(({ group, teams: rows }) => (
        <section
          key={group.key}
          className={
            group.key === 'debated'
              ? 'rounded-xl border border-dashed border-accent/60 bg-accent/5 p-3'
              : group.key === 'blueblood'
                ? 'rounded-xl border border-line bg-panel/60 p-3'
                : 'rounded-xl border border-line p-3'
          }
        >
          <header className="mb-1.5 flex items-baseline gap-2 px-1">
            <h3 className="text-sm font-bold uppercase tracking-wide">{group.label}</h3>
            <span className="text-xs text-muted">{rows.length}</span>
          </header>
          <p className="mb-2 px-1 text-xs leading-snug text-muted">{group.blurb}</p>

          <ol className="flex flex-col">
            {rows.map((t) => {
              const fav = t.school === favorite;
              return (
                <li key={t.slug || t.school}>
                  <button
                    onClick={() => onPick?.(t)}
                    className={`grid w-full grid-cols-[1.6rem_1.75rem_1fr_auto] items-center gap-3 rounded-md border-l-2 px-1.5 py-1.5 text-left hover:bg-panel ${
                      fav ? 'border-accent bg-accent/10' : 'border-transparent'
                    }`}
                  >
                    <span className="flex items-center justify-end gap-0.5 text-sm font-semibold tabular-nums text-muted">
                      <span
                        className={`text-[10px] leading-none ${TREND_CLASS[t.trend.dir]}`}
                        title={TREND_TITLE[t.trend.dir]}
                      >
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
                    <span className="flex items-center gap-3">
                      <CriterionStrip team={t} />
                      <span className="w-12 text-right text-sm font-bold tabular-nums">
                        {t.rating.toFixed(1)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

function CriterionStrip({ team }: { team: Team }) {
  return (
    <span className="hidden gap-1 sm:flex" aria-hidden>
      {CATEGORY_ORDER.map((ck: CategoryKey) => (
        <span
          key={ck}
          title={`${CATEGORIES[ck].label}: ${Math.round(team.critScore[ck])}th pct`}
          className="h-4 w-2.5 rounded-sm"
          style={{ background: team.primary, opacity: 0.18 + 0.82 * (team.critScore[ck] / 100) }}
        />
      ))}
    </span>
  );
}
