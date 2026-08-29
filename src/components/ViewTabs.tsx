import { NavLink } from 'react-router-dom';
import { CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import type { CategoryKey } from '../types';
import type { ViewMode } from '../data/useViewState';

export type Subject = 'rating' | CategoryKey;

const CRITERIA = CATEGORY_ORDER.map((k) => ({ key: k as Subject, label: CATEGORIES[k].label, to: `/criteria/${k}` }));

const VIEW_LABEL: Record<ViewMode, string> = {
  list: 'Ranked list',
  plot: 'Logo plot',
  curve: 'Bell curve',
};

interface Props {
  subject: Subject;
  view: ViewMode;
  onSetView: (v: ViewMode) => void;
  search: string;
}

/** the fixed control row: the primary Blue Blood Rating, the five criteria, and
 *  (for a criterion) the three visualisations. Always in the same place. */
export default function ViewTabs({ subject, view, onSetView, search }: Props) {
  // the overall rating has no two-stat scatter and no bell-curve view — list only
  const views: ViewMode[] = subject === 'rating' ? [] : ['list', 'plot', 'curve'];

  const critClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1 text-sm font-medium ring-1 ring-line ${
      isActive ? 'bg-accent text-white' : 'text-muted hover:bg-panel'
    }`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-3">
      <nav className="flex flex-wrap items-center gap-1.5">
        <NavLink
          to={{ pathname: '/', search }}
          end
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
          <NavLink key={s.key} to={{ pathname: s.to, search }} className={critClass}>
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
