/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  canonicalMemberRemovalPayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import type {
  MemberRemoval,
  MemberRemovalPayload,
} from "@understoria/shared/types";
import {
  deriveRemovedKeys,
  removalStructurallyValid,
} from "./memberRemoval";

function makeRemoval(
  removedKey: string,
  signers: { publicKey: string; secretKey: string }[],
): MemberRemoval {
  const payload: MemberRemovalPayload = {
    id: "rm_1",
    removedKey,
    reason: null,
    decidedAt: Date.now(),
    nodeId: "node_t",
    proposalId: null,
  };
  const canonical = canonicalMemberRemovalPayload(payload);
  return {
    ...payload,
    signatures: signers.map((s) => ({
      signerKey: s.publicKey,
      signature: sign(canonical, s.secretKey),
    })),
  };
}

describe("standing derivation — the client half of the closure rule", () => {
  it("latest record decides; ties reinstate; future records wait", () => {
    const now = Date.now();
    const removed = deriveRemovedKeys(
      [
        { removedKey: "a", decidedAt: now - 100 },
        { removedKey: "b", decidedAt: now - 100 },
        { removedKey: "c", decidedAt: now - 100 },
        { removedKey: "d", decidedAt: now + 60_000 }, // future
      ],
      [
        { reinstatedKey: "b", decidedAt: now - 50 }, // later: back in
        { reinstatedKey: "c", decidedAt: now - 100 }, // TIE: reinstatement wins
      ],
      now,
    );
    expect(removed.has("a")).toBe(true);
    expect(removed.has("b")).toBe(false);
    expect(removed.has("c")).toBe(false);
    expect(removed.has("d")).toBe(false);
  });

  it("a re-removal after reinstatement counts again", () => {
    const now = Date.now();
    const removed = deriveRemovedKeys(
      [
        { removedKey: "a", decidedAt: now - 300 },
        { removedKey: "a", decidedAt: now - 100 },
      ],
      [{ reinstatedKey: "a", decidedAt: now - 200 }],
      now,
    );
    expect(removed.has("a")).toBe(true);
  });
});

describe("structural verification — the client half of the validity rule", () => {
  it("counts only verifying, distinct, non-subject signers toward quorum", () => {
    const target = generateKeyPair();
    const [a, b, c] = [1, 2, 3].map(() => generateKeyPair());

    expect(removalStructurallyValid(makeRemoval(target.publicKey, [a, b, c]), 3)).toBe(true);
    // Under quorum.
    expect(removalStructurallyValid(makeRemoval(target.publicKey, [a, b]), 3)).toBe(false);
    // The subject signing for themselves never counts.
    expect(
      removalStructurallyValid(makeRemoval(target.publicKey, [a, b, target]), 3),
    ).toBe(false);
    // Duplicates collapse.
    expect(removalStructurallyValid(makeRemoval(target.publicKey, [a, b, b]), 3)).toBe(false);
    // Tampering after signing voids every signature.
    const tampered = {
      ...makeRemoval(target.publicKey, [a, b, c]),
      reason: "edited",
    };
    expect(removalStructurallyValid(tampered, 3)).toBe(false);
  });
});
