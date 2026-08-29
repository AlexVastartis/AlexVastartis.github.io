import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type MarkerMode = 'logo' | 'bubble';

export interface ViewState {
  /** selected conferences; empty = all */
  conferences: string[];
  marker: MarkerMode;
}

/** filter/display state, kept in the URL query string so views are shareable */
export function useViewState() {
  const [params, setParams] = useSearchParams();

  const state: ViewState = useMemo(
    () => ({
      conferences: params.get('conf') ? params.get('conf')!.split('~').filter(Boolean) : [],
      marker: params.get('marker') === 'bubble' ? 'bubble' : 'logo',
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
