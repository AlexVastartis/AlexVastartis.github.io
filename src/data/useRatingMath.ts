import { useEffect, useState } from 'react';
import { loadTimepoint, TIMEPOINT_YEARS, withWins, type WinsMode } from './useTeams';
import type { Team } from '../types';

export interface SnapshotRow {
  year: number;
  team: Team | null;
  /** the snapshot's own meta — omitted-count note, latest season, etc. */
  omitted: boolean;
}

/**
 * One program's row from every point-in-time snapshot, fetched on demand (the
 * rating-math view is the only consumer — no reason to pull 8 files up front).
 * `null` team = the program wasn't eligible for that snapshot yet (see
 * meta.timepointNote on why: founded later, or no game-level record that far
 * back). Shares useTeams' module-level cache, so re-opening the view for a
 * second program, or reopening the same one, costs no new fetches.
 */
export function useAllSnapshots(school: string | null, wins: WinsMode = 'official') {
  const [rows, setRows] = useState<SnapshotRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!school) {
      setRows(null);
      return;
    }
    let alive = true;
    setRows(null);
    setError(null);
    Promise.all(TIMEPOINT_YEARS.map((year) => loadTimepoint(year)))
      .then((payloads) => {
        if (!alive) return;
        setRows(
          payloads.map((payload, i) => {
            const found = payload.teams.find((t) => t.school === school);
            const team = found ? withWins(found, wins) : null;
            return { year: TIMEPOINT_YEARS[i], team, omitted: !team };
          }),
        );
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, [school, wins]);

  return { rows, error };
}
