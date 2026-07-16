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
import { db, getSetting, setSetting } from "@/db/database";
import { isDemoBuild } from "@/lib/demo";
import { urlHash, normalizeNodeUrl } from "@/lib/nodeEndpoints";
import { decodeAndVerifyInvite } from "@/lib/invite";
import {
  enqueueEvent,
  enqueueEventCancellation,
  enqueueExchangeOutbox,
  enqueueInviteAnnouncementOutbox,
  enqueuePostOutbox,
  enqueueProposalClosureOutbox,
  enqueueProposalOutbox,
  enqueueSeedVaultPledgeOutbox,
  enqueueTaskCommentOutbox,
  enqueueVouchOutbox,
  enqueueVoteOutbox,
} from "@/lib/outbox";
import { buildInviteAnnouncement } from "@/db/invites";
import { publishProjectState, publishTaskState } from "@/db/projects";
import { getSecretKey } from "@/db/secrets";

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
 * with whichever authorized key this device holds.
 *
 * Not yet covered (their signed state is synthesized at write time
 * rather than stored): shift/RSVP/signup state records and co-org
 * invitation records. Tracked as follow-up; the periodic LWW
 * re-publish on next edit self-heals those.
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

  for (const post of await db.posts.toArray()) {
    if (!held.has(post.postedBy) || !post.signature) continue;
    count(await enqueuePostOutbox(post));
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
  for (const t of await db.projectTasks.toArray()) {
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
