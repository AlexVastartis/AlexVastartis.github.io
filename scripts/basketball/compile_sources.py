"""
Compile the BlueBloodBasketball staging CSVs (data/basketball/staging/) from the
raw public source dumps. This is a ONE-OFF / refresh step — `npm run build:data:bb`
never runs it and never touches the network; it reads only the committed staging CSVs.

Sources (all public, fetched once into $RAW — see data/basketball/README.md):
  $RAW/ob/ncaa_sr/csv/{years,polls,schools}.csv, games.csv.gz
        github.com/octonion/basketball — a Sports-Reference (college basketball) scrape:
        per-(school, season) W-L, conference, NCAA tournament result 1893–2016,
        every weekly AP poll 1950–2016, conference regular-season title totals.
  $RAW/espn/mbb_schedule_{2016..2026}.csv
        github.com/sportsdataverse/sportsdataverse-data releases
        (espn_mens_college_basketball_schedules) — every ESPN game, 2016-17 → 2025-26:
        results, conference-game flag, NCAA tournament round, AP rank (2023+).
  data/basketball/archive/espn_ranks_{2017..2022}.csv
        AP rank per (team, poll week) read from the ESPN game JSON for the seasons whose
        schedule file carries no rank column (scripts/basketball/fetch_espn_ranks.py).
  data/basketball/staging/_staging_vacated.csv     (hand-curated NCAA vacations)

Season labels are the calendar year the season ENDS in (2026 = 2025-26), matching
Sports-Reference. Sports-Reference covers seasons through 2016; ESPN from 2017 on.

Run:  RAW=/path/to/raw python3 scripts/basketball/compile_sources.py
"""
import json
import os
import re
import sys
from collections import defaultdict

import pandas as pd

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RAW = os.environ.get('RAW', '/tmp/claude-0/src')
SR = os.path.join(RAW, 'ob/ncaa_sr/csv')
ESPN = os.path.join(RAW, 'espn')
OUT = os.path.join(REPO, 'data/basketball/staging')
ARCH = os.path.join(REPO, 'data/basketball/archive')
FOOTBALL_IDENTITY = os.path.join(REPO, 'data/staging/_staging_identity.csv')

SR_LAST = 2016          # last season taken from Sports-Reference
ESPN_FIRST, LAST = 2017, 2026

# ESPN conference id -> display name (2025-26 alignment)
CONF = {
    1: 'America East', 2: 'ACC', 3: 'Atlantic 10', 4: 'Big East', 5: 'Big Sky', 6: 'Big South',
    7: 'Big Ten', 8: 'Big 12', 9: 'Big West', 10: 'CAA', 11: 'C-USA', 12: 'Ivy League',
    13: 'MAAC', 14: 'MAC', 16: 'MEAC', 18: 'Missouri Valley', 19: 'NEC', 20: 'Ohio Valley',
    22: 'Patriot', 23: 'SEC', 24: 'SoCon', 25: 'Southland', 26: 'SWAC', 27: 'Sun Belt',
    29: 'West Coast', 30: 'WAC', 44: 'Mountain West', 45: 'Horizon', 46: 'ASUN',
    49: 'Summit', 62: 'American',
}

# ESPN team location -> Sports-Reference school_id, where the display names differ
ESPN_TO_SR = {
    'UAB': 'alabama-birmingham', 'San José State': 'san-jose-state', 'California': 'california',
    'UC Riverside': 'california-riverside', 'USC': 'southern-california', 'UConn': 'connecticut',
    'American University': 'american', 'George Washington': 'george-washington', 'Delaware': 'delaware',
    "Hawai'i": 'hawaii', 'UIC': 'illinois-chicago', 'IU Indianapolis': 'iupui', 'LSU': 'louisiana-state',
    'Kansas City': 'missouri-kansas-city', 'Ole Miss': 'mississippi', 'NC State': 'north-carolina-state',
    'North Dakota': 'north-dakota', 'Bowling Green': 'bowling-green-state', 'Charleston': 'college-of-charleston',
    'UT Arlington': 'texas-arlington', 'BYU': 'brigham-young', 'UT Rio Grande Valley': 'texas-pan-american',
    'Long Beach State': 'long-beach-state', 'UC Irvine': 'california-irvine', 'UC Davis': 'california-davis',
    'Louisiana': 'louisiana-lafayette', 'UNC Wilmington': 'north-carolina-wilmington', 'UAlbany': 'albany-ny',
    'App State': 'appalachian-state', 'Little Rock': 'arkansas-little-rock',
    'Central Connecticut': 'central-connecticut-state', 'UCF': 'central-florida', 'Grand Canyon': 'grand-canyon',
    'Houston Christian': 'houston-baptist', 'UMass Lowell': 'massachusetts-lowell', 'Loyola Chicago': 'loyola-il',
    'Loyola Maryland': 'loyola-md', 'McNeese': 'mcneese-state', 'UMBC': 'maryland-baltimore-county',
    'Maryland Eastern Shore': 'maryland-eastern-shore', 'Miami': 'miami-fl', 'UNC Asheville': 'north-carolina-asheville',
    'UNC Greensboro': 'north-carolina-greensboro', 'UL Monroe': 'louisiana-monroe', 'Omaha': 'nebraska-omaha',
    'UNLV': 'nevada-las-vegas', 'Nicholls': 'nicholls-state', 'Prairie View A&M': 'prairie-view',
    'Sam Houston': 'sam-houston-state', 'UC Santa Barbara': 'california-santa-barbara',
    'SE Louisiana': 'southeastern-louisiana', 'Seattle U': 'seattle', 'SIU Edwardsville': 'southern-illinois-edwardsville',
    'SMU': 'southern-methodist', 'Southern Miss': 'southern-mississippi', 'Saint Francis': 'saint-francis-pa',
    "St. John's": 'st-johns-ny', "Saint Mary's": 'saint-marys-ca', 'TCU': 'texas-christian',
    'UT Martin': 'tennessee-martin', 'UTSA': 'texas-san-antonio', 'UTEP': 'texas-el-paso', 'The Citadel': 'citadel',
    'VCU': 'virginia-commonwealth', 'Valparaiso': 'valparaiso', 'VMI': 'virginia-military-institute',
    'Purdue Fort Wayne': 'ipfw', 'Long Island University': 'long-island-university',
}

# ESPN location -> the school name shown on the site (default: the ESPN location).
# Names match BlueBloodFootball's where the program is in both (so the logos carry over).
DISPLAY = {
    'Miami': 'Miami (FL)', 'App State': 'Appalachian State', "Hawai'i": 'Hawaii',
    'San José State': 'San Jose State', 'UL Monroe': 'Louisiana-Monroe', 'Massachusetts': 'UMass',
    'American University': 'American', 'Queens University': 'Queens', 'Long Island University': 'LIU',
    'St. Thomas-Minnesota': 'St. Thomas', 'Seattle U': 'Seattle', 'Florida International': 'FIU',
    'NC State': 'NC State', 'UAlbany': 'Albany', 'IU Indianapolis': 'IU Indy',
}

# site name -> BlueBloodFootball's name for the same school (so its slug / logo carries over)
FB_NAME = {'NC State': 'North Carolina State'}


def slugify(s):
    s = s.lower().replace('&', '').replace("'", '').replace('.', '')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def et_date(s):
    return (pd.to_datetime(s, utc=True) - pd.Timedelta(hours=5)).dt.tz_localize(None).dt.normalize()


def load_espn(y, cols=None):
    base = ['id', 'date', 'season_type', 'status_type_completed', 'notes_headline', 'tournament_id',
            'conference_competition', 'home_id', 'away_id', 'home_score', 'away_score', 'home_winner',
            'away_winner', 'home_conference_id', 'away_conference_id']
    hdr = pd.read_csv(os.path.join(ESPN, f'mbb_schedule_{y}.csv'), nrows=0).columns
    use = [c for c in base + (cols or []) if c in hdr]
    d = pd.read_csv(os.path.join(ESPN, f'mbb_schedule_{y}.csv'), usecols=use, low_memory=False)
    d = d[d.status_type_completed == True].drop_duplicates('id').copy()  # noqa: E712
    d['day'] = et_date(d.date)
    for c in ['home_id', 'away_id']:
        d[c] = d[c].astype(int)
    return d


def main():
    os.makedirs(OUT, exist_ok=True)

    # ---------------- the universe: every 2025-26 Division I program ----------------
    d26 = load_espn(LAST, ['home_location', 'away_location', 'home_color', 'away_color',
                           'home_alternate_color', 'away_alternate_color', 'home_abbreviation', 'away_abbreviation'])
    rows = []
    for s in ['home', 'away']:
        x = d26[[f'{s}_id', f'{s}_location', f'{s}_conference_id', f'{s}_color', f'{s}_alternate_color', f'{s}_abbreviation']]
        x.columns = ['espn_id', 'location', 'conf', 'color', 'alt', 'abbr']
        rows.append(x)
    t = pd.concat(rows)
    g = t.groupby('espn_id').agg(location=('location', 'first'), n=('location', 'size'),
                                 conf=('conf', lambda s: s.dropna().mode().iloc[0] if s.notna().any() else None),
                                 color=('color', 'first'), alt=('alt', 'first'), abbr=('abbr', 'first')).reset_index()
    teams = g[g.conf.notna() & (g.n >= 15)].copy()
    assert len(teams) == 365, len(teams)

    srs = pd.read_csv(os.path.join(SR, 'schools.csv'))
    sr_by_name = {}
    for r in srs.itertuples():
        # "Michigan Wolverines" -> map the ESPN display name directly
        sr_by_name[r.school] = r.school_id
    d26n = pd.read_csv(os.path.join(ESPN, f'mbb_schedule_{LAST}.csv'), usecols=['home_id', 'home_display_name', 'away_id', 'away_display_name'], low_memory=False)
    disp = dict(zip(d26n.home_id, d26n.home_display_name)) | dict(zip(d26n.away_id, d26n.away_display_name))

    fb = pd.read_csv(FOOTBALL_IDENTITY, comment='#')
    fb_slug = dict(zip(fb.school, fb.slug))

    ident = []
    for r in teams.itertuples():
        sr_id = ESPN_TO_SR.get(r.location) or sr_by_name.get(disp.get(r.espn_id))
        school = DISPLAY.get(r.location, r.location)
        slug = fb_slug.get(school) or fb_slug.get(FB_NAME.get(school, '')) or slugify(school)
        ident.append({
            'school': school, 'slug': slug, 'espn_id': int(r.espn_id), 'sr_id': sr_id or '',
            'abbr': r.abbr, 'primary_hex': f'#{r.color}' if isinstance(r.color, str) else '#555555',
            'secondary_hex': f'#{r.alt}' if isinstance(r.alt, str) else '#999999',
            'conference': CONF[int(r.conf)], 'former_fcs': 0,
        })
    ident = pd.DataFrame(ident).sort_values('school')
    assert ident.school.is_unique and ident.slug.is_unique
    by_espn = dict(zip(ident.espn_id, ident.school))
    by_sr = {r.sr_id: r.school for r in ident.itertuples() if r.sr_id}
    print(f'universe: {len(ident)} programs, {len(by_sr)} with Sports-Reference history')

    # ---------------- vacated (hand-curated) ----------------
    vac = pd.read_csv(os.path.join(OUT, '_staging_vacated.csv'), comment='#').fillna('')
    vac_by = {(r.school, int(r.season)): r for r in vac.itertuples()}
    for (s, _y) in vac_by:
        assert s in set(ident.school), f'vacated: unknown school {s}'

    # ================= wins: per (school, season) =================
    y = pd.read_csv(os.path.join(SR, 'years.csv'))
    y = y[y.school_id.isin(by_sr) & (y.year <= SR_LAST)]
    wins = [{'school': by_sr[r.school_id], 'season': int(r.year), 'wins': int(r.wins), 'losses': int(r.losses),
             'source': 'sports-reference'} for r in y.itertuples()]
    espn_games = {yr: load_espn(yr) for yr in range(ESPN_FIRST, LAST + 1)}
    for yr, d in espn_games.items():
        w = defaultdict(lambda: [0, 0])
        for r in d.itertuples():
            if pd.isna(r.home_score) or pd.isna(r.away_score) or r.home_score == r.away_score:
                continue
            hw = r.home_score > r.away_score
            if r.home_id in by_espn:
                w[r.home_id][0 if hw else 1] += 1
            if r.away_id in by_espn:
                w[r.away_id][1 if hw else 0] += 1
        for tid, (ww, ll) in w.items():
            if ww + ll >= 5:
                wins.append({'school': by_espn[tid], 'season': yr, 'wins': ww, 'losses': ll, 'source': 'espn'})
    wins = pd.DataFrame(wins)
    wins['ties'] = 0
    wins['wins_vacated'] = [int(vac_by[(r.school, r.season)].wins_vacated or 0) if (r.school, r.season) in vac_by else 0 for r in wins.itertuples()]
    wins['losses_vacated'] = [int(vac_by[(r.school, r.season)].losses_vacated or 0) if (r.school, r.season) in vac_by else 0 for r in wins.itertuples()]
    wins['vacated_note'] = [vac_by[(r.school, r.season)].note if (r.school, r.season) in vac_by and (r.wins_vacated or r.losses_vacated) else '' for r in wins.itertuples()]
    wins = wins.sort_values(['school', 'season'])

    # ================= NCAA tournament: per (school, season) =================
    field = y[y.ncaa_tournament.notna()].groupby('year').size().to_dict()
    tour = []
    for r in y[y.ncaa_tournament.notna()].itertuples():
        res = r.ncaa_tournament
        small = field.get(r.year, 99) <= 16
        ff = res in ('Won National Final', 'Lost National Final', 'Lost National Semifinal') or \
            (res == 'Lost Regional Final (Final Four)' and r.year <= 1951)
        e8 = ff or res.startswith('Lost Regional Final') or (r.year <= 1951 and small)
        s16 = e8 or res == 'Lost Regional Semifinal' or small
        tour.append({'school': by_sr[r.school_id], 'season': int(r.year), 'result': res, 'appearance': 1,
                     'sweet16': int(s16), 'elite8': int(e8), 'final_four': int(ff),
                     'champion': int(res == 'Won National Final'), 'source': 'sports-reference'})
    # ESPN 2017+: round from the headline (2021+) or from the date offset before the final (2017–19)
    ROUND_ORDER = ['First Four', '1st Round', '2nd Round', 'Sweet 16', 'Elite 8', 'Final Four', 'National Championship']
    for yr, d in espn_games.items():
        n = d[(d.season_type == 3) & (d.tournament_id == 22)].copy()
        if n.empty:
            continue  # 2020: no tournament
        if n.notes_headline.fillna('').str.contains("Men's Basketball Championship").any():
            n['round'] = n.notes_headline.str.extract(r'(First Four|1st Round|2nd Round|Sweet 16|Elite 8|Final Four|National Championship)')[0]
        else:
            F = n.day.max()
            off = (F - n.day).dt.days

            def rnd(o):
                return ('National Championship' if o == 0 else 'Final Four' if o <= 2 else 'Elite 8' if o <= 9 else
                        'Sweet 16' if o <= 11 else '2nd Round' if o <= 16 else '1st Round' if o <= 18 else 'First Four')
            n['round'] = off.map(rnd)
        assert n['round'].notna().all(), yr
        best = {}
        for r in n.itertuples():
            k = ROUND_ORDER.index(r.round)
            for tid, won in ((r.home_id, r.home_score > r.away_score), (r.away_id, r.away_score > r.home_score)):
                if tid not in by_espn:
                    continue
                cur = best.get(tid, (-1, False))
                if k > cur[0]:
                    best[tid] = (k, won)
        for tid, (k, won) in best.items():
            rd = ROUND_ORDER[k]
            label = 'Won National Final' if rd == 'National Championship' and won else f'Lost {rd}'
            tour.append({'school': by_espn[tid], 'season': yr, 'result': label, 'appearance': 1,
                         'sweet16': int(k >= 3), 'elite8': int(k >= 4), 'final_four': int(k >= 5),
                         'champion': int(label == 'Won National Final'), 'source': 'espn'})
    tour = pd.DataFrame(tour)
    tour['vacated'] = [int(bool((r.school, r.season) in vac_by and vac_by[(r.school, r.season)].tournament_vacated))
                       for r in tour.itertuples()]
    tour = tour.sort_values(['season', 'school'])
    champs = tour[tour.champion == 1].groupby('season').school.apply(list)
    assert all(len(v) == 1 for v in champs), champs[champs.map(len) != 1]
    ff_count = tour[tour.final_four == 1].groupby('season').size()
    print('Final Four teams per season (should be 4):', ff_count[ff_count != 4].to_dict())

    # national titles (NCAA tournament champions)
    titles = pd.DataFrame([{
        'school': r.school, 'year': r.season, 'scope': 'national', 'selector': 'NCAA', 'conference': '',
        'shared': 0, 'status': 'vacated' if r.vacated else '', 'source': r.source,
    } for r in tour[tour.champion == 1].itertuples()])

    # ================= AP poll: per (school, season) =================
    ap = defaultdict(lambda: {'weeks_poll': 0, 'weeks_top10': 0, 'weeks_top5': 0, 'weeks_no1': 0, 'final_rank': 0})
    p = pd.read_csv(os.path.join(SR, 'polls.csv'))
    p = p[p.school_id.isin(by_sr) & (p.year <= SR_LAST) & (p['rank'] != '-')]
    p['rk'] = pd.to_numeric(p['rank'], errors='coerce')
    p = p[p.rk.notna()]
    for r in p.itertuples():
        e = ap[(by_sr[r.school_id], int(r.year))]
        e['weeks_poll'] += 1
        e['weeks_top10'] += r.rk <= 10
        e['weeks_top5'] += r.rk <= 5
        e['weeks_no1'] += r.rk == 1
        if r.week == 'Final':
            e['final_rank'] = int(r.rk)

    def add_weekly(yr, frame):
        """frame: (team_id, week, rank) for every observed team-week, rank NaN = unranked.
        A week with no game for a team is filled when the weeks either side agree (ranked
        both → ranked, rank = the worse of the two). The final poll (released after the
        conference tournaments, before any NCAA game) is never observable from games, so
        it carries the last observed week."""
        weeks = sorted(frame.week.unique())
        by_team = defaultdict(dict)
        for r in frame.itertuples():
            v = r.rank if not pd.isna(r.rank) and r.rank <= 25 else 99
            by_team[r.team_id][r.week] = min(v, by_team[r.team_id].get(r.week, 99))
        for tid, obs in by_team.items():
            if tid not in by_espn:
                continue
            seq = []
            for i, w in enumerate(weeks):
                if w in obs:
                    seq.append(obs[w])
                    continue
                prev = next((obs[x] for x in reversed(weeks[:i]) if x in obs), 99)
                nxt = next((obs[x] for x in weeks[i + 1:] if x in obs), 99)
                seq.append(max(prev, nxt))
            seq.append(seq[-1])  # the final poll
            if not any(v <= 25 for v in seq):
                continue
            e = ap[(by_espn[tid], yr)]
            e['weeks_poll'] += sum(v <= 25 for v in seq)
            e['weeks_top10'] += sum(v <= 10 for v in seq)
            e['weeks_top5'] += sum(v <= 5 for v in seq)
            e['weeks_no1'] += sum(v == 1 for v in seq)
            e['final_rank'] = seq[-1] if seq[-1] <= 25 else 0

    for yr in range(ESPN_FIRST, LAST + 1):
        f = os.path.join(ARCH, f'espn_ranks_{yr}.csv')
        if os.path.exists(f):
            r = pd.read_csv(f).dropna(subset=['team_id'])
            r['team_id'] = r.team_id.astype(int)
            add_weekly(yr, r[['team_id', 'week', 'rank']])
        else:
            d = load_espn(yr, ['home_current_rank', 'away_current_rank'])
            d = d[d.season_type == 2]
            wk = (d.day - pd.to_timedelta(d.day.dt.weekday, unit='D')).dt.strftime('%Y-%m-%d')
            fr = pd.concat([
                pd.DataFrame({'team_id': d.home_id, 'week': wk, 'rank': d.home_current_rank}),
                pd.DataFrame({'team_id': d.away_id, 'week': wk, 'rank': d.away_current_rank}),
            ])
            add_weekly(yr, fr)
    apdf = pd.DataFrame([{'school': s, 'season': yr, **v} for (s, yr), v in ap.items()]).sort_values(['school', 'season'])
    for c in ['weeks_top10', 'weeks_top5', 'weeks_no1']:
        apdf[c] = apdf[c].astype(int)

    # ================= conference regular-season titles =================
    # computed from conference games: best conference win % in the league that season
    # (ties = co-champions). SR 1950–2016 game logs + ESPN 2017+; the pre-1950 titles come
    # from Sports-Reference's all-time total (schools.csv `creg`) minus what we compute.
    conf_rows = []
    yconf = {(r.school_id, int(r.year)): r.conference_name for r in pd.read_csv(os.path.join(SR, 'years.csv')).itertuples()}
    gm = pd.read_csv(os.path.join(SR, 'games.csv.gz'), low_memory=False, usecols=['year', 'school_id', 'type', 'opponent_id', 'outcome'])
    gm = gm[(gm.type == 'REG') & gm.opponent_id.notna()]
    rec = defaultdict(lambda: [0, 0])
    for r in gm.itertuples():
        c = yconf.get((r.school_id, r.year))
        if not c or c in ('Ind', 'Independent') or yconf.get((r.opponent_id, r.year)) != c:
            continue
        rec[(r.year, c, r.school_id)][0 if r.outcome == 'W' else 1] += 1
    by_league = defaultdict(list)
    for (yr, c, sid), (w, l) in rec.items():
        by_league[(yr, c)].append((w / max(1, w + l), sid, w, l))
    computed_sr = defaultdict(set)
    for (yr, c), lst in by_league.items():
        if len(lst) < 4:
            continue
        top = max(x[0] for x in lst)
        champs_ = [x[1] for x in lst if abs(x[0] - top) < 1e-9]
        for sid in champs_:
            computed_sr[sid].add(yr)
            if sid in by_sr:
                conf_rows.append({'school': by_sr[sid], 'year': yr, 'conference': c, 'shared': int(len(champs_) > 1),
                                  'count': 1, 'source': 'sports-reference-games'})
    espn_conf = defaultdict(set)
    for yr, d in espn_games.items():
        cg = d[(d.season_type == 2) & (d.conference_competition == True)  # noqa: E712
               & ~d.notes_headline.fillna('').str.contains('Tournament|Championship|Classic|Challenge', regex=True)
               & (d.home_conference_id == d.away_conference_id)]
        rec = defaultdict(lambda: [0, 0])
        for r in cg.itertuples():
            if pd.isna(r.home_score) or r.home_score == r.away_score:
                continue
            hw = r.home_score > r.away_score
            rec[(int(r.home_conference_id), r.home_id)][0 if hw else 1] += 1
            rec[(int(r.home_conference_id), r.away_id)][1 if hw else 0] += 1
        lg = defaultdict(list)
        for (c, tid), (w, l) in rec.items():
            if tid in by_espn:
                lg[c].append((w / max(1, w + l), tid))
        for c, lst in lg.items():
            top = max(x[0] for x in lst)
            ch = [x[1] for x in lst if abs(x[0] - top) < 1e-9]
            for tid in ch:
                espn_conf[by_espn[tid]].add(yr)
                conf_rows.append({'school': by_espn[tid], 'year': yr, 'conference': CONF.get(c, str(c)),
                                  'shared': int(len(ch) > 1), 'count': 1, 'source': 'espn-games'})
    # reconcile with SR's all-time regular-season title count (through the 2017 season)
    creg = dict(zip(srs.school_id, srs.creg))
    recon = []
    for sid, school in by_sr.items():
        have = len([yr for yr in computed_sr.get(sid, ()) if yr <= SR_LAST]) + (1 if 2017 in espn_conf.get(school, ()) else 0)
        want = int(creg.get(sid, 0) or 0)
        diff = want - have
        recon.append((school, want, have, diff))
        if diff > 0:
            conf_rows.append({'school': school, 'year': 1949, 'conference': '', 'shared': 0, 'count': diff,
                              'source': 'sports-reference-total (titles before 1950 / not reproduced from game logs)'})
    over = [x for x in recon if x[3] < 0]
    print(f'conference titles: {sum(1 for x in recon if x[3] == 0)} exact vs SR totals, '
          f'{sum(1 for x in recon if x[3] > 0)} topped up from SR total, {len(over)} over-count (kept as computed)')
    if over:
        print('   over-counted vs SR:', ', '.join(f'{s} {w}/{h}' for s, w, h, _ in sorted(over, key=lambda x: x[3])[:15]))
    conf = pd.DataFrame(conf_rows).sort_values(['school', 'year'])

    # ================= write =================
    def write(name, df, header_lines):
        with open(os.path.join(OUT, name), 'w') as f:
            for h in header_lines:
                f.write(f'# {h}\n')
            df.to_csv(f, index=False, lineterminator='\n')
        print(f'  {name}: {len(df)} rows')

    write('_staging_identity.csv', ident, [
        'One program per row: every 2025-26 NCAA Division I men\'s basketball program (365).',
        'espn_id / sr_id link the program to ESPN and Sports-Reference. Colours from ESPN. Written by',
        'scripts/basketball/compile_sources.py; edit by hand freely (a recompile overwrites).',
    ])
    write('_staging_wins.csv', wins[['school', 'season', 'wins', 'losses', 'ties', 'wins_vacated', 'losses_vacated', 'vacated_note', 'source']], [
        'One (school, season) record, season = the year it ENDS (2026 = 2025-26). Division I seasons only.',
        'source=sports-reference: through 2015-16. source=espn: 2016-17 on, counted game by game.',
        'wins_vacated / losses_vacated = NCAA vacations (from _staging_vacated.csv) — removed only in the',
        '"NCAA official" view. As-played records keep them.',
    ])
    write('_staging_ap_poll_success.csv', apdf[['school', 'season', 'weeks_poll', 'weeks_top10', 'weeks_top5', 'weeks_no1', 'final_rank']], [
        'One (school, season): weeks in the AP Top 20/25, top-10 / top-5 / #1 weeks, final rank.',
        '1949-50 → 2015-16 every weekly poll (Sports-Reference). 2016-17 on: the AP rank ESPN carries on each',
        'game, one reading per poll week; the final (post-conference-tournament) poll carries the last week.',
    ])
    write('_staging_ncaa_tournament.csv', tour[['school', 'season', 'result', 'appearance', 'sweet16', 'elite8', 'final_four', 'champion', 'vacated', 'source']], [
        'One (school, season) NCAA tournament appearance and how far it went.',
        'sweet16 = reached the regional semifinal (every team in a field of 16 or fewer, 1939–52);',
        'final_four = the last four (1939–51: the regional-final losers, as the NCAA counts them).',
        'vacated=1: the NCAA vacated that tournament (counted only in the as-played view).',
    ])
    write('_staging_championships.csv', titles, [
        'One NCAA tournament champion per row (1939 → present). status=vacated → as-played view only.',
    ])
    write('_staging_conference_titles.csv', conf[['school', 'year', 'conference', 'shared', 'count', 'source']], [
        'One row per (school, season) conference regular-season title; co-champions each get a row.',
        'Computed from conference games (best conference win %; ties = co-champions): Sports-Reference',
        'game logs 1950-2016, ESPN 2017+. year=1949 rows are a LUMP (count = N) — titles before 1950 per',
        'Sports-Reference\'s all-time total that the game logs cannot place in a season.',
    ])
    confs = {'year': LAST, 'source': 'ESPN 2025-26 conference membership', 'bySchool': dict(zip(ident.school, ident.conference))}
    with open(os.path.join(OUT, 'conferences.json'), 'w') as f:
        json.dump(confs, f, indent=1)

    # sanity log
    tot = tour.groupby('school')[['appearance', 'sweet16', 'final_four', 'champion']].sum()
    print(tot.sort_values(['champion', 'final_four'], ascending=False).head(12).to_string())
    w = wins.groupby('school')[['wins', 'losses']].sum()
    print(w.sort_values('wins', ascending=False).head(8).to_string())
    a = apdf.groupby('school')[['weeks_poll', 'weeks_top10']].sum()
    print(a.sort_values('weeks_poll', ascending=False).head(8).to_string())
    c = conf.groupby('school')['count'].sum()
    print(c.sort_values(ascending=False).head(8).to_string())


if __name__ == '__main__':
    sys.exit(main())
