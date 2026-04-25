# Multi-stage Dockerfile for the Understoria community node.
#
# Build stage: Debian-slim with build tools so better-sqlite3 compiles its
# native binding cleanly. Runtime stage: same base without the build tools,
# running as a non-root user, with `tini` as PID 1 so SIGTERM reaches the
# Node process during graceful shutdown.

FROM node:22-bookworm-slim AS build

WORKDIR /workspace

# Install OS deps for native module compilation.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy lockfile + workspace manifests for a cacheable install.
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN npm ci --workspaces --include-workspace-root --no-audit --no-fund

# Copy source for both workspaces and build the server.
COPY packages/shared packages/shared
COPY apps/server apps/server
RUN npm --workspace @understoria/server run build


FROM node:22-bookworm-slim AS runtime

# tini provides clean signal forwarding so docker stop / SIGTERM
# triggers the server's graceful shutdown path.
RUN apt-get update \
    && apt-get install -y --no-install-recommends tini ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Non-root user with a writable data dir for the SQLite file.
RUN groupadd --system --gid 10001 understoria \
    && useradd --system --uid 10001 --gid understoria --home /app --shell /usr/sbin/nologin understoria \
    && mkdir -p /app /data \
    && chown -R understoria:understoria /app /data

WORKDIR /app

# Copy production dependencies + built server + shared package.
COPY --from=build --chown=understoria:understoria /workspace/node_modules ./node_modules
COPY --from=build --chown=understoria:understoria /workspace/apps/server/dist ./dist
COPY --from=build --chown=understoria:understoria /workspace/apps/server/package.json ./package.json
COPY --from=build --chown=understoria:understoria /workspace/packages/shared ./node_modules/@understoria/shared

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
