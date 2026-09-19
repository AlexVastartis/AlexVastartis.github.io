import { useCallback, useState } from 'react';

import { SHOW_LOGO_TOGGLE } from '../config/flags';

export type LogoVariant = 'default' | 'alt';
const KEY = 'bbf-logo-variant-2'; // bumped when A/B were swapped, so an old pick doesn't flip

function readVariant(): LogoVariant {
  if (!SHOW_LOGO_TOGGLE) return 'default'; // production: always Logo A
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('logo');
    if (fromUrl === 'alt' || fromUrl === 'default') {
      localStorage.setItem(KEY, fromUrl);
      return fromUrl;
    }
    return localStorage.getItem(KEY) === 'alt' ? 'alt' : 'default';
  } catch {
    return 'default';
  }
}

/**
 * A/B toggle between the two logo designs: 'default' = Logo A, the chosen one
 * (public/logo.png, from assets/logo-src.png); 'alt' = Logo B, the earlier design
 * (public/logo-alt.png, from assets/logo-src-alt.png — see scripts/build-logo.mjs). `?logo=alt` / `?logo=default` in the URL sets and
 * persists the choice; after that it just remembers the last pick. Rip this
 * whole file (and the toggle button in App.tsx) out once a design is chosen.
 */
export function useLogoVariant() {
  const [variant, setVariantState] = useState<LogoVariant>(readVariant);
  const setVariant = useCallback((v: LogoVariant) => {
    setVariantState(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* private mode */
    }
  }, []);
  return [variant, setVariant] as const;
}
