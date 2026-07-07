# Multi-stage Dockerfile for the Understoria community node.
#
# Build stage: Debian-slim with build tools so better-sqlite3 compiles its
# native binding cleanly. Runtime stage: same base without the build tools,
# running as a non-root user, with `tini` as PID 1 so SIGTERM reaches the
# Node process during graceful shutdown.

FROM node:22-bookworm-slim AS build

WORKDIR /workspace

# Install OS deps for native module compilation. better-sqlite3 needs
# python3 + a C++ toolchain to build its native binding from source.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy lockfile + workspace manifests. We also copy packages/shared
# in full BEFORE `npm ci` so the root postinstall (`shared:build`) has
# source files to compile against. Otherwise `npm ci` would either
# fail, or — with `--ignore-scripts` — succeed but leave better-sqlite3
# without its native binding.
COPY package.json package-lock.json .npmrc ./
COPY apps/server/package.json apps/server/
COPY packages/shared packages/shared

# Install with all workspaces. Lifecycle scripts run:
#   - root postinstall → builds packages/shared → packages/shared/dist
#   - better-sqlite3 install → compiles native binding
RUN npm ci --workspaces --include-workspace-root --no-audit --no-fund

# Copy the server source and build it. Server's tsc resolves
# @understoria/shared types from the dist produced above.
# NODE_OPTIONS: same reasoning as apps/web/Dockerfile — on a 1 GB
# host V8 caps its own heap near ~512 MB and aborts rather than use
# swap; raise the ceiling for the compile. Build-stage only (the
# runtime stage is a fresh FROM and never sees this env).
COPY apps/server apps/server
ENV NODE_OPTIONS=--max-old-space-size=1536
RUN npm --workspace @understoria/server run build

# Drop dev dependencies so the runtime stage doesn't carry vitest,
# jsdom, vite, tailwind, etc. `npm prune --omit=dev` works on
# workspace installs and removes anything tagged devDependency in any
# manifest. Saves ~300MB+ on the final image.
RUN npm prune --workspaces --include-workspace-root --omit=dev


FROM node:22-bookworm-slim AS runtime

# tini provides clean signal forwarding so docker stop / SIGTERM
# triggers the server's graceful shutdown path. sqlite3 is the CLI
# binary (~3MB) needed by scripts/backup-db.sh's online `.backup`
# call — the JS binding (better-sqlite3) is unrelated.
RUN apt-get update \
    && apt-get install -y --no-install-recommends tini ca-certificates sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Non-root user with a writable data dir for the SQLite file.
RUN groupadd --system --gid 10001 understoria \
    && useradd --system --uid 10001 --gid understoria --home /app --shell /usr/sbin/nologin understoria \
    && mkdir -p /app /data \
    && chown -R understoria:understoria /app /data

WORKDIR /app

# Copy production dependencies + built server + shared package's dist.
# Note: only packages/shared/dist (and its package.json) are needed at
# runtime — the source/tsconfig stay behind in the build stage.
COPY --from=build --chown=understoria:understoria /workspace/node_modules ./node_modules
COPY --from=build --chown=understoria:understoria /workspace/apps/server/dist ./dist
COPY --from=build --chown=understoria:understoria /workspace/apps/server/package.json ./package.json
COPY --from=build --chown=understoria:understoria /workspace/packages/shared/package.json ./node_modules/@understoria/shared/package.json
COPY --from=build --chown=understoria:understoria /workspace/packages/shared/dist ./node_modules/@understoria/shared/dist

# Operator helpers that ship with the image (key generation, etc.).
# These are NOT on any startup path — they're invoked via
# `docker compose run --rm --entrypoint node understoria /app/scripts/<x>.mjs`.
COPY --chown=understoria:understoria scripts ./scripts

USER understoria

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8787 \
    DATABASE_PATH=/data/understoria.db \
    LOG_LEVEL=info \
    LOG_REQUEST_PATHS=false

EXPOSE 8787
VOLUME ["/data"]

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/index.js"]
