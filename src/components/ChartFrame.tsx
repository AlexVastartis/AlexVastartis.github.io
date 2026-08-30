import { useRef, useState, type ReactNode } from 'react';
import { exportSvgToPng } from '../lib/exportPng';

interface Props {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  /** controls shown to the left of the Save-PNG button (e.g. a lens toggle) */
  actions?: ReactNode;
  filename: string;
  children: ReactNode;
}

export default function ChartFrame({ title, subtitle, footer, actions, filename, children }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    const svg = wrap.current?.querySelector('svg');
    if (!svg) return;
    setBusy(true);
    try {
      await exportSvgToPng(svg as SVGSVGElement, filename);
    } catch (e) {
      console.error(e);
      alert('PNG export failed — see console.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <figure data-map="the chart frame" className="rounded-xl border border-line bg-panel/40 p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        <div data-map="the chart action bar" className="flex shrink-0 items-center gap-3">
          {actions}
          <button
            onClick={save}
            disabled={busy}
            title="Save this chart as a PNG"
            className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium text-muted hover:text-ink disabled:opacity-50"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 1v9m0 0L4.5 6.5M8 10l3.5-3.5M2.5 11.5v2A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5v-2"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {busy ? 'Saving…' : 'PNG'}
          </button>
        </div>
      </div>
      <div ref={wrap} className="rounded-lg bg-paper">
        {children}
      </div>
      {footer && <figcaption className="mt-2 text-xs text-muted">{footer}</figcaption>}
    </figure>
  );
}
