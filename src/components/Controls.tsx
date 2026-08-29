import type { ViewState } from '../data/useViewState';
import type { ThemeMode } from '../lib/theme';

interface Props {
  conferences: string[];
  state: ViewState;
  onToggleConference: (c: string) => void;
  onClearConferences: () => void;
  onSetMarker: (m: 'logo' | 'bubble') => void;
  themeMode: ThemeMode;
  onSetThemeMode: (m: ThemeMode) => void;
  schools: string[];
  favorite: string | null;
  onSetFavorite: (s: string | null) => void;
}

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function Controls({
  conferences,
  state,
  onToggleConference,
  onClearConferences,
  onSetMarker,
  themeMode,
  onSetThemeMode,
  schools,
  favorite,
  onSetFavorite,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-panel/40 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted">Conference</span>
        <button
          onClick={onClearConferences}
          className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-line ${
            state.conferences.length === 0 ? 'bg-accent text-white' : 'hover:bg-panel'
          }`}
        >
          All
        </button>
        {conferences.map((c) => {
          const on = state.conferences.includes(c);
          return (
            <button
              key={c}
              onClick={() => onToggleConference(c)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-line ${
                on ? 'bg-accent text-white' : 'hover:bg-panel'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">★ Team</span>
          <select
            value={favorite ?? ''}
            onChange={(e) => onSetFavorite(e.target.value || null)}
            className="rounded-md border border-line bg-paper px-2 py-1 text-sm"
          >
            <option value="">None</option>
            {schools.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="flex rounded-md ring-1 ring-line">
          {(['logo', 'bubble'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onSetMarker(mode)}
              className={`px-3 py-1.5 text-sm font-medium capitalize first:rounded-l-md last:rounded-r-md ${
                state.marker === mode ? 'bg-accent text-white' : 'hover:bg-panel'
              }`}
            >
              {mode}s
            </button>
          ))}
        </div>

        <div className="flex rounded-md ring-1 ring-line">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => onSetThemeMode(t.value)}
              className={`px-3 py-1.5 text-sm font-medium first:rounded-l-md last:rounded-r-md ${
                themeMode === t.value ? 'bg-accent text-white' : 'hover:bg-panel'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
