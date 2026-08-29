interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}

/** small segmented control for switching between two views of the same data */
export default function LensToggle<T extends string>({ value, onChange, options }: Props<T>) {
  return (
    <div className="flex rounded-md ring-1 ring-line">
      {options.map((o) => (
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
