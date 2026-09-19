import type { LogoVariant } from '../lib/logoVariant';

/** temporary A/B control for comparing the current logo against a candidate
 *  redesign — see src/lib/logoVariant.ts. Delete alongside it once decided. */
export default function LogoToggle({
  variant,
  onSetVariant,
}: {
  variant: LogoVariant;
  onSetVariant: (v: LogoVariant) => void;
}) {
  return (
    <div
      data-map="the logo toggle"
      title="Comparing two logo candidates — pick one"
      className="flex overflow-hidden rounded-md text-sm ring-1 ring-line"
    >
      {(['default', 'alt'] as const).map((v) => (
        <button
          key={v}
          onClick={() => onSetVariant(v)}
          aria-pressed={variant === v}
          className={`px-2 py-1 font-medium leading-none ${
            variant === v ? 'bg-accent text-white' : 'text-muted hover:bg-panel'
          }`}
        >
          {v === 'default' ? 'Logo A' : 'Logo B'}
        </button>
      ))}
    </div>
  );
}
