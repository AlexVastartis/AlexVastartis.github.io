/* Vast Trivia — plain JS, no build step.
 *
 * Rating model
 *   Players and questions both carry an Elo rating. Every answer is a "game" between
 *   the player and the question. Because a multiple-choice question can be guessed,
 *   the expected score includes a guessing floor g = 1 / (number of options):
 *       E = g + (1 - g) / (1 + 10^((Rq - Rp) / 400))
 *   Correct: player gains K·(1 − E), question loses the same scale of points.
 *   Wrong:   player loses K·E, question gains.
 *   New players and new questions move fast (high K) and settle as they accumulate
 *   answers, so question difficulty sorts itself as people play.
 *
 * Question selection
 *   Each turn targets the player's rating (plus a little noise) and picks the closest
 *   unseen question from a random sample of the chosen categories.
 */
(function () {
  'use strict';

  const START = 1200;
  const HIST_CAP = 4000;
  const MISS_CAP = 40;
  const SAMPLE = 350;
  const KEYS = ['1', '2', '3', '4', '5'];

  // Vast Family (../family.js), set up at boot below
  const FAM = window.FAM || null;
  let famReady = false;
  let famSyncedAt = 0;
  const famGames = [];       // filled from q/index.json; the family "hide" picker lists these
  function famPush() { if (famReady) FAM.push(); }

  // ---------------------------------------------------------------- storage
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast('Could not save — browser storage is full or blocked.'); } },
  };

  let players = store.get('vt-players', []);
  let currentId = store.get('vt-current', null);
  let qstate = store.get('vt-q', {});        // id -> [rating, answers]
  let flags = new Set(store.get('vt-flags', []));
  let settings = Object.assign({ timer: 0, theme: 'system', cats: [] }, store.get('vt-settings', {}));

  const saveAll = () => {
    store.set('vt-players', players);
    store.set('vt-current', currentId);
    store.set('vt-q', qstate);
    store.set('vt-flags', [...flags]);
    famPush();
  };
  const saveSettings = () => store.set('vt-settings', settings);

  function newPlayer(name) {
    return {
      id: Math.random().toString(36).slice(2, 10),
      name: name, r: START, peak: START, games: 0, correct: 0, streak: 0, best: 0,
      created: Date.now(), hist: [], seen: [], cats: {}, misses: [],
    };
  }
  function me() { return players.find((p) => p.id === currentId); }
  if (!players.length) { players.push(newPlayer('Player 1')); }
  if (!me()) currentId = players[0].id;
  saveAll();

  // seen ids per player, as a Set (stored as an array)
  const seenSets = new Map();
  function seenOf(p) {
    if (!seenSets.has(p.id)) seenSets.set(p.id, new Set(p.seen));
    return seenSets.get(p.id);
  }

  // ---------------------------------------------------------------- data
  let index = null;
  const pools = {};          // slug -> array of questions
  const loading = {};        // slug -> promise
  const byId = new Map();    // id -> question tuple (for loaded pools)
  const catOf = new Map();   // id -> category name
  const slugOf = new Map();  // id -> category slug

  async function loadIndex() {
    const res = await fetch('q/index.json');
    if (!res.ok) throw new Error('index ' + res.status);
    index = await res.json();
  }
  function loadPool(slug) {
    if (pools[slug]) return Promise.resolve(pools[slug]);
    if (!loading[slug]) {
      const name = index.categories.find((c) => c.slug === slug).name;
      loading[slug] = fetch('q/' + slug + '.json').then((r) => {
        if (!r.ok) throw new Error(slug + ' ' + r.status);
        return r.json();
      }).then((qs) => {
        pools[slug] = qs;
        for (const q of qs) { byId.set(q[0], q); catOf.set(q[0], name); slugOf.set(q[0], slug); }
        return qs;
      }).catch((e) => { delete loading[slug]; throw e; });
    }
    return loading[slug];
  }

  // ---------------------------------------------------------------- family
  // Vast Family (../family.js): one shared leaderboard for the whole family, and categories a
  // parent hid in the family rules are left out of play and the category picker.
  const famHidden = (slug) => !!(FAM && slug && FAM.isHidden(slug));
  const visibleCats = () => index.categories.filter((c) => !famHidden(c.slug));
  const selectedCats = () => settings.cats.filter((s) => visibleCats().some((c) => c.slug === s));

  // the chosen categories, or every shown category when none is chosen (or all chosen are hidden)
  const activeSlugs = () => { const sel = selectedCats(); return sel.length ? sel : visibleCats().map((c) => c.slug); };

  // ---------------------------------------------------------------- rating
  const qRating = (q) => (qstate[q[0]] ? qstate[q[0]][0] : q[4]);
  const qCount = (q) => (qstate[q[0]] ? qstate[q[0]][1] : 0);
  function expected(rp, rq, nOpts) {
    const g = 1 / nOpts;
    return g + (1 - g) / (1 + Math.pow(10, (rq - rp) / 400));
  }
  const kPlayer = (p) => (p.games < 20 ? 40 : p.games < 100 ? 28 : p.games < 400 ? 22 : 18);
  const kQuestion = (n) => Math.max(10, 64 / Math.sqrt(1 + n));

  function tier(r) {
    if (r < 1000) return 'Easy';
    if (r < 1250) return 'Medium';
    if (r < 1500) return 'Hard';
    return 'Expert';
  }

  // ---------------------------------------------------------------- pick
  function gauss() { return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random()); }

  // Choose a category weighted by its size, so "All" draws evenly across every question.
  function pickSlug() {
    const slugs = activeSlugs();
    const cats = index.categories.filter((c) => slugs.includes(c.slug));
    if (!cats.length) return null;
    let i = Math.random() * cats.reduce((n, c) => n + c.count, 0);
    for (const c of cats) { if (i < c.count) return c.slug; i -= c.count; }
    return cats[cats.length - 1].slug;
  }

  function pickQuestion(p, slug) {
    const pool = pools[slug];
    const seen = seenOf(p);
    const target = p.r + gauss() * 90;
    let best = null; let bestD = Infinity;
    for (let tries = 0; tries < SAMPLE * 4 && tries < pool.length * 3; tries++) {
      const q = pool[Math.floor(Math.random() * pool.length)];
      if (seen.has(q[0]) || flags.has(q[0])) continue;
      const d = Math.abs(qRating(q) - target) + Math.random() * 15;
      if (d < bestD) { best = q; bestD = d; }
      if (tries >= SAMPLE && best) break;
    }
    if (!best) {
      if (!pool.some((q) => !flags.has(q[0]))) return null;
      // every question in this category has been seen: start it over
      for (const q of pool) seen.delete(q[0]);
      p.seen = [...seen];
      return pickQuestion(p, slug);
    }
    return best;
  }

  // ---------------------------------------------------------------- play state
  const session = { n: 0, c: 0, delta: 0 };
  let cur = null;           // { q, answered, choice, delta, before, after, qBefore, t0 }
  let timerId = null;
  let filtersOpen = false;

  function answer(choice) {
    if (!cur || cur.answered) return;
    stopTimer();
    const p = me();
    const q = cur.q;
    const ok = choice === q[3];
    const rp = p.r; const rq = qRating(q); const n = qCount(q);
    const E = expected(rp, rq, q[2].length);
    const S = ok ? 1 : 0;
    const dp = Math.round(kPlayer(p) * (S - E));
    const dq = kQuestion(n) * (E - S);

    p.r = rp + dp;
    p.peak = Math.max(p.peak, p.r);
    p.games++;
    if (ok) { p.correct++; p.streak++; p.best = Math.max(p.best, p.streak); } else { p.streak = 0; }
    const cat = catOf.get(q[0]);
    const cs = p.cats[cat] || (p.cats[cat] = [0, 0, 0]);  // answered, correct, net rating
    cs[0]++; if (ok) cs[1]++; cs[2] += dp;
    p.hist.push([Date.now(), q[0], S, dp, p.r]);
    if (p.hist.length > HIST_CAP) p.hist.splice(0, p.hist.length - HIST_CAP);
    if (!ok) {
      p.misses.unshift([q[1], q[2][q[3]], choice >= 0 ? q[2][choice] : null, cat]);
      p.misses.length = Math.min(p.misses.length, MISS_CAP);
    }
    seenOf(p).add(q[0]);
    p.seen.push(q[0]);
    qstate[q[0]] = [Math.round((rq + dq) * 10) / 10, n + 1];

    session.n++; if (ok) session.c++; session.delta += dp;
    Object.assign(cur, { answered: true, choice, ok, delta: dp, before: rp, after: p.r, qBefore: rq, qAfter: qstate[q[0]][0] });
    saveAll();
    renderPlay();
  }

  // Remove a bad question. If it was just answered, the rating change is undone.
  function flagCurrent() {
    if (!cur) return;
    const p = me(); const q = cur.q;
    flags.add(q[0]);
    if (cur.answered) {
      p.r = cur.before;
      p.games--;
      if (cur.ok) { p.correct--; p.streak = Math.max(0, p.streak - 1); }
      const cs = p.cats[catOf.get(q[0])];
      if (cs) { cs[0]--; if (cur.ok) cs[1]--; cs[2] -= cur.delta; }
      p.hist.pop();
      if (!cur.ok) p.misses.shift();
      session.n--; if (cur.ok) session.c--; session.delta -= cur.delta;
      const prevN = (qstate[q[0]] || [0, 1])[1] - 1;
      if (prevN <= 0) delete qstate[q[0]]; else qstate[q[0]] = [cur.qBefore, prevN];
    }
    saveAll();
    toast('Question removed' + (cur.answered ? ' and rating change undone.' : '.'));
    next();
  }

  let nextSlug = null;
  let turn = 0;
  async function next() {
    stopTimer();
    const my = ++turn;
    let slug = nextSlug && activeSlugs().includes(nextSlug) ? nextSlug : pickSlug();
    if (!slug) {
      cur = null;
      if (route() === 'play') $app.innerHTML = '<div class="card loading">No categories to play right now. A grown-up can choose which ones show in 👪 Family → Parent settings.</div>';
      return;
    }
    if (!pools[slug]) { cur = null; renderPlay(); }
    try { await loadPool(slug); } catch (e) {
      // offline or a failed download: use any selected category that is loaded or cached
      slug = activeSlugs().find((s) => pools[s]) || null;
      for (const s of slug ? [] : activeSlugs()) {
        try { await loadPool(s); slug = s; break; } catch (e2) { /* try the next one */ }
      }
      if (!slug) {
        if (my === turn) $app.innerHTML = '<div class="card loading">Could not load questions. Check your connection and reload.</div>';
        return;
      }
    }
    if (my !== turn) return; // a newer request superseded this one
    let q = pickQuestion(me(), slug);
    if (!q) { // whole category removed as bad; fall back to any loaded selected category
      const alt = activeSlugs().find((s) => pools[s] && pickQuestion(me(), s));
      q = alt ? pickQuestion(me(), alt) : null;
    }
    cur = q ? { q, answered: false, t0: Date.now() } : null;
    // prefetch the category for the following turn
    nextSlug = pickSlug();
    if (nextSlug) loadPool(nextSlug).catch(() => { nextSlug = null; });
    renderPlay();
    if (cur && settings.timer && route() === 'play') startTimer();
  }

  function startTimer() {
    const limit = settings.timer * 1000;
    const tick = () => {
      if (!cur || cur.answered) return stopTimer();
      if (FAM && FAM.resting()) { cur.t0 += 100; return; } // the clock waits during a family break
      const left = Math.max(0, limit - (Date.now() - cur.t0));
      const el = document.getElementById('timer');
      if (el) {
        el.querySelector('span').textContent = Math.ceil(left / 1000) + 's';
        el.querySelector('i').style.transform = 'scaleX(' + (left / limit) + ')';
        el.classList.toggle('low', left < 5000);
      }
      if (left <= 0) answer(-1);
    };
    tick();
    timerId = setInterval(tick, 100);
  }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  // ---------------------------------------------------------------- utils
  const $app = document.getElementById('app');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => Math.round(n).toLocaleString();
  const signed = (n) => (n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '±0');
  const pct = (a, b) => (b ? Math.round((100 * a) / b) + '%' : '—');
  let toastTimer;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), 2600);
  }
  function updateWho() {
    const p = me();
    document.getElementById('who-name').textContent = p.name;
    document.getElementById('who-rating').textContent = fmt(p.r);
  }

  // ---------------------------------------------------------------- views
  function renderPlay() {
    updateWho();
    if (route() !== 'play') return;
    if (!index) { $app.innerHTML = '<div class="card loading">Loading questions…</div>'; return; }
    const p = me();
    const slugs = activeSlugs();
    const sel = selectedCats();
    const selName = sel.length === 0 ? 'All categories'
      : sel.length === 1 ? index.categories.find((c) => c.slug === sel[0]).name
      : sel.length + ' categories';
    const totalSel = index.categories.filter((c) => slugs.includes(c.slug)).reduce((n, c) => n + c.count, 0);

    // one slim line: the category picker on the left, streak and session score on the right
    let h = '<div class="filters"><div class="playbar">' +
      '<button class="filter-toggle" id="ft" aria-expanded="' + filtersOpen + '"><span class="hide-sm">Categories:</span><b>' + esc(selName) + '</b>' +
      '<span class="muted hide-sm">· ' + fmt(totalSel) + ' questions</span>' +
      '<svg class="chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
      '<span class="mini" title="Streak · right answers this session">' + (p.streak ? '<span>🔥 ' + p.streak + '</span>' : '') +
      (session.n ? '<span>✓ ' + session.c + '/' + session.n + '</span>' : '') + '</span></div>';
    if (filtersOpen) {
      h += '<div class="chips"><button class="chip' + (sel.length ? '' : ' on') + '" data-cat="">All</button>';
      for (const c of visibleCats()) {
        h += '<button class="chip' + (settings.cats.includes(c.slug) ? ' on' : '') + '" data-cat="' + c.slug + '">' + esc(c.name) + '<small>' + fmt(c.count) + '</small></button>';
      }
      h += '</div>';
    }
    h += '</div>';

    if (!cur) {
      h += '<div class="card loading">Loading questions…</div>';
    } else {
      const q = cur.q;
      const cat = catOf.get(q[0]);
      h += '<section class="card q" aria-live="polite">' +
        '<div class="q-meta"><span class="label">' + esc(cat) + '</span>' +
        (settings.timer && !cur.answered ? '<span class="timer" id="timer"><span></span><span class="bar"><i></i></span></span>' : '') +
        '</div>' +
        '<h1 class="q-text">' + esc(q[1]) + '</h1><div class="opts">';
      q[2].forEach((o, i) => {
        let cls = 'opt';
        if (cur.answered) {
          if (i === q[3]) cls += ' right';
          else if (i === cur.choice) cls += ' wrong';
          else cls += ' dim';
        }
        h += '<button class="' + cls + '" data-i="' + i + '"' + (cur.answered ? ' disabled' : '') + '><span class="k">' + (i + 1) + '</span><span>' + esc(o) + '</span></button>';
      });
      h += '</div>';
      if (cur.answered) {
        const verdict = cur.ok ? 'Correct' : cur.choice < 0 ? 'Out of time' : 'Wrong';
        h += '<div class="result">' +
          '<span class="verdict ' + (cur.ok ? 'good' : 'bad') + '">' + verdict + '</span>' +
          '<span class="delta ' + (cur.delta >= 0 ? 'pos' : 'neg') + '">' + signed(cur.delta) + '</span>' +
          '<span class="muted hide-sm">' + fmt(cur.before) + ' → <b style="color:var(--ink)">' + fmt(cur.after) + '</b></span>' +
          '<span class="spacer"></span>' +
          '<button class="btn primary" id="next">Next</button>' +
          '<span class="qinfo hide-sm" style="flex-basis:100%">Question rated ' + fmt(cur.qBefore) + ' (' + tier(cur.qBefore) + ') → ' + fmt(cur.qAfter) +
          ' · answered ' + fmt(qCount(q)) + (qCount(q) === 1 ? ' time' : ' times') + ' on this device</span>' +
          '</div>';
      }
      // "Remove it" only once the question is answered, so it isn't in the way while answering
      h += '</section>' +
        '<div class="q-tools"><div class="hint"><span><kbd>1</kbd>–<kbd>' + q[2].length + '</kbd> answer</span><span><kbd>Enter</kbd> next</span><span><kbd>X</kbd> remove question</span></div>' +
        (cur.answered ? '<button class="btn ghost sm" id="flag" title="Remove this question for good. Undoes any rating change from it.">Bad question? Remove it</button>' : '') + '</div>';
    }

    h += '<div class="card strip hide-sm">' +
      '<div><span class="label">Rating</span><span class="v">' + fmt(p.r) + '</span></div>' +
      '<div><span class="label">Session</span><span class="v ' + (session.delta > 0 ? 'pos' : session.delta < 0 ? 'neg' : '') + '">' + signed(session.delta) + '</span></div>' +
      '<div><span class="label">Streak</span><span class="v">' + p.streak + '</span></div>' +
      '<div><span class="label">Session score</span><span class="v">' + session.c + '/' + session.n + '</span></div>' +
      '</div>';

    $app.innerHTML = h;
    if (cur && settings.timer && !cur.answered) startTimerDisplayOnly();
    const nb = document.getElementById('next'); if (nb) nb.focus({ preventScroll: true });
  }
  // re-render wipes the timer node; the interval repaints it on its next tick
  function startTimerDisplayOnly() {
    const el = document.getElementById('timer');
    if (!el) return;
    const left = Math.max(0, settings.timer * 1000 - (Date.now() - cur.t0));
    el.querySelector('span').textContent = Math.ceil(left / 1000) + 's';
    el.querySelector('i').style.transform = 'scaleX(' + left / (settings.timer * 1000) + ')';
  }

  function ratingChart(p) {
    const pts = [START].concat(p.hist.map((h) => h[4]));
    if (pts.length < 2) return '<p class="empty">Answer a few questions to see your rating over time.</p>';
    const W = 760, H = 200, L = 44, R = 8, T = 10, B = 22;
    const step = Math.max(1, Math.floor(pts.length / 400));
    const s = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
    let lo = Math.min(...s), hi = Math.max(...s);
    const pad = Math.max(20, (hi - lo) * 0.1); lo -= pad; hi += pad;
    const x = (i) => L + (i / (s.length - 1)) * (W - L - R);
    const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
    const d = s.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join('');
    const ticks = [];
    const span = hi - lo; const st = span > 600 ? 200 : span > 250 ? 100 : span > 100 ? 50 : 25;
    for (let v = Math.ceil(lo / st) * st; v <= hi; v += st) ticks.push(v);
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Rating history">' +
      ticks.map((v) => '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="axis" x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + '</text>').join('') +
      '<path class="area" d="' + d + 'L' + x(s.length - 1) + ' ' + (H - B) + 'L' + L + ' ' + (H - B) + 'Z"/>' +
      '<path class="line" d="' + d + '" vector-effect="non-scaling-stroke"/>' +
      '<text class="axis" x="' + L + '" y="' + (H - 4) + '">first answer</text>' +
      '<text class="axis" x="' + (W - R) + '" y="' + (H - 4) + '" text-anchor="end">' + fmt(pts.length - 1) + ' answers</text>' +
      '</svg>';
  }

  function renderStats() {
    updateWho();
    const p = me();
    const last50 = p.hist.slice(-50);
    const form = last50.length ? pct(last50.reduce((n, h) => n + h[2], 0), last50.length) : '—';
    let h = '<h2>' + esc(p.name) + '</h2>' +
      '<div class="card kpis">' +
      '<div><span class="label">Rating</span><span class="v">' + fmt(p.r) + '</span><span class="muted">peak ' + fmt(p.peak) + '</span></div>' +
      '<div><span class="label">Answered</span><span class="v">' + fmt(p.games) + '</span><span class="muted">' + pct(p.correct, p.games) + ' correct</span></div>' +
      '<div><span class="label">Last 50</span><span class="v">' + form + '</span><span class="muted">correct</span></div>' +
      '<div><span class="label">Best streak</span><span class="v">' + p.best + '</span><span class="muted">current ' + p.streak + '</span></div>' +
      '</div>';

    h += '<div class="card section"><h3>Rating history</h3>' + ratingChart(p) + '</div>';

    const cats = Object.entries(p.cats).filter(([, c]) => c[0] > 0).sort((a, b) => b[1][0] - a[1][0]);
    h += '<div class="card section"><h3>By category</h3>';
    if (!cats.length) h += '<p class="empty">No answers yet.</p>';
    else {
      h += '<table><thead><tr><th>Category</th><th class="n">Answered</th><th class="n">Correct</th><th class="hide-sm" style="width:30%"></th><th class="n">Net rating</th></tr></thead><tbody>';
      for (const [name, c] of cats) {
        const a = c[0] ? c[1] / c[0] : 0;
        h += '<tr><td>' + esc(name) + '</td><td class="n">' + fmt(c[0]) + '</td><td class="n">' + pct(c[1], c[0]) + '</td>' +
          '<td class="hide-sm"><div class="meter"><i style="width:' + (a * 100).toFixed(0) + '%"></i></div></td>' +
          '<td class="n ' + (c[2] > 0 ? 'pos' : c[2] < 0 ? 'neg' : '') + '">' + signed(c[2]) + '</td></tr>';
      }
      h += '</tbody></table>';
    }
    h += '</div>';

    h += '<div class="card section"><h3>Recent misses</h3>';
    if (!p.misses.length) h += '<p class="empty">Nothing missed yet.</p>';
    for (const m of p.misses.slice(0, 20)) {
      h += '<div class="miss"><p>' + esc(m[0]) + '</p><div class="a"><span class="pos">' + esc(m[1]) + '</span>' +
        (m[2] ? ' <span class="muted">· you said</span> <span class="neg">' + esc(m[2]) + '</span>' : ' <span class="muted">· ran out of time</span>') +
        ' <span class="muted">· ' + esc(m[3] || '') + '</span></div></div>';
    }
    h += '</div>';
    $app.innerHTML = h;
  }

  function renderPlayers() {
    updateWho();
    const ranked = players.slice().sort((a, b) => b.r - a.r);
    let h = '<h2>Players</h2><div class="card section" style="margin-top:0"><table><thead><tr><th></th><th>Name</th><th class="n">Rating</th><th class="n hide-sm">Peak</th><th class="n">Answered</th><th class="n hide-sm">Correct</th><th></th></tr></thead><tbody>';
    ranked.forEach((p, i) => {
      const isMe = p.id === currentId;
      h += '<tr class="' + (isMe ? 'me' : '') + '"><td class="rank">' + (i + 1) + '</td><td>' + esc(p.name) + (isMe ? ' <span class="muted" style="font-weight:400">· playing</span>' : '') + '</td>' +
        '<td class="n">' + fmt(p.r) + (p.games < 20 ? '<span class="muted" title="Provisional: fewer than 20 answers">?</span>' : '') + '</td>' +
        '<td class="n hide-sm">' + fmt(p.peak) + '</td><td class="n">' + fmt(p.games) + '</td><td class="n hide-sm">' + pct(p.correct, p.games) + '</td>' +
        '<td><div class="row-actions">' +
        (isMe ? '' : '<button class="btn sm" data-act="use" data-id="' + p.id + '">Play as</button>') +
        '<button class="btn ghost sm" data-act="rename" data-id="' + p.id + '">Rename</button>' +
        (players.length > 1 ? '<button class="btn ghost sm danger" data-act="del" data-id="' + p.id + '">Delete</button>' : '') +
        '</div></td></tr>';
    });
    h += '</tbody></table>' +
      '<form class="add" id="add"><input type="text" id="add-name" maxlength="32" placeholder="New player name" autocomplete="off"><button class="btn primary" type="submit">Add player</button></form></div>';

    const seg = (key, opts) => '<div class="seg" role="group">' + opts.map(([v, l]) =>
      '<button data-set="' + key + '" data-v="' + v + '" class="' + (String(settings[key]) === String(v) ? 'on' : '') + '">' + l + '</button>').join('') + '</div>';
    h += '<div class="card section"><h3>Settings</h3><div class="settings">' +
      '<div class="setting"><span>Answer timer</span>' + seg('timer', [[0, 'Off'], [10, '10s'], [20, '20s'], [30, '30s']]) + '</div>' +
      '<div class="setting"><span>Backup <span class="muted">— move players to another device</span></span><div style="display:flex;gap:8px">' +
      '<button class="btn sm" id="export">Export</button><button class="btn sm" id="import">Import</button><input type="file" id="import-file" accept="application/json" hidden></div></div>' +
      '</div></div>';

    const rated = Object.keys(qstate).length;
    h += '<div class="card section explain"><h3>How ratings work</h3>' +
      '<p>Every player starts at ' + START + '. Each answer is a match between you and the question: both have an Elo rating, and the expected result accounts for the chance of guessing. Beat a question rated above you and you gain more; miss an easy one and you lose more.</p>' +
      '<p>Questions are re-rated by every answer, so difficulty sorts itself as people play. Each new question is picked close to your current rating, so it stays challenging as you improve. Ratings move quickly for your first 20 answers, then settle.</p>' +
      '<p class="muted">' + fmt(rated) + ' questions re-rated on this device · ' + fmt(flags.size) + ' removed.</p></div>';
    $app.innerHTML = h;
  }

  // Family leaderboard: every player on every family phone, ranked by rating. Everyone sees the same list.
  function familyPlayers() {
    const out = [];
    for (const m of FAM.members()) {
      if (m.app !== 'trivia' || !Array.isArray(m.players)) continue;
      const solo = m.players.length === 1;
      for (const p of m.players) {
        if (!p || !(+p.games > 0)) continue;
        // a lone "Player 1" on a phone goes by that phone's family name instead
        const name = solo && /^Player \d+$/.test(p.name || '') && m.name ? m.name : (p.name || m.name || 'Player');
        out.push({ name: String(name).slice(0, 32), r: +p.r || START, best: +p.best || 0, games: +p.games || 0, correct: +p.correct || 0,
          mine: m.self && me() && p.name === me().name });
      }
    }
    return out.sort((a, b) => b.r - a.r || b.games - a.games);
  }
  function renderFamily() {
    updateWho();
    if (route() !== 'family') return;
    if (!FAM) { $app.innerHTML = '<div class="card loading">Family is not available here.</div>'; return; }
    if (!FAM.joined()) {
      $app.innerHTML = '<div class="card section fam-invite">' +
        '<div class="fam-big" aria-hidden="true">👪</div>' +
        '<h2>Play together as a family</h2>' +
        '<p>Join your family and everyone’s ratings land in one family leaderboard, on every phone. Who will climb to the top?</p>' +
        '<p class="muted">Everyone in the family sees the same list. It also works with Vast Arcade, Vast Party Games and Vast Library.</p>' +
        '<button class="btn primary" data-fam>Start or join a family</button></div>';
      return;
    }
    const r = FAM.rules() || {};
    const list = familyPlayers();
    let h = '<div class="fam-head"><h2>👪 ' + esc(r.name || 'Family') + '</h2><button class="btn sm" data-fam>Family settings</button></div>' +
      '<div class="card section" style="margin-top:0"><h3>Family leaderboard</h3>';
    if (!list.length) h += '<p class="empty">No answers yet. Play a few questions and you’ll be the first one on the list!</p>';
    else {
      h += '<table class="fam-table"><thead><tr><th></th><th>Name</th><th class="n">Rating</th><th class="n">Best streak</th><th class="n">Answered</th><th class="n hide-sm">Correct</th></tr></thead><tbody>';
      list.forEach((p, i) => {
        h += '<tr class="' + (p.mine ? 'me' : '') + '"><td class="rank">' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</td><td>' + esc(p.name) + '</td>' +
          '<td class="n">' + fmt(p.r) + '</td><td class="n">' + fmt(p.best) + '</td><td class="n">' + fmt(p.games) + '</td><td class="n hide-sm">' + pct(p.correct, p.games) + '</td></tr>';
      });
      h += '</tbody></table>';
    }
    h += '</div><p class="muted fam-note">Everyone in the family sees this same list. It refreshes every few minutes.</p>';
    $app.innerHTML = h;
  }

  // ---------------------------------------------------------------- modal
  function openPicker() {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = '<div class="card modal" role="dialog" aria-modal="true" aria-labelledby="mt"><h2 id="mt">Who is playing?</h2>' +
      '<div class="list">' + players.slice().sort((a, b) => b.r - a.r).map((p) =>
        '<button class="pick' + (p.id === currentId ? ' on' : '') + '" data-id="' + p.id + '"><span>' + esc(p.name) + '</span><b>' + fmt(p.r) + '</b></button>').join('') + '</div>' +
      '<form class="add" id="m-add" style="margin-top:0"><input type="text" maxlength="32" placeholder="New player name" autocomplete="off"><button class="btn" type="submit">Add</button></form>' +
      '<div class="modal-actions"><button class="btn ghost" data-close>Close</button></div></div>';
    const close = () => { ov.remove(); document.removeEventListener('keydown', onEsc, true); };
    const onEsc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onEsc, true);
    ov.addEventListener('click', (e) => {
      if (e.target === ov || e.target.closest('[data-close]')) return close();
      const b = e.target.closest('.pick');
      if (b) { switchTo(b.dataset.id); close(); }
    });
    ov.querySelector('#m-add').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = e.target.querySelector('input').value.trim();
      if (!name) return;
      const p = newPlayer(name.slice(0, 32));
      players.push(p); switchTo(p.id); close();
    });
    document.body.appendChild(ov);
    ov.querySelector('.pick.on, .pick').focus();
  }

  function switchTo(id) {
    if (id === currentId) return;
    currentId = id;
    session.n = session.c = session.delta = 0;
    saveAll();
    if (route() === 'play') next(); else render();
    updateWho();
  }

  // ---------------------------------------------------------------- routing
  const route = () => (['play', 'stats', 'players', 'family'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'play');
  function render() {
    const r = route();
    document.body.dataset.route = r;
    document.querySelectorAll('.tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === r));
    if (r !== 'play') stopTimer();
    if (r === 'play') {
      renderPlay();
      if (cur && settings.timer && !cur.answered && !timerId) startTimer();
    } else if (r === 'stats') renderStats();
    else if (r === 'family') {
      renderFamily();
      if (FAM && FAM.joined() && Date.now() - famSyncedAt > 15000) { famSyncedAt = Date.now(); FAM.sync(); }
    } else renderPlayers();
  }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

  // ---------------------------------------------------------------- events
  $app.addEventListener('click', (e) => {
    const t = e.target;
    const opt = t.closest('.opt');
    if (opt && !opt.disabled) return answer(+opt.dataset.i);
    if (t.closest('#next')) return next();
    if (t.closest('#flag')) return flagCurrent();
    if (t.closest('#ft')) { filtersOpen = !filtersOpen; return renderPlay(); }
    const chip = t.closest('.chip');
    if (chip) {
      const s = chip.dataset.cat;
      settings.cats = selectedCats();
      if (!s) settings.cats = [];
      else if (settings.cats.includes(s)) settings.cats = settings.cats.filter((x) => x !== s);
      else settings.cats = settings.cats.concat(s);
      if (settings.cats.length === visibleCats().length) settings.cats = [];
      saveSettings();
      nextSlug = null;
      if (!cur || !cur.answered) next(); else renderPlay();
      return;
    }
    const set = t.closest('[data-set]');
    if (set) {
      const k = set.dataset.set; const v = set.dataset.v;
      settings[k] = k === 'timer' ? +v : v;
      if (k === 'theme') {
        if (v === 'system') delete document.documentElement.dataset.theme;
        else document.documentElement.dataset.theme = v;
      }
      saveSettings();
      return renderPlayers();
    }
    const act = t.closest('[data-act]');
    if (act) {
      const p = players.find((x) => x.id === act.dataset.id);
      if (act.dataset.act === 'use') { switchTo(p.id); return renderPlayers(); }
      if (act.dataset.act === 'rename') {
        const n = prompt('Rename player', p.name);
        if (n && n.trim()) { p.name = n.trim().slice(0, 32); saveAll(); }
        return renderPlayers();
      }
      if (act.dataset.act === 'del') {
        if (!confirm('Delete ' + p.name + ' and all of their history? This cannot be undone.')) return;
        players = players.filter((x) => x.id !== p.id);
        seenSets.delete(p.id);
        if (currentId === p.id) { currentId = players[0].id; session.n = session.c = session.delta = 0; cur = null; }
        saveAll();
        return renderPlayers();
      }
    }
    if (t.closest('#export')) {
      const blob = new Blob([JSON.stringify({ app: 'vast-trivia', v: 1, exported: new Date().toISOString(), players, qstate, flags: [...flags] })], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'vast-trivia-backup.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      return;
    }
    if (t.closest('#import')) return document.getElementById('import-file').click();
    if (t.closest('[data-fam]')) { if (FAM) FAM.open(); return; }
  });

  $app.addEventListener('change', (e) => {
    if (e.target.id !== 'import-file' || !e.target.files[0]) return;
    e.target.files[0].text().then((txt) => {
      const d = JSON.parse(txt);
      if (d.app !== 'vast-trivia' || !Array.isArray(d.players)) throw new Error('bad file');
      // merge: imported players replace same-id players; question ratings keep the more-answered copy
      for (const ip of d.players) {
        const i = players.findIndex((p) => p.id === ip.id);
        if (i >= 0) players[i] = ip; else players.push(ip);
        seenSets.delete(ip.id);
      }
      for (const [id, s] of Object.entries(d.qstate || {})) if (!qstate[id] || qstate[id][1] < s[1]) qstate[id] = s;
      for (const f of d.flags || []) flags.add(f);
      saveAll();
      toast('Imported ' + d.players.length + (d.players.length === 1 ? ' player.' : ' players.'));
      renderPlayers();
    }).catch(() => toast('That file is not a Vast Trivia backup.'));
  });

  $app.addEventListener('submit', (e) => {
    if (e.target.id !== 'add') return;
    e.preventDefault();
    const name = document.getElementById('add-name').value.trim();
    if (!name) return;
    players.push(newPlayer(name.slice(0, 32)));
    saveAll();
    renderPlayers();
  });

  document.getElementById('who').addEventListener('click', openPicker);

  document.addEventListener('keydown', (e) => {
    if (route() !== 'play' || !cur || document.querySelector('.overlay') || (FAM && FAM.isOpen())) return;
    if (e.target.closest('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (!cur.answered) {
      const i = KEYS.indexOf(k) >= 0 ? KEYS.indexOf(k) : 'abcde'.indexOf(k);
      if (i >= 0 && i < cur.q[2].length) { e.preventDefault(); return answer(i); }
    } else if (k === 'enter' || k === ' ' || k === 'arrowright' || k === 'n') {
      e.preventDefault(); return next();
    }
    if (k === 'x') { e.preventDefault(); flagCurrent(); }
  });

  // ---------------------------------------------------------------- boot
  if (FAM) {
    FAM.init({
      app: 'trivia',
      collect: () => ({ players: players.map((p) => ({ name: p.name, r: Math.round(p.r), peak: Math.round(p.peak), best: p.best, games: p.games, correct: p.correct })) }),
      games: famGames,
      itemWord: 'categories', itemOne: 'category',
    });
    famReady = true;
    const hidSig = () => JSON.stringify(((FAM.rules() || {}).hidden || {}).trivia || []);
    let lastHid = hidSig();
    FAM.on('change', () => {
      const r = route();
      if (r === 'family') renderFamily();
      const sig = hidSig();
      if (sig === lastHid || !index) return;
      lastHid = sig;   // the family's hidden categories changed
      if (nextSlug && famHidden(nextSlug)) nextSlug = null;
      if ((cur && !cur.answered && famHidden(slugOf.get(cur.q[0]))) || !cur) next();
      else if (r === 'play') renderPlay();
    });
  }
  updateWho();
  render();
  loadIndex()
    .then(() => { famGames.push(...index.categories.map((c) => ({ id: c.slug, name: c.name }))); return next(); })
    .catch(() => {
      $app.innerHTML = '<div class="card loading">Could not load questions. Check your connection and reload.</div>';
    });
})();
