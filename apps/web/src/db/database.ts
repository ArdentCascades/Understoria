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
import Dexie, { type Table } from "dexie";
import type {
  Achievement,
  AvailabilityChip,
  BlockRow,
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  DirectMessage,
  Event,
  EventCancellation,
  EventProjectLinkRow,
  EventRsvpRow,
  Exchange,
  Member,
  NodeConfig,
  Post,
  PreviouslyBlockedRow,
  Project,
  ProjectActivity,
  ProjectTask,
  Proposal,
  TaskComment,
  Vote,
} from "@/types";
import { uuid } from "@/lib/id";
import type { SignedVouch } from "@/lib/vouch";

/**
 * Persisted node configuration row. Single-row table keyed by `nodeId`
 * — each node has exactly one config. Holds the safeguard thresholds
 * (and, in later agents, any other per-node settings that today live
 * as constants in the codebase). Mutated only through `db/nodeConfig.ts`
 * helpers, never directly from a component.
 */
export interface NodeConfigRow extends NodeConfig {
  nodeId: string;
}

export interface AppSetting {
  key: string;
  value: string;
}

/**
 * Local-only secret key storage. A row holds EITHER plaintext
 * (`secretKey`, base64) OR a passphrase-wrapped blob (`wrapped`). Never
 * both. Plaintext rows only exist on nodes the user has chosen not to
 * passphrase-protect; enabling passphrase protection from Profile
 * rewrites every row in-place. This table must NEVER be synced,
 * exported, or federated — it's explicitly excluded from the data-export
 * flow in Profile.tsx.
 */
export interface SecretKeyRow {
  publicKey: string;
  secretKey?: string;
  wrapped?: import("@/lib/passphrase").WrappedBlob;
}

/**
 * Persisted outbox row for community-node mirroring. Each row represents
 * one signed record (Exchange or SignedVouch today; posts/invites later)
 * that needs to be POSTed to the configured community node. The worker
 * in lib/outbox.ts owns this table — it picks up `pending` rows whose
 * `nextAttemptAt` is in the past, POSTs them, and updates the row's
 * status / backoff.
 *
 * Why persist it rather than fire-and-forget: a community node down for
 * 30 seconds when a member confirms an exchange should not drop that
 * exchange from the community-wide ledger. The outbox is the durable
 * boundary between "this record happened on my device" and "this record
 * is visible to the community."
 */
export interface OutboxRow {
  /** UUID for this outbox row. Distinct from the wrapped record's id. */
  id: string;
  /** Discriminator. New kinds slot in here as more record types
   *  federate; the worker dispatches to the matching submitter. */
  kind:
    | "exchange"
    | "vouch"
    | "post"
    | "claim"
    | "task_comment"
    | "coorg_invitation"
    | "coorg_invitation_response"
    | "coorg_invitation_revocation"
    | "event"
    | "event_cancellation";
  // Intentionally NOT a member of this union: "event_rsvp". EventRsvpRow
  // is local-only by design (docs/community-events.md §4 + §7); RSVPs
  // never enter the outbox. The union rejects "event_rsvp" at the
  // type level — events.test.ts asserts this with `// @ts-expect-error`.
  //
  // Intentionally NOT a member of this union: "block". BlockRow and
  // PreviouslyBlockedRow are local-only personal-relief data per
  // docs/blocking.md §4 + §7; they never enter the outbox, never
  // export, are cleared by soft-purge. blocking.test.ts asserts the
  // rejection with `// @ts-expect-error`.
  //
  // Intentionally NOT a member of this union: "event_project_link".
  // EventProjectLinkRow ties a federated event to a local-only project
  // as a "work day" (docs/community-events.md "Project work days" +
  // plan 10). Projects never federate, so a project pointer must never
  // cross the wire — the link is local-only by construction, never
  // enqueued, never pulled. eventProjectLinks.test.ts asserts the
  // rejection with `// @ts-expect-error`.
  /** JSON-stringified signed payload. Immutable once enqueued. */
  payload: string;
  /** Id of the wrapped record; lets us avoid double-enqueue on retry. */
  recordId: string;
  createdAt: number;
  attempts: number;
  nextAttemptAt: number;
  status: "pending" | "delivered" | "poisoned";
  lastError?: string;
  lastAttemptAt?: number;
}

/**
 * Persisted state for invite tokens that this node has issued. The
 * signed blob lives in `signed` so re-issuing an already-shared link
 * is a no-op. Redemption is tracked by flipping `status` so the same
 * token cannot be consumed twice.
 */
export interface InviteRow {
  token: string;
  inviterKey: string;
  nodeId: string;
  createdAt: number;
  expiresAt: number;
  status: "open" | "redeemed" | "revoked" | "expired";
  redeemedBy: string | null;
  redeemedAt: number | null;
  /** URL-encoded token string (base64url of the signed invite JSON). */
  encoded: string;
}

/**
 * A persisted draft of a form's state. One row per form (keyed by a
 * stable string like "post-new" or "project-new") so the form can
 * offer "continue your draft?" on a fresh load. Payload is a JSON
 * string — opaque to the store; the caller knows the schema.
 */
export interface DraftRow {
  key: string;
  payload: string;
  updatedAt: number;
}

/**
 * Persisted entry in the local paired-device inventory. One row per
 * pair flow the member completed on this device — either as the
 * SOURCE (this device generated the QR) or DESTINATION (this device
 * captured a QR and imported the identity). Surfaced on Profile so
 * the member can see what they've authorized; never federated, never
 * exported, never crosses the wire.
 *
 * The table is a UX surface — it helps members notice "I forgot I
 * paired Aunt's laptop" — not a security boundary. It cannot detect a
 * silent re-import the attacker performed without the member's
 * involvement, and Ed25519 has no key-revocation primitive to act on
 * a "remove" affordance anyway. The only remediation for a lost
 * paired device is Emergency → Hard purge, which clears this table
 * alongside the rest of the identity. See `docs/device-pairing.md`
 * §9.x and `docs/threat-model.md` §7.
 */
export interface PairingLogRow {
  /** UUID for the entry. Primary key. */
  id: string;
  /** ms-epoch when the pair completed on this device. */
  completedAt: number;
  /** "source" = this device generated the QR for another device.
   *  "destination" = this device imported an identity from a scanned
   *  QR. The two lists render under separate headings on Profile. */
  kind: "source" | "destination";
  /** Member-provided free-text label, e.g. "Aunt's laptop" or "work
   *  phone". Empty string when the member skipped the prompt — never
   *  null. The UI renders an "(unlabeled)" fallback in that case. */
  label: string;
}

/**
 * Co-organizer invitation row — see `docs/co-organizer-invitations.md`.
 * Wraps the federated `CoOrganizerInvitation` record with a local-only
 * `grandfathered` audit flag. Grandfathered rows are synthesized by
 * the v21 upgrade callback for pre-feature `Project.coOrganizerKeys`
 * entries; their `signature` is the sentinel `"grandfathered"` and
 * they do NOT federate (the outbox is not retroactive).
 */
export interface CoOrganizerInvitationRow extends CoOrganizerInvitation {
  /** Local-only marker — set by the v21 migration for pre-existing
   *  unilateral additions. Absent / false for real signed invitations.
   *  Verifiers that need to distinguish real signatures from
   *  grandfathered placeholders read this flag instead of trying to
   *  verify the sentinel signature. */
  grandfathered?: boolean;
}

export interface CoOrganizerInvitationResponseRow
  extends CoOrganizerInvitationResponse {
  /** Local-only marker — see `CoOrganizerInvitationRow.grandfathered`. */
  grandfathered?: boolean;
}

export interface CoOrganizerInvitationRevocationRow
  extends CoOrganizerInvitationRevocation {
  /** Local-only marker — see `CoOrganizerInvitationRow.grandfathered`.
   *  Present here for shape symmetry; grandfathered rows never
   *  populate this table (a pre-feature unilateral add was never a
   *  revoke). */
  grandfathered?: boolean;
}

/**
 * Community-event row — see `docs/community-events.md`. Wraps the
 * federated `Event` record verbatim; no local-only fields. Federates
 * via the outbox `kind: "event"` discriminator.
 */
export type EventRow = Event;

/**
 * Community-event cancellation row — see `docs/community-events.md`
 * §4.3. Wraps the federated `EventCancellation` record verbatim.
 * Federates via the outbox `kind: "event_cancellation"` discriminator.
 */
export type EventCancellationRow = EventCancellation;

export class UnderstoriaDB extends Dexie {
  members!: Table<Member, string>;
  posts!: Table<Post, string>;
  exchanges!: Table<Exchange, string>;
  achievements!: Table<Achievement, string>;
  settings!: Table<AppSetting, string>;
  secretKeys!: Table<SecretKeyRow, string>;
  invites!: Table<InviteRow, string>;
  vouches!: Table<SignedVouch, string>;
  outbox!: Table<OutboxRow, string>;
  projects!: Table<Project, string>;
  projectTasks!: Table<ProjectTask, string>;
  projectActivity!: Table<ProjectActivity, string>;
  nodeConfig!: Table<NodeConfigRow, string>;
  drafts!: Table<DraftRow, string>;
  proposals!: Table<Proposal, string>;
  votes!: Table<Vote, string>;
  messages!: Table<DirectMessage, string>;
  taskComments!: Table<TaskComment, string>;
  pairingLog!: Table<PairingLogRow, string>;
  coorgInvitations!: Table<CoOrganizerInvitationRow, string>;
  coorgInvitationResponses!: Table<CoOrganizerInvitationResponseRow, string>;
  coorgInvitationRevocations!: Table<CoOrganizerInvitationRevocationRow, string>;
  events!: Table<EventRow, string>;
  eventRsvps!: Table<EventRsvpRow, string>;
  eventCancellations!: Table<EventCancellationRow, string>;
  /**
   * Local-only member-block table — see `docs/blocking.md` §4 + §7.
   * Personal-relief data. Never synced, never exported, never federated.
   * Cleared by soft-purge. Read and written only by `db/blocks.ts` on
   * the blocker's own device. The `OutboxRow.kind` union above rejects
   * `"block"` at the type level; there is no `enqueueBlock` helper in
   * `lib/outbox.ts`. Same federation posture as `eventRsvps`.
   */
  blocks!: Table<BlockRow, string>;
  /**
   * Local-only block history — see `docs/blocking.md` §4.1 + §5 + §7.
   * Same federation posture as `blocks`. This is never synced,
   * exported, or federated. Indefinite retention by default; cleared
   * by the explicit "Clear unblocked history" affordance (PR E) or by
   * soft-purge.
   */
  previouslyBlocked!: Table<PreviouslyBlockedRow, string>;
  /**
   * Local-only event⇄project work-day link — see
   * `docs/community-events.md` ("Project work days") + plan 10. Ties a
   * federated event to a local-only project. Never synced, never
   * exported, never federated (projects don't federate, so a project
   * pointer must never cross the wire). Read and written only by
   * `db/eventProjectLinks.ts`. The `OutboxRow.kind` union above rejects
   * `"event_project_link"` at the type level; there is no
   * `enqueueEventProjectLink` helper in `lib/outbox.ts`. Same
   * federation posture as `eventRsvps` and `blocks`.
   */
  eventProjectLinks!: Table<EventProjectLinkRow, string>;

  constructor(name = "understoria") {
    super(name);
    this.version(1).stores({
      members: "publicKey, displayName, createdAt",
      posts:
        "id, type, status, category, postedBy, claimedBy, createdAt, urgency",
      exchanges:
        "id, postId, helperKey, helpedKey, completedAt, category",
      achievements:
        "id, memberKey, achievementType, earnedAt, [memberKey+achievementType]",
      settings: "key",
    });
    this.version(2).stores({
      secretKeys: "publicKey",
    });
    this.version(3).stores({
      invites: "token, inviterKey, status, createdAt",
      vouches: "id, voucherKey, voucheeKey, createdAt, [voucherKey+voucheeKey]",
    });
    this.version(4).stores({
      outbox: "id, kind, status, nextAttemptAt, recordId, [status+nextAttemptAt]",
    });
    this.version(5).stores({
      projects:
        "id, organizerKey, status, category, createdAt, [status+createdAt]",
      projectTasks:
        "id, projectId, status, assignedTo, createdAt, [projectId+status]",
      projectActivity:
        "id, projectId, type, actorKey, createdAt, [projectId+createdAt]",
    });
    // Version 6 — Agent 11: per-node configuration replaces the
    // hardcoded safeguard constants in lib/safeguards.ts.
    this.version(6).stores({
      nodeConfig: "nodeId",
    });
    // Version 7 — Agent 3: posts federation. Adds nodeId + signature
    // to every Post row. The schema string itself doesn't change (no
    // new index), but existing rows are missing the two new typed
    // fields — the upgrade backfills nodeId from `nodeId` setting and
    // signature to "" (empty = "legacy, not federable").
    this.version(7).stores({}).upgrade(async (tx) => {
      const settingsTable = tx.table<AppSetting, string>("settings");
      const nodeIdRow = await settingsTable.get("nodeId");
      const localNodeId = nodeIdRow?.value ?? "node_local";
      const posts = tx.table<Post, string>("posts");
      await posts.toCollection().modify((row) => {
        const r = row as Post & { nodeId?: string; signature?: string };
        if (r.nodeId === undefined) r.nodeId = localNodeId;
        if (r.signature === undefined) r.signature = "";
      });
    });
    // Version 8 — form draft autosave (PostForm + ProjectNew).
    this.version(8).stores({
      drafts: "key, updatedAt",
    });
    // Version 9 — Agent 13 Decisions surface (proposals table).
    // Disputes will eventually migrate into this same table per the
    // roadmap's "kind discriminator" plan, but v1 keeps them
    // separate — only `kind: "proposal"` rows live here for now.
    this.version(9).stores({
      proposals: "id, status, category, createdAt, [status+createdAt]",
    });
    // Version 10 — Agent 13 voting. Votes have a deterministic
    // `${proposalId}|${voterKey}` id so re-casting is just a put;
    // the composite index lets the tally helper pull all votes
    // for a proposal in one query.
    this.version(10).stores({
      votes: "id, proposalId, voterKey, createdAt, [proposalId+voterKey]",
    });
    // Version 11 — task check-in tracking (two-tier check-in
    // handling). Adds `claimedAt` + `checkInAcknowledgedAt` to
    // every ProjectTask. Backfills `claimedAt = now()` for any
    // currently-claimed task so the "could use more hands"
    // prompts don't fire en masse on first load after upgrade.
    // No new index — check-in state is computed in memory against
    // node config, never queried directly.
    this.version(11).stores({}).upgrade(async (tx) => {
      const now = Date.now();
      const tasks = tx.table<ProjectTask, string>("projectTasks");
      await tasks.toCollection().modify((row) => {
        const r = row as ProjectTask & {
          claimedAt?: number | null;
          checkInAcknowledgedAt?: number | null;
        };
        if (r.claimedAt === undefined) {
          r.claimedAt = r.status === "claimed" ? now : null;
        }
        if (r.checkInAcknowledgedAt === undefined) {
          r.checkInAcknowledgedAt = null;
        }
      });
    });
    // Version 12 — disputes fold into proposals (Agents 13 + 14
    // unified Decisions surface per docs/roadmap.md). Adds a
    // `kind` index so the Decisions UI can filter; adds the
    // `disputePostId` index so ensureDisputeProposal can quickly
    // check whether a dispute proposal already exists for a post.
    // Backfill walks every disputed post and writes a matching
    // proposal row. The post-level `status === "disputed"` field
    // stays — it's still the source of truth for the exchange
    // lifecycle. The proposal is the governance-layer view.
    this.version(12)
      .stores({
        proposals:
          "id, status, category, kind, createdAt, disputePostId, [status+createdAt], [kind+status]",
      })
      .upgrade(async (tx) => {
        const proposals = tx.table<Proposal, string>("proposals");
        // Existing proposal rows pre-date the kind / disputePostId
        // fields. Backfill them to the "proposal" kind so the new
        // index is populated correctly.
        await proposals.toCollection().modify((row) => {
          const r = row as Proposal & {
            kind?: Proposal["kind"];
            disputePostId?: string | null;
          };
          if (r.kind === undefined) r.kind = "proposal";
          if (r.disputePostId === undefined) r.disputePostId = null;
        });
        // Backfill: every existing disputed post gets a
        // governance-layer dispute proposal. Helper / recipient
        // direction follows the same rule as listDisputes (NEED →
        // claimer helps poster, OFFER reverse).
        const posts = tx.table<Post, string>("posts");
        const disputedPosts = await posts
          .where("status")
          .equals("disputed")
          .toArray();
        for (const post of disputedPosts) {
          const existing = await proposals
            .where("disputePostId")
            .equals(post.id)
            .first();
          if (existing) continue;
          const helperKey =
            post.type === "NEED" ? post.claimedBy : post.postedBy;
          const recipientKey =
            post.type === "NEED" ? post.postedBy : post.claimedBy;
          const snapshot = {
            postType: post.type,
            postTitle: post.title,
            category: post.category,
            hours: post.estimatedHours,
            helperKey,
            recipientKey: recipientKey ?? "",
            postCreatedAt: post.createdAt,
          };
          const legacyPost = post as Post & {
            disputeReason?: string | null;
            disputedAt?: number | null;
          };
          const row: Proposal = {
            id: `dispute_backfill_${post.id}`,
            nodeId: post.nodeId,
            kind: "dispute",
            category: "dispute",
            reversibilityTier: "easy",
            title: post.title,
            description: legacyPost.disputeReason ?? "",
            payload: JSON.stringify(snapshot),
            // Sentinel: we don't know who flagged on legacy rows.
            // Using the post author would make the disputed party
            // appear as the proposer of the dispute against
            // themselves. The UI renders this as "(historical,
            // flagger unknown)" instead of a member name.
            proposerKey: "system_backfill",
            status: "open",
            createdAt: legacyPost.disputedAt ?? post.createdAt,
            closedAt: null,
            closedReason: null,
            impactReflection: null,
            disputePostId: post.id,
          };
          await proposals.put(row);
        }
      });
    // Version 13 — Agent 10 Phase 3: co-organizer support.
    // Adds `coOrganizerKeys` to every Project. Backfills
    // existing rows to an empty array so the field is never
    // undefined at runtime.
    this.version(13).stores({}).upgrade(async (tx) => {
      const projects = tx.table<Project, string>("projects");
      await projects.toCollection().modify((row) => {
        const r = row as Project & { coOrganizerKeys?: string[] };
        if (r.coOrganizerKeys === undefined) r.coOrganizerKeys = [];
      });
    });
    // Version 14 — E2E encrypted direct messages (Agent 2 task 5).
    // Messages are stored encrypted at rest; decrypted on read.
    // The conversationId is deterministic from the two public keys.
    this.version(14).stores({
      messages: "id, conversationId, createdAt, [conversationId+createdAt]",
    });
    // Version 15 — per-task comment threads. New table only; no
    // backfill needed since existing data has no comments to migrate.
    // The composite index supports the per-task chronological fetch
    // listTaskComments uses. `authorKey` is indexed so a future
    // "all comments by member" surface can query without a scan.
    this.version(15).stores({
      taskComments:
        "id, projectId, taskId, authorKey, createdAt, [projectId+taskId+createdAt]",
    });
    // Version 16 — optional availability chips on Member.
    // Backfills existing members with an empty array so the field is
    // never undefined at runtime. No new index — chips aren't queried.
    this.version(16).stores({}).upgrade(async (tx) => {
      const members = tx.table<Member, string>("members");
      await members.toCollection().modify((row) => {
        const r = row as Member & { availabilityChips?: AvailabilityChip[] };
        if (r.availabilityChips === undefined) r.availabilityChips = [];
      });
    });
    // Version 17 — members can now record which starter template
    // seeded a project (feeds the solidarity-routing surface that
    // points to sibling efforts on the same template). Backfills
    // pre-v17 rows to null. No new index: the projects list is short
    // enough that the solidarity surface filters in memory, and we
    // never query by templateId directly.
    this.version(17).stores({}).upgrade(async (tx) => {
      const projects = tx.table<Project, string>("projects");
      await projects.toCollection().modify((row) => {
        const r = row as Project & { templateId?: string | null };
        if (r.templateId === undefined) r.templateId = null;
      });
    });
    // Version 18 — community-customizable milestones. Adds
    // `customMilestones: Milestone[]` to NodeConfig. Backfills
    // pre-v18 rows with an empty array so the field is never
    // undefined at runtime (the read path in `db/nodeConfig.ts`
    // also defaults to []; the upgrade keeps the on-disk shape
    // consistent so a peer dumping the row sees the new shape).
    // No new index — the array is read whole and walked in memory.
    this.version(18).stores({}).upgrade(async (tx) => {
      const configs = tx.table<NodeConfigRow, string>("nodeConfig");
      await configs.toCollection().modify((row) => {
        const r = row as NodeConfigRow & {
          customMilestones?: NodeConfig["customMilestones"];
        };
        if (r.customMilestones === undefined) r.customMilestones = [];
      });
    });
    // Version 19 — node system key (auto-confirm). Local-only audit
    // fields on Exchange (`autoConfirmed`, `autoConfirmedBy`,
    // `autoConfirmedAt`) plus the per-node `autoConfirmHours` knob on
    // NodeConfig. The system signing key itself does NOT ship on the
    // client — it lives on the server (see docs/auto-confirm-key.md
    // §4); only the audit fields land here so a member's PWA can
    // surface an auto-confirmed exchange distinctly. No new index —
    // verifier distinguishability is decided in memory by reading the
    // flag at audit time.
    //
    // Pre-v19 NodeConfig rows backfill to 168 hours (7 days, the
    // pilot default from §7 of the design note); a community that
    // wants off ships off via CommunitySettings.
    this.version(19).stores({}).upgrade(async (tx) => {
      const configs = tx.table<NodeConfigRow, string>("nodeConfig");
      await configs.toCollection().modify((row) => {
        const r = row as NodeConfigRow & { autoConfirmHours?: number };
        if (r.autoConfirmHours === undefined) r.autoConfirmHours = 168;
      });
      // Exchange rows: undefined autoConfirmed reads as "not auto",
      // so a strict backfill isn't required. Explicit-false is the
      // clearer audit value — pre-v19 rows are unambiguously
      // member-signed. autoConfirmedBy / autoConfirmedAt stay
      // undefined.
      const exchanges = tx.table<Exchange, string>("exchanges");
      await exchanges.toCollection().modify((row) => {
        const r = row as Exchange & { autoConfirmed?: boolean };
        if (r.autoConfirmed === undefined) r.autoConfirmed = false;
      });
    });
    // Version 20 — paired-device inventory. New table only; no
    // existing rows to migrate. Secondary indexes on `completedAt`
    // (for the DESC sort the Profile section needs) and `kind` (to
    // split the source / destination lists without a full scan). The
    // table is local-only and clears on Hard purge alongside the
    // identity itself — see `docs/device-pairing.md` §9.x.
    this.version(20)
      .stores({
        pairingLog: "id, completedAt, kind",
      })
      .upgrade(async () => {
        // New table; no existing rows to migrate.
      });
    // Version 21 — co-organizer invitations (PR A of the
    // signed-invitation series; see `docs/co-organizer-invitations.md`).
    // Three new tables, one per signed record type. Each record has
    // exactly one signer (inviter for invitation + revocation,
    // invitee for response) — the single-signer-per-record discipline
    // that the rest of the federated ledger relies on.
    //
    // Grandfather migration: every existing
    // (project, coOrganizerKey) pair gets a synthesized
    // (invitation, accepted-response) pair so the derived
    // `effectiveCoOrganizerKeys` view returns the same set the
    // static `Project.coOrganizerKeys` array does today. The
    // synthesized rows carry `signature: "grandfathered"` and a
    // local-only `grandfathered: true` flag so verifiers can
    // distinguish them from real signed acceptances. They do NOT
    // federate (the outbox is not retroactive).
    this.version(21)
      .stores({
        coorgInvitations:
          "id, projectId, inviterKey, inviteeKey, createdAt",
        coorgInvitationResponses:
          "id, invitationId, inviteeKey, decidedAt",
        coorgInvitationRevocations:
          "id, invitationId, inviterKey, revokedAt",
      })
      .upgrade(async (tx) => {
        const settingsTable = tx.table<AppSetting, string>("settings");
        const nodeIdRow = await settingsTable.get("nodeId");
        const localNodeId = nodeIdRow?.value ?? "node_local";

        const projects = tx.table<Project, string>("projects");
        const invitations = tx.table<CoOrganizerInvitationRow, string>(
          "coorgInvitations",
        );
        const responses = tx.table<CoOrganizerInvitationResponseRow, string>(
          "coorgInvitationResponses",
        );

        const allProjects = await projects.toArray();
        for (const project of allProjects) {
          const keys = project.coOrganizerKeys ?? [];
          for (const inviteeKey of keys) {
            // Use `project.createdAt` as the synthetic timestamp so
            // the audit trail roughly matches the moment authority
            // was granted (the closest signal we have). Expiry is
            // set well past the synthetic createdAt so the
            // grandfathered acceptance always falls inside the
            // "before expiry" branch of the derived view.
            const createdAt = project.createdAt;
            const invitationId = uuid();
            const invitation: CoOrganizerInvitationRow = {
              id: invitationId,
              projectId: project.id,
              inviterKey: project.organizerKey,
              inviteeKey,
              createdAt,
              // 100 years out — grandfathered acceptance never
              // expires from the derived view's perspective.
              expiresAt: createdAt + 100 * 365 * 24 * 60 * 60 * 1000,
              nodeId: project.nodeId ?? localNodeId,
              signature: "grandfathered",
              grandfathered: true,
            };
            await invitations.put(invitation);
            const response: CoOrganizerInvitationResponseRow = {
              id: uuid(),
              invitationId,
              inviteeKey,
              decision: "accept",
              decidedAt: createdAt,
              nodeId: project.nodeId ?? localNodeId,
              signature: "grandfathered",
              grandfathered: true,
            };
            await responses.put(response);
          }
        }
      });
    // Version 22 — community events (PR C of
    // `docs/community-events.md`). Three new tables, two federated and
    // one local-only.
    //
    // No backfill — these are pure new tables. No prior data exists to
    // migrate; pre-v22 nodes simply did not have events.
    //
    // `events` and `eventCancellations` are signed-and-federated record
    // types. Their outbox discriminators are `"event"` and
    // `"event_cancellation"` respectively; see the `OutboxRow.kind`
    // union above.
    //
    // `eventRsvps` is LOCAL-ONLY BY DESIGN. RSVP rows MUST NEVER be
    // enqueued into the outbox — see `docs/community-events.md` §4
    // (data model: "EventRSVP … never enters the outbox") and §7
    // (federation: "`EventRSVP`. Absolutely not. The discriminator
    // `\"EventRSVP\"` MUST NOT appear in `OutboxRow.kind`. There is
    // no `POST /event-rsvps` route. There is no `GET /event-rsvps?since=`
    // cursor. There is no PWA-side `pullFederatedEventRSVPs`.").
    // Accordingly: PR C does NOT add an `enqueueEventRsvp` helper to
    // `lib/outbox.ts`. The absence is load-bearing — see
    // `events.test.ts` for the negative tests that lock this in.
    this.version(22).stores({
      events:
        "id, createdBy, startsAt, createdAt, nodeId, [nodeId+id]",
      eventRsvps:
        "id, eventId, memberKey, [eventId+memberKey]",
      eventCancellations:
        "id, eventId, cancelledAt, createdBy, nodeId",
    });
    // Version 23 — rename federation-pull cursor keys for community
    // events to match the `federationLast<Kind>Pull` convention used
    // everywhere else in SETTING_KEYS. Carries the value across so any
    // cursor already written under the old key isn't lost. The deletes
    // are best-effort — settings rows simply won't exist on fresh
    // installs, where the old keys were never written.
    this.version(23).upgrade(async (tx) => {
      const settings = tx.table<AppSetting, string>("settings");
      const oldEvent = await settings.get("pullCursorEvent");
      if (oldEvent && oldEvent.value !== undefined) {
        await settings.put({
          key: "federationLastEventPull",
          value: oldEvent.value,
        });
        await settings.delete("pullCursorEvent");
      }
      const oldCancel = await settings.get("pullCursorEventCancellation");
      if (oldCancel && oldCancel.value !== undefined) {
        await settings.put({
          key: "federationLastEventCancellationPull",
          value: oldCancel.value,
        });
        await settings.delete("pullCursorEventCancellation");
      }
    });
    // v24: BlockRow + PreviouslyBlockedRow local tables.
    // These are local-only personal-relief data per docs/blocking.md
    // §4 + §7. Never federated, never exported, cleared by soft-purge.
    // The OutboxRow.kind union rejects "block" at the type level (PR B);
    // there is no enqueueBlock helper anywhere in lib/outbox. Same
    // discipline as eventRsvps.
    //
    // Two pure new tables; no backfill (no prior data exists to
    // migrate, since pre-v24 nodes had no block surface at all).
    //
    // Indexes:
    //   `blocks`
    //     - blockerKey, blockedKey, createdAt — single-column lookups
    //       for `listBlocks` (by blocker, DESC by createdAt) and
    //       per-key filtering.
    //     - [blockerKey+blockedKey] — compound index used by the
    //       `isBlocked` point lookup, which every §6 consumer surface
    //       (PR F) calls on the hot path.
    //   `previouslyBlocked`
    //     - blockerKey, blockedKey, firstBlockedAt — single-column
    //       lookups for `listPreviouslyBlocked` (by blocker, DESC by
    //       lastUnblockedAt — in-memory sort since lastUnblockedAt
    //       mutates) and per-key filtering.
    //     - [blockerKey+blockedKey] — compound index used to find or
    //       update an existing history row when the same member is
    //       re-blocked or unblocked, keeping `firstBlockedAt` stable
    //       across re-block cycles (docs/blocking.md §5).
    this.version(24).stores({
      blocks:
        "id, blockerKey, blockedKey, createdAt, [blockerKey+blockedKey]",
      previouslyBlocked:
        "id, blockerKey, blockedKey, firstBlockedAt, [blockerKey+blockedKey]",
    });
    // v25: backfill ProjectTask.orderIndex from createdAt rank per
    // project. Multiplied by 1000 to leave precision room for
    // fractional inserts before lazy renumber. See
    // docs/task-ordering-and-dependencies.md §11.
    // Idempotent: rows that already have orderIndex (e.g., post-PR-C
    // installs) get re-assigned but to the same value as long as the
    // createdAt order hasn't changed; benign.
    this.version(25).stores({}).upgrade(async (tx) => {
      const tasks = await tx.table<ProjectTask, string>("projectTasks").toArray();
      const byProject = new Map<string, ProjectTask[]>();
      for (const t of tasks) {
        const list = byProject.get(t.projectId) ?? [];
        list.push(t);
        byProject.set(t.projectId, list);
      }
      for (const list of byProject.values()) {
        list.sort((a, b) => a.createdAt - b.createdAt);
        for (let i = 0; i < list.length; i++) {
          const t = list[i];
          await tx.table("projectTasks").put({
            ...t,
            orderIndex: (i + 1) * 1000,
          });
        }
      }
    });
    // v26: claimer-stated actual hours on ProjectTask. Backfill `null`
    // ("never stated") on every pre-existing row so the field is never
    // undefined at runtime — already-completed tasks legitimately
    // recorded the estimate, and `creditHoursForTask` reads null as
    // "fall back to estimatedHours", so no history is rewritten. No new
    // index — the field is read in memory, never queried.
    this.version(26).stores({}).upgrade(async (tx) => {
      const tasks = tx.table<ProjectTask, string>("projectTasks");
      await tasks.toCollection().modify((row) => {
        const r = row as ProjectTask & { actualHours?: number | null };
        if (r.actualHours === undefined) r.actualHours = null;
      });
    });
    // v27: local-only event⇄project work-day links (plan 10). Pure new
    // table, no backfill. The `[projectId+eventId]` compound index backs
    // the one-link-per-event guard and the per-project list query. This
    // table NEVER federates — projects don't cross the wire, so neither
    // can a project pointer; the `OutboxRow.kind` union rejects
    // `"event_project_link"` and no enqueue/pull helper exists.
    this.version(27).stores({
      eventProjectLinks:
        "id, eventId, projectId, createdAt, [projectId+eventId]",
    });
  }
}

export const db = new UnderstoriaDB();

export const SETTING_KEYS = {
  currentMember: "currentMember",
  nodeId: "nodeId",
  celebratedMilestones: "celebratedMilestones",
  /** Per-device display state: a JSON array of project ids whose
   *  one-time completion moment has already popped on this device, so
   *  it shows once and then settles into the permanent banner line.
   *  Mirrors `celebratedMilestones`; survives soft purge, cleared by
   *  hard purge with the rest of `settings`. */
  celebratedProjectCompletions: "celebratedProjectCompletions",
  onboarded: "onboarded",
  /** Base URL of the community node to mirror finalized exchanges to.
   *  Empty / unset means "do not mirror." */
  communityNodeUrl: "communityNodeUrl",
  /** "1" if exchange mirroring is enabled, "0" or absent otherwise. */
  communityNodeEnabled: "communityNodeEnabled",
  /** ISO timestamp of the last successful POST. Display-only. */
  communityNodeLastSuccess: "communityNodeLastSuccess",
  /** Last error message from a submission attempt. Display-only. */
  communityNodeLastError: "communityNodeLastError",
  /** "1" once the member has dismissed the profile-completion nudge.
   *  The nudge naturally stops showing once the profile is filled
   *  out, so this only matters for members who actively want to
   *  ignore it forever. */
  profileNudgeDismissed: "profileNudgeDismissed",
  /** "1" once the member has dismissed the first-action nudge.
   *  Same shape — the nudge stops on its own once the member has
   *  posted or claimed anything; this flag only matters for the
   *  "wants to lurk forever without dismissing" case. */
  firstActionNudgeDismissed: "firstActionNudgeDismissed",
  /** "1" once the member has dismissed the vouch-discovery nudge —
   *  the one-time orientation banner shown on Board the first time
   *  a member has been welcomed into trust (i.e. they're `trusted`)
   *  and haven't yet vouched for anyone. Self-retires the moment
   *  they vouch for someone; this flag only matters for members
   *  who never act on the nudge and want it gone permanently. */
  vouchDiscoveryNudgeDismissed: "vouchDiscoveryNudgeDismissed",
  /** "1" once the member has dismissed the keep-access nudge — the
   *  calm, post-onboarding Board reassurance that an account living on
   *  one device should keep a spare copy by pairing a second device.
   *  Self-retires the moment a second device exists (a pairing-log
   *  row of either kind); this flag only matters for members who never
   *  pair a second device and want the reassurance gone permanently. */
  keepAccessNudgeDismissed: "keepAccessNudgeDismissed",
  /** "1" once the member has dismissed the "Add to home screen"
   *  install card on Board (or once the app reports itself installed,
   *  which writes the same flag). The card self-retires when the PWA
   *  is installed; this flag only matters for members who dismiss it
   *  without ever installing. The re-findable Learn-section panel
   *  ignores this flag — it's a reference, not a nag. */
  installGuideDismissed: "installGuideDismissed",
  /** "1" once the member has declined the origin-derived community-
   *  node suggestion (`docs/invite-redemption.md` §5.3) — anywhere it
   *  appeared (invite-accept success card or Board card). Declining is
   *  permanent for this device; re-asking would be nagging
   *  (no-notifications). Manual configuration in Settings is always
   *  available and untouched by this flag. Note the counterpart
   *  per-identity not-joined dismissal lives under a dynamic key —
   *  see lib/notJoinedNudge.ts `notJoinedDismissKey`. */
  nodeOriginSuggestDismissed: "nodeOriginSuggestDismissed",
  boardHintDismissed: "boardHintDismissed",
  balanceHintDismissed: "balanceHintDismissed",
  inviteHintDismissed: "inviteHintDismissed",
  /** "system" | "light" | "dark". Absent or invalid reads as "system".
   *  Mirrored to localStorage on every write so the inline script in
   *  index.html can apply the right theme before first paint. */
  themePreference: "themePreference",
  /** "default" | "larger" | "largest". Absent or invalid reads as
   *  "default". Mirrored to localStorage same as themePreference. */
  textSize: "textSize",
  /** "default" | "compact". Absent or invalid reads as "default".
   *  Mirrored to localStorage so the inline script in index.html
   *  applies the right class before first paint. See lib/density.ts. */
  density: "density",
  /** Cursor for `pullFederatedExchanges` — the highest `completedAt`
   *  observed so far. Mirrors the post / claim / task-comment cursors
   *  in `federationSync.ts`. Absent on a fresh install means "pull
   *  the most recent slice on first sync." */
  federationLastExchangePull: "federationLastExchangePull",
  /** Cursor for `pullFederatedCoOrgInvitations` — highest `createdAt`
   *  observed so far on co-organizer-invitation pulls. */
  federationLastCoOrgInvitationPull: "federationLastCoOrgInvitationPull",
  /** Cursor for `pullFederatedCoOrgResponses` — highest `decidedAt`
   *  observed so far on co-organizer-invitation-response pulls. */
  federationLastCoOrgInvitationResponsePull:
    "federationLastCoOrgInvitationResponsePull",
  /** Cursor for `pullFederatedCoOrgRevocations` — highest `revokedAt`
   *  observed so far on co-organizer-invitation-revocation pulls. */
  federationLastCoOrgInvitationRevocationPull:
    "federationLastCoOrgInvitationRevocationPull",
  /** Cursor for `pullFederatedEvents` — highest `createdAt` observed so
   *  far on community-event pulls. Defaults to epoch 0 when absent. */
  federationLastEventPull: "federationLastEventPull",
  /** Cursor for `pullFederatedEventCancellations` — highest
   *  `cancelledAt` observed so far on event-cancellation pulls.
   *  Defaults to epoch 0 when absent. */
  federationLastEventCancellationPull: "federationLastEventCancellationPull",
  /** The calendar page's last explicitly-picked view: "agenda" |
   *  "month" | "week". Absent or invalid reads as the breakpoint-derived
   *  default. Device-local display state only — never federated. */
  calendarViewMode: "calendarViewMode",
  /** The calendar page's filter state as a JSON blob:
   *  `{ category, projectId, mine, eventsOnly }`. Absent or malformed
   *  reads as "no filters". Device-local display state only — never
   *  federated. Paging / offset state is deliberately NOT stored here:
   *  the calendar always opens anchored on today. */
  calendarFilters: "calendarFilters",
} as const;

export async function getSetting(key: string): Promise<string | undefined> {
  const row = await db.settings.get(key);
  return row?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}
