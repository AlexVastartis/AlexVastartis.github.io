/**
 * Writes PROGRAMS.md — a per-program reference for the blurbs, the companion to
 * DYNASTIES.md. Everything here is derived from the site's own staging data
 * (`data/staging/_staging_*`) and the built `public/data/teams.json`, using the
 * same counting rules as `build-data.mjs`, so the examples in a tagline /
 * Standing / Path Forward stay honest.
 *
 *   node scripts/build-program-archive.mjs      (or: npm run archive)
 *
 * Reads only local files. Re-run after `npm run build:data`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords } from './lib/csv.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGING = path.join(REPO, 'data/staging');
const OUT = path.join(REPO, 'PROGRAMS.md');
const stg = (name) => readRecords(fs.readFileSync(path.join(STAGING, `${name}.csv`), 'utf8'));
const cleanName = (s) => String(s || '').replace(/^[\s-]+/, '').trim();

// same knobs build-data.mjs uses
const cfg = Object.fromEntries(stg('_staging_blue_blood_rating').map((r) => [r.key, r.value]));
const TITLE_SELECTORS = new Set((cfg.title_selectors || '').split(/\s+/).filter(Boolean));
const AP_FROM = Number(cfg.ap_from) || 1936;

const CFBD_ALIAS = {
  'NC State': 'North Carolina State', 'App State': 'Appalachian State', Massachusetts: 'UMass',
  Connecticut: 'UConn', 'Louisiana Monroe': 'Louisiana-Monroe', 'UL Monroe': 'Louisiana-Monroe',
  'Southern Mississippi': 'Southern Miss', Miami: 'Miami (FL)', "Hawai'i": 'Hawaii',
  'San José State': 'San Jose State', 'Florida International': 'FIU',
};
const revAlias = (school) => {
  for (const [k, v] of Object.entries(CFBD_ALIAS)) if (v === school) return k;
  return null;
};
/** pick the row-map value for a program, tolerating the CFBD spelling */
const pick = (map, school) => map.get(school) || (revAlias(school) && map.get(revAlias(school))) || null;

const teams = JSON.parse(fs.readFileSync(path.join(REPO, 'public/data/teams.json'), 'utf8')).teams;
const meta = JSON.parse(fs.readFileSync(path.join(REPO, 'public/data/meta.json'), 'utf8'));
const byRank = [...teams].sort((a, b) => a.ratingRank - b.ratingRank);
// tiers in rating order (teams.json is alphabetical; meta has no explicit order)
const TIER_ORDER = [...new Set(byRank.map((t) => t.grouping))];

/* ---------- national + conference titles ---------- */
const champ = stg('_staging_championships');
const titleYears = new Map();
const confTitleYears = new Map();
for (const r of champ) {
  if (r.scope === 'national') {
    if (r.status === 'not-claimed' || !TITLE_SELECTORS.has(r.selector)) continue;
    if (!titleYears.has(r.school)) titleYears.set(r.school, new Set());
    titleYears.get(r.school).add(Number(r.year));
  } else if (r.scope === 'conference') {
    if (!confTitleYears.has(r.school)) confTitleYears.set(r.school, []);
    confTitleYears.get(r.school).push(Number(r.year));
  }
}

/* ---------- Heisman ---------- */
const heis = new Map();
for (const r of stg('_staging_heisman')) {
  if (!r.school || !r.year) continue;
  if (!heis.has(r.school)) heis.set(r.school, []);
  heis.get(r.school).push({ year: Number(r.year), player: cleanName(r.player) });
}

/* ---------- consensus / unanimous All-Americans ---------- */
const aa = new Map();
for (const r of stg('_staging_all_americans')) {
  if (!r.school || !r.year) continue;
  const e = aa.get(r.school) || { c: 0, u: 0, picks: [] };
  const u = /^y/i.test(r.unanimous);
  e.c += 1;
  if (u) e.u += 1;
  e.picks.push({ year: Number(r.year), player: cleanName(r.player), pos: r.pos, u });
  aa.set(r.school, e);
}

/* ---------- AP poll (from AP_FROM) ---------- */
const ap = new Map();
for (const r of stg('_staging_ap_poll_success')) {
  if (!r.school || !r.season) continue;
  const y = Number(r.season);
  const e = ap.get(r.school) || { weeksPoll: 0, top10: 0, top5: 0, no1: 0, seasons: {}, finals: {} };
  e.weeksPoll += Number(r.weeks_poll || 0);
  e.top10 += Number(r.weeks_top10 || 0);
  e.top5 += Number(r.weeks_top5 || 0);
  e.no1 += Number(r.weeks_no1 || 0);
  e.seasons[y] = Number(r.weeks_poll || 0);
  if (r.final_rank !== '' && r.final_rank != null) e.finals[y] = Number(r.final_rank);
  ap.set(r.school, e);
}

/* ---------- NFL draft ---------- */
const draft = new Map();
for (const r of stg('_staging_nfl_draft_success')) {
  if (!r.school || !r.season) continue;
  const e = draft.get(r.school) || { picks: 0, first: 0, perYear: {} };
  const p = Number(r.picks || 0);
  const f = Number(r.first_round_picks || 0);
  e.picks += p;
  e.first += f;
  e.perYear[Number(r.season)] = { p, f };
  draft.set(r.school, e);
}
const DRAFT_MAX = Math.max(...[...draft.values()].flatMap((e) => Object.keys(e.perYear).map(Number)));

/* ---------- wins: per-season + as-played all-time + vacated ---------- */
const wins = new Map();
for (const r of stg('_staging_wins')) {
  if (!r.school) continue;
  const e = wins.get(r.school) || { w: 0, l: 0, t: 0, vw: 0, vl: 0, perSeason: {} };
  const w = Number(r.wins || 0);
  const l = Number(r.losses || 0);
  const t = Number(r.ties || 0);
  e.w += w; e.l += l; e.t += t;
  e.vw += Number(r.wins_vacated || 0);
  e.vl += Number(r.losses_vacated || 0);
  if (Number(r.season) >= AP_FROM) e.perSeason[Number(r.season)] = { w, l, t };
  wins.set(r.school, e);
}

const NOW = Math.max(...[...wins.values()].flatMap((e) => Object.keys(e.perSeason).map(Number)));
const RECENT_FROM = NOW - 9; // last 10 completed seasons

const pctOf = (w, l, t) => {
  const g = w + l + t;
  return g ? (w + 0.5 * t) / g : 0;
};
const fmtPct = (p) => p.toFixed(3).replace(/^0/, '');
const range = (nums) => {
  const s = [...nums].sort((a, b) => a - b);
  return `${s[0]}–${s[s.length - 1]}`;
};

/** longest run of consecutive calendar seasons that were ranked (weeks_poll > 0) */
function longestRankedStreak(seasonsMap) {
  const yrs = Object.keys(seasonsMap).map(Number).filter((y) => seasonsMap[y] > 0).sort((a, b) => a - b);
  let best = 0; let bestEnd = 0; let run = 0; let prev = null;
  for (const y of yrs) {
    run = prev != null && y === prev + 1 ? run + 1 : 1;
    if (run > best) { best = run; bestEnd = y; }
    prev = y;
  }
  return best ? { len: best, from: bestEnd - best + 1, to: bestEnd } : null;
}

/** rolling window (WIN seasons) with the highest win%, needs every season present */
function peakWindow(perSeason, WIN = 10) {
  const yrs = Object.keys(perSeason).map(Number).sort((a, b) => a - b);
  if (yrs.length < WIN) return null;
  let best = null;
  for (let i = 0; i + WIN <= yrs.length; i += 1) {
    const slice = yrs.slice(i, i + WIN);
    if (slice[WIN - 1] - slice[0] !== WIN - 1) continue; // must be consecutive
    let w = 0; let l = 0; let t = 0;
    for (const y of slice) { w += perSeason[y].w; l += perSeason[y].l; t += perSeason[y].t; }
    const p = pctOf(w, l, t);
    if (!best || p > best.p) best = { from: slice[0], to: slice[WIN - 1], w, l, t, p };
  }
  return best;
}

const S = meta && meta.throughSeason ? meta.throughSeason : NOW;
const STAT_LINE = (t) => {
  const s = t.stats; const p = t.pct;
  const c = (k) => Math.round(p[k]);
  return [
    `AP wks ${s.weeksApPoll} (${c('weeksApPoll')})`,
    `top-10 ${s.weeksApTop10} (${c('weeksApTop10')})`,
    `cons.AA ${s.consensusAA} (${c('consensusAA')})`,
    `unan.AA ${s.unanimousAA} (${c('unanimousAA')})`,
    `natl ${s.nationalTitles} (${c('nationalTitles')})`,
    `conf ${s.conferenceTitles} (${c('conferenceTitles')})`,
    `draft ${s.nflDraftPicks} (${c('nflDraftPicks')})`,
    `1st-rnd ${s.firstRoundPicks} (${c('firstRoundPicks')})`,
    `wins ${s.allTimeWins} (${c('allTimeWins')})`,
    `win% ${fmtPct(s.winPct)} (${c('winPct')})`,
  ].join(' · ');
};

function capsule(t) {
  const L = [];
  const w = pick(wins, t.school) || { w: 0, l: 0, t: 0, vw: 0, vl: 0, perSeason: {} };
  const a = pick(ap, t.school);
  const d = pick(draft, t.school);
  const aStat = pick(aa, t.school);
  const tyrs = [...(pick(titleYears, t.school) || [])].sort((x, y) => x - y);
  const cyrs = pick(confTitleYears, t.school) || [];
  const hs = (pick(heis, t.school) || []).sort((x, y) => x.year - y.year);

  L.push(
    `#### ${t.ratingRank} · ${t.school} — ${t.conference} · ${t.grouping} · ${t.rating.toFixed(1)} rating`
    + (t.formerFcs ? ' · former FCS' : ''),
  );
  L.push('');

  const apPlayed = `${w.w}–${w.l}${w.t ? `–${w.t}` : ''} (${fmtPct(pctOf(w.w, w.l, w.t))})`;
  let allTime = `**All-time (through ${S}):** ${apPlayed} as played`;
  if (w.vw + w.vl > 0) allTime += ` · ${w.vw}–${w.vl} later vacated (site default removes these)`;
  allTime += ` · site rating **#${t.ratingRank} of ${teams.length}**`;
  L.push(allTime);

  L.push(`**The ten:** ${STAT_LINE(t)}`);

  L.push(
    tyrs.length
      ? `**National titles (${tyrs.length}):** ${tyrs.join(', ')}`
      : `**National titles:** ${t.stats.nationalTitles || 'none'}${t.stats.nationalTitles ? ' (from summary totals — years not itemised in staging)' : ''}`,
  );

  if (cyrs.length) {
    L.push(`**Conference titles (${cyrs.length}):** most recent ${Math.max(...cyrs)} · first ${Math.min(...cyrs)}`);
  } else {
    L.push(`**Conference titles:** ${t.stats.conferenceTitles || 'none'}${t.stats.conferenceTitles ? ' (summary total — years not itemised)' : ''}`);
  }

  L.push(
    hs.length
      ? `**Heisman (${hs.length}):** ${hs.map((h) => `${h.year} ${h.player}`).join(' · ')}`
      : `**Heisman:** none`,
  );

  if (aStat) {
    const recent = aStat.picks.sort((x, y) => y.year - x.year).slice(0, 4).reverse()
      .map((x) => `${x.year} ${x.player} (${x.pos}${x.u ? ', unan.' : ''})`);
    L.push(`**All-Americans:** ${aStat.c} consensus, ${aStat.u} unanimous · latest: ${recent.join('; ')}`);
  } else {
    L.push(`**All-Americans:** ${t.stats.consensusAA} consensus, ${t.stats.unanimousAA} unanimous (summary totals)`);
  }

  if (a) {
    const streak = longestRankedStreak(a.seasons);
    const rankedYrs = Object.keys(a.seasons).map(Number).filter((y) => a.seasons[y] > 0);
    const firstRanked = rankedYrs.length ? Math.min(...rankedYrs) : null;
    const finalsArr = Object.entries(a.finals).map(([y, r]) => ({ y: Number(y), r }));
    const no1Finishes = finalsArr.filter((x) => x.r === 1).map((x) => x.y).sort((p, q) => p - q);
    const top5Finishes = finalsArr.filter((x) => x.r >= 1 && x.r <= 5).length;
    const best = finalsArr.filter((x) => x.r >= 1).sort((p, q) => p.r - q.r || p.y - q.y)[0];
    const bits = [
      `${a.weeksPoll} weeks ranked / ${a.top10} top-10 / ${a.top5} top-5 / ${a.no1} at #1`,
      firstRanked ? `first ranked ${firstRanked}` : null,
      `${no1Finishes.length} AP-#1 finish${no1Finishes.length === 1 ? '' : 'es'}${no1Finishes.length ? ` (${no1Finishes.join(', ')})` : ''}`,
      `${top5Finishes} top-5 finishes`,
      streak ? `longest ranked streak ${streak.len} yrs (${streak.from}–${streak.to})` : null,
      best ? `best finish AP #${best.r} (${best.y})` : null,
    ].filter(Boolean);
    L.push(`**AP poll (${AP_FROM}–${S}):** ${bits.join(' · ')}`);
  }

  if (d) {
    let rp = 0; let rf = 0;
    for (let y = DRAFT_MAX - 9; y <= DRAFT_MAX; y += 1) { const e = d.perYear[y]; if (e) { rp += e.p; rf += e.f; } }
    L.push(`**NFL draft (through ${DRAFT_MAX}):** ${d.picks} picks, ${d.first} first-round · last 10 drafts: ${rp} picks, ${rf} first-round`);
  }

  const peak = peakWindow(w.perSeason, 10);
  if (peak) {
    L.push(`**Peak 10-yr stretch:** ${peak.from}–${peak.to} — ${peak.w}–${peak.l}${peak.t ? `–${peak.t}` : ''} (${fmtPct(peak.p)})`);
  }

  // recent decade
  let rw = 0; let rl = 0; let rt = 0;
  for (let y = RECENT_FROM; y <= NOW; y += 1) { const e = w.perSeason[y]; if (e) { rw += e.w; rl += e.l; rt += e.t; } }
  const recentTitles = tyrs.filter((y) => y >= RECENT_FROM).length;
  const recentApWeeks = a ? Object.entries(a.seasons).filter(([y]) => Number(y) >= RECENT_FROM).reduce((n, [, v]) => n + v, 0) : null;
  const rd = [`${rw}–${rl}${rt ? `–${rt}` : ''} (${fmtPct(pctOf(rw, rl, rt))})`, `${recentTitles} national title${recentTitles === 1 ? '' : 's'}`];
  if (recentApWeeks != null) rd.push(`${recentApWeeks} AP weeks`);
  L.push(`**Recent decade (${RECENT_FROM}–${NOW}):** ${rd.join(' · ')}`);

  const moves = (t.trend.movers || []).map((m) => `${m.label} ${m.dir === 'up' ? '↑' : m.dir === 'down' ? '↓' : '→'}`);
  const tr = t.trend;
  if (tr.insufficient) {
    L.push(`**Trend:** n/a — only ${tr.totalSeasons} seasons on record (needs 30+ to chart)`);
  } else {
    const r1 = (n) => Number(n).toFixed(1);
    const ratingBit = tr.recentRating != null
      ? `${tr.recentRange} rating ${r1(tr.recentRating)}/100 vs. all-time ${r1(tr.baselineRating)} (Δ ${tr.delta > 0 ? '+' : ''}${r1(tr.delta)})`
      : `recent ${tr.recentSeasons} seasons (${tr.recentRange}) vs. all ${tr.totalSeasons}`;
    L.push(
      `**Trend:** ${tr.dir}${tr.strong ? ' (emphatic)' : ''} — ${ratingBit}`
      + (moves.length ? ` · biggest moves: ${moves.join(', ')}` : ''),
    );
  }
  L.push('');
  return L.join('\n');
}

/* ---------- master table ---------- */
const tableRows = byRank.map((t) => {
  const trendGlyph = t.trend.insufficient ? '·'
    : (t.trend.dir === 'up' ? '↗' : t.trend.dir === 'down' ? '↘' : '→')
      + (t.trend.strong ? (t.trend.dir === 'up' ? '↗' : '↘') : '');
  return `| ${t.ratingRank} | ${t.school}${t.formerFcs ? ' †' : ''} | ${t.conference} | ${t.grouping} | ${t.rating.toFixed(1)} | ${t.stats.allTimeWins} | ${fmtPct(t.stats.winPct)} | ${t.stats.nationalTitles} | ${t.stats.conferenceTitles} | ${(pick(heis, t.school) || []).length} | ${t.stats.consensusAA} | ${t.stats.unanimousAA} | ${t.stats.nflDraftPicks} | ${t.stats.firstRoundPicks} | ${t.stats.weeksApPoll} | ${t.stats.weeksApTop10} | ${trendGlyph} |`;
});

/* ---------- assemble ---------- */
const out = [];
out.push('# Program archive — reference for the blurbs');
out.push('');
out.push('The companion to `DYNASTIES.md`. One capsule per program, so a tagline,');
out.push('Standing or Path Forward can reach for a real number instead of a vibe.');
out.push('');
out.push('**Generated** — `node scripts/build-program-archive.mjs` (`npm run archive`).');
out.push('Do not hand-edit; edit the staging data and re-run.');
out.push('');
out.push('## Sourcing & caveats');
out.push('');
out.push('- All figures come from `data/staging/_staging_*` and the built');
out.push('  `public/data/teams.json`, using the same counting rules as `build-data.mjs`.');
out.push(`- **AP poll** data is ${AP_FROM}–${S}; **NFL draft** is through ${DRAFT_MAX} (the`);
out.push('  draft that follows each season); **consensus All-America** is full history,');
out.push('  **unanimous** flagged from 1924.');
out.push('- **National-title years** use the site selectors —');
out.push(`  \`${cfg.title_selectors}\` — with \`claim\` / \`not-claimed\` excluded. A year counts once.`);
out.push('- **Wins in a capsule** are shown *as played* (later-vacated games included);');
out.push('  the site’s default "NCAA official" view removes vacated seasons, noted per');
out.push('  program where non-zero. The 10-stat line uses the site (official) numbers.');
out.push('- Pre-1936 wins: the ~31 programs the NCAA "FBS Records" book lists are');
out.push('  calibrated to it; everyone else is summed from College Football Reference');
out.push('  game logs, which thin out before ~1905 — so those all-time totals understate');
out.push('  the earliest era.');
out.push(`- Percentiles are within the ${teams.length}-team FBS set this site tracks.`);
out.push('');
out.push('## Master table');
out.push('');
out.push('Sorted by Blue Blood Rating. Wins / Win% are the site’s "NCAA official" numbers');
out.push('(vacated seasons removed); AP wks / top-10 wks are all-time weeks in the poll.');
out.push('');
out.push('| # | Program | Conf | Tier | Rating | Wins | Win% | Natl | Conf | Heis | Cons.AA | Unan.AA | Draft | 1st | AP wks | Top-10 | Trend |');
out.push('| --: | --- | --- | --- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | :-: |');
out.push(...tableRows);
out.push('');
out.push('† spent most of its modern history in FCS / lower — cumulative totals reflect that.');
out.push('');
out.push('## Capsules');
out.push('');
for (const tier of TIER_ORDER) {
  const members = byRank.filter((t) => t.grouping === tier);
  if (!members.length) continue;
  out.push(`### ${tier}`);
  out.push('');
  for (const t of members) out.push(capsule(t));
}

fs.writeFileSync(OUT, `${out.join('\n').replace(/\n{3,}/g, '\n\n')}\n`);
console.log(`wrote ${path.relative(REPO, OUT)} — ${teams.length} programs, ${out.length} lines`);
