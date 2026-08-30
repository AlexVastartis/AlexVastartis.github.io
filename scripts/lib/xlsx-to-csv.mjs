/**
 * ONE-TIME SEED (historical). Converted the source spreadsheets into the first
 * editable CSVs. SUPERSEDED — inputs now live in data/staging/ (see
 * data/staging/README.md) and this writes to the old data/manual/ paths. Kept
 * only for reference; do not run against the current tree.
 *
 *   data/manual/teams.csv         school, slug, conference, primary_hex, secondary_hex, former_fcs
 *   data/manual/stats_manual.csv  school + all 10 raw stats (+ weeks_ap_no1, heismans)
 *
 * After seeding you maintain the CSVs by hand; the .xlsx files are no longer
 * needed. Re-run only if you want to re-derive from a fresh workbook (it
 * overwrites the CSVs).
 *
 *   node scripts/lib/xlsx-to-csv.mjs [--src "<folder with Blue Bloods.xlsx>"]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import xlsx from 'xlsx';
import { writeRecords } from './csv.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '../..');

const argSrc = process.argv.includes('--src')
  ? process.argv[process.argv.indexOf('--src') + 1]
  : null;
const SRC =
  argSrc ||
  process.env.BBF_SOURCE_DIR ||
  'C:/Users/Alex/Desktop/Desktop/Personal From Work PC/Hobbies/Football';
const OUT = path.join(REPO, 'data/manual');

const SLUG = {
  'Air Force': 'air-force', Akron: 'akron', Alabama: 'alabama', 'Appalachian State': 'appalachian-st',
  Arizona: 'arizona', 'Arizona State': 'arizona-st', Arkansas: 'arkansas', 'Arkansas State': 'arkansas-st',
  Army: 'army', Auburn: 'auburn', 'Ball State': 'ball-st', Baylor: 'baylor', 'Boise State': 'boise-st',
  'Boston College': 'boston-college', 'Bowling Green': 'bowling-green', Buffalo: 'buffalo', BYU: 'byu',
  California: 'california', 'Central Michigan': 'central-mich', Charlotte: 'charlotte', Cincinnati: 'cincinnati',
  Clemson: 'clemson', 'Coastal Carolina': 'coastal-caro', Colorado: 'colorado', 'Colorado State': 'colorado-st',
  Duke: 'duke', 'East Carolina': 'east-carolina', 'Eastern Michigan': 'eastern-mich', FIU: 'fiu',
  Florida: 'florida', 'Florida Atlantic': 'fla-atlantic', 'Florida State': 'florida-st', 'Fresno State': 'fresno-st',
  Georgia: 'georgia', 'Georgia Southern': 'ga-southern', 'Georgia State': 'georgia-st', 'Georgia Tech': 'georgia-tech',
  Hawaii: 'hawaii', Houston: 'houston', Illinois: 'illinois', Indiana: 'indiana', Iowa: 'iowa',
  'Iowa State': 'iowa-st', Kansas: 'kansas', 'Kansas State': 'kansas-st', 'Kent State': 'kent-st', Kentucky: 'kentucky',
  Liberty: 'liberty', Louisiana: 'la-lafayette', 'Louisiana Tech': 'louisiana-tech', 'Louisiana-Monroe': 'la-monroe',
  Louisville: 'louisville', LSU: 'lsu', Marshall: 'marshall', Maryland: 'maryland', Memphis: 'memphis',
  'Miami (FL)': 'miami-fl', 'Miami (OH)': 'miami-oh', Michigan: 'michigan', 'Michigan State': 'michigan-st',
  'Middle Tennessee': 'middle-tenn', Minnesota: 'minnesota', 'Mississippi State': 'mississippi-st', Missouri: 'missouri',
  Navy: 'navy', Nebraska: 'nebraska', Nevada: 'nevada', 'New Mexico': 'new-mexico', 'New Mexico State': 'new-mexico-st',
  'North Carolina': 'north-carolina', 'North Carolina State': 'north-carolina-st', 'North Texas': 'north-texas',
  'Northern Illinois': 'northern-ill', Northwestern: 'northwestern', 'Notre Dame': 'notre-dame', Ohio: 'ohio',
  'Ohio State': 'ohio-st', Oklahoma: 'oklahoma', 'Oklahoma State': 'oklahoma-st', 'Old Dominion': 'old-dominion',
  'Ole Miss': 'ole-miss', Oregon: 'oregon', 'Oregon State': 'oregon-st', 'Penn State': 'penn-st', Pittsburgh: 'pittsburgh',
  Purdue: 'purdue', Rice: 'rice', Rutgers: 'rutgers', 'San Diego State': 'san-diego-st', 'San Jose State': 'san-jose-st',
  SMU: 'smu', 'South Alabama': 'south-ala', 'South Carolina': 'south-carolina', 'South Florida': 'south-fla',
  'Southern Miss': 'southern-miss', Stanford: 'stanford', Syracuse: 'syracuse', TCU: 'tcu', Temple: 'temple',
  Tennessee: 'tennessee', Texas: 'texas', 'Texas A&M': 'texas-am', 'Texas State': 'texas-st', 'Texas Tech': 'texas-tech',
  Toledo: 'toledo', Troy: 'troy', Tulane: 'tulane', Tulsa: 'tulsa', UAB: 'uab', UCF: 'ucf', UCLA: 'ucla',
  UConn: 'uconn', UMass: 'massachusetts', UNLV: 'unlv', USC: 'southern-california', Utah: 'utah',
  'Utah State': 'utah-st', UTEP: 'utep', UTSA: 'utsa', Vanderbilt: 'vanderbilt', Virginia: 'virginia',
  'Virginia Tech': 'virginia-tech', 'Wake Forest': 'wake-forest', Washington: 'washington',
  'Washington State': 'washington-st', 'West Virginia': 'west-virginia', 'Western Kentucky': 'western-ky',
  'Western Michigan': 'western-mich', Wisconsin: 'wisconsin', Wyoming: 'wyoming',
};

const COLORS = {
  'Air Force': ['#003087', '#8a8d8f'], Akron: ['#00285e', '#84754e'], Alabama: ['#9e1b32', '#828a8f'],
  'Appalachian State': ['#000000', '#ffcc00'], Arizona: ['#003366', '#cc0033'], 'Arizona State': ['#8c1d40', '#ffc627'],
  Arkansas: ['#9d2235', '#000000'], 'Arkansas State': ['#cc092f', '#000000'], Army: ['#000000', '#d4bf91'],
  Auburn: ['#0c2340', '#e87722'], 'Ball State': ['#ba0c2f', '#000000'], Baylor: ['#154734', '#ffb81c'],
  'Boise State': ['#0033a0', '#d64309'], 'Boston College': ['#8a100b', '#b29d6c'], 'Bowling Green': ['#fe5000', '#4f2c1d'],
  Buffalo: ['#005bbb', '#000000'], BYU: ['#002e5d', '#c5c5c5'], California: ['#003262', '#fdb515'],
  'Central Michigan': ['#6a0032', '#ffc82e'], Charlotte: ['#046a38', '#b9975b'], Cincinnati: ['#e00122', '#000000'],
  Clemson: ['#f56600', '#522d80'], 'Coastal Carolina': ['#006f71', '#a27752'], Colorado: ['#cfb87c', '#000000'],
  'Colorado State': ['#1e4d2b', '#c8c372'], Duke: ['#001a57', '#000000'], 'East Carolina': ['#592a8a', '#f0907d'],
  'Eastern Michigan': ['#00694e', '#000000'], FIU: ['#081e3f', '#b6862c'], Florida: ['#0021a5', '#fa4616'],
  'Florida Atlantic': ['#003366', '#cc0000'], 'Florida State': ['#782f40', '#ceb888'], 'Fresno State': ['#db0032', '#003594'],
  Georgia: ['#ba0c2f', '#000000'], 'Georgia Southern': ['#00211d', '#87714d'], 'Georgia State': ['#0039a6', '#c60c30'],
  'Georgia Tech': ['#b3a369', '#003057'], Hawaii: ['#024731', '#c8c8c8'], Houston: ['#c8102e', '#a2aaad'],
  Illinois: ['#13294b', '#e84a27'], Indiana: ['#990000', '#eeedeb'], Iowa: ['#000000', '#ffcd00'],
  'Iowa State': ['#c8102e', '#f1be48'], Kansas: ['#0051ba', '#e8000d'], 'Kansas State': ['#512888', '#a7a7a7'],
  'Kent State': ['#002664', '#eaab00'], Kentucky: ['#0033a0', '#ffffff'], Liberty: ['#0a254e', '#990000'],
  Louisiana: ['#ce181e', '#000000'], 'Louisiana Tech': ['#002d72', '#e31b23'], 'Louisiana-Monroe': ['#840029', '#efb700'],
  Louisville: ['#ad0000', '#000000'], LSU: ['#461d7c', '#fdd023'], Marshall: ['#00b140', '#000000'],
  Maryland: ['#e03a3e', '#ffd520'], Memphis: ['#003087', '#898d8d'], 'Miami (FL)': ['#f47321', '#005030'],
  'Miami (OH)': ['#b61e2e', '#000000'], Michigan: ['#00274c', '#ffcb05'], 'Michigan State': ['#18453b', '#ffffff'],
  'Middle Tennessee': ['#0066cc', '#000000'], Minnesota: ['#7a0019', '#ffcc33'], 'Mississippi State': ['#5d1725', '#ffffff'],
  Missouri: ['#f1b82d', '#000000'], Navy: ['#00205b', '#c5b783'], Nebraska: ['#e41c38', '#000000'],
  Nevada: ['#003366', '#807f84'], 'New Mexico': ['#ba0c2f', '#63666a'], 'New Mexico State': ['#8b0d0d', '#ffffff'],
  'North Carolina': ['#7bafd4', '#13294b'], 'North Carolina State': ['#cc0000', '#000000'], 'North Texas': ['#00853e', '#000000'],
  'Northern Illinois': ['#ba0c2f', '#000000'], Northwestern: ['#4e2a84', '#ffffff'], 'Notre Dame': ['#0c2340', '#c99700'],
  Ohio: ['#00694e', '#ffffff'], 'Ohio State': ['#bb0000', '#666666'], Oklahoma: ['#841617', '#fdf9d8'],
  'Oklahoma State': ['#ff7300', '#000000'], 'Old Dominion': ['#003057', '#a1d2f1'], 'Ole Miss': ['#ce1126', '#14213d'],
  Oregon: ['#154733', '#fee123'], 'Oregon State': ['#dc4405', '#000000'], 'Penn State': ['#041e42', '#ffffff'],
  Pittsburgh: ['#003594', '#ffb81c'], Purdue: ['#ceb888', '#000000'], Rice: ['#00205b', '#c1c6c8'],
  Rutgers: ['#cc0033', '#000000'], 'San Diego State': ['#a6192e', '#000000'], 'San Jose State': ['#0055a2', '#e5a823'],
  SMU: ['#354ca1', '#c8102e'], 'South Alabama': ['#00205b', '#bf0d3e'], 'South Carolina': ['#73000a', '#000000'],
  'South Florida': ['#006747', '#cfc493'], 'Southern Miss': ['#000000', '#ffab00'], Stanford: ['#8c1515', '#ffffff'],
  Syracuse: ['#f76900', '#000e54'], TCU: ['#4d1979', '#a3a9ac'], Temple: ['#9d2235', '#ffffff'],
  Tennessee: ['#ff8200', '#ffffff'], Texas: ['#bf5700', '#ffffff'], 'Texas A&M': ['#500000', '#ffffff'],
  'Texas State': ['#501214', '#8d734a'], 'Texas Tech': ['#cc0000', '#000000'], Toledo: ['#15397f', '#ffd600'],
  Troy: ['#8a2432', '#c1c6c8'], Tulane: ['#006747', '#418fde'], Tulsa: ['#003366', '#c5b358'],
  UAB: ['#1e6b52', '#f4c300'], UCF: ['#000000', '#ba9b37'], UCLA: ['#2d68c4', '#f2a900'],
  UConn: ['#000e2f', '#e4002b'], UMass: ['#881c1c', '#000000'], UNLV: ['#cf0a2c', '#666666'],
  USC: ['#990000', '#ffc72c'], Utah: ['#cc0000', '#000000'], 'Utah State': ['#00263a', '#8e9089'],
  UTEP: ['#ff8200', '#041e42'], UTSA: ['#0c2340', '#f15a22'], Vanderbilt: ['#866d4b', '#000000'],
  Virginia: ['#232d4b', '#f84c1e'], 'Virginia Tech': ['#630031', '#cf4420'], 'Wake Forest': ['#9e7e38', '#000000'],
  Washington: ['#4b2e83', '#e8e3d3'], 'Washington State': ['#981e32', '#5e6a71'], 'West Virginia': ['#002855', '#eaaa00'],
  'Western Kentucky': ['#c60c30', '#000000'], 'Western Michigan': ['#6c4023', '#b5a167'], Wisconsin: ['#c5050c', '#ffffff'],
  Wyoming: ['#492f24', '#ffc425'],
};

const CONF_ALIAS = {
  'Miami FL': 'Miami (FL)', Miami: 'Miami (OH)', UNC: 'North Carolina', 'NC State': 'North Carolina State',
  'App State': 'Appalachian State', 'Arkanasas State': 'Arkansas State', ECU: 'East Carolina',
  FAU: 'Florida Atlantic', USF: 'South Florida', NIU: 'Northern Illinois', Fresno: 'Fresno State',
  'Louisiana at Lafayette': 'Louisiana', 'Louisiana at Monroe': 'Louisiana-Monroe', 'Middle Tenn': 'Middle Tennessee',
  'New Mexico State University': 'New Mexico State', 'Liberty University': 'Liberty',
};

const num = (v) => (v === '' || v == null ? 0 : Number(v));

function readConferences() {
  const wb = xlsx.readFile(path.join(SRC, 'Conference.xlsx'));
  const cur = xlsx.utils.sheet_to_json(wb.Sheets.Current, { header: 1, defval: '' });
  const map = {};
  const put = (name, conf) => {
    if (!name) return;
    map[CONF_ALIAS[name] || name] = conf;
  };
  for (let i = 1; i <= 18; i += 1) {
    put(cur[i]?.[1], 'Big Ten');
    put(cur[i]?.[2], 'SEC');
  }
  for (let i = 21; i <= 38; i += 1) {
    put(cur[i]?.[1], 'ACC');
    put(cur[i]?.[2], 'Big 12');
    put(cur[i]?.[3], 'Pac-12');
    put(cur[i]?.[4], 'Independent');
  }
  for (let i = 41; i <= 58; i += 1) {
    put(cur[i]?.[1], 'American');
    put(cur[i]?.[2], 'MAC');
    put(cur[i]?.[3], 'Mountain West');
    put(cur[i]?.[4], 'Sun Belt');
  }
  for (let i = 61; i <= 70; i += 1) put(cur[i]?.[3], 'Conference USA');
  return map;
}

function main() {
  if (!fs.existsSync(path.join(SRC, 'Blue Bloods.xlsx'))) {
    console.error(`Source workbook not found in: ${SRC}\nPass --src "<folder>" or set BBF_SOURCE_DIR.`);
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const conference = readConferences();

  const wb = xlsx.readFile(path.join(SRC, 'Blue Bloods.xlsx'));
  const raw = xlsx.utils.sheet_to_json(wb.Sheets['BBR Raw'], { header: 1, defval: '' });
  const STOP = new Set(['Minimum', 'Maximum', 'Range', 'Mean', 'Standard Deviation', '']);

  const teamRecs = [];
  const statRecs = [];
  const problems = [];
  for (let i = 2; i < raw.length; i += 1) {
    const r = raw[i];
    const school = String(r[1]).trim();
    if (STOP.has(school)) continue;
    const slug = SLUG[school] || '';
    const color = COLORS[school] || ['#5b6770', '#b0b7bc'];
    if (!slug) problems.push(`no slug: ${school}`);
    if (!COLORS[school]) problems.push(`no color: ${school}`);
    if (!conference[school]) problems.push(`no conference: ${school}`);

    teamRecs.push({
      school,
      slug,
      conference: conference[school] || 'Independent',
      primary_hex: color[0],
      secondary_hex: color[1],
      former_fcs: String(r[13]).trim().toUpperCase() === 'X' ? 1 : 0,
    });
    statRecs.push({
      school,
      all_time_wins: num(r[2]),
      win_pct: num(r[3]) / 1000,
      national_titles: num(r[4]),
      conference_titles: num(r[5]),
      consensus_aa: num(r[6]),
      unanimous_aa: num(r[7]),
      nfl_draft_picks: num(r[8]),
      first_round_picks: num(r[9]),
      weeks_ap_poll: num(r[11]),
      weeks_ap_top10: num(r[10]),
      weeks_ap_no1: num(r[14]),
      heismans: num(r[15]),
    });
  }

  fs.writeFileSync(
    path.join(OUT, 'teams.csv'),
    writeRecords(['school', 'slug', 'conference', 'primary_hex', 'secondary_hex', 'former_fcs'], teamRecs),
  );
  fs.writeFileSync(
    path.join(OUT, 'stats_manual.csv'),
    writeRecords(
      ['school', 'all_time_wins', 'win_pct', 'national_titles', 'conference_titles', 'consensus_aa',
        'unanimous_aa', 'nfl_draft_picks', 'first_round_picks', 'weeks_ap_poll', 'weeks_ap_top10',
        'weeks_ap_no1', 'heismans'],
      statRecs,
    ),
  );

  console.log(`Wrote ${teamRecs.length} teams to ${path.relative(REPO, OUT)}/`);
  if (problems.length) console.log('Issues:\n  ' + problems.join('\n  '));
  else console.log('No slug/color/conference gaps.');
}

main();
