# Deploying BlueBloodFootball.com

The site is a **static bundle**: `npm run build` produces `dist/` (HTML + JS + the
pre-baked `public/data/*.json`). No server, no database, no runtime secret.

## Where it lives

| Piece | Value |
| --- | --- |
| Repo | `github.com/AlexVastartis/AlexVastartis.github.io` (the user-site repo) |
| Domain | **bluebloodfootball.com** — already configured; `public/CNAME` carries it into every build |
| Host | **GitHub Pages**, built and published by `.github/workflows/deploy.yml` (Actions → Pages) |
| Old site | preserved on the **`legacy-static`** branch — 500+ commits of the original hand-built HTML/JS version |
| Weekly data refresh | `.github/workflows/refresh-data.yml` — needs the `CFBD_API_KEY` repo secret |

**Cost:** $0. GitHub Pages + Actions are free for this; the domain is already paid.

Everything stays editable from Claude Code: edit → `git push` → the Deploy Action
runs → live in ~2 min.

---

## One switch you have to flip (GitHub UI)

The repo previously served plain HTML from the branch root. It now builds with an
Action, so:

**Repo → Settings → Pages → Build and deployment → Source → "GitHub Actions".**

That's it. The custom domain (`bluebloodfootball.com`) and its HTTPS cert carry
over automatically — the `CNAME` file is still there. If the domain field ever
looks empty after the switch, re-enter `bluebloodfootball.com` and Save.

Then: **Actions tab → "Deploy to Pages" → Run workflow** (or just push any commit)
to trigger the first build. Watch it go green, then load `https://bluebloodfootball.com`.

---

## The weekly data refresh (optional but recommended)

`.github/workflows/refresh-data.yml` re-pulls CollegeFootballData every Sunday,
rebuilds `public/data/*.json`, and commits + pushes if anything changed — which
then triggers the Deploy Action.

To enable: **Settings → Secrets and variables → Actions → New repository secret**
→ `CFBD_API_KEY` = a free key from <https://collegefootballdata.com/key>.

Without it the workflow just no-ops each week; the site keeps serving the last
committed data. You can always run `npm run build:data` locally and commit.

---

## Day-to-day workflow

```bash
# edit in Claude Code
#   prose/blurbs -> data/staging/_blurb_*.csv (or let the algorithm drive)
#   stats/config -> data/staging/_staging_*.csv
#   code/UI      -> normal edits

# if any data/blurb CSV changed, rebuild the shipped JSON:
npm run build:data
npm run archive          # optional, refreshes PROGRAMS.md

git add -A && git commit -m "…" && git push
# Deploy Action builds + publishes in ~2 min.
```

The Deploy Action runs `npm ci && npm run build` — it serves the **committed**
`public/data/*.json`, so `npm run build:data` is a local step. To skip it, change
the workflow's `run: npm run build` to `run: npm run build:data && npm run build`
(`build:data` is fully offline; it only needs the committed `data/staging` +
`data/api` caches).

---

## Developer-only items, sectioned off

| Item | In production |
| --- | --- |
| **Element map** (the "Map" button, `?map=1`) | Button hidden — `import.meta.env.DEV` gate, tree-shaken out of the prod bundle. `?map=1` in the URL still activates the overlay, so *you* can inspect the live site; visitors never see the control. |
| `data-map="…"` attributes | Kept (a few hundred bytes) — read by `?map=1`. |
| Gap/range **margin notes** (`?notes=1`, ✎) | Left as-is — a real off-by-default feature, not debug. Gate it like the map if it's clutter. |
| `src/routes/Notes.tsx` | Orphaned, not routed → not in the bundle. |

---

## Node version

`.nvmrc` = `20`; both workflows pin `node-version: 20`. Keep them in sync if you
bump it.

---

## If you ever want off GitHub Pages

Cloudflare Pages / Netlify / Vercel all deploy this repo unchanged: connect the
repo, build command `npm run build`, output `dist`, and (Cloudflare) set
`NODE_VERSION=20`. Then move the domain's DNS to the new host and delete the
Deploy Action. Nothing about the app changes — `base` stays `/`.
