// Thin CollegeFootballData.com API client used by build-data.mjs.
// Docs: https://api.collegefootballdata.com  (free key: https://collegefootballdata.com/key)

const BASE = 'https://api.collegefootballdata.com';
const KEY = process.env.CFBD_API_KEY || '';
const SLEEP_MS = Number(process.env.CFBD_SLEEP_MS || 200);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path, params = {}) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) if (v != null) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${KEY}`, Accept: 'application/json' } });
  if (res.status === 429) {
    await sleep(2000);
    return get(path, params);
  }
  if (!res.ok) throw new Error(`CFBD ${res.status} ${res.statusText} — ${url.pathname}${url.search}`);
  return res.json();
}

export function hasKey() {
  return Boolean(KEY);
}

/** FBS team metadata — official colors + current conference. */
export async function getTeams(year) {
  const rows = await get('/teams/fbs', { year });
  const out = new Map();
  for (const t of rows) {
    out.set(t.school, {
      conference: t.conference || null,
      color: t.color || null,
      altColor: t.alt_color || null,
    });
  }
  return out;
}

/**
 * Weekly AP Top 25 history from `fromYear` to now. Returns
 * Map<school, { weeksPoll, weeksTop10, weeksTop5, weeksNo1 }>.
 */
export async function getApWeeks(fromYear, toYear) {
  const acc = new Map();
  const bump = (school, field) => {
    const e = acc.get(school) || { weeksPoll: 0, weeksTop10: 0, weeksTop5: 0, weeksNo1: 0 };
    e[field] += 1;
    acc.set(school, e);
  };
  for (let year = fromYear; year <= toYear; year += 1) {
    let weeks;
    try {
      weeks = await get('/rankings', { year, seasonType: 'both' });
    } catch (e) {
      console.warn(`  rankings ${year}: ${e.message}`);
      continue;
    }
    for (const wk of weeks) {
      const ap = (wk.polls || []).find((p) => /^AP/i.test(p.poll));
      if (!ap) continue;
      for (const r of ap.ranks) {
        bump(r.school, 'weeksPoll');
        if (r.rank <= 10) bump(r.school, 'weeksTop10');
        if (r.rank <= 5) bump(r.school, 'weeksTop5');
        if (r.rank === 1) bump(r.school, 'weeksNo1');
      }
    }
    await sleep(SLEEP_MS);
  }
  return acc;
}

/** NFL draft picks by college, `fromYear`..now. Map<school,{picks,firstRound}>. */
export async function getDraft(fromYear, toYear) {
  const acc = new Map();
  for (let year = fromYear; year <= toYear; year += 1) {
    let picks;
    try {
      picks = await get('/draft/picks', { year });
    } catch (e) {
      console.warn(`  draft ${year}: ${e.message}`);
      continue;
    }
    for (const p of picks) {
      const school = p.collegeTeam || p.college;
      if (!school) continue;
      const e = acc.get(school) || { picks: 0, firstRound: 0 };
      e.picks += 1;
      if (p.round === 1) e.firstRound += 1;
      acc.set(school, e);
    }
    await sleep(SLEEP_MS);
  }
  return acc;
}
