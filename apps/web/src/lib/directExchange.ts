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
  canonicalExchangePayload,
  isDirectExchangeLabel,
  sign,
  verify,
} from "@understoria/shared/crypto";
import { CATEGORIES } from "@understoria/shared/types";
import type { Category, Exchange } from "@/types";
import { db, getSetting, SETTING_KEYS } from "@/db/database";
import { getSecretKey } from "@/db/secrets";
import { getNodeConfig } from "@/db/nodeConfig";
import { recordExchangeRowLocally } from "@/lib/inPersonExchange";
import { flushOutboxNow } from "@/lib/outbox";
import { evaluateSafeguards, exceedsDailyLimit } from "@/lib/safeguards";
import { uuid } from "@/lib/id";

/*
 * Direct-exchange recording ceremony — docs/direct-exchange-label.md
 * (adopted). Credit for help that has no post and no project task to
 * hang an exchange on: a plain event's setup crew, "she saw me
 * struggling with the fence and spent two hours on it."
 *
 * Same two-QR round trip as the in-person post confirmation
 * (lib/inPersonExchange.ts), with two deliberate differences:
 *
 * - `postId` is `direct:<uuid>` — freshly random, derived from
 *   NOTHING (the §3 permanent boundary: `Exchange` federates, so a
 *   label derived from an event/shift/date/member would publish the
 *   attendance graph community-events.md §11.1 rejected). The offer
 *   parser refuses any postId that fails `isDirectExchangeLabel`.
 * - EITHER party may initiate (§6.2: the profile doorway reads
 *   "the member you helped / who helped you"), so the offer carries
 *   `signerRole` and the minter signs their OWN side; the scanner
 *   must be the other named party and co-signs theirs. Consent is
 *   structural (§5): nothing exists until both members' keys have
 *   signed the same canonical bytes — the same
 *   `canonicalExchangePayload` the online confirm flow signs.
 *
 * There is deliberately NO same-device shortcut and NO retroactive
 * bulk entry (§7): one exchange per ceremony, each party signing on
 * the device that holds their key.
 */

const OFFER_KIND = "understoria-direct-offer";
const RECEIPT_KIND = "understoria-direct-receipt";

export type DirectRole = "helper" | "helped";

/** Honest-backdating bound (§7): a last-week moment may be recorded
 *  late, but a claim older than this is history, not a record the
 *  counterparty can meaningfully review on the spot. The server
 *  additionally refuses completedAt beyond a day in the future. */
export const MAX_BACKDATE_MS = 30 * 24 * 60 * 60 * 1000;
const FUTURE_SKEW_MS = 5 * 60 * 1000;

function timeOutOfBounds(completedAt: number, now: number): boolean {
  return (
    !Number.isFinite(completedAt) ||
    completedAt <= 0 ||
    completedAt > now + FUTURE_SKEW_MS ||
    completedAt < now - MAX_BACKDATE_MS
  );
}

export interface DirectExchangeOffer {
  /** The exchange id BOTH devices will store — minted once, so double
   *  delivery heals by the node's dedup-by-id. */
  id: string;
  /** `direct:<uuid>` — random noise, meaningless to every observer. */
  postId: string;
  helperKey: string;
  helpedKey: string;
  hours: number;
  category: Category;
  completedAt: number;
  nodeId: string;
  /** Which side the MINTER occupies (and signed). */
  signerRole: DirectRole;
  signature: string;
  /** Serialized offer the initiator shows as a QR. */
  offerText: string;
}

export type MintDirectOfferResult =
  | { ok: true; offer: DirectExchangeOffer }
  | {
      ok: false;
      error:
        | "no_identity"
        | "locked"
        | "self_exchange"
        | "counterparty_unknown"
        | "bad_hours"
        | "bad_time";
    };

/**
 * Initiator, step 1: name the counterparty and the direction ("I
 * helped them" / "they helped me"), state the actual hours
 * (`equal-time`: the pair records what the help really took), pick
 * the category, and sign your own side of the canonical payload.
 */
export async function mintDirectExchangeOffer(input: {
  counterpartyKey: string;
  role: DirectRole;
  hours: number;
  category: Category;
  completedAt?: number;
}): Promise<MintDirectOfferResult> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return { ok: false, error: "no_identity" };
  if (input.counterpartyKey === me) {
    return { ok: false, error: "self_exchange" };
  }
  // The counterparty must be a member this device knows — the review
  // screen's name + fingerprint check is only meaningful against a
  // held member row, and a key from outside the community could never
  // co-sign anyway.
  const counterparty = await db.members.get(input.counterpartyKey);
  if (!counterparty) return { ok: false, error: "counterparty_unknown" };
  if (!Number.isFinite(input.hours) || input.hours <= 0) {
    return { ok: false, error: "bad_hours" };
  }
  const now = Date.now();
  const completedAt = input.completedAt ?? now;
  if (timeOutOfBounds(completedAt, now)) {
    return { ok: false, error: "bad_time" };
  }
  let secret: string;
  try {
    secret = await getSecretKey(me);
  } catch {
    return { ok: false, error: "locked" };
  }
  const nodeId = (await getSetting(SETTING_KEYS.nodeId)) ?? "node_local";
  const helperKey = input.role === "helper" ? me : input.counterpartyKey;
  const helpedKey = input.role === "helper" ? input.counterpartyKey : me;
  const postId = `direct:${uuid()}`;
  const signature = sign(
    canonicalExchangePayload({
      postId,
      helperKey,
      helpedKey,
      hours: input.hours,
      category: input.category,
      completedAt,
    }),
    secret,
  );
  const fields = {
    id: uuid(),
    postId,
    helperKey,
    helpedKey,
    hours: input.hours,
    category: input.category,
    completedAt,
    nodeId,
    signerRole: input.role,
    signature,
  };
  return {
    ok: true,
    offer: {
      ...fields,
      offerText: JSON.stringify({ kind: OFFER_KIND, ...fields }),
    },
  };
}

export interface ParsedDirectOffer {
  id: string;
  postId: string;
  helperKey: string;
  helpedKey: string;
  hours: number;
  category: Category;
  completedAt: number;
  nodeId: string;
  signerRole: DirectRole;
  signature: string;
  /** The key that signed the offer (the initiator). */
  signerKey: string;
  /** Display name of the initiator, when this device holds their
   *  member row. */
  signerName: string | null;
  /** The scanner's role — always the opposite of signerRole. */
  myRole: DirectRole;
}

export type ParseDirectOfferResult =
  | { ok: true; offer: ParsedDirectOffer }
  | {
      ok: false;
      error:
        | "not_an_offer"
        | "no_identity"
        | "not_direct_label"
        | "wrong_member"
        | "bad_time"
        | "bad_signature";
    };

/**
 * Counterparty, step 1: validate a captured offer so the review
 * screen can show WHO (name + fingerprint), the direction, hours,
 * category, and when — before anything is signed. Refuses any offer
 * whose label fails the `direct:` grammar, whose parties don't
 * include this member opposite the signer, or whose signature does
 * not verify against the signer's own key.
 */
export async function parseDirectExchangeOffer(
  text: string,
): Promise<ParseDirectOfferResult> {
  let raw: {
    kind?: unknown;
    id?: unknown;
    postId?: unknown;
    helperKey?: unknown;
    helpedKey?: unknown;
    hours?: unknown;
    category?: unknown;
    completedAt?: unknown;
    nodeId?: unknown;
    signerRole?: unknown;
    signature?: unknown;
  };
  try {
    raw = JSON.parse(text) as typeof raw;
  } catch {
    return { ok: false, error: "not_an_offer" };
  }
  if (
    raw.kind !== OFFER_KIND ||
    typeof raw.id !== "string" ||
    raw.id.length === 0 ||
    typeof raw.postId !== "string" ||
    typeof raw.helperKey !== "string" ||
    raw.helperKey.length === 0 ||
    typeof raw.helpedKey !== "string" ||
    raw.helpedKey.length === 0 ||
    raw.helperKey === raw.helpedKey ||
    typeof raw.hours !== "number" ||
    !Number.isFinite(raw.hours) ||
    raw.hours <= 0 ||
    typeof raw.category !== "string" ||
    !(CATEGORIES as readonly string[]).includes(raw.category) ||
    typeof raw.completedAt !== "number" ||
    typeof raw.nodeId !== "string" ||
    (raw.signerRole !== "helper" && raw.signerRole !== "helped") ||
    typeof raw.signature !== "string"
  ) {
    return { ok: false, error: "not_an_offer" };
  }
  // THE lock: only the sanctioned structureless namespace may travel
  // this ceremony. `direct:event-123` is not a direct exchange no
  // matter how well-signed it is.
  if (!isDirectExchangeLabel(raw.postId)) {
    return { ok: false, error: "not_direct_label" };
  }
  if (timeOutOfBounds(raw.completedAt, Date.now())) {
    return { ok: false, error: "bad_time" };
  }
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return { ok: false, error: "no_identity" };
  const signerRole = raw.signerRole as DirectRole;
  const signerKey = signerRole === "helper" ? raw.helperKey : raw.helpedKey;
  const myKey = signerRole === "helper" ? raw.helpedKey : raw.helperKey;
  // Only the OTHER named party may co-sign: the scanner standing in
  // front of the initiator must be the member the record names
  // opposite them.
  if (me !== myKey) return { ok: false, error: "wrong_member" };
  const canonical = canonicalExchangePayload({
    postId: raw.postId,
    helperKey: raw.helperKey,
    helpedKey: raw.helpedKey,
    hours: raw.hours,
    category: raw.category as Category,
    completedAt: raw.completedAt,
  });
  if (!verify(canonical, raw.signature, signerKey)) {
    return { ok: false, error: "bad_signature" };
  }
  const signerRow = await db.members.get(signerKey);
  return {
    ok: true,
    offer: {
      id: raw.id,
      postId: raw.postId,
      helperKey: raw.helperKey,
      helpedKey: raw.helpedKey,
      hours: raw.hours,
      category: raw.category as Category,
      completedAt: raw.completedAt,
      nodeId: raw.nodeId,
      signerRole,
      signature: raw.signature,
      signerKey,
      signerName: signerRow?.displayName ?? null,
      myRole: signerRole === "helper" ? "helped" : "helper",
    },
  };
}

export type AcceptDirectOfferResult =
  | { ok: true; receiptText: string; exchange: Exchange; duplicate: boolean }
  | {
      ok: false;
      error: "no_identity" | "locked" | "wrong_member" | "daily_limit";
    };

/**
 * Counterparty, step 2 (after the human reviewed and confirmed):
 * co-sign the canonical payload, build the COMPLETE exchange, store
 * and enqueue it, and produce the receipt QR carrying the finished
 * record. Anti-gaming posture is identical to every other path —
 * the daily limit is a hard stop, the pattern flags ride the record
 * (§5: a direct exchange is MORE likely to trip the reciprocal
 * flag, which is correct and wanted).
 *
 * Idempotent on the offer id: re-accepting returns the stored
 * record's receipt without writing anything twice.
 */
export async function acceptDirectExchangeOffer(
  offer: ParsedDirectOffer,
): Promise<AcceptDirectOfferResult> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return { ok: false, error: "no_identity" };
  const myKey = offer.signerRole === "helper" ? offer.helpedKey : offer.helperKey;
  if (me !== myKey) return { ok: false, error: "wrong_member" };
  let secret: string;
  try {
    secret = await getSecretKey(me);
  } catch {
    return { ok: false, error: "locked" };
  }
  const nodeConfig = await getNodeConfig(offer.nodeId);

  const result = await db.transaction(
    "rw",
    [db.exchanges, db.achievements, db.outbox, db.settings, db.members],
    async (): Promise<AcceptDirectOfferResult> => {
      const already = await db.exchanges.get(offer.id);
      if (already) {
        return {
          ok: true,
          receiptText: JSON.stringify({ kind: RECEIPT_KIND, exchange: already }),
          exchange: already,
          duplicate: true,
        };
      }
      const existingExchanges = await db.exchanges.toArray();
      if (
        exceedsDailyLimit(
          offer.helperKey,
          existingExchanges,
          offer.completedAt,
          nodeConfig,
        )
      ) {
        return { ok: false, error: "daily_limit" };
      }
      const flag = evaluateSafeguards(
        {
          helperKey: offer.helperKey,
          helpedKey: offer.helpedKey,
          hoursExchanged: offer.hours,
          completedAt: offer.completedAt,
        },
        existingExchanges,
        nodeConfig,
      );
      const mySignature = sign(
        canonicalExchangePayload({
          postId: offer.postId,
          helperKey: offer.helperKey,
          helpedKey: offer.helpedKey,
          hours: offer.hours,
          category: offer.category,
          completedAt: offer.completedAt,
        }),
        secret,
      );
      const exchange: Exchange = {
        id: offer.id,
        postId: offer.postId,
        helperKey: offer.helperKey,
        helpedKey: offer.helpedKey,
        hoursExchanged: offer.hours,
        helperSignature:
          offer.signerRole === "helper" ? offer.signature : mySignature,
        helpedSignature:
          offer.signerRole === "helped" ? offer.signature : mySignature,
        completedAt: offer.completedAt,
        category: offer.category,
        nodeId: offer.nodeId,
        ...(flag.flaggedForReview
          ? { flaggedForReview: true, flagReason: flag.flagReason }
          : {}),
      };
      await recordExchangeRowLocally(exchange);
      return {
        ok: true,
        receiptText: JSON.stringify({ kind: RECEIPT_KIND, exchange }),
        exchange,
        duplicate: false,
      };
    },
  );

  if (result.ok && !result.duplicate) kickOutbox();
  return result;
}

export type CollectDirectReceiptResult =
  | { ok: true; exchange: Exchange; duplicate: boolean }
  | { ok: false; error: "not_a_receipt" | "different_record" | "bad_signature" };

/**
 * Initiator, step 2: verify a captured receipt against the offer this
 * device minted — BOTH signatures over the canonical payload, every
 * canonical field byte-equal to the offer, own signature unchanged —
 * then store and enqueue the identical record. Replaying the same
 * receipt is a duplicate no-op.
 */
export async function collectDirectExchangeReceipt(
  text: string,
  offer: DirectExchangeOffer,
): Promise<CollectDirectReceiptResult> {
  let raw: { kind?: unknown; exchange?: unknown };
  try {
    raw = JSON.parse(text) as typeof raw;
  } catch {
    return { ok: false, error: "not_a_receipt" };
  }
  if (
    raw.kind !== RECEIPT_KIND ||
    !raw.exchange ||
    typeof raw.exchange !== "object"
  ) {
    return { ok: false, error: "not_a_receipt" };
  }
  const x = raw.exchange as Partial<Exchange> & { autoConfirmed?: unknown };
  if (
    typeof x.id !== "string" ||
    typeof x.helperSignature !== "string" ||
    typeof x.helpedSignature !== "string"
  ) {
    return { ok: false, error: "not_a_receipt" };
  }
  const mySignature =
    offer.signerRole === "helper" ? x.helperSignature : x.helpedSignature;
  // The receipt must be THE record the offer described — id, every
  // canonically signed field, and the initiator's own signature
  // byte-identical. Direct records are member-signed by construction;
  // an autoConfirmed marker can only be an impostor payload.
  if (
    x.id !== offer.id ||
    x.postId !== offer.postId ||
    x.helperKey !== offer.helperKey ||
    x.helpedKey !== offer.helpedKey ||
    x.hoursExchanged !== offer.hours ||
    x.category !== offer.category ||
    x.completedAt !== offer.completedAt ||
    x.nodeId !== offer.nodeId ||
    mySignature !== offer.signature ||
    x.autoConfirmed !== undefined
  ) {
    return { ok: false, error: "different_record" };
  }
  const canonical = canonicalExchangePayload({
    postId: offer.postId,
    helperKey: offer.helperKey,
    helpedKey: offer.helpedKey,
    hours: offer.hours,
    category: offer.category,
    completedAt: offer.completedAt,
  });
  if (
    !verify(canonical, x.helperSignature, offer.helperKey) ||
    !verify(canonical, x.helpedSignature, offer.helpedKey)
  ) {
    return { ok: false, error: "bad_signature" };
  }

  const exchange: Exchange = {
    id: x.id,
    postId: offer.postId,
    helperKey: offer.helperKey,
    helpedKey: offer.helpedKey,
    hoursExchanged: offer.hours,
    helperSignature: x.helperSignature,
    helpedSignature: x.helpedSignature,
    completedAt: offer.completedAt,
    category: offer.category,
    nodeId: offer.nodeId,
    ...(x.flaggedForReview === true
      ? {
          flaggedForReview: true,
          ...(x.flagReason === "short_duration" ||
          x.flagReason === "reciprocal_pattern" ||
          x.flagReason === "daily_limit_warning"
            ? { flagReason: x.flagReason }
            : {}),
        }
      : {}),
  };

  const result = await db.transaction(
    "rw",
    [db.exchanges, db.achievements, db.outbox, db.settings, db.members],
    async (): Promise<CollectDirectReceiptResult> => {
      const already = await db.exchanges.get(exchange.id);
      if (already) return { ok: true, exchange: already, duplicate: true };
      await recordExchangeRowLocally(exchange);
      return { ok: true, exchange, duplicate: false };
    },
  );

  if (result.ok && !result.duplicate) kickOutbox();
  return result;
}

function kickOutbox(): void {
  void flushOutboxNow().catch(() => {});
}

/** Shallow shape check for the capture surface's paste fallback
 *  (`PairDeviceCapture.acceptsText`): is this text SOME direct-
 *  ceremony payload? Full validation stays with parse/collect — this
 *  only stops the paste box advancing on unrelated text. */
export function isDirectCeremonyText(raw: string): boolean {
  try {
    const kind = (JSON.parse(raw) as { kind?: unknown }).kind;
    return kind === OFFER_KIND || kind === RECEIPT_KIND;
  } catch {
    return false;
  }
}
