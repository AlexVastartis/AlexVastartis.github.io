import { useEffect, useMemo, useState } from 'react';
import type { Team, TeamsPayload } from '../types';

export type WinsMode = 'asPlayed' | 'official';

/** the point-in-time snapshot years shipped under public/data/timepoints/ */
export const TIMEPOINT_YEARS = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020] as const;
export type TimepointYear = (typeof TIMEPOINT_YEARS)[number];

const cache = new Map<string, TeamsPayload>();
const inflight = new Map<string, Promise<TeamsPayload>>();

function urlFor(year: number | null): string {
  const base = import.meta.env.BASE_URL;
  return year ? `${base}data/timepoints/${year}.json` : `${base}data/teams.json`;
}

function load(year: number | null): Promise<TeamsPayload> {
  const url = urlFor(year);
  const hit = cache.get(url);
  if (hit) return Promise.resolve(hit);
  let p = inflight.get(url);
  if (!p) {
    p = fetch(url, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText} loading ${url}`);
        return r.json() as Promise<TeamsPayload>;
      })
      .then((payload) => {
        cache.set(url, payload);
        return payload;
      })
      .finally(() => {
        inflight.delete(url);
      });
    inflight.set(url, p);
  }
  return p;
}

export interface TeamsState {
  loading: boolean;
  error: string | null;
  data: TeamsPayload | null;
}

/**
 * The team dataset. `year` (a TIMEPOINT_YEARS value) swaps in the point-in-time
 * snapshot built as of that off-season; `null` is the present day. The `wins`
 * toggle only applies to the present day — snapshots carry a single record.
 */
export function useTeams(wins: WinsMode = 'official', year: number | null = null): TeamsState {
  const url = urlFor(year);
  const [raw, setRaw] = useState<TeamsState>(() => ({
    loading: !cache.has(url),
    error: null,
    data: cache.get(url) ?? null,
  }));

  useEffect(() => {
    const cached = cache.get(url);
    if (cached) {
      setRaw({ loading: false, error: null, data: cached });
      return;
    }
    let alive = true;
    setRaw((s) => ({ ...s, loading: true, error: null }));
    load(year)
      .then((data) => alive && setRaw({ loading: false, error: null, data }))
      .catch((e: unknown) =>
        alive &&
        setRaw({ loading: false, error: e instanceof Error ? e.message : String(e), data: null }),
      );
    return () => {
      alive = false;
    };
  }, [url, year]);

  // merge the chosen wins-variant onto every team (present-day only; snapshots
  // mirror the same record onto both variants, so this is a no-op there).
  const data = useMemo<TeamsPayload | null>(() => {
    if (!raw.data) return null;
    if (wins === 'official' || year) return raw.data;
    const teams = raw.data.teams.map((t): Team => ({ ...t, ...t.variants[wins] }));
    return { ...raw.data, teams };
  }, [raw.data, wins, year]);

  return { ...raw, data };
}

/** distinct conference list, ordered by team count desc then name */
export function useConferences(data: TeamsPayload | null): string[] {
  return useMemo(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    for (const t of data.teams) counts.set(t.conference, (counts.get(t.conference) ?? 0) + 1);
    return [...counts.keys()].sort(
      (a, b) => (counts.get(b)! - counts.get(a)!) || a.localeCompare(b),
    );
  }, [data]);
}
