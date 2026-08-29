// CollegeFootballData.com API client for build-data.mjs / sync-logos.mjs.
// Docs: https://api.collegefootballdata.com  (free key: https://collegefootballdata.com/key)
//
// Per-year responses are cached under data/snapshots/cfbd/ (gitignored). Historical
// years never change, so only the current season is re-fetched on later runs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.resolve(__dirname, '../data/snapshots/cfbd');

const BASE = 'https://api.collegefootballdata.com';
const KEY = process.env.CFBD_API_KEY || '';
const SLEEP_MS = Number(process.env.CFBD_SLEEP_MS || 190);

const now = new Date();
export const CURRENT_YEAR = now.getFullYear();
// the season currently being played (Aug–Dec = this year, else last year)
export const CURRENT_SEASON = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
// the most recent season with a full set of results — CURRENT_SEASON only once
// it's underway past mid-September, otherwise the prior season
export const LATEST_SEASON =
  now.getMonth() > 8 || (now.getMonth() === 8 && now.getDate() >= 15)
    ? CURRENT_SEASON
    : CURRENT_SEASON - 1;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export function hasKey() {
  return Boolean(KEY);
}

async function apiGet(pathname, params = {}) {
  const url = new URL(BASE + pathname);
  for (const [k, v] of Object.entries(params)) if (v != null) url.searchParams.set(k, v);
  for (let attempt = 0; ; attempt += 1) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${KEY}`, Accept: 'application/json' },
    });
    if (res.status === 429 && attempt < 5) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`CFBD ${res.status} ${res.statusText} — ${url.pathname}${url.search}`);
    return res.json();
  }
}

/** cached per-year fetch; immutable years are read from disk */
async function yearly(tag, year, pathname, params) {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, `${tag}-${year}.json`);
  if (fs.existsSync(file) && year < CURRENT_SEASON) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  const data = await apiGet(pathname, { ...params, year });
  fs.writeFileSync(file, JSON.stringify(data));
  await sleep(SLEEP_MS);
  return data;
}

/** FBS team metadata: conference, official colors, 500px logo URLs, numeric id */
export async function getTeamsMeta(year = CURRENT_SEASON) {
  const rows = await apiGet('/teams/fbs', { year });
  const out = new Map();
  for (const t of rows) {
    const logos = t.logos || [];
    out.set(t.school, {
      id: t.id,
      conference: t.conference || null,
      color: t.color || null,
      altColor: t.alt_color || null,
      logo: logos.find((u) => /\/logos\/500\//.test(u)) || logos[0] || null,
      logoDark: logos.find((u) => /\/logos-dark\/500\//.test(u)) || null,
    });
  }
  return out;
}

/** school -> current conference for a given year (defaults to the upcoming season) */
export async function getConferences(year = CURRENT_YEAR) {
  const meta = await getTeamsMeta(year);
  const out = new Map();
  for (const [school, m] of meta) out.set(school, m.conference);
  return out;
}

/**
 * Weekly AP Top 25 history. Returns Map<school, {
 *   weeksPoll, weeksTop10, weeksTop5, weeksNo1, perSeason: { [year]: weeks }
 * }>
 */
export async function getApBySeason(fromYear, toYear) {
  const acc = new Map();
  const finalNo1 = {}; // year -> school ranked #1 in that season's last poll (AP champion)
  const rec = (s) => {
    let e = acc.get(s);
    if (!e) {
      e = { weeksPoll: 0, weeksTop10: 0, weeksTop5: 0, weeksNo1: 0, perSeason: {}, perSeasonTop10: {}, finalRank: {} };
      acc.set(s, e);
    }
    return e;
  };
  for (let year = fromYear; year <= toYear; year += 1) {
    let weeks;
    try {
      weeks = await yearly('rankings', year, '/rankings', { seasonType: 'both' });
    } catch (e) {
      console.warn(`  rankings ${year}: ${e.message}`);
      continue;
    }
    let lastWeekIdx = -1;
    weeks.forEach((wk, i) => {
      const st = wk.seasonType || '';
      if (/post/i.test(st) || i > lastWeekIdx) lastWeekIdx = i;
    });
    for (let i = 0; i < weeks.length; i += 1) {
      const wk = weeks[i];
      const ap = (wk.polls || []).find((p) => /^AP\b/i.test(p.poll) || /AP Top 25/i.test(p.poll));
      if (!ap) continue;
      for (const r of ap.ranks) {
        const e = rec(r.school);
        e.weeksPoll += 1;
        e.perSeason[year] = (e.perSeason[year] || 0) + 1;
        if (r.rank <= 10) {
          e.weeksTop10 += 1;
          e.perSeasonTop10[year] = (e.perSeasonTop10[year] || 0) + 1;
        }
        if (r.rank <= 5) e.weeksTop5 += 1;
        if (r.rank === 1) e.weeksNo1 += 1;
        if (i === lastWeekIdx) {
          e.finalRank[year] = r.rank;
          if (r.rank === 1) finalNo1[year] = r.school;
        }
      }
    }
  }
  acc.finalNo1 = finalNo1;
  return acc;
}

/** Season records. Map<school, { wins, games, perSeason: { [year]: {wins, games} } }> */
export async function getRecordsBySeason(fromYear, toYear) {
  const acc = new Map();
  for (let year = fromYear; year <= toYear; year += 1) {
    let rows;
    try {
      rows = await yearly('records', year, '/records', {});
    } catch (e) {
      console.warn(`  records ${year}: ${e.message}`);
      continue;
    }
    for (const r of rows) {
      const t = r.total || {};
      const wins = t.wins || 0;
      const games = (t.wins || 0) + (t.losses || 0) + (t.ties || 0);
      if (!r.team) continue;
      let e = acc.get(r.team);
      if (!e) {
        e = { wins: 0, games: 0, perSeason: {} };
        acc.set(r.team, e);
      }
      e.wins += wins;
      e.games += games;
      e.perSeason[year] = { wins, games };
    }
  }
  return acc;
}

/** NFL draft picks by college. Map<school, { picks, firstRound }> */
export async function getDraftBySeason(fromYear, toYear) {
  const acc = new Map();
  for (let year = fromYear; year <= toYear; year += 1) {
    let picks;
    try {
      picks = await yearly('draft', year, '/draft/picks', {});
    } catch (e) {
      console.warn(`  draft ${year}: ${e.message}`);
      continue;
    }
    for (const p of picks) {
      const school = p.collegeTeam || p.college;
      if (!school) continue;
      let e = acc.get(school);
      if (!e) {
        e = { picks: 0, firstRound: 0 };
        acc.set(school, e);
      }
      e.picks += 1;
      if (p.round === 1) e.firstRound += 1;
    }
  }
  return acc;
}
