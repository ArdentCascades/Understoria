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

// The nudge stream (docs/sync-liveness.md, "server push") turns the
// node's content-free SSE events into SYNC_KICK_EVENT dispatches —
// the same signal a focus kick sends the sync loop. These tests
// drive it with a hand-rolled ReadableStream standing in for the
// long-lived /nudges response.

vi.mock("@/lib/authorizedRead", () => ({
  authorizedFetch: vi.fn(
    (url: string, base: string, init?: RequestInit) =>
      mockFetch(url, base, init),
  ),
}));
vi.mock("@/lib/demo", () => ({
  isDemoBuild: () => mockDemo,
}));
vi.mock("@/lib/nodeEndpoints", () => ({
  listNodeEndpoints: vi.fn(async () => ({
    primary: mockPrimary,
    mirrors: [],
  })),
}));

import { startNudgeStream } from "./nudgeStream";
import { SYNC_KICK_EVENT } from "@/lib/syncLoop";

let mockDemo = false;
let mockPrimary: string | null = "https://node.example";
let mockFetch: (
  url: string,
  base: string,
  init?: RequestInit,
) => Promise<Response>;

interface FakeStream {
  response: Response;
  push: (text: string) => void;
  close: () => void;
}

function makeSseResponse(): FakeStream {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });
  const encoder = new TextEncoder();
  return {
    response: new Response(body, {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    }),
    push: (text: string) => controller.enqueue(encoder.encode(text)),
    close: () => controller.close(),
  };
}

async function waitFor(
  predicate: () => boolean,
  what: string,
  timeoutMs = 2_000,
): Promise<void> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`timed out waiting for ${what}`);
    }
    await new Promise((r) => setTimeout(r, 5));
  }
}

let stop: (() => void) | null = null;
let kicks = 0;
const onKick = () => {
  kicks += 1;
};

beforeEach(() => {
  mockDemo = false;
  mockPrimary = "https://node.example";
  kicks = 0;
  window.addEventListener(SYNC_KICK_EVENT, onKick);
});

afterEach(() => {
  stop?.();
  stop = null;
  window.removeEventListener(SYNC_KICK_EVENT, onKick);
  vi.clearAllMocks();
});

describe("startNudgeStream", () => {
  it("dispatches SYNC_KICK_EVENT for every nudge frame — and nothing for comments", async () => {
    const stream = makeSseResponse();
    let calls = 0;
    mockFetch = async () => {
      calls += 1;
      return stream.response;
    };
    stop = startNudgeStream();
    await waitFor(() => calls === 1, "stream connect");

    stream.push(": connected\n\n");
    stream.push(": hb\n\n");
    await new Promise((r) => setTimeout(r, 20));
    expect(kicks).toBe(0);

    stream.push("event: nudge\ndata: {}\n\n");
    await waitFor(() => kicks === 1, "first kick");
    // A frame split across chunks must still parse (real network
    // boundaries don't respect SSE framing).
    stream.push("event: nu");
    stream.push("dge\ndata: {}\n\n");
    await waitFor(() => kicks === 2, "split-frame kick");
    stream.close();
  });

  it("signs the read: the request goes through authorizedFetch against the primary node", async () => {
    const stream = makeSseResponse();
    let seenUrl = "";
    let seenBase = "";
    let seenSignal: AbortSignal | undefined;
    mockFetch = async (url, base, init) => {
      seenUrl = url;
      seenBase = base;
      seenSignal = init?.signal ?? undefined;
      return stream.response;
    };
    stop = startNudgeStream();
    await waitFor(() => seenUrl !== "", "stream connect");
    expect(seenUrl).toBe("https://node.example/nudges");
    expect(seenBase).toBe("https://node.example");
    expect(seenSignal).toBeInstanceOf(AbortSignal);
  });

  it("stop() aborts the live connection", async () => {
    const stream = makeSseResponse();
    let seenSignal: AbortSignal | undefined;
    mockFetch = async (_url, _base, init) => {
      seenSignal = init?.signal ?? undefined;
      return stream.response;
    };
    stop = startNudgeStream();
    await waitFor(() => seenSignal !== undefined, "stream connect");
    expect(seenSignal!.aborted).toBe(false);
    stop();
    stop = null;
    expect(seenSignal!.aborted).toBe(true);
  });

  it("does nothing at all in a demo build", async () => {
    mockDemo = true;
    let calls = 0;
    mockFetch = async () => {
      calls += 1;
      return makeSseResponse().response;
    };
    stop = startNudgeStream();
    await new Promise((r) => setTimeout(r, 30));
    expect(calls).toBe(0);
  });

  it("waits politely when no node is configured", async () => {
    mockPrimary = null;
    let calls = 0;
    mockFetch = async () => {
      calls += 1;
      return makeSseResponse().response;
    };
    stop = startNudgeStream();
    await new Promise((r) => setTimeout(r, 30));
    expect(calls).toBe(0);
  });

  it("reconnects after the server closes the stream", async () => {
    let calls = 0;
    const first = makeSseResponse();
    const second = makeSseResponse();
    mockFetch = async () => {
      calls += 1;
      return calls === 1 ? first.response : second.response;
    };
    stop = startNudgeStream();
    await waitFor(() => calls === 1, "first connect");
    // A healthy event resets backoff to RETRY_MIN before the close.
    first.push("event: nudge\ndata: {}\n\n");
    await waitFor(() => kicks === 1, "kick before close");
    first.close();
    // Reconnect lands within the 2s minimum backoff.
    await waitFor(() => calls === 2, "reconnect", 5_000);
    second.push("event: nudge\ndata: {}\n\n");
    await waitFor(() => kicks === 2, "kick on the second connection");
  }, 10_000);

  it("a hidden tab closes the stream; visible again reconnects", async () => {
    let calls = 0;
    const streams: FakeStream[] = [];
    let seenSignal: AbortSignal | undefined;
    mockFetch = async (_url, _base, init) => {
      calls += 1;
      seenSignal = init?.signal ?? undefined;
      const s = makeSseResponse();
      streams.push(s);
      return s.response;
    };
    const setVisibility = (state: "visible" | "hidden") => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => state,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    };

    stop = startNudgeStream();
    await waitFor(() => calls === 1, "initial connect");

    setVisibility("hidden");
    expect(seenSignal!.aborted).toBe(true);

    setVisibility("visible");
    await waitFor(() => calls === 2, "reconnect on visible");
    streams[1].push("event: nudge\ndata: {}\n\n");
    await waitFor(() => kicks === 1, "kick after reconnect");
    setVisibility("visible"); // restore default for other suites
  });
});
