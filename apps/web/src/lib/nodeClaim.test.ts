/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { claimFounder, fetchClaimStatus } from "./nodeClaim";
import { db } from "@/db/database";
import { persistSecretKey } from "@/db/secrets";
import {
  canonicalFounderClaimMessage,
  generateKeyPair,
  verify,
} from "@/lib/crypto";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("fetchClaimStatus", () => {
  it("true when the node reports claimed:false (fresh, waiting)", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { claimed: false }));
    expect(await fetchClaimStatus("https://node.example", fetchImpl)).toBe(
      true,
    );
    expect(fetchImpl.mock.calls[0][0]).toBe("https://node.example/config");
  });

  it("false when claimed:true; null on missing field, error status, or network failure", async () => {
    expect(
      await fetchClaimStatus(
        "https://node.example",
        vi.fn().mockResolvedValue(jsonResponse(200, { claimed: true })),
      ),
    ).toBe(false);
    // Older servers have no `claimed` field — unknown, NOT unclaimed:
    // the card must not offer a claim form against a node that
    // predates the flow.
    expect(
      await fetchClaimStatus(
        "https://node.example",
        vi.fn().mockResolvedValue(jsonResponse(200, {})),
      ),
    ).toBeNull();
    expect(
      await fetchClaimStatus(
        "https://node.example",
        vi.fn().mockResolvedValue(jsonResponse(500, {})),
      ),
    ).toBeNull();
    expect(
      await fetchClaimStatus(
        "https://node.example",
        vi.fn().mockRejectedValue(new Error("offline")),
      ),
    ).toBeNull();
  });
});

describe("claimFounder", () => {
  const keys = generateKeyPair();

  beforeEach(async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
    await persistSecretKey(keys.publicKey, keys.secretKey);
  });

  it("POSTs a claim whose signature binds OUR key to the code", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(201, { claimed: true }));
    const result = await claimFounder({
      url: "https://node.example/",
      setupToken: "  abcd-efgh-ijkl-mnop  ",
      publicKey: keys.publicKey,
      fetchImpl,
      now: () => 1_700_000_000_000,
    });
    expect(result).toEqual({ ok: true });

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://node.example/claim-founder");
    const body = JSON.parse(init.body as string) as {
      publicKey: string;
      setupToken: string;
      ts: number;
      signature: string;
    };
    // The code is trimmed (a copy-paste from a terminal drags spaces),
    // and the signature verifies over exactly what the server will
    // reconstruct — the shared canonical message.
    expect(body.setupToken).toBe("abcd-efgh-ijkl-mnop");
    expect(body.ts).toBe(1_700_000_000_000);
    expect(
      verify(
        canonicalFounderClaimMessage(body.publicKey, body.setupToken, body.ts),
        body.signature,
        keys.publicKey,
      ),
    ).toBe(true);
  });

  it("maps the server's refusal vocabulary onto i18n-able reasons", async () => {
    for (const [status, error] of [
      [409, "already_claimed"],
      [401, "bad_setup_token"],
      [401, "stale_claim"],
      [422, "bad_signature"],
    ] as const) {
      const result = await claimFounder({
        url: "https://node.example",
        setupToken: "x",
        publicKey: keys.publicKey,
        fetchImpl: vi.fn().mockResolvedValue(jsonResponse(status, { error })),
      });
      expect(result).toEqual({ ok: false, reason: error });
    }
  });

  it("network failure → unreachable; unknown refusal → rejected", async () => {
    expect(
      await claimFounder({
        url: "https://node.example",
        setupToken: "x",
        publicKey: keys.publicKey,
        fetchImpl: vi.fn().mockRejectedValue(new Error("offline")),
      }),
    ).toEqual({ ok: false, reason: "unreachable" });
    expect(
      await claimFounder({
        url: "https://node.example",
        setupToken: "x",
        publicKey: keys.publicKey,
        fetchImpl: vi
          .fn()
          .mockResolvedValue(jsonResponse(400, { error: "invalid_body" })),
      }),
    ).toEqual({ ok: false, reason: "rejected" });
  });
});
