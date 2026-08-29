import { NavLink } from 'react-router-dom';
import { CATEGORIES, CATEGORY_ORDER } from '../config/stats';
import type { CategoryKey } from '../types';
import type { ViewMode } from '../data/useViewState';

export type Subject = 'rating' | CategoryKey;

const SUBJECTS: { key: Subject; label: string; to: string }[] = [
  { key: 'rating', label: 'Blue Blood Rating', to: '/' },
  ...CATEGORY_ORDER.map((k) => ({ key: k as Subject, label: CATEGORIES[k].label, to: `/criteria/${k}` })),
];

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

/** the two fixed control rows: which subject (6), and which of the 3 visualisations */
export default function ViewTabs({ subject, view, onSetView, search }: Props) {
  // the overall rating has no two-stat scatter, so it offers list + curve only
  const views: ViewMode[] = subject === 'rating' ? ['list', 'curve'] : ['list', 'plot', 'curve'];

  return (
    <div className="flex flex-col gap-2">
      <nav className="flex flex-wrap gap-1.5">
        {SUBJECTS.map((s) => (
          <NavLink
            key={s.key}
            to={{ pathname: s.to, search }}
            end={s.key === 'rating'}
            className={({ isActive }) =>
              `rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-line ${
                isActive ? 'bg-accent text-white' : 'hover:bg-panel'
              }`
            }
          >
            {s.label}
          </NavLink>
        ))}
      </nav>
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
    </div>
  );
}
