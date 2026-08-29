import { useRef, useState, type ReactNode } from 'react';
import { exportSvgToPng } from '../lib/exportPng';

interface Props {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  filename: string;
  children: ReactNode;
}

export default function ChartFrame({ title, subtitle, footer, filename, children }: Props) {
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
    <figure className="rounded-xl border border-line bg-panel/40 p-4 sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        <button
          onClick={save}
          disabled={busy}
          className="shrink-0 rounded-md border border-line px-3 py-1.5 text-sm font-medium hover:bg-panel disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save PNG'}
        </button>
      </div>
      <div ref={wrap} className="rounded-lg bg-paper">
        {children}
      </div>
      {footer && <figcaption className="mt-2 text-xs text-muted">{footer}</figcaption>}
    </figure>
  );
}
