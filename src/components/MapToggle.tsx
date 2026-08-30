/** site-wide control for the element map (?map=1) — sits next to the theme toggle */
export default function MapToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      data-map="the map toggle"
      onClick={onToggle}
      title={on ? 'Hide the element map' : 'Show the element map — labels every part of the page'}
      aria-label="Toggle the element map"
      aria-pressed={on}
      className={`rounded-md px-2 py-1 text-sm font-medium leading-none ring-1 ring-line ${
        on ? 'bg-accent text-white' : 'text-muted hover:bg-panel'
      }`}
    >
      Map
    </button>
  );
}
