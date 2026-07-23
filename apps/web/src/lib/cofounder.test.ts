/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FOUNDER_NOMINATION_TTL_MS,
  canonicalReadAuthMessage,
  generateKeyPair,
  verify,
  verifyFounderAccession,
  verifyFounderNomination,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { FounderNomination } from "@understoria/shared/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import {
  COFOUNDER_INCOMING_NOMINATION,
  COFOUNDER_PENDING_NOMINATION,
  acceptNomination,
  clearIncomingNomination,
  createNomination,
  nominationExpired,
  parseStoredNomination,
  plausibleCofounderKey,
  pollPendingNomination,
  readIncomingNomination,
  readPendingNomination,
  submitNomination,
} from "./cofounder";

// Client half of the co-founder ceremony
// (docs/cofounder-ceremony-plan.md P3). The server half — every
// refusal row as its own test, the transactional gate, the race — is
// covered by apps/server/src/routes/cofounder.test.ts; here we pin
// the signing, the error→reason mapping, the pending-state settings
// keys, and the recipient-proof pull.

const NODE = "node_test";
const URL_BASE = "http://node.test";

const founder: KeyPair = generateKeyPair();
const nominee: KeyPair = generateKeyPair();

async function reset() {
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.secretKeys.put({
    publicKey: founder.publicKey,
    secretKey: founder.secretKey,
  });
  await db.secretKeys.put({
    publicKey: nominee.publicKey,
    secretKey: nominee.secretKey,
  });
}

async function nomination(): Promise<FounderNomination> {
  return createNomination({
    nominatorKey: founder.publicKey,
    nomineeKey: nominee.publicKey,
    nodeId: NODE,
  });
}

function stubResponse(status: number, body: unknown) {
  const fetchSpy = vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
  );
  return fetchSpy as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}

beforeEach(reset);
afterEach(() => vi.unstubAllGlobals());

describe("plausibleCofounderKey", () => {
  it("accepts a base64 string that decodes to 32 bytes", () => {
    expect(plausibleCofounderKey(founder.publicKey)).toBe(true);
    expect(plausibleCofounderKey(`  ${founder.publicKey}  `)).toBe(true);
  });

  it("rejects everything else", () => {
    expect(plausibleCofounderKey("")).toBe(false);
    expect(plausibleCofounderKey("not a key")).toBe(false);
    expect(plausibleCofounderKey("A".repeat(44))).toBe(false); // no padding
    expect(plausibleCofounderKey(`${"A".repeat(42)}==`)).toBe(false); // 31 bytes
    expect(plausibleCofounderKey("https://example.org/invite#tok")).toBe(false);
  });
});

describe("createNomination", () => {
  it("signs a verifiable nomination with the 72 h TTL window", async () => {
    const n = await nomination();
    expect(verifyFounderNomination(n)).toBe(true);
    expect(n.expiresAt - n.nominatedAt).toBe(FOUNDER_NOMINATION_TTL_MS);
    expect(n.nodeId).toBe(NODE);
  });
});

describe("submitNomination", () => {
  it("201 → ok and persists the pending-nomination settings key", async () => {
    const n = await nomination();
    const res = await submitNomination({
      url: URL_BASE,
      nomination: n,
      fetchImpl: stubResponse(201, { stored: true }),
    });
    expect(res).toEqual({ ok: true });
    expect(await readPendingNomination()).toEqual(n);
  });

  it("maps every server refusal code to its typed reason", async () => {
    const n = await nomination();
    for (const code of [
      "invalid_body",
      "invalid_expiry",
      "wrong_node",
      "stale_nomination",
      "node_unclaimed",
      "root_count_not_one",
      "nominator_not_founder",
      "nominee_not_a_member",
      "nominee_already_founder",
      "bad_signature",
    ] as const) {
      const res = await submitNomination({
        url: URL_BASE,
        nomination: n,
        fetchImpl: stubResponse(409, { error: code }),
      });
      expect(res).toEqual({ ok: false, reason: code });
    }
    // A refusal never persists pending state.
    expect(await readPendingNomination()).toBeNull();
  });

  it("network failure → unreachable; unknown code → rejected", async () => {
    const n = await nomination();
    const down = vi.fn(async () => {
      throw new Error("down");
    }) as unknown as typeof fetch;
    expect(
      await submitNomination({ url: URL_BASE, nomination: n, fetchImpl: down }),
    ).toEqual({ ok: false, reason: "unreachable" });
    expect(
      await submitNomination({
        url: URL_BASE,
        nomination: n,
        fetchImpl: stubResponse(500, { error: "mystery" }),
      }),
    ).toEqual({ ok: false, reason: "rejected" });
  });
});

describe("pollPendingNomination", () => {
  it("attaches the recipient-proof trio (the authorizedFetch signer — no second header builder)", async () => {
    await setSetting(SETTING_KEYS.currentMember, nominee.publicKey);
    const n = await nomination();
    const fetchSpy = vi.fn(
      async () => new Response(JSON.stringify({ nomination: n }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchSpy);
    const res = await pollPendingNomination(URL_BASE, nominee.publicKey);
    expect(res).toEqual({ ok: true, nomination: n });
    const [, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["x-understoria-key"]).toBe(nominee.publicKey);
    expect(
      verify(
        canonicalReadAuthMessage(
          "/founder-nomination/pending",
          Number(headers["x-understoria-ts"]),
        ),
        headers["x-understoria-sig"],
        nominee.publicKey,
      ),
    ).toBe(true);
  });

  it("resolves null for a misaddressed, tampered, or expired row (dishonest-node defense)", async () => {
    const n = await nomination();
    const serve = (row: unknown) =>
      vi.stubGlobal(
        "fetch",
        vi.fn(
          async () =>
            new Response(JSON.stringify({ nomination: row }), { status: 200 }),
        ),
      );
    serve({ ...n, nomineeKey: founder.publicKey });
    expect(await pollPendingNomination(URL_BASE, nominee.publicKey)).toEqual({
      ok: true,
      nomination: null,
    });
    serve({ ...n, expiresAt: n.expiresAt + 1 }); // signature no longer covers
    expect(await pollPendingNomination(URL_BASE, nominee.publicKey)).toEqual({
      ok: true,
      nomination: null,
    });
    serve(n);
    expect(
      await pollPendingNomination(URL_BASE, nominee.publicKey, n.expiresAt + 1),
    ).toEqual({ ok: true, nomination: null });
  });

  it("transport failures are {ok: false} — distinct from an authoritative empty shelf", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 503 })),
    );
    expect(await pollPendingNomination(URL_BASE, nominee.publicKey)).toEqual({
      ok: false,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ nomination: null }), { status: 200 }),
      ),
    );
    expect(await pollPendingNomination(URL_BASE, nominee.publicKey)).toEqual({
      ok: true,
      nomination: null,
    });
  });
});

describe("acceptNomination", () => {
  it("signs a two-layer-verifiable accession, POSTs it, and persists the reseed artifact", async () => {
    const n = await nomination();
    const fetchImpl = stubResponse(201, { ok: true });
    const res = await acceptNomination({
      url: URL_BASE,
      nomination: n,
      fetchImpl,
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.alreadyFounder).toBe(false);
    expect(verifyFounderAccession(res.accession)).toBe(true);
    // The permanent artifact, keyed by nominee — what reseed re-POSTs.
    const stored = await db.founderAccessions.get(nominee.publicKey);
    expect(stored).toEqual(res.accession);
    // The POST body is the accession verbatim.
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual(res.accession);
  });

  it("the idempotent 200 replay is still a success (alreadyFounder)", async () => {
    const n = await nomination();
    const res = await acceptNomination({
      url: URL_BASE,
      nomination: n,
      fetchImpl: stubResponse(200, { ok: true, alreadyFounder: true }),
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.alreadyFounder).toBe(true);
  });

  it("maps every accession refusal code; refusals persist nothing", async () => {
    const n = await nomination();
    for (const code of [
      "invalid_body",
      "wrong_node",
      "acceptance_out_of_window",
      "bad_signature",
      "nomination_expired",
      "root_count_not_one",
    ] as const) {
      const res = await acceptNomination({
        url: URL_BASE,
        nomination: n,
        fetchImpl: stubResponse(409, { error: code }),
      });
      expect(res).toEqual({ ok: false, reason: code });
    }
    expect(await db.founderAccessions.count()).toBe(0);
  });

  it("a missing signing key surfaces as bad_signature, never a throw", async () => {
    const n = await nomination();
    await db.secretKeys.delete(nominee.publicKey);
    expect(
      await acceptNomination({
        url: URL_BASE,
        nomination: n,
        fetchImpl: stubResponse(201, { ok: true }),
      }),
    ).toEqual({ ok: false, reason: "bad_signature" });
  });
});

describe("pending-state settings keys", () => {
  it("round-trips and clears both sides; malformed rows read as absent", async () => {
    const n = await nomination();
    await setSetting(COFOUNDER_INCOMING_NOMINATION, JSON.stringify(n));
    expect(await readIncomingNomination()).toEqual(n);
    await clearIncomingNomination();
    expect(await readIncomingNomination()).toBeNull();
    await setSetting(COFOUNDER_PENDING_NOMINATION, "{not json");
    expect(await readPendingNomination()).toBeNull();
    expect(parseStoredNomination(JSON.stringify({ nope: 1 }))).toBeNull();
    expect(await getSetting(COFOUNDER_INCOMING_NOMINATION)).toBe("");
  });

  it("nominationExpired follows the signed expiry", async () => {
    const n = await nomination();
    expect(nominationExpired(n, n.expiresAt - 1)).toBe(false);
    expect(nominationExpired(n, n.expiresAt + 1)).toBe(true);
  });
});
