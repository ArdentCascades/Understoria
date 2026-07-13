<!--
Understoria — SPDX-License-Identifier: AGPL-3.0-or-later
-->

# `@understoria/site` — the showcase site

A small, static marketing / front-door site for Understoria. It is plain
HTML + Tailwind with one tiny script (theme toggle + mobile nav); there is
no framework and no runtime data — it never talks to a node. Its whole job
is to explain what Understoria is and send people to the source, the
bootstrap guide, or a community they can join.

Because Understoria is **not a SaaS** — every community self-hosts its own
node and the app is a local-first PWA — the calls to action are "Start a
community", "Read the source" (AGPL), and "Join a community", never
"Sign up".

## Develop

```bash
npm --workspace @understoria/site run dev      # local dev server
npm --workspace @understoria/site run build    # → apps/site/dist (gitignored)
npm --workspace @understoria/site run preview   # serve the built dist
```

`vite.config.ts` sets `base: "./"`, so the build is host-agnostic — you can
drop `dist/` at a domain root or under a subpath and the relative asset
links still resolve.

## Screenshots

The images under `public/screenshots/` are captured from the **real app**,
not mocked. In dev, `seedDemoCommunityIfDev` (in `apps/web`) populates a
sample community — You plus Rosa, Marcus, Imani, and Theo, with posts,
projects, events, and a week of signed exchanges — so every screenshot
shows the app as it looks in active use rather than an empty first run.

To regenerate them:

```bash
# 1. Start the web app in dev (in another terminal), so the demo seed runs:
npm --workspace @understoria/web run dev        # serves http://localhost:5173

# 2. Capture (Playwright drives the running app and dismisses first-run nudges):
npm --workspace @understoria/site run shots
```

Notes:

- Override the app URL with `SITE_APP_URL` (default `http://localhost:5173`).
- The script uses the environment's pre-installed Chromium. Point it
  elsewhere with `PLAYWRIGHT_CHROMIUM_EXECUTABLE` if your Chromium lives at
  a different path.
- Each run uses a fresh browser context (empty IndexedDB), so the app
  re-seeds and the screenshots reflect the current seed. If you change the
  demo seed and want the marketing shots to match, re-run `shots`.

## Live demo (the "tour")

The showcase's "See the live demo" buttons point at a **client-only tour**:
a production build of the PWA (`apps/web`) with `VITE_DEMO=1`, which seeds
the sample community in the visitor's browser and loads straight onto a
populated board. It has no backend — every visitor gets their own private
sandbox in IndexedDB, a thin banner explains that nothing leaves their
device, and a "Reset demo" button wipes it for the next person. Real
(non-demo) builds are completely unaffected and still start empty.

Build the demo:

```bash
npm --workspace @understoria/web run build:demo   # → apps/web/dist
```

Then host `apps/web/dist` and point the showcase's demo links at it. The
link target is baked in at build time via `VITE_DEMO_URL` (default
`./demo/`):

```bash
# Option A — dedicated subdomain (recommended; the PWA manifest/scope
# assume a domain root, so this needs no build changes to apps/web):
VITE_DEMO_URL=https://demo.<domain> npm --workspace @understoria/site run build
#   …and deploy apps/web's demo build at demo.<domain>.

# Option B — same host, under /demo/ (zero extra DNS):
npm --workspace @understoria/site run build         # link defaults to ./demo/
#   …and deploy the demo build under understoria.<domain>/demo/
#   (build it with `vite build --base=/demo/` so its asset paths resolve).
```

## Deploy

`dist/` is a pile of static files — host it anywhere (object storage + CDN,
a static host, or the same reverse proxy that already fronts a node).

### Suggested subdomain layout

Understoria fits naturally behind one domain split by hostname:

| Hostname                | Serves                                             |
| ----------------------- | -------------------------------------------------- |
| `understoria.<domain>`  | **this site** (static)                             |
| `app.<domain>`          | the PWA pointed at a community's node               |
| `demo.<domain>`         | a throwaway demo node, if you want a live "try it"  |
| `docs.<domain>`         | the docs, optional                                  |

Point the DNS records at your host and route by `Host:` header at the
reverse proxy. The node's proxy expectations (TLS termination, forwarded
headers, `TRUST_PROXY`) are documented in
[`docs/deploy-alternatives.md`](../../docs/deploy-alternatives.md) — the
static site itself has no such requirements; any plain static host works.

This site is deliberately independent of the node: hosting it costs nothing
beyond static bandwidth, and it stays up (and honest about what Understoria
is) even when no node is running.
