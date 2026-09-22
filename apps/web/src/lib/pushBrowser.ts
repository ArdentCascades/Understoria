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
// The browser half of opt-in notifications (docs/notifications.md).
//
// This is THE file allowed to touch the Notification and Push APIs —
// the quiet-by-default guard (noNotifications.guard.test.ts) pins
// that allowance to this path and these capabilities, and everything
// else in the tree still fails the scan. The lifecycle module
// (lib/pushNotifications.ts) deliberately never imports these APIs so
// it stays testable without a browser push stack; the Settings
// switchboard composes the two.
//
// The permission prompt fires from exactly one place: the Settings
// flow, at the moment a member enables their first category, after
// the vendor-metadata disclosure — never at onboarding, never on app
// open, never re-asked after a denial (the doc's decision 2).

export interface BrowserPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** The current permission, or null where the API doesn't exist. */
export function currentPermission(): NotificationPermission | null {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }
  return Notification.permission;
}

/**
 * Ask the browser. Callers must have shown the disclosure first and
 * must treat a denial as final — the app never asks again on its own.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

/** VAPID public keys are base64url; PushManager wants raw bytes. */
function vapidKeyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const padded =
    base64url.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function toPlainSubscription(
  sub: PushSubscription,
): BrowserPushSubscription | null {
  const json = sub.toJSON();
  if (
    typeof json.endpoint !== "string" ||
    typeof json.keys?.p256dh !== "string" ||
    typeof json.keys?.auth !== "string"
  ) {
    return null;
  }
  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  };
}

/**
 * Create (or return the existing) push subscription against the
 * node's VAPID key. Uses getRegistration rather than `ready` so a
 * context without a service worker resolves null instead of hanging.
 */
export async function subscribeBrowserPush(
  vapidPublicKey: string,
): Promise<BrowserPushSubscription | null> {
  if (!pushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return null;
    const sub = await reg.pushManager.subscribe({
      // The deal with every browser: a push MUST show something.
      // The SW handler honors it at every tier (push-sw.js).
      userVisibleOnly: true,
      applicationServerKey: vapidKeyBytes(vapidPublicKey),
    });
    return toPlainSubscription(sub);
  } catch {
    return null;
  }
}

/** The live subscription, if this browser holds one. */
export async function currentBrowserSubscription(): Promise<BrowserPushSubscription | null> {
  if (!pushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    return sub ? toPlainSubscription(sub) : null;
  } catch {
    return null;
  }
}

/** Drop the browser subscription. Best-effort, never throws. */
export async function unsubscribeBrowserPush(): Promise<void> {
  if (!pushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    await sub?.unsubscribe();
  } catch {
    // Nothing to do — the node-side TTL retires the row regardless.
  }
}
