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
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { isDemoBuild } from "@/lib/demo";
import { urlHash, normalizeNodeUrl } from "@/lib/nodeEndpoints";
import { decodeAndVerifyInvite } from "@/lib/invite";
import { communityNodeIdSet, isOurNode } from "@/lib/nodeIdentity";
import {
  enqueueAwaitingTransition,
  enqueueClaimOutbox,
  enqueueEvent,
  enqueueEventCancellation,
  enqueueExchangeOutbox,
  enqueueInviteAnnouncementOutbox,
  enqueueMemberReinstatementOutbox,
  enqueueMemberRemovalOutbox,
  enqueueMessageOutbox,
  enqueuePostOutbox,
  enqueueProposalClosureOutbox,
  enqueueProposalOutbox,
  enqueueSeedVaultPledgeOutbox,
  enqueueTaskCommentOutbox,
  enqueueVouchOutbox,
  enqueueVoteOutbox,
} from "@/lib/outbox";
import { buildInviteAnnouncement } from "@/db/invites";
import {
  enqueueCoOrganizerInvitationOutbox,
  enqueueCoOrganizerInvitationResponseOutbox,
  enqueueCoOrganizerInvitationRevocationOutbox,
} from "@/db/coorgInvitations";
import {
  publishEventRsvpState,
  publishEventShiftState,
  publishShiftSignupState,
} from "@/db/participationPublish";
import { publishProjectState, publishTaskState } from "@/db/projects";
import { getSecretKey } from "@/db/secrets";
import {
  canonicalAwaitingTransitionPayload,
  canonicalRelayedMessagePayload,
  sign,
} from "@understoria/shared/crypto";

/**
 * Outbox BACKFILL — the fix for the 2026-07 production incident
 * ("the invite feature is broken"): a founder's projects, events, and
 * posts never appeared on a fresh invitee's device.
 *
 * Root cause: `enqueueOutbox` is (deliberately) a no-op while no
 * community-node URL is configured — a member who never opted into
 * federation shouldn't accumulate a queue. But nothing ever
 * re-enqueued the records already sitting in Dexie once a node WAS
 * connected. Everything created before the connect — or while the
 * device pointed at a dead/previous server — existed only on the
 * author's device, forever. The author never noticed (local-first
 * shows them everything); every OTHER member saw holes.
 *
 * The fix: when a device gains (or changes) its community-node
 * connection, walk the local tables and re-enqueue every federable
 * record THIS DEVICE authored — i.e. records whose author key has a
 * secret in `db.secretKeys`. Safe by construction:
 *
 *  - `enqueueOutbox` dedups identical payloads (including recently
 *    delivered ones), so re-running is cheap and idempotent;
 *  - the node re-verifies every signature and answers duplicates
 *    idempotently, so a re-POST of an already-stored record is a
 *    no-op server-side;
 *  - only SELF-AUTHORED records go: records pulled from others are
 *    already on a node, and relaying them is the mirror workers' job.
 *
 * Project/task state rides its own publisher (fresh LWW signature at
 * publish time), so those go through publishProjectState/TaskState
 * with whichever authorized key this device holds — and the same
 * pattern covers RSVPs, shift definitions, and shift signups via the
 * participationPublish helpers. Kinds whose signature is synthesized
 * at write time (sealed message envelopes, awaiting-transition
 * artifacts, cross-node claims) are re-synthesized here with the held
 * key: Ed25519 signing is deterministic, so a re-signed identical
 * payload dedups cleanly against a previously-delivered copy.
 *
 * With the 2026-07 sweep this walk covers EVERY outbox kind. The two
 * kinds absent from the walk are absent by design, not omission:
 * redemption receipts and invite revocations are enqueued even while
 * NO node is configured (`requireNodeUrl: false` — they were never
 * droppable), so the queue itself is their backfill.
 */

/** Settings-key prefix marking "backfill already ran for this node
 *  URL" — once per URL, so the walk doesn't re-run on every boot,
 *  but a device that later points at a DIFFERENT server re-seeds it
 *  too (the second production failure mode: content created while
 *  configured against the abandoned first server). */
const DONE_KEY_PREFIX = "outboxBackfillDone::";

export async function backfillOutboxFromLocalData(): Promise<number> {
  if (isDemoBuild()) return 0;
  const held = new Set(
    (await db.secretKeys.toArray()).map((row) => row.publicKey),
  );
  if (held.size === 0) return 0;
  let enqueued = 0;
  const count = (row: unknown) => {
    if (row !== null) enqueued += 1;
  };

  const posts = await db.posts.toArray();
  for (const post of posts) {
    if (!held.has(post.postedBy) || !post.signature) continue;
    count(await enqueuePostOutbox(post));
  }

  // Cross-node claims — posts from ANOTHER community that a held key
  // claimed. Same shape claimPost enqueues; `claimedAt` is re-stamped
  // (the original wasn't stored) which stays within the server's
  // plausibility bounds and only affects display recency.
  const localNodeId = (await getSetting(SETTING_KEYS.nodeId)) ?? "";
  let aliases: string[] = [];
  try {
    const raw = await getSetting(SETTING_KEYS.nodeIdAliases);
    if (raw) aliases = JSON.parse(raw) as string[];
  } catch {
    // Malformed aliases — treat as none.
  }
  const ourIds = communityNodeIdSet(localNodeId, aliases, []);
  if (localNodeId) {
    for (const post of posts) {
      if (!post.claimedBy || !held.has(post.claimedBy)) continue;
      if (post.status !== "claimed" && post.status !== "awaiting_confirmation")
        continue;
      if (isOurNode(post.nodeId, ourIds)) continue;
      count(
        await enqueueClaimOutbox({
          postId: post.id,
          claimerKey: post.claimedBy,
          claimedAt: Date.now(),
          nodeId: localNodeId,
        }),
      );
    }
  }

  // Awaiting-transition artifacts (auto-confirm-key.md §5) for posts
  // stuck in awaiting_confirmation: without the artifact on the node,
  // the /auto-confirm window is unenforceable. Either party may sign
  // (the schema's signedBy rule), so use whichever key this device
  // holds. Re-anchoring is conservative: the node measures the window
  // from its own received_at, so a late artifact only DELAYS
  // auto-confirmation, never backdates it.
  for (const post of posts) {
    if (post.status !== "awaiting_confirmation" || !post.claimedBy) continue;
    const helperKey = post.type === "NEED" ? post.claimedBy : post.postedBy;
    const helpedKey = post.type === "NEED" ? post.postedBy : post.claimedBy;
    const signer = [helperKey, helpedKey].find((k) => held.has(k));
    if (!signer) continue;
    try {
      const secret = await getSecretKey(signer);
      const payload = {
        kind: "awaiting_transition" as const,
        postId: post.id,
        helperKey,
        helpedKey,
        signedBy: signer,
        enteredAt: post.awaitingSince ?? Date.now(),
        nodeId: post.nodeId,
      };
      count(
        await enqueueAwaitingTransition({
          ...payload,
          signature: sign(canonicalAwaitingTransitionPayload(payload), secret),
        }),
      );
    } catch {
      // Locked session — skip; the next pass covers it.
    }
  }
  for (const x of await db.exchanges.toArray()) {
    if (x.autoConfirmed) continue;
    if (!held.has(x.helperKey) && !held.has(x.helpedKey)) continue;
    count(await enqueueExchangeOutbox(x));
  }
  for (const v of await db.vouches.toArray()) {
    if (!held.has(v.voucherKey)) continue;
    count(await enqueueVouchOutbox(v));
  }
  for (const c of await db.taskComments.toArray()) {
    if (!held.has(c.authorKey) || !c.signature) continue;
    count(await enqueueTaskCommentOutbox(c));
  }
  for (const e of await db.events.toArray()) {
    if (!held.has(e.createdBy) || !e.signature) continue;
    count(await enqueueEvent(e));
  }
  for (const ec of await db.eventCancellations.toArray()) {
    if (!held.has(ec.createdBy) || !ec.signature) continue;
    count(await enqueueEventCancellation(ec));
  }
  for (const p of await db.proposals.toArray()) {
    if (!p.signerKey || !held.has(p.signerKey) || !p.signature) continue;
    count(await enqueueProposalOutbox(p));
  }
  for (const v of await db.votes.toArray()) {
    if (!v.signerKey || !held.has(v.signerKey) || !v.signature) continue;
    count(await enqueueVoteOutbox(v));
  }
  for (const c of await db.proposalClosures.toArray()) {
    if (!c.signerKey || !held.has(c.signerKey) || !c.signature) continue;
    count(await enqueueProposalClosureOutbox(c));
  }
  for (const s of await db.seedVaultPledges.toArray()) {
    if (!held.has(s.memberKey)) continue;
    count(await enqueueSeedVaultPledgeOutbox(s));
  }

  // Co-organizer records — stored rows ARE the full signed records.
  // Filter to the record's single signer (design doc §4) and skip the
  // v21 grandfathered placeholders (their sentinel signature would be
  // refused on the wire); strip the local-only flag from the payload.
  for (const inv of await db.coorgInvitations.toArray()) {
    if (inv.grandfathered || !held.has(inv.inviterKey)) continue;
    const { grandfathered: _g, ...record } = inv;
    count(await enqueueCoOrganizerInvitationOutbox(record));
  }
  for (const resp of await db.coorgInvitationResponses.toArray()) {
    if (resp.grandfathered || !held.has(resp.inviteeKey)) continue;
    const { grandfathered: _g, ...record } = resp;
    count(await enqueueCoOrganizerInvitationResponseOutbox(record));
  }
  for (const rev of await db.coorgInvitationRevocations.toArray()) {
    if (rev.grandfathered || !held.has(rev.inviterKey)) continue;
    const { grandfathered: _g, ...record } = rev;
    count(await enqueueCoOrganizerInvitationRevocationOutbox(record));
  }

  // Quorum governance records: re-enqueue any assembled removal /
  // reinstatement carrying one of this device's co-signatures — the
  // record is complete and immutable, and the node dedups on id, so
  // several co-signers' devices re-sending the same record is a wire
  // no-op.
  for (const r of await db.memberRemovals.toArray()) {
    if (!r.signatures?.some((s) => held.has(s.signerKey))) continue;
    count(await enqueueMemberRemovalOutbox(r));
  }
  for (const r of await db.memberReinstatements.toArray()) {
    if (!r.signatures?.some((s) => held.has(s.signerKey))) continue;
    count(await enqueueMemberReinstatementOutbox(r));
  }

  // Sealed message envelopes — THE user-facing hole: a message sent
  // before this device connected sat in Dexie forever, shown to the
  // sender (local-first) and invisible to the recipient. The row
  // stores every envelope field except the transport signature, which
  // is re-derived here; Ed25519 is deterministic, so the payload is
  // byte-identical to the original enqueue and dedups against
  // already-delivered copies. Recipients that already pulled a copy
  // simply never re-pull it (their cursor is past its createdAt).
  for (const m of await db.messages.toArray()) {
    if (!held.has(m.senderKey)) continue;
    try {
      const secret = await getSecretKey(m.senderKey);
      const payload = {
        id: m.id,
        senderKey: m.senderKey,
        recipientKey: m.recipientKey,
        nonce: m.nonce,
        ciphertext: m.ciphertext,
        createdAt: m.createdAt,
      };
      count(
        await enqueueMessageOutbox({
          ...payload,
          signature: sign(canonicalRelayedMessagePayload(payload), secret),
        }),
      );
    } catch {
      // Locked session — skip; the next pass covers it.
    }
  }
  // Open, unexpired invites this device issued: register them with
  // the node (operator ruling 2026-07) — the invite is recovered from
  // the stored share token and re-announced HASH-ONLY (the raw token
  // never crosses this wire; v11 ruling).
  const nowMs = Date.now();
  for (const inv of await db.invites.toArray()) {
    if (inv.status !== "open" || !held.has(inv.inviterKey)) continue;
    if (inv.expiresAt <= nowMs || !inv.encoded) continue;
    const decoded = decodeAndVerifyInvite(inv.encoded);
    if (!decoded.ok) continue;
    try {
      const secret = await getSecretKey(inv.inviterKey);
      count(
        await enqueueInviteAnnouncementOutbox(
          buildInviteAnnouncement(decoded.invite, secret),
        ),
      );
    } catch {
      // Locked session or missing secret — skip; the next backfill
      // pass (or the issue-time enqueue) covers it.
    }
  }

  // Project + task state: publish fresh LWW versions signed with an
  // authorized held key. publishProjectState/TaskState enqueue (and
  // kick the flush) themselves.
  const projects = await db.projects.toArray();
  const authorizedSigner = (p: (typeof projects)[number]): string | null => {
    if (held.has(p.organizerKey)) return p.organizerKey;
    const co = p.coOrganizerKeys.find((k) => held.has(k));
    return co ?? null;
  };
  const signerByProject = new Map<string, string>();
  for (const p of projects) {
    const signer = authorizedSigner(p);
    if (!signer) continue;
    signerByProject.set(p.id, signer);
    await publishProjectState(p.id, signer);
    enqueued += 1;
  }
  const tasks = await db.projectTasks.toArray();
  for (const t of tasks) {
    const orgSigner = signerByProject.get(t.projectId);
    if (orgSigner) {
      await publishTaskState(t.id, orgSigner);
      enqueued += 1;
    } else if (t.assignedTo && held.has(t.assignedTo)) {
      // §4 claimer authority: a claimer may (re)publish the task
      // they hold even when this device isn't the organizer's.
      await publishTaskState(t.id, t.assignedTo);
      enqueued += 1;
    }
  }

  // Awaiting-transition artifacts for the PROJECT-TASK path — same
  // enforcement upgrade as the post loop above, same construction as
  // markProjectTaskComplete (completer signs; helped side is the
  // project's primary organizer).
  const projectById = new Map(projects.map((p) => [p.id, p]));
  for (const t of tasks) {
    if (
      t.status !== "awaiting_confirmation" ||
      !t.completedBy ||
      !held.has(t.completedBy)
    ) {
      continue;
    }
    const project = projectById.get(t.projectId);
    if (!project) continue;
    try {
      const secret = await getSecretKey(t.completedBy);
      const payload = {
        kind: "awaiting_transition" as const,
        postId: `project:${t.projectId}/task:${t.id}`,
        helperKey: t.completedBy,
        helpedKey: project.organizerKey,
        signedBy: t.completedBy,
        enteredAt: t.completionSignedAt ?? Date.now(),
        nodeId: project.nodeId ?? "",
      };
      count(
        await enqueueAwaitingTransition({
          ...payload,
          signature: sign(canonicalAwaitingTransitionPayload(payload), secret),
        }),
      );
    } catch {
      // Locked session — skip; the next pass covers it.
    }
  }

  // Participation state (docs/project-federation.md §6): RSVPs and
  // signups re-publish under the member's own key, shift definitions
  // under the organizer's. The publishers re-sign a fresh LWW version
  // and persist it back onto the row, exactly like the project/task
  // publishers above; a locked device soft-degrades inside them.
  for (const r of await db.eventRsvps.toArray()) {
    if (!held.has(r.memberKey)) continue;
    await publishEventRsvpState(r.eventId, r.memberKey);
    enqueued += 1;
  }
  for (const s of await db.eventShifts.toArray()) {
    if (!held.has(s.createdBy)) continue;
    await publishEventShiftState(s, s.createdBy);
    enqueued += 1;
  }
  for (const s of await db.shiftSignups.toArray()) {
    if (!held.has(s.memberKey)) continue;
    await publishShiftSignupState(s, s.memberKey);
    enqueued += 1;
  }

  return enqueued;
}

/**
 * Run the backfill ONCE per node URL. Called from `writeSubmitConfig`
 * (the single chokepoint every connect path goes through: the invite
 * consent card, the Board suggestion card, Settings edits) and from
 * the outbox worker's startup — the latter is what heals devices
 * already in the broken state the day this code arrives, with no
 * member action.
 */
export async function maybeBackfillOutbox(url: string): Promise<void> {
  const normalized = normalizeNodeUrl(url);
  if (!normalized) return;
  if (isDemoBuild()) return;
  const doneKey = `${DONE_KEY_PREFIX}${urlHash(normalized)}`;
  try {
    if ((await getSetting(doneKey)) === "1") return;
    await backfillOutboxFromLocalData();
    await setSetting(doneKey, "1");
  } catch {
    // Best-effort: an interrupted walk simply re-runs next time (the
    // done flag is only written after a complete pass, and every
    // enqueue is idempotent).
  }
}
