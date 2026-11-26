/*
 * Shared lists: codes, end-to-end encryption and merging (server API: AppShelf API.md, "Shared lists").
 *
 * The code never leaves the phone. From it we derive:
 *   room = hex SHA-256 of "vast-share:" + CODE        (the only thing the server sees, besides ciphertext)
 *   key  = PBKDF2-SHA256(CODE, "vast-share-key", 150000) -> AES-256-GCM
 *   data = base64(12-byte IV || AES-GCM ciphertext of the JSON list)
 *
 * The shared document is { fmt: 3, years: { "2026": { people, slots, gifts, notes, gone } } } (notes = list items, since 2.2).
 * Every person / slot / gift has a stable id and u (updatedAt, ms). Deletes leave a tombstone in
 * gone[id] = deletedAt. Merging takes, per id, whichever of the live copies and tombstones is newest
 * (a tombstone wins a tie), so two phones editing at once keep each other's changes.
 */
(function (root) {
  'use strict';
  var ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  function cryptoOk() {
    return !!(root.crypto && root.crypto.subtle && root.crypto.getRandomValues && root.TextEncoder);
  }

  /* ---------- codes ---------- */
  function normCode(s) { return String(s == null ? '' : s).toUpperCase().replace(/[\s\-‐-―_.]/g, ''); }
  function validCode(c) {
    if (c.length !== 12) return false;
    for (var i = 0; i < c.length; i++) if (ALPHABET.indexOf(c[i]) < 0) return false;
    return true;
  }
  function formatCode(c) { c = normCode(c); return c.slice(0, 4) + '-' + c.slice(4, 8) + '-' + c.slice(8, 12); }
  function newCode() {
    var out = '', buf = new Uint8Array(32);
    while (out.length < 12) {
      root.crypto.getRandomValues(buf);
      for (var i = 0; i < buf.length && out.length < 12; i++) {
        if (buf[i] < 248) out += ALPHABET[buf[i] % 31]; // 248 = 8 * 31: no bias
      }
    }
    return out;
  }

  /* ---------- crypto ---------- */
  function utf8(s) { return new TextEncoder().encode(s); }
  function hex(buf) {
    var b = new Uint8Array(buf), s = '';
    for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16);
    return s;
  }
  function toB64(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function fromB64(b64) {
    var s = atob(b64), b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
  }
  function roomFor(code) {
    return root.crypto.subtle.digest('SHA-256', utf8('vast-share:' + normCode(code))).then(hex);
  }
  function keyFor(code) {
    var subtle = root.crypto.subtle;
    return subtle.importKey('raw', utf8(normCode(code)), 'PBKDF2', false, ['deriveKey']).then(function (base) {
      return subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: utf8('vast-share-key'), iterations: 150000 },
        base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  function encrypt(key, obj) {
    var iv = root.crypto.getRandomValues(new Uint8Array(12));
    return root.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, utf8(JSON.stringify(obj))).then(function (ct) {
      var all = new Uint8Array(12 + ct.byteLength);
      all.set(iv, 0); all.set(new Uint8Array(ct), 12);
      return toB64(all);
    });
  }
  function decrypt(key, b64) {
    var all = fromB64(b64);
    return root.crypto.subtle.decrypt({ name: 'AES-GCM', iv: all.subarray(0, 12) }, key, all.subarray(12)).then(function (pt) {
      return JSON.parse(new TextDecoder().decode(pt));
    });
  }

  /* ---------- merge ---------- */
  // Stable JSON (sorted keys) so the same content always compares equal.
  function canon(x) {
    if (x === null || typeof x !== 'object') return JSON.stringify(x === undefined ? null : x);
    if (Array.isArray(x)) return '[' + x.map(canon).join(',') + ']';
    return '{' + Object.keys(x).filter(function (k) { return x[k] !== undefined; }).sort()
      .map(function (k) { return JSON.stringify(k) + ':' + canon(x[k]); }).join(',') + '}';
  }
  function newer(a, b) { // the copy to keep when both phones have the same id
    if (!a) return b; if (!b) return a;
    var ua = a.u || 0, ub = b.u || 0;
    if (ua !== ub) return ua > ub ? a : b;
    return canon(a) >= canon(b) ? a : b; // same time: pick the same one on every phone
  }
  // Remote order first; items only this phone has go in after the item they follow here.
  function mergeList(local, remote) {
    local = local || []; remote = remote || [];
    var L = {}, R = {}, i;
    for (i = 0; i < local.length; i++) L[local[i].id] = local[i];
    for (i = 0; i < remote.length; i++) R[remote[i].id] = remote[i];
    var out = remote.map(function (r) { return newer(L[r.id], r); });
    var ids = out.map(function (x) { return x.id; }), at = -1;
    for (i = 0; i < local.length; i++) {
      var id = local[i].id;
      if (R[id]) { at = ids.indexOf(id); continue; }
      at++;
      out.splice(at, 0, local[i]); ids.splice(at, 0, id);
    }
    return out;
  }
  function mergeYear(l, r) {
    if (!l) return r; if (!r) return l;
    var gone = {}, k;
    [l.gone || {}, r.gone || {}].forEach(function (g) { for (k in g) gone[k] = Math.max(gone[k] || 0, g[k]); });
    var alive = function (x) { return !(gone[x.id] >= (x.u || 0)); };
    var people = mergeList(l.people, r.people).filter(alive);
    var slots = mergeList(l.slots, r.slots).filter(alive);
    var gifts = mergeList(l.gifts, r.gifts).filter(alive);
    var notes = mergeList(l.notes, r.notes).filter(alive);
    // A gift for someone who was removed goes with them.
    gifts = gifts.filter(function (g) {
      if (!gone[g.to] || people.some(function (p) { return p.id === g.to; })) return true;
      gone[g.id] = Math.max(gone[g.id] || 0, g.u || 0);
      return false;
    });
    // A list for someone who was removed goes with them ("_all" is the list for everyone).
    notes = notes.filter(function (n) {
      if (n.to === '_all' || !gone[n.to] || people.some(function (p) { return p.id === n.to; })) return true;
      gone[n.id] = Math.max(gone[n.id] || 0, n.u || 0);
      return false;
    });
    return { people: people, slots: slots, gifts: gifts, notes: notes, gone: gone };
  }
  function mergeDocs(local, remote) {
    var ly = (local && local.years) || {}, ry = (remote && remote.years) || {}, years = {}, y;
    for (y in ry) years[y] = mergeYear(ly[y], ry[y]);
    for (y in ly) if (!years[y]) years[y] = ly[y];
    return { fmt: 3, years: years };
  }

  var api = {
    ALPHABET: ALPHABET, cryptoOk: cryptoOk, normCode: normCode, validCode: validCode, formatCode: formatCode,
    newCode: newCode, roomFor: roomFor, keyFor: keyFor, encrypt: encrypt, decrypt: decrypt,
    canon: canon, mergeList: mergeList, mergeYear: mergeYear, mergeDocs: mergeDocs
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GiftShare = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
