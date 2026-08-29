import { NavLink } from 'react-router-dom';
import { CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import type { CategoryKey } from '../types';
import type { ViewMode } from '../data/useViewState';

export type Subject = 'rating' | CategoryKey;

const CRITERIA = CATEGORY_ORDER.map((k) => ({
  key: k as Subject,
  label: CATEGORIES[k].label,
  to: `/criteria/${k}`,
  hint: CATEGORIES[k].blurb,
}));

const VIEW_LABEL: Record<ViewMode, string> = {
  list: 'List View',
  plot: 'Chart View',
  curve: 'Bell Curve',
};
const VIEW_HINT: Record<ViewMode, string> = {
  list: 'A sortable ranked list of every program on this criterion',
  plot: 'Each program plotted as a logo on the criterion’s two stats',
  curve: 'Every program placed on the normal curve by its criterion score',
};

interface Props {
  subject: Subject;
  view: ViewMode;
  onSetView: (v: ViewMode) => void;
  search: string;
  notesOn: boolean;
  onToggleNotes: () => void;
}

/** the fixed control row: the primary Blue Blood Rating, the five criteria, and
 *  (for a criterion) the three visualisations. Always in the same place. */
export default function ViewTabs({ subject, view, onSetView, search, notesOn, onToggleNotes }: Props) {
  // the overall rating has no two-stat scatter and no bell-curve view — list only
  const views: ViewMode[] = subject === 'rating' ? [] : ['list', 'plot', 'curve'];

  const critClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1 text-sm font-medium ring-1 ring-line ${
      isActive ? 'bg-accent text-white' : 'text-muted hover:bg-panel'
    }`;

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-3">
      {/* margin toggle for the hand-drawn gap / range notes — lives out in the
          left margin like the notes; never shifts the Blue Blood Rating tab */}
      <button
        onClick={onToggleNotes}
        title={notesOn ? 'Hide margin notes' : 'Show margin notes'}
        aria-label={notesOn ? 'Hide margin notes' : 'Show margin notes'}
        aria-pressed={notesOn}
        className={`absolute left-0 top-1 hidden -translate-x-[calc(100%+0.5rem)] rounded font-hand text-lg leading-none 2xl:block ${
          notesOn ? 'text-accent' : 'text-muted/60 hover:text-muted'
        }`}
      >
        ✎
      </button>

      <nav className="flex flex-wrap items-center gap-1.5">
        <NavLink
          to={{ pathname: '/', search }}
          end
          title="The overall Blue Blood Rating — mean of the 8 middle stat percentiles"
          className={({ isActive }) =>
            `rounded-lg px-3.5 py-1.5 text-[15px] font-bold tracking-tight ${
              isActive
                ? 'bg-accent text-white shadow-sm'
                : 'text-ink ring-2 ring-accent/40 hover:bg-accent/10'
            }`
          }
        >
          Blue Blood Rating
        </NavLink>
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden />
        {CRITERIA.map((s) => (
          <NavLink key={s.key} to={{ pathname: s.to, search }} title={s.hint} className={critClass}>
            {s.label}
          </NavLink>
        ))}
      </nav>

      {views.length > 0 && (
        <div className="flex w-fit rounded-md ring-1 ring-line">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => onSetView(v)}
              title={VIEW_HINT[v]}
              className={`px-3 py-1.5 text-sm font-medium first:rounded-l-md last:rounded-r-md ${
                view === v ? 'bg-accent text-white' : 'hover:bg-panel'
              }`}
            >
              {VIEW_LABEL[v]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
