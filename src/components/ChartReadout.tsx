interface Row {
  label: string;
  value: string;
}

/**
 * The small hover/highlight card that floats in a corner of a chart. Plain HTML
 * (not SVG) so it gets real type, a soft border, rounded corners and a light
 * backdrop blur — sits above the plot, never redraws it. `pointer-events-none`
 * so it can't swallow a hover on a marker underneath.
 */
export default function ChartReadout({
  team,
  rows,
  corner = 'tl',
}: {
  team: { school: string; conference: string; primary: string };
  rows: Row[];
  corner?: 'tl' | 'tr';
}) {
  const place = corner === 'tr' ? 'right-2 top-2' : 'left-2 top-2';
  return (
    <div
      className={`pointer-events-none absolute ${place} z-10 w-[15rem] max-w-[calc(100%-1rem)] rounded-lg border border-line/70 bg-panel/85 px-2.5 py-1.5 text-[11px] leading-tight shadow-[0_2px_10px_-4px_rgb(0_0_0/0.3)] backdrop-blur-sm`}
    >
      <div className="flex items-center gap-1.5 font-bold text-ink">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: team.primary }} aria-hidden />
        <span className="truncate">{team.school}</span>
        <span className="shrink-0 font-normal text-muted">· {team.conference}</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="mt-0.5 flex items-baseline justify-between gap-2 tabular-nums">
          <span className="truncate text-muted">{r.label}</span>
          <span className="shrink-0 font-medium text-ink">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
