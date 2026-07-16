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
  verifyRelayedMessage,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { RelayedMessage } from "@understoria/shared/types";
import { db, setSetting, SETTING_KEYS } from "./database";
import {
  getConversation,
  listConversations,
  searchAllMessages,
  sendMessage,
  sendReaction,
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
    db.outbox.clear(),
    db.settings.clear(),
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

describe("sendMessage delivery (docs/message-relay.md §5)", () => {
  it("enqueues a sender-signed sealed envelope when a node is configured", async () => {
    await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
    const msg = await sendMessage(alice.publicKey, bob.publicKey, "hello");

    const rows = await db.outbox.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe("message");
    expect(rows[0].recordId).toBe(msg.id);

    const envelope = JSON.parse(rows[0].payload) as RelayedMessage;
    // Same sealed bytes as the local row, no conversationId on the
    // wire, and a signature the node (and recipient) can verify.
    expect(envelope.ciphertext).toBe(msg.ciphertext);
    expect(envelope.nonce).toBe(msg.nonce);
    expect("conversationId" in envelope).toBe(false);
    expect(verifyRelayedMessage(envelope)).toBe(true);
    // The envelope never contains the plaintext.
    expect(rows[0].payload).not.toContain("hello");
  });

  it("soft-degrades to local-only when no node is configured", async () => {
    await sendMessage(alice.publicKey, bob.publicKey, "hello");
    expect(await db.outbox.count()).toBe(0);
    expect(await db.messages.count()).toBe(1);
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

// Emoji reactions (docs/message-relay.md "Reactions"): sealed v2
// envelopes over the same relay, folded into their target message by
// getConversation. Latest per sender wins; empty emoji clears.
describe("reactions", () => {
  it("sendReaction rides the outbox as a sealed, signed message envelope", async () => {
    // The outbox only queues while a node URL is configured.
    await setSetting("communityNodeUrl", "https://node.test");
    const target = await sendMessage(alice.publicKey, bob.publicKey, "hola");
    await db.outbox.clear();
    await sendReaction(bob.publicKey, alice.publicKey, target.id, "❤️");
    const rows = await db.outbox.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe("message");
    const envelope = JSON.parse(rows[0].payload) as RelayedMessage;
    expect(verifyRelayedMessage(envelope)).toBe(true);
    // The wire payload is ciphertext only — no emoji, no target id.
    expect(rows[0].payload).not.toContain("❤️");
    expect(rows[0].payload).not.toContain(target.id);
  });

  it("folds reactions into the target: visible to both sides, never as a bubble", async () => {
    const target = await sendMessage(alice.publicKey, bob.publicKey, "hola");
    await sendReaction(bob.publicKey, alice.publicKey, target.id, "❤️");

    for (const [me, other] of [
      [alice, bob],
      [bob, alice],
    ] as const) {
      const thread = await getConversation(me.publicKey, other.publicKey);
      expect(thread).toHaveLength(1); // reaction row is folded, not shown
      expect(thread[0].id).toBe(target.id);
      expect(thread[0].reactions).toEqual([
        { senderKey: bob.publicKey, emoji: "❤️" },
      ]);
    }
  });

  it("a member's newer reaction replaces their old one; empty emoji clears it", async () => {
    const target = await sendMessage(alice.publicKey, bob.publicKey, "hola");
    await sendReaction(bob.publicKey, alice.publicKey, target.id, "❤️");
    await sendReaction(bob.publicKey, alice.publicKey, target.id, "😂");
    let [msg] = await getConversation(alice.publicKey, bob.publicKey);
    expect(msg.reactions).toEqual([
      { senderKey: bob.publicKey, emoji: "😂" },
    ]);

    await sendReaction(bob.publicKey, alice.publicKey, target.id, "");
    [msg] = await getConversation(alice.publicKey, bob.publicKey);
    expect(msg.reactions).toBeUndefined();
  });

  it("both parties can hold reactions on the same message at once", async () => {
    const target = await sendMessage(alice.publicKey, bob.publicKey, "hola");
    await sendReaction(bob.publicKey, alice.publicKey, target.id, "❤️");
    await sendReaction(alice.publicKey, bob.publicKey, target.id, "🙏");
    const [msg] = await getConversation(alice.publicKey, bob.publicKey);
    expect(msg.reactions).toHaveLength(2);
    expect(msg.reactions).toContainEqual({
      senderKey: bob.publicKey,
      emoji: "❤️",
    });
    expect(msg.reactions).toContainEqual({
      senderKey: alice.publicKey,
      emoji: "🙏",
    });
  });

  it("reaction rows never surface in message search", async () => {
    const target = await sendMessage(alice.publicKey, bob.publicKey, "hola");
    await sendReaction(bob.publicKey, alice.publicKey, target.id, "❤️");
    const hits = await searchAllMessages(alice.publicKey, "❤️");
    expect(hits).toHaveLength(0);
  });
});
