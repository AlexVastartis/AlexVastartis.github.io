import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type MarkerMode = 'logo' | 'bubble';
export type Lens = 'plot' | 'curve';
export type RankView = 'list' | 'curve';
export type WinsMode = 'asPlayed' | 'official';

export interface ViewState {
  /** selected conferences; empty = all */
  conferences: string[];
  marker: MarkerMode;
  /** logo scatter vs. bell curve — two views of the same criterion */
  lens: Lens;
  /** ranked list vs. bell curve — two views of the overall ranking */
  rankView: RankView;
  /** as-played wins (default) vs. NCAA-official (vacated removed) */
  wins: WinsMode;
}

/** filter/display state, kept in the URL query string so views are shareable */
export function useViewState() {
  const [params, setParams] = useSearchParams();

  const state: ViewState = useMemo(
    () => ({
      conferences: params.get('conf') ? params.get('conf')!.split('~').filter(Boolean) : [],
      marker: params.get('marker') === 'bubble' ? 'bubble' : 'logo',
      lens: params.get('lens') === 'curve' ? 'curve' : 'plot',
      rankView: params.get('rank') === 'curve' ? 'curve' : 'list',
      wins: params.get('wins') === 'official' ? 'official' : 'asPlayed',
    }),
    [params],
  );

  const update = useCallback(
    (patch: Partial<ViewState>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if ('conferences' in patch) {
            const c = patch.conferences ?? [];
            if (c.length) next.set('conf', c.join('~'));
            else next.delete('conf');
          }
          if ('marker' in patch) {
            if (patch.marker === 'bubble') next.set('marker', 'bubble');
            else next.delete('marker');
          }
          if ('lens' in patch) {
            if (patch.lens === 'curve') next.set('lens', 'curve');
            else next.delete('lens');
          }
          if ('rankView' in patch) {
            if (patch.rankView === 'curve') next.set('rank', 'curve');
            else next.delete('rank');
          }
          if ('wins' in patch) {
            if (patch.wins === 'official') next.set('wins', 'official');
            else next.delete('wins');
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const toggleConference = useCallback(
    (conf: string) => {
      const set = new Set(state.conferences);
      if (set.has(conf)) set.delete(conf);
      else set.add(conf);
      update({ conferences: [...set] });
    },
    [state.conferences, update],
  );

  return { state, update, toggleConference };
}
