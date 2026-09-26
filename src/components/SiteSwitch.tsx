import { useLocation } from 'react-router-dom';
import { SITE, SPORT, type Sport } from '../config/site';

const LABEL: Record<Sport, string> = { football: 'Football', basketball: 'Basketball' };
const ICON: Record<Sport, string> = { football: '🏈', basketball: '🏀' };

/**
 * The quick link between the two sites — BlueBloodFootball ⇄ BlueBloodBasketball.
 * The current sport is the lit half; the other half links to the sibling site on the
 * same page (route kept, query dropped — teams and coaches differ between the two).
 */
export default function SiteSwitch() {
  const { pathname } = useLocation();
  const href = `${SITE.other.url.replace(/\/$/, '')}/#${pathname}`;
  const sports: Sport[] = ['football', 'basketball'];
  return (
    <nav
      data-map="the site switch"
      aria-label="Switch sport"
      className="flex items-center rounded-full p-0.5 text-xs font-semibold ring-1 ring-line"
    >
      {sports.map((s) =>
        s === SPORT ? (
          <span
            key={s}
            aria-current="page"
            className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-white"
          >
            <span aria-hidden>{ICON[s]}</span>
            {LABEL[s]}
          </span>
        ) : (
          <a
            key={s}
            href={href}
            title={`Blue Blood ${LABEL[s]} — the same ranking for college ${s}`}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-muted hover:bg-panel hover:text-ink"
          >
            <span aria-hidden>{ICON[s]}</span>
            {LABEL[s]}
          </a>
        ),
      )}
    </nav>
  );
}
