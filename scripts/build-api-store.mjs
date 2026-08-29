/**
 * Consolidates the raw per-year CollegeFootballData cache (data/api/cfbd/*.json)
 * into a committed, self-sufficient store that build-data.mjs reads WITHOUT ever
 * touching the network:
 *
 *   data/api/ap-poll.json          every weekly AP-poll ranking row, full granularity
 *   data/api/ap-poll-summary.json  per-team + per-season weeks ranked / top10 / #1, final ranks
 *   data/api/draft.json            every NFL draft pick (year, round, overall, school, player)
 *   data/season-records.csv        one row per (school, season): wins/losses/ties, source=cfbd
 *                                  — source=manual rows (e.g. pre-1936) are preserved
 *   data/api/_fetch-log.json       which source files exist and when they were fetched
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
  fs.writeFileSync(
    path.join(API, 'ap-poll-summary.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), fromYear: AP_FROM, toYear: LATEST_SEASON, finalNo1, teams }, null, 1),
  );

  /* ---- draft: flat picks (FBS only, canonical names) ---- */
  const draft = [];
  for (const year of yearsOf('draft', CURRENT_YEAR)) {
    for (const p of readJson(path.join(CFBD, `draft-${year}.json`), [])) {
      const school = fbsName(p.collegeTeam || p.college || '');
      if (!school) continue;
      draft.push({
        year, round: p.round ?? null, overall: p.overall ?? null, pick: p.pick ?? null,
        school, player: [p.name, p.firstName && `${p.firstName} ${p.lastName}`].find(Boolean) || null,
        position: p.position ?? null,
      });
    }
  }
  fs.writeFileSync(path.join(API, 'draft.json'), JSON.stringify(draft));

  /* ---- season records: rebuild cfbd rows from cache, keep manual rows ----
   * CFBD's per-season /records are complete and reliable from 1936. Before that
   * a program's history is carried by a hand-entered `source=manual` "through
   * 1935" lump row (season 1935). CFBD names are canonicalised to ours and
   * anything that isn't one of the 130 FBS programs is dropped. cfbd rows are
   * regenerated every run (only `source=manual` rows are authoritative), so a
   * name-mapping fix here takes effect on the next build. */
  const srPath = path.join(REPO, 'data/season-records.csv');
  const cols = ['school', 'season', 'wins', 'losses', 'ties', 'source'];
  const existing = fs.existsSync(srPath) ? readRecords(fs.readFileSync(srPath, 'utf8')) : [];
  const keep = new Map(); // `${school}|${season}` -> row
  for (const r of existing) if (r.source === 'manual') keep.set(`${r.school}|${r.season}`, r);
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
      if (keep.get(k)?.source === 'manual') continue; // never clobber hand-entered rows
      keep.set(k, {
        school, season: year,
        wins: r.total.wins || 0, losses: r.total.losses || 0, ties: r.total.ties || 0,
        source: 'cfbd',
      });
      cfbdRows += 1;
    }
  }
  const sorted = [...keep.values()].sort(
    (a, b) => a.school.localeCompare(b.school) || Number(a.season) - Number(b.season),
  );
  fs.writeFileSync(srPath, writeRecords(cols, sorted));

  /* ---- fetch log ---- */
  const log = files
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: `cfbd/${f}`, bytes: fs.statSync(path.join(CFBD, f)).size }));
  fs.writeFileSync(
    path.join(API, '_fetch-log.json'),
    JSON.stringify({ builtAt: new Date().toISOString(), rawFiles: log.length, files: log }, null, 1),
  );

  console.log(`\n✓ ap-poll.json: ${apRows.length} ranking rows (FBS only)`);
  console.log(`✓ ap-poll-summary.json: ${Object.keys(teams).length} programs, ${Object.keys(finalNo1).length} AP champions`);
  console.log(`✓ draft.json: ${draft.length} picks (FBS only)`);
  const manualRows = sorted.filter((r) => r.source === 'manual').length;
  console.log(`✓ season-records.csv: ${sorted.length} rows (${sorted.length - manualRows} cfbd 1936+, ${manualRows} manual pre-1936)`);
  console.log(`  dropped ${droppedTeams.size} non-FBS teams from CFBD records (e.g. ${[...droppedTeams].slice(0, 6).join(', ')})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
