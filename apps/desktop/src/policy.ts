// Window/permission policy for the desktop shell, pure and testable.
// The posture matches the rest of the project: capabilities are
// named, the default answer is no.

/** Permissions the renderer may hold, and why:
 *  - media: the voice recorder (voice notes / voice board) and the
 *    pairing camera path (dead in Electron — BarcodeDetector is
 *    absent — but harmless to allow; the UI falls back to paste).
 *  - clipboard-read: the one-tap paste in device pairing.
 *  - clipboard-sanitized-write: navigator.clipboard.writeText for
 *    copy actions (share fallback, keys, pairing codes).
 *  - screen-wake-lock: the gathering/present screen keeps the
 *    display on. */
const ALLOWED_PERMISSIONS = new Set([
  "media",
  "clipboard-read",
  "clipboard-sanitized-write",
  "screen-wake-lock",
]);

export function isPermissionAllowed(permission: string): boolean {
  return ALLOWED_PERMISSIONS.has(permission);
}

export type WindowOpenDecision = "allow-blank" | "external" | "deny";

/**
 * window.open / target=_blank policy. The recovery-kit print sheet
 * opens about:blank and document.writes into it — the one in-app
 * popup we allow. Web links go to the system browser. Everything
 * else (including app:// child windows) is denied: the app is a
 * single window.
 */
export function decideWindowOpen(url: string): WindowOpenDecision {
  if (url === "about:blank" || url === "") return "allow-blank";
  if (isExternalOpenable(url)) return "external";
  return "deny";
}

/** Top-level navigation may only stay inside the app's own scheme.
 *  (In-page History API routing never hits will-navigate; this only
 *  fires for real location changes, e.g. a plain <a href=https://…>.) */
export function isInternalNavigation(url: string, appScheme = "app:"): boolean {
  try {
    return new URL(url).protocol === appScheme;
  } catch {
    return false;
  }
}

/** Only web and mail links are handed to the OS — never file:,
 *  never other apps' custom schemes (a rendered post must not be
 *  able to launch arbitrary local protocol handlers). */
export function isExternalOpenable(url: string): boolean {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "https:" || protocol === "http:" || protocol === "mailto:";
  } catch {
    return false;
  }
}
