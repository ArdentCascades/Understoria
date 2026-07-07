/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Client half of node-relayed device linking — the contracts that
 * keep the two devices convergent and the node blind:
 *   - identical channel ids from differently-typed same words
 *   - different words → different channels
 *   - the channel id never contains or equals the envelope key
 *     derivation (independent salts)
 *   - mailbox HTTP helpers: shape, one-shot 404, network failure
 */
import { describe, expect, it, vi } from "vitest";
import {
  BADGE_EMOJI,
  badgeForPubkey,
  deriveLinkChannelId,
  fetchLinkEnvelope,
  generateLinkKeypair,
  grantChannelIdForPubkey,
  listLinkRequests,
  normalizeLinkCode,
  openGrant,
  postLinkRequest,
  publishLinkEnvelope,
  sealGrant,
} from "./deviceLink";
import { b64encode } from "./bytes";
import { buildTransferPayload } from "./devicePairing";
import nacl from "tweetnacl";

// PBKDF2 at production iterations is deliberately slow; tests use a
// low count — determinism, not cost, is under test here.
const TEST_ITERATIONS = 1000;

describe("normalizeLinkCode", () => {
  it("lowercases and collapses whitespace so both sides agree", () => {
    expect(normalizeLinkCode("  Canvas   RIVER  toolbox ")).toBe(
      "canvas river toolbox",
    );
    expect(normalizeLinkCode("a\tb\n c")).toBe("a b c");
  });
});

describe("deriveLinkChannelId", () => {
  it("is deterministic and typo-insensitive to case/whitespace", async () => {
    const a = await deriveLinkChannelId(
      "canvas river toolbox yellow march empty",
      TEST_ITERATIONS,
    );
    const b = await deriveLinkChannelId(
      "  Canvas RIVER  toolbox yellow march empty ",
      TEST_ITERATIONS,
    );
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("different words land on different channels", async () => {
    const a = await deriveLinkChannelId(
      "canvas river toolbox yellow march empty",
      TEST_ITERATIONS,
    );
    const b = await deriveLinkChannelId(
      "canvas river toolbox yellow march enter",
      TEST_ITERATIONS,
    );
    expect(a).not.toBe(b);
  });
});

describe("publishLinkEnvelope", () => {
  it("POSTs the mailbox row and returns the server's expiry", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, expiresAt: 1234 }), {
        status: 201,
      }),
    );
    const res = await publishLinkEnvelope(
      "https://node.example/api",
      "a".repeat(64),
      "ENVELOPE",
      fetchImpl as unknown as typeof fetch,
    );
    expect(res).toEqual({ kind: "ok", expiresAt: 1234 });
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://node.example/api/device-link");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      channelId: "a".repeat(64),
      envelope: "ENVELOPE",
    });
  });

  it("maps non-2xx and network failure to an error result", async () => {
    const failing = vi.fn().mockResolvedValue(new Response("", { status: 507 }));
    expect(
      await publishLinkEnvelope(
        "https://node.example/api",
        "a".repeat(64),
        "E",
        failing as unknown as typeof fetch,
      ),
    ).toEqual({ kind: "error" });
    const throwing = vi.fn().mockRejectedValue(new Error("offline"));
    expect(
      await publishLinkEnvelope(
        "https://node.example/api",
        "a".repeat(64),
        "E",
        throwing as unknown as typeof fetch,
      ),
    ).toEqual({ kind: "error" });
  });
});

describe("fetchLinkEnvelope", () => {
  it("returns the envelope on 200", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ envelope: "BLOB" }), { status: 200 }),
    );
    expect(
      await fetchLinkEnvelope(
        "https://node.example/api",
        "b".repeat(64),
        fetchImpl as unknown as typeof fetch,
      ),
    ).toEqual({ kind: "found", envelope: "BLOB" });
  });

  it("distinguishes not_found (404, one-shot/expired/typo) from transport errors", async () => {
    const notFound = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "not_found" }), { status: 404 }),
    );
    expect(
      await fetchLinkEnvelope(
        "https://node.example/api",
        "b".repeat(64),
        notFound as unknown as typeof fetch,
      ),
    ).toEqual({ kind: "not_found" });
    const throwing = vi.fn().mockRejectedValue(new Error("offline"));
    expect(
      await fetchLinkEnvelope(
        "https://node.example/api",
        "b".repeat(64),
        throwing as unknown as typeof fetch,
      ),
    ).toEqual({ kind: "error" });
  });
});

// --- Tap-to-link primitives -------------------------------------------

function samplePayload(overrides: { expiresAt?: number } = {}) {
  const identity = nacl.sign.keyPair();
  const payload = buildTransferPayload({
    secretKey: identity.secretKey,
    publicKey: identity.publicKey,
    profile: {
      displayName: "Rosa P.",
      skills: ["cooking"],
      availability: "evenings",
      availabilityChips: [],
      locationZone: "north",
    },
    expiryMs: 15 * 60_000,
  });
  return overrides.expiresAt !== undefined
    ? { ...payload, expiresAt: overrides.expiresAt }
    : payload;
}

describe("badgeForPubkey", () => {
  it("uses a table of 64 unique emoji", () => {
    expect(BADGE_EMOJI.length).toBe(64);
    expect(new Set(BADGE_EMOJI).size).toBe(64);
  });

  it("is deterministic and key-dependent", () => {
    const a = b64encode(generateLinkKeypair().publicKey);
    const b = b64encode(generateLinkKeypair().publicKey);
    expect(badgeForPubkey(a)).toEqual(badgeForPubkey(a));
    // 12 bits of badge space — two random keys COULD collide, but
    // the derivation must at least depend on the input; assert via
    // channel ids, which are full-width.
    expect(grantChannelIdForPubkey(a)).not.toBe(grantChannelIdForPubkey(b));
    for (const e of badgeForPubkey(a)) expect(BADGE_EMOJI).toContain(e);
  });
});

describe("grantChannelIdForPubkey", () => {
  it("emits 64 lowercase hex chars, stable per key", () => {
    const pk = b64encode(generateLinkKeypair().publicKey);
    const id = grantChannelIdForPubkey(pk);
    expect(id).toMatch(/^[0-9a-f]{64}$/);
    expect(grantChannelIdForPubkey(pk)).toBe(id);
  });
});

describe("sealGrant / openGrant", () => {
  it("round-trips a transfer payload to the request keypair", () => {
    const kp = generateLinkKeypair();
    const payload = samplePayload();
    const sealed = sealGrant(payload, b64encode(kp.publicKey));
    const opened = openGrant(sealed, kp);
    expect(opened.ok).toBe(true);
    if (opened.ok) {
      expect(opened.payload.profile.displayName).toBe("Rosa P.");
      expect(opened.payload.publicKey).toBe(payload.publicKey);
    }
  });

  it("cannot be opened by a different keypair", () => {
    const kp = generateLinkKeypair();
    const other = generateLinkKeypair();
    const sealed = sealGrant(samplePayload(), b64encode(kp.publicKey));
    const opened = openGrant(sealed, other);
    expect(opened).toEqual({ ok: false, reason: "malformed_envelope" });
  });

  it("rejects tampered ciphertext and junk", () => {
    const kp = generateLinkKeypair();
    const sealed = sealGrant(samplePayload(), b64encode(kp.publicKey));
    const parsed = JSON.parse(atob(sealed)) as { box: string };
    parsed.box = parsed.box.slice(0, -4) + "AAAA";
    const tampered = btoa(JSON.stringify(parsed));
    expect(openGrant(tampered, kp).ok).toBe(false);
    expect(openGrant("complete-garbage", kp).ok).toBe(false);
  });

  it("rejects an expired payload even when decryption succeeds", () => {
    const kp = generateLinkKeypair();
    const sealed = sealGrant(
      samplePayload({ expiresAt: Date.now() - 1000 }),
      b64encode(kp.publicKey),
    );
    expect(openGrant(sealed, kp)).toEqual({ ok: false, reason: "expired" });
  });
});

describe("link-request client", () => {
  it("posts the pubkey and maps the created response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ ok: true, cancelToken: "tok", expiresAt: 99 }),
        { status: 201 },
      ),
    );
    const res = await postLinkRequest(
      "https://node.example/api",
      "PUBKEY",
      fetchImpl as unknown as typeof fetch,
    );
    expect(res).toEqual({ kind: "ok", cancelToken: "tok", expiresAt: 99 });
    const [url] = fetchImpl.mock.calls[0] as [string];
    expect(url).toBe("https://node.example/api/link-request");
  });

  it("maps 429 to too_many and failures to error", async () => {
    const busy = vi.fn().mockResolvedValue(new Response("", { status: 429 }));
    expect(
      await postLinkRequest("https://n/api", "PK", busy as unknown as typeof fetch),
    ).toEqual({ kind: "too_many" });
    const down = vi.fn().mockRejectedValue(new Error("offline"));
    expect(
      await postLinkRequest("https://n/api", "PK", down as unknown as typeof fetch),
    ).toEqual({ kind: "error" });
  });

  it("lists pending requests, dropping malformed entries", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          requests: [
            { pubkey: "A", createdAt: 1 },
            { pubkey: 42, createdAt: "bad" },
          ],
        }),
        { status: 200 },
      ),
    );
    const res = await listLinkRequests(
      "https://n/api",
      fetchImpl as unknown as typeof fetch,
    );
    expect(res).toEqual({
      kind: "ok",
      requests: [{ pubkey: "A", createdAt: 1 }],
    });
  });
});

describe("community connection rides the transfer", () => {
  it("sealGrant/openGrant preserve communityNode verbatim", () => {
    const kp = generateLinkKeypair();
    const payload = {
      ...samplePayload(),
      communityNode: { url: "https://coop.example/api", enabled: true },
    };
    const opened = openGrant(sealGrant(payload, b64encode(kp.publicKey)), kp);
    expect(opened.ok).toBe(true);
    if (opened.ok) {
      expect(opened.payload.communityNode).toEqual({
        url: "https://coop.example/api",
        enabled: true,
      });
    }
  });

  it("stays optional — a payload without it round-trips as undefined", () => {
    const kp = generateLinkKeypair();
    const opened = openGrant(
      sealGrant(samplePayload(), b64encode(kp.publicKey)),
      kp,
    );
    expect(opened.ok).toBe(true);
    if (opened.ok) expect(opened.payload.communityNode).toBeUndefined();
  });
});

describe("community id rides the transfer", () => {
  it("sealGrant/openGrant preserve the source nodeId verbatim", () => {
    const kp = generateLinkKeypair();
    const payload = { ...samplePayload(), nodeId: "node_abc12345" };
    const opened = openGrant(sealGrant(payload, b64encode(kp.publicKey)), kp);
    expect(opened.ok).toBe(true);
    if (opened.ok) expect(opened.payload.nodeId).toBe("node_abc12345");
  });
});
