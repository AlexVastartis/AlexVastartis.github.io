import { useIsDark } from '../lib/theme';
import { logoLightSrc, logoSrc } from '../lib/logoSrc';

/**
 * A team logo. One PNG pair per program lives in `public/logos/` (downscaled from
 * `assets/logos-src/` by `scripts/optimize-logos.mjs`):
 *   <slug>.png        — for light backgrounds (dark ink / full colour)
 *   <slug>-dark.png   — for dark backgrounds (knocked-out / light wordmark)
 * Dark mode uses the dark asset (bar the `LIGHT_IN_DARK` teams in `logoSrc.ts`)
 * and falls back to the light one if it is missing.
 */
export default function TeamLogo({ slug, className = '' }: { slug: string; className?: string }) {
  const dark = useIsDark();
  const light = logoLightSrc(slug);
  const src = logoSrc(slug, dark);
  return (
    <img
      key={src}
      src={src}
      alt=""
      className={`shrink-0 object-contain ${className}`}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src !== light) img.src = light; // dark asset missing → use the light one
        else img.style.visibility = 'hidden';
      }}
    />
  );
}
