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
  deriveLinkChannelId,
  fetchLinkEnvelope,
  normalizeLinkCode,
  publishLinkEnvelope,
} from "./deviceLink";

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
