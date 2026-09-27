import { useCallback, useEffect, useState } from 'react';

import { IS_BASKETBALL } from '../config/site';

// the two sites share one origin (football at /, basketball at /basketball/), so their
// saved picks must not share a key — Nebraska is a football pick, not a basketball one
const KEY = IS_BASKETBALL ? 'bbf-favorite-basketball' : 'bbf-favorite';

/** the viewer's favourite program (school name), persisted locally */
export function useFavorite(): [string | null, (school: string | null) => void] {
  const [favorite, setFavorite] = useState<string | null>(() => {
    try {
      return localStorage.getItem(KEY) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (favorite) localStorage.setItem(KEY, favorite);
      else localStorage.removeItem(KEY);
    } catch {
      /* private mode */
    }
  }, [favorite]);

  const set = useCallback((s: string | null) => setFavorite(s || null), []);
  return [favorite, set];
}
