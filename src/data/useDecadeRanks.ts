import { useEffect, useState } from 'react';
import { loadTimepoint, TIMEPOINT_YEARS, withWins } from './useTeams';
import type { Team } from '../types';
import type { WinsMode } from './useTeams';

export interface DecadeColumn {
  /** "2020" or "Now" */
  label: string;
  /** the last season the column's stats include */
  through: number;
  /** every program on the board at that point in time, best first */
  teams: Team[];
}

/**
 * Every program at every point in time — each As Of snapshot plus the present
 * day — for the By Decade chart. Shares useTeams' module-level cache, so the
 * snapshot files are fetched once however often the view is reopened. Every
 * column follows the NCAA-official / as-played wins toggle.
 */
export function useDecadeColumns(wins: WinsMode) {
  const [payloads, setPayloads] = useState<Awaited<ReturnType<typeof loadTimepoint>>[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const points: (number | null)[] = [...TIMEPOINT_YEARS, null];
    Promise.all(points.map((y) => loadTimepoint(y)))
      .then((p) => alive && setPayloads(p))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, []);

  const columns: DecadeColumn[] | null = payloads
    ? payloads.map((p, i) => {
        const isNow = i === payloads.length - 1;
        const teams = wins === 'official' ? p.teams : p.teams.map((t) => withWins(t, wins));
        return {
          label: isNow ? 'Now' : String(TIMEPOINT_YEARS[i]),
          through: p.meta.latestSeason,
          teams: [...teams].sort((a, b) => a.ratingRank - b.ratingRank),
        };
      })
    : null;

  return { columns, error };
}
