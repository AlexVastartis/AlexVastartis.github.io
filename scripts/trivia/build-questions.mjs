// Builds Vast Trivia's question bank (public/trivia/q/*.json) from OpenTriviaQA
// (github.com/uberspot/OpenTriviaQA, CC BY-SA 4.0).
//
//   node scripts/trivia/build-questions.mjs [path/to/OpenTriviaQA/categories]
//
// With no path it shallow-clones the dataset into node_modules/.cache. Output is one
// compact file per category: [[id, question, [options...], answerIndex, seedRating], ...]
// Ids are a hash of the normalized question text, so player data survives rebuilds.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
let src = process.argv[2];
if (!src) {
  const cache = path.join(root, 'node_modules/.cache/OpenTriviaQA');
  if (!fs.existsSync(cache)) {
    fs.mkdirSync(path.dirname(cache), { recursive: true });
    execFileSync('git', ['clone', '--depth', '1', 'https://github.com/uberspot/OpenTriviaQA.git', cache], { stdio: 'inherit' });
  }
  src = path.join(cache, 'categories');
}
const out = path.join(root, 'public/trivia/q');

// source file -> category. Order matters: duplicates keep the first (most specific) home.
const FILES = [
  ['animals', 'Animals'], ['geography', 'Geography'], ['history', 'History'],
  ['literature', 'Literature'], ['movies', 'Movies'], ['music', 'Music'],
  ['religion-faith', 'Religion & Myth'], ['science-technology', 'Science & Tech'],
  ['sports', 'Sports'], ['television', 'Television'], ['video-games', 'Video Games'],
  ['celebrities', 'People'], ['people', 'People'], ['humanities', 'Humanities'],
  ['hobbies', 'Hobbies'], ['world', 'World'], ['brain-teasers', 'Brain Teasers'],
  ['entertainment', 'Television'], ['general', 'General'], ['for-kids', 'General'],
  ['newest', 'General'], ['rated', 'General'],
];
const SEED = { 'for-kids': 950, 'brain-teasers': 1250 };

// The dataset dropped apostrophes; put back the unambiguous ones.
const CONTRACTIONS = Object.fromEntries(
  ("don't doesn't didn't isn't wasn't weren't aren't can't couldn't wouldn't shouldn't " +
   "hasn't haven't hadn't won't you're they're we're that's what's who's there's here's " +
   "where's let's i'm i've i'd you've they've we've you'll they'll ain't o'clock")
    .split(' ').map((w) => [w.replace("'", ''), w]),
);
CONTRACTIONS.wont = undefined; // "wont" is a word
CONTRACTIONS.were = undefined;
CONTRACTIONS.well = undefined;
CONTRACTIONS.id = undefined;
CONTRACTIONS.lets = "let's";
const fix = (s) =>
  s.replace(/\s+/g, ' ').trim()
    .replace(/\b([A-Za-z]+)\b/g, (w) => {
      const c = CONTRACTIONS[w.toLowerCase()];
      if (!c) return w;
      if (w === 'Im' || w === 'Ive' || w === 'Id') return c[0].toUpperCase() + c.slice(1);
      return w[0] === w[0].toUpperCase() ? c[0].toUpperCase() + c.slice(1) : c;
    })
    .replace(/\bi'm\b/g, "I'm").replace(/\bi've\b/g, "I've");

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
function hash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}

const seen = new Map(); // norm -> true
const ids = new Set();
const byCat = {};
const drop = { noAnswer: 0, dup: 0, shape: 0, long: 0 };
for (const [file, cat] of FILES) {
  const text = fs.readFileSync(path.join(src, file), 'utf8').replace(/\r/g, '');
  for (const blk of text.split(/^#Q /m).slice(1)) {
    const lines = blk.split('\n');
    const ai = lines.findIndex((l) => l.startsWith('^'));
    if (ai < 0) { drop.noAnswer++; continue; }
    const q = fix(lines.slice(0, ai).join(' '));
    const ans = fix(lines[ai].slice(1));
    const opts = lines.slice(ai + 1).filter((l) => /^[A-H] /.test(l)).map((l) => fix(l.slice(2)));
    const a = opts.indexOf(ans);
    if (a < 0) { drop.noAnswer++; continue; }
    if (opts.length < 2 || opts.length > 5 || new Set(opts.map(norm)).size !== opts.length ||
        opts.some((o) => !o || /\b[A-D] and [A-D]\b/.test(o)) || q.length < 12) { drop.shape++; continue; }
    if (q.length > 360 || opts.some((o) => o.length > 120)) { drop.long++; continue; }
    const n = norm(q) + '|' + norm(ans);
    if (seen.has(n)) { drop.dup++; continue; }
    seen.set(n, true);
    let id = hash(n);
    while (ids.has(id)) id = hash(id + n);
    ids.add(id);
    (byCat[cat] ||= []).push([id, q, opts, a, SEED[file] ?? 1200]);
  }
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const index = [];
let total = 0;
for (const [cat, qs] of Object.entries(byCat).sort((a, b) => b[1].length - a[1].length)) {
  const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  fs.writeFileSync(path.join(out, slug + '.json'), JSON.stringify(qs));
  index.push({ name: cat, slug, count: qs.length });
  total += qs.length;
}
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify({ total, categories: index }));
console.log(`${total} questions in ${index.length} categories`, drop);
for (const c of index) console.log(`  ${c.name.padEnd(16)} ${c.count}`);
