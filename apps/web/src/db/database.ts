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
  DirectMessage,
  Exchange,
  Member,
  NodeConfig,
  Post,
  Project,
  ProjectActivity,
  ProjectTask,
  Proposal,
  TaskComment,
  Vote,
} from "@/types";
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
  kind: "exchange" | "vouch" | "post" | "claim" | "task_comment";
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
  }
}

export const db = new UnderstoriaDB();

export const SETTING_KEYS = {
  currentMember: "currentMember",
  nodeId: "nodeId",
  celebratedMilestones: "celebratedMilestones",
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
} as const;

export async function getSetting(key: string): Promise<string | undefined> {
  const row = await db.settings.get(key);
  return row?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}
