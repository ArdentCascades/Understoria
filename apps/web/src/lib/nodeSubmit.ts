import type { Exchange } from "@/types";
import { db, SETTING_KEYS, getSetting, setSetting } from "@/db/database";

/**
 * Best-effort mirroring of a finalized exchange to the community node.
 *
 * Why best-effort: a community node down for 30s when a member confirms
 * an exchange should not block the exchange itself or surface as an
 * error in the user's flow. The exchange already lives on the local
 * device, signed by both parties; the node copy is for community-wide
 * visibility and federation.
 *
 * Robust delivery (an outbox table + retry worker) is tracked work
 * for a follow-up slice. For v1 we just fire the POST and record the
 * outcome in settings so the Profile page can show "last success" and
 * "last error" chips.
 *
 * The helper never throws — every failure path resolves with the
 * `error` field set. Callers should `await` only if they want to
 * display the immediate result; the production call site fires it
 * unawaited.
 */

export interface SubmitConfig {
  url: string;
  enabled: boolean;
}

export interface SubmitResult {
  /** True iff the node returned a 2xx status. */
  ok: boolean;
  /** Set when ok is false. Suitable for surfacing in the UI. */
  error?: string;
  /** HTTP status returned by the node, if we got that far. */
  status?: number;
}

export async function readSubmitConfig(): Promise<SubmitConfig> {
  const [url, enabledRaw] = await Promise.all([
    getSetting(SETTING_KEYS.communityNodeUrl),
    getSetting(SETTING_KEYS.communityNodeEnabled),
  ]);
  return {
    url: url ?? "",
    enabled: enabledRaw === "1",
  };
}

export async function writeSubmitConfig(cfg: SubmitConfig): Promise<void> {
  await Promise.all([
    setSetting(SETTING_KEYS.communityNodeUrl, cfg.url),
    setSetting(SETTING_KEYS.communityNodeEnabled, cfg.enabled ? "1" : "0"),
  ]);
}

export interface SubmitDeps {
  fetchImpl?: typeof fetch;
}

export async function submitExchangeToNode(
  exchange: Exchange,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  if (!config.enabled || !config.url.trim()) {
    return { ok: false, error: "disabled" };
  }

  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) {
    return { ok: false, error: "fetch_not_available" };
  }

  const endpoint = joinUrl(config.url.trim(), "/exchanges");
  let res: Response;
  try {
    res = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exchange),
      // Browsers default credentials to "same-origin" — we want explicit
      // omit since the node is cross-origin and signatures are the
      // authentication.
      credentials: "omit",
      mode: "cors",
    });
  } catch (err) {
    const error = (err as Error).message ?? "network_error";
    await recordOutcome({ ok: false, error });
    return { ok: false, error };
  }

  if (res.ok) {
    await recordOutcome({ ok: true, status: res.status });
    return { ok: true, status: res.status };
  }
  // 4xx/5xx — try to read the error body for diagnostics, fall back to status.
  let body = "";
  try {
    body = (await res.text()).slice(0, 200);
  } catch {
    /* ignore */
  }
  const error = body || `http_${res.status}`;
  await recordOutcome({ ok: false, status: res.status, error });
  return { ok: false, status: res.status, error };
}

function joinUrl(base: string, path: string): string {
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${trimmed}${path.startsWith("/") ? path : `/${path}`}`;
}

async function recordOutcome(result: SubmitResult): Promise<void> {
  try {
    if (result.ok) {
      await setSetting(
        SETTING_KEYS.communityNodeLastSuccess,
        new Date().toISOString(),
      );
      await setSetting(SETTING_KEYS.communityNodeLastError, "");
    } else if (result.error) {
      await setSetting(SETTING_KEYS.communityNodeLastError, result.error);
    }
  } catch {
    // Settings table writes can fail mid-purge; recording telemetry is
    // best-effort too.
  }
}

/**
 * Convenience: read the last-known status pair without forcing a
 * re-render path. Used by the Profile NodeSection to show "last
 * success" and "last error" chips.
 */
export async function readSubmitStatus(): Promise<{
  lastSuccess?: string;
  lastError?: string;
}> {
  const [s, e] = await Promise.all([
    getSetting(SETTING_KEYS.communityNodeLastSuccess),
    getSetting(SETTING_KEYS.communityNodeLastError),
  ]);
  return {
    lastSuccess: s || undefined,
    lastError: e || undefined,
  };
}

// Re-export the underlying db so tests can clear settings between cases
// without each test importing the singleton separately.
export { db };
