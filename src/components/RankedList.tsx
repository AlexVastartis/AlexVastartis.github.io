import type { CategoryKey, Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import { groupTeams } from '../config/ranking';

const BASE = import.meta.env.BASE_URL;

interface Props {
  teams: Team[];
  onPick?: (team: Team) => void;
  activeSchool?: string;
}

export default function RankedList({ teams, onPick, activeSchool }: Props) {
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
          <header className="mb-2 flex items-baseline gap-2 px-1">
            <h3 className="text-sm font-bold uppercase tracking-wide">{group.label}</h3>
            <span className="text-xs text-muted">{rows.length}</span>
            <p className="ml-auto hidden text-xs text-muted sm:block">{group.blurb}</p>
          </header>
          <p className="mb-2 px-1 text-xs text-muted sm:hidden">{group.blurb}</p>

          <ol className="flex flex-col">
            {rows.map((t) => (
              <li key={t.slug || t.school}>
                <button
                  onClick={() => onPick?.(t)}
                  className={`grid w-full grid-cols-[2rem_1.75rem_1fr_auto] items-center gap-3 rounded-md px-1.5 py-1.5 text-left hover:bg-panel ${
                    activeSchool === t.school ? 'bg-panel ring-1 ring-accent' : ''
                  }`}
                >
                  <span className="text-right text-sm font-semibold tabular-nums text-muted">
                    {t.overallRank}
                  </span>
                  <img
                    src={`${BASE}logos/${t.slug}.svg`}
                    alt=""
                    className="h-7 w-7 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `${BASE}logos/${t.slug}.png`;
                    }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{t.school}</span>
                    <span className="block truncate text-xs text-muted">{t.conference}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <CriterionStrip team={t} />
                    <span className="w-14 text-right text-sm font-bold tabular-nums">
                      {t.overall.toFixed(2)}
                      <span className="text-[10px] font-normal text-muted">σ</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function CriterionStrip({ team }: { team: Team }) {
  return (
    <span className="hidden gap-1 sm:flex" aria-hidden>
      {CATEGORY_ORDER.map((ck: CategoryKey) => {
        const pct = pctOfComposite(team.composite[ck]);
        return (
          <span
            key={ck}
            title={`${CATEGORIES[ck].label}: ${team.composite[ck].toFixed(2)}σ`}
            className="h-4 w-2.5 rounded-sm"
            style={{ background: team.primary, opacity: 0.2 + 0.8 * pct }}
          />
        );
      })}
    </span>
  );
}

/** rough 0..1 position of a composite z for the strip opacity */
function pctOfComposite(z: number): number {
  return 1 / (1 + Math.exp(-1.4 * z));
}
