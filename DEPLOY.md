# Deploying BlueBloodFootball.com

The site is a **static bundle**: `vite build` produces `dist/` (HTML + JS + the
pre-baked `public/data/*.json`). There is no server, no database, no runtime
secret. Hosting it is cheap and boring — that's the point.

---

## TL;DR

| Piece | Choice | Cost |
| --- | --- | --- |
| Source of truth | **GitHub** repo (`main` branch) | $0 |
| Build + host | **Cloudflare Pages** — connects to the repo, runs `npm run build` on every push to `main`, serves `dist/` on a global CDN with free HTTPS | $0 |
| Domain | **Cloudflare Registrar** (wholesale price, no renewal markup, free WHOIS privacy). Or buy anywhere and point DNS at Cloudflare. | ~$10–12 / yr |
| Weekly data refresh | the **GitHub Action already in the repo** (`.github/workflows/refresh-data.yml`) — needs one repo secret | $0 |

**All-in: $0/month + ~$1/month amortised for the domain.** Free tiers are far
above anything this site's traffic will touch (Cloudflare Pages: unlimited
requests and bandwidth, 500 builds/month).

Everything stays editable from Claude Code: edit → `git push` → live in ~90s.

---

## Why Cloudflare Pages (vs the alternatives)

- **GitHub Pages** works too (the app uses hash routing, so no SPA-fallback
  config needed) but custom-domain HTTPS provisioning is slower/flakier and the
  bandwidth allowance is a soft "not for heavy traffic." Fine for a hobby site;
  Cloudflare is just cleaner. A ready-to-use Pages workflow is at the bottom of
  this doc if you prefer it.
- **Netlify / Vercel** — equivalent DX, also free. Netlify caps bandwidth at
  100 GB/mo (irrelevant here); Vercel's free tier is "personal, non-commercial"
  (this qualifies). Any of them is a fine pick; the steps below are ~identical.

---

## Pre-flight — do these once before the first deploy

### 1. Commit the working tree

A large amount of work is currently uncommitted (trajectory/Standing/Path
Forward rewrites, the new FBS programs, the draft rebuild, the logo, the
`assets/` source dir, `src/lib/logoSrc.ts`, `scripts/optimize-logos.mjs`,
`scripts/build-logo.mjs`, every `public/logos/*-dark.png`, `public/logo.png` and
the favicons). **Some committed code imports files that aren't committed yet**, so
a fresh `git clone` will not build until this lands.

```bash
git add -A
git status                # review — expect a big diff, that's correct
git commit -m "Slice 2f: trajectory/standing/path-forward rewrite, new programs, logo, deploy prep"
git push origin main
```

`assets/` (~16 MB of source logos + coach headshots) **should be committed** — it
is the source `prebuild` regenerates `public/logos/` and the favicons from.
16 MB is nothing for GitHub.

### 2. Node version — already pinned

`.nvmrc` says `20`. The existing data-refresh Action uses Node 20. In the
Cloudflare Pages project settings, set the environment variable
`NODE_VERSION = 20` so the build host matches.

### 3. Nothing else to configure

- **No build secret.** `npm run build` reads only committed files and never hits
  the network. `CFBD_API_KEY` is used *only* by local/CI data-refresh scripts,
  never by the site build or the app. `.env` is gitignored.
- **`base` path** stays `/` (correct for a custom domain — only change it if you
  ever serve from `user.github.io/repo/`).
- **`prebuild`** runs `scripts/build-logo.mjs` (favicons + `logo.png` from
  `assets/logo-src.png`) then `scripts/optimize-logos.mjs` (team logos from
  `assets/logos-src/`). Both need `assets/` committed — see step 1.

---

## Step-by-step: GitHub → Cloudflare Pages → domain

### A. Push to GitHub

If the repo isn't on GitHub yet:

```bash
gh repo create bluebloodfootball --private --source . --remote origin --push
```

(or make the repo in the GitHub UI and `git remote add origin … && git push -u origin main`).

Public vs private is your call — nothing sensitive is in the repo. Private is
fine; Cloudflare Pages reads it through the GitHub App either way.

### B. Create the Cloudflare Pages project

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → pick the repo.
2. Build settings:
   - **Framework preset:** Vite (or "None")
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** *(leave blank)*
3. **Environment variables** → add `NODE_VERSION = 20`.
4. **Save and Deploy.** First build takes ~2–3 min (installs `sharp` etc.);
   later builds ~60–90s. You get a `*.pages.dev` URL immediately — check it
   works, including a hard refresh on `/#/criteria/wins` etc.

Every push to `main` now redeploys automatically. Pull requests get their own
preview URL.

### C. Attach the domain

1. Register the domain (Cloudflare Registrar is cheapest; Porkbun / Namecheap
   fine too — ~$10–12/yr for `.com`).
2. If registered outside Cloudflare: add the domain as a **Website** in
   Cloudflare (free plan) and switch the registrar's nameservers to the two
   Cloudflare gives you. Wait for it to go "Active" (minutes to a few hours).
3. Pages project → **Custom domains** → **Set up a domain** → enter the apex
   (`bluebloodfootball.com`) and add `www` too. Cloudflare creates the DNS
   records and provisions the TLS cert automatically (~1–2 min).
4. Optionally add a redirect rule so `www` → apex (or vice-versa) — one is
   canonical, the other 301s.

### D. Point `robots.txt` / titles at the real domain (optional polish)

- `public/robots.txt` is already generic allow-all — no edit needed.
- No sitemap is shipped (a hash-routed SPA doesn't gain from one). Skip it.
- If you want link-preview cards, add an OpenGraph image later:
  `<meta property="og:image" content="https://…/logo.png">` in `index.html`
  plus `og:title` / `og:description`.

---

## The day-to-day workflow

```bash
# 1. edit in Claude Code
#    - prose/blurbs: edit data/staging/_blurb_*.csv (or let the algorithm drive)
#    - stats/config:  edit data/staging/_staging_*.csv
#    - code/UI:       normal edits

# 2. if any data or blurb CSV changed, rebuild the JSON the site ships:
npm run build:data
npm run archive        # optional — refreshes PROGRAMS.md

# 3. commit + push
git add -A
git commit -m "…"
git push

# 4. Cloudflare Pages builds and deploys in ~90s. Done.
```

`npm run build:data` is a **local** step because CI (the Pages build) only runs
`npm run build`, which serves the already-committed `public/data/*.json`. If you'd
rather skip the local step, change the Pages **build command** to
`npm run build:data && npm run build` — `build:data` is fully offline and only
needs the committed `data/staging/` + `data/api/` caches.

---

## Weekly automated data refresh

`.github/workflows/refresh-data.yml` already exists. Every Sunday 12:00 UTC it
re-pulls the CollegeFootballData API, rebuilds `public/data/*.json`, and commits
+ pushes if anything moved — which then triggers a Pages redeploy.

To enable it: **GitHub repo → Settings → Secrets and variables → Actions → New
repository secret** → `CFBD_API_KEY` = your free key from
<https://collegefootballdata.com/key>.

Without the secret the workflow just fails quietly each week and nothing else
breaks; the site keeps serving whatever data was last committed. You can also run
`build:data` locally whenever you like and commit the result by hand.

---

## Developer-only items, now sectioned off

| Item | Status in production |
| --- | --- |
| **Element map** (the "Map" button, `?map=1`) | Button hidden — `import.meta.env.DEV` gate, so it's tree-shaken out of the prod bundle. The `?map=1` URL still activates the overlay, so **you** can inspect the live site by appending it; visitors never see the control. |
| `data-map="…"` attributes on DOM nodes | Kept (a few hundred bytes) — they're what `?map=1` reads. Harmless. |
| Gap / range **margin notes** (`?notes=1`, the ✎ toggle) | Left as-is — it's a real (if niche) analytical feature, off by default, no dev-only concern. Gate it the same way as the map if you decide it's clutter. |
| `src/routes/Notes.tsx` | Orphaned component, not wired to any route → not in the bundle. Delete it whenever; not a blocker. |
| `/category/:key` legacy redirect | Kept — harmless back-compat redirect to `/criteria/:key`. |

---

## Costs, restated

- **Hosting:** $0/mo, forever, at this scale. No credit card required for
  Cloudflare Pages free.
- **Domain:** ~$10–12/yr. The only recurring cost.
- **GitHub:** $0 (private repos are free).
- **Nothing auto-scales into money** — it's static files on a CDN.

---

## If you'd rather use GitHub Pages

Skip Cloudflare Pages. Add this workflow, enable Pages (repo → Settings → Pages →
Source: **GitHub Actions**), and set the custom domain there.

```yaml
# .github/workflows/deploy.yml
name: Deploy to Pages
on:
  push:
    branches: [main]
  workflow_dispatch: {}
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

Hash routing means no 404-fallback trick is needed. A custom domain keeps
`base: '/'` valid; only the bare `user.github.io/bluebloodfootball/` URL would
need `base` set in `vite.config.ts`.
