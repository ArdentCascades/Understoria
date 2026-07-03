# Quickstart — try Understoria on a Debian VM (or any modern Linux)

> Tested end-to-end on a fresh Debian 13 (Trixie) VM in GNOME Boxes.
> Should also work on Ubuntu 24.04+, Mint 22+, or any Linux with
> Node.js 20+ available. About 15 minutes start to finish.

This walks you through cloning the repo, installing dependencies,
starting both the PWA (the app members use) and the optional
community node (the Fastify server that mirrors signed exchanges
across a community), and then walking a real exchange end-to-end.

---

## 1. Get build prerequisites

Even the PWA install needs `git` and `npm`. The optional community
node also compiles `better-sqlite3`'s native binding, which needs a
C++ toolchain and Python.

```sh
sudo apt-get update
sudo apt-get install -y git curl build-essential python3 nodejs npm
```

Check the Node version:
```sh
node --version
```

You want **v20.x or higher**. If yours is older, install Node 22
from NodeSource:
```sh
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 2. Clone the repo

```sh
cd ~
git clone https://github.com/ardentcascades/understoria.git
cd understoria
```

> If you're following this before PR #3 has merged into `main`,
> also check out the feature branch:
> ```sh
> git checkout claude/mutual-aid-timebank-LV7nj
> ```

## 3. Install dependencies

```sh
npm install
```

About 30–60 seconds. Pulls ~600 packages, compiles
`better-sqlite3`'s native binding, and builds the shared crypto
package via a postinstall hook. If you see node-gyp errors during
this step, the build prereqs from §1 didn't install — go back.

## 4. Run the test suite (optional but recommended)

```sh
npm test
```

Expect **the full suite (web + server, 1,800+ tests) to pass** in a
minute or two. If anything fails, stop and ask — that's a real signal.

## 5. Start the PWA

In one terminal:
```sh
npm run dev
```

Wait for `VITE … ready` and `Local: http://localhost:5173/`.

Open Firefox in your VM and visit <http://localhost:5173>. You'll
see the Community board with five demo posts (Rosa's ride request,
Marcus's bike tune-ups, etc.). The seed data is **dev-mode only** —
`npm run dev` seeds it so you have something to interact with while
developing; production builds start with an empty node and the
welcome flow mints the first identity. Wipe the dev data via
Profile → Emergency → Hard purge if you want a clean slate.

## 6. Start the community node (separate terminal)

```sh
cd ~/understoria
npm run dev:server
```

Confirm it's up:
```sh
curl http://localhost:8787/health
```
Should return `{"status":"ok"}`.

## 7. Wire the PWA to the node

In the browser:

1. Tap **Profile** in the bottom nav.
2. Scroll to **Community node**.
3. Paste `http://localhost:8787` into the URL field.
4. Tick **Mirror finalized exchanges to this node**.
5. Click **Save**.

You'll see "No mirroring activity yet" — that's correct before any
exchange has been completed.

## 8. Walk a full exchange

Real deployments give every member their own device. To walk both
sides of an exchange in a single browser, use the dev member-switcher.

1. From **Profile**, scroll to **Switch member (local dev)** and
   pick **Rosa**.
2. Go to **Board → Needs**. Tap Rosa's "Ride to medical appointment
   Thursday" post. (Rosa can't claim her own post — that's
   correct.)
3. Use the switcher again, pick **Marcus** (or **You**), and
   navigate back to Rosa's post.
4. Tap **Offer to help** → **Yes, claim it**.
5. Tap **Confirm it's complete** → **Yes, it's complete**. (One
   side of the dual confirm done.)
6. Switch back to **Rosa**.
7. Open the same post. Tap **Confirm it's complete** → **Yes,
   it's complete**.

The post moves to **Completed**, credits transfer (Rosa 5 → 3,
Marcus 5 → 7), and an achievement banner appears.

Now check the mirror:
- The **Community node** section in Profile briefly shows
  `1 pending in outbox`, then `Last success: <timestamp>`.
- In a terminal:
  ```sh
  curl http://localhost:8787/exchanges
  ```
  You'll see the exchange you just created, with both signatures.

## 9. Things worth poking at

- **Passphrase**: Profile → Security → Enable. Pick something
  memorable. Reload the tab — you'll get the lock screen. There's
  no recovery; if you forget it, your only path is Profile →
  Emergency → Hard purge and starting over.
- **Invite flow**: Profile → Invites → Generate invite link →
  copy the URL → open in a private browser window. You'll see the
  invite accept page with the inviter's key fingerprint to
  verify.
- **Soft vs hard purge**: Profile → Emergency. Soft strips
  identifying text but keeps the signed exchange ledger; hard
  wipes everything and rotates to a fresh node identity.
- **Language switch**: Profile → Language → Español. Most of the
  app switches immediately. (Spanish translation is bootstrap-
  quality and explicitly invites native-speaker review.)
- **Outbox resilience**: stop the server (Ctrl-C in its terminal).
  Complete another exchange. The chip shows `1 pending in outbox`.
  Restart the server. Within ~30 seconds (or click **Retry now**),
  the chip flips to delivered.

## 10. Optional — run the node in Docker instead

If you'd rather not run `npm run dev:server` directly:

```sh
sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
# Log out and log back in for the group change to take effect.

cd ~/understoria
docker compose up -d
docker compose logs -f understoria   # Ctrl-C to detach
curl http://localhost:8787/health
```

The first build takes ~3 minutes (it pulls the Node image, installs
build tools, compiles the native binding, and prunes dev deps from
the runtime image). After that, container start is near-instant.

The container runs as a non-root user, drops every Linux capability,
mounts a SQLite file inside a Docker volume, and uses tini as PID 1
for clean SIGTERM handling.

---

## If something doesn't work

- **`npm install` fails with node-gyp errors** → §1 build tools are
  missing. Re-run `sudo apt-get install -y build-essential python3`.
- **`Cannot find module @understoria/shared`** at PWA or server
  startup → the shared package didn't build. Run
  `npm run shared:build` and try again.
- **PWA loads but Profile → Community node shows
  `Last error: …`** → the node isn't reachable at the URL you
  configured. Confirm `curl http://localhost:8787/health` returns
  200; check firewall / port-binding.
- **Tests pass but `npm run dev` hangs** → port 5173 is in use by
  a previous run. `pkill -f vite` and retry.

For anything else, file an issue at
<https://github.com/ardentcascades/understoria/issues> with the
exact command and the error you saw.

Welcome in.
