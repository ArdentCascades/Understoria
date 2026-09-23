/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The notifications nevers, pinned (docs/notifications.md). These are
// promises the doc makes to members; a PR that breaks one should have
// to look this file in the eye and edit the doc in the same change.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  NOTIFICATION_CATEGORIES,
  SUBSCRIBABLE_CATEGORIES,
} from "@understoria/shared";
import { defaultPushPrefs, getPushPrefs, PUSH_PREFS_DB } from "./pushNotifications";

const WEB_ROOT = join(__dirname, "..", "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js)$/.test(name) && !/\.test\./.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe("notifications guard — quiet by default", () => {
  it("ships with every category OFF: the defaults, and a fresh device's stored prefs", async () => {
    const defaults = defaultPushPrefs();
    expect(defaults.categories).toEqual([]);
    expect(defaults.tier).toBe("generic");
    expect(defaults.tiers).toEqual({});
    expect(defaults.quiet).toBeNull();
    expect(defaults.title).toBeNull();

    // A device that has never touched Settings reads the same
    // silence out of its (empty) prefs database.
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(PUSH_PREFS_DB);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
    const fresh = await getPushPrefs();
    expect(fresh.categories).toEqual([]);
    expect(fresh.endpoint).toBeNull();
  });

  it("never asks for notification permission outside the Settings surface", () => {
    // Browser permission may be requested ONLY at the moment a member
    // flips their first category on, from Settings — never during
    // onboarding, never on app open (docs/notifications.md decision
    // 2). pushBrowser.ts is that flow's one API surface; nothing
    // else ever joins this list.
    const allowed = new Set<string>(["src/lib/pushBrowser.ts"]);
    const offenders = walk(join(WEB_ROOT, "src"))
      .filter((f) => {
        const src = readFileSync(f, "utf8");
        return (
          src.includes("Notification.requestPermission") ||
          src.includes("pushManager.subscribe(")
        );
      })
      .map((f) => f.slice(WEB_ROOT.length + 1))
      .filter((f) => !allowed.has(f));
    expect(offenders).toEqual([]);
  });

  it("pins the category list to the doc's six (v2) — and the SW handler agrees", () => {
    expect([...NOTIFICATION_CATEGORIES]).toEqual([
      "shift_reminder",
      "guardian_request",
      "awaiting_confirmation",
      "event_reminder",
      "message_waiting",
      "test_ping",
    ]);
    // test_ping is in the enum (send gate + SW) but is NEVER a
    // subscribable preference — the Settings switchboard never lists
    // it and the node refuses a subscription claiming it.
    expect([...SUBSCRIBABLE_CATEGORIES]).toEqual([
      "shift_reminder",
      "guardian_request",
      "awaiting_confirmation",
      "event_reminder",
      "message_waiting",
    ]);
    // public/push-sw.js is plain SW-side JS and cannot import the
    // shared enum; this keeps its hand-copied list honest.
    const sw = readFileSync(join(WEB_ROOT, "public", "push-sw.js"), "utf8");
    for (const category of NOTIFICATION_CATEGORIES) {
      expect(sw).toContain(`"${category}"`);
    }
    // And no fourth category hides in the handler.
    const listed = sw.match(/PUSH_CATEGORIES = \[([^\]]*)\]/);
    expect(listed).not.toBeNull();
    const swCategories = [...listed![1].matchAll(/"([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(swCategories).toEqual([...NOTIFICATION_CATEGORIES]);
  });

  it("keeps the lock-screen prefs device-only: registration sends category data, never tier or title", () => {
    // The subscribe payload is built in registerPushSubscription;
    // tier/title/strings must never ride along (docs/notifications.md
    // decision 5 — the node cannot leak what it never learns).
    const src = readFileSync(
      join(WEB_ROOT, "src", "lib", "pushNotifications.ts"),
      "utf8",
    );
    const subscribeCall = src.slice(
      src.indexOf('"/push/subscriptions"'),
      src.indexOf("renewPushSubscriptionOnOpen"),
    );
    expect(subscribeCall).not.toContain("tier");
    expect(subscribeCall).not.toContain("title");
    expect(subscribeCall).not.toContain("strings");
    // v2: the senderKey→name map is device-only too — the node
    // must never learn whose names a member's lock screen resolves.
    expect(subscribeCall).not.toContain("names");
  });

  it("keeps the lock-screen name map sourced from the app's own rows, never payload content", () => {
    // The SW may READ prefs.names to resolve a message ping's
    // senderKey, but nothing in the SW may ever WRITE prefs — the
    // map is written only by the app from its member rows
    // (lib/pushNameConsent.ts), which is what makes a blocked or
    // unconsented sender unable to name themselves onto a lock
    // screen.
    const sw = readFileSync(join(WEB_ROOT, "public", "push-sw.js"), "utf8");
    expect(sw).not.toMatch(/objectStore\([^)]*\)\s*\.\s*(put|add|delete)/);
    // And the named path for messages interpolates from the map hit
    // only — the raw senderKey must never be a display fallback.
    expect(sw).toContain("prefs.names");
    expect(sw).not.toMatch(/body\s*=\s*[^;]*senderKey\b[^;]*;/);
  });
});
