const OVERRIDES: Record<string, string> = {
  'Ohio State': 'OSU', 'Oklahoma State': 'OKST', 'Oregon State': 'ORST',
  'Michigan State': 'MSU', 'Florida State': 'FSU', 'Penn State': 'PSU',
  'Arizona State': 'ASU', 'Kansas State': 'KSU', 'Iowa State': 'ISU',
  'Mississippi State': 'MSST', 'Washington State': 'WSU', 'Colorado State': 'CSU',
  'Boise State': 'BSU', 'San Diego State': 'SDSU', 'San Jose State': 'SJSU',
  'Fresno State': 'FRES', 'Appalachian State': 'APP', 'Texas A&M': 'A&M',
  'Notre Dame': 'ND', 'North Carolina': 'UNC', 'North Carolina State': 'NCST',
  'South Carolina': 'SC', 'West Virginia': 'WVU', 'Virginia Tech': 'VT',
  'Georgia Tech': 'GT', 'Boston College': 'BC', 'Miami (FL)': 'MIA', 'Miami (OH)': 'M-OH',
  'Ole Miss': 'MISS', 'LSU': 'LSU', 'BYU': 'BYU', 'TCU': 'TCU', 'SMU': 'SMU',
  'UCF': 'UCF', 'UCLA': 'UCLA', 'USC': 'USC', 'UAB': 'UAB', 'UNLV': 'UNLV',
  'UConn': 'UCN', 'UMass': 'MASS', 'UTEP': 'UTEP', 'UTSA': 'UTSA',
  'Louisiana-Monroe': 'ULM', 'Louisiana': 'ULL', 'Louisiana Tech': 'LT',
  'Western Kentucky': 'WKU', 'Western Michigan': 'WMU', 'Central Michigan': 'CMU',
  'Eastern Michigan': 'EMU', 'Northern Illinois': 'NIU', 'Middle Tennessee': 'MTSU',
  'East Carolina': 'ECU', 'Florida Atlantic': 'FAU', 'South Florida': 'USF',
  'South Alabama': 'USA', 'Georgia Southern': 'GASO', 'Georgia State': 'GAST',
  'Old Dominion': 'ODU', 'New Mexico State': 'NMSU', 'New Mexico': 'UNM',
  'Air Force': 'AF', 'Kent State': 'KENT', 'Ball State': 'BALL', 'Bowling Green': 'BGSU',
  'Arkansas State': 'ARST', 'Coastal Carolina': 'CCU', 'Southern Miss': 'USM',
};

/** short label for bubble markers */
export function abbrev(school: string): string {
  if (OVERRIDES[school]) return OVERRIDES[school];
  const words = school.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
}
