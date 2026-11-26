#!/usr/bin/env python3
"""Builds the App Shelf site (vast-apps.fly.dev) into apps/shelf/site/.

Each app in APPS gets <slug>/index.html, <slug>/icon.png and, when `apk` is set,
its APK copied from the repo build output. Apps with apk=None (Arcade, Library)
are built elsewhere: only their shelf card and icon come from here, their
download page and APKs already live on the server and are left alone.

    python3 apps/shelf/build.py
"""
import hashlib, html, shutil, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "apps/shelf/site"
ICONS = ROOT / "apps/shelf/icons"

APPS = [
    dict(slug="vastarcade", name="Vast Arcade", icon="arcade.png", ver="3.1", size="6.6 MB", apk=None,
         desc="499 games in one app — arcade, sports, puzzles, words, strategy, little kids and more."),
    dict(slug="vastlibrary", name="Vast Library", icon="library.png", ver="2.0", size="24.5 MB", apk=None,
         desc="Our movies and shows on your phone, offline. Autoplays the next episode, picks up where you left off, and locks the screen with a long press."),
    dict(slug="vasttrivia", name="Vast Trivia", icon="trivia.png", ver="1.0",
         apk="apps/vasttrivia-android/out/vasttrivia-1.0.apk",
         desc="48,862 trivia questions with an Elo rating for every player. Question difficulty sorts itself as you play. Works offline.",
         notes="First release. Nearly 49,000 questions across 17 categories, an Elo rating for each player, local leaderboard, stats, and an optional answer timer."),
    dict(slug="vastparty", name="Vast Party Games", icon="party.png", ver="1.0",
         apk="apps/vastparty-android/out/vastparty-1.0.apk",
         desc="Party games for one phone: pass-around, guessing, imposter, truth or dare and more. Four card ratings, from kids to grown-ups.",
         notes="First release. Pass the phone around; the screen stays on while you play. Works offline."),
    dict(slug="christmasgifts", name="Christmas Gifts", icon="gifts.png", ver="2.0",
         apk="christmas-gifts-app/ChristmasGifts.apk", apk_name="christmasgifts-2.0.apk",
         desc="The family Christmas list: every kid's gifts by year, Idea → Purchased → Wrapped, and shopping and wrapping checklists.",
         notes="Starts empty: import the Christmas List spreadsheet from the ⋮ menu. Your list stays on your phone."),
]

HEAD = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>{title}</title>
<style>
:root{{--bg:#14172e;--card:#22274d;--text:#f4f5ff;--muted:#a9afd9;--accent:#ffd43b;--btn:#37b24d}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.45}}
main{{max-width:560px;margin:0 auto;padding:24px 16px 48px}}
h1{{font-size:28px;margin:8px 0 4px}}h2{{font-size:18px;margin:28px 0 8px}}
.muted{{color:var(--muted)}}a{{color:var(--accent)}}
.app{{display:flex;gap:14px;align-items:center;background:var(--card);border-radius:18px;padding:14px;margin:12px 0;text-decoration:none;color:inherit}}
.app img,.hero img{{width:64px;height:64px;border-radius:16px;flex:none;background:#333}}
.hero{{display:flex;gap:16px;align-items:center}}.hero img{{width:88px;height:88px;border-radius:22px}}
.dl{{display:block;text-align:center;background:var(--btn);color:#fff;text-decoration:none;font-weight:800;font-size:20px;padding:16px;border-radius:16px;margin:20px 0 8px;box-shadow:0 5px 0 #2b8a3e}}
.dl:active{{transform:translateY(3px);box-shadow:0 2px 0 #2b8a3e}}
ol{{padding-left:20px}}li{{margin:6px 0}}.small{{font-size:13px}}
.ver{{background:var(--card);border-radius:12px;padding:10px 12px;margin:8px 0}}.notes{{white-space:pre-wrap}}
code{{background:#0003;padding:1px 5px;border-radius:5px;font-size:12px;word-break:break-all}}
</style></head><body><main>
"""
e = html.escape

def mb(p): return f"{p.stat().st_size / 1e6:.1f} MB"

def main():
    if OUT.exists(): shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    today = datetime.date.today().strftime("%b %-d, %Y")
    cards = []
    for a in APPS:
        d = OUT / a["slug"]; d.mkdir()
        shutil.copy(ICONS / a["icon"], d / "icon.png")
        if a["apk"]:
            src = ROOT / a["apk"]
            name = a.get("apk_name") or src.name
            shutil.copy(src, d / name)
            a["size"] = mb(src)
            sha = hashlib.sha256(src.read_bytes()).hexdigest()
            (d / "index.html").write_text(HEAD.format(title=e(a["name"])) + f"""<p class="small"><a href="../">&larr; App Shelf</a></p>
<div class="hero"><img src="icon.png" alt=""><div><h1>{e(a["name"])}</h1><div class="muted">{e(a["desc"])}</div></div></div>
<a class="dl" href="{name}" download>Download version {a["ver"]}</a>
<div class="muted small" style="text-align:center">{a["size"]} · Android · updated {today}</div>
<h2>What's new</h2><div class="notes">{e(a["notes"])}</div>
<h2>How to install</h2><ol>
<li>Tap <b>Download</b> above on your Android phone.</li>
<li>Open the downloaded file (from the notification, or Files &rarr; Downloads).</li>
<li>If Android asks, allow your browser to <b>install unknown apps</b>, then go back and tap <b>Install</b>.</li>
<li>Updating? Install over the old version — your progress is kept.</li></ol>

<p class="muted small" style="margin-top:28px">SHA-256 of the current download:<br><code>{sha}</code></p></main></body></html>""")
        cards.append(f"""<a class="app" href="{a["slug"]}/"><img src="{a["slug"]}/icon.png" alt="">
<div><b>{e(a["name"])}</b><div class="muted small">{e(a["desc"])}</div><div class="muted small">Version {a["ver"]} · {a["size"]}</div></div></a>""")
    (OUT / "index.html").write_text(HEAD.format(title="App Shelf")
        + '<h1>App Shelf</h1><div class="muted">Our Android apps. Tap one to download.</div>\n'
        + "".join(cards) + "</main></body></html>")
    print("built", OUT)

if __name__ == "__main__":
    main()
