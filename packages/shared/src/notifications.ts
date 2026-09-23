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
// Opt-in notifications (docs/notifications.md — quiet by default).
//
// THE CATEGORY LIST IS THE CONTRACT. Each entry exists because it is
// node-initiated from signed records that no chosen individual can
// weaponize against a chosen target, and because each has a person
// or a clock on the other end. Growing this list is a reviewed act
// that must amend docs/notifications.md first; guard tests pin it.
//
// The v2 amendment (2026-09-23) added:
//  - event_reminder: an event the member RSVP'd "going" to starts
//    soon — the same clock shift reminders answer.
//  - test_ping: SELF-REQUESTED ONLY (a member-signed /push/test,
//    delivered straight to the requesting device). It is in the
//    enum so the send gate and the SW know it; it is NOT a
//    subscribable preference and the Settings switchboard never
//    lists it. One arriving unrequested is a bug with the severity
//    of an engagement ping.
// message_waiting (coalesced, named by mutual consent) is designed
// in the doc and lands with its own rung.

export const NOTIFICATION_CATEGORIES = [
  "shift_reminder",
  "guardian_request",
  "awaiting_confirmation",
  "event_reminder",
  "test_ping",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

/** Everything except the self-requested test ping. */
export type SubscribableCategory = Exclude<NotificationCategory, "test_ping">;

/** The categories a member can actually subscribe to in Settings —
 *  the node refuses a subscription claiming anything else. */
export const SUBSCRIBABLE_CATEGORIES = NOTIFICATION_CATEGORIES.filter(
  (c): c is SubscribableCategory => c !== "test_ping",
);

export function isNotificationCategory(
  v: unknown,
): v is NotificationCategory {
  return (
    typeof v === "string" &&
    (NOTIFICATION_CATEGORIES as readonly string[]).includes(v)
  );
}

/**
 * The push payload the node sends — CATEGORY DATA ONLY. The service
 * worker applies the member's lock-screen tier and their chosen
 * notification title at display time, so neither preference ever
 * reaches the node. `detail` carries the named-tier line's
 * interpolations (an event title, an exchange partner's name — never
 * a message body; no messages category exists) and the generic tier
 * ignores it entirely.
 */
export interface PushPayload {
  category: NotificationCategory;
  /** App path to open on tap (re-checked against live state there). */
  path: string;
  /** Named-tier interpolation values. NEVER free text from a message. */
  detail?: Record<string, string>;
}
