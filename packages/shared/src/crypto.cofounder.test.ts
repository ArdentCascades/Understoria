/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  FOUNDER_NOMINATION_MAX_WINDOW_MS,
  FOUNDER_NOMINATION_TTL_MS,
  canonicalFounderAccessionPayload,
  canonicalFounderNominationPayload,
  generateKeyPair,
  parseFounderAccession,
  parseFounderNomination,
  sign,
  verifyFounderAccession,
  verifyFounderNomination,
} from "./crypto.js";
import type {
  FounderAccession,
  FounderNomination,
} from "./types.js";

// Co-founder ceremony records (docs/cofounder-ceremony-plan.md P1):
// the canonical byte layouts are the wire contract — locked here the
// way the post-payload compat test locks its layout — and both
// signature layers must be tamper-evident on every field.

const nominator = generateKeyPair();
const nominee = generateKeyPair();

const NOMINATED_AT = 1_700_000_000_000;
const EXPIRES_AT = NOMINATED_AT + FOUNDER_NOMINATION_TTL_MS;
const ACCEPTED_AT = NOMINATED_AT + 60_000;

function makeNomination(
  over: Partial<FounderNomination> = {},
): FounderNomination {
  const payload = {
    nominatorKey: nominator.publicKey,
    nomineeKey: nominee.publicKey,
    nodeId: "node_test",
    nominatedAt: NOMINATED_AT,
    expiresAt: EXPIRES_AT,
    ...over,
  };
  return {
    ...payload,
    signature:
      over.signature ??
      sign(canonicalFounderNominationPayload(payload), nominator.secretKey),
  };
}

function makeAccession(
  over: Partial<FounderAccession> = {},
  nomination = makeNomination(),
): FounderAccession {
  const payload = {
    nomination,
    acceptedAt: ACCEPTED_AT,
    ...over,
  };
  return {
    ...payload,
    signature:
      over.signature ??
      sign(canonicalFounderAccessionPayload(payload), nominee.secretKey),
  };
}

describe("canonical payloads — byte layout locked (signature compat)", () => {
  it("nomination serializes to the exact pipe-delimited domain-separated bytes", () => {
    const n = makeNomination();
    expect(canonicalFounderNominationPayload(n)).toBe(
      `founder-nomination|node_test|${nominator.publicKey}|${nominee.publicKey}|${NOMINATED_AT}|${EXPIRES_AT}`,
    );
  });

  it("accession serializes to the nomination bytes + its signature + acceptedAt", () => {
    const a = makeAccession();
    expect(canonicalFounderAccessionPayload(a)).toBe(
      `founder-accession|founder-nomination|node_test|${nominator.publicKey}|${nominee.publicKey}|${NOMINATED_AT}|${EXPIRES_AT}|${a.nomination.signature}|${ACCEPTED_AT}`,
    );
  });

  it("the outer signature is not part of either canonical payload", () => {
    const a = makeAccession();
    expect(canonicalFounderNominationPayload(a.nomination)).not.toContain(
      a.nomination.signature,
    );
    expect(canonicalFounderAccessionPayload(a)).not.toContain(a.signature);
  });

  it("constants: 72 h TTL within the server's sanity ceiling", () => {
    expect(FOUNDER_NOMINATION_TTL_MS).toBe(72 * 60 * 60 * 1000);
    expect(FOUNDER_NOMINATION_MAX_WINDOW_MS).toBeGreaterThanOrEqual(
      FOUNDER_NOMINATION_TTL_MS,
    );
  });
});

describe("verifyFounderNomination", () => {
  it("verifies a well-formed signed nomination", () => {
    expect(verifyFounderNomination(makeNomination())).toBe(true);
  });

  it("rejects an empty signature", () => {
    expect(
      verifyFounderNomination({ ...makeNomination(), signature: "" }),
    ).toBe(false);
  });

  it("rejects self-nomination (nominator === nominee) even correctly signed", () => {
    const payload = {
      nominatorKey: nominator.publicKey,
      nomineeKey: nominator.publicKey,
      nodeId: "node_test",
      nominatedAt: NOMINATED_AT,
      expiresAt: EXPIRES_AT,
    };
    const selfSigned = {
      ...payload,
      signature: sign(
        canonicalFounderNominationPayload(payload),
        nominator.secretKey,
      ),
    };
    expect(verifyFounderNomination(selfSigned)).toBe(false);
  });

  it("rejects a non-forward window (expiresAt <= nominatedAt)", () => {
    const payload = {
      nominatorKey: nominator.publicKey,
      nomineeKey: nominee.publicKey,
      nodeId: "node_test",
      nominatedAt: NOMINATED_AT,
      expiresAt: NOMINATED_AT,
    };
    const signed = {
      ...payload,
      signature: sign(
        canonicalFounderNominationPayload(payload),
        nominator.secretKey,
      ),
    };
    expect(verifyFounderNomination(signed)).toBe(false);
  });

  it("rejects a nomination signed by the nominee instead of the nominator", () => {
    const n = makeNomination();
    const forged = {
      ...n,
      signature: sign(canonicalFounderNominationPayload(n), nominee.secretKey),
    };
    expect(verifyFounderNomination(forged)).toBe(false);
  });

  // Field-by-field tamper suite: mutate exactly one signed field
  // under the original signature — verification must fail for each.
  const nominationTampers: Array<[string, Partial<FounderNomination>]> = [
    ["nominatorKey", { nominatorKey: generateKeyPair().publicKey }],
    ["nomineeKey", { nomineeKey: generateKeyPair().publicKey }],
    ["nodeId", { nodeId: "node_evil" }],
    ["nominatedAt", { nominatedAt: NOMINATED_AT + 1 }],
    ["expiresAt", { expiresAt: EXPIRES_AT + 1 }],
  ];
  for (const [field, patch] of nominationTampers) {
    it(`is tamper-evident on ${field}`, () => {
      const signed = makeNomination();
      expect(verifyFounderNomination({ ...signed, ...patch })).toBe(false);
    });
  }
});

describe("verifyFounderAccession — both layers", () => {
  it("verifies a well-formed dual-signed accession", () => {
    expect(verifyFounderAccession(makeAccession())).toBe(true);
  });

  it("rejects an empty outer signature", () => {
    expect(verifyFounderAccession({ ...makeAccession(), signature: "" })).toBe(
      false,
    );
  });

  it("rejects when the INNER (nomination) signature is broken", () => {
    const a = makeAccession();
    const brokenInner = {
      ...a.nomination,
      signature: sign(
        canonicalFounderNominationPayload(a.nomination),
        nominee.secretKey,
      ),
    };
    // Outer layer re-signed over the broken inner record — only the
    // nomination-layer check can catch this.
    const payload = { nomination: brokenInner, acceptedAt: a.acceptedAt };
    const resigned = {
      ...payload,
      signature: sign(
        canonicalFounderAccessionPayload(payload),
        nominee.secretKey,
      ),
    };
    expect(verifyFounderAccession(resigned)).toBe(false);
  });

  it("rejects an accession signed by the nominator instead of the nominee", () => {
    const a = makeAccession();
    const forged = {
      ...a,
      signature: sign(
        canonicalFounderAccessionPayload(a),
        nominator.secretKey,
      ),
    };
    expect(verifyFounderAccession(forged)).toBe(false);
  });

  it("enforces the record-internal window: acceptedAt < nominatedAt", () => {
    const payload = {
      nomination: makeNomination(),
      acceptedAt: NOMINATED_AT - 1,
    };
    const signed = {
      ...payload,
      signature: sign(
        canonicalFounderAccessionPayload(payload),
        nominee.secretKey,
      ),
    };
    expect(verifyFounderAccession(signed)).toBe(false);
  });

  it("enforces the record-internal window: acceptedAt > expiresAt", () => {
    const payload = {
      nomination: makeNomination(),
      acceptedAt: EXPIRES_AT + 1,
    };
    const signed = {
      ...payload,
      signature: sign(
        canonicalFounderAccessionPayload(payload),
        nominee.secretKey,
      ),
    };
    expect(verifyFounderAccession(signed)).toBe(false);
  });

  it("accepts the window boundaries exactly (nominatedAt and expiresAt)", () => {
    for (const acceptedAt of [NOMINATED_AT, EXPIRES_AT]) {
      const payload = { nomination: makeNomination(), acceptedAt };
      const signed = {
        ...payload,
        signature: sign(
          canonicalFounderAccessionPayload(payload),
          nominee.secretKey,
        ),
      };
      expect(verifyFounderAccession(signed)).toBe(true);
    }
  });

  // Outer-layer tamper suite: every field of the accession, plus
  // every embedded-nomination field UNDER the outer signature (a
  // swapped nomination must break the outer layer even when the
  // substitute nomination is itself validly signed).
  it("is tamper-evident on acceptedAt", () => {
    const a = makeAccession();
    expect(verifyFounderAccession({ ...a, acceptedAt: ACCEPTED_AT + 1 })).toBe(
      false,
    );
  });

  const embeddedTampers: Array<[string, Partial<FounderNomination>]> = [
    ["nominatorKey", { nominatorKey: generateKeyPair().publicKey }],
    ["nomineeKey", { nomineeKey: generateKeyPair().publicKey }],
    ["nodeId", { nodeId: "node_evil" }],
    ["nominatedAt", { nominatedAt: NOMINATED_AT - 1 }],
    ["expiresAt", { expiresAt: EXPIRES_AT + 1 }],
    ["signature", {}], // full nomination swap below
  ];
  for (const [field, patch] of embeddedTampers.slice(0, 5)) {
    it(`is tamper-evident on embedded nomination.${field}`, () => {
      const a = makeAccession();
      expect(
        verifyFounderAccession({
          ...a,
          nomination: { ...a.nomination, ...patch },
        }),
      ).toBe(false);
    });
  }

  it("is tamper-evident on a wholesale nomination swap (valid substitute)", () => {
    const a = makeAccession();
    // A DIFFERENT, validly-signed nomination for the same pair — the
    // outer signature must pin the exact one that was accepted.
    const substitute = makeNomination({ nominatedAt: NOMINATED_AT + 5 });
    expect(verifyFounderNomination(substitute)).toBe(true);
    expect(verifyFounderAccession({ ...a, nomination: substitute })).toBe(
      false,
    );
  });
});

describe("parseFounderNomination", () => {
  it("parses a valid nomination and returns exactly the wire fields", () => {
    const n = makeNomination();
    const parsed = parseFounderNomination({ ...n, extra: "dropped" });
    expect(parsed).toEqual({ ok: true, value: n });
  });

  it("refuses a non-object", () => {
    const parsed = parseFounderNomination("nope");
    expect(parsed.ok).toBe(false);
  });

  for (const field of [
    "nominatorKey",
    "nomineeKey",
    "nodeId",
    "signature",
  ] as const) {
    it(`refuses a missing/empty ${field}`, () => {
      const bad = { ...makeNomination(), [field]: "" };
      const parsed = parseFounderNomination(bad);
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) expect(parsed.error).toContain(field);
    });
  }

  for (const field of ["nominatedAt", "expiresAt"] as const) {
    it(`refuses a non-integer ${field}`, () => {
      const bad = { ...makeNomination(), [field]: "soon" };
      const parsed = parseFounderNomination(bad);
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) expect(parsed.error).toContain(field);
    });
  }
});

describe("parseFounderAccession", () => {
  it("parses a valid accession, embedded nomination included", () => {
    const a = makeAccession();
    const parsed = parseFounderAccession({ ...a, extra: "dropped" });
    expect(parsed).toEqual({ ok: true, value: a });
  });

  it("refuses a non-object", () => {
    expect(parseFounderAccession(42).ok).toBe(false);
  });

  it("prefixes embedded-nomination errors with nomination.", () => {
    const a = makeAccession();
    const parsed = parseFounderAccession({
      ...a,
      nomination: { ...a.nomination, nomineeKey: "" },
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toContain("nomination.nomineeKey");
  });

  it("refuses a missing nomination", () => {
    const { nomination: _n, ...rest } = makeAccession();
    const parsed = parseFounderAccession(rest);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toContain("nomination");
  });

  it("refuses an empty outer signature", () => {
    const parsed = parseFounderAccession({ ...makeAccession(), signature: "" });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toContain("signature");
  });

  it("refuses a non-integer acceptedAt", () => {
    const parsed = parseFounderAccession({
      ...makeAccession(),
      acceptedAt: 1.5,
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toContain("acceptedAt");
  });
});
