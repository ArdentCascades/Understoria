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
// Re-export shim. Domain types live in packages/shared so the Node
// server and the React PWA share one authoritative shape.
export * from "@understoria/shared/types";

/**
 * Local-only RSVP shape — see `docs/community-events.md` §4 (data
 * model) + §7 (federation). EventRsvpRow lives in the web app's local
 * Dexie store and never federates. The shared package deliberately
 * omits an `EventRSVP` type so the federation layer has no knowledge
 * of this shape; it lives here, in the app-layer types module,
 * because that's the only layer that ever needs it.
 *
 * The `OutboxRow.kind` union in `db/database.ts` rejects
 * `"event_rsvp"` at the type level. `lib/outbox.ts` deliberately does
 * NOT expose an `enqueueEventRsvp` helper. Both absences are
 * load-bearing — see `events.test.ts` for the negative tests that
 * lock this in.
 */
export interface EventRsvpRow {
  /** UUID. */
  id: string;
  /** References `Event.id`. */
  eventId: string;
  /** Base64-encoded Ed25519 public key of the RSVP'ing member. Always
   *  a local-member key — peer-node members can't RSVP on this node
   *  remotely (see design doc §7.3). */
  memberKey: string;
  status: "going" | "maybe" | "not_going";
  /** Epoch milliseconds, UTC. */
  respondedAt: number;
}
