import { useCallback, useEffect, useState } from 'react';

const KEY = 'bbf-favorite';

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
