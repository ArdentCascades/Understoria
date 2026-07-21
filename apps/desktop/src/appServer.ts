// The app:// protocol handler's brain, kept pure so it can be tested
// without Electron: which file a request maps to, what MIME type it
// gets, and what CSP the HTML carries. main.ts is glue around this.

import { createHash } from "node:crypto";
import path from "node:path";

/** Where a request lands: a real file under the web root, or the SPA
 *  fallback (index.html). The fallback mirrors the web deployment's
 *  SPA behavior (workbox `navigateFallback`), so a BrowserRouter deep
 *  link like app://understoria/calendar survives a reload. */
export type Resolution =
  | { kind: "file"; filePath: string }
  | { kind: "fallback"; filePath: string };

/**
 * Map a URL pathname onto the packaged web dist. Traversal-safe: the
 * decoded, normalized path must stay inside `webRoot` or we fall back
 * to index.html (never an error page that could leak path structure —
 * and for a local, read-only bundle the fallback is always safe).
 */
export function resolveAppPath(pathname: string, webRoot: string): Resolution {
  const fallback: Resolution = {
    kind: "fallback",
    filePath: path.join(webRoot, "index.html"),
  };
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return fallback;
  }
  // path.normalize collapses any ../ the decode may have produced;
  // the prefix check below is the actual guarantee.
  const joined = path.normalize(path.join(webRoot, decoded));
  if (joined !== webRoot && !joined.startsWith(webRoot + path.sep)) {
    return fallback;
  }
  // Extensionless paths are SPA routes (/calendar, /post/abc). Only a
  // path that names a file type is served as a file; everything else
  // is the app shell.
  if (!path.extname(joined)) return fallback;
  return { kind: "file", filePath: joined };
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

export function mimeFor(filePath: string): string {
  return MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Hashes for the inline scripts the built index.html carries (the
 * no-FOUC theme script), so the CSP can allow exactly those and no
 * other inline script. Computed once at startup from the shipped
 * file — never 'unsafe-inline'.
 */
export function extractInlineScriptHashes(html: string): string[] {
  const hashes: string[] = [];
  const re = /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(re)) {
    const body = match[1];
    if (!body.trim()) continue;
    const digest = createHash("sha256").update(body, "utf8").digest("base64");
    hashes.push(`'sha256-${digest}'`);
  }
  return hashes;
}

/**
 * The CSP attached to every HTML response. connect-src allows any
 * http(s) host because the community node is member-configured and
 * may be a bare LAN address (http://192.168.x.x) — restricting it to
 * a fixed list would break exactly the offline posture the desktop
 * app exists for. Everything else stays 'self'.
 */
export function buildCsp(inlineScriptHashes: string[]): string {
  const script = ["'self'", ...inlineScriptHashes].join(" ");
  return [
    "default-src 'self'",
    `script-src ${script}`,
    // Tailwind ships a real stylesheet, but React components set
    // style attributes; 'unsafe-inline' here covers attributes only
    // (style elements/attrs), the standard PWA posture.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "font-src 'self'",
    "connect-src 'self' https: http: wss: ws:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
}
