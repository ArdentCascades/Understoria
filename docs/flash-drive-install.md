# Installing Understoria from a flash drive

Status: **SHIPPED (PR 1 + PR 2 + ease-of-use layer)** —
`scripts/make-flash-drive.sh` builds the drive (§2),
`scripts/setup-offline.sh` + `setup.sh --offline` provision from it
(§3), and the flash-drive drill is on the Infrastructure page's
checklists (§6). The ease-of-use layer (§3b) adds `START-HERE.sh` /
`verify.sh` at the drive root, the sealed-env restore path
(`--include-env`), a personalized printed emergency sheet, and a
"Flash drive" card on the Infrastructure page. The paper-kit PDFs
took §4's honest fallback (README.txt points at the running node's
/print pages; headless pre-rendering stays a tracked follow-up). Companion
to `docs/offline-resilience.md` (the storm hub serves the community
when the internet dies; the flash drive is how the SOFTWARE ITSELF
travels to a machine that can't download it) and
`docs/bootstrap-from-a-node.md` (what happens after the node is up).

## 0. What problem the drive solves

Today every install path assumes internet at install time: `docker
compose build` runs `npm install` inside the Dockerfiles, compose pulls
`caddy:2.8-alpine`, and `setup.sh` curls for the host's public IP. A
community setting up in a church basement, a rural site with satellite
internet by the megabyte, or a storm-hub Pi being rebuilt mid-outage
has none of that. The drive makes **provisioning a node a fully local
act**: plug in, run one script, node up.

Three journeys, in the order they happen in real life:

1. **Build the drive (good times, internet on).** One script produces
   a complete, verifiable drive from a healthy checkout.
2. **Provision a fresh node from the drive (internet optional).** A
   Pi or laptop becomes a community node without downloading a byte.
3. **Carry an update to an air-gapped node.** The same drive layout
   moves a new release to a storm hub that never sees the internet.

## 1. Drive layout (spec)

```
UNDERSTORIA/
├── START-HERE.sh               ← the one thing to run (→ setup-offline.sh)
├── README.txt                  ← plain-text quickstart, printed tone
├── EMERGENCY-SHEET.txt         ← print + fold: the crisis-time steps,
│                                  personalized with the community's
│                                  domain and operator contact
├── verify.sh                   ← friendly wrapper over the manifest check
├── MANIFEST.txt                ← every file + SHA256, optionally signed
├── images/
│   ├── understoria-web-<ver>.tar    ← docker save output
│   ├── understoria-server-<ver>.tar
│   └── caddy-2.8-alpine.tar
├── compose/
│   ├── docker-compose.yml      ← the release's compose file
│   └── env.template            ← annotated, matches setup.sh prompts
├── install/
│   └── setup-offline.sh        ← the drive-side installer
├── private/                    ← only on --include-env drives
│   ├── env.sealed              ← the node's .env, AES-256 under a passphrase
│   └── README.txt              ← what it is, why it's encrypted
├── source/                     ← pack-source.sh output (AGPL §13:
│   ├── understoria-source.tar.gz  the drive DISTRIBUTES binaries, so
│   └── understoria.bundle         it must carry Corresponding Source)
└── docs/
    ├── operator-guide.md, deploy-alternatives.md,
    ├── offline-resilience.md (storm-hub runbook), member-guide.md,
    └── paper/ … the printable kit (see §4)
```

FAT32/exFAT-safe names (no colons, no symlinks), everything readable
on any OS — the drive must be inspectable from a librarian's Windows
machine even if it's only ever *executed* on Linux.

## 2. PR 1 — `scripts/make-flash-drive.sh` (the builder)

Run from a healthy checkout with Docker and internet:

1. `docker compose build` at a pinned `UNDERSTORIA_VERSION`, then
   `docker save` the web, server, and caddy images into `images/`.
2. `scripts/pack-source.sh` into `source/` — the existing script,
   reused verbatim. A drive that distributes binaries distributes
   Corresponding Source; resilience and the license point the same
   way.
3. Copy compose file, generate `env.template` (same fields `setup.sh`
   prompts for, annotated), copy the docs set.
4. Write `MANIFEST.txt` with SHA256 of every file, and — if the
   operator has an SSH key — sign it (`ssh-keygen -Y sign`), with the
   verify command printed in README.txt. A drive gets handed around;
   a community should be able to check it wasn't tampered with, and
   equally should know WHO built it. (Unsigned drives still work;
   the manifest just says "unsigned".)
5. Target size: well under 2GB — fits any drive from the junk drawer.

## 3. PR 2 — `setup-offline.sh` + an offline mode for `setup.sh`

The drive-side installer is a thin wrapper that:

1. Checks Docker exists (and prints the OS-package one-liner from
   `deploy-alternatives.md` if not — Docker itself is the one thing
   we cannot carry for every distro; README.txt says to install it
   in good times, and the drill checks it).
2. `docker load` all three image tars — this replaces both `compose
   build` (npm install, gone) and the caddy pull.
3. Copies compose + env.template to the target directory and hands
   off to `setup.sh --offline`, a new flag meaning: skip the public-
   IP curl (LAN posture assumed), skip `compose build` (images are
   loaded), accept a LAN address / storm-hub domain for DOMAIN, and
   print the §4-honest summary of what a LAN-only node can and
   cannot do.
4. Idempotent and re-runnable — the same drive re-provisions a
   rebuilt Pi mid-outage.

Update journey: `docker load` the new tars, `docker compose up -d` —
already just works once images travel by drive; README.txt documents
it as the upgrade path. The `source/` git bundle doubles as the way
to move the repo itself (`git clone understoria.bundle`).

## 3b. The ease-of-use layer (for non-technical hands)

The scripts above assume the person at the keyboard is comfortable
with paths and prompts. In a real crisis the person holding the drive
may not be. Three additions close that gap:

**`START-HERE.sh` and `verify.sh` at the drive root.** The name IS
the instruction — no path to type, no docs to find first.
`START-HERE.sh` just executes `install/setup-offline.sh`; `verify.sh`
wraps `sha256sum -c MANIFEST.txt` in plain ✓/✗ language ("every file
checks out" / "N files don't match — get a fresh drive") and exits
0/1 so drills can script it.

**Sealed server keys (`--include-env`).** Passing the node's live
`.env` to `make-flash-drive.sh` writes `private/env.sealed`: the file
encrypted with `openssl enc -aes-256-cbc -pbkdf2 -iter 200000` under
a passphrase chosen at build time (or taken from
`DRIVE_ENV_PASSPHRASE` for scripted builds). `setup-offline.sh`
detects it and offers **restore mode**: type the passphrase, and the
node comes back exactly as it was — same keys, same domain, zero
setup questions. Three failed attempts offers the fall-through to
the normal interactive setup, so a forgotten passphrase never bricks
the fresh-install path. The posture cost is real and stated plainly
on the drive and in the threat model: **drive + passphrase = the
node.** Store them separately; the passphrase never travels on the
drive, in the manifest, or in any file.

**`EMERGENCY-SHEET.txt`.** A one-page, print-and-fold sheet generated
at build time and personalized from the sealed env's `DOMAIN` and
operator contact: what this drive is, the five crisis steps, where
the passphrase hint lives ("stored separately — ask ___"). Paper
survives dead phones; the sheet is the bridge between the drive in a
drawer and the person who finds it.

The Infrastructure page grew a "Flash drive" card (next to "The
software itself") so the capability is discoverable in the app, not
only in this doc; the drill's steps now name `START-HERE.sh` and
`verify.sh` directly.

## 4. The paper half

The drive carries the printable kit (invite poster, storm-hub WiFi
QR poster, wallet cards, board sheets) — but those are APP ROUTES
(`/print/*`) rendered by a browser. Plan: the builder script renders
them headlessly (the repo already drives Chromium for verification)
into `docs/paper/*.pdf` at build time, so the drive works even where
no browser or printer setup exists to re-render them. If headless
rendering proves brittle in PR 1, fall back to shipping instructions
("open the node's /print pages and print") and promote PDFs to a
follow-up — honesty over scope creep.

## 5. Phones: how the app gets from the node to hands

The drive provisions the NODE; phones install the app FROM the node,
exactly as the storm-hub runbook describes (join the hub WiFi, open
the community's address, install the PWA). Nothing new to build — but
the plan must name the constraint honestly:

**The born-offline gap.** A node that has NEVER been online cannot
hold a browser-trusted TLS certificate, and PWAs require a secure
context to install (service worker, WebCrypto). So:

- **Supported:** drives built in good times for nodes provisioned in
  good times (cert obtained online, ~90-day offline runway — the
  storm-hub caveat, unchanged), and mid-outage REBUILDS of a hub
  whose cert material is backed up (the drive's env.template gains a
  "cert backup lives here" line so the rebuild path is drilled).
- **Named non-goal (for now):** a community born with zero internet
  ever. That needs a local-CA posture (installing a homemade root
  cert on every member's phone) whose threat-model cost is real and
  whose UX is hostile; document it as out of scope rather than
  half-ship it. If a genuinely offline-born pilot appears, that's
  its own design doc.

## 6. Drills (the house rule: nothing counts until drilled)

Add to the infrastructure-page drill checklists:

1. **Provision drill:** fresh Pi + drive + no WAN → node up, two
   phones exchanging through it (the §4 drill, but starting from
   bare metal instead of a pre-built hub).
2. **Verify drill:** `sha256sum -c MANIFEST.txt` (+ signature check
   when signed) on somebody else's machine.
3. **Update drill:** load a newer drive onto a running hub; history
   intact after.

## 7. Non-goals, named

- Bootable OS images ("flash the whole Pi"): tempting, but it turns
  us into an OS distributor with kernel-update obligations. The
  drive assumes a working Linux + Docker and carries everything
  above that line. (Revisit only if drills show Docker installation
  is the recurring failure point.)
- Sideloading the PWA onto phones from the drive: platforms don't
  allow it; the node-serves-the-app path is the real one.
- Windows/macOS *hosts* for the node: the docs stay Linux-first,
  matching `deploy-alternatives.md`.

## 8. Sizing

| Piece | Size |
|---|---|
| PR 1: builder script + drive layout + README/MANIFEST + this doc promoted from plan to runbook | one PR |
| PR 2: `setup-offline.sh` + `setup.sh --offline` flag + drills added to the infrastructure page checklists | one PR |
| Paper PDFs (headless render) | inside PR 1, or split out if brittle |
