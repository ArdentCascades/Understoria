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
  };
}
