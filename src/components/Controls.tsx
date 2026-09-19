import { TIMEPOINT_YEARS, type ViewState, type WinsMode } from '../data/useViewState';
import { SHOW_TIMEPOINTS, SHOW_WINS_TOGGLE } from '../config/flags';

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
  /** point-in-time snapshot year; null = present day */
  year: number | null;
  onSetYear: (y: number | null) => void;
  /** the By Decade view already spans every point in time — no As Of picker there */
  hideYear?: boolean;
  /** a phone: conference chips and the team picker only — no wins toggle, no As Of */
  compact?: boolean;
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
  year,
  onSetYear,
  hideYear,
  compact,
}: Props) {
  return (
    <div
      data-map="the filter bar"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-panel/40 px-3 py-2"
    >
      <div data-map="the conference filters" className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 hidden text-xs font-semibold uppercase tracking-wide text-muted sm:inline">Conference</span>
        <button
          onClick={onClearConferences}
          title="Show every FBS program"
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
              title={
                c === 'Other'
                  ? `${on ? 'Remove' : 'Add'} Other — Big 12, the Group of Five and Independents`
                  : `${on ? 'Remove' : 'Add'} ${c} — 2026 members`
              }
              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-line ${
                on ? 'bg-accent text-white' : 'hover:bg-panel'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <span className="hidden h-5 w-px bg-line sm:block" aria-hidden />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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

        {SHOW_WINS_TOGGLE && !compact && (
        <div
          data-map="the vacated wins toggle"
          className="flex rounded-md ring-1 ring-line"
          title="NCAA official record (default) — or add back the wins and national titles the NCAA vacated, to see the games as they were played. Applies to every As Of year too."
        >
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
        )}

        {/* the switch is hidden, but ?wins=asPlayed still works — so the mode is never invisible */}
        {!SHOW_WINS_TOGGLE && !compact && wins === 'asPlayed' && (
          <span
            data-map="the as played chip"
            className="inline-flex items-center gap-1 rounded-md border border-accent bg-accent/10 px-2 py-1 text-xs font-semibold text-accent"
            title="Counting the wins and national titles the NCAA vacated, as they were played. Click ✕ for the NCAA official record."
          >
            As played
            <button onClick={() => onSetWins('official')} aria-label="Back to the NCAA official record" className="text-muted hover:text-accent">
              ✕
            </button>
          </span>
        )}

        {SHOW_TIMEPOINTS && !hideYear && !compact && (
          <label
            data-map="the year picker"
            className="flex items-center gap-1.5 text-sm"
            title="View the site as a point in time — every stat re-totalled from seasons through that off-season, tiers re-drawn"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">As of</span>
            <select
              value={year ?? ''}
              onChange={(e) => onSetYear(e.target.value ? Number(e.target.value) : null)}
              className={`rounded-md border px-2 py-1 text-sm ${
                year ? 'border-accent bg-accent/10 font-semibold text-accent' : 'border-line bg-paper'
              }`}
            >
              <option value="">Now</option>
              {[...TIMEPOINT_YEARS].reverse().map((y) => (
                <option key={y} value={y}>{y} off-season</option>
              ))}
            </select>
            {year && (
              <button
                onClick={() => onSetYear(null)}
                title="Back to the present day"
                aria-label="Back to the present day"
                className="rounded-md px-1.5 py-1 text-sm text-muted ring-1 ring-line hover:bg-panel hover:text-accent"
              >
                ✕
              </button>
            )}
          </label>
        )}
      </div>
    </div>
  );
}
