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

// Authority binding for event cancellations (Round-4 review).
//
// An `EventCancellation` is a signed record, but its signature only
// proves that WHOEVER `createdBy` names signed it — not that they are
// the event's organizer. Only the organizer (the event's `createdBy`)
// may cancel their gathering. Without this check anyone could sign a
// cancellation over a victim's `eventId` with their OWN key and make
// the event vanish from every calendar, detail page, and RSVP'er's
// notifications.
//
// The server POST route enforces `createdBy === event.createdBy` when
// it already holds the event, but it accepts-and-reconciles when the
// event hasn't federated yet (and peer-pull historically skipped the
// check entirely). So every CLIENT surface that renders cancellation
// state must re-assert authority against the event it knows — mirroring
// the invite-revocation authority binding. A cancellation whose author
// isn't the event's organizer is inert: it never hides the event.

/** Does this cancellation genuinely come from the event's organizer? */
export function isAuthoritativeCancellation(
  cancellation: { eventId: string; createdBy: string } | null | undefined,
  event: { id: string; createdBy: string } | null | undefined,
): boolean {
  return (
    !!cancellation &&
    !!event &&
    cancellation.eventId === event.id &&
    cancellation.createdBy === event.createdBy
  );
}

/**
 * The set of event ids that are AUTHORITATIVELY cancelled — a
 * cancellation exists whose `createdBy` matches the event's organizer.
 * A cancellation for an event we don't hold, or one signed by a
 * non-organizer, is excluded (inert until/unless authority is proven).
 */
export function authoritativeCancelledEventIds(
  events: ReadonlyArray<{ id: string; createdBy: string }>,
  cancellations: ReadonlyArray<{ eventId: string; createdBy: string }>,
): Set<string> {
  const organizerById = new Map<string, string>();
  for (const e of events) organizerById.set(e.id, e.createdBy);
  const out = new Set<string>();
  for (const c of cancellations) {
    if (organizerById.get(c.eventId) === c.createdBy) out.add(c.eventId);
  }
  return out;
}
