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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  canonicalRelayedMessagePayload,
  conversationId,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { RelayedMessage } from "@understoria/shared/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { pullFederatedMessages } from "./federationSync";

// The node→device leg of the message relay (docs/message-relay.md §5):
// sealed envelopes come off the node's shelf and merge into the local
// messages table. These tests stub fetch — the server half is covered
// by apps/server/src/routes/messages.test.ts.

const me: KeyPair = generateKeyPair();
const sender: KeyPair = generateKeyPair();
const stranger: KeyPair = generateKeyPair();

async function reset() {
  await Promise.all([
    db.messages.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.blocks.clear(),
  ]);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
  await setSetting(SETTING_KEYS.currentMember, me.publicKey);
  await db.secretKeys.put({ publicKey: me.publicKey, secretKey: me.secretKey });
}

let seq = 0;
function envelope(
  from: KeyPair,
  toPublicKey: string,
  overrides: Partial<RelayedMessage> = {},
): RelayedMessage {
  seq += 1;
  const base = {
    id: `msg_${seq}_${Math.random().toString(36).slice(2)}`,
    senderKey: from.publicKey,
    recipientKey: toPublicKey,
    nonce: "bm9uY2Vub25jZW5vbmNlbm9uY2U=",
    ciphertext: "Y2lwaGVydGV4dA==",
    createdAt: Date.now() - 1000,
    ...overrides,
  };
  return {
    ...base,
    signature:
      overrides.signature ??
      sign(
        canonicalRelayedMessagePayload({
          id: base.id,
          senderKey: base.senderKey,
          recipientKey: base.recipientKey,
          nonce: base.nonce,
          ciphertext: base.ciphertext,
          createdAt: base.createdAt,
        }),
        from.secretKey,
      ),
  };
}

function stubMessages(rows: RelayedMessage[]) {
  const fetchSpy = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ count: rows.length, messages: rows }),
  });
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
}

const cursorKey = () =>
  `${SETTING_KEYS.federationLastMessagePull}:${me.publicKey}`;

describe("pullFederatedMessages", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("returns null when mirroring is disabled", async () => {
    await setSetting(SETTING_KEYS.communityNodeEnabled, "0");
    expect(await pullFederatedMessages()).toBeNull();
  });

  it("returns null when no member is signed in — the inbox has no owner", async () => {
    await db.settings.delete("currentMember");
    stubMessages([envelope(sender, me.publicKey)]);
    expect(await pullFederatedMessages()).toBeNull();
  });

  it("merges a valid envelope with the conversationId recomputed locally", async () => {
    const m = envelope(sender, me.publicKey);
    stubMessages([m]);

    const result = await pullFederatedMessages();
    expect(result).toEqual({ inserted: 1, skipped: 0 });

    const stored = await db.messages.get(m.id);
    expect(stored).toBeDefined();
    expect(stored!.conversationId).toBe(
      conversationId(sender.publicKey, me.publicKey),
    );
    expect(stored!.ciphertext).toBe(m.ciphertext);

    // Cursor advanced to the (createdAt, id) pair, per-member key.
    expect(await getSetting(cursorKey())).toBe(`${m.createdAt}:${m.id}`);
  });

  it("drops a bad signature WITHOUT advancing the cursor", async () => {
    const forged = envelope(stranger, me.publicKey, {
      senderKey: sender.publicKey, // claims to be from sender
    });
    stubMessages([forged]);

    const result = await pullFederatedMessages();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.messages.count()).toBe(0);
    expect(await getSetting(cursorKey())).toBeUndefined();
  });

  it("drops an envelope addressed to someone else — a dishonest node ignoring the scope", async () => {
    stubMessages([envelope(sender, stranger.publicKey)]);
    const result = await pullFederatedMessages();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.messages.count()).toBe(0);
  });

  it("drops a blocked sender silently WITH cursor advance (blocking.md §6)", async () => {
    await db.blocks.put({
      id: "block-1",
      blockerKey: me.publicKey,
      blockedKey: sender.publicKey,
      createdAt: Date.now(),
      hideGovernance: false,
      note: "",
    });
    const m = envelope(sender, me.publicKey);
    stubMessages([m]);

    const result = await pullFederatedMessages();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.messages.count()).toBe(0);
    // Advances: the block is prospective, not a queue — unblocking
    // does not resurrect what was dropped.
    expect(await getSetting(cursorKey())).toBe(`${m.createdAt}:${m.id}`);
  });

  it("dedups by id against rows already on this device", async () => {
    const m = envelope(sender, me.publicKey);
    stubMessages([m]);
    await pullFederatedMessages();
    stubMessages([m]);
    const second = await pullFederatedMessages();
    expect(second).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.messages.count()).toBe(1);
  });

  it("namespaces the cursor per member — a switch must not skip the second member's inbox", async () => {
    const m = envelope(sender, me.publicKey);
    stubMessages([m]);
    await pullFederatedMessages();
    expect(await getSetting(cursorKey())).toBe(`${m.createdAt}:${m.id}`);

    // Switch member: their cursor key is untouched, so their first
    // pull starts from the beginning of their own inbox.
    const other = generateKeyPair();
    await setSetting(SETTING_KEYS.currentMember, other.publicKey);
    expect(
      await getSetting(
        `${SETTING_KEYS.federationLastMessagePull}:${other.publicKey}`,
      ),
    ).toBeUndefined();
  });
});
