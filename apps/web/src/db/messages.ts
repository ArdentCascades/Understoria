/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { db } from "./database";
import { getSecretKey } from "./secrets";
import { uuid } from "@/lib/id";
import {
  conversationId,
  decryptMessage,
  encryptMessage,
} from "@understoria/shared/crypto";
import type { DirectMessage } from "@/types";

export async function sendMessage(
  senderKey: string,
  recipientKey: string,
  plaintext: string,
): Promise<DirectMessage> {
  const trimmed = plaintext.trim();
  if (!trimmed) throw new Error("Message body is required.");
  const sk = await getSecretKey(senderKey);
  const encrypted = encryptMessage(trimmed, sk, recipientKey);
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
  return msg;
}

export interface DecryptedMessage extends DirectMessage {
  plaintext: string | null;
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
  return rows.map((m) => {
    // NaCl box shared secret is symmetric: box(msg, nonce, B_pk, A_sk)
    // can be opened with box.open(cipher, nonce, A_pk, B_sk). So we
    // always decrypt with our secret key and the other party's public key.
    const plain = decryptMessage(m, sk, otherKey);
    return { ...m, plaintext: plain };
  });
}

export interface ConversationSummary {
  otherKey: string;
  lastMessage: DecryptedMessage;
}

export async function listConversations(
  myKey: string,
): Promise<ConversationSummary[]> {
  const all = await db.messages
    .orderBy("createdAt")
    .reverse()
    .toArray();
  const seen = new Map<string, DirectMessage>();
  for (const m of all) {
    if (m.senderKey !== myKey && m.recipientKey !== myKey) continue;
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
    const plain = decryptMessage(m, sk, otherKey);
    return {
      otherKey,
      lastMessage: { ...m, plaintext: plain },
    };
  });
}
