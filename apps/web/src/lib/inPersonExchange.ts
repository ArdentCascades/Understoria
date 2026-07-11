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
  sign,
  verify,
} from "@understoria/shared/crypto";
import { CATEGORIES } from "@understoria/shared/types";
import type { Category, Exchange, FlagReason, Post } from "@/types";
import { db, getSetting, SETTING_KEYS } from "@/db/database";
import { getSecretKey } from "@/db/secrets";
import { getNodeConfig } from "@/db/nodeConfig";
import { diffAchievements } from "@/lib/achievements";
import { computeZoneReachForHelper } from "@/lib/flow";
import { enqueueExchangeOutbox, flushOutboxNow } from "@/lib/outbox";
import { evaluateSafeguards, exceedsDailyLimit } from "@/lib/safeguards";
import { uuid } from "@/lib/id";

/*
 * In-person exchange over QR — docs/offline-resilience.md §5.
 *
 * Two members meet with no network at all (no node, no storm hub) and
 * confirm a completed exchange phone-to-phone. Same two-QR round-trip
 * shape as the removal ceremony (lib/removalCeremony.ts) and the same
 * delivery posture as guardian shards:
 *
 *   helper mints OFFER (helper-signed canonical payload, QR)
 *     → helped member scans, REVIEWS hours/category/who on their own
 *       screen (with the helper's key fingerprint, as device pairing
 *       does), co-signs, stores the COMPLETE exchange, answers with a
 *       RECEIPT QR carrying the finished record
 *     → helper scans the receipt, verifies BOTH signatures against
 *       the offer they minted, stores the identical record.
 *
 * Both devices end up holding ONE identical Exchange row and each
 * enqueues it in its outbox. The exchange `id` is minted ONCE, at
 * offer time, and rides the whole trip — so when connectivity returns
 * and both outboxes drain, the node's dedup-by-id (POST /exchanges is
 * idempotent on the exchange id, same guarantee confirmExchange's
 * outbox path relies on) keeps a single copy, exactly as if the
 * record had been submitted once.
 *
 * Threat-model note (docs/threat-model.md §7 / offline doc §7): every
 * field the OFFER and RECEIPT QRs carry — postId, the two member
 * keys, hours, category, completedAt, nodeId, and the signatures —
 * is already public in the final federated exchange record. A
 * photographed QR leaks nothing the ledger doesn't publish, and
 * nothing is enforceable until both signatures exist. The capture
 * surface refuses payloads whose signer isn't a party to the post
 * the scanner already holds, and the review step shows the helper's
 * key fingerprint so the human can check WHO they are crediting.
 *
 * THIS flow is post-attached: it hangs off an EXISTING claimed post
 * both members already hold (a NEED claimed by the helper, or an
 * OFFER claimed by the helped member). Post-less "spontaneous help"
 * is the now-adopted direct-exchange-label design and lives in its
 * own ceremony, lib/directExchange.ts, which shares this module's
 * two-QR shape and reuses `recordExchangeRowLocally` below.
 */

const OFFER_KIND = "understoria-exchange-offer";
const RECEIPT_KIND = "understoria-exchange-receipt";

/** Who helped whom, derived from the post exactly the way
 *  `confirmExchange` derives it. Null while the post is unclaimed. */
export function exchangeParties(
  post: Post,
): { helperKey: string; helpedKey: string } | null {
  if (!post.claimedBy) return null;
  return post.type === "NEED"
    ? { helperKey: post.claimedBy, helpedKey: post.postedBy }
    : { helperKey: post.postedBy, helpedKey: post.claimedBy };
}

/** True when the post is in a state the normal confirm flow would
 *  accept a confirmation for — the same status gate `confirmExchange`
 *  applies before it will sign anything. */
export function postConfirmable(post: Post): boolean {
  return (
    (post.status === "claimed" || post.status === "awaiting_confirmation") &&
    !!post.claimedBy
  );
}

export interface ExchangeOffer {
  /** The exchange id BOTH devices will store — minted here, once, so
   *  double delivery heals by the node's dedup-by-id. */
  id: string;
  postId: string;
  helperKey: string;
  helpedKey: string;
  hours: number;
  category: Category;
  completedAt: number;
  nodeId: string;
  helperSignature: string;
  /** Serialized offer the helper shows as a QR. */
  offerText: string;
}

export type MintOfferResult =
  | { ok: true; offer: ExchangeOffer }
  | {
      ok: false;
      error:
        | "no_identity"
        | "locked"
        | "post_missing"
        | "already_completed"
        | "not_confirmable"
        | "not_helper"
        | "bad_hours";
    };

/**
 * Helper side, step 1: sign the canonical exchange payload (the exact
 * bytes `confirmExchange` signs — `canonicalExchangePayload`) and
 * produce the offer QR text. `hours` defaults to the post's estimate,
 * matching what the normal confirm path credits; an override lets the
 * pair honestly record the hours the help actually took.
 */
export async function mintExchangeOffer(
  postId: string,
  hours?: number,
): Promise<MintOfferResult> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return { ok: false, error: "no_identity" };
  const post = await db.posts.get(postId);
  if (!post) return { ok: false, error: "post_missing" };
  if (post.status === "completed") {
    return { ok: false, error: "already_completed" };
  }
  if (!postConfirmable(post)) return { ok: false, error: "not_confirmable" };
  const parties = exchangeParties(post);
  if (!parties || parties.helperKey !== me) {
    return { ok: false, error: "not_helper" };
  }
  const effectiveHours = hours ?? post.estimatedHours;
  if (!Number.isFinite(effectiveHours) || effectiveHours <= 0) {
    return { ok: false, error: "bad_hours" };
  }
  let secret: string;
  try {
    secret = await getSecretKey(me);
  } catch {
    return { ok: false, error: "locked" };
  }
  const nodeId = (await getSetting(SETTING_KEYS.nodeId)) ?? "node_local";
  const completedAt = Date.now();
  const helperSignature = sign(
    canonicalExchangePayload({
      postId: post.id,
      helperKey: parties.helperKey,
      helpedKey: parties.helpedKey,
      hours: effectiveHours,
      category: post.category,
      completedAt,
    }),
    secret,
  );
  const fields = {
    id: uuid(),
    postId: post.id,
    helperKey: parties.helperKey,
    helpedKey: parties.helpedKey,
    hours: effectiveHours,
    category: post.category,
    completedAt,
    nodeId,
    helperSignature,
  };
  return {
    ok: true,
    offer: {
      ...fields,
      offerText: JSON.stringify({ kind: OFFER_KIND, ...fields }),
    },
  };
}

export interface ParsedExchangeOffer {
  id: string;
  postId: string;
  helperKey: string;
  helpedKey: string;
  hours: number;
  category: Category;
  completedAt: number;
  nodeId: string;
  helperSignature: string;
  /** Display name of the helper, when this device holds their member
   *  row (it should — they're a party to a post this device holds). */
  helperName: string | null;
  /** Title of the post being confirmed, for the review screen. */
  postTitle: string;
}

export type ParseOfferResult =
  | { ok: true; offer: ParsedExchangeOffer }
  | {
      ok: false;
      error:
        | "not_an_offer"
        | "no_identity"
        | "post_missing"
        | "already_completed"
        | "not_confirmable"
        | "post_mismatch"
        | "wrong_member"
        | "bad_signature";
    };

/**
 * Helped side, step 1: validate a captured offer so the UI can show
 * hours / category / WHO (with fingerprint) before anything is
 * signed. Refuses offers that don't match a post this device already
 * holds, offers naming parties other than the local post's parties,
 * and offers whose scanner isn't the helped counterparty.
 */
export async function parseExchangeOffer(
  text: string,
): Promise<ParseOfferResult> {
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
    helperSignature?: unknown;
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
    typeof raw.hours !== "number" ||
    !Number.isFinite(raw.hours) ||
    raw.hours <= 0 ||
    typeof raw.category !== "string" ||
    !(CATEGORIES as readonly string[]).includes(raw.category) ||
    typeof raw.completedAt !== "number" ||
    typeof raw.nodeId !== "string" ||
    typeof raw.helperSignature !== "string"
  ) {
    return { ok: false, error: "not_an_offer" };
  }
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return { ok: false, error: "no_identity" };
  const post = await db.posts.get(raw.postId);
  if (!post) return { ok: false, error: "post_missing" };
  if (post.status === "completed") {
    return { ok: false, error: "already_completed" };
  }
  if (!postConfirmable(post)) return { ok: false, error: "not_confirmable" };
  const parties = exchangeParties(post);
  // The offer must name exactly the parties (and category) this
  // device's copy of the post establishes — an offer crediting anyone
  // else is not an offer about this post, whatever it claims.
  if (
    !parties ||
    raw.helperKey !== parties.helperKey ||
    raw.helpedKey !== parties.helpedKey ||
    raw.category !== post.category
  ) {
    return { ok: false, error: "post_mismatch" };
  }
  // Only the helped counterparty may co-sign: the scanner standing in
  // front of the helper must be the member the record credits FROM.
  if (me !== raw.helpedKey) return { ok: false, error: "wrong_member" };
  const canonical = canonicalExchangePayload({
    postId: raw.postId,
    helperKey: raw.helperKey,
    helpedKey: raw.helpedKey,
    hours: raw.hours,
    category: raw.category as Category,
    completedAt: raw.completedAt,
  });
  if (!verify(canonical, raw.helperSignature, raw.helperKey)) {
    return { ok: false, error: "bad_signature" };
  }
  const helperRow = await db.members.get(raw.helperKey);
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
      helperSignature: raw.helperSignature,
      helperName: helperRow?.displayName ?? null,
      postTitle: post.title,
    },
  };
}

export type AcceptOfferResult =
  | { ok: true; receiptText: string; exchange: Exchange; duplicate: boolean }
  | {
      ok: false;
      error:
        | "no_identity"
        | "locked"
        | "wrong_member"
        | "post_missing"
        | "already_completed"
        | "not_confirmable"
        | "daily_limit";
    };

/**
 * Helped side, step 2 (after the human reviewed and confirmed):
 * co-sign the canonical payload, build the COMPLETE exchange, store
 * it with the same post-status writes `confirmExchange`'s
 * both-confirmed branch makes, enqueue it, and produce the receipt
 * QR text carrying the finished record.
 *
 * Idempotent on the offer id: accepting the same offer twice returns
 * the already-stored record's receipt (so the helped member can
 * re-show the receipt if the helper missed the scan) without writing
 * anything twice.
 */
export async function acceptExchangeOffer(
  offer: ParsedExchangeOffer,
): Promise<AcceptOfferResult> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return { ok: false, error: "no_identity" };
  if (me !== offer.helpedKey) return { ok: false, error: "wrong_member" };
  let secret: string;
  try {
    secret = await getSecretKey(me);
  } catch {
    return { ok: false, error: "locked" };
  }
  // Node config read outside the rw transaction, same as
  // confirmExchange, so the safeguard thresholds don't drag
  // nodeConfig into the write scope.
  const nodeConfig = await getNodeConfig(offer.nodeId);

  const result = await db.transaction(
    "rw",
    [db.posts, db.exchanges, db.achievements, db.outbox, db.settings, db.members],
    async (): Promise<AcceptOfferResult> => {
      const already = await db.exchanges.get(offer.id);
      if (already) {
        return {
          ok: true,
          receiptText: JSON.stringify({ kind: RECEIPT_KIND, exchange: already }),
          exchange: already,
          duplicate: true,
        };
      }
      const post = await db.posts.get(offer.postId);
      if (!post) return { ok: false, error: "post_missing" };
      if (post.status === "completed") {
        return { ok: false, error: "already_completed" };
      }
      if (!postConfirmable(post)) {
        return { ok: false, error: "not_confirmable" };
      }

      // Same anti-gaming posture as confirmExchange: the daily limit
      // is a hard stop, the pattern flags are advisory and ride the
      // record so BOTH devices (and eventually the node) hold the
      // same flagged row.
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

      const helpedSignature = sign(
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
        helperSignature: offer.helperSignature,
        helpedSignature,
        completedAt: offer.completedAt,
        category: offer.category,
        nodeId: offer.nodeId,
        ...(flag.flaggedForReview
          ? { flaggedForReview: true, flagReason: flag.flagReason }
          : {}),
      };
      await storeCompletedExchange(exchange, post);
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

export type CollectReceiptResult =
  | { ok: true; exchange: Exchange; duplicate: boolean }
  | {
      ok: false;
      error:
        | "not_a_receipt"
        | "different_record"
        | "bad_signature"
        | "post_missing";
    };

/**
 * Helper side, step 2: verify a captured receipt against the offer
 * this device minted — BOTH signatures over the canonical payload,
 * and every canonical field byte-equal to the offer — then store and
 * enqueue the identical record with the same post writes the helped
 * device made. Replaying the same receipt is a duplicate no-op.
 */
export async function collectExchangeReceipt(
  text: string,
  offer: ExchangeOffer | ParsedExchangeOffer,
): Promise<CollectReceiptResult> {
  let raw: { kind?: unknown; exchange?: unknown };
  try {
    raw = JSON.parse(text) as typeof raw;
  } catch {
    return { ok: false, error: "not_a_receipt" };
  }
  if (raw.kind !== RECEIPT_KIND || !raw.exchange || typeof raw.exchange !== "object") {
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
  // The receipt must be THE record the offer described — id and every
  // canonically signed field. Anything else is a different exchange,
  // however valid its signatures might be. In-person records are
  // member-signed by construction; an autoConfirmed marker can only
  // be an impostor payload.
  if (
    x.id !== offer.id ||
    x.postId !== offer.postId ||
    x.helperKey !== offer.helperKey ||
    x.helpedKey !== offer.helpedKey ||
    x.hoursExchanged !== offer.hours ||
    x.category !== offer.category ||
    x.completedAt !== offer.completedAt ||
    x.nodeId !== offer.nodeId ||
    x.helperSignature !== offer.helperSignature ||
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

  // Rebuild the record from the VERIFIED fields (advisory flags pass
  // through only in their expected shape) rather than storing an
  // attacker-shapeable object verbatim.
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
            ? { flagReason: x.flagReason as FlagReason }
            : {}),
        }
      : {}),
  };

  const result = await db.transaction(
    "rw",
    [db.posts, db.exchanges, db.achievements, db.outbox, db.settings, db.members],
    async (): Promise<CollectReceiptResult> => {
      const already = await db.exchanges.get(exchange.id);
      if (already) return { ok: true, exchange: already, duplicate: true };
      const post = await db.posts.get(exchange.postId);
      if (!post) return { ok: false, error: "post_missing" };
      await storeCompletedExchange(exchange, post);
      return { ok: true, exchange, duplicate: false };
    },
  );

  if (result.ok && !result.duplicate) kickOutbox();
  return result;
}

/**
 * The shared tail both sides run inside their rw transaction — the
 * exact local writes `confirmExchange`'s both-confirmed branch makes
 * once an Exchange exists: store the record, enqueue its outbox
 * mirror atomically, complete the post with both parties in
 * `confirmedBy`, and recompute achievements for both parties. Keeping
 * this identical is what makes the in-person path converge with the
 * online path when the outbox drains.
 */
async function storeCompletedExchange(
  exchange: Exchange,
  post: Post,
): Promise<void> {
  await recordExchangeRowLocally(exchange);
  const updatedPost: Post = {
    ...post,
    status: "completed",
    confirmedBy: Array.from(
      new Set([...post.confirmedBy, exchange.helperKey, exchange.helpedKey]),
    ),
  };
  await db.posts.put(updatedPost);
}

/**
 * The post-free storage tail — store the completed record, enqueue
 * its outbox mirror atomically, and recompute achievements for both
 * parties (mirroring confirmExchange / applyAutoConfirmedExchange so
 * a member who earns a role through a phone-to-phone exchange sees
 * it without waiting for their next online confirmation). Exported
 * for the direct-exchange ceremony (lib/directExchange.ts), whose
 * records have no post to complete. Callers run this inside their
 * own rw transaction covering exchanges/achievements/outbox/
 * settings/members.
 */
export async function recordExchangeRowLocally(
  exchange: Exchange,
): Promise<void> {
  await db.exchanges.put(exchange);
  await enqueueExchangeOutbox(exchange);
  const allExchanges = await db.exchanges.toArray();
  const allMembers = await db.members.toArray();
  for (const key of [exchange.helperKey, exchange.helpedKey]) {
    const existing = await db.achievements
      .where("memberKey")
      .equals(key)
      .toArray();
    const previouslyFilledCategories = new Set(
      allExchanges.filter((e) => e.id !== exchange.id).map((e) => e.category),
    );
    const zoneReach = computeZoneReachForHelper(key, allExchanges, allMembers);
    const diff = diffAchievements(
      key,
      existing.map((a) => a.achievementType),
      allExchanges,
      { previouslyFilledCategories, zoneReach },
      exchange.completedAt,
    );
    if (diff.length > 0) await db.achievements.bulkPut(diff);
  }
}

/** Kick the outbox worker so a reachable node hears about the row
 *  promptly — a no-op while offline; the worker retries with backoff
 *  until connectivity returns. Same fire-and-forget confirmExchange
 *  uses. */
function kickOutbox(): void {
  void flushOutboxNow().catch(() => {});
}

/** Shallow shape check for the capture surface's paste fallback
 *  (`PairDeviceCapture.acceptsText`): is this text SOME exchange-
 *  ceremony payload? Without this, the paste box applies its default
 *  pairing-envelope validation and rejects every valid offer/receipt
 *  — the camera path never hit it, which is how the gap hid. Full
 *  validation stays with parse/collect. */
export function isExchangeCeremonyText(raw: string): boolean {
  try {
    const kind = (JSON.parse(raw) as { kind?: unknown }).kind;
    return kind === OFFER_KIND || kind === RECEIPT_KIND;
  } catch {
    return false;
  }
}
