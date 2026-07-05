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
import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Event,
  EventCancellation,
  Exchange,
  FlagReason,
  Post,
  InviteRevocation,
  RedemptionReceipt,
  SignedVouch,
  TaskComment,
} from "@understoria/shared/types";

/**
 * SQLite layer. Synchronous (better-sqlite3) by design — every endpoint
 * is short-lived and the workload is small (<200 members per pilot).
 *
 * Schema is versioned via a single `meta` table; migrations are applied
 * in order. Never modify a past version — append a new one.
 *
 * Storage policy: rows are exactly the signed Exchange shape from
 * @understoria/shared. We persist the signatures so a peer node can
 * verify any row independently. Optional flag fields (set by the web's
 * anti-gaming safeguards) are preserved as-is — the server does not
 * gate on them.
 */

export interface ExchangeStore {
  insert(exchange: Exchange): void;
  /** Point lookup by exchange id, or undefined when absent. */
  get(id: string): Exchange | undefined;
  list(opts?: { since?: number; limit?: number }): Exchange[];
  count(): number;
  has(id: string): boolean;
}

/**
 * Storage for signed vouches. Parallels ExchangeStore exactly — the
 * pull worker treats both as `kind: "exchange" | "vouch"` slots over
 * a common store interface, with the only kind-specific bit being
 * the cursor field (`completedAt` for exchanges, `createdAt` for
 * vouches).
 */
export interface VouchStore {
  insert(vouch: SignedVouch): void;
  list(opts?: { since?: number; limit?: number }): SignedVouch[];
  count(): number;
  has(id: string): boolean;
}

/**
 * Storage for signed posts. The wire shape is the immutable subset
 * of Post (lifecycle fields like status/claimedBy/confirmedBy stay
 * local to each PWA — they don't federate). Same shape pattern as
 * VouchStore. Cursor field is `createdAt`.
 */
export type PostRecord = Pick<
  Post,
  | "id"
  | "type"
  | "category"
  | "title"
  | "description"
  | "estimatedHours"
  | "urgency"
  | "postedBy"
  | "createdAt"
  | "expiresAt"
  | "locationZone"
  | "nodeId"
  | "signature"
>;

export interface PostStore {
  insert(post: PostRecord): void;
  list(opts?: { since?: number; limit?: number }): PostRecord[];
  count(): number;
  has(id: string): boolean;
}

/**
 * Storage for signed task comments. Same insert/list/has shape as the
 * other federated record stores, plus an `upsertTombstone` operation:
 * once a peer learns the author soft-deleted a comment, we update only
 * the `deleted_at` column. Tombstone-wins is the merge rule — a row
 * that arrives with `deletedAt=null` after we've stored it tombstoned
 * is treated as a duplicate and ignored. This keeps soft delete
 * monotonic across peers without requiring CRDT machinery.
 */
export interface TaskCommentStore {
  insert(comment: TaskComment): void;
  /** Set `deleted_at` for an existing row. Returns true if a row was
   *  updated (i.e. it existed and wasn't already tombstoned). */
  upsertTombstone(id: string, deletedAt: number): boolean;
  list(opts?: { since?: number; limit?: number }): TaskComment[];
  count(): number;
  has(id: string): boolean;
  /** Returns the stored row's deleted_at, or undefined if not present. */
  deletedAt(id: string): number | null | undefined;
}

// NOTE: there is deliberately no InviteStore. The unwired
// `POST /invites` / `GET /invites` surface (and `pullInvitesFromPeer`)
// was REMOVED in the invite-redemption Phase 1 PR: `GET /invites`
// returned full `SignedInvite` rows — token and signature included —
// to any unauthenticated caller, i.e. every field needed to
// reconstruct a live, redeemable invite link. Open invites never
// cross any wire; only consummated redemptions do (RedemptionStore
// below). See `docs/invite-redemption.md` §8 / §10.1.

/**
 * Storage for redemption receipts — `docs/invite-redemption.md` §8.
 * Keyed by the invite token (single-use: the first receipt for a
 * token wins; the route arbitrates via `getByToken`). Each row keeps
 * the server-assigned `receivedAt`, which is the GET cursor — a
 * deliberate deviation from the sibling stores' client-timestamp
 * cursors (§7): an inviter offline for a week must still converge,
 * and only arrival time is monotonic at the only place ordering
 * exists. Receipts do NOT peer-replicate (no `pullRedemptions...`
 * leg in `peerPull.ts`) — the roster stays off the inter-node wire.
 */
export interface StoredRedemption {
  receipt: RedemptionReceipt;
  /** Server clock at ingestion. The §7 cursor. */
  receivedAt: number;
}

export interface RedemptionStore {
  insert(receipt: RedemptionReceipt, receivedAt: number): void;
  /** Rows with `received_at > since`, ascending, capped like the
   *  sibling stores (default 200, ceiling 1000). */
  list(opts?: { since?: number; limit?: number }): StoredRedemption[];
  count(): number;
  has(token: string): boolean;
  /** Existing receipt for a token — first-writer-wins arbitration. */
  getByToken(token: string): StoredRedemption | null;
}

export interface StoredInviteRevocation {
  revocation: InviteRevocation;
  /** Server clock at ingestion — the GET cursor (same §7 reasoning as
   *  the redemptions store). */
  receivedAt: number;
}

export interface InviteRevocationStore {
  insert(revocation: InviteRevocation, receivedAt: number): void;
  /** Rows with `received_at >= since`, ascending (+ token tiebreak),
   *  capped like the sibling stores. */
  list(opts?: { since?: number; limit?: number }): StoredInviteRevocation[];
  count(): number;
  has(token: string): boolean;
  getByToken(token: string): StoredInviteRevocation | null;
}

/**
 * Storage for signed co-organizer invitations / responses / revocations.
 * Three sibling stores, one per record type. Same `has(id) / insert /
 * list({since,limit})` shape as the other federated record stores; the
 * cursor field is `createdAt` for invitations, `decidedAt` for
 * responses, `revokedAt` for revocations. See
 * `docs/co-organizer-invitations.md` §4 / §8.
 */
export interface CoOrganizerInvitationStore {
  insert(record: CoOrganizerInvitation): void;
  list(opts?: { since?: number; limit?: number }): CoOrganizerInvitation[];
  count(): number;
  has(id: string): boolean;
}

export interface CoOrganizerInvitationResponseStore {
  insert(record: CoOrganizerInvitationResponse): void;
  list(opts?: {
    since?: number;
    limit?: number;
  }): CoOrganizerInvitationResponse[];
  count(): number;
  has(id: string): boolean;
}

export interface CoOrganizerInvitationRevocationStore {
  insert(record: CoOrganizerInvitationRevocation): void;
  list(opts?: {
    since?: number;
    limit?: number;
  }): CoOrganizerInvitationRevocation[];
  count(): number;
  has(id: string): boolean;
}

/**
 * Storage for signed community events. Mirrors the
 * CoOrganizerInvitationStore shape. Cursor field is `createdAt`. The
 * full canonical wire row is preserved verbatim in the `payload`
 * column so the pull worker (and any future audit) can re-verify the
 * signature against the bytes we actually stored. See
 * `docs/community-events.md` §4 / §7.
 */
export interface EventStore {
  insert(record: Event): void;
  list(opts?: { since?: number; limit?: number }): Event[];
  count(): number;
  has(id: string): boolean;
  get(id: string): Event | null;
}

/**
 * Storage for signed event cancellations. Cursor field is
 * `cancelledAt`. `event_cancellations.eventId` carries a `UNIQUE`
 * constraint per design doc §11 (first-write-wins on eventId — once a
 * cancellation lands for an event, subsequent ones are dropped at the
 * store layer). See `docs/community-events.md` §4.3 / §11.
 */
export interface EventCancellationStore {
  insert(record: EventCancellation): void;
  list(opts?: { since?: number; limit?: number }): EventCancellation[];
  count(): number;
  has(id: string): boolean;
  /** Returns the existing cancellation row for an event, if any.
   *  Used by the POST route to honor first-write-wins idempotency on
   *  `eventId`. */
  getByEventId(eventId: string): EventCancellation | null;
}

export interface ClaimRecord {
  postId: string;
  claimerKey: string;
  claimedAt: number;
  nodeId: string;
}

export interface ClaimStore {
  insert(claim: ClaimRecord): void;
  list(opts?: { since?: number; limit?: number }): ClaimRecord[];
  has(postId: string): boolean;
}

/**
 * Per-peer pull state. Persisted so a server restart resumes pulling
 * from where it left off rather than re-fetching every record (which
 * would still be correct via `store.has(id)` dedup, but wasteful at
 * scale).
 */
/**
 * Per-peer pull cursor. Tracks the high-water mark for *each* record
 * kind we pull from a peer, so on restart the worker resumes from
 * where it left off rather than re-fetching the whole ledger.
 *
 * Cursor semantics:
 * - `lastCompletedAt` — used as `since=` on the next `/exchanges` pull
 * - `lastVouchCreatedAt` — used as `since=` on the next `/vouches` pull
 *
 * Both default to NULL ("never pulled this kind"), which the worker
 * interprets as "request everything" on first run.
 */
export interface PeerPullStateRow {
  peerUrl: string;
  lastPulledAt: number | null;
  lastSuccessAt: number | null;
  lastCompletedAt: number | null;
  lastVouchCreatedAt: number | null;
  lastPostCreatedAt: number | null;
  lastTaskCommentCreatedAt: number | null;
  lastCoOrgInvitationCreatedAt: number | null;
  lastCoOrgInvitationResponseDecidedAt: number | null;
  lastCoOrgInvitationRevocationRevokedAt: number | null;
  lastEventCreatedAt: number | null;
  lastEventCancellationCreatedAt: number | null;
  lastError: string | null;
  lastPulledCount: number;
}

// NOTE: "invite" is deliberately NOT a member of this union (removed
// alongside `pullInvitesFromPeer` — see the InviteStore removal note
// above), and "redemption" is deliberately NOT a member either:
// receipts do not peer-replicate in Phase 1
// (`docs/invite-redemption.md` §8) — cross-node membership is out of
// scope and the roster stays off the inter-node wire.
export type PullRecordKind =
  | "exchange"
  | "vouch"
  | "post"
  | "task_comment"
  | "coorg_invitation"
  | "coorg_invitation_response"
  | "coorg_invitation_revocation"
  | "event"
  | "event_cancellation";

export interface PeerPullStore {
  get(peerUrl: string): PeerPullStateRow | null;
  list(): PeerPullStateRow[];
  recordSuccess(opts: {
    peerUrl: string;
    kind: PullRecordKind;
    at: number;
    latestSeenAt: number | null;
    pulledCount: number;
  }): void;
  recordFailure(opts: { peerUrl: string; at: number; error: string }): void;
}

export function openDatabase(path: string): DatabaseType {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

function migrate(db: DatabaseType): void {
  // meta must exist before the version read; IF NOT EXISTS makes this
  // statement idempotent, so it is safe outside the transaction.
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // ATOMIC: run every pending block — each block's DDL and its
  // schema_version bump — inside ONE transaction. SQLite DDL
  // auto-commits per statement, so without this a crash between a
  // block's `db.exec(...)` and its version-bump `run()` left the
  // schema applied but the version stale; the next boot re-ran the
  // block and its bare `CREATE TABLE` / `CREATE INDEX` / `ALTER TABLE
  // ADD COLUMN` threw "already exists", bricking startup. With the
  // transaction, a crash rolls everything back to the last recorded
  // version and the rerun starts clean. (SQLite DDL is transactional,
  // and the blocks contain no BEGIN/COMMIT of their own.)
  db.transaction(() => applyMigrations(db))();
}

function applyMigrations(db: DatabaseType): void {
  const row = db
    .prepare("SELECT value FROM meta WHERE key = 'schema_version'")
    .get() as { value: string } | undefined;
  const current = row ? Number.parseInt(row.value, 10) : 0;

  if (current < 1) {
    db.exec(`
      CREATE TABLE exchanges (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        helper_key TEXT NOT NULL,
        helped_key TEXT NOT NULL,
        hours_exchanged REAL NOT NULL,
        helper_signature TEXT NOT NULL,
        helped_signature TEXT NOT NULL,
        completed_at INTEGER NOT NULL,
        category TEXT NOT NULL,
        node_id TEXT NOT NULL,
        flagged_for_review INTEGER NOT NULL DEFAULT 0,
        flag_reason TEXT
      );
      CREATE INDEX exchanges_completed_at_idx
        ON exchanges (completed_at DESC);
      CREATE INDEX exchanges_helper_idx ON exchanges (helper_key);
      CREATE INDEX exchanges_helped_idx ON exchanges (helped_key);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '1')",
    ).run();
  }

  // Schema v2 — Agent 3 task 2: federation pull state. One row per
  // configured peer. The worker reads `last_completed_at` to decide
  // the `since=` parameter for its next pull; updates the other fields
  // for observability via GET /peers.
  if (current < 2) {
    db.exec(`
      CREATE TABLE peer_pull_state (
        peer_url TEXT PRIMARY KEY,
        last_pulled_at INTEGER,
        last_success_at INTEGER,
        last_completed_at INTEGER,
        last_error TEXT,
        last_pulled_count INTEGER NOT NULL DEFAULT 0
      );
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '2')",
    ).run();
  }

  // Schema v3 — vouches federation. New `vouches` table mirrors the
  // exchanges table's shape and indexes. The `peer_pull_state` table
  // grows a `last_vouch_created_at` column so the per-kind cursors
  // share a single row per peer (denormalized but simple — adding a
  // third or fourth record kind later is just another column).
  if (current < 3) {
    db.exec(`
      CREATE TABLE vouches (
        id TEXT PRIMARY KEY,
        voucher_key TEXT NOT NULL,
        vouchee_key TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        kind TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX vouches_created_at_idx ON vouches (created_at DESC);
      CREATE INDEX vouches_voucher_idx ON vouches (voucher_key);
      CREATE INDEX vouches_vouchee_idx ON vouches (vouchee_key);

      ALTER TABLE peer_pull_state
        ADD COLUMN last_vouch_created_at INTEGER;
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '3')",
    ).run();
  }

  // Schema v4 — posts federation. New `posts` table stores the
  // immutable signed subset of a Post (lifecycle fields stay local
  // to each PWA). `peer_pull_state` gets a fourth per-kind cursor.
  if (current < 4) {
    db.exec(`
      CREATE TABLE posts (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        estimated_hours REAL NOT NULL,
        urgency TEXT NOT NULL,
        posted_by TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER,
        location_zone TEXT NOT NULL,
        node_id TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX posts_created_at_idx ON posts (created_at DESC);
      CREATE INDEX posts_posted_by_idx ON posts (posted_by);
      CREATE INDEX posts_node_id_idx ON posts (node_id);

      ALTER TABLE peer_pull_state
        ADD COLUMN last_post_created_at INTEGER;
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '4')",
    ).run();
  }

  // Schema v5 — invites federation. Stores signed invites so peer
  // nodes can discover cross-node invite availability.
  if (current < 5) {
    db.exec(`
      CREATE TABLE invites (
        token TEXT PRIMARY KEY,
        inviter_key TEXT NOT NULL,
        inviter_name TEXT NOT NULL,
        node_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX invites_created_at_idx ON invites (created_at DESC);
      CREATE INDEX invites_inviter_idx ON invites (inviter_key);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '5')",
    ).run();
  }

  // Schema v6 — invite pull cursor. Adds per-kind cursor column for
  // invite pull state, same pattern as vouches/posts.
  if (current < 6) {
    db.exec(`
      ALTER TABLE peer_pull_state
        ADD COLUMN last_invite_created_at INTEGER;
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '6')",
    ).run();
  }

  // Schema v7 — claim notifications for cross-node posts.
  if (current < 7) {
    db.exec(`
      CREATE TABLE claims (
        post_id TEXT PRIMARY KEY,
        claimer_key TEXT NOT NULL,
        claimed_at INTEGER NOT NULL,
        node_id TEXT NOT NULL
      );
      CREATE INDEX claims_claimed_at_idx ON claims (claimed_at DESC);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '7')",
    ).run();
  }

  // Schema v8 — task-comments federation. Stores signed comments
  // (immutable subset + mutable `deleted_at` tombstone) so peers can
  // converge on soft-delete state. `peer_pull_state` gets a fifth
  // per-kind cursor.
  if (current < 8) {
    db.exec(`
      CREATE TABLE task_comments (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        author_key TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        deleted_at INTEGER,
        node_id TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX task_comments_created_at_idx
        ON task_comments (created_at DESC);
      CREATE INDEX task_comments_project_task_idx
        ON task_comments (project_id, task_id, created_at);
      CREATE INDEX task_comments_author_idx
        ON task_comments (author_key);

      ALTER TABLE peer_pull_state
        ADD COLUMN last_task_comment_created_at INTEGER;
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '8')",
    ).run();
  }

  // Schema v9 — co-organizer invitation federation. Three sibling
  // tables (invitation / response / revocation), each storing the
  // signed wire shape. `peer_pull_state` grows three per-kind cursor
  // columns (createdAt for invitations, decidedAt for responses,
  // revokedAt for revocations). See
  // `docs/co-organizer-invitations.md` §4 / §8.
  if (current < 9) {
    db.exec(`
      CREATE TABLE coorg_invitations (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        inviter_key TEXT NOT NULL,
        invitee_key TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        node_id TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX coorg_invitations_created_at_idx
        ON coorg_invitations (created_at DESC);
      CREATE INDEX coorg_invitations_project_idx
        ON coorg_invitations (project_id);
      CREATE INDEX coorg_invitations_invitee_idx
        ON coorg_invitations (invitee_key);

      CREATE TABLE coorg_invitation_responses (
        id TEXT PRIMARY KEY,
        invitation_id TEXT NOT NULL,
        invitee_key TEXT NOT NULL,
        decision TEXT NOT NULL,
        decided_at INTEGER NOT NULL,
        node_id TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX coorg_invitation_responses_decided_at_idx
        ON coorg_invitation_responses (decided_at DESC);
      CREATE INDEX coorg_invitation_responses_invitation_idx
        ON coorg_invitation_responses (invitation_id);

      CREATE TABLE coorg_invitation_revocations (
        id TEXT PRIMARY KEY,
        invitation_id TEXT NOT NULL,
        inviter_key TEXT NOT NULL,
        revoked_at INTEGER NOT NULL,
        node_id TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX coorg_invitation_revocations_revoked_at_idx
        ON coorg_invitation_revocations (revoked_at DESC);
      CREATE INDEX coorg_invitation_revocations_invitation_idx
        ON coorg_invitation_revocations (invitation_id);

      ALTER TABLE peer_pull_state
        ADD COLUMN last_coorg_invitation_created_at INTEGER;
      ALTER TABLE peer_pull_state
        ADD COLUMN last_coorg_invitation_response_decided_at INTEGER;
      ALTER TABLE peer_pull_state
        ADD COLUMN last_coorg_invitation_revocation_revoked_at INTEGER;
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '9')",
    ).run();
  }

  // Schema v10 — community events federation. Two sibling tables
  // (events / event_cancellations), each storing the signed wire shape
  // plus a `payload` column holding the canonical-JSON bytes the
  // signature was computed over. The cancellation table carries
  // `UNIQUE(event_id)` because §11 of the design doc commits to
  // first-write-wins on `eventId` — an organizer who needs to
  // "uncancel" must create a new event, not amend the cancellation.
  // `peer_pull_state` grows two per-kind cursor columns
  // (`createdAt` for events, `cancelledAt` for cancellations).
  //
  // RSVPs are local-only per docs/community-events.md §4 — there is
  // no server-side RSVP table, no ingestion route, no pull worker.
  // This is enforced at the type level in apps/web and at the route
  // level in apps/server (POST /event-rsvps returns 404; see
  // events.test.ts for the lock).
  if (current < 10) {
    db.exec(`
      CREATE TABLE events (
        id TEXT PRIMARY KEY,
        node_id TEXT NOT NULL,
        created_by TEXT NOT NULL,
        starts_at INTEGER NOT NULL,
        ends_at INTEGER,
        created_at INTEGER NOT NULL,
        payload TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX events_created_at_idx ON events (created_at DESC);
      CREATE INDEX events_starts_at_idx ON events (starts_at);
      CREATE INDEX events_node_id_idx ON events (node_id);
      CREATE INDEX events_created_by_idx ON events (created_by);

      CREATE TABLE event_cancellations (
        id TEXT PRIMARY KEY,
        node_id TEXT NOT NULL,
        event_id TEXT NOT NULL UNIQUE,
        created_by TEXT NOT NULL,
        cancelled_at INTEGER NOT NULL,
        payload TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX event_cancellations_cancelled_at_idx
        ON event_cancellations (cancelled_at DESC);
      CREATE INDEX event_cancellations_event_id_idx
        ON event_cancellations (event_id);
      CREATE INDEX event_cancellations_node_id_idx
        ON event_cancellations (node_id);
      CREATE INDEX event_cancellations_created_by_idx
        ON event_cancellations (created_by);

      ALTER TABLE peer_pull_state
        ADD COLUMN last_event_created_at INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE peer_pull_state
        ADD COLUMN last_event_cancellation_created_at INTEGER
          NOT NULL DEFAULT 0;
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '10')",
    ).run();
  }

  // Schema v11 — invite-redemption Phase 1 (`docs/invite-redemption.md`
  // §7–§8). Two coupled changes shipped in one migration because the
  // design note ships them in one PR (§8 "Removal shipped in the same
  // PR"):
  //
  // 1. New `redemptions` table — one row per admitted member: the
  //    embedded invite's fields flattened (inviter_name included so
  //    the embedded invite signature can be re-verified from storage),
  //    the redeeming member's key + chosen display name + signature,
  //    and the server-assigned `received_at`, which is the GET cursor
  //    (§7's named deviation from the sibling routes' client-timestamp
  //    cursors: convergence for an inviter offline a week requires a
  //    server-monotonic cursor; arrival time is something the server
  //    inherently observes, so storing it adds no new observation).
  //    `token` is the PRIMARY KEY — the schema-level single-use /
  //    first-writer-wins guard. Retention is node-lifetime (§15
  //    ruling 3): receipts are trust edges and bounded retention would
  //    break trust convergence for every future fresh device.
  //
  // 2. Removal of the never-wired invites surface: `GET /invites`
  //    served full `SignedInvite` rows (token + signature) to any
  //    caller — every field needed to reconstruct a live redeemable
  //    invite link (§10.1). The store was always empty (no web-side
  //    caller ever existed), so dropping the table loses nothing;
  //    wire surface that serves live credentials gets removed, not
  //    mothballed. The per-peer invite cursor column goes with it.
  if (current < 11) {
    db.exec(`
      CREATE TABLE redemptions (
        token TEXT PRIMARY KEY,
        inviter_key TEXT NOT NULL,
        inviter_name TEXT NOT NULL,
        invite_node_id TEXT NOT NULL,
        invite_created_at INTEGER NOT NULL,
        invite_expires_at INTEGER NOT NULL,
        invite_signature TEXT NOT NULL,
        redeemed_by TEXT NOT NULL,
        display_name TEXT NOT NULL,
        redeemed_at INTEGER NOT NULL,
        signature TEXT NOT NULL,
        received_at INTEGER NOT NULL
      );
      CREATE INDEX redemptions_received_at_idx
        ON redemptions (received_at);
      CREATE INDEX redemptions_inviter_idx
        ON redemptions (inviter_key);
      CREATE INDEX redemptions_redeemed_by_idx
        ON redemptions (redeemed_by);

      DROP TABLE IF EXISTS invites;
      ALTER TABLE peer_pull_state
        DROP COLUMN last_invite_created_at;
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '11')",
    ).run();
  }

  // Schema v12 — persist the §4 auto-confirm provenance markers.
  // The wire layer (parseExchange) and the /auto-confirm route both
  // carry autoConfirmed / autoConfirmedBy / autoConfirmedAt, but the
  // store had no columns for them, so insert() silently dropped the
  // markers. Every system-signed exchange was then served by
  // GET /exchanges stripped of its provenance — pulling peers took
  // the member-signed verify path, checked the SYSTEM signature
  // against the member's helpedKey, and rejected the row. Auto-
  // confirmed exchanges therefore never federated at all, and the
  // §4 "distinct label per provenance" contract was unverifiable
  // downstream.
  if (current < 12) {
    db.exec(`
      ALTER TABLE exchanges
        ADD COLUMN auto_confirmed INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE exchanges ADD COLUMN auto_confirmed_by TEXT;
      ALTER TABLE exchanges ADD COLUMN auto_confirmed_at INTEGER;
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '12')",
    ).run();
  }

  // Schema v13 — invite-revocation propagation (docs/invite-revocation.md).
  // One row per revoked token, signed by the inviter. Mirrors the
  // redemptions store: `token` is the PRIMARY KEY (one revocation per
  // token, first-writer-wins), and the GET cursor is the
  // server-assigned `received_at`, not the client-claimed `revoked_at`
  // (same §7 skew-safety reasoning). Like redemptions, revocations are
  // PWA↔node only — no peer-replication leg, so no peer_pull_state
  // column. The authority binding (matching a redemption's embedded
  // invite) is enforced at the client merge, not here.
  if (current < 13) {
    db.exec(`
      CREATE TABLE invite_revocations (
        token TEXT PRIMARY KEY,
        inviter_key TEXT NOT NULL,
        revoked_at INTEGER NOT NULL,
        node_id TEXT NOT NULL,
        signature TEXT NOT NULL,
        received_at INTEGER NOT NULL
      );
      CREATE INDEX invite_revocations_received_at_idx
        ON invite_revocations (received_at);
      CREATE INDEX invite_revocations_inviter_idx
        ON invite_revocations (inviter_key);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '13')",
    ).run();
  }
}

export function createExchangeStore(db: DatabaseType): ExchangeStore {
  const insertStmt = db.prepare(`
    INSERT INTO exchanges (
      id, post_id, helper_key, helped_key, hours_exchanged,
      helper_signature, helped_signature, completed_at, category, node_id,
      flagged_for_review, flag_reason,
      auto_confirmed, auto_confirmed_by, auto_confirmed_at
    ) VALUES (
      @id, @postId, @helperKey, @helpedKey, @hoursExchanged,
      @helperSignature, @helpedSignature, @completedAt, @category, @nodeId,
      @flaggedForReview, @flagReason,
      @autoConfirmed, @autoConfirmedBy, @autoConfirmedAt
    )
  `);

  const hasStmt = db.prepare("SELECT 1 FROM exchanges WHERE id = ?");
  const getStmt = db.prepare("SELECT * FROM exchanges WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM exchanges");

  return {
    insert(exchange) {
      insertStmt.run({
        id: exchange.id,
        postId: exchange.postId,
        helperKey: exchange.helperKey,
        helpedKey: exchange.helpedKey,
        hoursExchanged: exchange.hoursExchanged,
        helperSignature: exchange.helperSignature,
        helpedSignature: exchange.helpedSignature,
        completedAt: exchange.completedAt,
        category: exchange.category,
        nodeId: exchange.nodeId,
        flaggedForReview: exchange.flaggedForReview ? 1 : 0,
        flagReason: exchange.flagReason ?? null,
        autoConfirmed: exchange.autoConfirmed ? 1 : 0,
        autoConfirmedBy: exchange.autoConfirmedBy ?? null,
        autoConfirmedAt: exchange.autoConfirmedAt ?? null,
      });
    },

    get(id) {
      const row = getStmt.get(id) as ExchangeRow | undefined;
      return row ? rowToExchange(row) : undefined;
    },

    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      // Oldest-first with an INCLUSIVE cursor filter. Pullers advance
      // their cursor to max(completed_at) of each page, so ASC is the
      // only order under which a page boundary can't permanently skip
      // rows (with DESC, >limit new rows meant the cursor jumped past
      // everything below the newest page). `>=` re-serves boundary
      // rows that share the cursor timestamp; pullers dedup by id, so
      // ties can never be lost either. The id tiebreak keeps paging
      // deterministic.
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM exchanges WHERE completed_at >= ?
               ORDER BY completed_at ASC, id ASC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM exchanges
               ORDER BY completed_at ASC, id ASC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as ExchangeRow[]).map(rowToExchange);
    },

    count() {
      const r = countStmt.get() as { n: number };
      return r.n;
    },

    has(id) {
      return hasStmt.get(id) !== undefined;
    },
  };
}

export function createVouchStore(db: DatabaseType): VouchStore {
  const insertStmt = db.prepare(`
    INSERT INTO vouches (
      id, voucher_key, vouchee_key, created_at, kind, signature
    ) VALUES (
      @id, @voucherKey, @voucheeKey, @createdAt, @kind, @signature
    )
  `);
  const hasStmt = db.prepare("SELECT 1 FROM vouches WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM vouches");

  return {
    insert(vouch) {
      insertStmt.run({
        id: vouch.id,
        voucherKey: vouch.voucherKey,
        voucheeKey: vouch.voucheeKey,
        createdAt: vouch.createdAt,
        kind: vouch.kind,
        signature: vouch.signature,
      });
    },
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      // Oldest-first + inclusive cursor — see the exchanges store's
      // list() for the pagination-correctness rationale.
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM vouches WHERE created_at >= ?
               ORDER BY created_at ASC, id ASC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM vouches
               ORDER BY created_at ASC, id ASC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as VouchRow[]).map(rowToVouch);
    },
    count() {
      const r = countStmt.get() as { n: number };
      return r.n;
    },
    has(id) {
      return hasStmt.get(id) !== undefined;
    },
  };
}

interface VouchRow {
  id: string;
  voucher_key: string;
  vouchee_key: string;
  created_at: number;
  kind: string;
  signature: string;
}

function rowToVouch(r: VouchRow): SignedVouch {
  return {
    id: r.id,
    voucherKey: r.voucher_key,
    voucheeKey: r.vouchee_key,
    createdAt: r.created_at,
    kind: r.kind as SignedVouch["kind"],
    signature: r.signature,
  };
}

export function createPostStore(db: DatabaseType): PostStore {
  const insertStmt = db.prepare(`
    INSERT INTO posts (
      id, type, category, title, description, estimated_hours, urgency,
      posted_by, created_at, expires_at, location_zone, node_id, signature
    ) VALUES (
      @id, @type, @category, @title, @description, @estimatedHours, @urgency,
      @postedBy, @createdAt, @expiresAt, @locationZone, @nodeId, @signature
    )
  `);
  const hasStmt = db.prepare("SELECT 1 FROM posts WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM posts");

  return {
    insert(post) {
      insertStmt.run({
        id: post.id,
        type: post.type,
        category: post.category,
        title: post.title,
        description: post.description,
        estimatedHours: post.estimatedHours,
        urgency: post.urgency,
        postedBy: post.postedBy,
        createdAt: post.createdAt,
        expiresAt: post.expiresAt,
        locationZone: post.locationZone,
        nodeId: post.nodeId,
        signature: post.signature,
      });
    },
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      // Oldest-first + inclusive cursor — see the exchanges store's
      // list() for the pagination-correctness rationale.
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM posts WHERE created_at >= ?
               ORDER BY created_at ASC, id ASC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM posts
               ORDER BY created_at ASC, id ASC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as PostRowSqlite[]).map(rowToPost);
    },
    count() {
      const r = countStmt.get() as { n: number };
      return r.n;
    },
    has(id) {
      return hasStmt.get(id) !== undefined;
    },
  };
}

interface PostRowSqlite {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  estimated_hours: number;
  urgency: string;
  posted_by: string;
  created_at: number;
  expires_at: number | null;
  location_zone: string;
  node_id: string;
  signature: string;
}

function rowToPost(r: PostRowSqlite): PostRecord {
  return {
    id: r.id,
    type: r.type as PostRecord["type"],
    category: r.category as PostRecord["category"],
    title: r.title,
    description: r.description,
    estimatedHours: r.estimated_hours,
    urgency: r.urgency as PostRecord["urgency"],
    postedBy: r.posted_by,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    locationZone: r.location_zone,
    nodeId: r.node_id,
    signature: r.signature,
  };
}

export function createTaskCommentStore(db: DatabaseType): TaskCommentStore {
  const insertStmt = db.prepare(`
    INSERT INTO task_comments (
      id, project_id, task_id, author_key, body, created_at,
      deleted_at, node_id, signature
    ) VALUES (
      @id, @projectId, @taskId, @authorKey, @body, @createdAt,
      @deletedAt, @nodeId, @signature
    )
  `);
  // Tombstone-wins: a row already tombstoned cannot be un-tombstoned.
  // SQLite's COALESCE keeps any existing non-null deleted_at; the
  // first non-null timestamp wins (deletes are monotonic).
  const tombstoneStmt = db.prepare(`
    UPDATE task_comments
    SET deleted_at = COALESCE(deleted_at, @deletedAt)
    WHERE id = @id
  `);
  const hasStmt = db.prepare("SELECT 1 FROM task_comments WHERE id = ?");
  const deletedAtStmt = db.prepare(
    "SELECT deleted_at AS deletedAt FROM task_comments WHERE id = ?",
  );
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM task_comments");

  return {
    insert(comment) {
      insertStmt.run({
        id: comment.id,
        projectId: comment.projectId,
        taskId: comment.taskId,
        authorKey: comment.authorKey,
        body: comment.body,
        createdAt: comment.createdAt,
        deletedAt: comment.deletedAt,
        nodeId: comment.nodeId,
        signature: comment.signature,
      });
    },
    upsertTombstone(id, deletedAt) {
      const info = tombstoneStmt.run({ id, deletedAt });
      return info.changes > 0;
    },
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      // Oldest-first + inclusive cursor — see the exchanges store's
      // list() for the pagination-correctness rationale.
      //
      // A task comment's effective cursor position is
      // max(created_at, deleted_at): a tombstone applied AFTER a
      // puller's cursor passed the row's created_at must re-enter the
      // window, or soft deletes never converge for peers that already
      // pulled the live row. Pullers advance their cursor by the same
      // max, and dedup/merge by id.
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM task_comments
               WHERE MAX(created_at, COALESCE(deleted_at, 0)) >= ?
               ORDER BY MAX(created_at, COALESCE(deleted_at, 0)) ASC, id ASC
               LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM task_comments
               ORDER BY MAX(created_at, COALESCE(deleted_at, 0)) ASC, id ASC
               LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as TaskCommentRowSqlite[]).map(rowToTaskComment);
    },
    count() {
      const r = countStmt.get() as { n: number };
      return r.n;
    },
    has(id) {
      return hasStmt.get(id) !== undefined;
    },
    deletedAt(id) {
      const r = deletedAtStmt.get(id) as { deletedAt: number | null } | undefined;
      return r ? r.deletedAt : undefined;
    },
  };
}

interface TaskCommentRowSqlite {
  id: string;
  project_id: string;
  task_id: string;
  author_key: string;
  body: string;
  created_at: number;
  deleted_at: number | null;
  node_id: string;
  signature: string;
}

function rowToTaskComment(r: TaskCommentRowSqlite): TaskComment {
  return {
    id: r.id,
    projectId: r.project_id,
    taskId: r.task_id,
    authorKey: r.author_key,
    body: r.body,
    createdAt: r.created_at,
    deletedAt: r.deleted_at,
    nodeId: r.node_id,
    signature: r.signature,
  };
}

export function createPeerPullStore(db: DatabaseType): PeerPullStore {
  const getStmt = db.prepare("SELECT * FROM peer_pull_state WHERE peer_url = ?");
  const listStmt = db.prepare(
    "SELECT * FROM peer_pull_state ORDER BY peer_url",
  );
  // Two parameterized success statements — one per kind. Each
  // updates the matching cursor column via COALESCE so a pull that
  // returned no new rows preserves the existing high-water mark.
  //
  // Note: success deliberately does NOT clear `last_error`. The two
  // pulls (exchange + vouch) for the same peer run in parallel each
  // tick, and clearing `last_error` on success would race with a
  // concurrent failure update, hiding the failure. The accepted
  // trade is that `last_error` may hold a stale message after a
  // peer recovers; operators can read `last_success_at` vs.
  // `last_pulled_at` to tell whether the most recent attempt
  // succeeded. Per-kind error columns are a future refinement.
  const successExchangeStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at, last_completed_at,
      last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, @latestSeenAt, @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_completed_at = COALESCE(@latestSeenAt, last_completed_at),
      last_pulled_count = @pulledCount
  `);
  const successVouchStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at, last_vouch_created_at,
      last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, @latestSeenAt, @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_vouch_created_at = COALESCE(@latestSeenAt, last_vouch_created_at),
      last_pulled_count = @pulledCount
  `);
  const successPostStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at, last_post_created_at,
      last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, @latestSeenAt, @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_post_created_at = COALESCE(@latestSeenAt, last_post_created_at),
      last_pulled_count = @pulledCount
  `);
  const successTaskCommentStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at,
      last_task_comment_created_at, last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, @latestSeenAt, @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_task_comment_created_at =
        COALESCE(@latestSeenAt, last_task_comment_created_at),
      last_pulled_count = @pulledCount
  `);
  const successCoOrgInvitationStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at,
      last_coorg_invitation_created_at, last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, @latestSeenAt, @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_coorg_invitation_created_at =
        COALESCE(@latestSeenAt, last_coorg_invitation_created_at),
      last_pulled_count = @pulledCount
  `);
  const successCoOrgInvitationResponseStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at,
      last_coorg_invitation_response_decided_at, last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, @latestSeenAt, @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_coorg_invitation_response_decided_at =
        COALESCE(@latestSeenAt, last_coorg_invitation_response_decided_at),
      last_pulled_count = @pulledCount
  `);
  const successCoOrgInvitationRevocationStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at,
      last_coorg_invitation_revocation_revoked_at, last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, @latestSeenAt, @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_coorg_invitation_revocation_revoked_at =
        COALESCE(@latestSeenAt, last_coorg_invitation_revocation_revoked_at),
      last_pulled_count = @pulledCount
  `);
  const successEventStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at,
      last_event_created_at, last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, COALESCE(@latestSeenAt, 0), @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_event_created_at =
        COALESCE(@latestSeenAt, last_event_created_at),
      last_pulled_count = @pulledCount
  `);
  const successEventCancellationStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at,
      last_event_cancellation_created_at, last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, COALESCE(@latestSeenAt, 0), @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_event_cancellation_created_at =
        COALESCE(@latestSeenAt, last_event_cancellation_created_at),
      last_pulled_count = @pulledCount
  `);
  const failureStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_error, last_pulled_count
    ) VALUES (
      @peerUrl, @at, @error, 0
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_error = @error
  `);
  return {
    get(peerUrl) {
      const row = getStmt.get(peerUrl) as PeerPullStateRowSqlite | undefined;
      return row ? toState(row) : null;
    },
    list() {
      const rows = listStmt.all() as PeerPullStateRowSqlite[];
      return rows.map(toState);
    },
    recordSuccess({ peerUrl, kind, at, latestSeenAt, pulledCount }) {
      const stmt =
        kind === "exchange"
          ? successExchangeStmt
          : kind === "vouch"
            ? successVouchStmt
            : kind === "post"
              ? successPostStmt
              : kind === "task_comment"
                ? successTaskCommentStmt
                : kind === "coorg_invitation"
                  ? successCoOrgInvitationStmt
                  : kind === "coorg_invitation_response"
                    ? successCoOrgInvitationResponseStmt
                    : kind === "coorg_invitation_revocation"
                      ? successCoOrgInvitationRevocationStmt
                      : kind === "event"
                        ? successEventStmt
                        : successEventCancellationStmt;
      stmt.run({ peerUrl, at, latestSeenAt, pulledCount });
    },
    recordFailure({ peerUrl, at, error }) {
      failureStmt.run({ peerUrl, at, error });
    },
  };
}

interface PeerPullStateRowSqlite {
  peer_url: string;
  last_pulled_at: number | null;
  last_success_at: number | null;
  last_completed_at: number | null;
  last_vouch_created_at: number | null;
  last_post_created_at: number | null;
  last_task_comment_created_at: number | null;
  last_coorg_invitation_created_at: number | null;
  last_coorg_invitation_response_decided_at: number | null;
  last_coorg_invitation_revocation_revoked_at: number | null;
  last_event_created_at: number | null;
  last_event_cancellation_created_at: number | null;
  last_error: string | null;
  last_pulled_count: number;
}

function toState(r: PeerPullStateRowSqlite): PeerPullStateRow {
  return {
    peerUrl: r.peer_url,
    lastPulledAt: r.last_pulled_at,
    lastSuccessAt: r.last_success_at,
    lastCompletedAt: r.last_completed_at,
    lastVouchCreatedAt: r.last_vouch_created_at,
    lastPostCreatedAt: r.last_post_created_at,
    lastTaskCommentCreatedAt: r.last_task_comment_created_at,
    lastCoOrgInvitationCreatedAt: r.last_coorg_invitation_created_at,
    lastCoOrgInvitationResponseDecidedAt:
      r.last_coorg_invitation_response_decided_at,
    lastCoOrgInvitationRevocationRevokedAt:
      r.last_coorg_invitation_revocation_revoked_at,
    lastEventCreatedAt: r.last_event_created_at,
    lastEventCancellationCreatedAt: r.last_event_cancellation_created_at,
    lastError: r.last_error,
    lastPulledCount: r.last_pulled_count,
  };
}

interface ExchangeRow {
  id: string;
  post_id: string;
  helper_key: string;
  helped_key: string;
  hours_exchanged: number;
  helper_signature: string;
  helped_signature: string;
  completed_at: number;
  category: string;
  node_id: string;
  flagged_for_review: number;
  flag_reason: string | null;
  auto_confirmed: number;
  auto_confirmed_by: string | null;
  auto_confirmed_at: number | null;
}

function rowToExchange(r: ExchangeRow): Exchange {
  const out: Exchange = {
    id: r.id,
    postId: r.post_id,
    helperKey: r.helper_key,
    helpedKey: r.helped_key,
    hoursExchanged: r.hours_exchanged,
    helperSignature: r.helper_signature,
    helpedSignature: r.helped_signature,
    completedAt: r.completed_at,
    category: r.category as Exchange["category"],
    nodeId: r.node_id,
  };
  if (r.flagged_for_review) {
    out.flaggedForReview = true;
    if (r.flag_reason) out.flagReason = r.flag_reason as FlagReason;
  }
  // §4 provenance markers — restored exactly as inserted so peers can
  // run verifyExchangeLabel on rows served by GET /exchanges.
  if (r.auto_confirmed) {
    out.autoConfirmed = true;
    if (r.auto_confirmed_by) out.autoConfirmedBy = r.auto_confirmed_by;
    if (r.auto_confirmed_at !== null) out.autoConfirmedAt = r.auto_confirmed_at;
  }
  return out;
}

export function createRedemptionStore(db: DatabaseType): RedemptionStore {
  const insertStmt = db.prepare(`
    INSERT INTO redemptions (
      token, inviter_key, inviter_name, invite_node_id,
      invite_created_at, invite_expires_at, invite_signature,
      redeemed_by, display_name, redeemed_at, signature, received_at
    ) VALUES (
      @token, @inviterKey, @inviterName, @inviteNodeId,
      @inviteCreatedAt, @inviteExpiresAt, @inviteSignature,
      @redeemedBy, @displayName, @redeemedAt, @signature, @receivedAt
    )
  `);
  const hasStmt = db.prepare("SELECT 1 FROM redemptions WHERE token = ?");
  const getByTokenStmt = db.prepare(
    "SELECT * FROM redemptions WHERE token = ?",
  );
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM redemptions");

  return {
    insert(receipt, receivedAt) {
      insertStmt.run({
        token: receipt.invite.token,
        inviterKey: receipt.invite.inviterKey,
        inviterName: receipt.invite.inviterName,
        inviteNodeId: receipt.invite.nodeId,
        inviteCreatedAt: receipt.invite.createdAt,
        inviteExpiresAt: receipt.invite.expiresAt,
        inviteSignature: receipt.invite.signature,
        redeemedBy: receipt.redeemedBy,
        displayName: receipt.displayName,
        redeemedAt: receipt.redeemedAt,
        signature: receipt.signature,
        receivedAt,
      });
    },
    // Cursor is the server-assigned `received_at`, ascending — the §7
    // deviation from the sibling stores, so a client that was offline
    // for a week resumes exactly where it left off regardless of what
    // `redeemedAt` any device claimed.
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      // Inclusive cursor + token tiebreak — same tie-at-page-boundary
      // reasoning as the exchanges store's list(): two receipts can
      // share a received_at millisecond, and a strict `>` cursor that
      // lands between them skips the un-served one forever. Pullers
      // merge idempotently by token, so a re-served boundary row is a
      // harmless no-op. The server-monotonic received_at cursor itself
      // (the §7 design ruling) is unchanged.
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM redemptions WHERE received_at >= ?
               ORDER BY received_at ASC, token ASC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM redemptions
               ORDER BY received_at ASC, token ASC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as RedemptionRowSqlite[]).map(rowToRedemption);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
    has(token) {
      return hasStmt.get(token) !== undefined;
    },
    getByToken(token) {
      const r = getByTokenStmt.get(token) as
        | RedemptionRowSqlite
        | undefined;
      return r ? rowToRedemption(r) : null;
    },
  };
}

interface RedemptionRowSqlite {
  token: string;
  inviter_key: string;
  inviter_name: string;
  invite_node_id: string;
  invite_created_at: number;
  invite_expires_at: number;
  invite_signature: string;
  redeemed_by: string;
  display_name: string;
  redeemed_at: number;
  signature: string;
  received_at: number;
}

function rowToRedemption(r: RedemptionRowSqlite): StoredRedemption {
  return {
    receipt: {
      invite: {
        token: r.token,
        inviterKey: r.inviter_key,
        inviterName: r.inviter_name,
        nodeId: r.invite_node_id,
        createdAt: r.invite_created_at,
        expiresAt: r.invite_expires_at,
        signature: r.invite_signature,
      },
      redeemedBy: r.redeemed_by,
      displayName: r.display_name,
      redeemedAt: r.redeemed_at,
      signature: r.signature,
    },
    receivedAt: r.received_at,
  };
}

export function createInviteRevocationStore(
  db: DatabaseType,
): InviteRevocationStore {
  const insertStmt = db.prepare(`
    INSERT INTO invite_revocations (
      token, inviter_key, revoked_at, node_id, signature, received_at
    ) VALUES (
      @token, @inviterKey, @revokedAt, @nodeId, @signature, @receivedAt
    )
  `);
  const hasStmt = db.prepare("SELECT 1 FROM invite_revocations WHERE token = ?");
  const getByTokenStmt = db.prepare(
    "SELECT * FROM invite_revocations WHERE token = ?",
  );
  const countStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM invite_revocations",
  );

  return {
    insert(revocation, receivedAt) {
      insertStmt.run({
        token: revocation.token,
        inviterKey: revocation.inviterKey,
        revokedAt: revocation.revokedAt,
        nodeId: revocation.nodeId,
        signature: revocation.signature,
        receivedAt,
      });
    },
    // Inclusive received_at cursor + token tiebreak — same reasoning as
    // the redemptions store's list().
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM invite_revocations WHERE received_at >= ?
               ORDER BY received_at ASC, token ASC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM invite_revocations
               ORDER BY received_at ASC, token ASC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as InviteRevocationRowSqlite[]).map(rowToInviteRevocation);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
    has(token) {
      return hasStmt.get(token) !== undefined;
    },
    getByToken(token) {
      const r = getByTokenStmt.get(token) as
        | InviteRevocationRowSqlite
        | undefined;
      return r ? rowToInviteRevocation(r) : null;
    },
  };
}

interface InviteRevocationRowSqlite {
  token: string;
  inviter_key: string;
  revoked_at: number;
  node_id: string;
  signature: string;
  received_at: number;
}

function rowToInviteRevocation(
  r: InviteRevocationRowSqlite,
): StoredInviteRevocation {
  return {
    revocation: {
      token: r.token,
      inviterKey: r.inviter_key,
      revokedAt: r.revoked_at,
      nodeId: r.node_id,
      signature: r.signature,
    },
    receivedAt: r.received_at,
  };
}

export function createClaimStore(db: DatabaseType): ClaimStore {
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO claims (post_id, claimer_key, claimed_at, node_id)
    VALUES (@postId, @claimerKey, @claimedAt, @nodeId)
  `);
  const hasStmt = db.prepare("SELECT 1 FROM claims WHERE post_id = ?");

  return {
    insert(claim) {
      insertStmt.run({
        postId: claim.postId,
        claimerKey: claim.claimerKey,
        claimedAt: claim.claimedAt,
        nodeId: claim.nodeId,
      });
    },
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      // Oldest-first + inclusive cursor — see the exchanges store's
      // list() for the pagination-correctness rationale. The PWA's
      // claim pull advances a max(claimed_at) cursor, so it has the
      // same page-skip failure mode as the peer pulls.
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM claims WHERE claimed_at >= ?
               ORDER BY claimed_at ASC, post_id ASC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM claims ORDER BY claimed_at ASC, post_id ASC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as ClaimRow[]).map(rowToClaim);
    },
    has(postId) {
      return hasStmt.get(postId) !== undefined;
    },
  };
}

interface ClaimRow {
  post_id: string;
  claimer_key: string;
  claimed_at: number;
  node_id: string;
}

function rowToClaim(r: ClaimRow): ClaimRecord {
  return {
    postId: r.post_id,
    claimerKey: r.claimer_key,
    claimedAt: r.claimed_at,
    nodeId: r.node_id,
  };
}

export function createCoOrganizerInvitationStore(
  db: DatabaseType,
): CoOrganizerInvitationStore {
  const insertStmt = db.prepare(`
    INSERT INTO coorg_invitations (
      id, project_id, inviter_key, invitee_key,
      created_at, expires_at, node_id, signature
    ) VALUES (
      @id, @projectId, @inviterKey, @inviteeKey,
      @createdAt, @expiresAt, @nodeId, @signature
    )
  `);
  const hasStmt = db.prepare("SELECT 1 FROM coorg_invitations WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM coorg_invitations");

  return {
    insert(record) {
      insertStmt.run({
        id: record.id,
        projectId: record.projectId,
        inviterKey: record.inviterKey,
        inviteeKey: record.inviteeKey,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        nodeId: record.nodeId,
        signature: record.signature,
      });
    },
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      // Oldest-first + inclusive cursor — see the exchanges store's
      // list() for the pagination-correctness rationale.
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM coorg_invitations WHERE created_at >= ?
               ORDER BY created_at ASC, id ASC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM coorg_invitations
               ORDER BY created_at ASC, id ASC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as CoOrganizerInvitationRowSqlite[]).map(
        rowToCoOrganizerInvitation,
      );
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
    has(id) {
      return hasStmt.get(id) !== undefined;
    },
  };
}

interface CoOrganizerInvitationRowSqlite {
  id: string;
  project_id: string;
  inviter_key: string;
  invitee_key: string;
  created_at: number;
  expires_at: number;
  node_id: string;
  signature: string;
}

function rowToCoOrganizerInvitation(
  r: CoOrganizerInvitationRowSqlite,
): CoOrganizerInvitation {
  return {
    id: r.id,
    projectId: r.project_id,
    inviterKey: r.inviter_key,
    inviteeKey: r.invitee_key,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    nodeId: r.node_id,
    signature: r.signature,
  };
}

export function createCoOrganizerInvitationResponseStore(
  db: DatabaseType,
): CoOrganizerInvitationResponseStore {
  const insertStmt = db.prepare(`
    INSERT INTO coorg_invitation_responses (
      id, invitation_id, invitee_key, decision,
      decided_at, node_id, signature
    ) VALUES (
      @id, @invitationId, @inviteeKey, @decision,
      @decidedAt, @nodeId, @signature
    )
  `);
  const hasStmt = db.prepare(
    "SELECT 1 FROM coorg_invitation_responses WHERE id = ?",
  );
  const countStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM coorg_invitation_responses",
  );

  return {
    insert(record) {
      insertStmt.run({
        id: record.id,
        invitationId: record.invitationId,
        inviteeKey: record.inviteeKey,
        decision: record.decision,
        decidedAt: record.decidedAt,
        nodeId: record.nodeId,
        signature: record.signature,
      });
    },
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      // Oldest-first + inclusive cursor — see the exchanges store's
      // list() for the pagination-correctness rationale.
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM coorg_invitation_responses WHERE decided_at >= ?
               ORDER BY decided_at ASC, id ASC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM coorg_invitation_responses
               ORDER BY decided_at ASC, id ASC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as CoOrganizerInvitationResponseRowSqlite[]).map(
        rowToCoOrganizerInvitationResponse,
      );
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
    has(id) {
      return hasStmt.get(id) !== undefined;
    },
  };
}

interface CoOrganizerInvitationResponseRowSqlite {
  id: string;
  invitation_id: string;
  invitee_key: string;
  decision: string;
  decided_at: number;
  node_id: string;
  signature: string;
}

function rowToCoOrganizerInvitationResponse(
  r: CoOrganizerInvitationResponseRowSqlite,
): CoOrganizerInvitationResponse {
  return {
    id: r.id,
    invitationId: r.invitation_id,
    inviteeKey: r.invitee_key,
    decision: r.decision as CoOrganizerInvitationResponse["decision"],
    decidedAt: r.decided_at,
    nodeId: r.node_id,
    signature: r.signature,
  };
}

export function createCoOrganizerInvitationRevocationStore(
  db: DatabaseType,
): CoOrganizerInvitationRevocationStore {
  const insertStmt = db.prepare(`
    INSERT INTO coorg_invitation_revocations (
      id, invitation_id, inviter_key, revoked_at, node_id, signature
    ) VALUES (
      @id, @invitationId, @inviterKey, @revokedAt, @nodeId, @signature
    )
  `);
  const hasStmt = db.prepare(
    "SELECT 1 FROM coorg_invitation_revocations WHERE id = ?",
  );
  const countStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM coorg_invitation_revocations",
  );

  return {
    insert(record) {
      insertStmt.run({
        id: record.id,
        invitationId: record.invitationId,
        inviterKey: record.inviterKey,
        revokedAt: record.revokedAt,
        nodeId: record.nodeId,
        signature: record.signature,
      });
    },
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      // Oldest-first + inclusive cursor — see the exchanges store's
      // list() for the pagination-correctness rationale.
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM coorg_invitation_revocations WHERE revoked_at >= ?
               ORDER BY revoked_at ASC, id ASC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM coorg_invitation_revocations
               ORDER BY revoked_at ASC, id ASC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as CoOrganizerInvitationRevocationRowSqlite[]).map(
        rowToCoOrganizerInvitationRevocation,
      );
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
    has(id) {
      return hasStmt.get(id) !== undefined;
    },
  };
}

interface CoOrganizerInvitationRevocationRowSqlite {
  id: string;
  invitation_id: string;
  inviter_key: string;
  revoked_at: number;
  node_id: string;
  signature: string;
}

function rowToCoOrganizerInvitationRevocation(
  r: CoOrganizerInvitationRevocationRowSqlite,
): CoOrganizerInvitationRevocation {
  return {
    id: r.id,
    invitationId: r.invitation_id,
    inviterKey: r.inviter_key,
    revokedAt: r.revoked_at,
    nodeId: r.node_id,
    signature: r.signature,
  };
}

export function createEventStore(db: DatabaseType): EventStore {
  // Note: we persist the canonical-JSON `payload` separately from the
  // signature so a future audit can re-verify against the exact bytes
  // the signer covered. The denormalized scalar columns are there so
  // the cursor query and the indexed lookups don't have to JSON-parse
  // every row.
  const insertStmt = db.prepare(`
    INSERT INTO events (
      id, node_id, created_by, starts_at, ends_at,
      created_at, payload, signature
    ) VALUES (
      @id, @nodeId, @createdBy, @startsAt, @endsAt,
      @createdAt, @payload, @signature
    )
  `);
  const hasStmt = db.prepare("SELECT 1 FROM events WHERE id = ?");
  const getStmt = db.prepare("SELECT * FROM events WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM events");

  return {
    insert(record) {
      insertStmt.run({
        id: record.id,
        nodeId: record.nodeId,
        createdBy: record.createdBy,
        startsAt: record.startsAt,
        endsAt: record.endsAt,
        createdAt: record.createdAt,
        payload: JSON.stringify(record),
        signature: record.signature,
      });
    },
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      // Inclusive cursor + id tiebreak — see the exchanges store's
      // list() for the tie-at-page-boundary rationale (this store was
      // already ASC).
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM events WHERE created_at >= ?
               ORDER BY created_at ASC, id ASC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM events
               ORDER BY created_at ASC, id ASC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as EventRowSqlite[]).map(rowToEvent);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
    has(id) {
      return hasStmt.get(id) !== undefined;
    },
    get(id) {
      const r = getStmt.get(id) as EventRowSqlite | undefined;
      return r ? rowToEvent(r) : null;
    },
  };
}

interface EventRowSqlite {
  id: string;
  node_id: string;
  created_by: string;
  starts_at: number;
  ends_at: number | null;
  created_at: number;
  payload: string;
  signature: string;
}

function rowToEvent(r: EventRowSqlite): Event {
  // The `payload` column is the canonical JSON we received; trust it
  // as the source of truth for every field. Falling back to the
  // denormalized scalars would silently mask corruption.
  return JSON.parse(r.payload) as Event;
}

export function createEventCancellationStore(
  db: DatabaseType,
): EventCancellationStore {
  // `event_id UNIQUE` (per the v10 migration) is the schema-level
  // first-write-wins guard: a second cancellation arriving for an
  // event already cancelled fails the INSERT and is treated as a
  // duplicate by the route handler. We surface that via
  // `getByEventId(eventId)` so the route can return the existing row
  // with a 200, mirroring the idempotent-id path.
  const insertStmt = db.prepare(`
    INSERT INTO event_cancellations (
      id, node_id, event_id, created_by, cancelled_at,
      payload, signature
    ) VALUES (
      @id, @nodeId, @eventId, @createdBy, @cancelledAt,
      @payload, @signature
    )
  `);
  const hasStmt = db.prepare("SELECT 1 FROM event_cancellations WHERE id = ?");
  const getByEventIdStmt = db.prepare(
    "SELECT * FROM event_cancellations WHERE event_id = ?",
  );
  const countStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM event_cancellations",
  );

  return {
    insert(record) {
      insertStmt.run({
        id: record.id,
        nodeId: record.nodeId,
        eventId: record.eventId,
        createdBy: record.createdBy,
        cancelledAt: record.cancelledAt,
        payload: JSON.stringify(record),
        signature: record.signature,
      });
    },
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      // Inclusive cursor + id tiebreak — see the exchanges store's
      // list() for the tie-at-page-boundary rationale (this store was
      // already ASC).
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM event_cancellations WHERE cancelled_at >= ?
               ORDER BY cancelled_at ASC, id ASC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM event_cancellations
               ORDER BY cancelled_at ASC, id ASC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as EventCancellationRowSqlite[]).map(rowToEventCancellation);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
    has(id) {
      return hasStmt.get(id) !== undefined;
    },
    getByEventId(eventId) {
      const r = getByEventIdStmt.get(eventId) as
        | EventCancellationRowSqlite
        | undefined;
      return r ? rowToEventCancellation(r) : null;
    },
  };
}

interface EventCancellationRowSqlite {
  id: string;
  node_id: string;
  event_id: string;
  created_by: string;
  cancelled_at: number;
  payload: string;
  signature: string;
}

function rowToEventCancellation(
  r: EventCancellationRowSqlite,
): EventCancellation {
  return JSON.parse(r.payload) as EventCancellation;
}
