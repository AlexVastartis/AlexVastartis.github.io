import { useEffect, useRef, useState } from 'react';
import { MAP_BLURB } from './registry';

/**
 * The element map (?map=1). While on, it scans the page for `data-map` regions,
 * outlines the first visible instance of each, and pins a labelled chip in the
 * nearest page gutter with a leader line back to the element. The chip's title is
 * the term to use when asking for an edit.
 */

interface Raw {
  term: string;
  r: DOMRect;
}
interface Placed {
  term: string;
  blurb: string;
  x: number;
  y: number;
  w: number;
  h: number;
  chipX: number;
  chipY: number;
  side: 'left' | 'right';
}

const MIN_WIDTH = 1024;
const GUTTER_W = 196;
const CHIP_H = 24;
const GAP = 6;
const PAD = 8;

export default function MapLayer({ on }: { on: boolean }) {
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [narrow, setNarrow] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const sig = useRef('');

  useEffect(() => {
    if (!on) {
      setPlaced([]);
      sig.current = '';
      return;
    }
    let raf = 0;

    const measure = () => {
      raf = 0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (vw < MIN_WIDTH) {
        setNarrow(true);
        if (sig.current !== 'narrow') {
          sig.current = 'narrow';
          setPlaced([]);
        }
        return;
      }
      setNarrow(false);

      const seen = new Set<string>();
      const raw: Raw[] = [];
      document.querySelectorAll<HTMLElement>('[data-map]').forEach((el) => {
        const term = el.dataset.map;
        if (!term || seen.has(term)) return;
        const r = el.getBoundingClientRect();
        if (r.width < 1 && r.height < 1) return; // not rendered
        if (r.bottom < 0 || r.top > vh) return; // fully off-screen
        seen.add(term);
        raw.push({ term, r });
      });

      const nextSig =
        raw
          .map(
            (x) =>
              `${x.term}:${Math.round(x.r.left)},${Math.round(x.r.top)},${Math.round(
                x.r.width,
              )},${Math.round(x.r.height)}`,
          )
          .join('|') + `#${vw}x${vh}`;
      if (nextSig === sig.current) return;
      sig.current = nextSig;

      const left: Raw[] = [];
      const right: Raw[] = [];
      raw.forEach((x) => {
        const mid = x.r.left + x.r.width / 2;
        (mid < vw / 2 ? left : right).push(x);
      });

      const pack = (list: Raw[], side: 'left' | 'right'): Placed[] => {
        const chipX = side === 'left' ? PAD : vw - PAD - GUTTER_W;
        let cursor = PAD;
        return [...list]
          .sort((a, b) => a.r.top - b.r.top)
          .map(({ term, r }) => {
            const want = r.top + r.height / 2 - CHIP_H / 2;
            const chipY = Math.max(cursor, Math.min(want, vh - CHIP_H - PAD));
            cursor = chipY + CHIP_H + GAP;
            return {
              term,
              blurb: MAP_BLURB[term] ?? '',
              x: r.left,
              y: r.top,
              w: r.width,
              h: r.height,
              chipX,
              chipY,
              side,
            };
          });
      };

      setPlaced([...pack(left, 'left'), ...pack(right, 'right')]);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const iv = window.setInterval(schedule, 400);
    return () => {
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      window.clearInterval(iv);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [on]);

  if (!on) return null;

  if (narrow) {
    return (
      <div className="map-notice">
        The element map needs a window at least {MIN_WIDTH}px wide.
      </div>
    );
  }

  return (
    <div className="map-root" aria-hidden>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {placed.map((p) => {
          const cx = p.side === 'left' ? p.chipX + GUTTER_W : p.chipX;
          const cy = p.chipY + CHIP_H / 2;
          const ex = p.side === 'left' ? p.x : p.x + p.w;
          const ey = Math.max(p.y + 2, Math.min(p.y + p.h / 2, p.y + p.h - 2));
          const midX = (cx + ex) / 2;
          return (
            <g key={p.term} style={{ opacity: hover && hover !== p.term ? 0.2 : 1 }}>
              <path
                className="map-lead"
                d={`M${cx} ${cy} C ${midX} ${cy}, ${midX} ${ey}, ${ex} ${ey}`}
              />
              <circle className="map-lead-dot" cx={ex} cy={ey} r={hover === p.term ? 3.5 : 2.5} />
            </g>
          );
        })}
      </svg>

      {placed.map((p) => (
        <div
          key={`o-${p.term}`}
          className="map-outline"
          style={{
            left: p.x,
            top: p.y,
            width: p.w,
            height: p.h,
            opacity: hover && hover !== p.term ? 0.15 : 1,
          }}
        />
      ))}

      {placed.map((p) => (
        <div
          key={`c-${p.term}`}
          className="map-chip"
          style={{ left: p.chipX, top: p.chipY }}
          onMouseEnter={() => setHover(p.term)}
          onMouseLeave={() => setHover((h) => (h === p.term ? null : h))}
        >
          <span className="map-term">{p.term}</span>
          {p.blurb && <span className="map-blurb">{p.blurb}</span>}
        </div>
      ))}
    </div>
  );
}
