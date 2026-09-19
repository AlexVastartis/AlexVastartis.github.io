import { useSyncExternalStore } from 'react';

/** live `matchMedia` — re-renders when the query flips (rotate a phone, resize the window) */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', notify);
      return () => mq.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** a phone-sized screen — below Tailwind's `md`. The site sheds the team panel, the As Of
 *  picker, the vacated-wins toggle and the By Decade chart here: there isn't the room. */
export const useIsMobile = () => useMedia('(max-width: 767px)');

/** a real hover (mouse / trackpad). Touch screens fake mouse-move on tap, which leaves the
 *  list's hover cards stuck open — so they're switched off there. */
export const useCanHover = () => useMedia('(hover: hover) and (pointer: fine)');
