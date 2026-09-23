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
// Opt-in notifications, device side (docs/notifications.md — quiet
// by default). This module owns the subscription lifecycle and the
// device-local preferences; it is DARK until the Settings PR gives
// it a surface — nothing here runs unless a member (or a test)
// calls it.
//
// The preferences live in their OWN tiny IndexedDB database (not
// Dexie): the service worker must read them at display time without
// loading the app, and everything in them is deliberately
// device-only — the lock-screen tier, the member's chosen
// notification title, and the PRE-LOCALIZED display strings the
// Settings surface writes at save time (a service worker has no
// i18n runtime; snapshotting the strings at save keeps display
// correct in the member's language without shipping i18next into
// the SW). None of this ever reaches the node: payloads are
// category data, and the SW applies these preferences locally.
import {
  canonicalPushAuthMessage,
  SUBSCRIBABLE_CATEGORIES,
  sign,
  type NotificationCategory,
} from "@understoria/shared";
import { getSecretKey } from "@/db/secrets";
import { readSubmitConfig } from "@/lib/nodeSubmit";

export type LockScreenTier = "silent" | "generic" | "named";

export interface PushDisplayStrings {
  /** The generic tier's whole banner ("Something needs you"). */
  generic: string;
  /** Named-tier templates per category; `{detail-key}` tokens are
   *  replaced from the payload's detail map. */
  named: Record<NotificationCategory, string>;
}

/** A local-time quiet window, "HH:MM" on this device's clock. The
 *  service worker downgrades any banner inside it to the silent
 *  tier at display time — device-only, like every display choice
 *  (the node never learns when a member sleeps). */
export interface QuietHours {
  start: string;
  end: string;
}

export interface PushPrefs {
  /** Categories the member opted into. EMPTY BY DEFAULT — quiet by
   *  default is the contract, and the guard test pins it. */
  categories: NotificationCategory[];
  tier: LockScreenTier;
  /** Per-category lock-screen overrides (v2): a member can keep
   *  shift reminders named while guardian requests stay generic on
   *  the lock screen. Missing entries fall back to `tier`, so
   *  prefs saved before v2 keep behaving exactly as chosen. */
  tiers?: Partial<Record<NotificationCategory, LockScreenTier>>;
  /** Quiet hours (v2); null/absent = none. */
  quiet?: QuietHours | null;
  /** The member-chosen notification title; null = the honest
   *  default ("Understoria"). Device-only, never sent anywhere. */
  title: string | null;
  /** Stable per-device id for node-side one-row-per-device. */
  deviceId: string;
  /** The live push endpoint, for renew/delete without re-asking the
   *  push manager. */
  endpoint: string | null;
  /** Last successful node renew (ms) — throttles renew-on-open. */
  renewedAt: number;
  strings: PushDisplayStrings | null;
}

export const PUSH_PREFS_DB = "understoria-push";
const PREFS_STORE = "prefs";
const PREFS_KEY = "prefs";

/** Renew-on-open throttle: once a day keeps the node-side TTL (21
 *  days) comfortably fed without a network call per open. */
const RENEW_MIN_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function defaultPushPrefs(): PushPrefs {
  return {
    categories: [],
    tier: "generic",
    tiers: {},
    quiet: null,
    title: null,
    deviceId: crypto.randomUUID(),
    endpoint: null,
    renewedAt: 0,
    strings: null,
  };
}

function openPrefsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PUSH_PREFS_DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(PREFS_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getPushPrefs(): Promise<PushPrefs> {
  const db = await openPrefsDb();
  try {
    const stored = await new Promise<PushPrefs | undefined>(
      (resolve, reject) => {
        const tx = db.transaction(PREFS_STORE, "readonly");
        const req = tx.objectStore(PREFS_STORE).get(PREFS_KEY);
        req.onsuccess = () => resolve(req.result as PushPrefs | undefined);
        req.onerror = () => reject(req.error);
      },
    );
    return stored ?? defaultPushPrefs();
  } finally {
    db.close();
  }
}

export async function savePushPrefs(prefs: PushPrefs): Promise<void> {
  const db = await openPrefsDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PREFS_STORE, "readwrite");
      tx.objectStore(PREFS_STORE).put(prefs, PREFS_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

async function clearPushPrefs(): Promise<void> {
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(PUSH_PREFS_DB);
    // Best-effort either way — a blocked delete must not stall a
    // purge.
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}

interface NodeCallDeps {
  fetchImpl?: typeof fetch;
  now?: () => number;
}

async function nodeCall(
  path: string,
  body: unknown,
  deps: NodeCallDeps,
): Promise<{ ok: boolean; status: number }> {
  const config = await readSubmitConfig();
  if (!config.enabled || config.url.trim() === "") {
    return { ok: false, status: 0 };
  }
  const doFetch = deps.fetchImpl ?? fetch;
  try {
    const res = await doFetch(`${config.url}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      // keepalive lets a teardown's delete outlive the page (panic
      // reloads right after); the timeout bounds how long a dead
      // network can hold ANY caller. Both best-effort — the node-side
      // TTL is the real backstop.
      keepalive: true,
      ...(typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
        ? { signal: AbortSignal.timeout(10_000) }
        : {}),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

/**
 * The Settings surface owes the member the RIGHT explanation, so the
 * three ways this can fail stay distinguishable — collapsing them
 * once shipped a screen that told a connected member their device
 * "isn't connected to a community server" when the truth was that
 * their server predated push support.
 */
export type VapidKeyResult =
  /** The node answered with its key — notifications can be set up. */
  | { kind: "ok"; publicKey: string }
  /** This device has no community node configured (or node submit is
   *  off) — the only case where "not connected" is the true story. */
  | { kind: "unconfigured" }
  /** The node ANSWERED, but without a usable key (404 on the route,
   *  odd body): it is running software from before opt-in
   *  notifications existed. The operator fixes this, not the member. */
  | { kind: "unsupported" }
  /** The request never got an answer — offline, DNS, the node down.
   *  Says nothing about whether the node offers push; try again. */
  | { kind: "unreachable" };

/**
 * Ask the node for its VAPID public key — what the browser
 * subscription is created against.
 */
export async function fetchVapidKey(
  deps: NodeCallDeps = {},
): Promise<VapidKeyResult> {
  const config = await readSubmitConfig();
  if (!config.enabled || config.url.trim() === "") {
    return { kind: "unconfigured" };
  }
  const doFetch = deps.fetchImpl ?? fetch;
  try {
    const res = await doFetch(`${config.url}/push/vapid-key`);
    if (!res.ok) return { kind: "unsupported" };
    const { publicKey } = (await res.json()) as { publicKey?: unknown };
    return typeof publicKey === "string" && publicKey !== ""
      ? { kind: "ok", publicKey }
      : { kind: "unsupported" };
  } catch {
    return { kind: "unreachable" };
  }
}

/**
 * Register (or re-register) this device's subscription with the
 * node for the given categories. The caller (Settings, later) has
 * already obtained browser permission and a PushSubscription; this
 * function owns the signed node write and the prefs update. The
 * subscription's endpoint/keys come in as plain fields so this
 * module never touches the Push API directly — testable without a
 * browser push stack, and the SW-vs-window split stays clean.
 */
export async function registerPushSubscription(
  memberKey: string,
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
  categories: readonly NotificationCategory[],
  deps: NodeCallDeps = {},
): Promise<boolean> {
  // Subscribable only: `test_ping` is in the enum for the send gate
  // and the SW, but it is never a stored preference — the node
  // refuses a subscription claiming it, and so do we.
  const cats = [...new Set(categories)].filter((c) =>
    (SUBSCRIBABLE_CATEGORIES as readonly string[]).includes(c),
  );
  if (cats.length === 0) return false;
  const prefs = await getPushPrefs();
  const timestamp = (deps.now ?? Date.now)();
  const secretKey = await getSecretKey(memberKey);
  const res = await nodeCall(
    "/push/subscriptions",
    {
      memberKey,
      deviceId: prefs.deviceId,
      timestamp,
      subscription,
      categories: cats,
      signature: sign(
        canonicalPushAuthMessage(
          "push-subscribe",
          memberKey,
          prefs.deviceId,
          subscription.endpoint,
          cats,
          timestamp,
        ),
        secretKey,
      ),
    },
    deps,
  );
  if (!res.ok) return false;
  await savePushPrefs({
    ...prefs,
    categories: cats,
    endpoint: subscription.endpoint,
    renewedAt: timestamp,
  });
  return true;
}

/**
 * Feed the node-side TTL dead-man on app open — throttled to once a
 * day, silent on every failure (a 404 means the row expired; the
 * Settings surface re-subscribes on its next visit).
 */
export async function renewPushSubscriptionOnOpen(
  memberKey: string,
  deps: NodeCallDeps = {},
): Promise<void> {
  const prefs = await getPushPrefs();
  if (!prefs.endpoint || prefs.categories.length === 0) return;
  const now = (deps.now ?? Date.now)();
  if (now - prefs.renewedAt < RENEW_MIN_INTERVAL_MS) return;
  const secretKey = await getSecretKey(memberKey);
  const res = await nodeCall(
    "/push/subscriptions/renew",
    {
      memberKey,
      deviceId: prefs.deviceId,
      endpoint: prefs.endpoint,
      timestamp: now,
      signature: sign(
        canonicalPushAuthMessage(
          "push-renew",
          memberKey,
          prefs.deviceId,
          prefs.endpoint,
          [],
          now,
        ),
        secretKey,
      ),
    },
    deps,
  );
  if (res.ok) {
    await savePushPrefs({ ...prefs, renewedAt: now });
  }
}

/**
 * Ask the node to send THIS device one test ping (v2) — the member
 * checking their own plumbing end to end: node, push service,
 * service worker, and exactly the tier, title and quiet hours a
 * real ping would get. Signed like every push write; the node can
 * only deliver it to a subscription row the signer already owns.
 * `status` lets Settings tell an expired row (404 — re-subscribe)
 * from a node that predates v2 (also often 404 on the route) versus
 * a network miss (0).
 */
export async function requestTestPing(
  memberKey: string,
  deps: NodeCallDeps = {},
): Promise<{ ok: boolean; status: number }> {
  const prefs = await getPushPrefs();
  if (!prefs.endpoint) return { ok: false, status: 0 };
  const timestamp = (deps.now ?? Date.now)();
  const secretKey = await getSecretKey(memberKey);
  return nodeCall(
    "/push/test",
    {
      memberKey,
      deviceId: prefs.deviceId,
      endpoint: prefs.endpoint,
      timestamp,
      signature: sign(
        canonicalPushAuthMessage(
          "push-test",
          memberKey,
          prefs.deviceId,
          prefs.endpoint,
          [],
          timestamp,
        ),
        secretKey,
      ),
    },
    deps,
  );
}

/**
 * The LOCAL half of teardown, split out for panic (lib/panic.ts):
 * sign the node delete while the secret key is still readable, then
 * ALWAYS clear the device prefs. Returns the network half as a
 * closure the caller runs (or fires without awaiting — panic must
 * not let a dead network hold up a wipe; the node-side TTL covers a
 * send that never lands). Never throws, and neither does the
 * returned closure. The caller additionally unsubscribes the browser
 * PushSubscription where it holds one.
 */
export async function beginPushTeardown(
  memberKey: string | null,
  deps: NodeCallDeps = {},
): Promise<() => Promise<void>> {
  let sendDelete: () => Promise<void> = async () => {};
  try {
    const prefs = await getPushPrefs();
    if (memberKey && prefs.endpoint) {
      const endpoint = prefs.endpoint;
      const timestamp = (deps.now ?? Date.now)();
      const secretKey = await getSecretKey(memberKey).catch(() => null);
      if (secretKey) {
        const body = {
          memberKey,
          deviceId: prefs.deviceId,
          endpoint,
          timestamp,
          signature: sign(
            canonicalPushAuthMessage(
              "push-delete",
              memberKey,
              prefs.deviceId,
              endpoint,
              [],
              timestamp,
            ),
            secretKey,
          ),
        };
        sendDelete = async () => {
          await nodeCall("/push/subscriptions/delete", body, deps);
        };
      }
    }
  } catch {
    // Best-effort by contract — a locked device can't sign, and the
    // TTL dead-man retires the node row regardless.
  }
  await clearPushPrefs();
  return sendDelete;
}

/**
 * Tear this device's notifications down: tell the node (signed,
 * best-effort — the TTL covers a failed call), and ALWAYS clear the
 * local prefs. Never throws.
 */
export async function teardownPushSubscription(
  memberKey: string | null,
  deps: NodeCallDeps = {},
): Promise<void> {
  const sendDelete = await beginPushTeardown(memberKey, deps);
  await sendDelete();
}
