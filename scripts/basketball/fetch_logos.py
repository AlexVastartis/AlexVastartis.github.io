"""
Download team logos for the basketball programs that have no BlueBloodFootball logo,
into assets/logos-src-basketball/<slug>.png (build-site-assets.mjs picks them up there).

Source: FantasyData's public static logo CDN (static.fantasydata.com, on S3), located via
the NCAA team list saved in gitlab.com/forrestsun1/cs373-idb (backend/data/teams.json).
Only Division I entries (those with a conference) are matched. Programs that list lacks
(the newest Division I members) keep their monogram badge.

This touches the network; run it once, then commit the PNGs:
  python3 scripts/basketball/fetch_logos.py
"""
import collections
import csv
import hashlib
import json
import os
import urllib.request

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(REPO, 'assets/logos-src-basketball')
TEAMS_URL = 'https://gitlab.com/forrestsun1/cs373-idb/-/raw/main/backend/data/teams.json'

# our school name -> FantasyData's
ALIAS = {
    'Arkansas-Pine Bluff': 'UAPB', 'Cal State Bakersfield': 'Bakersfield', 'Cal State Northridge': 'CSUN',
    'Central Connecticut': 'Central Connecticut State', 'Detroit Mercy': 'Detroit',
    'East Texas A&M': 'Texas A&M-Commerce', 'Grambling': 'Grambling State', 'IU Indy': 'IUPUI',
    'McNeese': 'McNeese State', 'Merrimack': 'Merrimack College', 'Pennsylvania': 'Penn',
    'Queens': 'Queens (NC)', 'SE Louisiana': 'Southeastern Louisiana', 'SIU Edwardsville': 'SIUE',
    'Saint Francis': 'Saint Francis U', 'South Carolina Upstate': 'USC Upstate',
    'St. Thomas': 'St. Thomas (MN)', 'The Citadel': 'Citadel', 'UC San Diego': 'California-San Diego',
    'UMass Lowell': 'Massachusetts-Lowell', 'UNC Greensboro': 'UNCG', 'UNC Wilmington': 'UNCW',
    'UT Rio Grande Valley': 'Texas-Rio Grande Valley', 'Boston University': 'Boston',
}


def main():
    teams = json.load(urllib.request.urlopen(TEAMS_URL, timeout=60))
    fd = {t['School'].lower(): t for t in teams if t.get('Conference') and t.get('TeamLogoUrl')}
    ident = list(csv.DictReader(l for l in open(os.path.join(REPO, 'data/basketball/staging/_staging_identity.csv')) if not l.startswith('#')))
    os.makedirs(OUT, exist_ok=True)
    got, missing, blobs = 0, [], {}
    for r in ident:
        if os.path.exists(os.path.join(REPO, 'public/logos', f"{r['slug']}.png")):
            continue  # the football logo is used
        t = fd.get(ALIAS.get(r['school'], r['school']).lower())
        if not t:
            missing.append(r['school'])
            continue
        with urllib.request.urlopen(t['TeamLogoUrl'], timeout=60) as resp:
            blobs[r['school'], r['slug']] = resp.read()
    # the same image for several schools is the CDN's generic NCAA placeholder — skip those
    seen = collections.Counter(hashlib.md5(b).hexdigest() for b in blobs.values())
    for (school, slug), b in blobs.items():
        if seen[hashlib.md5(b).hexdigest()] > 1:
            missing.append(f'{school} (placeholder)')
            continue
        with open(os.path.join(OUT, f'{slug}.png'), 'wb') as f:
            f.write(b)
        got += 1
    print(f'downloaded {got} logos; no logo found for {len(missing)}: {", ".join(missing)}')


if __name__ == '__main__':
    main()
