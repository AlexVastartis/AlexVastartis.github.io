import type { ThemeMode } from '../lib/theme';

const OPTS: { value: ThemeMode; glyph: string; title: string }[] = [
  { value: 'system', glyph: '◐', title: 'Match system' },
  { value: 'light', glyph: '☀', title: 'Light' },
  { value: 'dark', glyph: '☾', title: 'Dark' },
];

/** site-wide light/dark control — symbols only, lives at header level */
export default function ThemeToggle({
  mode,
  onSetMode,
}: {
  mode: ThemeMode;
  onSetMode: (m: ThemeMode) => void;
}) {
  return (
    <div className="flex rounded-md ring-1 ring-line" role="group" aria-label="Theme">
      {OPTS.map((o) => (
        <button
          key={o.value}
          onClick={() => onSetMode(o.value)}
          title={o.title}
          aria-label={o.title}
          aria-pressed={mode === o.value}
          className={`px-2 py-1 text-sm leading-none first:rounded-l-md last:rounded-r-md ${
            mode === o.value ? 'bg-accent text-white' : 'text-muted hover:bg-panel'
          }`}
        >
          {o.glyph}
        </button>
      ))}
    </div>
  );
}
