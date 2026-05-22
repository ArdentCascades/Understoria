/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Server configuration. Read once at startup from environment variables;
 * never re-read at runtime. Defaults are suitable for local development
 * and a Raspberry-Pi-class single-community pilot.
 */

export interface Config {
  /** Bind address. `0.0.0.0` in containers; `127.0.0.1` for local dev. */
  host: string;
  port: number;
  /** Filesystem path to the SQLite database file. */
  databasePath: string;
  /**
   * Origin allowed by the CORS preflight. Set to the URL where the PWA
   * is served. Wildcard is allowed for development but NOT for prod.
   */
  corsOrigin: string;
  /** Per-IP requests per minute. */
  rateLimitMax: number;
  /** Stable identifier for this node. Embedded in stored exchanges. */
  nodeId: string;
  /** Pino log level. `info` by default; flip to `debug` for triage only. */
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  /**
   * If true, log lines include the request method+path. If false, only
   * aggregate counts/timings. Default is false to honor the threat
   * model's minimal-logging policy.
   */
  logRequestPaths: boolean;
  /**
   * Operator / hosting transparency block — folded into Agent 11 from
   * the original "Beyond Ostrom" Agent 21. Optional: when none of the
   * three env vars are set, `GET /config` omits the `operator` section
   * rather than returning empty strings. An operator who chose not to
   * identify themselves publicly should not have to.
   */
  operatorName: string | null;
  operatorFundingNote: string | null;
  operatorContact: string | null;
  /**
   * Federation peers this node pulls from. Comma-separated base URLs
   * (no path, no trailing slash; the worker appends `/exchanges`).
   * Read from PEER_NODE_URLS at startup; Agent 15 (federation
   * governance) will replace this with signed federation agreements.
   * Empty means "this node does not federate."
   */
  peerNodeUrls: readonly string[];
  /** How often the pull worker hits each peer, in milliseconds.
   *  Default 5 minutes — small enough to feel live, large enough not
   *  to hammer a peer running on a Raspberry Pi. */
  peerPullIntervalMs: number;
}

function asInt(name: string, raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${name} must be a positive integer, got ${JSON.stringify(raw)}`);
  }
  return n;
}

function asBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw === "") return fallback;
  return raw === "1" || raw.toLowerCase() === "true" || raw.toLowerCase() === "yes";
}

const VALID_LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace"] as const;

export function readConfigFromEnv(env: NodeJS.ProcessEnv = process.env): Config {
  const logLevelRaw = (env.LOG_LEVEL ?? "info").toLowerCase();
  if (!VALID_LOG_LEVELS.includes(logLevelRaw as Config["logLevel"])) {
    throw new Error(
      `LOG_LEVEL must be one of ${VALID_LOG_LEVELS.join(", ")}, got ${JSON.stringify(env.LOG_LEVEL)}`,
    );
  }
  return {
    host: env.HOST ?? "127.0.0.1",
    port: asInt("PORT", env.PORT, 8787),
    databasePath: env.DATABASE_PATH ?? "./understoria.db",
    corsOrigin: env.CORS_ORIGIN ?? "*",
    rateLimitMax: asInt("RATE_LIMIT_MAX", env.RATE_LIMIT_MAX, 60),
    nodeId: env.NODE_ID ?? "node_local",
    logLevel: logLevelRaw as Config["logLevel"],
    logRequestPaths: asBool(env.LOG_REQUEST_PATHS, false),
    operatorName: nonEmpty(env.OPERATOR_NAME),
    operatorFundingNote: nonEmpty(env.OPERATOR_FUNDING_NOTE),
    operatorContact: nonEmpty(env.OPERATOR_CONTACT),
    peerNodeUrls: parsePeerUrls(env.PEER_NODE_URLS),
    peerPullIntervalMs: asInt(
      "PEER_PULL_INTERVAL_MS",
      env.PEER_PULL_INTERVAL_MS,
      5 * 60 * 1000,
    ),
  };
}

function nonEmpty(raw: string | undefined): string | null {
  if (raw === undefined || raw.trim() === "") return null;
  return raw;
}

function parsePeerUrls(raw: string | undefined): readonly string[] {
  if (raw === undefined || raw.trim() === "") return [];
  const urls: string[] = [];
  for (const candidate of raw.split(",")) {
    const trimmed = candidate.trim().replace(/\/+$/, "");
    if (trimmed === "") continue;
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new Error(
        `PEER_NODE_URLS entry ${JSON.stringify(trimmed)} is not a valid URL`,
      );
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(
        `PEER_NODE_URLS entry ${JSON.stringify(trimmed)} must be http(s)`,
      );
    }
    urls.push(trimmed);
  }
  return urls;
}
