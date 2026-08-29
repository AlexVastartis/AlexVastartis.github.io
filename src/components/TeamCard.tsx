import type { Team } from '../types';
import { CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import { TREND_CLASS, TREND_GLYPH, TREND_WORD } from '../config/labels';

const BASE = import.meta.env.BASE_URL;

/** deeper read on the viewer's favourite program */
export default function TeamCard({ team }: { team: Team; allTeams?: Team[] }) {
  const best = CATEGORY_ORDER.reduce((a, b) => (team.critScore[b] > team.critScore[a] ? b : a));
  const worst = CATEGORY_ORDER.reduce((a, b) => (team.critScore[b] < team.critScore[a] ? b : a));

  return (
    <figure className="rounded-xl border border-accent/40 bg-accent/5 p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <img
          src={`${BASE}logos/${team.slug}.svg`}
          alt=""
          className="h-14 w-14 shrink-0 object-contain"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (!el.dataset.png) {
              el.dataset.png = '1';
              el.src = `${BASE}logos/${team.slug}.png`;
            }
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl font-bold tracking-tight">{team.school}</h2>
            <span className="text-sm text-muted">
              #{team.ratingRank} · {team.rating.toFixed(1)} rating ·{' '}
              <span className={TREND_CLASS[team.trend.dir]}>
                {TREND_GLYPH[team.trend.dir]} {TREND_WORD[team.trend.dir]}
              </span>
            </span>
          </div>
          <p className="mt-0.5 text-sm">{team.label.personal}</p>
          <p className="text-xs text-muted">{team.label.standard}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {CATEGORY_ORDER.map((ck) => (
          <div key={ck} className="flex items-center gap-2">
            <dt className="w-28 shrink-0 text-xs text-muted">{CATEGORIES[ck].label}</dt>
            <dd className="flex flex-1 items-center gap-2">
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-line/60">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${team.critScore[ck]}%`, background: team.primary }}
                />
              </span>
              <span className="w-8 text-right text-xs tabular-nums">{Math.round(team.critScore[ck])}</span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-xs text-muted">
        Consistency {team.consistency}/100 · strongest {CATEGORIES[best].label.toLowerCase()},
        thinnest {CATEGORIES[worst].label.toLowerCase()}.
      </p>
      {team.nextTier && (
        <p className="mt-1.5 rounded-md bg-panel/70 px-3 py-2 text-xs leading-relaxed">
          {team.nextTier.summary}
        </p>
      )}
    </figure>
  );
}
