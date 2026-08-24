/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The no-notifications guard.
//
// `no-notifications` is the design principle the product's whole shape
// rests on, and the README now spends a section on it. Before this file,
// it was the one large claim in the project with no test behind it: the
// repository pins its own README's numbers in readme.guard.test.ts on the
// stated grounds that prose has no compiler — and then left the loudest
// prose unguarded.
//
// That gap mattered because the distance from here to push is short. The
// app is an installable PWA with a generated service worker; adding
// `web-push` and one `showNotification` call would ship green. A promise
// that depends on nobody forgetting is not a promise, it is a habit.
//
// So this asserts the claim mechanically: no notification, badge,
// vibration or push-subscription call site, and no push dependency.
//
// WHAT THIS DELIBERATELY DOES NOT FORBID: the nudge stream. The app holds
// a Server-Sent-Events connection that carries a content-free "something
// changed" frame and triggers the same sync a window-focus already runs
// (docs/sync-liveness.md). That is server push and it is fine — it raises
// nothing, addresses no one, and dies with a hidden tab. The claim is "no
// push NOTIFICATIONS", not "no push", and the README says so in those
// words.
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

/** Packages whose only purpose is delivering notifications. */
const FORBIDDEN_DEPS = [
  "web-push",
  "firebase",
  "@firebase/messaging",
  "onesignal",
  "react-onesignal",
  "node-pushnotifications",
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

describe("no-notifications: the principle, enforced", () => {
  it("has no notification, badge or vibration call site in any shipped tree", () => {
    const offenders: string[] = [];
    for (const tree of TREES) {
      for (const abs of sources(tree)) {
        const rel = abs.slice(ROOT.length + 1);
        // This file names the patterns as literals.
        if (rel.endsWith("lib/noNotifications.guard.test.ts")) continue;
        readFileSync(abs, "utf8")
          .split("\n")
          .forEach((line, i) => {
            for (const { pattern, what } of FORBIDDEN) {
              if (pattern.test(line)) offenders.push(`${rel}:${i + 1}  ${what}`);
            }
          });
      }
    }
    expect(offenders).toEqual([]);
  });

  it("depends on no push-delivery package", () => {
    const offenders: string[] = [];
    for (const m of manifests()) {
      const pkg = JSON.parse(readFileSync(m, "utf8")) as Record<string, unknown>;
      for (const field of ["dependencies", "devDependencies", "peerDependencies"]) {
        const deps = pkg[field];
        if (!deps || typeof deps !== "object") continue;
        for (const name of Object.keys(deps as object)) {
          if (FORBIDDEN_DEPS.some((f) => name === f || name.startsWith(`${f}/`))) {
            offenders.push(`${m.slice(ROOT.length + 1)} → ${name}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ships no hand-written service worker that could carry a push handler", () => {
    // vite-plugin-pwa runs in generateSW mode, so the emitted worker is
    // precache + runtime caching only. A hand-written sw source is the
    // route by which a `push` / `notificationclick` listener would arrive.
    const web = join(ROOT, "apps", "web");
    const suspects = ["src/sw.ts", "src/sw.js", "src/service-worker.ts", "public/sw.js"];
    expect(suspects.filter((f) => existsSync(join(web, f)))).toEqual([]);
  });

  it("keeps the desktop shell's notification permission denied", () => {
    // The Electron shell allowlists permissions; notifications must not
    // appear in it. This is the strongest artifact behind the claim and
    // the easiest to lose in a refactor.
    const policy = readFileSync(
      join(ROOT, "apps", "desktop", "src", "policy.ts"),
      "utf8",
    );
    const allow = policy.slice(policy.indexOf("ALLOWED_PERMISSIONS"));
    expect(allow.slice(0, allow.indexOf("]"))).not.toContain("notifications");
  });

  it("the README claims no push NOTIFICATIONS, not no push", () => {
    // The nudge stream is real server push. A README that denied push
    // outright would be false against docs/sync-liveness.md, which titles
    // its own section "Server push — the nudge stream". This assertion
    // exists so the softer, true wording cannot quietly harden.
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
