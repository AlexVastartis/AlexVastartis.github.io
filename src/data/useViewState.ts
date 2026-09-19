import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SHOW_ELEMENT_MAP, SHOW_TIMEPOINTS } from '../config/flags';

export type MarkerMode = 'logo' | 'bubble';
/** the three visualisation types, shared by the ranking and every criterion */
export type ViewMode = 'list' | 'plot' | 'curve' | 'decades';
export type WinsMode = 'asPlayed' | 'official';

/** point-in-time snapshot years; null = present day */
export const TIMEPOINT_YEARS = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020] as const;

export interface ViewState {
  /** selected conferences; empty = all */
  conferences: string[];
  marker: MarkerMode;
  /** ranked list · logo plot · bell curve */
  view: ViewMode;
  /** NCAA-official wins (default, vacated removed) vs. as-played (vacated counted) */
  wins: WinsMode;
  /** point-in-time snapshot; null = present day */
  year: number | null;
  /** show the hand-drawn gap / range notes in the margin (default off) */
  notes: boolean;
  /** show the site-wide element map overlay — labels every UI region (default off) */
  map: boolean;
  /** the highlighted program (school name or slug) — in the URL so a link can point at one team */
  team: string | null;
}

/** filter/display state, kept in the URL query string so views are shareable */
export function useViewState() {
  const [params, setParams] = useSearchParams();

  const state: ViewState = useMemo(
    () => ({
      conferences: params.get('conf') ? params.get('conf')!.split('~').filter(Boolean) : [],
      marker: params.get('marker') === 'bubble' ? 'bubble' : 'logo',
      view: params.get('view') === 'plot' ? 'plot' : params.get('view') === 'curve' ? 'curve'
        : SHOW_TIMEPOINTS && params.get('view') === 'decades' ? 'decades' : 'list',
      wins: params.get('wins') === 'asPlayed' ? 'asPlayed' : 'official',
      year: SHOW_TIMEPOINTS
        && (TIMEPOINT_YEARS as readonly number[]).includes(Number(params.get('year')))
        ? Number(params.get('year'))
        : null,
      notes: params.get('notes') === '1',
      map: SHOW_ELEMENT_MAP && params.get('map') === '1',
      team: params.get('team') || null,
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
            if (patch.view === 'plot' || patch.view === 'curve' || patch.view === 'decades') next.set('view', patch.view);
            else next.delete('view');
          }
          if ('wins' in patch) {
            if (patch.wins === 'asPlayed') next.set('wins', 'asPlayed');
            else next.delete('wins');
          }
          if ('year' in patch) {
            if (patch.year) next.set('year', String(patch.year));
            else next.delete('year');
          }
          if ('notes' in patch) {
            if (patch.notes) next.set('notes', '1');
            else next.delete('notes');
          }
          if ('team' in patch) {
            if (patch.team) next.set('team', patch.team);
            else next.delete('team');
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
