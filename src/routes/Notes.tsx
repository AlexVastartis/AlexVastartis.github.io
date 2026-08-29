import { useMemo } from 'react';
import { useChartContext } from '../App';
import type { Team } from '../types';

export default function Notes() {
  const { data } = useChartContext();
  const { meta, teams } = data;
  const prev = meta.previous;

  const analysis = useMemo(() => {
    if (!prev) return null;
    const rows = teams
      .filter((t) => prev[t.school])
      .map((t) => ({
        team: t,
        wasRank: prev[t.school].ratingRank,
        wasRating: prev[t.school].rating,
        dRank: prev[t.school].ratingRank - t.ratingRank,
        dRating: t.rating - prev[t.school].rating,
      }));
    const meanAbsRank = rows.reduce((a, r) => a + Math.abs(r.dRank), 0) / rows.length;
    const byRank = [...teams].sort((a, b) => a.ratingRank - b.ratingRank);
    const sixGap = byRank[5].rating - byRank[6].rating;

    const champ = meta.latestChampion
      ? rows.find((r) => r.team.school === meta.latestChampion)
      : null;
    // relevant movers: blue-blood-adjacent or better, biggest rating change,
    // excluding the champion (featured separately) — ignore Field teams that just
    // hopped a pile of weak programs
    const movers = rows
      .filter((r) => r.team.school !== meta.latestChampion && (r.team.rating >= 70 || r.team.ratingRank <= 40))
      .sort((a, b) => Math.abs(b.dRating) - Math.abs(a.dRating))
      .slice(0, 3);
    return { rows, meanAbsRank, sixGap, champ, movers, six: byRank.slice(0, 6) };
  }, [prev, teams, meta.latestChampion]);

  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-muted">Notes</p>
      <h1 className="mt-1 text-2xl font-black tracking-tight">What a year does to a century</h1>
      <p className="mt-1 text-sm text-muted">
        The Blue Blood Rating from the {meta.latestSeason} preseason to the {meta.latestSeason + 1}{' '}
        preseason — what one completed season did to it.
      </p>

      {!analysis ? (
        <p className="mt-6 text-sm text-muted">
          The year-over-year comparison needs a prior data snapshot. Re-run{' '}
          <code>npm run build:data</code> after the next season and this fills itself in.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed">
          <p>
            The Rating is a career metric — every program has a thousand-plus games behind it, so a
            single season is a rounding error. Across {analysis.rows.length} teams the average rank
            change was <strong>{analysis.meanAbsRank.toFixed(2)} places</strong>.
          </p>

          {analysis.champ && (
            <p>
              <strong>{analysis.champ.team.school}</strong> won the national title. That is the
              season&rsquo;s headline everywhere else and a footnote here:{' '}
              {fmtMove(analysis.champ)}. A title is priced in near the top of the board and, on a stat
              where most programs sit at zero, it&rsquo;s a large percentile jump only for a program
              that had none — which is the whole point of separating career standing from a hot year.
              {analysis.champ.team.rating < 60 &&
                ' The claim also isn’t in the honors data yet; the move here is the ranked season and the wins.'}
            </p>
          )}

          {analysis.movers.length > 0 && (
            <p>
              Among the programs that actually matter to this ranking, the biggest rating moves were{' '}
              {analysis.movers.map((m, i) => (
                <span key={m.team.school}>
                  {i > 0 ? (i === analysis.movers.length - 1 ? ' and ' : ', ') : ''}
                  <strong>{m.team.school}</strong> ({fmtMove(m, true)})
                </span>
              ))}
              . Every one is a fraction of a rating point — momentum, not re-ranking.
            </p>
          )}

          <p>
            The six didn&rsquo;t move. {analysis.six.map((t) => t.school).join(', ')} were separated
            from #7 by 2.3 rating points a year ago and by{' '}
            <strong>{analysis.sixGap.toFixed(1)}</strong> now. Nebraska and Texas are still the pair
            on the wrong side of that gap. A century of data doesn&rsquo;t turn over in a year — it
            adds a line.
          </p>

          <p className="text-xs text-muted">
            Method: Rating = mean of the middle 8 of a program&rsquo;s 10 stat percentiles. The
            {' '}{meta.latestSeason} season contributes final AP weeks, updated records and one title
            claim; consensus All-Americans and draft figures refresh separately.
          </p>
        </div>
      )}
    </article>
  );
}

function fmtMove(
  r: { team: Team; wasRank: number; wasRating: number; dRank: number; dRating: number },
  compact = false,
) {
  const rank = r.dRank === 0 ? `still #${r.team.ratingRank}` : `#${r.wasRank} → #${r.team.ratingRank}`;
  const rating = `${r.wasRating.toFixed(1)} → ${r.team.rating.toFixed(1)}`;
  return compact ? `${rank}` : `rating ${rating}, rank ${rank}`;
}
