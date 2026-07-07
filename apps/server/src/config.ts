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
  /**
   * Value passed to Fastify's `trustProxy` (Round-4 review). Empty
   * string / undefined → `false` (direct exposure). Set `TRUST_PROXY`
   * to `loopback` (or the proxy's address) when behind the documented
   * Caddy reverse proxy, so `req.ip` resolves the REAL client IP from
   * `X-Forwarded-For` instead of the proxy's loopback address — without
   * which every client collapses into one rate-limit bucket. The IP is
   * still only ever HASHED to a bucket, never stored raw.
   */
  trustProxy: string;
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
  /**
   * Base64-encoded Ed25519 secret key bytes (64-byte libsodium form,
   * 32 seed + 32 pubkey) for the node system key — the signer used
   * to close out `awaiting_confirmation` records that have aged past
   * the community's `autoConfirmHours`. See
   * `docs/auto-confirm-key.md`.
   *
   * Set via `NODE_SYSTEM_SECRET_KEY` at deploy time. Null means the
   * operator has not configured one: the server still boots and the
   * rest of the routes work, but `POST /auto-confirm` returns
   * `missing_system_key` and `GET /config.systemKey` is omitted.
   * The PWA's `autoConfirmHours` knob and this env var are
   * independently controlled — a community CAN have
   * `autoConfirmHours > 0` while the operator has not yet supplied
   * a key. The server logs a startup warning in that case but does
   * NOT crash; the operator may be staging the rollout.
   */
  systemSecretKey: string | null;
  /**
   * Retired system pubkeys, published verbatim in
   * `GET /config.systemKey.history` so pulling peers can verify
   * records signed before a rotation (§4 of
   * `docs/auto-confirm-key.md`; procedure in
   * `docs/system-key-rotation.md`).
   *
   * Set via `NODE_SYSTEM_KEY_HISTORY`: a JSON array of
   * `{ "pubkey": "<base64>", "retiredAt": <epoch ms> }` entries.
   * Each entry is a key this node PREVIOUSLY published as current,
   * with the moment it stopped signing. Malformed JSON or entries
   * fail the boot loudly — a silently-dropped history entry would
   * make peers reject this node's pre-rotation records. Empty /
   * unset means "never rotated" (the common case).
   */
  systemKeyHistory: { pubkey: string; retiredAt: number }[];
  /**
   * Minimum hours the server requires to have elapsed before it
   * will sign an auto-confirm record. Independent of (and a floor
   * over) the PWA's community-configurable `autoConfirmHours` — the
   * server is the trust boundary for the system key and decides for
   * itself how aged a record has to be. Default 168 (7 days),
   * matching the design note's pilot recommendation.
   */
  autoConfirmMinHours: number;
  /**
   * When true, `POST /auto-confirm` REFUSES to sign a request whose
   * `postId` has no stored awaiting-transition artifact
   * (`missing_transition`) — the fully-enforced mode of
   * `docs/auto-confirm-key.md` §5. Default false for rollout: clients
   * must first ship the artifact-pushing build and existing pending
   * confirmations must drain through, or every in-flight auto-confirm
   * would strand. When an artifact IS present the window is enforced
   * from its server-stamped `received_at` regardless of this flag —
   * the flag only controls what happens when one is absent.
   */
  autoConfirmRequireTransition: boolean;
  /**
   * Disk-fill backstop ceilings (see `apps/server/src/insertCaps.ts`).
   * `tableRowCeiling` bounds total rows per federated table;
   * `perKeyRowCeiling` bounds rows per signing key per table
   * (a LIFETIME count — record timestamps are client-claimed, so a
   * rolling window would be dodgeable by backdating). 0 disables a
   * check. Breaches answer 507 so honest clients' outboxes retry
   * rather than poison.
   */
  tableRowCeiling: number;
  perKeyRowCeiling: number;
  /**
   * Member-authenticated reads (docs/member-authenticated-reads.md).
   * `"off"` (default) leaves the GET feeds open exactly as before —
   * the staged-rollout posture: members' apps sign reads
   * unconditionally, so an operator flips this only after everyone is
   * on an app version that sends the headers. `"on"` requires every
   * federation GET to carry a valid member signature (or a configured
   * peer token). Enabling without any `NODE_FOUNDER_KEYS` fails the
   * boot loudly: an "on" node nobody can read is a misconfiguration,
   * not a security posture.
   */
  readAuth: "off" | "on";
  /**
   * Trust roots for the membership resolver: base64 Ed25519 public
   * keys of members who joined WITHOUT an invite (the founding
   * member(s)). Everyone else proves membership transitively through
   * verified redemption receipts. Comma-separated via
   * `NODE_FOUNDER_KEYS`.
   */
  founderKeys: readonly string[];
  /**
   * Shared read tokens for peer nodes (`PEER_READ_TOKENS`, JSON map of
   * peer base URL → token). Outgoing peer pulls to a mapped URL send
   * `authorization: Bearer <token>`; inbound reads presenting any
   * mapped token are accepted as peer reads when `readAuth` is on.
   * Peers aren't members; peering pairs exchange tokens out of band,
   * the same channel that already carries `PEER_NODE_URLS`.
   */
  peerReadTokens: Readonly<Record<string, string>>;
  /**
   * Encryption-at-rest key for the SQLite database
   * (`DATABASE_KEY`). When set, `openDatabase` applies `PRAGMA key`
   * (SQLCipher scheme via better-sqlite3-multiple-ciphers) before
   * migrations — the file on disk is then unreadable without it.
   * Null keeps plaintext (the pre-existing behavior; upgrades don't
   * break). Protects the powered-off disk / stolen backup, NOT a
   * live-compromised host (the key lives in this process's env).
   * One-time migration of an existing plaintext DB: operator-guide §5.
   */
  databaseKey: string | null;
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
    trustProxy: env.TRUST_PROXY ?? "",
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
    systemSecretKey: nonEmpty(env.NODE_SYSTEM_SECRET_KEY),
    systemKeyHistory: parseSystemKeyHistory(env.NODE_SYSTEM_KEY_HISTORY),
    // Non-negative so 0 is accepted (operator can lock the server's
    // floor at "off" even if the community config says otherwise —
    // defense-in-depth knob).
    autoConfirmMinHours: asNonNegativeInt(
      "AUTO_CONFIRM_MIN_HOURS",
      env.AUTO_CONFIRM_MIN_HOURS,
      168,
    ),
    autoConfirmRequireTransition: asBool(
      env.AUTO_CONFIRM_REQUIRE_TRANSITION,
      false,
    ),
    tableRowCeiling: asNonNegativeInt(
      "TABLE_ROW_CEILING",
      env.TABLE_ROW_CEILING,
      500_000,
    ),
    perKeyRowCeiling: asNonNegativeInt(
      "PER_KEY_ROW_CEILING",
      env.PER_KEY_ROW_CEILING,
      10_000,
    ),
    readAuth: parseReadAuth(env.READ_AUTH, env.NODE_FOUNDER_KEYS),
    founderKeys: parseFounderKeys(env.NODE_FOUNDER_KEYS),
    peerReadTokens: parsePeerReadTokens(env.PEER_READ_TOKENS),
    databaseKey: nonEmpty(env.DATABASE_KEY),
  };
}

function parseReadAuth(
  raw: string | undefined,
  founderRaw: string | undefined,
): "off" | "on" {
  const mode = (raw ?? "off").toLowerCase();
  if (mode !== "off" && mode !== "on") {
    throw new Error(
      `READ_AUTH must be "off" or "on", got ${JSON.stringify(raw)}`,
    );
  }
  if (mode === "on" && parseFounderKeys(founderRaw).length === 0) {
    // Loud, not lenient: enforcement with an empty member universe
    // means NOBODY can read the node — always a misconfiguration.
    throw new Error(
      "READ_AUTH=on requires at least one NODE_FOUNDER_KEYS entry " +
        "(the membership resolver's trust root — " +
        "docs/member-authenticated-reads.md §1)",
    );
  }
  return mode;
}

function parseFounderKeys(raw: string | undefined): readonly string[] {
  if (raw === undefined || raw.trim() === "") return [];
  const keys = raw
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k !== "");
  for (const key of keys) {
    // Ed25519 pubkeys are 32 bytes → 44 base64 chars. A loose sanity
    // bound only; the verifier is the real gate.
    if (key.length < 40 || key.length > 60) {
      throw new Error(
        `NODE_FOUNDER_KEYS entry ${JSON.stringify(key.slice(0, 12))}… does not look like a base64 Ed25519 public key`,
      );
    }
  }
  return keys;
}

function parsePeerReadTokens(
  raw: string | undefined,
): Readonly<Record<string, string>> {
  if (raw === undefined || raw.trim() === "") return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("PEER_READ_TOKENS is not valid JSON");
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      'PEER_READ_TOKENS must be a JSON object of {"<peer url>": "<token>"}',
    );
  }
  const out: Record<string, string> = {};
  for (const [url, token] of Object.entries(parsed)) {
    if (typeof token !== "string" || token.length < 16) {
      // Short bearer tokens are guessable; refuse them at boot rather
      // than let a weak one quietly hold the read door open.
      throw new Error(
        `PEER_READ_TOKENS entry for ${JSON.stringify(url)} must be a string of at least 16 characters`,
      );
    }
    out[url.replace(/\/+$/, "")] = token;
  }
  return out;
}

function asNonNegativeInt(
  name: string,
  raw: string | undefined,
  fallback: number,
): number {
  if (raw === undefined || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(
      `${name} must be a non-negative integer, got ${JSON.stringify(raw)}`,
    );
  }
  return n;
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

function parseSystemKeyHistory(
  raw: string | undefined,
): { pubkey: string; retiredAt: number }[] {
  if (raw === undefined || raw.trim() === "") return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("NODE_SYSTEM_KEY_HISTORY is not valid JSON");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("NODE_SYSTEM_KEY_HISTORY must be a JSON array");
  }
  const history = parsed.map((entry, i) => {
    if (
      entry === null ||
      typeof entry !== "object" ||
      typeof (entry as { pubkey?: unknown }).pubkey !== "string" ||
      (entry as { pubkey: string }).pubkey.trim() === "" ||
      typeof (entry as { retiredAt?: unknown }).retiredAt !== "number" ||
      !Number.isInteger((entry as { retiredAt: number }).retiredAt) ||
      (entry as { retiredAt: number }).retiredAt <= 0
    ) {
      // Loud, not lenient: a silently-dropped entry would make peers
      // reject every record this node system-signed before that
      // rotation. Refusing to boot is the safer failure.
      throw new Error(
        `NODE_SYSTEM_KEY_HISTORY entry ${i} must be {"pubkey": "<base64>", "retiredAt": <epoch ms>}`,
      );
    }
    return {
      pubkey: (entry as { pubkey: string }).pubkey,
      retiredAt: (entry as { retiredAt: number }).retiredAt,
    };
  });
  // Ascending by retiredAt — the order verifiers scan ("first entry
  // retired after the signing time is the key current then").
  return history.sort((a, b) => a.retiredAt - b.retiredAt);
}
