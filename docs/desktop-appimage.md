# Understoria on the desktop: the Linux AppImage

Status: **Phase 1 IN THIS PR** — `apps/desktop` (the Electron shell),
the renderer's desktop guards, the share-origin fix, and a CI
workflow that builds the AppImage artifact. Phase 2 (node self-serves
the AppImage; the flash drive carries it) and Phase 3 (auto-update
governance) are tracked below. Companion to
`docs/flash-drive-install.md` (how software travels without a
network) and `docs/offline-resilience.md` (the storm hub).

## 0. Why a desktop app at all

The PWA depends on browsers in three ways that have each cost us
something real:

1. **Install policies.** Add-to-homescreen is a browser-vendor
   decision we don't control (the iOS landscape-nav bug, the install
   nudge maze in `lib/installGuide.ts`).
2. **The secure-context requirement.** Service workers and WebCrypto
   require HTTPS with a browser-trusted certificate. That is the
   entire reason a never-online node cannot serve installable
   clients — the "born-offline gap" named as a non-goal in
   `docs/flash-drive-install.md` §5.
3. **The browser profile.** A member's identity lives in the
   browser's IndexedDB; "clear site data" is an identity-loss event.

A packaged desktop app loads its pages from local disk. Its origin is
a secure context by construction, so **WebCrypto, Dexie, and the
whole app work even when the node it talks to is plain HTTP on a
LAN**. A Linux laptop with the AppImage on it can join a node that
has never seen the internet. Phones keep the gap — but laptops are
what storm hubs are run from, and this closes it for them.

Honesty first: Electron embeds Chromium. This removes our dependence
on *installed browsers and their install/secure-context policies*,
not on browser technology. The AppImage is ~100 MB and inherits
Chromium's security-update cadence — that obligation is recorded in
`docs/threat-model.md` §7.

## 1. What the recon established (why this is small)

Three sweeps over `apps/web` (2026-07) found:

- **The data path needs zero changes.** Every node request —
  federation pulls, outbox submits, the nudge stream, audio blobs —
  is an absolute URL built from the `communityNodeUrl` setting
  (`nodeSubmit.ts`, `nodeEndpoints.ts`, `federationSync.ts`,
  `nudgeStream.ts`). Nothing fetches the node relatively; nothing
  falls back to `location.origin` for data. The server's CORS
  default (`CORS_ORIGIN=*`) already admits a desktop origin.
- **Origin-derived onboarding self-disables, safely.** The
  suggest-my-origin card, the founder-claim gate, and the
  device-link origin fallback all run through `isExcludedOrigin`,
  which rejects non-http(s) protocols — under `app://` they go
  inert instead of misbehaving. Desktop onboarding is therefore
  device pairing (which carries the community connection since the
  transfer-snapshot work) or pasting a node URL in Settings.
- **The service worker no-ops harmlessly.** SW registration lives
  in one component (`UpdatePrompt` via `virtual:pwa-register`); on
  an origin without SW support it silently never registers. Nothing
  else depends on it — no push, no background sync (both banned
  here anyway). Electron loading local files IS the offline shell.
- **The real breakage was shareables.** Invite links, QR codes
  (including the offline-kit wall poster's), ICS `URL:` fields, and
  print-page QRs are built from `window.location.origin` at ~25
  call sites. From `app://understoria` those would encode a scheme
  no phone can open. Fixed in this PR via `lib/appOrigin.ts` (§4).
- **Two APIs are genuinely unavailable and must be hidden, not
  broken:** WebAuthn passkeys (RP ID requires a registrable domain —
  an `app://` origin has none; the passphrase remains, as the code
  already guarantees) and `BarcodeDetector` camera QR scanning
  (absent in Electron; every scan surface already has a paste
  fallback).

## 2. The shell (`apps/desktop`)

A deliberately thin Electron main process — the app is `apps/web`,
unchanged bytes, served over a privileged custom scheme:

- **`app://` scheme, registered privileged** (`standard`, `secure`,
  `supportFetchAPI`, `stream`) *before* app-ready — without this,
  IndexedDB (Dexie — the entire datastore) and localStorage throw.
- **Protocol handler = static file server + SPA fallback.** Serves
  the built `apps/web/dist` at the scheme root, so the root-absolute
  asset URLs (`/assets/*`, `base: "/"`) resolve unchanged; any
  pathless-extension route falls back to `index.html`, mirroring the
  web deployment's SPA fallback so BrowserRouter deep links survive
  reloads. Path-traversal-guarded; correct MIME types; CSP header
  attached to every HTML response (script hashes for the inline
  no-FOUC theme script are computed from the built file at startup,
  never `'unsafe-inline'` for scripts).
- **Hardened window.** `contextIsolation: true`, `sandbox: true`,
  `nodeIntegration: false`, **no preload at all** — the renderer
  detects the shell by `location.protocol === "app:"`, so no bridge
  surface exists.
- **Permission policy, allowlist-shaped.** `media` (voice recorder),
  `clipboard-read` (pairing paste), and `screen-wake-lock` (the
  gathering screen) are granted; everything else is denied. Same
  posture as the rest of the project: capabilities are named, the
  default is no.
- **Navigation policy.** The window may only navigate within
  `app://`; `window.open` / target=_blank to http(s) URLs goes to
  the system browser via `shell.openExternal`; everything else is
  denied. (The recovery-kit print popup — `window.open("")` +
  `document.write` — is allowed as the one `about:blank` exception;
  refactoring it onto a `/print/*` route is a tracked follow-up.)
- **Downloads.** A `will-download` handler forces a save dialog for
  every Blob/`<a download>` export (ICS, identity kit, data export),
  so nothing silently lands in a default folder.

The main process's policy logic (MIME map, path resolution, SPA
fallback decision, external-URL policy, CSP builder) lives in pure
modules with vitest coverage — the Electron entry file is glue.

## 3. Packaging

`electron-builder`, AppImage target only (deb/rpm/flatpak are
non-goals for now — one artifact, the one that runs everywhere
without a package manager, matching the flash-drive philosophy).
The build copies `apps/web/dist` into the package verbatim: **the
desktop app ships byte-identical app code to what the node serves.**
`UNDERSTORIA_VERSION` stays the single version source.

The sandbox this repo is developed in cannot download the Electron
binary (proxy-blocked), so the AppImage is built by CI
(`.github/workflows/appimage.yml`: build web → build shell → run
desktop tests → `electron-builder --linux AppImage` → upload
artifact). Local builds work anywhere with normal network. Dev note:
in restricted environments, install with
`ELECTRON_SKIP_BINARY_DOWNLOAD=1` — every gate except launching
Electron itself still runs.

## 4. The renderer's desktop posture (`apps/web` changes)

- **`lib/desktop.ts`** — `isDesktopShell()`: true iff
  `location.protocol === "app:"`. Runtime detection, no build flag,
  no separate bundle: one dist for web, node, drive, and desktop.
- **`lib/appOrigin.ts`** — `shareOrigin()`: the origin to embed in
  anything that leaves the device (invite links, QRs, ICS, print
  pages). On http(s) it is `location.origin` — web behavior
  unchanged. On `app://` it derives the community's public web
  origin from the configured node URL (the inverse of
  `nodeOriginSuggest`'s `${origin}/api` derivation), primed at boot
  and inside `writeSubmitConfig` (the single write chokepoint). The
  ~25 `window.location.origin` share sites now call it. Fallback
  honesty: an unconnected desktop app has no public origin; share
  surfaces then produce what they always produced (a non-routable
  URL) — and an unconnected device has nothing worth sharing yet.
- **Install guide:** `currentInstallEnvironment()` short-circuits to
  `{ kind: "installed" }` in the shell — a native app never nags
  about installing itself.
- **Passkeys:** `supportsPasskeys()` returns false in the shell
  (WebAuthn cannot mint credentials for a domainless origin);
  Security settings show passphrase-only, exactly as on browsers
  without WebAuthn.
- **`/source/*` downloads** (Infrastructure page) fetch via
  `shareOrigin()` — same-origin on the web as before, the node's
  copy on desktop.

## 5. How a member gets in (desktop onboarding)

Named plainly, because the zero-config web path does not exist here:

1. **Pair from your phone** (the primary path): Settings → Add
   another device on the phone, paste-code path on the desktop —
   pairing carries identity, the community connection, and the
   local snapshot. Camera scanning is dead in Electron
   (`BarcodeDetector` absent); the paste fallback IS the flow.
2. **Fresh identity + manual connect:** create identity on Welcome,
   then Settings → community → node URL.

An invite *link* can't open an installed desktop app from a browser
— protocol-handler registration (`understoria://` deep links) is a
named non-goal until someone actually needs it.

## 6. Updates: manual, deliberately (v1)

No auto-update. A self-updating binary is a supply-chain surface
pointed at every member's laptop, and this project's update channel
is the community's own node, not a vendor CDN. V1 posture: the
AppImage tells you its build stamp (Settings, as today); you get a
new one the same ways you got the first — from CI artifacts, from
your node (Phase 2), or from a flash drive. electron-updater stays
off the table until a community actually asks, and then it's a
governance decision (threat-model §7 records this).

## 7. Phases

| Phase | Contents | Status |
|---|---|---|
| 1 | `apps/desktop` shell + renderer guards + share-origin fix + CI AppImage artifact + docs | this PR |
| 2 | Node self-serves the AppImage next to Corresponding Source; `make-flash-drive.sh` carries it; Infrastructure card mentions it | follow-up |
| 3 | Auto-update (if ever): governance decision, threat-model first | deliberately parked |

Follow-ups also tracked: recovery-kit print popup → `/print/*`
route; `understoria://` deep links; Windows/macOS targets (the shell
is portable, but each OS adds signing/notarization obligations we
take on only when someone needs them).

## 8. Drill (nothing counts until drilled)

Extend the flash-drive drill's spirit: on a WAN-off machine, run the
AppImage, pair it from a phone over the hub WiFi, post from the
laptop, see it on the phone. That drill lands with Phase 2 (when the
AppImage travels on the drive); until then the CI artifact + a
manual run is the check.
