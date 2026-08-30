import type { ViewState, WinsMode } from '../data/useViewState';

interface Props {
  conferences: string[];
  state: ViewState;
  onToggleConference: (c: string) => void;
  onClearConferences: () => void;
  schools: string[];
  favorite: string | null;
  onSetFavorite: (s: string | null) => void;
  /** the Blue Blood Rating page always keeps a team highlighted */
  canClearFavorite: boolean;
  wins: WinsMode;
  onSetWins: (w: WinsMode) => void;
}

const WINS: { value: WinsMode; label: string }[] = [
  { value: 'official', label: 'NCAA official' },
  { value: 'asPlayed', label: 'As played' },
];

export default function Controls({
  conferences,
  state,
  onToggleConference,
  onClearConferences,
  schools,
  favorite,
  onSetFavorite,
  canClearFavorite,
  wins,
  onSetWins,
}: Props) {
  return (
    <div data-map="the filter bar" className="flex flex-col gap-3 rounded-xl border border-line bg-panel/40 p-3">
      <div data-map="the conference filters" className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted">Conference</span>
        <button
          onClick={onClearConferences}
          title="Show every FBS program"
          className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-line ${
            state.conferences.length === 0 ? 'bg-accent text-white' : 'hover:bg-panel'
          }`}
        >
          All
        </button>
        {[...conferences].sort((a, b) => a.localeCompare(b)).map((c) => {
          const on = state.conferences.includes(c);
          return (
            <button
              key={c}
              onClick={() => onToggleConference(c)}
              title={`${on ? 'Remove' : 'Add'} ${c} — current-alignment members only`}
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
        <label data-map="the team picker" className="flex items-center gap-1.5 text-sm" title="Highlight one program across every chart and list">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">★ Team</span>
          <select
            value={favorite ?? ''}
            onChange={(e) => onSetFavorite(e.target.value || null)}
            title="Highlight one program across every chart and list"
            className="max-w-[9rem] rounded-md border border-line bg-paper px-2 py-1 text-sm"
          >
            {(canClearFavorite || !favorite) && <option value="">None</option>}
            {[...schools].sort((a, b) => a.localeCompare(b)).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {favorite && canClearFavorite && (
            <button
              onClick={() => onSetFavorite(null)}
              title="Clear team"
              aria-label="Clear team"
              className="rounded-md px-1.5 py-1 text-sm text-muted ring-1 ring-line hover:bg-panel hover:text-accent"
            >
              ✕
            </button>
          )}
        </label>

        <div data-map="the vacated wins toggle" className="flex rounded-md ring-1 ring-line" title="NCAA official record (default) — or add back NCAA-vacated wins to see the games as they were played">
          {WINS.map((w) => (
            <button
              key={w.value}
              onClick={() => onSetWins(w.value)}
              className={`px-3 py-1.5 text-sm font-medium first:rounded-l-md last:rounded-r-md ${
                wins === w.value ? 'bg-accent text-white' : 'hover:bg-panel'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
