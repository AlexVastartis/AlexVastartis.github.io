import type { Lens } from '../data/useViewState';

const OPTIONS: { value: Lens; label: string }[] = [
  { value: 'plot', label: 'Logo plot' },
  { value: 'curve', label: 'Bell curve' },
];

export default function LensToggle({ value, onChange }: { value: Lens; onChange: (l: Lens) => void }) {
  return (
    <div className="flex rounded-md ring-1 ring-line">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-sm font-medium first:rounded-l-md last:rounded-r-md ${
            value === o.value ? 'bg-accent text-white' : 'hover:bg-panel'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
