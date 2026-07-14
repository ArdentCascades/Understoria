/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { founderKeyHash } from "@understoria/shared/crypto";
import { db, setSetting } from "@/db/database";
import { generateKeyPair } from "./crypto";
import {
  LAST_SEEN_FOUNDER_HASHES,
  parseFounderHashCapture,
  readFounderHashCapture,
  resolveFounderRoots,
} from "./founderRoots";

describe("parseFounderHashCapture", () => {
  it("round-trips a valid capture and drops junk hash entries", () => {
    const raw = JSON.stringify({
      nodeId: "node_test",
      hashes: ["abc", "", 42, "def"],
      capturedAt: "2026-07-14T00:00:00Z",
    });
    expect(parseFounderHashCapture(raw)).toEqual({
      nodeId: "node_test",
      hashes: ["abc", "def"],
    });
  });

  it("null on anything malformed — no capture is a normal state", () => {
    expect(parseFounderHashCapture(undefined)).toBeNull();
    expect(parseFounderHashCapture("")).toBeNull();
    expect(parseFounderHashCapture("not json")).toBeNull();
    expect(parseFounderHashCapture(JSON.stringify({ hashes: [] }))).toBeNull();
    expect(
      parseFounderHashCapture(JSON.stringify({ nodeId: "", hashes: [] })),
    ).toBeNull();
    expect(
      parseFounderHashCapture(JSON.stringify({ nodeId: "n", hashes: "x" })),
    ).toBeNull();
  });
});

describe("resolveFounderRoots", () => {
  const founder = generateKeyPair();
  const other = generateKeyPair();

  it("recognizes exactly the members whose salted hash was published", () => {
    const capture = {
      nodeId: "node_test",
      hashes: [founderKeyHash("node_test", founder.publicKey)],
    };
    const roots = resolveFounderRoots(capture, [
      founder.publicKey,
      other.publicKey,
    ]);
    expect(roots).toEqual(new Set([founder.publicKey]));
  });

  it("the salt binds hashes to ONE node — the same key on another node does not match", () => {
    // This is the anti-correlation property the design chose the
    // salted hash for: the same person founding two nodes publishes
    // two unrelated values.
    const capture = {
      nodeId: "node_other",
      hashes: [founderKeyHash("node_test", founder.publicKey)],
    };
    expect(resolveFounderRoots(capture, [founder.publicKey]).size).toBe(0);
  });

  it("no capture / empty capture → no roots", () => {
    expect(resolveFounderRoots(null, [founder.publicKey]).size).toBe(0);
    expect(
      resolveFounderRoots({ nodeId: "node_test", hashes: [] }, [
        founder.publicKey,
      ]).size,
    ).toBe(0);
  });
});

describe("readFounderHashCapture", () => {
  beforeEach(async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });

  it("reads the settings row the /config capture writes", async () => {
    const founder = generateKeyPair();
    await setSetting(
      LAST_SEEN_FOUNDER_HASHES,
      JSON.stringify({
        nodeId: "node_test",
        hashes: [founderKeyHash("node_test", founder.publicKey)],
        capturedAt: new Date().toISOString(),
      }),
    );
    const capture = await readFounderHashCapture();
    expect(capture?.nodeId).toBe("node_test");
    expect(
      resolveFounderRoots(capture, [founder.publicKey]).has(founder.publicKey),
    ).toBe(true);
  });

  it("null when nothing was ever captured", async () => {
    expect(await readFounderHashCapture()).toBeNull();
  });
});
