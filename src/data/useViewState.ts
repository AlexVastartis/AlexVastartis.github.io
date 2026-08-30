import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type MarkerMode = 'logo' | 'bubble';
/** the three visualisation types, shared by the ranking and every criterion */
export type ViewMode = 'list' | 'plot' | 'curve';
export type WinsMode = 'asPlayed' | 'official';

export interface ViewState {
  /** selected conferences; empty = all */
  conferences: string[];
  marker: MarkerMode;
  /** ranked list · logo plot · bell curve */
  view: ViewMode;
  /** NCAA-official wins (default, vacated removed) vs. as-played (vacated counted) */
  wins: WinsMode;
  /** show the hand-drawn gap / range notes in the margin (default off) */
  notes: boolean;
  /** show the site-wide element map overlay — labels every UI region (default off) */
  map: boolean;
}

/** filter/display state, kept in the URL query string so views are shareable */
export function useViewState() {
  const [params, setParams] = useSearchParams();

  const state: ViewState = useMemo(
    () => ({
      conferences: params.get('conf') ? params.get('conf')!.split('~').filter(Boolean) : [],
      marker: params.get('marker') === 'bubble' ? 'bubble' : 'logo',
      view: params.get('view') === 'plot' ? 'plot' : params.get('view') === 'curve' ? 'curve' : 'list',
      wins: params.get('wins') === 'asPlayed' ? 'asPlayed' : 'official',
      notes: params.get('notes') === '1',
      map: params.get('map') === '1',
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
          if ('view' in patch) {
            if (patch.view === 'plot' || patch.view === 'curve') next.set('view', patch.view);
            else next.delete('view');
          }
          if ('wins' in patch) {
            if (patch.wins === 'asPlayed') next.set('wins', 'asPlayed');
            else next.delete('wins');
          }
          if ('notes' in patch) {
            if (patch.notes) next.set('notes', '1');
            else next.delete('notes');
          }
          if ('map' in patch) {
            if (patch.map) next.set('map', '1');
            else next.delete('map');
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
