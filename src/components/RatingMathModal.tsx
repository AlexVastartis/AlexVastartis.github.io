import { useEffect, useMemo, useState } from 'react';
import type { CategoryKey, StatKey, Team } from '../types';
import { CATEGORY_ORDER, STATS } from '../config/stats';
import { STAT_KEYS, fmtStat } from './StatBreakdown';
import { TIMEPOINT_YEARS, type WinsMode } from '../data/useTeams';
import { useAllSnapshots } from '../data/useRatingMath';
import { logoSrc } from '../lib/logoSrc';
import { useIsDark } from '../lib/theme';

interface Props {
  team: Team;
  /** NCAA official vs. as played — every snapshot row follows it, like the live row */
  wins: WinsMode;
  onClose: () => void;
}

/** one row of the master table — the Blue Blood Rating cumulative through one
 *  point in time. `stats`/`pct` null = the program wasn't eligible yet. */
interface PeriodRow {
  id: string;
  period: string;
  cutoff: string;
  stats: Record<StatKey, number> | null;
  pct: Record<StatKey, number> | null;
  trimmedLow?: StatKey;
  trimmedHigh?: StatKey;
  rating: number | null;
  rank?: number;
  grouping?: string;
  missingYear?: number;
}

/** short column headers for the 10-wide matrix — the full name is still one
 *  hover away via the <th title>. */
const SHORT_LABEL: Record<StatKey, string> = {
  weeksApPoll: 'AP Poll Wks',
  weeksApTop10: 'AP Top 10',
  consensusAA: 'Consensus',
  unanimousAA: 'Unanimous',
  nationalTitles: 'Nat’l Titles',
  conferenceTitles: 'Conf. Titles',
  nflDraftPicks: 'Draft Picks',
  firstRoundPicks: '1st-Rd Picks',
  allTimeWins: 'Wins',
  winPct: 'Win %',
};

const SHORT_CRIT_LABEL: Record<CategoryKey, string> = {
  perception: 'AP Poll',
  allAmericans: 'All-Americans',
  championships: 'Titles',
  nflDraft: 'NFL Draft',
  wins: 'Wins',
};

export default function RatingMathModal({ team, wins, onClose }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { rows: snapshots, error } = useAllSnapshots(team.school, wins);
  const dark = useIsDark();
  const latestYear = team.trend.fullRange?.split('–')[1] ?? null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const rows: PeriodRow[] = useMemo(() => {
    const out: PeriodRow[] = [
      {
        id: 'now',
        period: 'Now',
        cutoff: latestYear ? `Every season through ${latestYear}` : 'Every season on record',
        stats: team.stats,
        pct: team.pct,
        trimmedLow: team.trimmedLow,
        trimmedHigh: team.trimmedHigh,
        rating: team.rating,
        rank: team.ratingRank,
        grouping: team.grouping,
      },
    ];
    // most recent decade first
    for (const y of [...TIMEPOINT_YEARS].reverse()) {
      const snap = snapshots?.find((r) => r.year === y)?.team ?? null;
      if (!snap) {
        out.push({
          id: `${y}`, period: `${y} off-season`, cutoff: `Every season through ${y - 1}`,
          stats: null, pct: null, rating: null, missingYear: y,
        });
        continue;
      }
      out.push({
        id: `${y}`,
        period: `${y} off-season`,
        cutoff: `Every season through ${y - 1}`,
        stats: snap.stats, pct: snap.pct, trimmedLow: snap.trimmedLow, trimmedHigh: snap.trimmedHigh,
        rating: snap.rating, rank: snap.ratingRank, grouping: snap.grouping,
      });
    }
    return out;
  }, [team, snapshots, latestYear]);

  const colCount = STAT_KEYS.length + 3; // period + rating + stats + chevron

  return (
    <div data-map="the rating math view" className="fixed inset-0 z-[100] flex flex-col bg-paper text-ink">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <img src={logoSrc(team.slug, dark)} alt="" className="h-7 w-7 shrink-0 object-contain" />
          <h2 className="truncate text-base font-bold sm:text-lg">{team.school} — the rating math</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close the rating math view"
          className="shrink-0 rounded-md px-2 py-1 text-sm text-muted ring-1 ring-line hover:bg-panel hover:text-accent"
        >
          ✕ Close
        </button>
      </header>

      <div className="overflow-y-auto">
        <div className="mx-auto w-full max-w-[1700px] px-6 py-5">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div data-map="the method recap" className="rounded-md bg-panel px-4 py-3 text-xs leading-relaxed text-muted">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink">The Method</p>
              <p>
                Ten stats, in five pairs. Each stat becomes a <strong className="text-ink">percentile</strong> among
                the FBS field at that point in time; drop the single highest and single lowest, and average the
                other eight. That average, on a 0–100 scale, is the <strong className="text-ink">Rating</strong>.
              </p>
              <p className="mt-2">
                Every row below runs that exact formula, but only on what had happened by then — a cumulative total
                through that season, never a single year. Click a row and the two dropped stats mark themselves,
                right where they already sit.
              </p>
            </div>
            <div data-map="the definitions" className="rounded-md bg-panel px-4 py-3 text-xs leading-relaxed text-muted">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink">Definitions</p>
              <p>
                <strong className="text-ink">Rating</strong> — the average of eight stat percentiles (the highest
                and lowest are dropped), 0–100. It’s relative to the rest of FBS at that moment, not a fixed bar —
                100 would mean leading the country in almost everything.
              </p>
              <p className="mt-2">
                <strong className="text-ink">Percentile</strong> — where one stat’s raw total ranks against every
                one of the 136 FBS programs, from 0 (dead last) to 100 (best in the country), shown to the tenth for
                precision. A percentile of 92.3 means the total is higher than 92.3% of the field — a rank, not a
                grade — and the field it’s measured against is different at every point in time below.
              </p>
            </div>
          </div>

          <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
            <colgroup>
              <col style={{ width: '14%' }} />
              <col style={{ width: '6%' }} />
              {STAT_KEYS.map((sk) => (
                <col key={sk} style={{ width: '7.6%' }} />
              ))}
              <col style={{ width: '3%' }} />
            </colgroup>
            <thead>
              <tr className="bg-panel text-left text-[10px] uppercase tracking-wide text-muted">
                <th rowSpan={2} className="rounded-tl-md px-3 py-2 align-bottom font-semibold">Period</th>
                <th rowSpan={2} className="px-2 py-2 text-center align-bottom font-semibold">Rating</th>
                {CATEGORY_ORDER.map((ck) => (
                  <th
                    key={ck}
                    colSpan={2}
                    className="border-l border-line/60 px-1 py-1 text-center font-semibold"
                  >
                    {SHORT_CRIT_LABEL[ck]}
                  </th>
                ))}
                <th rowSpan={2} className="rounded-tr-md px-1 py-2" />
              </tr>
              <tr className="bg-panel text-left text-[10px] uppercase leading-tight tracking-wide text-muted">
                {STAT_KEYS.map((sk) => (
                  <th
                    key={sk}
                    title={STATS[sk].label}
                    className="whitespace-normal border-l border-line/60 px-1 py-1 text-center font-medium"
                  >
                    {SHORT_LABEL[sk]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <PeriodRowGroup
                  key={row.id}
                  row={row}
                  open={expanded === row.id}
                  onToggle={() => setExpanded(expanded === row.id ? null : row.id)}
                  team={team}
                  loading={row.missingYear != null && !snapshots && !error}
                  colCount={colCount}
                />
              ))}
            </tbody>
          </table>
          {error && <p className="mt-3 text-xs text-rose-400">Couldn’t load the As Of snapshots: {error}</p>}
          {!snapshots && !error && (
            <p className="mt-3 text-xs text-muted">Loading the As Of snapshots for the decade rows below…</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PeriodRowGroup({
  row, open, onToggle, team, loading, colCount,
}: {
  row: PeriodRow;
  open: boolean;
  onToggle: () => void;
  team: Team;
  loading: boolean;
  colCount: number;
}) {
  const trimmed = new Set<StatKey>(row.trimmedLow && row.trimmedHigh ? [row.trimmedLow, row.trimmedHigh] : []);
  const disabled = row.missingYear != null && loading;

  const showMath = open && row.stats && row.pct && row.trimmedLow && row.trimmedHigh;
  let computed: number | null = null;
  if (showMath) {
    const kept = STAT_KEYS.filter((k) => k !== row.trimmedLow && k !== row.trimmedHigh);
    computed = kept.reduce((s, k) => s + row.pct![k], 0) / kept.length;
  }

  return (
    <>
      <tr
        onClick={disabled ? undefined : onToggle}
        className={`cursor-pointer border-t border-line/70 hover:bg-panel/60 ${open ? 'bg-panel/60' : ''}`}
      >
        <td className="px-3 py-2 align-top">
          <div className="font-medium">{row.period}</div>
          <div className="text-xs text-muted">{row.cutoff}</div>
          {row.rank && <div className="text-xs text-muted">#{row.rank} · {row.grouping}</div>}
        </td>
        <td className="px-2 py-2 text-center align-top tabular-nums font-semibold">
          {row.rating != null ? row.rating.toFixed(1) : loading ? '…' : '—'}
          {showMath && computed != null && (
            <div className={`mt-1 whitespace-nowrap font-hand text-sm font-normal leading-none text-accent ${Math.abs(computed - row.rating!) < 0.05 ? 'rotate-1' : '-rotate-1'}`}>
              {Math.abs(computed - row.rating!) < 0.05 ? `≈${computed.toFixed(2)}` : `⚠≈${computed.toFixed(2)}`}
            </div>
          )}
        </td>
        {STAT_KEYS.map((sk) => {
          const isTrim = trimmed.has(sk);
          const isHigh = sk === row.trimmedHigh;
          return (
            <td key={sk} className={`border-l border-line/40 px-1 py-2 text-center align-top tabular-nums ${isTrim ? 'opacity-40' : ''}`}>
              {row.stats && row.pct ? (
                <>
                  <div className={isTrim ? 'line-through' : ''}>{fmtStat(sk, row.stats[sk])}</div>
                  <div className={`text-[10px] text-muted ${isTrim ? 'line-through' : ''}`}>
                    {row.pct[sk].toFixed(open ? 2 : 1)}
                  </div>
                  {open && (
                    <div className="break-all font-mono text-[8px] leading-tight text-accent">
                      {row.pct[sk]}
                    </div>
                  )}
                  {open && isTrim && (
                    <div
                      className={`mt-1 whitespace-nowrap font-hand text-sm font-semibold leading-none ${
                        isHigh ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      } ${isHigh ? '-rotate-2' : 'rotate-2'}`}
                    >
                      {isHigh ? '▲ high, out' : '▼ low, out'}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-muted">—</span>
              )}
            </td>
          );
        })}
        <td className="px-1 py-2 text-center text-muted">{disabled ? '' : (open ? '▾' : '▸')}</td>
      </tr>
      {open && row.missingYear != null && (
        <tr className="border-t border-line/70 bg-paper">
          <td colSpan={colCount} className="px-4 py-4 text-xs leading-relaxed text-muted">
            <strong className="text-ink">{team.school}</strong> isn’t in the {row.missingYear} snapshot. Either the
            program didn’t exist yet by the {row.missingYear - 1}–{row.missingYear} season, or we hold no
            game-level record for it that far back. Either way, a rating computed from nothing would be a phantom
            number, so it’s omitted rather than guessed at.
          </td>
        </tr>
      )}
    </>
  );
}
