// Usage: node tools/make-seed.cjs "Christmas List.xlsx"
// Writes assets/seed.js so the app opens with the spreadsheet already loaded.
// seed.js holds family data, so it is gitignored; the app works without it (use Import instead).
const vm = require('vm'), fs = require('fs'), path = require('path');
const assets = path.join(__dirname, '..', 'assets');
const ctx = {}; ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(assets, 'xlsx.mini.min.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(assets, 'importer.js'), 'utf8').replace('})(this);', '})(globalThis);'), ctx);
const wb = ctx.XLSX.read(new Uint8Array(fs.readFileSync(process.argv[2])), { type: 'array', cellStyles: true });
const years = ctx.GiftImporter.parseWorkbook(ctx.XLSX, wb);
fs.writeFileSync(path.join(assets, 'seed.js'), 'window.SEED = ' + JSON.stringify({ years }) + ';\n');
for (const y of Object.keys(years).sort()) console.log(y, years[y].people.length, 'people,', years[y].gifts.length, 'gifts');
