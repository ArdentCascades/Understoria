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
/*
 * Push display handler (docs/notifications.md — quiet by default).
 * Rides into the generated service worker via workbox importScripts,
 * so it must stay self-contained plain JS: no bundler, no i18n
 * runtime, no app code. Everything it needs at display time lives in
 * the tiny device-only prefs database the Settings surface writes —
 * the lock-screen tier, the member-chosen title, and PRE-LOCALIZED
 * display strings snapshotted in the member's language at save time.
 *
 * The payload is CATEGORY DATA ONLY (shared PushPayload). Message
 * bodies never exist in any payload — there is no messages category —
 * and this handler never renders anything but the member's own
 * pre-chosen strings, so a compromised or buggy node cannot put words
 * on a lock screen the member didn't opt into seeing.
 */

/* The doc's five categories (v2). Kept in sync with the shared enum
 * by the notifications guard test — this file cannot import it. */
const PUSH_CATEGORIES = [
  "shift_reminder",
  "guardian_request",
  "awaiting_confirmation",
  "event_reminder",
  "test_ping",
];

const PUSH_PREFS_DB = "understoria-push";
const PUSH_PREFS_STORE = "prefs";
const PUSH_PREFS_KEY = "prefs";

/* The honest default title, and last-resort banner text if the prefs
 * database is unreadable at display time (something must show — a
 * push with no notification gets the subscription revoked by the
 * browser). English here is a dead-last fallback: the normal path
 * shows the member's own saved strings. */
const FALLBACK_TITLE = "Understoria";
const FALLBACK_BODY = "Something needs your attention";

function readPushPrefs() {
  return new Promise((resolve) => {
    let req;
    try {
      req = indexedDB.open(PUSH_PREFS_DB, 1);
    } catch {
      resolve(null);
      return;
    }
    req.onupgradeneeded = () => {
      try {
        req.result.createObjectStore(PUSH_PREFS_STORE);
      } catch {
        /* racing another open — the read below still works */
      }
    };
    req.onerror = () => resolve(null);
    req.onsuccess = () => {
      const db = req.result;
      try {
        const get = db
          .transaction(PUSH_PREFS_STORE, "readonly")
          .objectStore(PUSH_PREFS_STORE)
          .get(PUSH_PREFS_KEY);
        get.onsuccess = () => {
          db.close();
          resolve(get.result || null);
        };
        get.onerror = () => {
          db.close();
          resolve(null);
        };
      } catch {
        db.close();
        resolve(null);
      }
    };
  });
}

/* Replace `{token}` markers in a saved named-tier template with the
 * payload's detail values (plain text, never markup). Unknown tokens
 * stay visible rather than vanishing — a truncated string is worse
 * than an odd one. */
function interpolate(template, detail) {
  if (!detail) return template;
  return template.replace(/\{([a-zA-Z0-9_-]+)\}/g, (whole, key) =>
    typeof detail[key] === "string" ? detail[key] : whole,
  );
}

/* Is `now` inside the member's quiet window? Times are "HH:MM" on
 * THIS device's clock — quiet hours are a display choice, so the
 * comparison happens where the member sleeps, not on any server. A
 * window that crosses midnight (22:00–07:00) means "after start OR
 * before end". start === end would be a 24-hour window, which the
 * Settings surface never saves; treated as no window here so a
 * corrupt pref can't silence everything forever. */
function inQuietHours(quiet, now) {
  if (!quiet || typeof quiet.start !== "string" || typeof quiet.end !== "string")
    return false;
  const parse = (s) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(s);
    if (!m) return null;
    const mins = Number(m[1]) * 60 + Number(m[2]);
    return mins >= 0 && mins < 24 * 60 ? mins : null;
  };
  const start = parse(quiet.start);
  const end = parse(quiet.end);
  if (start === null || end === null || start === end) return false;
  const at = now.getHours() * 60 + now.getMinutes();
  return start < end ? at >= start && at < end : at >= start || at < end;
}

async function displayPush(event) {
  let payload = null;
  try {
    payload = event.data ? event.data.json() : null;
  } catch {
    /* not JSON — defensive path below shows a generic banner */
  }
  const category =
    payload && PUSH_CATEGORIES.indexOf(payload.category) !== -1
      ? payload.category
      : null;
  const prefs = await readPushPrefs();
  /* Per-category tier (v2) over the legacy single tier — prefs saved
   * before v2 keep behaving exactly as chosen. Quiet hours downgrade
   * whatever won to silent: the notification still exists (browsers
   * revoke subscriptions that push without showing), it just neither
   * lights the screen nor says anything. */
  let tier =
    (prefs && prefs.tiers && category && prefs.tiers[category]) ||
    (prefs && prefs.tier) ||
    "generic";
  if (prefs && inQuietHours(prefs.quiet, new Date())) tier = "silent";
  const title = prefs && prefs.title ? prefs.title : FALLBACK_TITLE;
  const strings = prefs && prefs.strings ? prefs.strings : null;
  const generic = strings && strings.generic ? strings.generic : FALLBACK_BODY;

  let body = generic;
  if (
    tier === "named" &&
    category &&
    strings &&
    strings.named &&
    typeof strings.named[category] === "string"
  ) {
    body = interpolate(
      strings.named[category],
      payload && payload.detail ? payload.detail : null,
    );
  }

  const options = {
    body: tier === "silent" ? "" : body,
    /* silent: no sound, no vibration, no lock-screen wake on
     * platforms that honor it — the member asked for a badge-level
     * whisper. */
    silent: tier === "silent",
    tag: category || "understoria",
    data: {
      path:
        payload && typeof payload.path === "string" && payload.path[0] === "/"
          ? payload.path
          : "/",
    },
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  };
  await self.registration.showNotification(title, options);
}

self.addEventListener("push", (event) => {
  event.waitUntil(displayPush(event));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path =
    event.notification.data && event.notification.data.path
      ? event.notification.data.path
      : "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            if ("navigate" in client) client.navigate(path);
            return client.focus();
          }
        }
        return self.clients.openWindow(path);
      }),
  );
});
