// The origin to embed in anything that LEAVES this device: invite
// links, QR codes (including the printed offline-kit poster), ICS
// URL fields, print-page footers. On the web that has always been
// window.location.origin — the PWA is served by the community node,
// so its own origin IS the community's public address. The desktop
// shell (lib/desktop.ts) breaks that identity: its origin is
// app://understoria, a scheme no phone can open. There the public
// origin is derived from the configured community node URL — the
// exact inverse of nodeOriginSuggest's `${origin}/api` derivation
// (deploy/Caddyfile: the app and the API share one origin, the API
// under /api).
//
// Reads of the node URL are async (Dexie), but the ~25 share sites
// are sync render code — so the derived origin is a module-level
// cache, primed at boot (main.tsx) and re-primed inside
// writeSubmitConfig (the single place the node URL changes).

import { isDesktopShell } from "./desktop";

let cachedNodeAppOrigin: string | null = null;

/**
 * The community's public web origin implied by a node URL:
 * strip a single trailing `/api` segment, keep everything else.
 * `https://commons.example/api` → `https://commons.example`;
 * a bare `http://192.168.1.20:8080` stays itself. Returns null for
 * anything unparsable or non-http(s) — a bad setting must never
 * poison share links.
 */
export function deriveAppOriginFromNodeUrl(nodeUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(nodeUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const path = url.pathname.replace(/\/+$/, "");
  const withoutApi = path.endsWith("/api")
    ? path.slice(0, -"/api".length)
    : path;
  return `${url.origin}${withoutApi}`;
}

/** Cache the derived public origin. Call with the current node URL
 *  whenever it is (re)configured; empty/invalid clears the cache. */
export function primeShareOrigin(nodeUrl: string | null | undefined): void {
  cachedNodeAppOrigin = nodeUrl ? deriveAppOriginFromNodeUrl(nodeUrl) : null;
}

/**
 * The origin for outward-facing URLs. On http(s) this is exactly
 * window.location.origin — web behavior unchanged, byte for byte.
 * In the desktop shell it is the community's derived public origin;
 * if none is configured yet, it falls back to location.origin (an
 * app:// URL — non-routable, but an unconnected device has nothing
 * worth sharing, and pretending otherwise would be worse).
 */
export function shareOrigin(): string {
  if (typeof window === "undefined") return "";
  if (!isDesktopShell()) return window.location.origin;
  return cachedNodeAppOrigin ?? window.location.origin;
}
