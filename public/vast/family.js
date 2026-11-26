/* Vast Family — one family across the Vast apps (spec: AppShelf/FAMILY.md).
 *
 * A family is a 9-character Family ID (shown ABC-DEF-GHJ). Everything a phone sends is encrypted with a
 * key made from that ID, so the server (vast-apps.fly.dev) only ever holds ciphertext.
 * Everyone in the family sees the same things: the same high scores, the same favorites, the same
 * family rules. Parents change the rules behind a PIN; nobody gets a report on anybody.
 *
 *   FAM.init({ app: 'arcade', collect: () => ({ best: {...} }), games: [{id, name}], gateOnly: false,
 *              itemWord: 'games', itemOne: 'game' })   (Trivia: 'categories' / 'category')
 *   FAM.joined()            true when this app is in a family
 *   FAM.members()           decrypted member records [{id, app, name, self, ...}] (removed ones left out)
 *   FAM.rules()             the family rules (see FAMILY.md), or null
 *   FAM.isHidden(id)        true if a parent hid that game in this app
 *   FAM.myName() / FAM.setMyName(n)
 *   FAM.open()              the Family screen (start / join / code / members / rules / parent settings)
 *   FAM.push()              send this phone's data soon (debounced); call after a score changes
 *   FAM.sync()              fetch now
 *   FAM.on('change', fn)    after every sync or rules change
 *   FAM.isOpen() / FAM.close() / FAM.back()   for Android back-button handling (back() returns true if it closed something)
 * The break / quiet-hours screen runs by itself once init() is called (also with gateOnly on game pages).
 */
(function () {
  'use strict';
  if (window.FAM) return;
  const FAM = (window.FAM = {});
  const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const KEY = 'vast_family';                 // {code, room, k (base64 raw key), member, name, rules, rv, members, at}
  // per app (web apps on one site share localStorage): member id and today's play time
  const TIME = () => 'vast_family_time_' + opt.app;   // {day, sec, extra}
  const MEMBER = () => 'vast_family_member_' + opt.app;
  const UNLOCK = 'vast_family_unlock';       // {until}
  const APPS = { arcade: '🕹️', trivia: '❓', party: '🎉', library: '🎬' };
  const APP_NAMES = { arcade: 'Vast Arcade', trivia: 'Vast Trivia', party: 'Vast Party Games', library: 'Vast Library' };
  let opt = { app: 'app', collect: () => ({}), games: [], gateOnly: false, itemWord: 'games', itemOne: 'game' };
  let st = load();
  let keyObj = null, pushTimer = 0, lastPushed = '', syncing = null;
  const subs = [];

  function api() { try { const v = localStorage.getItem('va_api'); if (v) return JSON.parse(v); } catch (e) {} return 'https://vast-apps.fly.dev/api'; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function lget(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function emit() { subs.forEach(f => { try { f(); } catch (e) {} }); }
  FAM.on = function (ev, fn) { if (ev === 'change') subs.push(fn); };

  /* ---------- code, room, key ---------- */
  FAM.newCode = function () {
    let s = ''; const b = new Uint8Array(32);
    while (s.length < 9) { crypto.getRandomValues(b); for (const x of b) { if (x < 248 && s.length < 9) s += ALPHA[x % 31]; } }
    return s;
  };
  FAM.normalize = function (c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); };
  FAM.valid = function (c) { c = FAM.normalize(c); return c.length === 9 && [...c].every(ch => ALPHA.includes(ch)); };
  FAM.format = function (c) { c = FAM.normalize(c); return c.slice(0, 3) + '-' + c.slice(3, 6) + '-' + c.slice(6, 9); };
  const enc = new TextEncoder(), dec = new TextDecoder();
  const hex = buf => [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
  const b64 = buf => { let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); };
  const unb64 = s => Uint8Array.from(atob(s), ch => ch.charCodeAt(0));
  async function roomOf(code) { return hex(await crypto.subtle.digest('SHA-256', enc.encode('vast-family:' + code))); }
  async function rawKeyOf(code) {
    const base = await crypto.subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveBits']);
    return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('vast-family-key'), iterations: 150000 }, base, 256);
  }
  async function key() {
    if (!keyObj) keyObj = await crypto.subtle.importKey('raw', unb64(st.k), 'AES-GCM', false, ['encrypt', 'decrypt']);
    return keyObj;
  }
  async function seal(obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(), enc.encode(JSON.stringify(obj)));
    const out = new Uint8Array(12 + ct.byteLength); out.set(iv); out.set(new Uint8Array(ct), 12); return b64(out);
  }
  async function open(data, k) {
    const u = unb64(data);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.slice(0, 12) }, k || await key(), u.slice(12));
    return JSON.parse(dec.decode(pt));
  }
  async function sha(s) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }

  /* ---------- network ---------- */
  async function req(method, p, body) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch(api() + p, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: ctl.signal });
      let j = null; try { j = await r.json(); } catch (e) {}
      return { status: r.status, json: j };
    } finally { clearTimeout(t); }
  }

  /* ---------- state ---------- */
  FAM.joined = () => !!(st.code && st.k && st.room);
  FAM.code = () => st.code || '';
  FAM.rules = () => (FAM.joined() ? st.rules || null : null);
  FAM.myName = () => st.name || '';
  FAM.memberId = () => mid() || '';
  function mid() { return lget(MEMBER(), null); }
  function setMid(v) { if (v) lset(MEMBER(), v); else { try { localStorage.removeItem(MEMBER()); } catch (e) {} } }
  FAM.setMyName = function (n) { st.name = clean(n, 20); save(); FAM.push(true); emit(); };
  FAM.members = function () {
    if (!FAM.joined()) return [];
    const gone = new Set((st.rules && st.rules.removed) || []);
    return (st.members || []).filter(m => !gone.has(m.id)).map(m => Object.assign({}, m, { self: m.id === mid() }));
  };
  FAM.isHidden = function (id) { const r = FAM.rules(); return !!(r && r.hidden && (r.hidden[opt.app] || []).includes(id)); };
  function clean(s, n) { return String(s == null ? '' : s).replace(/[<>]/g, '').trim().slice(0, n); }
  function memberId() {
    if (!mid()) { const b = crypto.getRandomValues(new Uint8Array(9)); setMid(opt.app.slice(0, 3) + '-' + b64(b).replace(/[+/=]/g, 'x')); }
    return mid();
  }

  FAM.sync = function () {
    // another Vast app on the same site may have joined or left since this page loaded
    const fresh = load(); if ((fresh.code || '') !== (st.code || '')) { st = fresh; keyObj = null; lastPushed = ''; emit(); }
    if (!FAM.joined()) return Promise.resolve(false);
    if (syncing) return syncing;
    syncing = (async () => {
      try {
        const r = await req('GET', '/family/' + st.room);
        if (r.status !== 200 || !r.json) return false;
        const k = await key();
        if (r.json.rules) { try { st.rules = await open(r.json.rules.data, k); st.rv = r.json.rules.v; } catch (e) {} }
        const ms = [];
        for (const [id, m] of Object.entries(r.json.members || {})) {
          try { const d = await open(m.data, k); if (d && typeof d === 'object') { d.id = id; d.updated = m.updated; ms.push(d); } } catch (e) {}
        }
        st.members = ms; st.at = Date.now();
        if (st.rules && (st.rules.removed || []).includes(mid())) { leaveLocal(); toast('This phone was taken out of the family.'); emit(); return true; }
        save(); emit(); checkGate();
        if (!ms.some(m => m.id === mid())) lastPushed = '';
        FAM.push();
        return true;
      } catch (e) { return false; } finally { syncing = null; }
    })();
    return syncing;
  };
  FAM.push = function (soon) {
    if (!FAM.joined() || opt.gateOnly) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      try {
        let data = {}; try { data = opt.collect() || {}; } catch (e) {}
        const rec = Object.assign({}, data, { app: opt.app, name: st.name || 'Player' });
        const sig = JSON.stringify(rec); if (sig === lastPushed) return;
        rec.t = Date.now();
        const r = await req('PUT', '/family/' + st.room + '/members/' + memberId(), { data: await seal(rec) });
        if (r.status === 200) {
          lastPushed = sig;
          const mine = Object.assign({}, rec, { id: mid() });
          st.members = (st.members || []).filter(m => m.id !== mid()).concat([mine]); save(); emit();
        } else if (r.status === 404) { /* family gone */ }
      } catch (e) {}
    }, soon ? 300 : 4000);
  };
  async function setFamily(code) {
    st.code = code; st.room = await roomOf(code); st.k = b64(await rawKeyOf(code)); keyObj = null;
  }
  FAM.create = async function (familyName, myName, pin) {
    const code = FAM.newCode();
    const prev = st; st = {}; await setFamily(code);
    const salt = hex(crypto.getRandomValues(new Uint8Array(8)));
    const rules = { name: clean(familyName, 30) || 'Our family', pin: { salt, hash: await sha(salt + ':' + pin) },
      hidden: {}, dailyMinutes: 0, quiet: null, removed: [], t: Date.now() };
    const r = await req('PUT', '/family/' + st.room + '/rules', { v: 0, data: await seal(rules) });
    if (r.status !== 200) { st = prev; keyObj = null; throw new Error(r.status === 409 ? 'Try again.' : 'Could not reach the family server. Check the internet and try again.'); }
    st.rules = rules; st.rv = r.json.v; st.name = clean(myName, 20); st.members = []; save();
    lastPushed = ''; FAM.push(true); emit(); return code;
  };
  FAM.join = async function (code, myName) {
    code = FAM.normalize(code);
    if (!FAM.valid(code)) throw new Error('A Family ID is 9 letters and numbers, like ABC-DEF-GHJ.');
    const prev = st; st = {}; await setFamily(code);
    let r; try { r = await req('GET', '/family/' + st.room); } catch (e) { r = { status: 0 }; }
    if (r.status !== 200 || !r.json || !r.json.rules) { st = prev; keyObj = null; throw new Error(r.status === 200 ? 'No family has that ID. Check the letters and try again.' : 'Could not reach the family server. Check the internet and try again.'); }
    st.name = clean(myName, 20);
    // a phone a parent removed earlier joins again under a new member id
    try { const rules = await open(r.json.rules.data); if ((rules.removed || []).includes(mid())) setMid(null); } catch (e) {}
    save();
    lastPushed = ''; await FAM.sync(); emit(); return true;
  };
  function leaveLocal() { st = {}; keyObj = null; lastPushed = ''; save(); }
  FAM.leave = async function () {
    if (FAM.joined() && mid()) { try { await req('DELETE', '/family/' + st.room + '/members/' + mid()); } catch (e) {} }
    leaveLocal(); emit(); checkGate();
  };
  FAM.checkPin = async function (pin) { const r = FAM.rules(); return !!(r && r.pin && (await sha(r.pin.salt + ':' + pin)) === r.pin.hash); };
  // edit: fn(rules) changes rules in place. Re-reads and retries if someone else changed them meanwhile.
  FAM.editRules = async function (fn) {
    for (let i = 0; i < 4; i++) {
      const g = await req('GET', '/family/' + st.room);
      if (g.status !== 200 || !g.json || !g.json.rules) throw new Error('Could not reach the family server.');
      const rules = await open(g.json.rules.data); fn(rules); rules.t = Date.now();
      const p = await req('PUT', '/family/' + st.room + '/rules', { v: g.json.rules.v, data: await seal(rules) });
      if (p.status === 200) { st.rules = rules; st.rv = p.json.v; save(); emit(); checkGate(); return rules; }
      if (p.status !== 409) throw new Error('Could not save. Try again.');
    }
    throw new Error('Could not save. Try again.');
  };
  FAM.removeMember = async function (id) {
    await FAM.editRules(r => { r.removed = (r.removed || []).filter(x => x !== id).concat([id]).slice(-200); });
    try { await req('DELETE', '/family/' + st.room + '/members/' + id); } catch (e) {}
    st.members = (st.members || []).filter(m => m.id !== id); save(); emit();
  };

  /* ---------- daily time + quiet hours ---------- */
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  function timeRec() { let t = lget(TIME(), null); if (!t || t.day !== today()) t = { day: today(), sec: 0, extra: 0 }; return t; }
  const mins = s => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
  function inQuiet(r, d) {
    if (!r || !r.quiet || !r.quiet.from || !r.quiet.to) return false;
    const n = d.getHours() * 60 + d.getMinutes(), a = mins(r.quiet.from), b = mins(r.quiet.to);
    return a === b ? false : a < b ? n >= a && n < b : n >= a || n < b;
  }
  function quietEnd(r, d) { // next time the quiet window ends
    const e = new Date(d); const b = mins(r.quiet.to); e.setHours(Math.floor(b / 60), b % 60, 0, 0); if (e <= d) e.setDate(e.getDate() + 1); return e.getTime();
  }
  FAM.fmtTime = function (s) { const m = mins(s), h = Math.floor(m / 60), mm = m % 60; return ((h + 11) % 12 + 1) + ':' + String(mm).padStart(2, '0') + ' ' + (h < 12 ? 'am' : 'pm'); };
  function gateState() {
    const r = FAM.rules(); if (!r) return null;
    const now = new Date(), un = lget(UNLOCK, null);
    if (inQuiet(r, now) && !(un && un.until > now.getTime())) return 'quiet';
    const lim = +r.dailyMinutes || 0;
    if (lim > 0) { const t = timeRec(); if (t.sec >= (lim + (t.extra || 0)) * 60) return 'break'; }
    return null;
  }
  FAM.minutesLeft = function () { const r = FAM.rules(); const lim = r ? +r.dailyMinutes || 0 : 0; if (!lim) return null; const t = timeRec(); return Math.max(0, Math.ceil(lim + (t.extra || 0) - t.sec / 60)); };
  let lastTick = Date.now();
  setInterval(() => {
    const now = Date.now(), dt = Math.min(30, Math.round((now - lastTick) / 1000)); lastTick = now;
    if (!FAM.joined() || document.visibilityState !== 'visible') return;
    const r = FAM.rules();
    if (r && +r.dailyMinutes > 0 && !gateEl) { const t = timeRec(); t.sec += dt; lset(TIME(), t); }
    checkGate();
  }, 5000);

  /* ---------- UI ---------- */
  const CSS = `
#vfam,#vfam-gate{position:fixed;inset:0;z-index:2147483000;font-family:inherit;color:#fff;-webkit-tap-highlight-color:transparent}
#vfam{background:rgba(10,12,30,.72);display:flex;align-items:flex-end;justify-content:center}
#vfam .sheet{background:#1b1f3b;width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:22px 22px 0 0;padding:18px 18px 28px;box-shadow:0 -8px 30px rgba(0,0,0,.4)}
#vfam h2{margin:0;font-size:22px;font-weight:900;flex:1}
#vfam h3{margin:18px 0 8px;font-size:13px;letter-spacing:.8px;text-transform:uppercase;color:#aab0e0}
#vfam p{margin:8px 0;color:#d6d9f5;line-height:1.45;font-size:15px}
#vfam .top{display:flex;align-items:center;gap:10px;margin-bottom:6px}
#vfam .x{background:#262c66;border:0;color:#fff;width:40px;height:40px;border-radius:12px;font-size:22px}
#vfam .card{background:#262c66;border:2px solid #3d4488;border-radius:16px;padding:12px 14px;margin:8px 0}
#vfam .code{font-size:34px;font-weight:900;letter-spacing:4px;text-align:center;color:#ffd43b;user-select:all;-webkit-user-select:all;padding:6px 0}
#vfam .muted{color:#aab0e0;font-size:13px}
#vfam .btn{display:block;width:100%;border:0;border-radius:14px;padding:14px;margin:10px 0 0;font:inherit;font-size:17px;font-weight:800;color:#fff;background:linear-gradient(#6b8afd,#4263eb);box-shadow:0 4px 0 #2b45b0}
#vfam .btn.gold{background:#ffd43b;color:#1b1f3b;box-shadow:0 4px 0 #b8941f}
#vfam .btn.ghost{background:#262c66;box-shadow:0 4px 0 #151938}
#vfam .btn.bad{background:#262c66;color:#ff6b6b;box-shadow:0 4px 0 #151938}
#vfam .btn:disabled{opacity:.5}
#vfam input,#vfam select{width:100%;box-sizing:border-box;background:#11142b;border:2px solid #3d4488;border-radius:12px;color:#fff;font:inherit;font-size:18px;padding:12px;margin:6px 0}
#vfam input.codein{font-size:26px;font-weight:900;letter-spacing:3px;text-align:center;text-transform:uppercase}
#vfam label{display:block;font-weight:700;margin-top:10px}
#vfam .row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #2f3675}
#vfam .row:last-child{border-bottom:0}
#vfam .row .n{flex:1;font-weight:700}
#vfam .row button{background:#2f3675;border:0;color:#fff;border-radius:10px;padding:8px 12px;font:inherit;font-weight:700}
#vfam .row button.on{background:#ff6b6b;color:#1b1f3b}
#vfam .err{color:#ff6b6b;font-weight:700;min-height:20px;margin-top:6px}
#vfam .chips{display:flex;flex-wrap:wrap;gap:8px}
#vfam .chip{background:#2f3675;border:2px solid #3d4488;color:#fff;border-radius:999px;padding:8px 14px;font:inherit;font-weight:700}
#vfam .chip.sel{background:#ffd43b;color:#1b1f3b;border-color:#ffd43b}
#vfam .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:300px;margin:12px auto}
#vfam .pad button{height:58px;border-radius:14px;border:0;background:#2f3675;color:#fff;font:inherit;font-size:24px;font-weight:800}
#vfam .dots{display:flex;justify-content:center;gap:12px;margin:10px 0}
#vfam .dots i{width:16px;height:16px;border-radius:50%;border:2px solid #aab0e0}
#vfam .dots i.f{background:#ffd43b;border-color:#ffd43b}
#vfam .search{margin-bottom:4px}
#vfam .list{max-height:44vh;overflow:auto}
#vfam-gate{background:linear-gradient(#262c66,#11142b);display:flex;align-items:center;justify-content:center;text-align:center;padding:24px}
#vfam-gate .moon{font-size:84px}
#vfam-gate h2{font-size:28px;margin:10px 0 6px}
#vfam-gate p{color:#d6d9f5;font-size:17px;line-height:1.5;max-width:420px;margin:6px auto}
#vfam-gate button{margin-top:26px;background:transparent;border:2px solid #3d4488;color:#aab0e0;border-radius:12px;padding:10px 16px;font:inherit;font-weight:700}
#vfam-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#262c66;border:2px solid #3d4488;color:#fff;padding:12px 16px;border-radius:14px;z-index:2147483001;font-weight:700;max-width:90vw}
`;
  function css() { if (document.getElementById('vfam-css')) return; const s = document.createElement('style'); s.id = 'vfam-css'; s.textContent = CSS; document.head.appendChild(s); }
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function toast(msg) {
    css(); const t = document.createElement('div'); t.id = 'vfam-toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }
  FAM.toast = toast;
  let el = null, view = 'home', parentOk = false, stack = [], draft = null;
  FAM.isOpen = () => !!el || !!gateEl;
  FAM.close = function () { if (el) { el.remove(); el = null; parentOk = false; stack = []; draft = null; } };
  FAM.back = function () {
    if (gateEl) return true;              // the rest screen stays up
    if (!el) return false;
    if (stack.length) { view = stack.pop(); render(); } else FAM.close();
    return true;
  };
  FAM.open = function (v) {
    css(); if (!el) { el = document.createElement('div'); el.id = 'vfam'; document.body.appendChild(el);
      el.addEventListener('click', e => { if (e.target === el) FAM.close(); }); }
    view = v || 'home'; stack = []; render(); if (FAM.joined()) FAM.sync().then(() => { if (el && view === 'home') render(); });
  };
  function go(v) { stack.push(view); view = v; render(); }
  function shell(title, body) {
    el.innerHTML = '<div class="sheet"><div class="top">' + (stack.length ? '<button class="x" data-a="back" aria-label="Back">←</button>' : '') +
      '<h2>' + title + '</h2><button class="x" data-a="close" aria-label="Close">&times;</button></div>' + body + '</div>';
    el.querySelectorAll('[data-a=close]').forEach(b => (b.onclick = FAM.close));
    el.querySelectorAll('[data-a=back]').forEach(b => (b.onclick = () => FAM.back()));
  }
  const $ = s => el.querySelector(s);
  function busy(btn, fn) {
    return async () => { const e = $('.err'); if (e) e.textContent = ''; btn.disabled = true;
      try { await fn(); } catch (x) { if ($('.err')) $('.err').textContent = x.message || String(x); } finally { if (btn.isConnected) btn.disabled = false; } };
  }
  function rulesSummary(r) {
    const out = [];
    const hid = (r.hidden && r.hidden[opt.app]) || [];
    if (hid.length) out.push('🙈 ' + hid.length + ' ' + (hid.length > 1 ? opt.itemWord : opt.itemOne) + ' hidden in ' + (APP_NAMES[opt.app] || 'this app'));
    out.push(+r.dailyMinutes > 0 ? '⏳ ' + r.dailyMinutes + ' minutes a day in each Vast app' : '⏳ No daily time limit');
    out.push(r.quiet ? '🌙 Quiet hours ' + FAM.fmtTime(r.quiet.from) + ' – ' + FAM.fmtTime(r.quiet.to) : '🌙 No quiet hours');
    return out.map(x => '<div class="row"><span class="n">' + esc(x) + '</span></div>').join('');
  }
  function render() {
    if (!el) return;
    if (view === 'home') draft = null;           // a parent-settings draft lives until home, save or close
    const r = FAM.rules();
    if (view === 'home' && !FAM.joined()) {
      shell('👪 Family',
        '<p>Join your family to share one high-score list, see the games your family loves, and play together — even on different phones.</p>' +
        '<p class="muted">Everyone in the family sees the same lists. Parents can set family rules with a PIN.</p>' +
        '<button class="btn gold" data-a="start">Start a family</button><button class="btn" data-a="join">Join with a Family ID</button>');
      $('[data-a=start]').onclick = () => go('start'); $('[data-a=join]').onclick = () => go('join');
      return;
    }
    if (view === 'start') {
      shell('Start a family',
        '<label>Family name</label><input id="fn" maxlength="30" placeholder="The Smith family">' +
        '<label>Your name</label><input id="mn" maxlength="20" placeholder="Mom">' +
        '<label>Parent PIN (4 digits)</label><input id="p1" inputmode="numeric" maxlength="4" type="password" placeholder="••••">' +
        '<input id="p2" inputmode="numeric" maxlength="4" type="password" placeholder="PIN again">' +
        '<p class="muted">The PIN guards the family rules. Keep it to the grown-ups.</p><div class="err"></div><button class="btn gold" data-a="go">Create family</button>');
      const b = $('[data-a=go]');
      b.onclick = busy(b, async () => {
        const p1 = $('#p1').value, p2 = $('#p2').value, mn = $('#mn').value.trim();
        if (!mn) throw new Error('Type your name.');
        if (!/^\d{4}$/.test(p1)) throw new Error('The PIN is 4 digits.');
        if (p1 !== p2) throw new Error('The two PINs are different.');
        await FAM.create($('#fn').value, mn, p1); stack = []; view = 'created'; render();
      });
      return;
    }
    if (view === 'created') {
      shell('👪 Family ready!',
        '<p>Your Family ID:</p><div class="card"><div class="code">' + esc(FAM.format(st.code)) + '</div></div>' +
        '<p>On each phone, open a Vast app → 👪 Family → <b>Join with a Family ID</b> and type this in. It works in Vast Arcade, Vast Trivia, Vast Party Games and Vast Library.</p>' +
        '<button class="btn" data-a="ok">Done</button>');
      $('[data-a=ok]').onclick = () => { view = 'home'; render(); };
      return;
    }
    if (view === 'join') {
      shell('Join a family',
        '<label>Family ID</label><input id="cd" class="codein" maxlength="11" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC-DEF-GHJ">' +
        '<label>Your name</label><input id="mn" maxlength="20" placeholder="Your name" value="' + esc(st.name || '') + '">' +
        '<div class="err"></div><button class="btn gold" data-a="go">Join</button>');
      const cd = $('#cd');
      cd.oninput = () => { const n = FAM.normalize(cd.value).slice(0, 9); const f = n.length > 6 ? FAM.format(n) : n.length > 3 ? n.slice(0, 3) + '-' + n.slice(3) : n; if (cd.value !== f) cd.value = f; };
      const b = $('[data-a=go]');
      b.onclick = busy(b, async () => {
        if (!$('#mn').value.trim()) throw new Error('Type your name.');
        await FAM.join(cd.value, $('#mn').value); stack = []; view = 'home'; render(); toast('Welcome to ' + ((FAM.rules() || {}).name || 'the family') + '!');
      });
      return;
    }
    if (view === 'home') {
      const ms = FAM.members();
      const byName = {};
      ms.forEach(m => { const k = (m.name || 'Player').toLowerCase(); (byName[k] = byName[k] || { name: m.name || 'Player', apps: new Set(), self: false }); byName[k].apps.add(m.app); if (m.self) byName[k].self = true; });
      shell('👪 ' + esc((r && r.name) || 'Family'),
        '<div class="card"><div class="muted" style="text-align:center">Family ID</div><div class="code">' + esc(FAM.format(st.code)) + '</div></div>' +
        '<label>Your name</label><input id="mn" maxlength="20" value="' + esc(st.name || '') + '">' +
        '<h3>Family</h3><div class="card">' + (Object.values(byName).map(p => '<div class="row"><span class="n">' + esc(p.name) + (p.self ? ' <span class="muted">(you)</span>' : '') + '</span><span>' + [...p.apps].map(a => APPS[a] || '').join(' ') + '</span></div>').join('') || '<div class="muted">Just you so far. Share the Family ID!</div>') + '</div>' +
        '<h3>Family rules</h3><div class="card">' + (r ? rulesSummary(r) : '') + '</div>' +
        '<button class="btn ghost" data-a="parent">🔒 Parent settings</button><button class="btn bad" data-a="leave">Leave family</button>');
      const mn = $('#mn'); mn.onchange = () => FAM.setMyName(mn.value || 'Player');
      $('[data-a=parent]').onclick = () => { if (parentOk) go('parent'); else go('pin'); };
      $('[data-a=leave]').onclick = () => go('leave');
      return;
    }
    if (view === 'leave') {
      shell('Leave family?', '<p>This phone stops sharing scores in ' + esc(APP_NAMES[opt.app] || 'this app') + '. You can join again any time with the Family ID.</p><div class="err"></div><button class="btn bad" data-a="go">Leave family</button><button class="btn ghost" data-a="no">Stay</button>');
      const b = $('[data-a=go]'); b.onclick = busy(b, async () => { await FAM.leave(); stack = []; view = 'home'; render(); });
      $('[data-a=no]').onclick = () => FAM.back();
      return;
    }
    if (view === 'pin') {
      pinPad('🔒 Parent PIN', 'Enter the parent PIN', async pin => { if (await FAM.checkPin(pin)) { parentOk = true; view = 'parent'; render(); return true; } return false; });
      return;
    }
    if (view === 'parent') {
      if (!draft) draft = { name: r.name || '', lim: +r.dailyMinutes || 0, qOn: !!r.quiet, from: (r.quiet && r.quiet.from) || '20:00', to: (r.quiet && r.quiet.to) || '07:00' };
      const D = draft, lim = D.lim, q = D.qOn;
      const hid = (r.hidden && r.hidden[opt.app]) || [];
      shell('🔒 Parent settings',
        '<p class="muted">Family rules apply on every phone in the family, and everyone can see them.</p>' +
        '<h3>Family name</h3><input id="fn" maxlength="30" value="' + esc(D.name) + '">' +
        '<h3>Daily play time</h3><p class="muted">In each Vast app on each phone. A friendly “time for a break” screen shows when it runs out.</p><div class="chips" id="lim">' +
        [0, 30, 45, 60, 90, 120].map(m => '<button class="chip' + (m === lim ? ' sel' : '') + '" data-m="' + m + '">' + (m ? m + ' min' : 'No limit') + '</button>').join('') + '</div>' +
        '<h3>Quiet hours</h3><p class="muted">The apps rest at night with a calm goodnight screen.</p><div class="chips" id="qon"><button class="chip' + (!q ? ' sel' : '') + '" data-q="0">Off</button><button class="chip' + (q ? ' sel' : '') + '" data-q="1">On</button></div>' +
        '<div id="qt" style="display:' + (q ? 'flex' : 'none') + ';gap:10px;align-items:center"><select id="qf">' + times(D.from) + '</select><span>to</span><select id="qto">' + times(D.to) + '</select></div>' +
        (opt.games.length ? '<h3>Hide ' + esc(opt.itemWord) + ' in ' + esc(APP_NAMES[opt.app] || 'this app') + '</h3><button class="btn ghost" data-a="hide">Choose ' + esc(opt.itemWord) + ' to hide (' + hid.length + ' hidden)</button>' : '') +
        '<h3>Family members</h3><button class="btn ghost" data-a="members">Manage family members</button>' +
        '<button class="btn ghost" data-a="newpin">Change parent PIN</button>' +
        '<div class="err"></div><button class="btn gold" data-a="save">Save rules</button>');
      $('#fn').oninput = () => { D.name = $('#fn').value; };
      $('#qf').onchange = () => { D.from = $('#qf').value; }; $('#qto').onchange = () => { D.to = $('#qto').value; };
      el.querySelectorAll('#lim .chip').forEach(c => (c.onclick = () => { D.lim = +c.dataset.m; el.querySelectorAll('#lim .chip').forEach(x => x.classList.toggle('sel', x === c)); }));
      el.querySelectorAll('#qon .chip').forEach(c => (c.onclick = () => { D.qOn = c.dataset.q === '1'; el.querySelectorAll('#qon .chip').forEach(x => x.classList.toggle('sel', x === c)); $('#qt').style.display = D.qOn ? 'flex' : 'none'; }));
      if ($('[data-a=hide]')) $('[data-a=hide]').onclick = () => go('hide');
      $('[data-a=members]').onclick = () => go('members');
      $('[data-a=newpin]').onclick = () => go('newpin');
      const b = $('[data-a=save]');
      b.onclick = busy(b, async () => {
        const fn = D.name, from = D.from, to = D.to, qOn = D.qOn, selLim = D.lim;
        if (qOn && from === to) throw new Error('Quiet hours need different start and end times.');
        await FAM.editRules(x => { x.name = clean(fn, 30) || x.name; x.dailyMinutes = selLim; x.quiet = qOn ? { from, to } : null; });
        draft = null; toast('Family rules saved'); stack = []; view = 'home'; render();
      });
      return;
    }
    if (view === 'hide') {
      const hid = new Set((r.hidden && r.hidden[opt.app]) || []);
      shell('🙈 Hide ' + esc(opt.itemWord), '<p class="muted">Hidden ' + esc(opt.itemWord) + ' disappear from ' + esc(APP_NAMES[opt.app] || 'this app') + ' on every family phone.</p>' +
        '<input class="search" id="hs" placeholder="Search ' + esc(opt.itemWord) + '">' +
        '<div class="card list" id="hl"></div><div class="err"></div><button class="btn gold" data-a="save">Save</button>');
      const draw = () => {
        const q = $('#hs').value.trim().toLowerCase();
        const gs = opt.games.filter(g => !q || g.name.toLowerCase().includes(q)).slice().sort((a, b) => (hid.has(b.id) - hid.has(a.id)) || a.name.localeCompare(b.name));
        $('#hl').innerHTML = gs.map(g => '<div class="row"><span class="n">' + esc(g.name) + '</span><button data-id="' + esc(g.id) + '" class="' + (hid.has(g.id) ? 'on' : '') + '">' + (hid.has(g.id) ? 'Hidden' : 'Shown') + '</button></div>').join('');
        $('#hl').querySelectorAll('button').forEach(bt => (bt.onclick = () => { const id = bt.dataset.id; hid.has(id) ? hid.delete(id) : hid.add(id); bt.classList.toggle('on', hid.has(id)); bt.textContent = hid.has(id) ? 'Hidden' : 'Shown'; }));
      };
      $('#hs').oninput = draw; draw();
      const b = $('[data-a=save]');
      b.onclick = busy(b, async () => { await FAM.editRules(x => { x.hidden = x.hidden || {}; x.hidden[opt.app] = [...hid]; }); toast('Saved'); FAM.back(); });
      return;
    }
    if (view === 'members') {
      const ms = FAM.members();
      shell('Family members', '<p class="muted">Each line is one Vast app on one phone. Removing one takes it out of the family; it can join again with the Family ID.</p><div class="card">' +
        (ms.map(m => '<div class="row"><span>' + (APPS[m.app] || '') + '</span><span class="n">' + esc(m.name || 'Player') + (m.self ? ' <span class="muted">(this phone)</span>' : '') + '<br><span class="muted">' + esc(APP_NAMES[m.app] || m.app) + '</span></span>' + (m.self ? '' : '<button data-id="' + esc(m.id) + '">Remove</button>') + '</div>').join('') || '<div class="muted">Nobody yet.</div>') + '</div><div class="err"></div>');
      el.querySelectorAll('.row button').forEach(bt => (bt.onclick = busy(bt, async () => { await FAM.removeMember(bt.dataset.id); toast('Removed'); render(); })));
      return;
    }
    if (view === 'newpin') {
      shell('Change parent PIN', '<label>New PIN (4 digits)</label><input id="p1" inputmode="numeric" maxlength="4" type="password"><input id="p2" inputmode="numeric" maxlength="4" type="password" placeholder="PIN again"><div class="err"></div><button class="btn gold" data-a="go">Save PIN</button>');
      const b = $('[data-a=go]');
      b.onclick = busy(b, async () => {
        const p1 = $('#p1').value; if (!/^\d{4}$/.test(p1)) throw new Error('The PIN is 4 digits.'); if (p1 !== $('#p2').value) throw new Error('The two PINs are different.');
        const salt = hex(crypto.getRandomValues(new Uint8Array(8))), hash = await sha(salt + ':' + p1);
        await FAM.editRules(x => { x.pin = { salt, hash }; }); toast('PIN changed'); FAM.back();
      });
      return;
    }
  }
  function times(sel) { let h = ''; for (let m = 0; m < 1440; m += 30) { const v = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); h += '<option value="' + v + '"' + (v === sel ? ' selected' : '') + '>' + FAM.fmtTime(v) + '</option>'; } return h; }
  function pinPad(title, prompt, check, host) {
    const box = host || el;
    const body = '<p style="text-align:center">' + esc(prompt) + '</p><div class="dots">' + '<i></i>'.repeat(4) + '</div><div class="err" style="text-align:center"></div><div class="pad">' +
      [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : '<button data-k="' + k + '">' + k + '</button>').join('') + '</div>';
    if (host) host.innerHTML = '<div class="sheet"><div class="top"><h2>' + title + '</h2><button class="x" data-a="close" aria-label="Close">&times;</button></div>' + body + '</div>';
    else shell(title, body);
    let pin = '';
    const dots = () => box.querySelectorAll('.dots i').forEach((d, i) => d.classList.toggle('f', i < pin.length));
    box.querySelectorAll('.pad button').forEach(b => (b.onclick = async () => {
      const k = b.dataset.k; if (k === '⌫') pin = pin.slice(0, -1); else if (pin.length < 4) pin += k; dots();
      if (pin.length === 4) { const ok = await check(pin); if (!ok) { box.querySelector('.err').textContent = 'That PIN is not right.'; pin = ''; dots(); } }
    }));
  }
  FAM.pinPad = pinPad;

  /* ---------- the rest screen (break / quiet hours) ---------- */
  let gateEl = null, gateKind = null;
  function checkGate() {
    const g = FAM.joined() ? gateState() : null;
    if (g === gateKind && (!!gateEl) === !!g) return;
    gateKind = g;
    if (!g) { if (gateEl) { gateEl.remove(); gateEl = null; } return; }
    if (!document.body) return;
    css(); if (!gateEl) { gateEl = document.createElement('div'); gateEl.id = 'vfam-gate'; document.body.appendChild(gateEl); }
    const r = FAM.rules();
    try { document.querySelectorAll('audio,video').forEach(m => m.pause()); } catch (e) {}
    try { window.dispatchEvent(new Event('vastfamilyrest')); } catch (e) {}
    gateEl.innerHTML = g === 'quiet'
      ? '<div><div class="moon">🌙</div><h2>Quiet hours</h2><p>The Vast apps are resting until ' + esc(FAM.fmtTime(r.quiet.to)) + '.</p><p>Sleep well — see you in the morning!</p><button data-a="unlock">Grown-up? Unlock</button></div>'
      : '<div><div class="moon">🌟</div><h2>Time for a break!</h2><p>That’s today’s ' + esc(r.dailyMinutes) + ' minutes of play in ' + esc(APP_NAMES[opt.app] || 'this app') + '.</p><p>Go stretch, play outside, or find your family — come back tomorrow!</p><button data-a="unlock">Grown-up? Unlock</button></div>';
    gateEl.querySelector('[data-a=unlock]').onclick = () => {
      const host = document.createElement('div'); host.id = 'vfam'; document.body.appendChild(host);
      const done = () => { host.remove(); };
      pinPad('🔒 Parent PIN', 'Enter the parent PIN to unlock', async pin => {
        if (!(await FAM.checkPin(pin))) return false;
        const now = new Date();
        host.innerHTML = '<div class="sheet"><div class="top"><h2>Unlock</h2><button class="x" data-a="close">&times;</button></div>' +
          (gateKind === 'quiet'
            ? '<button class="btn gold" data-u="q30">30 more minutes</button><button class="btn" data-u="qend">Until quiet hours end</button>'
            : '<button class="btn gold" data-u="15">15 more minutes</button><button class="btn" data-u="60">1 more hour</button><button class="btn ghost" data-u="day">No limit today</button>') + '</div>';
        host.querySelector('[data-a=close]').onclick = done;
        host.querySelectorAll('[data-u]').forEach(b => (b.onclick = () => {
          const u = b.dataset.u;
          if (u === 'q30') lset(UNLOCK, { until: now.getTime() + 30 * 60000 });
          else if (u === 'qend') lset(UNLOCK, { until: quietEnd(FAM.rules(), now) });
          else { const t = timeRec(); t.extra = u === 'day' ? 100000 : Math.max(0, Math.ceil(t.sec / 60) - (+FAM.rules().dailyMinutes || 0)) + (+u); lset(TIME(), t); }
          done(); checkGate();
        }));
        return true;
      }, host);
      host.querySelector('[data-a=close]').onclick = done;
    };
  }
  FAM.resting = () => !!gateEl;

  /* ---------- start ---------- */
  FAM.init = function (o) {
    opt = Object.assign(opt, o || {});
    const go = () => {
      checkGate();
      if (FAM.joined()) { FAM.sync(); }
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { lastTick = Date.now(); checkGate(); if (FAM.joined() && Date.now() - (st.at || 0) > 60000) FAM.sync(); } });
      setInterval(() => { if (FAM.joined() && document.visibilityState === 'visible') FAM.sync(); }, 5 * 60000);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  };
  FAM._test = { roomOf, rawKeyOf: async c => b64(await rawKeyOf(c)), gateState, inQuiet };
})();
