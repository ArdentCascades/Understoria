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
import {
  canonicalMemberRemovalPayload,
  canonicalMemberReinstatementPayload,
  REMOVAL_REASON_MAX_LENGTH,
  sign,
  verify,
} from "@understoria/shared/crypto";
import type {
  MemberRemoval,
  MemberRemovalPayload,
  MemberReinstatement,
  MemberReinstatementPayload,
} from "@understoria/shared/types";
import { db, getSetting, SETTING_KEYS } from "@/db/database";
import { getSecretKey } from "@/db/secrets";
import {
  enqueueMemberRemovalOutbox,
  enqueueMemberReinstatementOutbox,
  flushOutboxNow,
} from "@/lib/outbox";
import { uuid } from "@/lib/id";

/*
 * The co-signing ceremony — docs/member-removal.md Phase M2 (+M3:
 * reinstatement is the same ceremony with the opposite record kind).
 *
 * Delivery leg, same delta as guardian shards: direct messages have
 * no transport in this codebase, so signature fragments travel
 * DEVICE-TO-DEVICE — the proposer shows the unsigned draft as a QR,
 * each co-signer's device signs the canonical payload and answers
 * with a fragment QR, and the proposer's device assembles the full
 * record once quorum is reached. Nothing is enforceable until the
 * assembled record exists; a photographed draft or fragment leaks
 * only what the final record makes public anyway.
 *
 * v1 keeps `proposalId: null`: deliberation happens where the
 * community talks (proposals remain per-device local today), and the
 * SIGNATURES are what bind — the named dependency from the plan, not
 * a blocker.
 */

export type CeremonyKind = "removal" | "reinstatement";

const DRAFT_KIND = "understoria-removal-draft";
const FRAGMENT_KIND = "understoria-removal-cosign";

type CeremonyPayload = MemberRemovalPayload | MemberReinstatementPayload;

export interface CeremonyDraft {
  recordKind: CeremonyKind;
  payload: CeremonyPayload;
  /** Serialized draft the proposer shows as a QR. */
  draftText: string;
  /** The proposer's own signature entry, collected up front. */
  signatures: { signerKey: string; signature: string }[];
}

function canonicalFor(kind: CeremonyKind, payload: CeremonyPayload): string {
  return kind === "removal"
    ? canonicalMemberRemovalPayload(payload as MemberRemovalPayload)
    : canonicalMemberReinstatementPayload(
        payload as MemberReinstatementPayload,
      );
}

function subjectOf(kind: CeremonyKind, payload: CeremonyPayload): string {
  return kind === "removal"
    ? (payload as MemberRemovalPayload).removedKey
    : (payload as MemberReinstatementPayload).reinstatedKey;
}

export type MintResult =
  | { ok: true; draft: CeremonyDraft }
  | { ok: false; error: "no_identity" | "locked" | "self_subject" | "bad_reason" };

/** Proposer side: build the payload, sign it, produce the draft QR
 *  text. The proposer's signature is the first of the quorum. */
export async function mintCeremonyDraft(
  recordKind: CeremonyKind,
  subjectKey: string,
  reason: string | null,
): Promise<MintResult> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return { ok: false, error: "no_identity" };
  if (me === subjectKey) return { ok: false, error: "self_subject" };
  const trimmed = reason?.trim() ?? "";
  if (trimmed.length > REMOVAL_REASON_MAX_LENGTH) {
    return { ok: false, error: "bad_reason" };
  }
  let secret: string;
  try {
    secret = await getSecretKey(me);
  } catch {
    return { ok: false, error: "locked" };
  }
  const nodeId = (await getSetting(SETTING_KEYS.nodeId)) ?? "node_local";
  const base = {
    id: uuid(),
    reason: trimmed.length > 0 ? trimmed : null,
    decidedAt: Date.now(),
    nodeId,
    proposalId: null,
  };
  const payload: CeremonyPayload =
    recordKind === "removal"
      ? { ...base, removedKey: subjectKey }
      : { ...base, reinstatedKey: subjectKey };
  const signature = sign(canonicalFor(recordKind, payload), secret);
  return {
    ok: true,
    draft: {
      recordKind,
      payload,
      draftText: JSON.stringify({ kind: DRAFT_KIND, recordKind, payload }),
      signatures: [{ signerKey: me, signature }],
    },
  };
}

export interface ParsedDraft {
  recordKind: CeremonyKind;
  payload: CeremonyPayload;
  subjectKey: string;
  reason: string | null;
}

export type ParseDraftResult =
  | { ok: true; draft: ParsedDraft }
  | { ok: false; error: "not_a_draft" };

/** Co-signer side, step 1: parse a captured draft so the UI can show
 *  WHO and WHY before anything is signed. */
export function parseCeremonyDraft(text: string): ParseDraftResult {
  try {
    const raw = JSON.parse(text) as {
      kind?: unknown;
      recordKind?: unknown;
      payload?: CeremonyPayload;
    };
    if (
      raw.kind !== DRAFT_KIND ||
      (raw.recordKind !== "removal" && raw.recordKind !== "reinstatement") ||
      !raw.payload ||
      typeof raw.payload !== "object" ||
      typeof raw.payload.id !== "string" ||
      typeof raw.payload.decidedAt !== "number"
    ) {
      return { ok: false, error: "not_a_draft" };
    }
    const subjectKey = subjectOf(raw.recordKind, raw.payload);
    if (typeof subjectKey !== "string" || subjectKey.length === 0) {
      return { ok: false, error: "not_a_draft" };
    }
    return {
      ok: true,
      draft: {
        recordKind: raw.recordKind,
        payload: raw.payload,
        subjectKey,
        reason: typeof raw.payload.reason === "string" ? raw.payload.reason : null,
      },
    };
  } catch {
    return { ok: false, error: "not_a_draft" };
  }
}

export type CoSignResult =
  | { ok: true; fragmentText: string }
  | { ok: false; error: "no_identity" | "locked" | "self_subject" };

/** Co-signer side, step 2 (after the human confirmed): sign the
 *  canonical payload and produce the fragment QR text. */
export async function coSignDraft(draft: ParsedDraft): Promise<CoSignResult> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return { ok: false, error: "no_identity" };
  if (me === draft.subjectKey) return { ok: false, error: "self_subject" };
  let secret: string;
  try {
    secret = await getSecretKey(me);
  } catch {
    return { ok: false, error: "locked" };
  }
  const signature = sign(canonicalFor(draft.recordKind, draft.payload), secret);
  return {
    ok: true,
    fragmentText: JSON.stringify({
      kind: FRAGMENT_KIND,
      recordKind: draft.recordKind,
      id: draft.payload.id,
      signerKey: me,
      signature,
    }),
  };
}

export type CollectResult =
  | { ok: true; entry: { signerKey: string; signature: string } }
  | {
      ok: false;
      error:
        | "not_a_fragment"
        | "different_record"
        | "subject_signature"
        | "duplicate"
        | "bad_signature";
    };

/** Proposer side: validate a captured co-signature fragment against
 *  the draft and the entries already collected. */
export function collectCosignFragment(
  text: string,
  draft: CeremonyDraft,
): CollectResult {
  let raw: {
    kind?: unknown;
    recordKind?: unknown;
    id?: unknown;
    signerKey?: unknown;
    signature?: unknown;
  };
  try {
    raw = JSON.parse(text) as typeof raw;
  } catch {
    return { ok: false, error: "not_a_fragment" };
  }
  if (
    raw.kind !== FRAGMENT_KIND ||
    typeof raw.signerKey !== "string" ||
    typeof raw.signature !== "string"
  ) {
    return { ok: false, error: "not_a_fragment" };
  }
  if (raw.recordKind !== draft.recordKind || raw.id !== draft.payload.id) {
    return { ok: false, error: "different_record" };
  }
  if (raw.signerKey === subjectOf(draft.recordKind, draft.payload)) {
    return { ok: false, error: "subject_signature" };
  }
  if (draft.signatures.some((s) => s.signerKey === raw.signerKey)) {
    return { ok: false, error: "duplicate" };
  }
  if (
    !verify(
      canonicalFor(draft.recordKind, draft.payload),
      raw.signature,
      raw.signerKey,
    )
  ) {
    return { ok: false, error: "bad_signature" };
  }
  return {
    ok: true,
    entry: { signerKey: raw.signerKey, signature: raw.signature },
  };
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: "not_enough" };

/**
 * Assemble the full record and queue it for the node. Deliberately
 * NOT written to the local record tables here: the node's closure
 * check is the authority (it may still answer 403 last_founder or
 * 409 quorum_not_met), and the record flows back through the normal
 * pull once accepted — one source of truth, no optimistic state to
 * roll back. The outbox retries transient failures.
 */
export async function submitCeremonyRecord(
  draft: CeremonyDraft,
  quorum: number,
): Promise<SubmitResult> {
  if (draft.signatures.length < quorum) {
    return { ok: false, error: "not_enough" };
  }
  if (draft.recordKind === "removal") {
    const record: MemberRemoval = {
      ...(draft.payload as MemberRemovalPayload),
      signatures: draft.signatures,
    };
    await enqueueMemberRemovalOutbox(record);
  } else {
    const record: MemberReinstatement = {
      ...(draft.payload as MemberReinstatementPayload),
      signatures: draft.signatures,
    };
    await enqueueMemberReinstatementOutbox(record);
  }
  void flushOutboxNow().catch(() => {});
  return { ok: true };
}

/** Look up a display name for the friction copy (falls back to the
 *  key's short form at the call site). */
export async function memberDisplayName(key: string): Promise<string | null> {
  const row = await db.members.get(key);
  return row?.displayName ?? null;
}
