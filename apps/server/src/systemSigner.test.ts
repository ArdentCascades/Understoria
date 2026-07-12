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
import { describe, expect, it } from "vitest";
import {
  canonicalExchangePayload,
  generateKeyPair,
  sign,
  verifyExchangeLabel,
  type ExchangeLabel,
} from "@understoria/shared/crypto";
import type { Exchange } from "@understoria/shared/types";
import * as systemSignerModule from "./systemSigner.js";
import {
  autoConfirmExchange,
  autoConfirmProjectTaskCompletion,
  createSystemSignerFromSecret,
  type SystemSigner,
} from "./systemSigner.js";

const HOUR = 60 * 60 * 1000;
const NODE_ID = "node_test";

function buildPayload(now: number, overrides: Record<string, unknown> = {}) {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const base = {
    postId: "post_x",
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hours: 1.5,
    category: "transport" as const,
    completedAt: now,
    ...overrides,
  };
  return {
    base,
    helper,
    helped,
    helperSignature: sign(canonicalExchangePayload(base), helper.secretKey),
  };
}

describe("contract 1: system signer module exports only auto-confirm functions", () => {
  // The §2-bound-1 invariant ("the key only signs auto-confirm
  // records") is enforced socially by code review. To make the
  // review mechanical, we assert the module's exported runtime
  // surface is exactly the authorized signing functions plus the
  // construction helper. Types erase at runtime so they don't
  // appear in Object.keys — the runtime surface is what an
  // attacker can import and call. `signCapacityPosture` is the §2
  // contract's SECOND authorized payload (docs/capacity-forecast.md
  // §6 / auto-confirm-key.md §4's anticipated node-identity reuse);
  // adding it here is the deliberate contract change, not a leak.
  it("exports exactly the bounded surface — no general signer leak", () => {
    const exported = Object.keys(systemSignerModule).sort();
    expect(exported).toEqual(
      [
        "autoConfirmExchange",
        "autoConfirmProjectTaskCompletion",
        "createSystemSignerFromSecret",
        "signCapacityPosture",
      ].sort(),
    );
  });

  it("the SystemSigner shape itself is bounded — publicKey + signPayload only", () => {
    const kp = generateKeyPair();
    const signer = createSystemSignerFromSecret(kp.secretKey);
    expect(signer).not.toBeNull();
    expect(Object.keys(signer!).sort()).toEqual(["publicKey", "signPayload"]);
  });

  it("returns null when no secret is configured (operator hasn't supplied a key)", () => {
    expect(createSystemSignerFromSecret(null)).toBeNull();
    expect(createSystemSignerFromSecret("")).toBeNull();
    expect(createSystemSignerFromSecret("   ")).toBeNull();
  });
});

describe("contract 3: cannot modify the canonical payload (§2 bound 4)", () => {
  it("auto-confirmed exchange carries the exact (helperKey, helpedKey, hours, category, completedAt) the helper signed", () => {
    const now = 1_700_000_000_000;
    const fixed = buildPayload(now);
    const signer = createSystemSignerFromSecret(generateKeyPair().secretKey)!;
    const result = autoConfirmExchange(
      {
        exchangeId: "ex_1",
        awaitingSince: now - 8 * 24 * HOUR,
        payload: fixed.base,
        helperSignature: fixed.helperSignature,
      },
      { signer, nodeId: NODE_ID, autoConfirmHours: 168, now },
    );
    expect(result.kind).toBe("signed");
    if (result.kind !== "signed") throw new Error("unreachable");
    // Byte-for-byte: the five fields in the canonical payload are
    // unchanged. The system key only added the helped-side signature.
    expect(result.exchange.helperKey).toBe(fixed.base.helperKey);
    expect(result.exchange.helpedKey).toBe(fixed.base.helpedKey);
    expect(result.exchange.hoursExchanged).toBe(fixed.base.hours);
    expect(result.exchange.category).toBe(fixed.base.category);
    expect(result.exchange.completedAt).toBe(fixed.base.completedAt);
    // And the helper signature came across literally.
    expect(result.exchange.helperSignature).toBe(fixed.helperSignature);
    // The audit fields are set so downstream verifiers can label.
    expect(result.exchange.autoConfirmed).toBe(true);
    expect(result.exchange.autoConfirmedBy).toBe(`system:${NODE_ID}`);
    expect(result.exchange.autoConfirmedAt).toBe(now);
  });

  it("refuses to sign when the helper signature does not verify", () => {
    const now = 1_700_000_000_000;
    const fixed = buildPayload(now);
    const signer = createSystemSignerFromSecret(generateKeyPair().secretKey)!;
    // Corrupt the helper's signature
    const result = autoConfirmExchange(
      {
        exchangeId: "ex_2",
        awaitingSince: now - 8 * 24 * HOUR,
        payload: fixed.base,
        helperSignature: fixed.helperSignature.slice(0, -2) + "AA",
      },
      { signer, nodeId: NODE_ID, autoConfirmHours: 168, now },
    );
    expect(result.kind).toBe("ineligible");
    if (result.kind !== "ineligible") throw new Error("unreachable");
    expect(result.reason).toBe("bad_helper_signature");
  });
});

describe("server-side mirrors of contracts 4 + 5: window + disabled state", () => {
  // Mirrors the client-side autoConfirm.test.ts but at the signing
  // boundary — the server independently enforces these, so abusing
  // the client doesn't get around them.
  it("refuses to sign when autoConfirmHours = 0", () => {
    const now = 1_700_000_000_000;
    const fixed = buildPayload(now);
    const signer = createSystemSignerFromSecret(generateKeyPair().secretKey)!;
    const result = autoConfirmExchange(
      {
        exchangeId: "ex_3",
        awaitingSince: now - 100 * 24 * HOUR,
        payload: fixed.base,
        helperSignature: fixed.helperSignature,
      },
      { signer, nodeId: NODE_ID, autoConfirmHours: 0, now },
    );
    expect(result.kind).toBe("ineligible");
    if (result.kind !== "ineligible") throw new Error("unreachable");
    expect(result.reason).toBe("auto_confirm_disabled");
  });

  it("refuses to sign when window has not elapsed (1h short of threshold)", () => {
    const now = 1_700_000_000_000;
    const fixed = buildPayload(now);
    const signer = createSystemSignerFromSecret(generateKeyPair().secretKey)!;
    const result = autoConfirmExchange(
      {
        exchangeId: "ex_4",
        awaitingSince: now - (168 - 1) * HOUR, // 1h short
        payload: fixed.base,
        helperSignature: fixed.helperSignature,
      },
      { signer, nodeId: NODE_ID, autoConfirmHours: 168, now },
    );
    expect(result.kind).toBe("ineligible");
    if (result.kind !== "ineligible") throw new Error("unreachable");
    expect(result.reason).toBe("window_not_elapsed");
  });

  it("refuses to sign when no signer is configured", () => {
    const now = 1_700_000_000_000;
    const fixed = buildPayload(now);
    const result = autoConfirmExchange(
      {
        exchangeId: "ex_5",
        awaitingSince: now - 8 * 24 * HOUR,
        payload: fixed.base,
        helperSignature: fixed.helperSignature,
      },
      { signer: null, nodeId: NODE_ID, autoConfirmHours: 168, now },
    );
    expect(result.kind).toBe("ineligible");
    if (result.kind !== "ineligible") throw new Error("unreachable");
    expect(result.reason).toBe("missing_system_key");
  });
});

describe("contract 2: verifier distinguishability (§4)", () => {
  // The §4 hard contract — synthesize a system-signed exchange and
  // a member-signed exchange of identical shape, assert that
  // verifyExchangeLabel returns DISTINCT labels. The whole point of
  // shipping the auto-confirm flag and `autoConfirmedBy` is that a
  // verifier downstream can tell them apart without knowing the
  // node's keys ahead of time.
  it("a system-signed exchange labels as 'system-signed' and a member-signed exchange labels as 'member-signed' on the same shape", () => {
    const now = 1_700_000_000_000;
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const sysKp = generateKeyPair();
    const sysSigner: SystemSigner =
      createSystemSignerFromSecret(sysKp.secretKey)!;

    const base = {
      postId: "post_compare",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hours: 1,
      category: "transport" as const,
      completedAt: now,
    };
    const canonical = canonicalExchangePayload(base);
    const helperSignature = sign(canonical, helper.secretKey);
    const helpedSignature = sign(canonical, helped.secretKey);

    // Member-signed mutual-confirm path (no auto flags).
    const memberSigned: Exchange = {
      id: "ex_member",
      postId: base.postId,
      helperKey: base.helperKey,
      helpedKey: base.helpedKey,
      hoursExchanged: base.hours,
      helperSignature,
      helpedSignature,
      completedAt: base.completedAt,
      category: base.category,
      nodeId: NODE_ID,
    };

    // System-signed auto-confirm path on the SAME canonical payload.
    const result = autoConfirmExchange(
      {
        exchangeId: "ex_system",
        awaitingSince: now - 8 * 24 * HOUR,
        payload: base,
        helperSignature,
      },
      { signer: sysSigner, nodeId: NODE_ID, autoConfirmHours: 168, now },
    );
    expect(result.kind).toBe("signed");
    if (result.kind !== "signed") throw new Error("unreachable");

    const resolve = (nodeId: string): string | null =>
      nodeId === NODE_ID ? sysSigner.publicKey : null;

    const memberLabel: ExchangeLabel = verifyExchangeLabel(
      memberSigned,
      resolve,
    );
    const systemLabel: ExchangeLabel = verifyExchangeLabel(
      result.exchange,
      resolve,
    );

    // The contract: distinct labels for the two paths.
    expect(memberLabel).toBe("member-signed");
    expect(systemLabel).toBe("system-signed");
    expect(memberLabel).not.toBe(systemLabel);
  });

  it("a forged auto-confirm row (autoConfirmed flag without a valid system signature) labels as 'invalid'", () => {
    // Catches the obvious lie: an operator who flips autoConfirmed
    // on a member-signed row to dodge the audit. The label must
    // not accept this — the system signature MUST verify against a
    // resolvable system pubkey.
    const now = 1_700_000_000_000;
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const base = {
      postId: "post_forge",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hours: 1,
      category: "transport" as const,
      completedAt: now,
    };
    const canonical = canonicalExchangePayload(base);
    const helperSignature = sign(canonical, helper.secretKey);
    const helpedSignature = sign(canonical, helped.secretKey);

    const lying: Exchange = {
      id: "ex_lying",
      postId: base.postId,
      helperKey: base.helperKey,
      helpedKey: base.helpedKey,
      hoursExchanged: base.hours,
      helperSignature,
      helpedSignature,
      completedAt: base.completedAt,
      category: base.category,
      nodeId: NODE_ID,
      autoConfirmed: true,
      autoConfirmedBy: `system:${NODE_ID}`,
      autoConfirmedAt: now,
    };
    const resolve = (_nodeId: string): string | null =>
      generateKeyPair().publicKey; // unrelated pubkey
    expect(verifyExchangeLabel(lying, resolve)).toBe("invalid");
  });

  it("rotation: the resolver receives the record's signing time and selects across the key history (§4)", () => {
    // Operator rotates the system key at T_ROTATE. A record signed by
    // the OLD key before rotation must stay verifiable forever; a
    // record claiming the old key AFTER its retirement must fail —
    // that's the point of retiring a (possibly compromised) key.
    const T_ROTATE = 1_700_000_000_000;
    const oldKp = generateKeyPair();
    const newKp = generateKeyPair();
    const oldSigner = createSystemSignerFromSecret(oldKp.secretKey)!;

    const buildAutoConfirmed = (signedAt: number): Exchange => {
      const helper = generateKeyPair();
      const helped = generateKeyPair();
      const base = {
        postId: "post_rotate",
        helperKey: helper.publicKey,
        helpedKey: helped.publicKey,
        hours: 1,
        category: "transport" as const,
        completedAt: signedAt,
      };
      const canonical = canonicalExchangePayload(base);
      return {
        id: `ex_${signedAt}`,
        postId: base.postId,
        helperKey: base.helperKey,
        helpedKey: base.helpedKey,
        hoursExchanged: base.hours,
        helperSignature: sign(canonical, helper.secretKey),
        helpedSignature: oldSigner.signPayload(canonical),
        completedAt: base.completedAt,
        category: base.category,
        nodeId: NODE_ID,
        autoConfirmed: true,
        autoConfirmedBy: `system:${NODE_ID}`,
        autoConfirmedAt: signedAt,
      };
    };

    // §4's "minimal scheme": history entry {pubkey, retiredAt}; the
    // key current at `signedAt` is the first entry retired after it,
    // else the live key.
    const resolve = (nodeId: string, signedAt: number): string | null => {
      if (nodeId !== NODE_ID) return null;
      return signedAt < T_ROTATE ? oldKp.publicKey : newKp.publicKey;
    };

    const before = buildAutoConfirmed(T_ROTATE - 1_000);
    const after = buildAutoConfirmed(T_ROTATE + 1_000);
    expect(verifyExchangeLabel(before, resolve)).toBe("system-signed");
    expect(verifyExchangeLabel(after, resolve)).toBe("invalid");
  });
});

describe("autoConfirmProjectTaskCompletion is identical to autoConfirmExchange (single signer surface)", () => {
  it("project-task variant produces the same signing behaviour", () => {
    const now = 1_700_000_000_000;
    const fixed = buildPayload(now, { postId: "project:p1/task:t1" });
    const signer = createSystemSignerFromSecret(generateKeyPair().secretKey)!;
    const result = autoConfirmProjectTaskCompletion(
      {
        exchangeId: "ex_task",
        awaitingSince: now - 8 * 24 * HOUR,
        payload: fixed.base,
        helperSignature: fixed.helperSignature,
      },
      { signer, nodeId: NODE_ID, autoConfirmHours: 168, now },
    );
    expect(result.kind).toBe("signed");
    if (result.kind !== "signed") throw new Error("unreachable");
    expect(result.exchange.postId).toBe("project:p1/task:t1");
    expect(result.exchange.autoConfirmed).toBe(true);
    expect(result.exchange.autoConfirmedBy).toBe(`system:${NODE_ID}`);
  });
});
