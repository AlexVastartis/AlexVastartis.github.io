/**
 * Consolidates the raw per-year CollegeFootballData cache (data/api/cfbd/*.json)
 * into the committed staging layer that build-data.mjs reads WITHOUT ever touching
 * the network:
 *
 *   data/staging/_staging_ap_poll_success.csv   one row per (school, season): weeks ranked / top10 / top5 / #1, final rank
 *   data/staging/_staging_nfl_draft_success.csv one row per (school, season): picks, first-round picks
 *   data/staging/_staging_wins.csv              one row per (school, season): wins/losses/ties, source=cfbd
 *                                               — source=cfbref (pre-1936) and source=manual rows are preserved
 *   data/api/ap-poll.json                       every weekly AP-poll ranking row, full granularity (archive)
 *   data/api/conferences.json                   current conference per school
 *   data/api/_fetch-log.json                    which source files exist and when they were fetched
 *
 * With CFBD_API_KEY set it first fetches any missing years (once); without a key
 * it works from whatever is already cached.
 *
 * Run: npm run data:api
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords, writeRecords } from './lib/csv.mjs';
import { fbsName } from './lib/teams.mjs';
import {
  hasKey, LATEST_SEASON, CURRENT_YEAR,
  getApBySeason, getRecordsBySeason, getDraftBySeason, getConferences,
} from './fetch-cfbd.mjs';

const CONF_YEAR = 2026; // current alignment snapshot

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CFBD = path.join(REPO, 'data/api/cfbd');
const API = path.join(REPO, 'data/api');
const STAGING = path.join(REPO, 'data/staging');
const AP_FROM = 1936;
const DRAFT_FROM = 1936;
const RECORDS_FROM = 1900; // CFBD is effectively empty before this; pre-1936 gets hand-filled anyway

const readJson = (p, fallback) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fallback);

async function main() {
  fs.mkdirSync(CFBD, { recursive: true });

  if (hasKey()) {
    console.log('Ensuring the raw per-year cache is complete …');
    await Promise.all([
      getApBySeason(AP_FROM, LATEST_SEASON),
      getRecordsBySeason(RECORDS_FROM, LATEST_SEASON),
      getDraftBySeason(DRAFT_FROM, CURRENT_YEAR),
    ]);
    const conf = await getConferences(CONF_YEAR);
    fs.writeFileSync(
      path.join(API, 'conferences.json'),
      JSON.stringify({ year: CONF_YEAR, fetchedAt: new Date().toISOString(), bySchool: Object.fromEntries(conf) }, null, 1),
    );
  } else {
    console.log('CFBD_API_KEY not set — consolidating from the existing cache only.');
  }

  const files = fs.readdirSync(CFBD);
  const yearsOf = (tag, cap = LATEST_SEASON) =>
    files
      .map((f) => f.match(new RegExp(`^${tag}-(\\d{4})\\.json$`)))
      .filter(Boolean)
      .map((m) => Number(m[1]))
      .filter((y) => y <= cap)
      .sort((a, b) => a - b);

  /* ---- AP poll: flat rows + per-team/season summary ---- */
  const apRows = [];
  const teams = {};
  const finalNo1 = {};
  const teamRec = (s) => {
    if (!teams[s]) {
      teams[s] = {
        weeksPoll: 0, weeksTop10: 0, weeksTop5: 0, weeksNo1: 0,
        perSeason: {}, perSeasonTop10: {}, perSeasonTop5: {}, perSeasonNo1: {}, finalRank: {},
      };
    }
    return teams[s];
  };
  for (const year of yearsOf('rankings')) {
    const weeks = readJson(path.join(CFBD, `rankings-${year}.json`), []);
    let lastIdx = weeks.length - 1;
    weeks.forEach((wk, i) => {
      if (/post/i.test(wk.seasonType || '')) lastIdx = i;
    });
    weeks.forEach((wk, i) => {
      const ap = (wk.polls || []).find((p) => /^AP\b/i.test(p.poll) || /AP Top 25/i.test(p.poll));
      if (!ap) return;
      for (const r of ap.ranks) {
        const school = fbsName(r.school); // canonicalise; drop non-FBS
        if (!school) continue;
        apRows.push({
          year, week: wk.week, seasonType: wk.seasonType, poll: ap.poll,
          rank: r.rank, school, conference: r.conference,
          points: r.points ?? null, firstPlaceVotes: r.firstPlaceVotes ?? null,
        });
        const e = teamRec(school);
        e.weeksPoll += 1;
        e.perSeason[year] = (e.perSeason[year] || 0) + 1;
        if (r.rank <= 10) { e.weeksTop10 += 1; e.perSeasonTop10[year] = (e.perSeasonTop10[year] || 0) + 1; }
        if (r.rank <= 5) { e.weeksTop5 += 1; e.perSeasonTop5[year] = (e.perSeasonTop5[year] || 0) + 1; }
        if (r.rank === 1) { e.weeksNo1 += 1; e.perSeasonNo1[year] = (e.perSeasonNo1[year] || 0) + 1; }
        if (i === lastIdx) {
          e.finalRank[year] = r.rank;
          if (r.rank === 1) finalNo1[year] = school;
        }
      }
    });
  }
  fs.writeFileSync(path.join(API, 'ap-poll.json'), JSON.stringify(apRows));

  // staging: one row per (school, season)
  fs.mkdirSync(STAGING, { recursive: true });
  {
    const rows = [];
    for (const [school, e] of Object.entries(teams)) {
      const years = new Set([...Object.keys(e.perSeason), ...Object.keys(e.finalRank)].map(Number));
      for (const y of [...years].sort((a, b) => a - b)) {
        rows.push({
          school, season: y,
          weeks_poll: e.perSeason[y] || 0,
          weeks_top10: e.perSeasonTop10[y] || 0,
          weeks_top5: e.perSeasonTop5[y] || 0,
          weeks_no1: e.perSeasonNo1[y] || 0,
          final_rank: e.finalRank[y] ?? '',
        });
      }
    }
    rows.sort((a, b) => a.school.localeCompare(b.school) || a.season - b.season);
    const banner = [
      'One (school, season): weeks in the AP poll / top-10 / top-5 / at #1, and the final rank that year.',
      'Rebuilt from the CFBD cache by `npm run data:api`; hand-editable between refreshes.',
      'final_rank=1 rows define that season’s AP champion.',
    ].map((l) => `# ${l}`).join('\n') + '\n';
    fs.writeFileSync(
      path.join(STAGING, '_staging_ap_poll_success.csv'),
      banner + writeRecords(['school', 'season', 'weeks_poll', 'weeks_top10', 'weeks_top5', 'weeks_no1', 'final_rank'], rows),
    );
  }

  // NOTE: draft data is no longer sourced from CFBD. _staging_nfl_draft_success.csv
  // is owned by `npm run draft`, which counts the pro-football-reference pick sheet
  // (_staging_nfl_draft_picks.csv) and covers the whole 1936-on era, not just 1967+.

  /* ---- season records: rebuild cfbd rows from cache, keep everything else ----
   * CFBD's per-season /records are complete and reliable from 1936. Before that a
   * program's history is carried by either one `source=ncaa` row (an all-time
   * calibration to the NCAA "FBS Records" book, for the ~31 programs it lists) or
   * per-season `source=cfbref` rows (1869-1935 game logs) for everyone else, plus
   * older `source=manual` rows if any remain — all rebuilt by
   * scripts/rebuild-wins-pre1936.mjs. CFBD names are canonicalised to ours and
   * anything that isn't one of the 130 FBS programs is dropped. Only `source=cfbd`
   * rows are regenerated here; `manual` / `cfbref` / `ncaa` rows are authoritative
   * and never touched, so a name-mapping fix takes effect on the next build. The
   * hand-maintained wins_vacated / losses_vacated / vacated_note columns are
   * carried forward by (school, season). */
  const srPath = path.join(STAGING, '_staging_wins.csv');
  const cols = ['school', 'season', 'wins', 'losses', 'ties', 'wins_vacated', 'losses_vacated', 'vacated_note', 'source'];
  const existing = fs.existsSync(srPath) ? readRecords(fs.readFileSync(srPath, 'utf8')) : [];
  const keep = new Map(); // `${school}|${season}` -> row
  const vac = new Map(); // `${school}|${season}` -> { wins_vacated, losses_vacated, vacated_note }
  const AUTHORITATIVE = new Set(['manual', 'cfbref', 'ncaa']);
  for (const r of existing) {
    if (AUTHORITATIVE.has(r.source)) keep.set(`${r.school}|${r.season}`, r);
    if (Number(r.wins_vacated || 0) || Number(r.losses_vacated || 0)) {
      vac.set(`${r.school}|${r.season}`, {
        wins_vacated: r.wins_vacated, losses_vacated: r.losses_vacated, vacated_note: r.vacated_note,
      });
    }
  }
  const RECORDS_TRUST_FROM = 1936;
  let cfbdRows = 0;
  let droppedTeams = new Set();
  for (const year of yearsOf('records')) {
    if (year < RECORDS_TRUST_FROM) continue;
    for (const r of readJson(path.join(CFBD, `records-${year}.json`), [])) {
      if (!r.team || !r.total) continue;
      const school = fbsName(r.team);
      if (!school) { droppedTeams.add(r.team); continue; }
      const k = `${school}|${year}`;
      if (AUTHORITATIVE.has(keep.get(k)?.source)) continue; // never clobber manual / cfbref / ncaa rows
      keep.set(k, {
        school, season: year,
        wins: r.total.wins || 0, losses: r.total.losses || 0, ties: r.total.ties || 0,
        ...(vac.get(k) || {}),
        source: 'cfbd',
      });
      cfbdRows += 1;
    }
  }
  // vacated rows attached to a season CFBD didn't return (keeps the hand data even then)
  for (const [k, v] of vac) {
    if (keep.has(k)) continue;
    const [school, season] = k.split('|');
    keep.set(k, { school, season, wins: 0, losses: 0, ties: 0, ...v, source: 'manual' });
  }
  const sorted = [...keep.values()].sort(
    (a, b) => a.school.localeCompare(b.school) || Number(a.season) - Number(b.season),
  );
  const srBanner = [
    'One (school, season) record. source=cfbd rows are rebuilt by `npm run data:api`;',
    'source=ncaa (all-time calibration to the NCAA "FBS Records" book, ~31 programs),',
    'source=cfbref (1869-1935 game logs, everyone else) and source=manual rows are',
    'authoritative and never touched here — all rebuilt by `npm run wins:pre1936`.',
    'A tie counts as half a win in win %.',
    'wins_vacated / losses_vacated: NCAA-vacated results (Wikipedia "Vacated victories in',
    '  college football") — removed only in the "NCAA official" wins toggle; the trajectory',
    '  and the default view always use the as-played wins/losses/ties above.',
  ].map((l) => `# ${l}`).join('\n') + '\n';
  fs.writeFileSync(srPath, srBanner + writeRecords(cols, sorted));

  /* ---- fetch log ---- */
  const log = files
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: `cfbd/${f}`, bytes: fs.statSync(path.join(CFBD, f)).size }));
  fs.writeFileSync(
    path.join(API, '_fetch-log.json'),
    JSON.stringify({ builtAt: new Date().toISOString(), rawFiles: log.length, files: log }, null, 1),
  );

  console.log(`\n✓ ap-poll.json: ${apRows.length} ranking rows (FBS only, archive)`);
  console.log(`✓ _staging_ap_poll_success.csv: ${Object.keys(teams).length} programs, ${Object.keys(finalNo1).length} AP champions`);
  console.log('· _staging_nfl_draft_success.csv left alone (owned by `npm run draft`)');
  const cfbdCount = sorted.filter((r) => r.source === 'cfbd').length;
  console.log(`✓ _staging_wins.csv: ${sorted.length} rows (${cfbdCount} cfbd 1936+, ${sorted.length - cfbdCount} pre-1936 cfbref/manual)`);
  console.log(`  dropped ${droppedTeams.size} non-FBS teams from CFBD records (e.g. ${[...droppedTeams].slice(0, 6).join(', ')})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
