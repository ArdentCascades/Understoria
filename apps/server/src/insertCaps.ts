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
import type { FastifyInstance } from "fastify";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";

/**
 * Insert-cap backstop — the roadmap "per-key / per-table insert caps
 * (disk-fill backstop)" row.
 *
 * The problem: a community node accepts any validly-signed federated
 * record, and an attacker OWNS the signing keys they generate — so
 * signature validity is not a scarcity control. Row growth was bounded
 * only by the per-minute rate limiter; a patient attacker could slowly
 * disk-fill a Raspberry-Pi-class node.
 *
 * Two ceilings, both env-configured, both SOFT in the values sense
 * (refuse-with-clear-error; the node never deletes anything):
 *
 *   - `TABLE_ROW_CEILING` — max total rows per federated table. The
 *     literal disk bound.
 *   - `PER_KEY_ROW_CEILING` — max rows per SIGNING KEY per table.
 *     Deliberately a LIFETIME count, not a rolling window: the
 *     record timestamps are client-claimed, so a "per-day" cap could
 *     be dodged by backdating; a total count cannot. The default is
 *     far above any honest pilot member's output; a legitimate
 *     high-volume community raises the knob.
 *
 * Breaches answer **507 Insufficient Storage** with
 * `{ error: "capacity_reached", scope: "table" | "key" }`. 507 is a
 * 5xx on purpose: the PWA outbox treats 5xx as retryable, so an
 * honest member's record waits in their outbox while the operator
 * raises the ceiling or prunes — it is not poisoned the way a 4xx
 * contract violation would be.
 *
 * Implemented as ONE app-level preHandler over a static path→surface
 * map, so no route file grows cap plumbing. The key field is read
 * from the parsed body opportunistically: if it's absent or
 * malformed, the key check is skipped and the route's own shape
 * validation rejects the request anyway.
 *
 * What this is NOT: a pruning policy, a reputation system, or a
 * quota members can see. The fuller design (what to do as a
 * community when a table legitimately fills) stays open on the
 * roadmap; this is the backstop that makes "disk full" an operator
 * decision instead of an attacker's.
 */

export interface InsertCapConfig {
  /** Max rows per federated table; 0 disables the table check. */
  tableRowCeiling: number;
  /** Max rows per signing key per table; 0 disables the key check. */
  perKeyRowCeiling: number;
}

interface Surface {
  table: string;
  /** Body field naming the signing key, and its column. Null for
   *  surfaces where per-key attribution doesn't apply. */
  keyField: string | null;
  keyColumn: string | null;
}

/** POST path → the table it inserts into + the attributable signer.
 *  Static, compile-time map — never derived from user input.
 *  Exported for the removed-author write gate (readAuth.ts), which
 *  reuses the same path→keyField attribution. */
export const SURFACES: Record<string, Surface> = {
  "/exchanges": {
    table: "exchanges",
    keyField: "helperKey",
    keyColumn: "helper_key",
  },
  "/vouches": {
    table: "vouches",
    keyField: "voucherKey",
    keyColumn: "voucher_key",
  },
  "/posts": { table: "posts", keyField: "postedBy", keyColumn: "posted_by" },
  // Voice-board audio blobs (#474): the per-key cap is the disk
  // backstop for the largest rows the node stores (up to 400 KB of
  // audio each); the keyField doubles as the write-membership gate's
  // attribution — only members can upload recordings.
  "/audio-blobs": {
    table: "audio_blobs",
    keyField: "uploaderKey",
    keyColumn: "uploader_key",
  },
  // Message relay (docs/message-relay.md §4.1): per-sender cap is the
  // spam backstop; the removed-author guard reuses this entry so a
  // removed member's pen is out of the DM surface too.
  "/messages": {
    table: "messages",
    keyField: "senderKey",
    keyColumn: "sender_key",
  },
  "/claims": {
    table: "claims",
    keyField: "claimerKey",
    keyColumn: "claimer_key",
  },
  "/task-comments": {
    table: "task_comments",
    keyField: "authorKey",
    keyColumn: "author_key",
  },
  "/coorg-invitations": {
    table: "coorg_invitations",
    keyField: "inviterKey",
    keyColumn: "inviter_key",
  },
  "/coorg-invitation-responses": {
    table: "coorg_invitation_responses",
    keyField: "inviteeKey",
    keyColumn: "invitee_key",
  },
  "/coorg-invitation-revocations": {
    table: "coorg_invitation_revocations",
    keyField: "inviterKey",
    keyColumn: "inviter_key",
  },
  "/events": { table: "events", keyField: "createdBy", keyColumn: "created_by" },
  "/event-cancellations": {
    table: "event_cancellations",
    keyField: "createdBy",
    keyColumn: "created_by",
  },
  "/redemptions": {
    table: "redemptions",
    keyField: "redeemedBy",
    keyColumn: "redeemed_by",
  },
  "/invite-revocations": {
    table: "invite_revocations",
    keyField: "inviterKey",
    keyColumn: "inviter_key",
  },
  // Invite announcements (schema v29): hash-only registration at
  // issue time by the inviter's device. keyField doubles as the
  // write-membership gate's attribution — only members can announce.
  "/invite-announcements": {
    table: "invite_announcements",
    keyField: "inviterKey",
    keyColumn: "inviter_key",
  },
  "/awaiting-transitions": {
    table: "awaiting_transitions",
    keyField: "signedBy",
    keyColumn: "signed_by",
  },
  // LWW state records: the ceilings bound row COUNT, and LWW updates
  // replace in place, so an honest project's lifetime of edits costs
  // one row per project/task.
  "/project-states": {
    table: "project_states",
    keyField: "signerKey",
    keyColumn: "signer_key",
  },
  "/task-states": {
    table: "task_states",
    keyField: "signerKey",
    keyColumn: "signer_key",
  },
  "/event-rsvps": {
    table: "event_rsvps",
    keyField: "signerKey",
    keyColumn: "signer_key",
  },
  "/event-shifts": {
    table: "event_shifts",
    keyField: "signerKey",
    keyColumn: "signer_key",
  },
  "/shift-signups": {
    table: "shift_signups",
    keyField: "signerKey",
    keyColumn: "signer_key",
  },
  "/seed-vault-pledges": {
    table: "seed_vault_pledges",
    keyField: "signerKey",
    keyColumn: "signer_key",
  },
  // Member removal / reinstatement (docs/member-removal.md): multi-
  // signed records — no single attributable body key, so only the
  // table ceiling applies (the route's quorum-of-members check is
  // the real spam bound: each record costs REMOVAL_QUORUM member
  // signatures).
  "/member-removals": {
    table: "member_removals",
    keyField: null,
    keyColumn: null,
  },
  "/member-reinstatements": {
    table: "member_reinstatements",
    keyField: null,
    keyColumn: null,
  },
  // Proposal federation G1: member-gated governance writes.
  "/proposals": {
    table: "proposals",
    keyField: "signerKey",
    keyColumn: "proposer_key",
  },
  "/votes": { table: "votes", keyField: "signerKey", keyColumn: "voter_key" },
  "/proposal-closures": {
    table: "proposal_closures",
    keyField: "signerKey",
    keyColumn: "closer_key",
  },
  // The auto-confirm batch inserts into exchanges; the requests carry
  // per-item keys, so only the table ceiling applies here. (An
  // attacker spending their own keys against the per-key exchange cap
  // still hits it via POST /exchanges; the system-signed path is
  // bounded by bindToPost + the window.)
  "/auto-confirm": { table: "exchanges", keyField: null, keyColumn: null },
};

export function registerInsertCapGuard(
  app: FastifyInstance,
  deps: { db: DatabaseType; config: InsertCapConfig },
): void {
  const { db, config } = deps;
  if (config.tableRowCeiling <= 0 && config.perKeyRowCeiling <= 0) return;

  // Prepared per table at registration; COUNTs ride the key/PK
  // indexes (migration v15 added the few that were missing).
  const tableCount = new Map<string, () => number>();
  const keyCount = new Map<string, (key: string) => number>();
  for (const s of Object.values(SURFACES)) {
    if (!tableCount.has(s.table)) {
      const stmt = db.prepare(`SELECT COUNT(*) AS n FROM ${s.table}`);
      tableCount.set(s.table, () => (stmt.get() as { n: number }).n);
    }
    if (s.keyColumn && !keyCount.has(s.table)) {
      const stmt = db.prepare(
        `SELECT COUNT(*) AS n FROM ${s.table} WHERE ${s.keyColumn} = ?`,
      );
      keyCount.set(s.table, (key) => (stmt.get(key) as { n: number }).n);
    }
  }

  app.addHook("preHandler", async (req, reply) => {
    if (req.method !== "POST") return;
    const surface = SURFACES[req.url.split("?")[0]];
    if (!surface) return;

    if (config.tableRowCeiling > 0) {
      const n = tableCount.get(surface.table)!();
      if (n >= config.tableRowCeiling) {
        reply.code(507);
        return reply.send({ error: "capacity_reached", scope: "table" });
      }
    }

    if (config.perKeyRowCeiling > 0 && surface.keyField) {
      const body = req.body as Record<string, unknown> | null;
      const key =
        body && typeof body[surface.keyField] === "string"
          ? (body[surface.keyField] as string)
          : null;
      if (key) {
        const n = keyCount.get(surface.table)!(key);
        if (n >= config.perKeyRowCeiling) {
          reply.code(507);
          return reply.send({ error: "capacity_reached", scope: "key" });
        }
      }
    }
  });
}
