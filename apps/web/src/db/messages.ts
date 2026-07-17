/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { db } from "./database";
import { getSecretKey } from "./secrets";
import { uuid } from "@/lib/id";
import {
  canonicalRelayedMessagePayload,
  conversationId,
  decryptMessage,
  encryptMessage,
  sign,
} from "@understoria/shared/crypto";
import { enqueueMessageOutbox, flushOutboxNow } from "@/lib/outbox";
import type { RelayedMessage } from "@understoria/shared/types";
import { matchesQuery } from "@/lib/messageSearch";
import {
  decodeMessageBody,
  encodeMessageBody,
  encodeReactionBody,
} from "@/lib/messageEnvelope";
import {
  BLOCKED_ACTION_MESSAGE,
  blockedFilter,
  isMutuallyBlocked,
} from "./blocks";
import type { DirectMessage } from "@/types";

export async function sendMessage(
  senderKey: string,
  recipientKey: string,
  plaintext: string,
  opts?: {
    /** Post this message is about. Rides INSIDE the encrypted
     *  payload (see lib/messageEnvelope.ts for the privacy
     *  rationale) — never as a cleartext column on the row. */
    aboutPostId?: string;
  },
): Promise<DirectMessage> {
  const trimmed = plaintext.trim();
  if (!trimmed) throw new Error("Message body is required.");
  // PR F: bidirectional DM gate per docs/blocking.md §6 row "DMs /
  // Messages (c)". Generic-error discipline (§6.1) — same copy a
  // not-available branch would surface so a recipient on the other
  // side can't fingerprint a block from a generic delivery failure.
  if (await isMutuallyBlocked(senderKey, recipientKey)) {
    throw new Error(BLOCKED_ACTION_MESSAGE);
  }
  const sk = await getSecretKey(senderKey);
  // Bare string when there's no post reference (byte-identical to
  // pre-envelope messages); v1 JSON envelope when there is one.
  const body = encodeMessageBody(trimmed, opts?.aboutPostId);
  const encrypted = encryptMessage(body, sk, recipientKey);
  const msg: DirectMessage = {
    id: uuid(),
    conversationId: conversationId(senderKey, recipientKey),
    senderKey,
    recipientKey,
    nonce: encrypted.nonce,
    ciphertext: encrypted.ciphertext,
    createdAt: Date.now(),
  };
  await db.messages.put(msg);

  // Delivery (docs/message-relay.md §5): the sealed envelope rides
  // the outbox to the community node's relay shelf, where the
  // recipient's devices pull it. Signed by the sender so the node
  // can refuse spoofed senders and the recipient can re-verify.
  // Soft-degrade like every publish path: no node configured → the
  // enqueue no-ops and the message stays local-only (same posture as
  // posts). For most of this app's life there was NO transport here
  // at all — messages silently never arrived; the dev demo's shared
  // database masked it.
  const envelope: RelayedMessage = {
    id: msg.id,
    senderKey,
    recipientKey,
    nonce: msg.nonce,
    ciphertext: msg.ciphertext,
    createdAt: msg.createdAt,
    signature: sign(
      canonicalRelayedMessagePayload({
        id: msg.id,
        senderKey,
        recipientKey,
        nonce: msg.nonce,
        ciphertext: msg.ciphertext,
        createdAt: msg.createdAt,
      }),
      sk,
    ),
  };
  const queued = await enqueueMessageOutbox(envelope);
  if (queued) void flushOutboxNow().catch(() => {});

  return msg;
}

export interface DecryptedMessage extends DirectMessage {
  /** The member-visible message text (envelope already unwrapped),
   *  or null when decryption failed. Every consumer — bubbles, list
   *  previews, search — sees text here, never raw envelope JSON. */
  plaintext: string | null;
  /** Post this message declared itself to be about, if any. Decoded
   *  from the encrypted envelope; absent on legacy/plain messages. */
  aboutPostId?: string;
  /** Present when this row IS an emoji reaction (v2 envelope) rather
   *  than a chat message. Reaction rows never render as bubbles —
   *  getConversation folds them into the target's `reactions`. */
  reaction?: { reactsTo: string; emoji: string };
  /** Reactions other rows aimed at THIS message: one entry per
   *  reacting member, their latest choice winning. Assembled by
   *  getConversation; empty/absent when nobody has reacted. */
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  senderKey: string;
  emoji: string;
}

/** Decrypt a row and unwrap the plaintext envelope in one step, so
 *  the three read paths below stay consistent. */
function decryptAndDecode(
  m: DirectMessage,
  mySecretKey: string,
  otherPublicKey: string,
): DecryptedMessage {
  // NaCl box shared secret is symmetric: box(msg, nonce, B_pk, A_sk)
  // can be opened with box.open(cipher, nonce, A_pk, B_sk). So we
  // always decrypt with our secret key and the other party's public key.
  const plain = decryptMessage(m, mySecretKey, otherPublicKey);
  if (plain === null) return { ...m, plaintext: null };
  const body = decodeMessageBody(plain);
  return {
    ...m,
    plaintext: body.text,
    ...(body.aboutPostId ? { aboutPostId: body.aboutPostId } : {}),
    ...(body.reaction ? { reaction: body.reaction } : {}),
  };
}

/**
 * Fold reaction rows into their target messages: the thread shows
 * chat bubbles only, each carrying the CURRENT reaction per member.
 * Rows arrive chronological, so a member's later reaction (or an
 * empty-emoji clear) simply overwrites their earlier one. A reaction
 * whose target fell outside the loaded window is dropped silently —
 * it re-attaches whenever the target is in view.
 */
function foldReactions(msgs: DecryptedMessage[]): DecryptedMessage[] {
  const latest = new Map<string, Map<string, string>>(); // target → sender → emoji
  for (const m of msgs) {
    if (!m.reaction) continue;
    const bySender = latest.get(m.reaction.reactsTo) ?? new Map();
    bySender.set(m.senderKey, m.reaction.emoji);
    latest.set(m.reaction.reactsTo, bySender);
  }
  return msgs
    .filter((m) => !m.reaction)
    .map((m) => {
      const bySender = latest.get(m.id);
      if (!bySender) return m;
      const reactions: MessageReaction[] = [];
      for (const [senderKey, emoji] of bySender) {
        if (emoji !== "") reactions.push({ senderKey, emoji });
      }
      return reactions.length > 0 ? { ...m, reactions } : m;
    });
}

export async function getConversation(
  myKey: string,
  otherKey: string,
  limit = 50,
): Promise<DecryptedMessage[]> {
  const convId = conversationId(myKey, otherKey);
  const rows = await db.messages
    .where("[conversationId+createdAt]")
    .between([convId, 0], [convId, Infinity])
    .reverse()
    .limit(limit)
    .toArray();
  rows.reverse();
  let sk: string;
  try {
    sk = await getSecretKey(myKey);
  } catch {
    return rows.map((m) => ({ ...m, plaintext: null }));
  }
  return foldReactions(rows.map((m) => decryptAndDecode(m, sk, otherKey)));
}

/**
 * Send an emoji reaction to a message. Structurally a sendMessage —
 * same blocked-party gate, same sealed E2E envelope, same relay via
 * the outbox — with a v2 reaction body instead of chat text. The
 * server (and anyone watching it) sees only one more opaque
 * envelope. `emoji: ""` clears this member's earlier reaction.
 */
export async function sendReaction(
  senderKey: string,
  recipientKey: string,
  reactsTo: string,
  emoji: string,
): Promise<DirectMessage> {
  if (await isMutuallyBlocked(senderKey, recipientKey)) {
    throw new Error(BLOCKED_ACTION_MESSAGE);
  }
  const sk = await getSecretKey(senderKey);
  const body = encodeReactionBody(reactsTo, emoji);
  const encrypted = encryptMessage(body, sk, recipientKey);
  const msg: DirectMessage = {
    id: uuid(),
    conversationId: conversationId(senderKey, recipientKey),
    senderKey,
    recipientKey,
    nonce: encrypted.nonce,
    ciphertext: encrypted.ciphertext,
    createdAt: Date.now(),
  };
  await db.messages.put(msg);
  const envelope: RelayedMessage = {
    id: msg.id,
    senderKey,
    recipientKey,
    nonce: msg.nonce,
    ciphertext: msg.ciphertext,
    createdAt: msg.createdAt,
    signature: sign(
      canonicalRelayedMessagePayload({
        id: msg.id,
        senderKey,
        recipientKey,
        nonce: msg.nonce,
        ciphertext: msg.ciphertext,
        createdAt: msg.createdAt,
      }),
      sk,
    ),
  };
  const queued = await enqueueMessageOutbox(envelope);
  if (queued) void flushOutboxNow().catch(() => {});
  return msg;
}

export interface ConversationSummary {
  otherKey: string;
  lastMessage: DecryptedMessage;
}

export async function listConversations(
  myKey: string,
): Promise<ConversationSummary[]> {
  // PR F: filter blocked counterparties from the conversation list.
  // The DM rows stay on disk (the sender side stored them locally; we
  // don't retroactively delete signed-state rows — block engages
  // prospectively only). We just don't surface them in the list view.
  // See docs/blocking.md §6 row "DMs / Messages (c)" + §6.1.
  const { keys: blocked } = await blockedFilter(myKey);
  const all = await db.messages
    .orderBy("createdAt")
    .reverse()
    .toArray();
  const seen = new Map<string, DirectMessage>();
  for (const m of all) {
    if (m.senderKey !== myKey && m.recipientKey !== myKey) continue;
    const otherKey = m.senderKey === myKey ? m.recipientKey : m.senderKey;
    if (blocked.has(otherKey)) continue;
    if (!seen.has(m.conversationId)) seen.set(m.conversationId, m);
  }
  let sk: string;
  try {
    sk = await getSecretKey(myKey);
  } catch {
    return Array.from(seen.values()).map((m) => ({
      otherKey: m.senderKey === myKey ? m.recipientKey : m.senderKey,
      lastMessage: { ...m, plaintext: null },
    }));
  }
  return Array.from(seen.values()).map((m) => {
    const otherKey = m.senderKey === myKey ? m.recipientKey : m.senderKey;
    // decryptAndDecode (not raw decryptMessage) so a last message
    // that happens to carry a post reference previews as its text,
    // never as raw envelope JSON in the conversations list.
    return {
      otherKey,
      lastMessage: decryptAndDecode(m, sk, otherKey),
    };
  });
}

export interface MessageSearchHit {
  otherKey: string;
  message: DecryptedMessage;
}

// Local-only decrypt-and-scan across every message I'm a party to.
// No persisted index — encrypted-at-rest stays intact. Locked
// session (no secret key) returns []: search is unavailable rather
// than partially silent. Empty / whitespace-only query returns [].
//
// Pilot-scale (≤ ~5 000 messages) completes in well under 100 ms on
// a low-end Android. If we ever feel that latency, the right next
// step is paging the iteration, not building an index.
export async function searchAllMessages(
  myKey: string,
  query: string,
): Promise<MessageSearchHit[]> {
  if (query.trim() === "") return [];
  let sk: string;
  try {
    sk = await getSecretKey(myKey);
  } catch {
    return [];
  }
  const all = await db.messages
    .orderBy("createdAt")
    .reverse()
    .toArray();
  const hits: MessageSearchHit[] = [];
  for (const m of all) {
    if (m.senderKey !== myKey && m.recipientKey !== myKey) continue;
    const otherKey = m.senderKey === myKey ? m.recipientKey : m.senderKey;
    // Decode BEFORE matching so search runs over the member-visible
    // text of envelope messages — a query like `"v":1` or a post id
    // must not match envelope JSON syntax.
    const msg = decryptAndDecode(m, sk, otherKey);
    // Reaction rows aren't thread messages — a search for "✕" or an
    // emoji must not surface them as hits.
    if (msg.reaction) continue;
    if (matchesQuery(msg.plaintext, query)) {
      hits.push({ otherKey, message: msg });
    }
  }
  return hits;
}
