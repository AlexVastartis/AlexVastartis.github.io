/**
 * Build-time feature flags.
 *
 * `import.meta.env.DEV` is `true` under `npm run dev` / `vite preview` and `false`
 * in the production bundle, so anything gated on it ships enabled for local work
 * and disabled on the live site. To force a flag on or off regardless of build,
 * replace its value with a bare `true` / `false`.
 */

/** the "As of" point-in-time year picker + its URL param (`?year=`) and snapshot banner */
export const SHOW_TIMEPOINTS = import.meta.env.DEV;

/** the element-inspection overlay: the "Map" button and its URL param (`?map=1`) */
export const SHOW_ELEMENT_MAP = import.meta.env.DEV;
