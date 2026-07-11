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
// better-sqlite3-multiple-ciphers is the API-compatible fork bundling
// SQLite3MultipleCiphers — same driver, plus `PRAGMA key` support so
// the database file can be encrypted at rest (SQLCipher scheme). With
// no key configured it behaves byte-for-byte like plain better-sqlite3.
// See docs/member-authenticated-reads.md §2.
import Database from "better-sqlite3-multiple-ciphers";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type {
  AwaitingTransition,
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Event,
  EventCancellation,
  Exchange,
  FlagReason,
  EventRsvpState,
  MemberRemoval,
  MemberReinstatement,
  Proposal,
  ProposalClosure,
  Vote,
  SeedVaultPledge,
  EventShiftState,
  Post,
  InviteRevocation,
  ProjectState,
  RedemptionReceipt,
  RelayedMessage,
  ShiftSignupState,
  SignedVouch,
  TaskComment,
  TaskState,
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
  list(opts?: { since?: number; sinceId?: string; limit?: number }): Exchange[];
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
  list(opts?: { since?: number; sinceId?: string; limit?: number }): SignedVouch[];
  count(): number;
  has(id: string): boolean;
}

/**
 * Storage for relayed direct-message envelopes (docs/message-relay.md
 * §4). Deviates from the sibling stores in two deliberate ways:
 * `listForRecipient` takes a MANDATORY recipient key (there is no
 * community-wide message feed — the route serves each member only
 * their own inbox, so the scoping lives in the query, not the
 * caller's discipline), and `pruneOlderThan` exists because message
 * rows expire (the retention window) where every other federation
 * table is append-only.
 */
export interface MessageStore {
  insert(message: RelayedMessage): void;
  listForRecipient(
    recipientKey: string,
    opts?: { since?: number; sinceId?: string; limit?: number },
  ): RelayedMessage[];
  count(): number;
  has(id: string): boolean;
  /** Delete rows with `created_at < cutoff`. Returns rows removed. */
  pruneOlderThan(cutoff: number): number;
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
  list(opts?: { since?: number; sinceId?: string; limit?: number }): PostRecord[];
  count(): number;
  has(id: string): boolean;
  /** The stored post for `id`, or null. Used by /auto-confirm to bind
   *  a system-signed confirmation to the poster-signed post it claims
   *  to finalize (roles / hours / category), so the system key can
   *  never confirm a fabricated exchange against an arbitrary victim. */
  get(id: string): PostRecord | null;
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
  list(opts?: { since?: number; sinceId?: string; limit?: number }): TaskComment[];
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
  /** Rows with `received_at >= since` (inclusive, token tiebreak),
   *  ascending, capped like the sibling stores (default 200,
   *  ceiling 1000). */
  list(opts?: { since?: number; sinceId?: string; limit?: number }): StoredRedemption[];
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
  list(opts?: { since?: number; sinceId?: string; limit?: number }): StoredInviteRevocation[];
  count(): number;
  has(token: string): boolean;
  getByToken(token: string): StoredInviteRevocation | null;
}

export interface StoredAwaitingTransition {
  record: AwaitingTransition;
  /** Server clock at ingestion — the age anchor the /auto-confirm
   *  window is measured from (docs/auto-confirm-key.md §5). Never
   *  client-influenced. */
  receivedAt: number;
}

/**
 * Storage for signed awaiting-transition artifacts. Deliberately
 * NARROW: no list() and no GET route — the artifact is only ever
 * consulted by this node's own /auto-confirm handler, keyed by
 * post_id. First-writer-wins per post_id: `insert` is
 * INSERT-OR-IGNORE, so a re-push (client retry, outbox redelivery,
 * or a second party attesting) is idempotent and can never reset
 * the `received_at` age anchor.
 */
export interface AwaitingTransitionStore {
  /** Returns true when a row was inserted, false when the post_id
   *  already had one (idempotent no-op). */
  insert(record: AwaitingTransition, receivedAt: number): boolean;
  getByPostId(postId: string): StoredAwaitingTransition | null;
  count(): number;
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
  list(opts?: { since?: number; sinceId?: string; limit?: number }): CoOrganizerInvitation[];
  count(): number;
  has(id: string): boolean;
}

export interface CoOrganizerInvitationResponseStore {
  insert(record: CoOrganizerInvitationResponse): void;
  list(opts?: {
    since?: number;
    sinceId?: string;
    limit?: number;
  }): CoOrganizerInvitationResponse[];
  count(): number;
  has(id: string): boolean;
}

export interface CoOrganizerInvitationRevocationStore {
  insert(record: CoOrganizerInvitationRevocation): void;
  list(opts?: {
    since?: number;
    sinceId?: string;
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
  list(opts?: { since?: number; sinceId?: string; limit?: number }): Event[];
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
  list(opts?: { since?: number; sinceId?: string; limit?: number }): EventCancellation[];
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
  list(opts?: { since?: number; sinceId?: string; limit?: number }): ClaimRecord[];
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
  /** Id half of each (timestamp, id) pair cursor — composite cursors
   *  phase 2. NULL = legacy timestamp-only position: send `since`
   *  alone (inclusive re-serve, dedup no-ops), write the pair after
   *  the next successful pull. Always updated ATOMICALLY with its
   *  timestamp column — a pair whose halves disagree would skip or
   *  re-serve rows. */
  lastCompletedId: string | null;
  lastVouchCreatedId: string | null;
  lastPostCreatedId: string | null;
  lastTaskCommentCreatedId: string | null;
  lastCoOrgInvitationCreatedId: string | null;
  lastCoOrgInvitationResponseDecidedId: string | null;
  lastCoOrgInvitationRevocationRevokedId: string | null;
  lastEventCreatedId: string | null;
  lastEventCancellationCreatedId: string | null;
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
    /** Id of the last-consumed row at `latestSeenAt` — the pair
     *  half. Persisted only together with a non-null `latestSeenAt`
     *  so the stored pair can never disagree. */
    latestSeenId: string | null;
    pulledCount: number;
  }): void;
  recordFailure(opts: { peerUrl: string; at: number; error: string }): void;
}

export function openDatabase(path: string, key?: string | null): DatabaseType {
  const db = new Database(path);
  if (key) {
    // MUST run before any other statement touches pages — an
    // unkeyed read of an encrypted file throws SQLITE_NOTADB.
    // Single-quote SQL escaping; the key never appears in logs.
    db.pragma(`key = '${key.replace(/'/g, "''")}'`);
  }
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

  // Schema v14 — signed awaiting-transition artifacts
  // (docs/auto-confirm-key.md §5; roadmap "signed awaiting-transition
  // artifact" row). One row per pending exchange, keyed by post_id
  // (post id or `project:<id>/task:<id>` label), FIRST-WRITER-WINS —
  // the PRIMARY KEY plus insert-or-ignore semantics in the store mean
  // a re-push can never reset the age anchor. `received_at` is the
  // node's own ingestion clock: the value the /auto-confirm window is
  // measured from, which no client can backdate. PWA↔node only — no
  // peer-replication leg (the artifact only matters at the node whose
  // system key will sign), so no GET route and no peer_pull_state
  // column.
  if (current < 14) {
    db.exec(`
      CREATE TABLE awaiting_transitions (
        post_id TEXT PRIMARY KEY,
        helper_key TEXT NOT NULL,
        helped_key TEXT NOT NULL,
        signed_by TEXT NOT NULL,
        entered_at INTEGER NOT NULL,
        node_id TEXT NOT NULL,
        signature TEXT NOT NULL,
        received_at INTEGER NOT NULL
      );
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '14')",
    ).run();
  }

  // Schema v15 — per-key insert-cap backstop (roadmap "per-key /
  // per-table insert caps"; see apps/server/src/insertCaps.ts). The
  // cap guard runs a COUNT(... WHERE <key_column> = ?) before every
  // federation POST; these indexes cover the key columns that did not
  // already have one, so the check stays O(log n) as tables grow.
  if (current < 15) {
    db.exec(`
      CREATE INDEX claims_claimer_idx ON claims (claimer_key);
      CREATE INDEX coorg_invitations_inviter_idx
        ON coorg_invitations (inviter_key);
      CREATE INDEX coorg_invitation_responses_invitee_idx
        ON coorg_invitation_responses (invitee_key);
      CREATE INDEX coorg_invitation_revocations_inviter_idx
        ON coorg_invitation_revocations (inviter_key);
      CREATE INDEX awaiting_transitions_signed_by_idx
        ON awaiting_transitions (signed_by);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '15')",
    ).run();
  }

  // Schema v16 — node-relayed device linking (docs/device-pairing.md
  // §6.6). Ephemeral mailbox rows: an opaque channel id (derived
  // client-side from the link code via the same PBKDF2 cost as the
  // envelope key — the server cannot cheaply reverse it) mapping to a
  // passphrase-wrapped TransferEnvelope. Rows are one-shot (deleted on
  // first successful GET) and TTL-bounded; the expires index keeps the
  // prune-on-write sweep O(log n).
  if (current < 16) {
    db.exec(`
      CREATE TABLE device_link_blobs (
        channel_id TEXT PRIMARY KEY,
        envelope TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      );
      CREATE INDEX device_link_blobs_expires_idx
        ON device_link_blobs (expires_at);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '16')",
    ).run();
  }

  // Schema v17 — tap-to-link rendezvous (docs/device-pairing.md §6.7).
  // A link request is the NEW device's hand raised: one ephemeral
  // public key, bucketed by a salted hash of the requester's network
  // address so the member's signed-in device can discover it. Rows
  // carry no identity material and die in minutes; cancel_token lets
  // only the creator withdraw a request early.
  if (current < 17) {
    db.exec(`
      CREATE TABLE link_requests (
        pubkey TEXT PRIMARY KEY,
        bucket TEXT NOT NULL,
        cancel_token TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      );
      CREATE INDEX link_requests_bucket_idx ON link_requests (bucket);
      CREATE INDEX link_requests_expires_idx ON link_requests (expires_at);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '17')",
    ).run();
  }

  // Schema v18 — project & participation federation Phase 1
  // (docs/project-federation.md). Signed last-writer-wins state
  // records: unlike every append-only kind above, these REPLACE by id
  // when a newer `updated_at` arrives and the authority rules pass.
  // `organizer_key` on project_states is the authority anchor,
  // established at first write and thereafter changeable only by a
  // version the stored organizer signed.
  if (current < 18) {
    db.exec(`
      CREATE TABLE project_states (
        id TEXT PRIMARY KEY,
        organizer_key TEXT NOT NULL,
        signer_key TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        node_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX project_states_updated_idx ON project_states (updated_at);
      CREATE INDEX project_states_signer_idx ON project_states (signer_key);
      CREATE TABLE task_states (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        signer_key TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        payload TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX task_states_updated_idx ON task_states (updated_at);
      CREATE INDEX task_states_project_idx ON task_states (project_id);
      CREATE INDEX task_states_signer_idx ON task_states (signer_key);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '18')",
    ).run();
  }

  // Schema v19 — participation federation Phase 2
  // (docs/project-federation.md §6). Same signed-LWW-state posture as
  // v18. RSVPs and shift signups are keyed by their NATURAL key —
  // (event_id, member_key) / (shift_id, member_key) — not by row uuid,
  // so two devices of one member can never double-count a roster:
  // whichever version is newest simply replaces the pair's row.
  // Shifts keep `id` as primary key (stable, organizer-minted) and
  // carry a tombstone in the payload (`deletedAt`) rather than being
  // DELETEd, so a removal keeps winning LWW against stale live copies.
  if (current < 19) {
    db.exec(`
      CREATE TABLE event_rsvps (
        event_id TEXT NOT NULL,
        member_key TEXT NOT NULL,
        id TEXT NOT NULL,
        signer_key TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        payload TEXT NOT NULL,
        signature TEXT NOT NULL,
        PRIMARY KEY (event_id, member_key)
      );
      CREATE INDEX event_rsvps_updated_idx ON event_rsvps (updated_at);
      CREATE INDEX event_rsvps_signer_idx ON event_rsvps (signer_key);
      CREATE TABLE event_shifts (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        signer_key TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        payload TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX event_shifts_updated_idx ON event_shifts (updated_at);
      CREATE INDEX event_shifts_event_idx ON event_shifts (event_id);
      CREATE INDEX event_shifts_signer_idx ON event_shifts (signer_key);
      CREATE TABLE shift_signups (
        shift_id TEXT NOT NULL,
        member_key TEXT NOT NULL,
        id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        signer_key TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        payload TEXT NOT NULL,
        signature TEXT NOT NULL,
        PRIMARY KEY (shift_id, member_key)
      );
      CREATE INDEX shift_signups_updated_idx ON shift_signups (updated_at);
      CREATE INDEX shift_signups_signer_idx ON shift_signups (signer_key);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '19')",
    ).run();
  }

  // Schema v20 — mirror replication (docs/community-resilience.md
  // §B.1). One row per (mirror, kind): the composite `(last_ts,
  // last_id)` high-water mark of the mirror-pull worker's exclusive
  // pair cursor. Cursors are PER MIRROR — mirrors lag each other, so
  // carrying node A's high-water mark to node B would silently skip
  // every record B has that A hasn't seen yet. Separate from
  // `peer_pull_state` on purpose: that table is one denormalized row
  // per PEER (a neighboring community, few kinds, observability
  // columns); this one is a plain cursor ledger over EVERY durable
  // kind of the same community.
  if (current < 20) {
    db.exec(`
      CREATE TABLE mirror_pull_state (
        mirror_url TEXT NOT NULL,
        kind TEXT NOT NULL,
        last_ts INTEGER NOT NULL,
        last_id TEXT NOT NULL,
        PRIMARY KEY (mirror_url, kind)
      );
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '20')",
    ).run();
  }

  if (current < 21) {
    // Seed-vault pledges (docs/storage-budget.md Phase 2): a member's
    // public, revocable claim to hold the complete community archive.
    // Same payload-JSON state-table shape as the Phase 2 participation
    // records; natural key is the member alone (one pledge per member,
    // retraction is active:false, not a delete).
    db.exec(`
      CREATE TABLE seed_vault_pledges (
        member_key TEXT NOT NULL,
        id TEXT NOT NULL,
        signer_key TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        payload TEXT NOT NULL,
        signature TEXT NOT NULL,
        PRIMARY KEY (member_key)
      );
      CREATE INDEX seed_vault_pledges_updated_idx
        ON seed_vault_pledges (updated_at);
      CREATE INDEX seed_vault_pledges_signer_idx
        ON seed_vault_pledges (signer_key);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '21')",
    ).run();
  }

  if (current < 22) {
    // Member removal / reinstatement (docs/member-removal.md M1):
    // quorum-signed governance records. Payload-JSON shape like the
    // state tables; append-only (records compose by decidedAt, never
    // update). subject-key + decided_at indexes serve the membership
    // resolver's standing computation and the feed cursor.
    db.exec(`
      CREATE TABLE member_removals (
        id TEXT PRIMARY KEY,
        removed_key TEXT NOT NULL,
        decided_at INTEGER NOT NULL,
        node_id TEXT NOT NULL,
        payload TEXT NOT NULL
      );
      CREATE INDEX member_removals_decided_idx
        ON member_removals (decided_at);
      CREATE INDEX member_removals_key_idx
        ON member_removals (removed_key);
      CREATE TABLE member_reinstatements (
        id TEXT PRIMARY KEY,
        reinstated_key TEXT NOT NULL,
        decided_at INTEGER NOT NULL,
        node_id TEXT NOT NULL,
        payload TEXT NOT NULL
      );
      CREATE INDEX member_reinstatements_decided_idx
        ON member_reinstatements (decided_at);
      CREATE INDEX member_reinstatements_key_idx
        ON member_reinstatements (reinstated_key);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '22')",
    ).run();
  }

  if (current < 23) {
    // Proposal federation G1 (docs/proposal-federation.md): signed
    // proposals (immutable core), votes (single-owner LWW on the
    // natural key), and closures (first-writer-wins per proposal).
    db.exec(`
      CREATE TABLE proposals (
        id TEXT PRIMARY KEY,
        proposer_key TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        payload TEXT NOT NULL
      );
      CREATE INDEX proposals_created_idx ON proposals (created_at);
      CREATE INDEX proposals_proposer_idx ON proposals (proposer_key);
      CREATE TABLE votes (
        proposal_id TEXT NOT NULL,
        voter_key TEXT NOT NULL,
        id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        payload TEXT NOT NULL,
        PRIMARY KEY (proposal_id, voter_key)
      );
      CREATE INDEX votes_created_idx ON votes (created_at);
      CREATE INDEX votes_voter_idx ON votes (voter_key);
      CREATE TABLE proposal_closures (
        proposal_id TEXT PRIMARY KEY,
        id TEXT NOT NULL,
        closer_key TEXT NOT NULL,
        closed_at INTEGER NOT NULL,
        payload TEXT NOT NULL
      );
      CREATE INDEX proposal_closures_closed_idx
        ON proposal_closures (closed_at);
      CREATE INDEX proposal_closures_closer_idx
        ON proposal_closures (closer_key);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '23')",
    ).run();
  }

  if (current < 24) {
    // Composite cursors phase 2 (docs/composite-federation-cursors.md
    // §4.2): peer_pull_state gains one nullable id column per
    // existing timestamp cursor, so node↔node pullers can persist the
    // (timestamp, id) pair and send the exclusive pair cursor. NULL
    // means "legacy position" — the puller sends `since` alone (one
    // inclusive re-serve page, dedup no-ops) and writes the pair form
    // on its next successful pull. No data migration needed.
    db.exec(`
      ALTER TABLE peer_pull_state ADD COLUMN last_completed_id TEXT;
      ALTER TABLE peer_pull_state ADD COLUMN last_vouch_created_id TEXT;
      ALTER TABLE peer_pull_state ADD COLUMN last_post_created_id TEXT;
      ALTER TABLE peer_pull_state
        ADD COLUMN last_task_comment_created_id TEXT;
      ALTER TABLE peer_pull_state
        ADD COLUMN last_coorg_invitation_created_id TEXT;
      ALTER TABLE peer_pull_state
        ADD COLUMN last_coorg_invitation_response_decided_id TEXT;
      ALTER TABLE peer_pull_state
        ADD COLUMN last_coorg_invitation_revocation_revoked_id TEXT;
      ALTER TABLE peer_pull_state ADD COLUMN last_event_created_id TEXT;
      ALTER TABLE peer_pull_state
        ADD COLUMN last_event_cancellation_created_id TEXT;
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '24')",
    ).run();
  }

  // Schema v25 — the message relay (docs/message-relay.md). Sealed
  // direct-message envelopes: ciphertext only, E2E to the recipient;
  // the node stores routing metadata (sender, recipient, timestamps)
  // and can never read contents. Rows are pruned after the retention
  // window (MESSAGE_RETENTION_DAYS) — the shelf, not an archive — so
  // unlike every other federation table this one shrinks. The
  // recipient-scoped index is the read path: GET /messages serves
  // only rows whose recipient the caller has cryptographically
  // proven to be.
  if (current < 25) {
    db.exec(`
      CREATE TABLE messages (
        id TEXT PRIMARY KEY,
        sender_key TEXT NOT NULL,
        recipient_key TEXT NOT NULL,
        nonce TEXT NOT NULL,
        ciphertext TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX messages_recipient_created_idx
        ON messages (recipient_key, created_at);
      CREATE INDEX messages_created_at_idx ON messages (created_at);
      CREATE INDEX messages_sender_idx ON messages (sender_key);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '25')",
    ).run();
  }
}

/**
 * Shared federation-feed page query — the composite `(timestamp, id)`
 * cursor from `docs/composite-federation-cursors.md` §2.
 *
 * Ordering is always `tsExpr ASC, idCol ASC`. Three cursor modes:
 *
 *   - `since` + `sinceId`: EXCLUSIVE pair cursor — strictly after the
 *     `(since, sinceId)` position: `(ts > since) OR (ts = since AND
 *     id > sinceId)`. The pair pins a total position in the feed, so
 *     pagination can never re-serve or skip within a timestamp tie,
 *     regardless of tie size. This closes the round-3 "KNOWN LIMIT"
 *     wedge: with a bare-timestamp cursor, more than `limit` rows
 *     sharing one millisecond re-served the same lowest-id page
 *     forever.
 *   - `since` alone: the legacy INCLUSIVE `>=` cursor, byte-for-byte
 *     the old behavior — old pullers keep working, and the wedge
 *     remains only for them (still unreachable through normal
 *     one-at-a-time writes).
 *   - neither: first page from the beginning of the feed.
 *
 * `tsExpr` may be a SQL expression (task comments cursor on
 * `MAX(created_at, COALESCE(deleted_at, 0))` so tombstones re-enter
 * the window). `idCol` is the signed-payload id / primary key of the
 * store (`token` for redemptions + invite revocations, `post_id` for
 * claims) — nothing new for a malicious node to choose that it could
 * not already choose. Both arguments are compile-time constants at
 * every call site, never user input.
 */
function pagedRows<Row>(
  db: DatabaseType,
  table: string,
  tsExpr: string,
  idCol: string,
  {
    since,
    sinceId,
    limit,
  }: { since?: number; sinceId?: string; limit?: number } = {},
): Row[] {
  const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
  const order = `ORDER BY ${tsExpr} ASC, ${idCol} ASC LIMIT ?`;
  if (since && sinceId) {
    return db
      .prepare(
        `SELECT * FROM ${table}
         WHERE (${tsExpr} > ?) OR (${tsExpr} = ? AND ${idCol} > ?)
         ${order}`,
      )
      .all(since, since, sinceId, safeLimit) as Row[];
  }
  if (since) {
    return db
      .prepare(
        `SELECT * FROM ${table} WHERE ${tsExpr} >= ? ${order}`,
      )
      .all(since, safeLimit) as Row[];
  }
  return db.prepare(`SELECT * FROM ${table} ${order}`).all(safeLimit) as Row[];
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

    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<ExchangeRow>(
        db,
        "exchanges",
        "completed_at",
        "id",
        opts,
      ).map(rowToExchange);
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
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<VouchRow>(
        db,
        "vouches",
        "created_at",
        "id",
        opts,
      ).map(rowToVouch);
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

export function createMessageStore(db: DatabaseType): MessageStore {
  const insertStmt = db.prepare(`
    INSERT INTO messages (
      id, sender_key, recipient_key, nonce, ciphertext, created_at,
      signature
    ) VALUES (
      @id, @senderKey, @recipientKey, @nonce, @ciphertext, @createdAt,
      @signature
    )
  `);
  const hasStmt = db.prepare("SELECT 1 FROM messages WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM messages");
  const pruneStmt = db.prepare("DELETE FROM messages WHERE created_at < ?");
  // Recipient-scoped page queries — pagedRows' cursor contract
  // (docs/composite-federation-cursors.md §2: ASC ordering, exclusive
  // pair cursor, inclusive legacy `since`) with a recipient_key
  // predicate in front. pagedRows itself can't express the extra
  // WHERE, so the three cursor modes are spelled out.
  const pageBase = `
    SELECT * FROM messages WHERE recipient_key = @recipientKey
  `;
  const pageOrder = "ORDER BY created_at ASC, id ASC LIMIT @limit";
  const pagePairStmt = db.prepare(`
    ${pageBase}
      AND ((created_at > @since) OR (created_at = @since AND id > @sinceId))
    ${pageOrder}
  `);
  const pageSinceStmt = db.prepare(`
    ${pageBase} AND created_at >= @since ${pageOrder}
  `);
  const pageAllStmt = db.prepare(`${pageBase} ${pageOrder}`);

  return {
    insert(message) {
      insertStmt.run({
        id: message.id,
        senderKey: message.senderKey,
        recipientKey: message.recipientKey,
        nonce: message.nonce,
        ciphertext: message.ciphertext,
        createdAt: message.createdAt,
        signature: message.signature,
      });
    },
    listForRecipient(recipientKey, opts = {}) {
      const limit = Math.max(1, Math.min(opts.limit ?? 200, 1000));
      let rows: MessageRow[];
      if (opts.since && opts.sinceId) {
        rows = pagePairStmt.all({
          recipientKey,
          since: opts.since,
          sinceId: opts.sinceId,
          limit,
        }) as MessageRow[];
      } else if (opts.since) {
        rows = pageSinceStmt.all({
          recipientKey,
          since: opts.since,
          limit,
        }) as MessageRow[];
      } else {
        rows = pageAllStmt.all({ recipientKey, limit }) as MessageRow[];
      }
      return rows.map(rowToMessage);
    },
    count() {
      const r = countStmt.get() as { n: number };
      return r.n;
    },
    has(id) {
      return hasStmt.get(id) !== undefined;
    },
    pruneOlderThan(cutoff) {
      return pruneStmt.run(cutoff).changes;
    },
  };
}

interface MessageRow {
  id: string;
  sender_key: string;
  recipient_key: string;
  nonce: string;
  ciphertext: string;
  created_at: number;
  signature: string;
}

function rowToMessage(r: MessageRow): RelayedMessage {
  return {
    id: r.id,
    senderKey: r.sender_key,
    recipientKey: r.recipient_key,
    nonce: r.nonce,
    ciphertext: r.ciphertext,
    createdAt: r.created_at,
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
  const getStmt = db.prepare("SELECT * FROM posts WHERE id = ?");
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
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<PostRowSqlite>(
        db,
        "posts",
        "created_at",
        "id",
        opts,
      ).map(rowToPost);
    },
    count() {
      const r = countStmt.get() as { n: number };
      return r.n;
    },
    has(id) {
      return hasStmt.get(id) !== undefined;
    },
    get(id) {
      const row = getStmt.get(id) as PostRowSqlite | undefined;
      return row ? rowToPost(row) : null;
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
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<TaskCommentRowSqlite>(
        db,
        "task_comments",
        "MAX(created_at, COALESCE(deleted_at, 0))",
        "id",
        opts,
      ).map(rowToTaskComment);
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
  // One parameterized success statement per kind, generated from the
  // cursor-column map. Each updates its (timestamp, id) pair cursor
  // ATOMICALLY: when the pull consumed nothing (@latestSeenAt NULL)
  // both halves keep their existing values; when it consumed rows,
  // both halves take the new position together. A pair whose halves
  // disagreed would skip or re-serve rows at the boundary.
  //
  // Note: success deliberately does NOT clear `last_error`. The pulls
  // for the same peer run in parallel each tick, and clearing
  // `last_error` on success would race with a concurrent failure
  // update, hiding the failure. The accepted trade is that
  // `last_error` may hold a stale message after a peer recovers;
  // operators can read `last_success_at` vs. `last_pulled_at` to tell
  // whether the most recent attempt succeeded. Per-kind error columns
  // are a future refinement.
  const KIND_CURSOR_COLUMNS: Record<
    PullRecordKind,
    { ts: string; id: string; notNull?: boolean }
  > = {
    exchange: { ts: "last_completed_at", id: "last_completed_id" },
    vouch: { ts: "last_vouch_created_at", id: "last_vouch_created_id" },
    post: { ts: "last_post_created_at", id: "last_post_created_id" },
    task_comment: {
      ts: "last_task_comment_created_at",
      id: "last_task_comment_created_id",
    },
    coorg_invitation: {
      ts: "last_coorg_invitation_created_at",
      id: "last_coorg_invitation_created_id",
    },
    coorg_invitation_response: {
      ts: "last_coorg_invitation_response_decided_at",
      id: "last_coorg_invitation_response_decided_id",
    },
    coorg_invitation_revocation: {
      ts: "last_coorg_invitation_revocation_revoked_at",
      id: "last_coorg_invitation_revocation_revoked_id",
    },
    // The event columns are NOT NULL DEFAULT 0 (v10), so first insert
    // coalesces the timestamp to 0 instead of NULL.
    event: {
      ts: "last_event_created_at",
      id: "last_event_created_id",
      notNull: true,
    },
    event_cancellation: {
      ts: "last_event_cancellation_created_at",
      id: "last_event_cancellation_created_id",
      notNull: true,
    },
  };
  const successStmts = Object.fromEntries(
    Object.entries(KIND_CURSOR_COLUMNS).map(([kind, col]) => [
      kind,
      db.prepare(`
        INSERT INTO peer_pull_state (
          peer_url, last_pulled_at, last_success_at,
          ${col.ts}, ${col.id}, last_pulled_count
        ) VALUES (
          @peerUrl, @at, @at,
          ${col.notNull ? "COALESCE(@latestSeenAt, 0)" : "@latestSeenAt"},
          @latestSeenId, @pulledCount
        )
        ON CONFLICT(peer_url) DO UPDATE SET
          last_pulled_at = @at,
          last_success_at = @at,
          ${col.ts} = COALESCE(@latestSeenAt, ${col.ts}),
          ${col.id} = CASE
            WHEN @latestSeenAt IS NOT NULL THEN @latestSeenId
            ELSE ${col.id}
          END,
          last_pulled_count = @pulledCount
      `),
    ]),
  ) as Record<PullRecordKind, ReturnType<DatabaseType["prepare"]>>;
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
    recordSuccess({ peerUrl, kind, at, latestSeenAt, latestSeenId, pulledCount }) {
      successStmts[kind].run({
        peerUrl,
        at,
        latestSeenAt,
        // Never persist an id without its timestamp — the halves move
        // together or not at all.
        latestSeenId: latestSeenAt === null ? null : latestSeenId,
        pulledCount,
      });
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
  last_completed_id: string | null;
  last_vouch_created_id: string | null;
  last_post_created_id: string | null;
  last_task_comment_created_id: string | null;
  last_coorg_invitation_created_id: string | null;
  last_coorg_invitation_response_decided_id: string | null;
  last_coorg_invitation_revocation_revoked_id: string | null;
  last_event_created_id: string | null;
  last_event_cancellation_created_id: string | null;
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
    lastCompletedId: r.last_completed_id,
    lastVouchCreatedId: r.last_vouch_created_id,
    lastPostCreatedId: r.last_post_created_id,
    lastTaskCommentCreatedId: r.last_task_comment_created_id,
    lastCoOrgInvitationCreatedId: r.last_coorg_invitation_created_id,
    lastCoOrgInvitationResponseDecidedId:
      r.last_coorg_invitation_response_decided_id,
    lastCoOrgInvitationRevocationRevokedId:
      r.last_coorg_invitation_revocation_revoked_id,
    lastEventCreatedId: r.last_event_created_id,
    lastEventCancellationCreatedId: r.last_event_cancellation_created_id,
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
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<RedemptionRowSqlite>(
        db,
        "redemptions",
        "received_at",
        "token",
        opts,
      ).map(rowToRedemption);
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

export function createAwaitingTransitionStore(
  db: DatabaseType,
): AwaitingTransitionStore {
  // INSERT OR IGNORE = first-writer-wins on post_id. A retry, an
  // outbox redelivery, or the second party attesting the same pending
  // exchange is an idempotent no-op — nothing can reset the
  // received_at age anchor once the node has one.
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO awaiting_transitions (
      post_id, helper_key, helped_key, signed_by,
      entered_at, node_id, signature, received_at
    ) VALUES (
      @postId, @helperKey, @helpedKey, @signedBy,
      @enteredAt, @nodeId, @signature, @receivedAt
    )
  `);
  const getStmt = db.prepare(
    "SELECT * FROM awaiting_transitions WHERE post_id = ?",
  );
  const countStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM awaiting_transitions",
  );

  interface Row {
    post_id: string;
    helper_key: string;
    helped_key: string;
    signed_by: string;
    entered_at: number;
    node_id: string;
    signature: string;
    received_at: number;
  }

  return {
    insert(record, receivedAt) {
      const info = insertStmt.run({
        postId: record.postId,
        helperKey: record.helperKey,
        helpedKey: record.helpedKey,
        signedBy: record.signedBy,
        enteredAt: record.enteredAt,
        nodeId: record.nodeId,
        signature: record.signature,
        receivedAt,
      });
      return info.changes > 0;
    },
    getByPostId(postId) {
      const r = getStmt.get(postId) as Row | undefined;
      if (!r) return null;
      return {
        record: {
          kind: "awaiting_transition",
          postId: r.post_id,
          helperKey: r.helper_key,
          helpedKey: r.helped_key,
          signedBy: r.signed_by,
          enteredAt: r.entered_at,
          nodeId: r.node_id,
          signature: r.signature,
        },
        receivedAt: r.received_at,
      };
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
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
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<InviteRevocationRowSqlite>(
        db,
        "invite_revocations",
        "received_at",
        "token",
        opts,
      ).map(rowToInviteRevocation);
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
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<ClaimRow>(
        db,
        "claims",
        "claimed_at",
        "post_id",
        opts,
      ).map(rowToClaim);
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
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<CoOrganizerInvitationRowSqlite>(
        db,
        "coorg_invitations",
        "created_at",
        "id",
        opts,
      ).map(rowToCoOrganizerInvitation);
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
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<CoOrganizerInvitationResponseRowSqlite>(
        db,
        "coorg_invitation_responses",
        "decided_at",
        "id",
        opts,
      ).map(rowToCoOrganizerInvitationResponse);
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
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<CoOrganizerInvitationRevocationRowSqlite>(
        db,
        "coorg_invitation_revocations",
        "revoked_at",
        "id",
        opts,
      ).map(rowToCoOrganizerInvitationRevocation);
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
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<EventRowSqlite>(
        db,
        "events",
        "created_at",
        "id",
        opts,
      ).map(rowToEvent);
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
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<EventCancellationRowSqlite>(
        db,
        "event_cancellations",
        "cancelled_at",
        "id",
        opts,
      ).map(rowToEventCancellation);
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

// --- Device-link mailbox (docs/device-pairing.md §6.6) ---------------
//
// The node's ONLY role in device linking is dumb ciphertext relay:
// it stores a passphrase-wrapped TransferEnvelope under an opaque
// channel id for up to the TTL, hands it out exactly once, and
// forgets it. No signatures, no federation, no reads into the blob.

export interface DeviceLinkStore {
  /** Insert a fresh mailbox row. Throws on duplicate channel id (the
   *  caller maps that to 409 — codes are freshly random per attempt,
   *  so a collision in practice means replay, not accident). */
  insert(row: {
    channelId: string;
    envelope: string;
    createdAt: number;
    expiresAt: number;
  }): void;
  /** One-shot read: returns the envelope AND deletes the row, or
   *  null when absent/expired (expired rows are deleted on the way
   *  out too). Atomic so two racing GETs can't both win. */
  take(channelId: string, now: number): string | null;
  /** Delete every expired row. Called on each insert so the table
   *  can't accumulate stale ciphertext. */
  pruneExpired(now: number): void;
  count(): number;
}

export function createDeviceLinkStore(db: DatabaseType): DeviceLinkStore {
  const insertStmt = db.prepare(`
    INSERT INTO device_link_blobs (channel_id, envelope, created_at, expires_at)
    VALUES (@channelId, @envelope, @createdAt, @expiresAt)
  `);
  const getStmt = db.prepare(
    "SELECT envelope, expires_at FROM device_link_blobs WHERE channel_id = ?",
  );
  const deleteStmt = db.prepare(
    "DELETE FROM device_link_blobs WHERE channel_id = ?",
  );
  const pruneStmt = db.prepare(
    "DELETE FROM device_link_blobs WHERE expires_at < ?",
  );
  const countStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM device_link_blobs",
  );

  const takeTx = db.transaction((channelId: string, now: number) => {
    const row = getStmt.get(channelId) as
      | { envelope: string; expires_at: number }
      | undefined;
    if (!row) return null;
    // Expired or fresh, the row is consumed either way — a stale
    // mailbox is never left behind for a later guess.
    deleteStmt.run(channelId);
    return row.expires_at < now ? null : row.envelope;
  });

  return {
    insert(row) {
      insertStmt.run(row);
    },
    take(channelId, now) {
      return takeTx(channelId, now) as string | null;
    },
    pruneExpired(now) {
      pruneStmt.run(now);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

// --- Link-request rendezvous (docs/device-pairing.md §6.7) -----------

export interface LinkRequestRow {
  pubkey: string;
  createdAt: number;
}

export interface LinkRequestStore {
  /** Insert a fresh request. Throws on duplicate pubkey. */
  insert(row: {
    pubkey: string;
    bucket: string;
    cancelToken: string;
    createdAt: number;
    expiresAt: number;
  }): void;
  /** Live (unexpired) requests for one bucket, newest first. Only
   *  pubkey + createdAt leave the store — the bucket and cancel
   *  token never appear in any response body. */
  listByBucket(bucket: string, now: number): LinkRequestRow[];
  /** Creator-only withdrawal: deletes iff the cancel token matches.
   *  Returns whether a row was removed. */
  remove(pubkey: string, cancelToken: string): boolean;
  /** Unconditional delete (route-internal use on grant completion is
   *  NOT done server-side — the requester cancels; this exists for
   *  prune symmetry and tests). */
  pruneExpired(now: number): void;
  countByBucket(bucket: string, now: number): number;
  count(): number;
}

export function createLinkRequestStore(db: DatabaseType): LinkRequestStore {
  const insertStmt = db.prepare(`
    INSERT INTO link_requests (pubkey, bucket, cancel_token, created_at, expires_at)
    VALUES (@pubkey, @bucket, @cancelToken, @createdAt, @expiresAt)
  `);
  const listStmt = db.prepare(`
    SELECT pubkey, created_at FROM link_requests
    WHERE bucket = ? AND expires_at >= ?
    ORDER BY created_at DESC
  `);
  const removeStmt = db.prepare(
    "DELETE FROM link_requests WHERE pubkey = ? AND cancel_token = ?",
  );
  const pruneStmt = db.prepare(
    "DELETE FROM link_requests WHERE expires_at < ?",
  );
  const countBucketStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM link_requests WHERE bucket = ? AND expires_at >= ?",
  );
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM link_requests");

  return {
    insert(row) {
      insertStmt.run(row);
    },
    listByBucket(bucket, now) {
      return (
        listStmt.all(bucket, now) as Array<{
          pubkey: string;
          created_at: number;
        }>
      ).map((r) => ({ pubkey: r.pubkey, createdAt: r.created_at }));
    },
    remove(pubkey, cancelToken) {
      return removeStmt.run(pubkey, cancelToken).changes > 0;
    },
    pruneExpired(now) {
      pruneStmt.run(now);
    },
    countByBucket(bucket, now) {
      return (countBucketStmt.get(bucket, now) as { n: number }).n;
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

// --- Project & participation federation (docs/project-federation.md) --
//
// Unlike every append-only store above, these two hold MUTABLE state:
// the route REPLACES a row when a strictly-newer signed version passes
// the authority rules. The store itself is deliberately dumb — get /
// upsert / list — so all authority logic lives (and is tested) in one
// place, the route handler.

export interface ProjectStateStore {
  get(id: string): ProjectState | null;
  /** INSERT OR REPLACE by id. The route decides whether to call this
   *  (LWW + authority checks) — the store never compares versions. */
  upsert(record: ProjectState): void;
  list(opts?: {
    since?: number;
    sinceId?: string;
    limit?: number;
  }): ProjectState[];
  count(): number;
}

export function createProjectStateStore(db: DatabaseType): ProjectStateStore {
  const upsertStmt = db.prepare(`
    INSERT OR REPLACE INTO project_states (
      id, organizer_key, signer_key, updated_at, node_id,
      payload, signature
    ) VALUES (
      @id, @organizerKey, @signerKey, @updatedAt, @nodeId,
      @payload, @signature
    )
  `);
  const getStmt = db.prepare("SELECT * FROM project_states WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM project_states");

  return {
    get(id) {
      const r = getStmt.get(id) as ProjectStateRowSqlite | undefined;
      return r ? rowToProjectState(r) : null;
    },
    upsert(record) {
      upsertStmt.run({
        id: record.id,
        organizerKey: record.organizerKey,
        signerKey: record.signerKey,
        updatedAt: record.updatedAt,
        nodeId: record.nodeId,
        payload: JSON.stringify(record),
        signature: record.signature,
      });
    },
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md). Cursor is
      // `updated_at`: an updated row re-enters every puller's window,
      // which is exactly the LWW propagation we want.
      return pagedRows<ProjectStateRowSqlite>(
        db,
        "project_states",
        "updated_at",
        "id",
        opts,
      ).map(rowToProjectState);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

interface ProjectStateRowSqlite {
  id: string;
  organizer_key: string;
  signer_key: string;
  updated_at: number;
  node_id: string;
  payload: string;
  signature: string;
}

function rowToProjectState(r: ProjectStateRowSqlite): ProjectState {
  return JSON.parse(r.payload) as ProjectState;
}

export interface TaskStateStore {
  get(id: string): TaskState | null;
  /** INSERT OR REPLACE by id — same contract as ProjectStateStore. */
  upsert(record: TaskState): void;
  list(opts?: {
    since?: number;
    sinceId?: string;
    limit?: number;
  }): TaskState[];
  count(): number;
}

export function createTaskStateStore(db: DatabaseType): TaskStateStore {
  const upsertStmt = db.prepare(`
    INSERT OR REPLACE INTO task_states (
      id, project_id, signer_key, updated_at, payload, signature
    ) VALUES (
      @id, @projectId, @signerKey, @updatedAt, @payload, @signature
    )
  `);
  const getStmt = db.prepare("SELECT * FROM task_states WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM task_states");

  return {
    get(id) {
      const r = getStmt.get(id) as TaskStateRowSqlite | undefined;
      return r ? rowToTaskState(r) : null;
    },
    upsert(record) {
      upsertStmt.run({
        id: record.id,
        projectId: record.projectId,
        signerKey: record.signerKey,
        updatedAt: record.updatedAt,
        payload: JSON.stringify(record),
        signature: record.signature,
      });
    },
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md).
      return pagedRows<TaskStateRowSqlite>(
        db,
        "task_states",
        "updated_at",
        "id",
        opts,
      ).map(rowToTaskState);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

interface TaskStateRowSqlite {
  id: string;
  project_id: string;
  signer_key: string;
  updated_at: number;
  payload: string;
  signature: string;
}

function rowToTaskState(r: TaskStateRowSqlite): TaskState {
  return JSON.parse(r.payload) as TaskState;
}

// --- Participation federation Phase 2 (docs/project-federation.md §6) -

export interface EventRsvpStateStore {
  /** Lookup by the NATURAL key — the identity of an RSVP. */
  get(eventId: string, memberKey: string): EventRsvpState | null;
  /** INSERT OR REPLACE by (eventId, memberKey). The route decides
   *  whether to call this — the store never compares versions. */
  upsert(record: EventRsvpState): void;
  list(opts?: {
    since?: number;
    sinceId?: string;
    limit?: number;
  }): EventRsvpState[];
  count(): number;
}

export function createEventRsvpStateStore(
  db: DatabaseType,
): EventRsvpStateStore {
  const upsertStmt = db.prepare(`
    INSERT OR REPLACE INTO event_rsvps (
      event_id, member_key, id, signer_key, updated_at, payload, signature
    ) VALUES (
      @eventId, @memberKey, @id, @signerKey, @updatedAt, @payload, @signature
    )
  `);
  const getStmt = db.prepare(
    "SELECT * FROM event_rsvps WHERE event_id = ? AND member_key = ?",
  );
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM event_rsvps");

  return {
    get(eventId, memberKey) {
      const r = getStmt.get(eventId, memberKey) as
        | StateRowSqlite
        | undefined;
      return r ? (JSON.parse(r.payload) as EventRsvpState) : null;
    },
    upsert(record) {
      upsertStmt.run({
        eventId: record.eventId,
        memberKey: record.memberKey,
        id: record.id,
        signerKey: record.signerKey,
        updatedAt: record.updatedAt,
        payload: JSON.stringify(record),
        signature: record.signature,
      });
    },
    list(opts = {}) {
      // Composite-cursor paging — ordering + cursor rationale on
      // pagedRows (docs/composite-federation-cursors.md). `id` is the
      // tie-break column only; identity is the natural key.
      return pagedRows<StateRowSqlite>(
        db,
        "event_rsvps",
        "updated_at",
        "id",
        opts,
      ).map((r) => JSON.parse(r.payload) as EventRsvpState);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

export interface EventShiftStateStore {
  get(id: string): EventShiftState | null;
  upsert(record: EventShiftState): void;
  list(opts?: {
    since?: number;
    sinceId?: string;
    limit?: number;
  }): EventShiftState[];
  count(): number;
}

export function createEventShiftStateStore(
  db: DatabaseType,
): EventShiftStateStore {
  const upsertStmt = db.prepare(`
    INSERT OR REPLACE INTO event_shifts (
      id, event_id, signer_key, updated_at, payload, signature
    ) VALUES (
      @id, @eventId, @signerKey, @updatedAt, @payload, @signature
    )
  `);
  const getStmt = db.prepare("SELECT * FROM event_shifts WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM event_shifts");

  return {
    get(id) {
      const r = getStmt.get(id) as StateRowSqlite | undefined;
      return r ? (JSON.parse(r.payload) as EventShiftState) : null;
    },
    upsert(record) {
      upsertStmt.run({
        id: record.id,
        eventId: record.eventId,
        signerKey: record.signerKey,
        updatedAt: record.updatedAt,
        payload: JSON.stringify(record),
        signature: record.signature,
      });
    },
    list(opts = {}) {
      // Composite-cursor paging — see pagedRows. Tombstoned shifts
      // stay in the feed (deletedAt in the payload): the removal must
      // reach every puller, exactly like a task-comment tombstone.
      return pagedRows<StateRowSqlite>(
        db,
        "event_shifts",
        "updated_at",
        "id",
        opts,
      ).map((r) => JSON.parse(r.payload) as EventShiftState);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

export interface ShiftSignupStateStore {
  get(shiftId: string, memberKey: string): ShiftSignupState | null;
  upsert(record: ShiftSignupState): void;
  list(opts?: {
    since?: number;
    sinceId?: string;
    limit?: number;
  }): ShiftSignupState[];
  count(): number;
}

export function createShiftSignupStateStore(
  db: DatabaseType,
): ShiftSignupStateStore {
  const upsertStmt = db.prepare(`
    INSERT OR REPLACE INTO shift_signups (
      shift_id, member_key, id, event_id, signer_key, updated_at,
      payload, signature
    ) VALUES (
      @shiftId, @memberKey, @id, @eventId, @signerKey, @updatedAt,
      @payload, @signature
    )
  `);
  const getStmt = db.prepare(
    "SELECT * FROM shift_signups WHERE shift_id = ? AND member_key = ?",
  );
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM shift_signups");

  return {
    get(shiftId, memberKey) {
      const r = getStmt.get(shiftId, memberKey) as
        | StateRowSqlite
        | undefined;
      return r ? (JSON.parse(r.payload) as ShiftSignupState) : null;
    },
    upsert(record) {
      upsertStmt.run({
        shiftId: record.shiftId,
        memberKey: record.memberKey,
        id: record.id,
        eventId: record.eventId,
        signerKey: record.signerKey,
        updatedAt: record.updatedAt,
        payload: JSON.stringify(record),
        signature: record.signature,
      });
    },
    list(opts = {}) {
      // Composite-cursor paging — see pagedRows. Withdrawal tombstones
      // stay in the feed for the same reason as shift tombstones.
      return pagedRows<StateRowSqlite>(
        db,
        "shift_signups",
        "updated_at",
        "id",
        opts,
      ).map((r) => JSON.parse(r.payload) as ShiftSignupState);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

export interface SeedVaultPledgeStore {
  /** Lookup by the natural key — one pledge per member. */
  get(memberKey: string): SeedVaultPledge | null;
  /** INSERT OR REPLACE by memberKey. The route decides whether to
   *  call this — the store never compares versions. */
  upsert(record: SeedVaultPledge): void;
  list(opts?: {
    since?: number;
    sinceId?: string;
    limit?: number;
  }): SeedVaultPledge[];
  count(): number;
}

export function createSeedVaultPledgeStore(
  db: DatabaseType,
): SeedVaultPledgeStore {
  const upsertStmt = db.prepare(`
    INSERT OR REPLACE INTO seed_vault_pledges (
      member_key, id, signer_key, updated_at, payload, signature
    ) VALUES (
      @memberKey, @id, @signerKey, @updatedAt, @payload, @signature
    )
  `);
  const getStmt = db.prepare(
    "SELECT * FROM seed_vault_pledges WHERE member_key = ?",
  );
  const countStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM seed_vault_pledges",
  );

  return {
    get(memberKey) {
      const r = getStmt.get(memberKey) as StateRowSqlite | undefined;
      return r ? (JSON.parse(r.payload) as SeedVaultPledge) : null;
    },
    upsert(record) {
      upsertStmt.run({
        memberKey: record.memberKey,
        id: record.id,
        signerKey: record.signerKey,
        updatedAt: record.updatedAt,
        payload: JSON.stringify(record),
        signature: record.signature,
      });
    },
    list(opts = {}) {
      // Composite-cursor paging — see pagedRows. Retractions
      // (active:false) stay in the feed so they keep winning LWW on
      // every puller.
      return pagedRows<StateRowSqlite>(
        db,
        "seed_vault_pledges",
        "updated_at",
        "id",
        opts,
      ).map((r) => JSON.parse(r.payload) as SeedVaultPledge);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

export interface MemberRemovalStore {
  get(id: string): MemberRemoval | null;
  insert(record: MemberRemoval): void;
  list(opts?: {
    since?: number;
    sinceId?: string;
    limit?: number;
  }): MemberRemoval[];
  count(): number;
}

export interface MemberReinstatementStore {
  get(id: string): MemberReinstatement | null;
  insert(record: MemberReinstatement): void;
  list(opts?: {
    since?: number;
    sinceId?: string;
    limit?: number;
  }): MemberReinstatement[];
  count(): number;
}

export function createMemberRemovalStore(
  db: DatabaseType,
): MemberRemovalStore {
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO member_removals (
      id, removed_key, decided_at, node_id, payload
    ) VALUES (@id, @removedKey, @decidedAt, @nodeId, @payload)
  `);
  const getStmt = db.prepare("SELECT * FROM member_removals WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM member_removals");
  return {
    get(id) {
      const r = getStmt.get(id) as { payload: string } | undefined;
      return r ? (JSON.parse(r.payload) as MemberRemoval) : null;
    },
    insert(record) {
      insertStmt.run({
        id: record.id,
        removedKey: record.removedKey,
        decidedAt: record.decidedAt,
        nodeId: record.nodeId,
        payload: JSON.stringify(record),
      });
    },
    list(opts = {}) {
      return pagedRows<{ payload: string }>(
        db,
        "member_removals",
        "decided_at",
        "id",
        opts,
      ).map((r) => JSON.parse(r.payload) as MemberRemoval);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

export function createMemberReinstatementStore(
  db: DatabaseType,
): MemberReinstatementStore {
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO member_reinstatements (
      id, reinstated_key, decided_at, node_id, payload
    ) VALUES (@id, @reinstatedKey, @decidedAt, @nodeId, @payload)
  `);
  const getStmt = db.prepare(
    "SELECT * FROM member_reinstatements WHERE id = ?",
  );
  const countStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM member_reinstatements",
  );
  return {
    get(id) {
      const r = getStmt.get(id) as { payload: string } | undefined;
      return r ? (JSON.parse(r.payload) as MemberReinstatement) : null;
    },
    insert(record) {
      insertStmt.run({
        id: record.id,
        reinstatedKey: record.reinstatedKey,
        decidedAt: record.decidedAt,
        nodeId: record.nodeId,
        payload: JSON.stringify(record),
      });
    },
    list(opts = {}) {
      return pagedRows<{ payload: string }>(
        db,
        "member_reinstatements",
        "decided_at",
        "id",
        opts,
      ).map((r) => JSON.parse(r.payload) as MemberReinstatement);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

export interface ProposalStore {
  get(id: string): Proposal | null;
  insert(record: Proposal): void;
  list(opts?: { since?: number; sinceId?: string; limit?: number }): Proposal[];
  count(): number;
}

export function createProposalStore(db: DatabaseType): ProposalStore {
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO proposals (id, proposer_key, created_at, payload)
    VALUES (@id, @proposerKey, @createdAt, @payload)
  `);
  const getStmt = db.prepare("SELECT * FROM proposals WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM proposals");
  return {
    get(id) {
      const r = getStmt.get(id) as { payload: string } | undefined;
      return r ? (JSON.parse(r.payload) as Proposal) : null;
    },
    insert(record) {
      // The stored wire form is the IMMUTABLE core — lifecycle fields
      // live in proposal_closures, so strip any the sender included.
      const { status: _s, closedAt: _c, closedReason: _r, ...core } =
        record as Proposal & Record<string, unknown>;
      insertStmt.run({
        id: record.id,
        proposerKey: record.proposerKey,
        createdAt: record.createdAt,
        payload: JSON.stringify(core),
      });
    },
    list(opts = {}) {
      return pagedRows<{ payload: string }>(
        db,
        "proposals",
        "created_at",
        "id",
        opts,
      ).map((r) => JSON.parse(r.payload) as Proposal);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

export interface VoteStore {
  get(proposalId: string, voterKey: string): Vote | null;
  upsert(record: Vote): void;
  list(opts?: { since?: number; sinceId?: string; limit?: number }): Vote[];
  /** Every stored vote for one proposal (latest per voter by table
   *  construction) — the closure block-guard's input. */
  listForProposal(proposalId: string): Vote[];
  count(): number;
}

export function createVoteStore(db: DatabaseType): VoteStore {
  const upsertStmt = db.prepare(`
    INSERT OR REPLACE INTO votes (proposal_id, voter_key, id, created_at, payload)
    VALUES (@proposalId, @voterKey, @id, @createdAt, @payload)
  `);
  const getStmt = db.prepare(
    "SELECT * FROM votes WHERE proposal_id = ? AND voter_key = ?",
  );
  const forProposalStmt = db.prepare(
    "SELECT payload FROM votes WHERE proposal_id = ?",
  );
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM votes");
  return {
    get(proposalId, voterKey) {
      const r = getStmt.get(proposalId, voterKey) as
        | { payload: string }
        | undefined;
      return r ? (JSON.parse(r.payload) as Vote) : null;
    },
    upsert(record) {
      upsertStmt.run({
        proposalId: record.proposalId,
        voterKey: record.voterKey,
        id: record.id,
        createdAt: record.createdAt,
        payload: JSON.stringify(record),
      });
    },
    list(opts = {}) {
      return pagedRows<{ payload: string }>(
        db,
        "votes",
        "created_at",
        "id",
        opts,
      ).map((r) => JSON.parse(r.payload) as Vote);
    },
    listForProposal(proposalId) {
      return (forProposalStmt.all(proposalId) as { payload: string }[]).map(
        (r) => JSON.parse(r.payload) as Vote,
      );
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

export interface ProposalClosureStore {
  getByProposal(proposalId: string): ProposalClosure | null;
  insert(record: ProposalClosure): void;
  list(opts?: {
    since?: number;
    sinceId?: string;
    limit?: number;
  }): ProposalClosure[];
  count(): number;
}

export function createProposalClosureStore(
  db: DatabaseType,
): ProposalClosureStore {
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO proposal_closures (
      proposal_id, id, closer_key, closed_at, payload
    ) VALUES (@proposalId, @id, @closerKey, @closedAt, @payload)
  `);
  const getStmt = db.prepare(
    "SELECT * FROM proposal_closures WHERE proposal_id = ?",
  );
  const countStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM proposal_closures",
  );
  return {
    getByProposal(proposalId) {
      const r = getStmt.get(proposalId) as { payload: string } | undefined;
      return r ? (JSON.parse(r.payload) as ProposalClosure) : null;
    },
    insert(record) {
      insertStmt.run({
        proposalId: record.proposalId,
        id: record.id,
        closerKey: record.closerKey,
        closedAt: record.closedAt,
        payload: JSON.stringify(record),
      });
    },
    list(opts = {}) {
      return pagedRows<{ payload: string }>(
        db,
        "proposal_closures",
        "closed_at",
        "id",
        opts,
      ).map((r) => JSON.parse(r.payload) as ProposalClosure);
    },
    count() {
      return (countStmt.get() as { n: number }).n;
    },
  };
}

/** Shared row shape for the Phase 2 payload-JSON state tables — only
 *  the columns every reader touches; the payload is the truth. */
interface StateRowSqlite {
  id: string;
  updated_at: number;
  payload: string;
  signature: string;
}

// ---------------------------------------------------------------------------
// Mirror-pull cursor store (schema v20, docs/community-resilience.md §B.1)

export interface MirrorPullStore {
  /** The worker's `(last_ts, last_id)` high-water mark for one
   *  (mirror, kind) — null before the first successful page. */
  get(mirrorUrl: string, kind: string): { lastTs: number; lastId: string } | null;
  set(mirrorUrl: string, kind: string, lastTs: number, lastId: string): void;
}

export function createMirrorPullStore(db: DatabaseType): MirrorPullStore {
  const getStmt = db.prepare(
    "SELECT last_ts, last_id FROM mirror_pull_state WHERE mirror_url = ? AND kind = ?",
  );
  const setStmt = db.prepare(`
    INSERT OR REPLACE INTO mirror_pull_state (mirror_url, kind, last_ts, last_id)
    VALUES (?, ?, ?, ?)
  `);
  return {
    get(mirrorUrl, kind) {
      const r = getStmt.get(mirrorUrl, kind) as
        | { last_ts: number; last_id: string }
        | undefined;
      return r ? { lastTs: r.last_ts, lastId: r.last_id } : null;
    },
    set(mirrorUrl, kind, lastTs, lastId) {
      setStmt.run(mirrorUrl, kind, lastTs, lastId);
    },
  };
}
