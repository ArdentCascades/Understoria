import Fastify, { type FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { Database as DatabaseType } from "better-sqlite3";
import type { Config } from "./config.js";
import { createExchangeStore, openDatabase } from "./db.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerExchangeRoutes } from "./routes/exchanges.js";

export interface BuildOptions {
  config: Config;
  /**
   * Optional injected database. Tests pass `:memory:` via openDatabase,
   * or a fresh tmp path; production goes through the env-driven path.
   */
  database?: DatabaseType;
}

export interface BuiltServer {
  app: FastifyInstance;
  database: DatabaseType;
}

/**
 * Builds a Fastify instance with security middleware, schema-migrated
 * SQLite, and the routes wired up. Exported separately from the entry
 * point so integration tests can `app.inject()` without binding a port.
 */
export async function buildServer({
  config,
  database,
}: BuildOptions): Promise<BuiltServer> {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      // Minimal-logging policy from docs/threat-model.md §6.
      // We do NOT include req.hostname, req.ip, headers, or bodies.
      // Pino's default request serializer leaks IPs by default —
      // override it.
      serializers: {
        req: (req: { method: string; url: string }) =>
          config.logRequestPaths
            ? { method: req.method, url: req.url }
            : { method: req.method },
      },
    },
    // 64 KB body cap: an Exchange JSON is well under 2 KB; oversize
    // bodies are abuse.
    bodyLimit: 64 * 1024,
    // Disable Fastify's default trustProxy so X-Forwarded-For from a
    // misconfigured upstream doesn't put member IPs into the rate
    // limiter's keys (that would be a logged identifier in disguise).
    trustProxy: false,
  });

  // Security headers per docs/operator-guide.md §4 (Caddyfile shows the
  // matching reverse-proxy config). Helmet handles CSP, HSTS, X-Frame-
  // Options, X-Content-Type-Options, Referrer-Policy, etc.
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  await app.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: "1 minute",
    // Hash the IP so it never reaches storage even in memory key form.
    // The default key fn would put req.ip into an internal map; we replace
    // it with a non-reversible bucket id derived from the IP only at
    // throttle time.
    keyGenerator: (req) => hashIpToBucket(req.ip),
  });

  // Permissive CORS for the configured PWA origin.
  app.addHook("onRequest", async (req, reply) => {
    const origin = req.headers.origin;
    if (!origin) return;
    if (config.corsOrigin === "*" || origin === config.corsOrigin) {
      reply.header("Access-Control-Allow-Origin", origin);
      reply.header("Vary", "Origin");
      reply.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS",
      );
      reply.header(
        "Access-Control-Allow-Headers",
        "Content-Type",
      );
      if (req.method === "OPTIONS") {
        reply.code(204).send();
      }
    }
  });

  const db = database ?? openDatabase(config.databasePath);
  const store = createExchangeStore(db);

  await registerHealthRoutes(app);
  await registerExchangeRoutes(app, { store });

  return { app, database: db };
}

/**
 * Map an IP string to a small bucket id without retaining the IP. Used
 * exclusively for rate-limit keying; never logged. The bucket count is
 * 1024, large enough to make false-collision throttling rare in a
 * pilot-sized community while small enough that the keyspace itself
 * leaks no identifying information.
 */
function hashIpToBucket(ip: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < ip.length; i++) {
    h ^= ip.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `bucket_${(h >>> 0) % 1024}`;
}
