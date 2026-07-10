#!/usr/bin/env bash
#
# Recomputes the sha256 hash of the inline `<script>` block in the
# BUILT `dist/index.html` and prints the value to paste into the
# Caddyfile's `Content-Security-Policy` header.
#
# When to run:
#   - After editing `apps/web/index.html` (the source).
#   - After any `apps/web` dependency bump that might change how
#     Vite renders inline scripts (rare — Vite preserves them
#     verbatim, but verify).
#   - As part of release prep, to confirm the hash baked into
#     `deploy/Caddyfile` still matches the build output.
#
# Why this is needed:
#   The inline script in `apps/web/index.html` is the no-FOUC theme +
#   density bootstrap. It MUST run synchronously before first paint,
#   so it can't be moved to an external file without a blocking
#   request that defeats the purpose. CSP requires its sha256 hash
#   in `script-src` for it to execute.
#
# Usage:
#   scripts/csp-hash.sh
#
# Exits non-zero if no inline script is found or if the build
# directory doesn't exist (build the PWA first).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$REPO_ROOT/apps/web/dist/index.html"

if [ ! -f "$DIST" ]; then
  echo "ERROR: $DIST not found." >&2
  echo "Build the PWA first:  npm run build  (from the repo root)" >&2
  exit 1
fi

python3 - "$DIST" <<'PY'
import sys, re, hashlib, base64

path = sys.argv[1]
with open(path, encoding="utf-8") as f:
    html = f.read()

# Inline scripts only — those without a `src=` attribute. Each
# distinct inline body needs its own sha256 in script-src.
inline = re.findall(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", html, re.DOTALL)
if not inline:
    print("ERROR: no inline <script> blocks in built index.html", file=sys.stderr)
    sys.exit(2)

for i, body in enumerate(inline, 1):
    digest = hashlib.sha256(body.encode("utf-8")).digest()
    h = "sha256-" + base64.b64encode(digest).decode("ascii")
    print(f"# inline script #{i}  ({len(body)} bytes)")
    print(f"'{h}'")
PY
