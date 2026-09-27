/**
 * Which site this bundle is: BlueBloodFootball (the default) or BlueBloodBasketball.
 * Chosen at build time by `VITE_SPORT` (`vite --mode basketball` loads `.env.basketball`).
 * Everything else in the app is shared — same routes, same charts, same maths.
 *
 * Basketball reuses the football stat keys (the data pipeline and every chart are keyed
 * on them) and gives them basketball meaning:
 *   nflDraft criterion   → NCAA Tournament
 *   nflDraftPicks        → Sweet 16s
 *   firstRoundPicks      → Final Fours
 *   consensusAA          → consensus first-team All-Americans
 *   unanimousAA          → national players of the year
 * The labels for each live in `src/config/stats.ts`.
 */
export type Sport = 'football' | 'basketball';

export const SPORT: Sport = import.meta.env.VITE_SPORT === 'basketball' ? 'basketball' : 'football';
export const IS_BASKETBALL = SPORT === 'basketball';

interface SiteMeta {
  /** e.g. "BlueBloodFootball.com" */
  name: string;
  /** the wordmark's accented second half */
  wordmark: string;
  tagline: string;
  /** what every program is ranked within — "FBS" / "Division I" */
  field: string;
  /** how many programs make up that field */
  fieldCount: number;
  /** the season the AP poll starts, as shown in copy */
  apSince: string;
  /** the sibling site, for the quick switch in the masthead (the other local dev server
   *  under `npm run dev` / `dev:bb`, so the switch works on your own machine) */
  other: { sport: Sport; label: string; url: string };
}

const FOOTBALL: SiteMeta = {
  name: 'BlueBloodFootball.com',
  wordmark: 'Football',
  tagline: 'A century-long ledger of college football prestige.',
  field: 'FBS',
  fieldCount: 136,
  apSince: '1936',
  other: {
    sport: 'basketball',
    label: 'Basketball',
    // production: the two sites share one origin — basketball lives under /basketball/
    url: import.meta.env.VITE_OTHER_SITE_URL || (import.meta.env.DEV ? 'http://localhost:5175' : '/basketball/'),
  },
};

const BASKETBALL: SiteMeta = {
  name: 'BlueBloodBasketball.com',
  wordmark: 'Basketball',
  tagline: 'A century-long ledger of college basketball prestige.',
  field: 'Division I',
  fieldCount: 365,
  apSince: '1949-50',
  other: {
    sport: 'football',
    label: 'Football',
    url: import.meta.env.VITE_OTHER_SITE_URL || (import.meta.env.DEV ? 'http://localhost:5174' : '/'),
  },
};

export const SITE: SiteMeta = IS_BASKETBALL ? BASKETBALL : FOOTBALL;
