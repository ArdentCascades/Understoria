/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The quiet-by-default guard (formerly the no-notifications guard).
//
// `no-notifications` was the absolute this file originally enforced:
// no notification call site anywhere, no push dependency, full stop.
// docs/notifications.md AMENDS that principle rather than repealing
// it — "quiet by default: a notification exists only when you asked
// for it, only for things with a person or a clock on the other end"
// — and this guard evolves with it. The claim it now pins is scoped,
// not gone:
//
//   - OS-surface call sites (notifications, push, badges, vibration)
//     may exist ONLY in the files named in the allowlist below, each
//     with the specific capability it is allowed — panic.ts may drop
//     a push subscription, never create one. Anything anywhere else
//     still fails this test, exactly as before.
//   - The only push-delivery dependency allowed is `web-push` in the
//     server (standard Web Push from the community's own node).
//     Vendor push SDKs (Firebase, OneSignal…) stay forbidden
//     everywhere — the doc's decision 8.
//   - The generated service worker stays generateSW; the push
//     display handler is the one audited static script
//     (public/push-sw.js), pinned here and cross-checked against the
//     shared category enum in notifications.guard.test.ts.
//
// WHAT THIS DELIBERATELY DOES NOT FORBID: the nudge stream. The app
// holds a Server-Sent-Events connection carrying a content-free
// "something changed" frame (docs/sync-liveness.md). That is server
// push and it is fine — it raises nothing, addresses no one, and
// dies with a hidden tab.
//
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..", "..", "..");

/** Every app/package source tree that ships to a member or a node. */
const TREES = [
  join(ROOT, "apps", "web", "src"),
  join(ROOT, "apps", "server", "src"),
  join(ROOT, "apps", "desktop", "src"),
  join(ROOT, "packages", "shared", "src"),
];

/** Call sites that would put something in front of a member without
 *  their asking — the OS surfaces, not in-app rendering. */
const FORBIDDEN: ReadonlyArray<{ pattern: RegExp; what: string }> = [
  { pattern: /\bnew\s+Notification\s*\(/, what: "Notification constructor" },
  { pattern: /Notification\s*\.\s*requestPermission/, what: "notification permission prompt" },
  { pattern: /\.\s*showNotification\s*\(/, what: "ServiceWorker showNotification" },
  { pattern: /\bPushManager\b/, what: "PushManager" },
  { pattern: /\.\s*pushManager\b/, what: "registration.pushManager" },
  { pattern: /applicationServerKey/, what: "VAPID application server key" },
  { pattern: /navigator\s*\.\s*setAppBadge/, what: "OS badge count" },
  { pattern: /navigator\s*\.\s*clearAppBadge/, what: "OS badge count" },
  { pattern: /navigator\s*\.\s*vibrate/, what: "vibration" },
  { pattern: /document\s*\.\s*title\s*=/, what: "document.title mutation (title flashing)" },
];

/**
 * The amendment, file by file (docs/notifications.md). Each entry
 * names the ONLY capabilities that file may use; a new capability in
 * an allowed file, or any capability in a new file, fails the scan
 * and must argue its case here and in the doc in the same PR.
 */
const ALLOWED: Readonly<Record<string, readonly string[]>> = {
  // Panic teardown: DROPPING the push subscription during a purge.
  // Reading and unsubscribing only — a subscribe call here would be
  // "pushManager" too, which is why the entry exists per-file, not
  // per-pattern-everywhere.
  "apps/web/src/lib/panic.ts": ["registration.pushManager"],
  // THE browser half: the one file that may prompt for permission
  // and create a subscription — from the Settings flow alone, after
  // the disclosure, never re-asking a denial (doc decision 2). The
  // Settings component composes it and touches no API itself.
  "apps/web/src/lib/pushBrowser.ts": [
    "notification permission prompt",
    "PushManager",
    "registration.pushManager",
    "VAPID application server key",
  ],
};

/** Guard tests that name the forbidden patterns as literals. */
const SELF_REFERENTIAL = [
  "apps/web/src/lib/noNotifications.guard.test.ts",
  "apps/web/src/lib/notifications.guard.test.ts",
];

/** Packages whose only purpose is delivering notifications. */
const FORBIDDEN_DEPS = [
  "web-push",
  "firebase",
  "@firebase/messaging",
  "onesignal",
  "react-onesignal",
  "node-pushnotifications",
];

/** The one sanctioned delivery dependency: standard Web Push, sent
 *  by the community's own node — no vendor SDK (doc decision 8). */
const ALLOWED_DEPS: ReadonlyArray<{ manifest: string; dep: string }> = [
  { manifest: "apps/server/package.json", dep: "web-push" },
  { manifest: "apps/server/package.json", dep: "@types/web-push" },
];

function sources(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) sources(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

function manifests(): string[] {
  const found = [join(ROOT, "package.json")];
  for (const group of ["apps", "packages"]) {
    const dir = join(ROOT, group);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      const m = join(dir, entry, "package.json");
      if (existsSync(m)) found.push(m);
    }
  }
  return found;
}

describe("quiet by default: the amended principle, enforced", () => {
  it("has no OS-surface call site outside the allowlisted files", () => {
    const offenders: string[] = [];
    for (const tree of TREES) {
      for (const abs of sources(tree)) {
        const rel = abs.slice(ROOT.length + 1);
        if (SELF_REFERENTIAL.includes(rel)) continue;
        const allowed = ALLOWED[rel] ?? [];
        readFileSync(abs, "utf8")
          .split("\n")
          .forEach((line, i) => {
            for (const { pattern, what } of FORBIDDEN) {
              if (pattern.test(line) && !allowed.includes(what)) {
                offenders.push(`${rel}:${i + 1}  ${what}`);
              }
            }
          });
      }
    }
    expect(offenders).toEqual([]);
  });

  it("depends on web-push in the server alone — no vendor push SDK anywhere", () => {
    const offenders: string[] = [];
    for (const m of manifests()) {
      const rel = m.slice(ROOT.length + 1);
      const pkg = JSON.parse(readFileSync(m, "utf8")) as Record<string, unknown>;
      for (const field of ["dependencies", "devDependencies", "peerDependencies"]) {
        const deps = pkg[field];
        if (!deps || typeof deps !== "object") continue;
        for (const name of Object.keys(deps as object)) {
          if (
            FORBIDDEN_DEPS.some((f) => name === f || name.startsWith(`${f}/`)) &&
            !ALLOWED_DEPS.some((a) => a.manifest === rel && a.dep === name)
          ) {
            offenders.push(`${rel} → ${name}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps generateSW: the push handler is the one audited static script", () => {
    // vite-plugin-pwa stays in generateSW mode — the emitted worker is
    // precache + runtime caching, with the display handler riding in
    // as ONE named importScripts file. A hand-written sw source (the
    // injectManifest route) would put arbitrary code in the worker;
    // these stay absent.
    const web = join(ROOT, "apps", "web");
    const suspects = ["src/sw.ts", "src/sw.js", "src/service-worker.ts", "public/sw.js"];
    expect(suspects.filter((f) => existsSync(join(web, f)))).toEqual([]);
    const viteConfig = readFileSync(join(web, "vite.config.ts"), "utf8");
    expect(viteConfig).toContain('importScripts: ["push-sw.js"]');
    expect(viteConfig).not.toContain("injectManifest");
    expect(existsSync(join(web, "public", "push-sw.js"))).toBe(true);
  });

  it("keeps the desktop shell's notification permission denied", () => {
    // The Electron shell allowlists permissions; notifications must
    // not appear in it. Web push does not reach the desktop shell,
    // and until a desktop story is designed and documented, the
    // denial stands — opt-in on the web changes nothing here.
    const policy = readFileSync(
      join(ROOT, "apps", "desktop", "src", "policy.ts"),
      "utf8",
    );
    const allow = policy.slice(policy.indexOf("ALLOWED_PERMISSIONS"));
    expect(allow.slice(0, allow.indexOf("]"))).not.toContain("notifications");
  });

  it("the README claims no push NOTIFICATIONS by default, not no push", () => {
    // The nudge stream is real server push. A README that denied push
    // outright would be false against docs/sync-liveness.md, which
    // titles its own section "Server push — the nudge stream". This
    // assertion exists so the softer, true wording cannot quietly
    // harden.
    const readme = readFileSync(join(ROOT, "README.md"), "utf8");
    const overclaims = [
      "nothing is pushed",
      "the app only polls",
      "no server push",
      "never receives anything",
    ].filter((phrase) => readme.toLowerCase().includes(phrase));
    expect(overclaims).toEqual([]);
  });
});
