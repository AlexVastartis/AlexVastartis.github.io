const BASE = import.meta.env.BASE_URL;

/**
 * Teams whose standard (light) logo already reads fine on the dark surfaces we
 * use, so we deliberately skip the knocked-out `-dark` asset for them — the
 * full-colour mark is the more familiar one.
 */
const LIGHT_IN_DARK = new Set<string>([
  'alabama',
  'texas',
  'tennessee',
  'clemson',
  'texas-am',
  'auburn',
  'pittsburgh',
  'michigan-st',
  'virginia-tech',
  'west-virginia',
  'utah',
  'north-carolina',
  'oklahoma-st',
  'kentucky',
  'duke',
  'indiana',
  'vanderbilt',
  'temple',
  'north-texas',
  'buffalo',
]);

/** `<slug>.png` — always the light-mode asset. */
export const logoLightSrc = (slug: string) => `${BASE}logos/${slug}.png`;

/** The logo URL for a team given the resolved theme. Dark mode uses
 *  `<slug>-dark.png`, except for the `LIGHT_IN_DARK` teams. */
export function logoSrc(slug: string, dark: boolean): string {
  const useDark = dark && !LIGHT_IN_DARK.has(slug);
  return `${BASE}logos/${slug}${useDark ? '-dark' : ''}.png`;
}
