import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readSubmitConfig,
  readSubmitStatus,
  submitExchangeToNode,
  writeSubmitConfig,
} from "./nodeSubmit";
import { db, SETTING_KEYS } from "@/db/database";
import type { Exchange } from "@/types";

const NODE = "node_test";

function fakeExchange(): Exchange {
  return {
    id: "ex_test",
    postId: "post_test",
    helperKey: "helper_pk",
    helpedKey: "helped_pk",
    hoursExchanged: 1,
    helperSignature: "sig_h",
    helpedSignature: "sig_d",
    completedAt: 1_700_000_000_000,
    category: "transport",
    nodeId: NODE,
  };
}

beforeEach(async () => {
  await db.settings.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("readSubmitConfig / writeSubmitConfig", () => {
  it("round-trips url and enabled flag through settings", async () => {
    await writeSubmitConfig({ url: "https://node.example/api", enabled: true });
    const cfg = await readSubmitConfig();
    expect(cfg).toEqual({
      url: "https://node.example/api",
      enabled: true,
    });
  });

  it("returns empty / disabled defaults on a fresh node", async () => {
    const cfg = await readSubmitConfig();
    expect(cfg).toEqual({ url: "", enabled: false });
  });
});

describe("submitExchangeToNode (config gates)", () => {
  it("no-ops when disabled", async () => {
    const fetchImpl = vi.fn();
    const r = await submitExchangeToNode(
      fakeExchange(),
      { url: "https://node.example/api", enabled: false },
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    expect(r).toEqual({ ok: false, error: "disabled" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("no-ops when url is empty even if enabled", async () => {
    const fetchImpl = vi.fn();
    const r = await submitExchangeToNode(
      fakeExchange(),
      { url: "", enabled: true },
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    expect(r).toEqual({ ok: false, error: "disabled" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("submitExchangeToNode (network)", () => {
  it("posts to <url>/exchanges with the exchange JSON and returns ok on 2xx", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response('{"stored":true}', { status: 201 }),
    );
    const r = await submitExchangeToNode(
      fakeExchange(),
      { url: "https://node.example/api", enabled: true },
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    expect(r).toEqual({ ok: true, status: 201 });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const calls = fetchImpl.mock.calls as unknown as Array<[string, RequestInit]>;
    const [url, init] = calls[0];
    expect(url).toBe("https://node.example/api/exchanges");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("omit");
    expect(init.mode).toBe("cors");
    const body = JSON.parse(init.body as string) as Exchange;
    expect(body.id).toBe("ex_test");
  });

  it("trims trailing slashes on the configured url", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("{}", { status: 200 }),
    );
    await submitExchangeToNode(
      fakeExchange(),
      { url: "https://node.example/api/", enabled: true },
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    const calls = fetchImpl.mock.calls as unknown as Array<[string]>;
    expect(calls[0][0]).toBe("https://node.example/api/exchanges");
  });

  it("strips a query string from the configured url before joining", async () => {
    // Prior naive string-concat produced `…/api?foo=1/exchanges` here,
    // which is not a valid URL. The URL-parsing implementation drops
    // the query (federation roots don't carry query state).
    const fetchImpl = vi.fn(async () =>
      new Response("{}", { status: 200 }),
    );
    await submitExchangeToNode(
      fakeExchange(),
      { url: "https://node.example/api?foo=1", enabled: true },
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    const calls = fetchImpl.mock.calls as unknown as Array<[string]>;
    expect(calls[0][0]).toBe("https://node.example/api/exchanges");
  });

  it("strips a fragment from the configured url before joining", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("{}", { status: 200 }),
    );
    await submitExchangeToNode(
      fakeExchange(),
      { url: "https://node.example/api#section", enabled: true },
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    const calls = fetchImpl.mock.calls as unknown as Array<[string]>;
    expect(calls[0][0]).toBe("https://node.example/api/exchanges");
  });

  it("handles a host-only base url (no pathname)", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("{}", { status: 200 }),
    );
    await submitExchangeToNode(
      fakeExchange(),
      { url: "https://node.example", enabled: true },
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    const calls = fetchImpl.mock.calls as unknown as Array<[string]>;
    expect(calls[0][0]).toBe("https://node.example/exchanges");
  });

  it("treats 4xx/5xx as failures and records the body", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response('{"error":"bad_signature"}', { status: 422 }),
    );
    const r = await submitExchangeToNode(
      fakeExchange(),
      { url: "https://node.example/api", enabled: true },
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(422);
    expect(r.error).toContain("bad_signature");
  });

  it("treats network errors as failures (does not throw)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("connect ECONNREFUSED");
    });
    const r = await submitExchangeToNode(
      fakeExchange(),
      { url: "https://node.example/api", enabled: true },
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("ECONNREFUSED");
  });

  it("records lastSuccess on success and clears lastError", async () => {
    await db.settings.put({
      key: SETTING_KEYS.communityNodeLastError,
      value: "stale",
    });
    const fetchImpl = vi.fn(async () =>
      new Response("{}", { status: 200 }),
    );
    await submitExchangeToNode(
      fakeExchange(),
      { url: "https://node.example/api", enabled: true },
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    const status = await readSubmitStatus();
    expect(status.lastSuccess).toBeTruthy();
    expect(status.lastError).toBeUndefined();
  });

  it("records lastError on failure and leaves lastSuccess alone", async () => {
    await db.settings.put({
      key: SETTING_KEYS.communityNodeLastSuccess,
      value: "2026-01-01T00:00:00.000Z",
    });
    const fetchImpl = vi.fn(async () => {
      throw new Error("network gone");
    });
    await submitExchangeToNode(
      fakeExchange(),
      { url: "https://node.example/api", enabled: true },
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    const status = await readSubmitStatus();
    expect(status.lastSuccess).toBe("2026-01-01T00:00:00.000Z");
    expect(status.lastError).toContain("network gone");
  });
});
