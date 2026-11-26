/*
 * Reads the family "Christmas List" spreadsheet layout into app data.
 *
 * Sheet layout (one tab per year):
 *   Row 1: header. Col A = "From", col B = category, then one column per recipient.
 *          Kids come first, then a repeated "From" column, then extended family.
 *   Col A of each row says who the gift is from: "A & J", "From <kid>", "Shark Tree"
 *          (Shark = Santa), "Stocking+", "Stocking". Blank = same as the row above.
 *   Col B is the slot's category (Clothes - Pajamas, Book, Toy, ...).
 *   Cell fill color = status, using the legend cells "Idea" / "Purchased" / "Wrapped".
 * Older tabs (2021) have no category column; their cells read "[Toy] Lego".
 * Kids are the recipients who also appear as gift-givers ("From Gabriel").
 */
(function (root) {
  'use strict';
  var STATUS_WORDS = { idea: 0, purchased: 1, bought: 1, wrapped: 2 };
  var DEFAULT_COLORS = { 'F9CB9C': 0, 'FFE599': 1, 'B6D7A8': 2 };
  var HEADER_SKIP = { from: 1, type: 1, as: 1, '': 1 };

  function str(v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); }

  function normFrom(raw) {
    var s = str(raw);
    if (!s) return '';
    if (/^(shark|santa)/i.test(s)) return 'Shark';
    if (/^stocking\s*\+/i.test(s)) return 'Stocking+';
    if (/^stocking/i.test(s)) return 'Stocking';
    if (/^a\s*&\s*j$/i.test(s)) return 'A & J';
    return s.replace(/^from\s+/i, '');
  }

  function fillOf(cell) {
    if (!cell || !cell.s || cell.s.patternType !== 'solid' || !cell.s.fgColor) return null;
    var rgb = cell.s.fgColor.rgb;
    return rgb ? String(rgb).slice(-6).toUpperCase() : null;
  }

  function parseSheet(XLSX, ws) {
    if (!ws || !ws['!ref']) return null;
    var range = XLSX.utils.decode_range(ws['!ref']);
    function cell(r, c) { return ws[XLSX.utils.encode_cell({ r: r, c: c })]; }
    function val(r, c) { var x = cell(r, c); return x ? str(x.w != null ? x.w : x.v) : ''; }

    // Status legend: whatever colors this tab uses for Idea / Purchased / Wrapped.
    var colors = {}, haveLegend = false, r, c;
    for (r = range.s.r; r <= Math.min(range.e.r, 40); r++) {
      for (c = 0; c <= Math.min(range.e.c, 30); c++) {
        var w = val(r, c).toLowerCase();
        if (STATUS_WORDS.hasOwnProperty(w) && fillOf(cell(r, c))) {
          colors[fillOf(cell(r, c))] = STATUS_WORDS[w]; haveLegend = true;
        }
      }
    }
    if (!haveLegend) colors = DEFAULT_COLORS;

    // Recipient columns from the header row.
    var hasCatCol = !val(0, 1);
    var start = hasCatCol ? 2 : 1, recips = [], blanks = 0;
    for (c = start; c <= range.e.c; c++) {
      var h = val(0, c);
      // A single unlabeled column (the repeated "From" column) can sit between kids and family.
      if (!h) { if (recips.length && ++blanks >= 2) break; continue; }
      blanks = 0;
      if (HEADER_SKIP[h.toLowerCase()]) continue;
      recips.push({ col: c, name: h });
    }
    if (!recips.length) return null;

    // Rows: who it's from + category.
    var rows = [], lastFrom = '';
    for (r = 1; r <= range.e.r; r++) {
      var f = normFrom(val(r, 0));
      var any = false;
      for (var i = 0; i < recips.length; i++) if (val(r, recips[i].col)) { any = true; break; }
      if (!f && !any && !(hasCatCol && val(r, 1))) continue;
      if (f) lastFrom = f; else f = lastFrom;
      if (!f) continue;
      rows.push({ r: r, from: f, cat: hasCatCol ? val(r, 1) : '' });
    }

    var froms = {};
    rows.forEach(function (x) { froms[x.from.toLowerCase()] = 1; });
    var people = recips.map(function (p, i) {
      return { id: 'p' + i, name: p.name, kind: froms[p.name.toLowerCase()] ? 'kid' : 'family' };
    });

    var slots = rows.map(function (x) { return { from: x.from, cat: x.cat }; });
    var gifts = [], n = 0;
    recips.forEach(function (p, pi) {
      var person = people[pi];
      rows.forEach(function (row, si) {
        var x = cell(row.r, p.col), t = val(row.r, p.col).replace(/[\\\s]+$/, '');
        if (!t || /^[-—–_\s]+$/.test(t) || /^\d+(\.\d+)?$/.test(t)) return;
        var status = colors[fillOf(x)];
        if (status == null) status = 0;
        if (/\s*-\s*wrap+(ed|oed)\s*$/i.test(t)) { status = 2; t = t.replace(/\s*-\s*wrap+(ed|oed)\s*$/i, ''); }
        var cat = row.cat, m = t.match(/^[\[(]([^\])]+)[\])]\s*(.*)$/);
        if (m) { cat = m[1].trim(); t = m[2].trim() || t; }
        if (person.kind === 'kid') {
          gifts.push({ id: 'g' + (n++), to: person.id, title: t, from: row.from, cat: cat, status: status, slot: si });
        } else {
          gifts.push({ id: 'g' + (n++), to: person.id, title: t, from: 'A & J', cat: '', status: status, slot: null });
        }
      });
    });
    return { people: people, slots: slots, gifts: gifts };
  }

  function parseWorkbook(XLSX, wb) {
    var years = {};
    wb.SheetNames.forEach(function (name) {
      var y = (name.match(/(19|20)\d\d/) || [])[0];
      if (!y) return;
      var parsed = parseSheet(XLSX, wb.Sheets[name]);
      if (parsed) years[y] = parsed;
    });
    return years;
  }

  var api = { parseWorkbook: parseWorkbook, parseSheet: parseSheet, normFrom: normFrom };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GiftImporter = api;
})(this);
