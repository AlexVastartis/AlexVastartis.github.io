/**
 * Canonical school-name mapping, shared by build-api-store.mjs and build-data.mjs.
 *
 * CollegeFootballData uses its own spellings ("Miami", "NC State", "Hawai'i", …).
 * We store everything under the names in data/manual/teams.csv. Anything that does
 * not resolve to one of those 130 names is not an FBS program we track and is
 * dropped from the store.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords } from './csv.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const IDENTITY = path.join(REPO, 'data/staging/_staging_identity.csv');

/** CFBD spelling -> our canonical school (data/staging/_staging_identity.csv) */
export const CANON = {
  Miami: 'Miami (FL)',
  'Southern California': 'USC',
  'NC State': 'North Carolina State',
  Massachusetts: 'UMass',
  Connecticut: 'UConn',
  "Hawai'i": 'Hawaii',
  'San José State': 'San Jose State',
  'Southern Mississippi': 'Southern Miss',
  'Florida International': 'FIU',
  'App State': 'Appalachian State',
  'Appalachian St': 'Appalachian State',
  'Louisiana Monroe': 'Louisiana-Monroe',
  'UL Monroe': 'Louisiana-Monroe',
  'Louisiana-Lafayette': 'Louisiana',
  'UL Lafayette': 'Louisiana',
  'Central Florida': 'UCF',
  'Middle Tennessee State': 'Middle Tennessee',
  'Texas-San Antonio': 'UTSA',
  'Texas-El Paso': 'UTEP',
  'Nevada-Las Vegas': 'UNLV',
  'Brigham Young': 'BYU',
  'Texas Christian': 'TCU',
  'Louisiana State': 'LSU',
  'Mississippi': 'Ole Miss',
  'Pitt': 'Pittsburgh',
};

export const canon = (s) => CANON[s] || s;

let _fbs = null;
/** the Set of the 130 canonical FBS school names */
export function fbsSet() {
  if (_fbs) return _fbs;
  _fbs = new Set(readRecords(fs.readFileSync(IDENTITY, 'utf8')).map((r) => r.school).filter(Boolean));
  return _fbs;
}

/** canonicalise, then return the name only if it is an FBS program we track (else null) */
export function fbsName(s) {
  const c = canon(s);
  return fbsSet().has(c) ? c : null;
}
