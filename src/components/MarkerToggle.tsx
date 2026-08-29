import type { MarkerMode } from '../data/useViewState';

/** logo vs. coloured-bubble markers — lives in a chart's action bar */
export default function MarkerToggle({
  marker,
  onSet,
}: {
  marker: MarkerMode;
  onSet: (m: MarkerMode) => void;
}) {
  return (
    <div className="flex rounded-md ring-1 ring-line">
      {(['logo', 'bubble'] as const).map((m) => (
        <button
          key={m}
          onClick={() => onSet(m)}
          title={m === 'logo' ? 'Plot each program as its team logo' : 'Plot each program as a bubble in its primary colour'}
          className={`px-2 py-1 text-xs font-medium capitalize first:rounded-l-md last:rounded-r-md ${
            marker === m ? 'bg-accent text-white' : 'text-muted hover:bg-panel'
          }`}
        >
          {m}s
        </button>
      ))}
    </div>
  );
}
