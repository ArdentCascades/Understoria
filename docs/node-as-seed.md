# The node-as-seed doctrine

Every deployed Understoria node serves the complete source of the
software it runs at `/source/` — and that download must be able to
**germinate**: unpack, install, build, deploy, with nothing from the
original project surviving. This doc states the doctrine plainly,
records the one design decision people ask about (history), and gives
the manual drill that proves a pack restores.

Companion pieces: the member-facing walkthrough is
[`bootstrap-from-a-node.md`](./bootstrap-from-a-node.md); the
operator machinery is [`operator-guide.md`](./operator-guide.md)
§7a; the plan that produced this doc (with the full verified audit)
is [`project-continuity-plan.md`](./project-continuity-plan.md).

## The three-layer continuity model

The project survives pressure on its hosting channels through three
redundant layers, weakest dependency first:

1. **Forge layer** — GitHub plus a mirror. Full history, issues,
   CI. Dies under account takedown; the mirror survives with
   everything up to the moment of death.
2. **Release layer** — tagged artifacts with a signed manifest
   (once shipped; see the continuity plan's C2). Pinned, verifiable
   snapshots anyone can hold offline. Survives forge loss wherever a
   copy was downloaded.
3. **Node layer — this doctrine.** Every deployment serves its own
   Corresponding Source. Survives everything except the loss of
   *every* community node simultaneously. Bare-metal git-mode nodes
   additionally serve `understoria.bundle` — the full history — and
   are complete re-seed points including provenance.

Layer 3 is the backstop the other two lean on: if both forges and
the website vanish, `curl https://<any-node>/source/understoria-source.tar.gz`
still starts the whole project again.

## The history decision

The Docker source pack serves the **tree at a version, not the git
history** — and that suffices for continuity. A new maintainer can
run, audit, and fork the project from the tree; the lockfile pins
the dependency graph; the full `docs/` folder travels along.
History is *provenance* (who wrote what, the DCO trail, why) —
valuable but not existential — and it survives independently via
the forge mirror, every contributor clone, and every bare-metal
node's history bundle.

We deliberately do **not** add `.git` to the Docker build context to
force a bundle into every image: it would bloat every build and drag
the full repository history into every deployment's attack surface
for marginal gain.

## The restore drill

CI runs this weekly (`.github/workflows/source-pack-restore.yml`):
pack in both modes, verify checksums, unpack into a clean directory,
and build from nothing. A pack that exists but doesn't build is a
dead seed — the drill is what makes the doctrine true rather than
asserted.

Operators without CI (or anyone who wants first-hand proof) can run
the same drill by hand against a live node. You need Node.js 22 and
a C toolchain (for the SQLite binding):

```sh
# 1. Fetch the pack from your node and verify integrity.
mkdir -p /tmp/seed && cd /tmp/seed
curl -fO https://<your-node>/source/understoria-source.tar.gz
curl -fO https://<your-node>/source/SHA256SUMS
sha256sum -c SHA256SUMS --ignore-missing

# 2. Unpack into a clean directory and build from nothing.
mkdir tree && tar -xzf understoria-source.tar.gz -C tree
cd tree
ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci
npm run typecheck
npm run build:server
npm run build

# 3. (Bare-metal nodes only) prove the history bundle too.
# curl -fO https://<your-node>/source/understoria.bundle
# git clone understoria.bundle understoria-history
```

If step 2 completes, the seed germinates: what you unpacked is a
working copy of the project, deployable per
[`bootstrap-from-a-node.md`](./bootstrap-from-a-node.md) §5. If it
fails, that is a real continuity bug — report it (or fix it) with
the same urgency as a broken build on main, because it means every
node is serving a seed that doesn't sprout.
