"""
AP rank per (team, poll week) for the seasons whose ESPN schedule file has no rank column
(2016-17 → 2021-22). ESPN's per-game JSON (github.com/sportsdataverse/hoopR-mbb-raw) carries
each team's AP rank in its closing `teamInfo` block, so only the last 16 KB of each file is
fetched (an HTTP range request). Greedy: per (season, poll week) pick games until every
Division I team that played that week is covered once. Tournament games are skipped (their
"rank" is the seed).

  RAW=/path/to/raw python3 scripts/basketball/fetch_espn_ranks.py 2017 2018 ...
  → data/basketball/archive/espn_ranks_{season}.csv   (week, game, team_id, rank)

This is the one step that touches the network; compile_sources.py reads its output.
"""
import pandas as pd, re, sys, concurrent.futures as cf, urllib.request, os, time
RAW=os.environ.get('RAW','/tmp/claude-0/src')
E=os.path.join(RAW,'espn')+'/'
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','data','basketball','archive')
URL='https://raw.githubusercontent.com/sportsdataverse/hoopR-mbb-raw/main/mbb/json/final/{}.json'
def tail(gid):
    for a in range(4):
        try:
            req=urllib.request.Request(URL.format(gid),headers={'Range':'bytes=-16000'})
            return urllib.request.urlopen(req,timeout=30).read().decode('utf8','replace')
        except Exception as e:
            time.sleep(1+a)
    return None
def parse(txt):
    i=txt.find('"teamInfo"')
    if i<0: return None
    seg=txt[i:]
    parts=seg.split('"homeAway"')
    out={}
    for k in range(1,len(parts)):
        ids=re.findall(r'"id": "(\d+)"',parts[k-1])
        tid=ids[-1] if ids else None
        m=re.search(r'"rank": (\d+)',parts[k])
        out[tid]=int(m.group(1)) if m else None
    return out
seasons=[int(s) for s in sys.argv[1:]]
for S in seasons:
    d=pd.read_csv(E+f'mbb_schedule_{S}.csv',low_memory=False,usecols=['id','date','season_type','status_type_completed','home_id','away_id','home_conference_id','away_conference_id'])
    d=d[(d.season_type==2)&(d.status_type_completed==True)].copy()
    t=pd.to_datetime(d.date,utc=True)-pd.Timedelta(hours=5)
    d['wk']=(t.dt.normalize()-pd.to_timedelta(t.dt.weekday,unit='D')).dt.strftime('%Y-%m-%d')
    d1=set(d.home_id[d.home_conference_id.notna()])|set(d.away_id[d.away_conference_id.notna()])
    picks=[]
    for wk,g in d.groupby('wk'):
        need=set(g.home_id)|set(g.away_id); need&=d1
        # prefer games covering two uncovered D1 teams
        g=g.assign(both=g.home_id.isin(d1)&g.away_id.isin(d1)).sort_values('both',ascending=False)
        for r in g.itertuples():
            if r.home_id in need or r.away_id in need:
                picks.append((wk,r.id)); need.discard(r.home_id); need.discard(r.away_id)
    print(S,'fetches',len(picks),flush=True)
    res=[]
    with cf.ThreadPoolExecutor(48) as ex:
        for (wk,gid),txt in zip(picks,ex.map(lambda p: tail(p[1]),picks)):
            p=parse(txt) if txt else None
            if p is None: res.append((wk,gid,None,None)); continue
            for tid,rk in p.items(): res.append((wk,gid,tid,rk))
    out=pd.DataFrame(res,columns=['week','game','team_id','rank'])
    out.to_csv(os.path.join(OUT,f'espn_ranks_{S}.csv'),index=False)
    print(S,'missing',out.team_id.isna().sum(),'ranked rows',out['rank'].notna().sum(),flush=True)
