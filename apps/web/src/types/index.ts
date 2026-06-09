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

/**
 * Local-only member block — see `docs/blocking.md` §4 (data model) +
 * §7 (federation). Block rows live in the web app's local Dexie store
 * and never federate, never enter the outbox, never appear in data
 * export, are cleared by soft-purge. The shared package deliberately
 * omits a `Block` type so the federation layer has no knowledge of
 * this shape; it lives here, in the app-layer types module, because
 * that's the only layer that ever needs it.
 *
 * The `OutboxRow.kind` union in `db/database.ts` rejects `"block"` at
 * the type level. `lib/outbox.ts` deliberately does NOT expose an
 * `enqueueBlock` helper. Both absences are load-bearing — see
 * `blocking.test.ts` for the negative tests that lock this in.
 */
export interface BlockRow {
  /** UUID. */
  id: string;
  /** Base64-encoded Ed25519 public key of the local member who created
   *  the block. */
  blockerKey: string;
  /** Base64-encoded Ed25519 public key of the blocked member. */
  blockedKey: string;
  /** Epoch milliseconds, UTC. */
  createdAt: number;
  /** Per-block opt-in: when `true`, the blocked party's proposals,
   *  votes, and dispute comments are also hidden from the blocker's
   *  view. Default `false`. The blocked party's governance voice still
   *  reaches every other member of the community regardless — only the
   *  blocker, and only by their own informed choice, may stop seeing
   *  it for themselves. See `docs/blocking.md` §6 (Dispute / Proposal
   *  comments + votes rows). */
  hideGovernance: boolean;
  /** Free-text memory aid for the blocker's own reference (≤ 500
   *  chars). Never surfaced to any other member, never federated,
   *  never exported. May be `null` if the blocker chose not to write
   *  one. */
  note: string | null;
}

/**
 * Local-only "previously blocked" history row — see `docs/blocking.md`
 * §5 (lifecycle) + §14.1 (retention). Indefinite retention; cleared
 * only by the explicit "Clear unblocked history" affordance in
 * Settings or by soft-purge. Same federation posture as `BlockRow`:
 * never leaves the device.
 */
export interface PreviouslyBlockedRow {
  /** UUID. */
  id: string;
  /** Base64-encoded Ed25519 public key of the local member. */
  blockerKey: string;
  /** Base64-encoded Ed25519 public key of the previously-blocked
   *  member. */
  blockedKey: string;
  /** First time the blocker blocked this member, epoch milliseconds
   *  UTC. Stable across re-blocks — the row is created on the first
   *  block and updated on subsequent unblocks. */
  firstBlockedAt: number;
  /** Most-recent unblock timestamp, epoch milliseconds UTC. Updated
   *  on every unblock of the same `blockedKey` by the same `blockerKey`. */
  lastUnblockedAt: number;
}
