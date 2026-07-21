# @understoria/desktop

The Linux AppImage shell around `apps/web` — the member app with no
installed browser required. Design, security posture, and phasing:
[`docs/desktop-appimage.md`](../../docs/desktop-appimage.md).

## What it is

A thin Electron main process that serves the **built, byte-identical
`apps/web` bundle** over a privileged `app://` scheme. Because the
origin is a secure context by construction, WebCrypto and IndexedDB
work even against a plain-HTTP LAN node — the desktop app can join a
community node that has never been online.

- `src/appServer.ts` — request→file resolution (SPA fallback,
  traversal-guarded), MIME map, CSP builder (inline-script hashes
  computed from the shipped `index.html`; never `'unsafe-inline'`).
- `src/policy.ts` — permission allowlist (media, clipboard-read,
  sanitized clipboard-write, screen-wake-lock; everything else
  denied), window-open and navigation policy (web links go to the
  system browser; `file:` and foreign schemes go nowhere).
- `src/main.ts` — glue: privileged scheme, protocol handler,
  hardened single window (`contextIsolation`, `sandbox`, no
  `nodeIntegration`, **no preload**), single-instance lock.

Both decision modules are pure and covered by vitest without
Electron.

## Building the AppImage

Anywhere with normal network access:

```
npm ci                       # repo root
npm run dist --workspace=@understoria/desktop
```

Output lands in `apps/desktop/release/Understoria-<version>-x86_64.AppImage`.
CI builds the same artifact on every change to this workspace
(`.github/workflows/appimage.yml`) — download it from the workflow
run's artifacts.

Run it: `chmod +x Understoria-*.AppImage && ./Understoria-*.AppImage`
(on FUSE-less systems: `--appimage-extract-and-run`).

## Development in restricted environments

`npm install` normally downloads the Electron binary from GitHub
releases. Where that's blocked (e.g. the project's development
sandbox), install with:

```
ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci
```

Everything except actually launching Electron still works:
`typecheck`, `test`, `build`, and the web-dist preparation.

## Joining a community from the desktop

The zero-config web onboarding (origin-derived node suggestion)
cannot exist here — the app isn't served by a node. The two paths,
in order of likelihood:

1. **Pair from your phone**: Settings → "Add another device" on the
   phone; use the paste-code path on the desktop (camera QR scanning
   is unavailable in the shell — the paste fallback is the flow).
   Pairing carries your identity, the community connection, and your
   data.
2. **Fresh start**: create an identity on the Welcome screen, then
   set the community's node URL in Settings.

## Updates

Manual, deliberately (see the design doc §6): check the build stamp
in Settings, replace the AppImage file with a newer one. No
auto-update, no vendor CDN.
