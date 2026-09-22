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
// THE CATEGORY LIST IS THE CONTRACT. These three exist because they
// are node-initiated from signed records that no chosen individual
// can weaponize against a chosen target, and because each has a
// person or a clock on the other end. There is deliberately NO
// messages category (blocks never leave the device — see the doc's
// harassment analysis), and never an engagement category of any
// kind. Growing this list is a reviewed act that must amend
// docs/notifications.md first; a guard test pins it.

export const NOTIFICATION_CATEGORIES = [
  "shift_reminder",
  "guardian_request",
  "awaiting_confirmation",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

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
