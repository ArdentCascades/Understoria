#!/usr/bin/env bash
#
# Pack this node's Corresponding Source (AGPL-3.0 §13) so the running
# deployment can serve it at /source/ — no GitHub (or any third party)
# required for members to receive the source of the software they're
# using, and for a new community to bootstrap a node from an existing
# one.
#
#   scripts/pack-source.sh <output-dir>
#
#   docker    the web image's `source-pack` stage runs this against the
#             build context (no .git there — .dockerignore excludes it),
#             so it falls back to tar mode and skips the history bundle.
#   baremetal run it after the web build, pointed into the served dist:
#             scripts/pack-source.sh apps/web/dist/source
#
# Output (all in <output-dir>):
#   understoria-source.tar.gz   the source tree of the built version
#   understoria.bundle          full git history (git mode only, full
#                               clones only) — `git clone understoria.bundle`
#   SHA256SUMS                  checksums for the above
#   manifest.json               version/commit/date + per-file bytes+sha256
#
# The checksums prove INTEGRITY (the download wasn't corrupted), not
# AUTHENTICITY (an operator could serve a modified tree — they already
# serve you the running app, so this adds no new trust). To check
# authenticity, compare against another node's bundle, a mirror, or
# the project's signed tags. docs/operator-guide.md says the same to
# members' faces.

set -euo pipefail

OUT="${1:?usage: scripts/pack-source.sh <output-dir>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p "$OUT"

VERSION="$(node -p "require('./package.json').version" 2>/dev/null || echo unknown)"
TARBALL="$OUT/understoria-source.tar.gz"
COMMIT="unknown"
BUNDLE_NAME=""

if git rev-parse --git-dir >/dev/null 2>&1; then
  # Git mode: archive exactly the tracked tree — untracked operator
  # files (backups/, .env, local notes) can never leak in.
  COMMIT="$(git rev-parse --short HEAD)"
  git archive --format=tar.gz -o "$TARBALL" HEAD
  if [ "$(git rev-parse --is-shallow-repository)" = "false" ]; then
    git bundle create "$OUT/understoria.bundle" --all >/dev/null 2>&1 \
      && BUNDLE_NAME="understoria.bundle" \
      || echo "pack-source: git bundle failed; serving tarball only" >&2
  else
    echo "pack-source: shallow clone — skipping the history bundle" >&2
  fi
else
  # Tar mode (the Docker build context). .dockerignore already scrubs
  # node_modules/dist/.git/.env/logs from the context; the excludes
  # below are defense in depth so a future .dockerignore edit can't
  # silently start shipping operator data in the source tarball.
  tar \
    --exclude='./node_modules' --exclude='./*/node_modules' \
    --exclude='./apps/*/node_modules' --exclude='./packages/*/node_modules' \
    --exclude='./dist' --exclude='./apps/*/dist' --exclude='./packages/*/dist' \
    --exclude='./.git' \
    --exclude='./backups' \
    --exclude='./.env' --exclude='./.env.*' \
    --exclude='./*.log' --exclude='./*.db' --exclude='./*.db.gz' \
    --exclude='./.cache' --exclude='./.turbo' --exclude='./coverage' \
    -czf "$TARBALL" .
fi

cd "$OUT"
FILES=("understoria-source.tar.gz")
[ -n "$BUNDLE_NAME" ] && FILES+=("$BUNDLE_NAME")
sha256sum "${FILES[@]}" > SHA256SUMS

# manifest.json — what the PWA's infrastructure card reads. Written
# with node so the JSON stays valid no matter what the inputs hold.
VERSION="$VERSION" COMMIT="$COMMIT" FILES="${FILES[*]}" node -e '
const fs = require("fs");
const sums = Object.fromEntries(
  fs.readFileSync("SHA256SUMS", "utf8").trim().split("\n")
    .map(l => l.split(/\s+/)).map(([sha, name]) => [name.replace(/^\*/, ""), sha]),
);
const files = process.env.FILES.split(" ").map(name => ({
  name,
  bytes: fs.statSync(name).size,
  sha256: sums[name],
}));
fs.writeFileSync("manifest.json", JSON.stringify({
  name: "understoria",
  version: process.env.VERSION,
  commit: process.env.COMMIT,
  generatedAt: new Date().toISOString(),
  files,
}, null, 2) + "\n");
'

echo "pack-source: wrote $(ls -m "$OUT" 2>/dev/null || true) to $OUT" >&2
