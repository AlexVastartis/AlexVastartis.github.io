/**
 * Build-time feature flags.
 *
 * `import.meta.env.DEV` is `true` under `npm run dev` / `vite preview` and `false`
 * in the production bundle, so anything gated on it ships enabled for local work
 * and disabled on the live site. To force a flag on or off regardless of build,
 * replace its value with a bare `true` / `false`.
 */

/** the "As of" point-in-time year picker + its URL param (`?year=`), the snapshot banner and
 *  the By Decade chart — live in production */
export const SHOW_TIMEPOINTS = true;

/** the element-inspection overlay: the "Map" button and its URL param (`?map=1`) */
export const SHOW_ELEMENT_MAP = import.meta.env.DEV;

/** the Logo A / Logo B comparison switch and its URL param (`?logo=`). Off in production —
 *  the site always shows Logo A there. */
export const SHOW_LOGO_TOGGLE = import.meta.env.DEV;

/** the NCAA official / As played switch. Hidden everywhere for now, but fully built: the
 *  `?wins=asPlayed` URL param still works (and shows a small "As played" chip so the mode
 *  is never invisible). Flip to `true` to bring the switch back. */
export const SHOW_WINS_TOGGLE = false;
