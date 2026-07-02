/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  conversationId,
  encryptMessage,
  generateKeyPair,
  type KeyPair,
} from "@understoria/shared/crypto";
import { db } from "./database";
import {
  getConversation,
  listConversations,
  searchAllMessages,
  sendMessage,
} from "./messages";
import type { DirectMessage } from "@/types";

// Real keypairs, real crypto, real (fake-indexeddb) Dexie — the
// envelope must round-trip through the actual encrypt/decrypt path,
// not a mock of it.
let alice: KeyPair;
let bob: KeyPair;

beforeEach(async () => {
  await Promise.all([
    db.messages.clear(),
    db.secretKeys.clear(),
    db.blocks.clear(),
  ]);
  alice = generateKeyPair();
  bob = generateKeyPair();
  await db.secretKeys.bulkPut([
    { publicKey: alice.publicKey, secretKey: alice.secretKey },
    { publicKey: bob.publicKey, secretKey: bob.secretKey },
  ]);
});

/** Insert a raw pre-envelope-era row: plaintext encrypted as-is,
 *  exactly what old clients wrote. */
async function putLegacyRow(
  plaintext: string,
  createdAt = Date.now(),
): Promise<DirectMessage> {
  const encrypted = encryptMessage(plaintext, alice.secretKey, bob.publicKey);
  const msg: DirectMessage = {
    id: `legacy-${createdAt}-${Math.random()}`,
    conversationId: conversationId(alice.publicKey, bob.publicKey),
    senderKey: alice.publicKey,
    recipientKey: bob.publicKey,
    nonce: encrypted.nonce,
    ciphertext: encrypted.ciphertext,
    createdAt,
  };
  await db.messages.put(msg);
  return msg;
}

describe("sendMessage envelope", () => {
  it("plain messages stay bare strings (no envelope, legacy-identical)", async () => {
    await sendMessage(alice.publicKey, bob.publicKey, "hello there");
    // Recipient's decode path sees the text, no post reference.
    const [msg] = await getConversation(bob.publicKey, alice.publicKey);
    expect(msg.plaintext).toBe("hello there");
    expect(msg.aboutPostId).toBeUndefined();
  });

  it("aboutPostId rides inside the encrypted payload, not on the row", async () => {
    await sendMessage(alice.publicKey, bob.publicKey, "can I help?", {
      aboutPostId: "post-9",
    });
    const [row] = await db.messages.toArray();
    // No cleartext topic linkage on the stored row: the columns are
    // exactly the pre-existing DirectMessage shape.
    expect("aboutPostId" in row).toBe(false);
    expect(row.ciphertext).not.toContain("post-9");
    expect(row.ciphertext).not.toContain("can I help?");
    // ...but BOTH parties decode the reference from the payload.
    const [mine] = await getConversation(alice.publicKey, bob.publicKey);
    const [theirs] = await getConversation(bob.publicKey, alice.publicKey);
    for (const msg of [mine, theirs]) {
      expect(msg.plaintext).toBe("can I help?");
      expect(msg.aboutPostId).toBe("post-9");
    }
  });
});

describe("decode backward compatibility", () => {
  it("legacy bare-string messages render as their text", async () => {
    await putLegacyRow("just words from 2025");
    const [msg] = await getConversation(bob.publicKey, alice.publicKey);
    expect(msg.plaintext).toBe("just words from 2025");
    expect(msg.aboutPostId).toBeUndefined();
  });

  it("malformed JSON falls back to the raw string", async () => {
    await putLegacyRow('{"v":1,"text":');
    const [msg] = await getConversation(bob.publicKey, alice.publicKey);
    expect(msg.plaintext).toBe('{"v":1,"text":');
  });

  it("JSON-ish member text that is not an envelope stays verbatim", async () => {
    await putLegacyRow('{"recipe":"3 cups flour"}');
    const [msg] = await getConversation(bob.publicKey, alice.publicKey);
    expect(msg.plaintext).toBe('{"recipe":"3 cups flour"}');
  });
});

describe("listConversations preview", () => {
  it("previews the envelope text, never raw JSON", async () => {
    await sendMessage(alice.publicKey, bob.publicKey, "about your ladder", {
      aboutPostId: "post-3",
    });
    const convos = await listConversations(bob.publicKey);
    expect(convos).toHaveLength(1);
    expect(convos[0].lastMessage.plaintext).toBe("about your ladder");
    expect(convos[0].lastMessage.plaintext).not.toContain('"v":1');
  });
});

describe("searchAllMessages over envelopes", () => {
  beforeEach(async () => {
    await sendMessage(alice.publicKey, bob.publicKey, "zucchini surplus", {
      aboutPostId: "post-veg",
    });
  });

  it("matches on the member-visible text", async () => {
    const hits = await searchAllMessages(bob.publicKey, "zucchini");
    expect(hits).toHaveLength(1);
    expect(hits[0].message.plaintext).toBe("zucchini surplus");
    expect(hits[0].message.aboutPostId).toBe("post-veg");
  });

  it("does not match envelope JSON syntax or the post id", async () => {
    expect(await searchAllMessages(bob.publicKey, "aboutPostId")).toEqual([]);
    expect(await searchAllMessages(bob.publicKey, '"v":1')).toEqual([]);
    expect(await searchAllMessages(bob.publicKey, "post-veg")).toEqual([]);
  });
});
