import type { ViewState } from '../data/useViewState';
import type { Theme } from '../lib/theme';

interface Props {
  conferences: string[];
  state: ViewState;
  onToggleConference: (c: string) => void;
  onClearConferences: () => void;
  onSetMarker: (m: 'logo' | 'bubble') => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Controls({
  conferences,
  state,
  onToggleConference,
  onClearConferences,
  onSetMarker,
  theme,
  onToggleTheme,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-panel/40 p-3 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="flex items-center gap-2">
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
        <button
          onClick={onToggleTheme}
          className="rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-line hover:bg-panel"
          title="Toggle light / dark"
        >
          {theme === 'dark' ? '☀︎' : '☾'}
        </button>
      </div>
    </div>
  );
}
