import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
const KEY = 'bbf-theme';

const mq = () => window.matchMedia('(prefers-color-scheme: dark)');

function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

/**
 * Three-way theme. Default is `system`, which live-follows the OS setting; an
 * explicit `light`/`dark` choice is persisted, `system` clears the stored value.
 */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(readMode);
  const [systemDark, setSystemDark] = useState(() => mq().matches);

  useEffect(() => {
    const m = mq();
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);

  const resolved: ResolvedTheme = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    try {
      if (mode === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch {
      /* private mode */
    }
  }, [mode, resolved]);

  const set = useCallback((m: ThemeMode) => setMode(m), []);
  return { mode, resolved, setMode: set };
}

/* ---- lightweight read-only subscription to the resolved theme ---------------
 * `useTheme` owns the `.dark` class on <html>; anything that only needs to KNOW
 * the current theme (e.g. to pick a light/dark logo asset) subscribes here.
 * One MutationObserver total, no matter how many components subscribe. */
const darkListeners = new Set<() => void>();
let classObserver: MutationObserver | null = null;

function subscribeDark(cb: () => void) {
  darkListeners.add(cb);
  if (!classObserver && typeof MutationObserver !== 'undefined') {
    classObserver = new MutationObserver(() => darkListeners.forEach((l) => l()));
    classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  return () => {
    darkListeners.delete(cb);
    if (darkListeners.size === 0 && classObserver) {
      classObserver.disconnect();
      classObserver = null;
    }
  };
}
const getDarkSnapshot = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

/** `true` when the resolved theme is dark. Updates when the theme changes. */
export function useIsDark(): boolean {
  return useSyncExternalStore(subscribeDark, getDarkSnapshot, () => false);
}
