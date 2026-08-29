import { useMemo } from 'react';
import { useChartContext } from '../App';
import type { Team } from '../types';

export default function Notes() {
  const { data } = useChartContext();
  const { meta, teams } = data;
  const prev = meta.previous;

  const diff = useMemo(() => {
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
    const meanAbs = rows.reduce((a, r) => a + Math.abs(r.dRank), 0) / rows.length;
    const movers = rows.filter((r) => Math.abs(r.dRank) >= 4).sort((a, b) => b.dRank - a.dRank);
    const byRank = [...teams].sort((a, b) => a.ratingRank - b.ratingRank);
    const sixGap = byRank[5].rating - byRank[6].rating;
    const find = (s: string) => rows.find((r) => r.team.school === s);
    return { rows, meanAbs, movers, sixGap, six: byRank.slice(0, 6), find };
  }, [prev, teams]);

  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-muted">Notes</p>
      <h1 className="mt-1 text-2xl font-black tracking-tight">What a year does to a century</h1>
      <p className="mt-1 text-sm text-muted">
        The change in the Blue Blood Rating from the 2025 preseason to the 2026 preseason.
      </p>

      {!diff ? (
        <p className="mt-6 text-sm text-muted">
          The year-over-year comparison needs a prior data snapshot. Re-run <code>npm run build:data</code>{' '}
          once more after the season and this note will fill itself in.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed">
          <p>
            The Rating is a career metric. Every program has played a thousand-plus games; one more
            season is a rounding error against that baseline. Across {diff.rows.length} teams the
            average change in rank was <strong>{diff.meanAbs.toFixed(2)} places</strong>, and{' '}
            <strong>{diff.movers.length === 1 ? 'exactly one program' : `${diff.movers.length} programs`}</strong>{' '}
            moved more than four.
          </p>

          {diff.find('Indiana') && (
            <p>
              <strong>Indiana</strong> — national champion, 2025 — is the one that moved:{' '}
              {fmtMove(diff.find('Indiana')!)}. On national titles the FBS median is zero and roughly
              seven in ten programs sit there, so a first title is a real jump <em>on that criterion</em>{' '}
              and invisible at the top of the board, where a title is priced in. Note too what didn&rsquo;t
              drive it: the title itself isn&rsquo;t in these numbers yet — honors refresh in the
              February pass — so the move is a ranked season and eleven-plus wins doing the work.
            </p>
          )}

          {diff.find('Georgia') && (
            <p>
              <strong>Georgia</strong>&rsquo;s surge is legitimate and it shows where a surge should —
              the perception and wins percentiles, not a championships-only bump — but{' '}
              {fmtMove(diff.find('Georgia')!, true)}. They were already there.
            </p>
          )}

          <p>
            What didn&rsquo;t move: the six. {diff.six.map((t) => t.school).join(', ')} were separated
            from #7 by 2.3 rating points a year ago and by <strong>{diff.sixGap.toFixed(1)}</strong>{' '}
            now. Nebraska and Texas are still the pair on the wrong side of that gap. A century of
            data doesn&rsquo;t turn over in a year — it just adds a line.
          </p>

          <p className="text-xs text-muted">
            Method: Rating = 40% trimmed mean of five percentile-ranked criteria (see The Chart). The
            2025 season contributes final AP weeks, updated records, and one title claim; consensus
            All-Americans and draft figures refresh separately.
          </p>
        </div>
      )}
    </article>
  );
}

function fmtMove(r: { team: Team; wasRank: number; dRank: number; dRating: number }, ranksOnly = false) {
  const rank =
    r.dRank === 0
      ? `still #${r.team.ratingRank}`
      : `#${r.wasRank} → #${r.team.ratingRank}`;
  if (ranksOnly) return `rank ${rank}`;
  const rating = `${(r.team.rating - r.dRating).toFixed(1)} → ${r.team.rating.toFixed(1)}`;
  return `rating ${rating}, rank ${rank}`;
}
