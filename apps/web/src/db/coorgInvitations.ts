/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
  db,
  type CoOrganizerInvitationResponseRow,
  type CoOrganizerInvitationRevocationRow,
  type CoOrganizerInvitationRow,
  type OutboxRow,
} from "./database";
import { uuid } from "@/lib/id";
import {
  canonicalCoOrganizerInvitationPayload,
  canonicalCoOrganizerInvitationResponsePayload,
  canonicalCoOrganizerInvitationRevocationPayload,
  sign,
  verifyCoOrganizerInvitation,
  verifyCoOrganizerInvitationResponse,
  verifyCoOrganizerInvitationRevocation,
} from "@/lib/crypto";
import { b64decode, b64encode } from "@understoria/shared/bytes";
import { BLOCKED_ACTION_MESSAGE, isMutuallyBlocked } from "./blocks";
import { publishProjectState } from "./projects";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
} from "@/types";

/**
 * Co-organizer invitation data layer — see
 * `docs/co-organizer-invitations.md` for the full design. Three
 * signed record types with one signer per record:
 *
 *   - `issueCoOrganizerInvitation` — primary organizer signs an
 *     invitation. Inviter must equal `Project.organizerKey`.
 *   - `respondToCoOrganizerInvitation` — invitee signs an accept or
 *     decline. Single response per invitation, terminal.
 *   - `revokeCoOrganizerInvitation` — inviter cancels an
 *     outstanding invitation before the invitee responds.
 *
 * `effectiveCoOrganizerKeys` computes the derived set per §4 of
 * the design doc — accepted, not revoked, not expired (or
 * accepted before expiry).
 *
 * Acceptance is MATERIALIZED into `Project.coOrganizerKeys` (see
 * `materializeAcceptedCoOrganizer`). The static array is the live
 * authority list every synchronous gate reads — `isOrganizer`, the
 * project page, task confirmation, step-down — and the only place
 * removal is recorded, because removal (step-down / primary
 * removal) deliberately has no signed record type. The signed rows
 * in these tables are the audit trail that lets any node verify how
 * each entry earned its place; they are not, by themselves, the
 * live list.
 */

export class CoOrganizerInvitationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_TTL_MS = 14 * DAY_MS;

/**
 * Recover the base64 public key from a 64-byte Ed25519 secret key.
 * tweetnacl packs the secret as `seed || pub`; the last 32 bytes
 * are the public key. We decode once, slice, and re-encode. This
 * guards against a caller passing a secret that doesn't match the
 * claimed pubkey — the response and revoke flows verify the
 * derived key against the invitation's `inviteeKey` / `inviterKey`
 * before signing.
 */
function derivePublicKey(secretKeyB64: string): string {
  const bytes = b64decode(secretKeyB64);
  if (bytes.length !== 64) {
    throw new CoOrganizerInvitationError(
      "bad_secret_key",
      "Secret key is not a 64-byte Ed25519 keypair.",
    );
  }
  return b64encode(bytes.subarray(32));
}

// -- Issue ------------------------------------------------------------------

export interface IssueCoOrganizerInvitationInput {
  projectId: string;
  inviterKey: string;
  inviterSecretKey: string;
  inviteeKey: string;
  nodeId: string;
  /** Override the clock — tests inject a deterministic timestamp. */
  now?: number;
  /** Override the default 14-day TTL — tests cover the expiry boundary. */
  ttlMs?: number;
}

/**
 * Issue a signed co-organizer invitation. The caller must be the
 * project's primary organizer; that's the only authority that can
 * grant the role. The signed invitation lands in
 * `db.coorgInvitations` and (if a community node is configured) on
 * the outbox so federation picks it up. Returns the persisted
 * record.
 */
export async function issueCoOrganizerInvitation(
  input: IssueCoOrganizerInvitationInput,
): Promise<CoOrganizerInvitation> {
  const now = input.now ?? Date.now();
  const ttl = input.ttlMs ?? DEFAULT_TTL_MS;

  const project = await db.projects.get(input.projectId);
  if (!project) {
    throw new CoOrganizerInvitationError(
      "project_not_found",
      "Project not found on this node.",
    );
  }
  if (project.organizerKey !== input.inviterKey) {
    throw new CoOrganizerInvitationError(
      "not_primary_organizer",
      "Only the primary organizer can invite co-organizers.",
    );
  }
  if (input.inviteeKey === project.organizerKey) {
    throw new CoOrganizerInvitationError(
      "invitee_is_primary",
      "The primary organizer is already the organizer of this project.",
    );
  }
  // PR F: Co-organizer invitations are a (b) prevent-initiation gate
  // per docs/blocking.md §6 — disabled in either direction. Generic-
  // error discipline (§6.1): same message as any other "not available"
  // path so the would-be invitee can't fingerprint the block from a
  // disabled-affordance code. Existing co-org status is unaffected
  // (the unifying rule that work in flight finishes through its
  // existing flow).
  if (await isMutuallyBlocked(input.inviterKey, input.inviteeKey)) {
    throw new Error(BLOCKED_ACTION_MESSAGE);
  }

  const derivedInviter = derivePublicKey(input.inviterSecretKey);
  if (derivedInviter !== input.inviterKey) {
    throw new CoOrganizerInvitationError(
      "inviter_key_mismatch",
      "Inviter secret key does not match the claimed inviter public key.",
    );
  }

  const payload = {
    projectId: input.projectId,
    inviterKey: input.inviterKey,
    inviteeKey: input.inviteeKey,
    createdAt: now,
    expiresAt: now + ttl,
    nodeId: input.nodeId,
  };
  const signature = sign(
    canonicalCoOrganizerInvitationPayload(payload),
    input.inviterSecretKey,
  );
  const invitation: CoOrganizerInvitation = {
    id: uuid(),
    ...payload,
    signature,
  };
  if (!verifyCoOrganizerInvitation(invitation)) {
    throw new CoOrganizerInvitationError(
      "signing_failed",
      "Invitation signature did not verify locally — refusing to persist.",
    );
  }

  await db.transaction(
    "rw",
    [db.coorgInvitations, db.outbox, db.settings],
    async () => {
      const row: CoOrganizerInvitationRow = { ...invitation };
      await db.coorgInvitations.put(row);
      await enqueueOutboxRow("coorg_invitation", invitation.id, invitation);
    },
  );

  return invitation;
}

export interface IssueInvitationsForCloneInput {
  projectId: string;
  inviterKey: string;
  inviterSecretKey: string;
  inviteeKeys: readonly string[];
  nodeId: string;
  /** Override the clock — tests inject a deterministic timestamp. */
  now?: number;
}

/**
 * Re-issue co-organizer invitations for a freshly cloned project — one
 * normal signed invitation per invitee, against the CLONE's id. The
 * ethos-clean way to carry a recurring crew forward is to re-perform
 * consent, never to copy `coOrganizerKeys`: a clone is a new trust
 * context (new debits to sign as the helped party), so each person
 * decides again (docs/co-organizer-invitations.md §2–§3).
 *
 * Per-key isolation: each invitation runs in its own try/catch and
 * failures are COLLECTED, never re-thrown, so one blocked pair (or a
 * self-invite that slipped through the candidate math) can't abort the
 * rest. The cause is deliberately swallowed — the caller renders a
 * single cause-free "some couldn't be sent" message so a missing
 * invitation can't fingerprint a block (docs/blocking.md §6.1).
 */
export async function issueInvitationsForClone(
  input: IssueInvitationsForCloneInput,
): Promise<{ sent: string[]; failed: string[] }> {
  const sent: string[] = [];
  const failed: string[] = [];
  for (const inviteeKey of input.inviteeKeys) {
    try {
      await issueCoOrganizerInvitation({
        projectId: input.projectId,
        inviterKey: input.inviterKey,
        inviterSecretKey: input.inviterSecretKey,
        inviteeKey,
        nodeId: input.nodeId,
        now: input.now,
      });
      sent.push(inviteeKey);
    } catch {
      failed.push(inviteeKey);
    }
  }
  return { sent, failed };
}

// -- Respond (accept / decline) --------------------------------------------

export interface RespondToCoOrganizerInvitationInput {
  invitationId: string;
  inviteeSecretKey: string;
  decision: "accept" | "decline";
  nodeId: string;
  now?: number;
}

/**
 * Sign and persist an accept or decline. Rejects if the invitation
 * is missing, expired, already responded to, or already revoked —
 * the response is a terminal state, exactly one per invitation.
 */
export async function respondToCoOrganizerInvitation(
  input: RespondToCoOrganizerInvitationInput,
): Promise<CoOrganizerInvitationResponse> {
  const now = input.now ?? Date.now();

  const invitation = await db.coorgInvitations.get(input.invitationId);
  if (!invitation) {
    throw new CoOrganizerInvitationError(
      "invitation_not_found",
      "Invitation not found on this node.",
    );
  }
  if (now > invitation.expiresAt) {
    throw new CoOrganizerInvitationError(
      "invitation_expired",
      "This invitation has expired and can no longer be responded to.",
    );
  }
  const existingResponse = await db.coorgInvitationResponses
    .where("invitationId")
    .equals(input.invitationId)
    .first();
  if (existingResponse) {
    throw new CoOrganizerInvitationError(
      "already_responded",
      "This invitation has already been responded to.",
    );
  }
  const existingRevocation = await db.coorgInvitationRevocations
    .where("invitationId")
    .equals(input.invitationId)
    .first();
  if (existingRevocation) {
    throw new CoOrganizerInvitationError(
      "already_revoked",
      "This invitation has been revoked by the inviter.",
    );
  }

  const derivedInvitee = derivePublicKey(input.inviteeSecretKey);
  if (derivedInvitee !== invitation.inviteeKey) {
    throw new CoOrganizerInvitationError(
      "invitee_key_mismatch",
      "Invitee secret key does not match the invitation's invitee public key.",
    );
  }
  // PR F: same (b) prevent-initiation gate applies to the invitee-side
  // response — if either party has blocked the other since the
  // invitation was issued, the response is rejected with the generic
  // not-available copy. The invitation row stays put (work-in-flight
  // rule); only the new signed response is blocked. See
  // docs/blocking.md §6 row "Co-organizer invitations" + §6.1.
  if (await isMutuallyBlocked(invitation.inviteeKey, invitation.inviterKey)) {
    throw new Error(BLOCKED_ACTION_MESSAGE);
  }

  const payload = {
    invitationId: input.invitationId,
    inviteeKey: invitation.inviteeKey,
    decision: input.decision,
    decidedAt: now,
    nodeId: input.nodeId,
  };
  const signature = sign(
    canonicalCoOrganizerInvitationResponsePayload(payload),
    input.inviteeSecretKey,
  );
  const response: CoOrganizerInvitationResponse = {
    id: uuid(),
    ...payload,
    signature,
  };
  if (!verifyCoOrganizerInvitationResponse(response)) {
    throw new CoOrganizerInvitationError(
      "signing_failed",
      "Response signature did not verify locally — refusing to persist.",
    );
  }

  let granted: { projectId: string; organizerKey: string } | null = null;
  await db.transaction(
    "rw",
    [
      db.coorgInvitationResponses,
      db.outbox,
      db.settings,
      db.projects,
      db.coorgInvitations,
      db.coorgInvitationRevocations,
    ],
    async () => {
      const row: CoOrganizerInvitationResponseRow = { ...response };
      await db.coorgInvitationResponses.put(row);
      await enqueueOutboxRow(
        "coorg_invitation_response",
        response.id,
        response,
      );
      // Same transaction as the response row: an accept either
      // lands in both the audit trail and the live authority list,
      // or in neither.
      if (input.decision === "accept") {
        granted = await materializeAcceptedCoOrganizer(input.invitationId, now);
      }
    },
  );
  if (granted !== null) {
    // Republish the project's federated state with the new authority
    // list. On the invitee's own device this silently no-ops (the
    // organizer's key doesn't live here); the organizer's device
    // republishes when it ingests this response via federation.
    const g = granted as { projectId: string; organizerKey: string };
    await publishProjectState(g.projectId, g.organizerKey);
  }

  return response;
}

/**
 * Materialize an accepted invitation into `Project.coOrganizerKeys`.
 *
 * This is the wiring the original data-layer slice deferred (the old
 * header note here pointed at a migration plan that never landed):
 * without it, a real accepted invitation conferred the role only in
 * the derived view, while every synchronous authority gate —
 * `isOrganizer`, the project page's organizer controls,
 * `requireOrganizer`, `confirmProjectTaskCompletion`, step-down via
 * `removeCoOrganizer` — kept reading a static array the accept never
 * reached. The invitee got organizer attention items pointing at
 * controls the project page refused to show them.
 *
 * Invariant from here on: the static array is the live authority
 * list, written by every grant path (v21 grandfather migration, this
 * materialization, `handoffOrganizer`'s demotion of the old primary)
 * and every removal path (`removeCoOrganizer`). The signed rows
 * remain the verifiable record of how each entry got there.
 *
 * Guards mirror the §4 derived-view rule: an accept decision, signed
 * in time (`decidedAt ≤ expiresAt` — federation can deliver rows a
 * local clock would have rejected at write time), and no revocation.
 * Quietly no-ops when the invitation, response, or project row isn't
 * on this node — federation delivers records in any order, so both
 * the invitation and the response ingest paths call this and
 * whichever lands second completes the materialization. Idempotent:
 * an already-present key is left alone.
 */
export async function materializeAcceptedCoOrganizer(
  invitationId: string,
  now: number = Date.now(),
): Promise<{ projectId: string; organizerKey: string } | null> {
  return db.transaction(
    "rw",
    [
      db.projects,
      db.coorgInvitations,
      db.coorgInvitationResponses,
      db.coorgInvitationRevocations,
    ],
    async () => {
      const invitation = await db.coorgInvitations.get(invitationId);
      if (!invitation) return null;
      const response = await db.coorgInvitationResponses
        .where("invitationId")
        .equals(invitationId)
        .first();
      if (!response || response.decision !== "accept") return null;
      const revoked = await db.coorgInvitationRevocations
        .where("invitationId")
        .equals(invitationId)
        .first();
      if (revoked) return null;
      // The local accept path guarantees the responder IS the
      // invitee, but federation ingest only verifies a response's
      // self-signature — it cannot cross-check against an invitation
      // that may not have arrived yet. This is the first point where
      // both rows are in hand, so the cross-check lands here: a
      // response signed by anyone other than the named invitee never
      // materializes a role.
      if (response.inviteeKey !== invitation.inviteeKey) return null;
      const acceptedInTime = response.decidedAt <= invitation.expiresAt;
      const stillUnexpired = now < invitation.expiresAt;
      if (!acceptedInTime && !stillUnexpired) return null;
      const project = await db.projects.get(invitation.projectId);
      if (!project) return null;
      // The primary organizer's authority doesn't ride the array;
      // issueCoOrganizerInvitation rejects self-invites, but a
      // federated row could still claim one.
      if (invitation.inviteeKey === project.organizerKey) return null;
      if (project.coOrganizerKeys.includes(invitation.inviteeKey)) return null;
      await db.projects.put({
        ...project,
        coOrganizerKeys: [...project.coOrganizerKeys, invitation.inviteeKey],
      });
      // Signal the grant so callers can republish the project's
      // federated ProjectState (docs/project-federation.md §4): the
      // node honors a co-organizer's writes only once a stored version
      // NAMES them, and only the organizer's device holds the key that
      // can sign that version. The publish itself happens outside this
      // transaction (the outbox is not in scope here).
      return {
        projectId: project.id,
        organizerKey: project.organizerKey,
      };
    },
  );
}

// -- Revoke -----------------------------------------------------------------

export interface RevokeCoOrganizerInvitationInput {
  invitationId: string;
  inviterSecretKey: string;
  nodeId: string;
  now?: number;
}

/**
 * Sign and persist a revocation. Rejects if the invitation is
 * missing, already responded to, or already revoked. Revocation
 * after acceptance is a different action — see
 * `removeCoOrganizer` in `db/projects.ts`.
 */
export async function revokeCoOrganizerInvitation(
  input: RevokeCoOrganizerInvitationInput,
): Promise<CoOrganizerInvitationRevocation> {
  const now = input.now ?? Date.now();

  const invitation = await db.coorgInvitations.get(input.invitationId);
  if (!invitation) {
    throw new CoOrganizerInvitationError(
      "invitation_not_found",
      "Invitation not found on this node.",
    );
  }
  const existingResponse = await db.coorgInvitationResponses
    .where("invitationId")
    .equals(input.invitationId)
    .first();
  if (existingResponse) {
    throw new CoOrganizerInvitationError(
      "already_responded",
      "This invitation has already been responded to — revocation is only valid before acceptance.",
    );
  }
  const existingRevocation = await db.coorgInvitationRevocations
    .where("invitationId")
    .equals(input.invitationId)
    .first();
  if (existingRevocation) {
    throw new CoOrganizerInvitationError(
      "already_revoked",
      "This invitation has already been revoked.",
    );
  }

  const derivedInviter = derivePublicKey(input.inviterSecretKey);
  if (derivedInviter !== invitation.inviterKey) {
    throw new CoOrganizerInvitationError(
      "inviter_key_mismatch",
      "Inviter secret key does not match the invitation's inviter public key.",
    );
  }

  const payload = {
    invitationId: input.invitationId,
    inviterKey: invitation.inviterKey,
    revokedAt: now,
    nodeId: input.nodeId,
  };
  const signature = sign(
    canonicalCoOrganizerInvitationRevocationPayload(payload),
    input.inviterSecretKey,
  );
  const revocation: CoOrganizerInvitationRevocation = {
    id: uuid(),
    ...payload,
    signature,
  };
  if (!verifyCoOrganizerInvitationRevocation(revocation)) {
    throw new CoOrganizerInvitationError(
      "signing_failed",
      "Revocation signature did not verify locally — refusing to persist.",
    );
  }

  await db.transaction(
    "rw",
    [db.coorgInvitationRevocations, db.outbox, db.settings],
    async () => {
      const row: CoOrganizerInvitationRevocationRow = { ...revocation };
      await db.coorgInvitationRevocations.put(row);
      await enqueueOutboxRow(
        "coorg_invitation_revocation",
        revocation.id,
        revocation,
      );
    },
  );

  return revocation;
}

// -- Derived view -----------------------------------------------------------

/**
 * The §4 derived co-organizer view — invitee keys with an accepted
 * invitation that has not been revoked and either hasn't expired, or
 * whose acceptance was signed before expiry. Grandfathered acceptances
 * synthesized by the v21 migration are included (they carry the
 * sentinel signature, but the row-level `grandfathered: true` flag
 * distinguishes them from real signed acceptances for audit purposes).
 *
 * NOT an authority predicate. Authority is `isOrganizer` over the
 * materialized `Project.coOrganizerKeys` array, because two legitimate
 * role transitions have NO signed record type — handoff demotion and
 * step-down / removal — so a rows-derived view under-grants a demoted
 * primary and never forgets a removed member (the divergence PR #235
 * shipped and this view's former sync sibling caused; see
 * `docs/co-organizer-invitations.md` §5 and the `isOrganizer` comment
 * in `db/projects.ts`). This async view survives as the audit /
 * verification lens: an executable spec of "how did each entry earn
 * its place," used by tests and available to a future "array entry
 * lacks signed provenance" advisory.
 *
 * Returns a deduplicated list — a single invitee with multiple
 * accepted invitations for the same project (e.g. a decline
 * followed by a re-invitation that was then accepted) only appears
 * once.
 */
export async function effectiveCoOrganizerKeys(
  projectId: string,
  now: number = Date.now(),
): Promise<string[]> {
  const invitations = await db.coorgInvitations
    .where("projectId")
    .equals(projectId)
    .toArray();
  const effective = new Set<string>();
  for (const invitation of invitations) {
    const accepted = await db.coorgInvitationResponses
      .where("invitationId")
      .equals(invitation.id)
      .first();
    if (!accepted || accepted.decision !== "accept") continue;
    const revoked = await db.coorgInvitationRevocations
      .where("invitationId")
      .equals(invitation.id)
      .first();
    if (revoked) continue;
    // Expiry: acceptance is valid if signed before expiry OR the
    // invitation still hasn't expired against wall time. The §4
    // rule "now < expiresAt OR accept decidedAt ≤ expiresAt" — the
    // first clause keeps the role active while the invitation
    // window is still open; the second locks in an acceptance
    // signed during the window so wall-time drift can't retroactively
    // strip authority from a member who accepted in good time.
    const acceptedInTime = accepted.decidedAt <= invitation.expiresAt;
    const stillUnexpired = now < invitation.expiresAt;
    if (!acceptedInTime && !stillUnexpired) continue;
    effective.add(invitation.inviteeKey);
  }
  return Array.from(effective);
}

// -- Outbox helper ---------------------------------------------------------

/**
 * Local enqueue helper — same shape as the existing outbox
 * enqueues. Lives here rather than in `lib/outbox.ts` because the
 * payload shapes are co-organizer-specific and the kind-discriminator
 * extension lives next to the data layer for now (PR B will fold
 * these into the regular submitter dispatch).
 */
async function enqueueOutboxRow(
  kind: OutboxRow["kind"],
  recordId: string,
  payload: unknown,
): Promise<OutboxRow | null> {
  const urlRow = await db.settings.get("communityNodeUrl");
  if (!urlRow?.value?.trim()) return null;
  const existing = await db.outbox
    .where("recordId")
    .equals(recordId)
    .first();
  if (existing) return existing;
  const now = Date.now();
  const row: OutboxRow = {
    id: uuid(),
    kind,
    payload: JSON.stringify(payload),
    recordId,
    createdAt: now,
    attempts: 0,
    nextAttemptAt: now,
    status: "pending",
  };
  await db.outbox.put(row);
  return row;
}

