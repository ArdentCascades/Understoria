# Multi-stage Dockerfile for the Understoria PWA static bundle.
#
# Build stage: compile the React app with Vite. Runtime stage: a tiny
# busybox image whose only job is to copy the built dist into a shared
# volume on first run and exit. Caddy then serves the same volume.
# This keeps the build cacheable, lets `docker compose up` rebuild on
# code change without rebuilding Caddy, and avoids running a Node
# process at runtime just to hold static files.

FROM node:22-bookworm-slim AS build

WORKDIR /workspace

# Same shared-package-first ordering as apps/server/Dockerfile so
# `npm ci` has the workspace's source on hand for the root postinstall.
COPY package.json package-lock.json .npmrc ./
COPY apps/web/package.json apps/web/
COPY packages/shared packages/shared

RUN npm ci --workspaces --include-workspace-root --no-audit --no-fund

# Copy the web source and build. `tsc --noEmit` runs first via the
# package's `build` script and gates on type errors.
COPY apps/web apps/web

# Raise V8's self-imposed heap cap for the compile. Node sizes its
# default old-space limit from the machine's TOTAL RAM, so on the
# 1 GB VPS the runbook recommends it caps itself near ~512 MB and
# aborts (exit code 134, "Reached heap limit") before ever touching
# swap — tsc + vite need more than that. This is a ceiling, not a
# reservation: hosts with less physical RAM than the cap need swap
# to back it (see docs/deploy-linode.md §1). Build-stage only — the
# runtime stage below is busybox and runs no Node at all.
ENV NODE_OPTIONS=--max-old-space-size=1536

# Build stamp (docs/operator-guide.md §6): the build context has no
# .git (.dockerignore), so vite can't read the commit hash itself.
# Pass it in — `docker compose build` forwards VITE_BUILD_STAMP, and
# the deploy runbook sets it to `git rev-parse --short HEAD`. Absent,
# it stays empty and Settings shows "dev".
ARG VITE_BUILD_STAMP=""
ENV VITE_BUILD_STAMP=$VITE_BUILD_STAMP
RUN npm --workspace @understoria/web run build

# ---------------------------------------------------------------------
# Source-pack stage: bundle this build's Corresponding Source so the
# node serves it at /source/ (AGPL §13 with no third-party dependency —
# see scripts/pack-source.sh and docs/operator-guide.md). The build
# context has no .git (.dockerignore), so the script runs in tar mode:
# the context IS the source tree, already scrubbed of node_modules,
# dist, .env, and operator data by .dockerignore.

FROM node:22-bookworm-slim AS source-pack

WORKDIR /src
COPY . .
RUN bash scripts/pack-source.sh /out/source

# ---------------------------------------------------------------------
# Runtime stage: one-shot copy into a shared volume, then exit. Compose
# uses `depends_on: { web: { condition: service_completed_successfully } }`
# on the Caddy service so the static files are present before Caddy
# starts serving.

FROM busybox:1.37-musl AS runtime

COPY --from=build /workspace/apps/web/dist /dist
COPY --from=source-pack /out/source /dist/source

# Empty the target then refill it, so a redeploy that removed files
# (chunk-renamed bundles, deleted routes) doesn't leave stale assets
# the service worker might still reference.
CMD ["sh", "-c", "rm -rf /out/* /out/.[!.]* 2>/dev/null; cp -R /dist/. /out/ && echo 'understoria web bundle deployed to volume'"]
