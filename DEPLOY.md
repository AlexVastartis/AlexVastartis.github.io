# Deploying BlueBloodFootball.com (and BlueBloodBasketball.com)

> **BlueBloodBasketball** is built from this same repo on every push (`npm run build:bb`
> → `dist-basketball/`) — see [*The basketball site*](#the-basketball-site) at the bottom
> for the one-time setup it needs.

The site is a **static bundle**: `npm run build` produces `dist/` (HTML + JS + the
pre-baked `public/data/*.json`). No server, no database, no runtime secret.

## Where it lives

| Piece | Value |
| --- | --- |
| Repo | `github.com/AlexVastartis/AlexVastartis.github.io` (the user-site repo) |
| Domain | **bluebloodfootball.com** — on Cloudflare (free plan). `public/CNAME` carries it into every build. |
| Host | **GitHub Pages**, built and published by `.github/workflows/deploy.yml` (Actions → Pages) |
| Old site | preserved on the **`legacy-static`** branch — 500+ commits of the original hand-built HTML/JS version |
| Data | hand-maintained CSVs in `data/staging/`, committed. No fetch step, no API key, no scheduled job. |

**Cost:** $0 hosting (GitHub Pages + Actions) + ~$10/yr domain.

Everything stays editable from Claude Code: edit → `git push` → the Deploy Action
runs → live in ~2 min.

### Cloudflare DNS records (add these — `bluebloodfootball.com` has none yet)

All records **Proxy status = DNS only (grey cloud)** — GitHub Pages issues the
TLS cert itself; proxying from the start breaks that.

| Type | Name | Content |
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

Then in **Cloudflare → SSL/TLS**, set the mode to **Full**. In the **GitHub repo →
Settings → Pages**, the custom domain should already read `bluebloodfootball.com`
(from the old config + the `public/CNAME` file); once DNS propagates (minutes)
GitHub issues the cert — tick **Enforce HTTPS**.

Optional hardening: verify the domain against your GitHub *account* (account
Settings → Pages → Add a domain → add the `_github-pages-challenge-alexvastartis`
TXT record Cloudflare shows you).

If you ever want Cloudflare's CDN/caching in front, flip the `@` records to
**Proxied (orange cloud)** *after* the GitHub cert is live, and keep SSL/TLS on
**Full**.

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

## Updating the data

There is no scheduled job and no external API. The data store is the set of
hand-maintained CSVs in `data/staging/`. To refresh the site's numbers:

1. Edit the relevant `data/staging/_staging_*.csv` file(s).
2. `npm run build:data` — recomputes `public/data/*.json` offline.
3. Commit `data/staging/` + `public/data/` and push. The Deploy Action does the rest.

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
`public/data/*.json`, so `npm run build:data` is a local step. To fold it in, change
the workflow's `run: npm run build` to `run: npm run build:data && npm run build`
(`build:data` is fully offline; it only reads the committed `data/staging/`).

---

## Developer-only items, sectioned off

Feature flags live in **`src/config/flags.ts`** — each is `import.meta.env.DEV`, so
on under `npm run dev` / `vite preview` and **off in the production bundle**. Flip a
line to a bare `true` to ship one.

| Item | In production |
| --- | --- |
| **"As of" point-in-time snapshots** (the year picker, `?year=`, the snapshot banner) | `SHOW_TIMEPOINTS` — off. The picker isn't rendered, `?year=` is ignored, and `useTeams` always loads present-day data. The `public/data/timepoints/*.json` files still ship but nothing fetches them. |
| **Element map** (the "Map" button, `?map=1`) | `SHOW_ELEMENT_MAP` — off. The button isn't rendered, `?map=1` is ignored, and the overlay never mounts. |
| `data-map="…"` attributes | Kept (a few hundred bytes) — read only by the element map, which is off. |
| Gap/range **margin notes** (`?notes=1`, ✎) | Left as-is — a real off-by-default feature, not debug. Add a flag if it's clutter. |
| `src/routes/Notes.tsx` | Orphaned, not routed → not in the bundle. |

---

## Node version

`.nvmrc` = `20`; the deploy workflow pins `node-version: 20`. Keep them in sync if
you bump it.

---

## If you ever want off GitHub Pages

Cloudflare Pages / Netlify / Vercel all deploy this repo unchanged: connect the
repo, build command `npm run build`, output `dist`, and (Cloudflare) set
`NODE_VERSION=20`. Then move the domain's DNS to the new host and delete the
Deploy Action. Nothing about the app changes — `base` stays `/`.

---

## The basketball site

GitHub Pages serves **one custom domain per repository**, so bluebloodbasketball.com is
published to a second, otherwise-empty repo. The `basketball` job in
`.github/workflows/deploy.yml` builds it on every push to `main` and pushes
`dist-basketball/` to that repo's `gh-pages` branch. Until the secret below exists, the job
builds and stops with a notice — nothing fails.

One-time setup:

1. **Create the repo** `AlexVastartis/bluebloodbasketball` on GitHub (public, empty). A
   different name works too — then add a repository *variable* `BASKETBALL_REPO` =
   `owner/name` on this repo (Settings → Secrets and variables → Actions → Variables).
2. **Deploy key.** Locally: `ssh-keygen -t ed25519 -C bbb-deploy -f bbb-deploy -N ""`.
   - In **bluebloodbasketball** → Settings → Deploy keys → Add: paste `bbb-deploy.pub`,
     tick **Allow write access**.
   - In **this repo** → Settings → Secrets and variables → Actions → New secret:
     `BASKETBALL_DEPLOY_KEY` = the contents of `bbb-deploy` (the private key).
3. **Run the workflow** (Actions → Deploy to Pages → Run workflow). The first run creates
   the `gh-pages` branch in bluebloodbasketball.
4. In **bluebloodbasketball** → Settings → Pages: Source = *Deploy from a branch*,
   branch `gh-pages` / root. Custom domain `bluebloodbasketball.com` (the build ships a
   `CNAME` file, so it should fill in by itself).
5. **DNS** for bluebloodbasketball.com (Cloudflare, *DNS only* / grey cloud) — the same
   records as football above: the four `A` + four `AAAA` records on `@`, and
   `CNAME www → alexvastartis.github.io`. Once the cert is issued, tick **Enforce HTTPS**.

Updating basketball data is the same loop as football: edit
`data/basketball/staging/*.csv` → `npm run build:data:bb` → commit
`data/basketball/` + `sites/basketball/public/data/` → push. Refreshing from the raw sources
(a new season) is described in `data/basketball/README.md`.

The 🏈 / 🏀 switch links to the production domains. To point it elsewhere (a staging URL),
set `VITE_OTHER_SITE_URL` when building.
