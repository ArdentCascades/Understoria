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
import { db, SETTING_KEYS, setSetting } from "@/db/database";
import { generateKeyPair } from "./crypto";

/**
 * Panic button implementations — Agent 4 task 3.
 *
 * Two modes, each with a different trust model:
 *
 * - `softPurge()` strips every linkable text field from the local node
 *   while preserving the signed exchange ledger and keypairs. The node
 *   continues to operate, but a forensic examiner pulling the device
 *   sees structural data only (post IDs, category codes, timestamps,
 *   public keys). Useful when you expect a device to be briefly handled
 *   by a hostile party but want to keep your identity afterward.
 *
 * - `hardPurge()` wipes every table — including private keys — and
 *   rotates to a fresh node identity. No history remains. The node
 *   "continues" in the sense that the app still opens, but everything
 *   starts over. Unrecoverable.
 *
 * Both functions are transactional per-table and designed to complete
 * well under the 60-second acceptance target from the threat model.
 */

export interface PurgeResult {
  mode: "soft" | "hard";
  durationMs: number;
  tablesTouched: string[];
}

export async function softPurge(): Promise<PurgeResult> {
  const start = performance.now();
  const tables: string[] = [];

  await db.transaction("rw", db.members, async () => {
    const members = await db.members.toArray();
    let i = 0;
    for (const m of members) {
      await db.members.put({
        ...m,
        displayName: `Member ${anonLabel(i++)}`,
        skills: [],
        availability: "",
        availabilityChips: [],
        locationZone: "",
        vouchedBy: [],
      });
    }
    tables.push("members");
  });

  await db.transaction("rw", db.posts, async () => {
    const posts = await db.posts.toArray();
    for (const p of posts) {
      await db.posts.put({
        ...p,
        title: "",
        description: "",
        locationZone: "",
      });
    }
    tables.push("posts");
  });

  await db.transaction("rw", db.projects, async () => {
    const projects = await db.projects.toArray();
    for (const p of projects) {
      await db.projects.put({
        ...p,
        title: "",
        description: "",
        locationZone: "",
        tags: [],
        pauseNote: null,
      });
    }
    tables.push("projects");
  });

  await db.transaction("rw", db.projectTasks, async () => {
    const tasks = await db.projectTasks.toArray();
    for (const t of tasks) {
      await db.projectTasks.put({
        ...t,
        title: "",
        description: "",
        requiredSkills: [],
      });
    }
    tables.push("projectTasks");
  });

  // Task-comment bodies are member-authored free text. Structure
  // (ids, author keys, timestamps, tombstones) stays — the ledger
  // model preserves keys — but the words go.
  await db.transaction("rw", db.taskComments, async () => {
    const comments = await db.taskComments.toArray();
    for (const c of comments) {
      await db.taskComments.put({ ...c, body: "" });
    }
    tables.push("taskComments");
  });

  // Community events: same shape as posts — title, description and
  // the free-text location are linkable; the rest is structural.
  await db.transaction("rw", db.events, async () => {
    const events = await db.events.toArray();
    for (const e of events) {
      await db.events.put({ ...e, title: "", description: "", location: "" });
    }
    tables.push("events");
  });
  await db.transaction("rw", db.eventCancellations, async () => {
    const cancellations = await db.eventCancellations.toArray();
    for (const c of cancellations) {
      await db.eventCancellations.put({ ...c, reason: "" });
    }
    tables.push("eventCancellations");
  });

  // Proposals carry member-authored free text: the flagger's reason
  // (description), the flagged post's title, and — for comment
  // disputes — a verbatim body snapshot inside the payload.
  await db.transaction("rw", db.proposals, async () => {
    const proposals = await db.proposals.toArray();
    for (const p of proposals) {
      let payload = p.payload;
      try {
        const parsed = JSON.parse(payload) as Record<string, unknown>;
        if (typeof parsed.postTitle === "string") parsed.postTitle = "";
        if (typeof parsed.body === "string") parsed.body = "";
        payload = JSON.stringify(parsed);
      } catch {
        // Unparseable payload: blank it rather than keep unknown text.
        payload = "";
      }
      await db.proposals.put({ ...p, title: "", description: "", payload });
    }
    tables.push("proposals");
  });

  // Project activity `data` blobs stash free text for the history
  // timeline (announcement bodies, pause notes, acknowledgments,
  // task/event titles). Scrub by ALLOWLIST, not denylist: every
  // string-valued key that is not a known structural identifier is
  // blanked, so a future activity type that stashes a new free-text
  // key is scrubbed by default instead of silently escaping the
  // purge. Numbers and booleans (hours, timestamps, flags) pass
  // through — free text is always a string.
  const ACTIVITY_STRUCTURAL_STRING_KEYS = new Set([
    // ids / keys
    "taskId",
    "exchangeId",
    "eventId",
    "proposalId",
    "clonedFrom",
    // member public keys (the ledger keeps keys by design)
    "helperKey",
    "fromKey",
    "toKey",
    // enum-like lifecycle values
    "to",
  ]);
  await db.transaction("rw", db.projectActivity, async () => {
    const rows = await db.projectActivity.toArray();
    for (const row of rows) {
      const data = { ...row.data } as Record<string, unknown>;
      let touched = false;
      for (const [key, value] of Object.entries(data)) {
        if (
          typeof value === "string" &&
          value !== "" &&
          !ACTIVITY_STRUCTURAL_STRING_KEYS.has(key)
        ) {
          data[key] = "";
          touched = true;
        }
      }
      if (touched) await db.projectActivity.put({ ...row, data });
    }
    tables.push("projectActivity");
  });

  // docs/blocking.md §3 (privacy-policy.md §3): block list + history
  // are local-only personal-relief data and are cleared on soft-purge.
  // Unlike the tables above, every column on a BlockRow /
  // PreviouslyBlockedRow is identifying (the row IS the relationship —
  // there's no "structural" half to preserve), so the right scrub is a
  // table clear rather than a field rewrite. This also matches the
  // threat-model §7 entry naming `previouslyBlocked` as a device-access
  // residual that soft-purge resolves.
  //
  // The same "the row IS the relationship" reasoning clears:
  //   - `messages`: sender/recipient keys + timing are a communication
  //     graph; there is no structural half worth keeping.
  //   - `drafts`: verbatim in-progress free text, nothing structural.
  //   - `eventRsvps`: a member-attendance graph (who plans to be in
  //     which room) — precisely what the events design promises never
  //     to aggregate.
  //   - `outbox`: rows hold the VERBATIM JSON payload of every pending
  //     federated record — post titles/descriptions, task-comment
  //     bodies, event text — the exact linkable text this purge blanks
  //     one table over. Leaving it turned the scrub into theatre.
  //   - `invites`: an open invite's `encoded` field is a live,
  //     redeemable credential; a seized device must not keep working
  //     invite links.
  //   - `votes`: voterKey↔choice rows are a governance-participation
  //     graph, same personal-relief class as the RSVPs.
  //   - `eventProjectLinks`: linkedBy↔event↔project rows tie the
  //     member to a local-only project and a physical gathering — the
  //     schema declares it the same posture as `eventRsvps`/`blocks`.
  //   - `pairingLog`: member-authored device labels ("Dan's phone")
  //     plus the pairing history are device-graph metadata the schema
  //     classes too sensitive even for the member's own export — a
  //     seized device must not keep them (Round-4 review).
  //   - `eventShifts` + `shiftSignups`: the shift layer is the
  //     member's organizing pattern and a per-slot attendance-intent
  //     graph — the same personal-relief class as `eventRsvps`, only
  //     finer-grained (docs/shift-signups.md §4).
  await db.transaction(
    "rw",
    [
      db.blocks,
      db.previouslyBlocked,
      db.messages,
      db.drafts,
      db.eventRsvps,
      db.eventProjectLinks,
      db.eventShifts,
      db.shiftSignups,
      db.outbox,
      db.invites,
      db.redemptionReceipts,
      db.inviteRevocationRecords,
      db.votes,
      db.pairingLog,
    ],
    async () => {
      await db.blocks.clear();
      await db.previouslyBlocked.clear();
      await db.messages.clear();
      await db.drafts.clear();
      await db.eventRsvps.clear();
      await db.eventProjectLinks.clear();
      await db.eventShifts.clear();
      await db.shiftSignups.clear();
      await db.outbox.clear();
      await db.invites.clear();
      // The signed membership artifacts (re-seed Phase R0) are the
      // who-invited-whom graph with display names inside the signed
      // payloads — unscrubbable without destroying the signatures, so
      // they clear whole. Costs this device its re-seed capability
      // until the next pull refills them from a node: in a panic,
      // the member's safety outranks the community's redundancy.
      await db.redemptionReceipts.clear();
      await db.inviteRevocationRecords.clear();
      await db.votes.clear();
      await db.pairingLog.clear();
    },
  );
  tables.push("blocks");
  tables.push("previouslyBlocked");
  tables.push("messages");
  tables.push("drafts");
  tables.push("eventRsvps");
  tables.push("eventProjectLinks");
  tables.push("eventShifts");
  tables.push("shiftSignups");
  tables.push("outbox");
  tables.push("invites");
  tables.push("redemptionReceipts");
  tables.push("inviteRevocationRecords");
  tables.push("votes");
  tables.push("pairingLog");

  // Settings deliberately survive: under the threat-model contract
  // ("anonymize all linkable text while preserving the signed exchange
  // ledger and keypair") public keys are not linkable text, and the
  // node identity / display preferences keep the UI stable afterward.
  // NOT pushed to tablesTouched — this report must list only what was
  // actually scrubbed.

  return {
    mode: "soft",
    durationMs: performance.now() - start,
    tablesTouched: tables,
  };
}

export async function hardPurge(): Promise<PurgeResult> {
  const start = performance.now();

  // Enumerate the LIVE schema rather than hand-maintaining a table
  // list. The hand-maintained list drifted: ten tables added after it
  // was written (messages, taskComments, drafts, proposals, votes,
  // events, eventRsvps, eventCancellations, eventProjectLinks,
  // nodeConfig) were silently surviving the "wipe every table" purge —
  // direct-message rows, comment plaintext and form drafts were all
  // recoverable from a device after a member had triggered the
  // emergency wipe. Deriving the list from `db.tables` makes every
  // future table wipe-by-default; the threat-model contract is "wipe
  // every table, rotate to a fresh node identity", with no exceptions
  // to encode.
  const tables = db.tables.map((t) => t.name);
  await Promise.all(db.tables.map((t) => t.clear()));

  // Rotate to a fresh node identity so the post-purge node is
  // cryptographically independent of the pre-purge one.
  const kp = generateKeyPair();
  await db.secretKeys.put({
    publicKey: kp.publicKey,
    secretKey: kp.secretKey,
  });
  await setSetting(SETTING_KEYS.nodeId, `node_${kp.publicKey.slice(0, 8)}`);

  return {
    mode: "hard",
    durationMs: performance.now() - start,
    tablesTouched: tables,
  };
}

function anonLabel(i: number): string {
  if (i < 26) return String.fromCharCode(65 + i);
  return `${String.fromCharCode(65 + Math.floor(i / 26) - 1)}${String.fromCharCode(
    65 + (i % 26),
  )}`;
}
