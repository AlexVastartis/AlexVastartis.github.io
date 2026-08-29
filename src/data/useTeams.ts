import { useEffect, useMemo, useState } from 'react';
import type { Team, TeamsPayload } from '../types';

export type WinsMode = 'asPlayed' | 'official';

let cache: TeamsPayload | null = null;
let inflight: Promise<TeamsPayload> | null = null;

function load(): Promise<TeamsPayload> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    const url = `${import.meta.env.BASE_URL}data/teams.json`;
    inflight = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText} loading ${url}`);
        return r.json() as Promise<TeamsPayload>;
      })
      .then((p) => {
        cache = p;
        return p;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export interface TeamsState {
  loading: boolean;
  error: string | null;
  data: TeamsPayload | null;
}

export function useTeams(wins: WinsMode = 'asPlayed'): TeamsState {
  const [raw, setRaw] = useState<TeamsState>(() => ({
    loading: !cache,
    error: null,
    data: cache,
  }));

  useEffect(() => {
    if (cache) return;
    let alive = true;
    load()
      .then((data) => alive && setRaw({ loading: false, error: null, data }))
      .catch((e: unknown) =>
        alive &&
        setRaw({ loading: false, error: e instanceof Error ? e.message : String(e), data: null }),
      );
    return () => {
      alive = false;
    };
  }, []);

  // merge the chosen wins-variant onto every team so components read team.rating etc. directly
  const data = useMemo<TeamsPayload | null>(() => {
    if (!raw.data) return null;
    if (wins === 'asPlayed') return raw.data;
    const teams = raw.data.teams.map((t): Team => ({ ...t, ...t.variants[wins] }));
    return { ...raw.data, teams };
  }, [raw.data, wins]);

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
