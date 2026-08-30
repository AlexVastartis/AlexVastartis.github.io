# Deploying BlueBloodFootball.com

The site is a **static bundle**: `npm run build` produces `dist/` (HTML + JS + the
pre-baked `public/data/*.json`). No server, no database, no runtime secret.

## Where it lives

| Piece | Value |
| --- | --- |
| Repo | `github.com/AlexVastartis/AlexVastartis.github.io` (the user-site repo) |
| Live URL (now) | **https://alexvastartis.github.io** — until the domain is re-set-up |
| Domain (pending) | **bluebloodfootball.com** — being re-registered / moved to Cloudflare; add `public/CNAME` back once DNS resolves (see "Custom domain" below) |
| Host | **GitHub Pages**, built and published by `.github/workflows/deploy.yml` (Actions → Pages) |
| Old site | preserved on the **`legacy-static`** branch — 500+ commits of the original hand-built HTML/JS version |
| Weekly data refresh | `.github/workflows/refresh-data.yml` — needs the `CFBD_API_KEY` repo secret |

**Cost:** $0 hosting (GitHub Pages + Actions). Domain ~$10/yr once re-registered.

Everything stays editable from Claude Code: edit → `git push` → the Deploy Action
runs → live in ~2 min.

### Custom domain — do this once the domain is live on Cloudflare

1. **Cloudflare DNS** for `bluebloodfootball.com` (all records **DNS only / grey
   cloud** — let GitHub handle TLS):

   | Type | Name | Value |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153` |
   | AAAA | `@` | `2606:50c0:8001::153` |
   | AAAA | `@` | `2606:50c0:8002::153` |
   | AAAA | `@` | `2606:50c0:8003::153` |
   | CNAME | `www` | `alexvastartis.github.io` |

2. Recreate the CNAME file so builds keep the domain:
   ```bash
   echo bluebloodfootball.com > public/CNAME
   git add public/CNAME && git commit -m "restore custom domain" && git push
   ```
   (or just type `bluebloodfootball.com` into repo → Settings → Pages → Custom domain).
3. GitHub provisions the HTTPS cert in a few minutes; tick **Enforce HTTPS**.
4. Optional: verify the domain against your GitHub *account* (Settings → Pages →
   Add a domain → add the `_github-pages-challenge-alexvastartis` TXT record) to
   prevent takeover.

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
