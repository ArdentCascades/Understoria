/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteAllModels,
  downloadModel,
  fetchModelManifest,
  isModelDownloaded,
  modelForLanguage,
  readCachedModelEntry,
  readModelBytes,
  type ModelEntry,
} from "./transcriptionModels";

// The model-hosting client (docs/transcription-plan.md D4): manifest
// honesty (absent is a state, not an error), SHA-256 verification
// that REFUSES a mismatch, and Cache Storage presence the Settings
// card can show and delete.

const MODEL_BYTES = new TextEncoder().encode("pretend model archive");

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    bytes.buffer as ArrayBuffer,
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function entryWith(sha256: string): ModelEntry {
  return {
    file: "vosk-model-small-es-0.42.tar.gz",
    bytes: MODEL_BYTES.length,
    sha256,
    label: "vosk-model-small-es-0.42",
  };
}

class FakeCache {
  store = new Map<string, Response>();
  async match(key: string): Promise<Response | undefined> {
    return this.store.get(key);
  }
  async put(key: string, res: Response): Promise<void> {
    this.store.set(key, res);
  }
}

let cache: FakeCache;

beforeEach(() => {
  cache = new FakeCache();
  vi.stubGlobal("caches", {
    open: async () => cache,
    delete: async () => {
      cache.store.clear();
      return true;
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchModelManifest", () => {
  it("reports absent on 404 and on an SPA fallback that answers HTML", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 404 })),
    );
    expect((await fetchModelManifest()).kind).toBe("absent");

    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("<!doctype html>", {
            status: 200,
            headers: { "content-type": "text/html" },
          }),
      ),
    );
    expect((await fetchModelManifest()).kind).toBe("absent");
  });

  it("reports unreachable when the network fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    expect((await fetchModelManifest()).kind).toBe("unreachable");
  });

  it("parses well-formed entries and drops malformed ones", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              models: {
                es: {
                  file: "vosk-model-small-es-0.42.tar.gz",
                  bytes: 39_000_000,
                  sha256: "ab".repeat(32),
                  label: "vosk-model-small-es-0.42",
                },
                broken: { file: 3 },
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
      ),
    );
    const manifest = await fetchModelManifest();
    expect(manifest.kind).toBe("ok");
    // Regioned app language resolves by primary subtag.
    expect(modelForLanguage(manifest, "es-MX")?.file).toBe(
      "vosk-model-small-es-0.42.tar.gz",
    );
    // No model for the language — the honest per-language state.
    expect(modelForLanguage(manifest, "bo")).toBeNull();
    expect(modelForLanguage(manifest, "broken")).toBeNull();
  });
});

describe("downloadModel", () => {
  it("verifies the SHA-256 and stores the bytes on match", async () => {
    const entry = entryWith(await sha256Hex(MODEL_BYTES));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(MODEL_BYTES.slice())),
    );

    expect(await isModelDownloaded(entry)).toBe(false);
    expect((await downloadModel(entry, "es")).kind).toBe("ok");
    expect(await isModelDownloaded(entry)).toBe(true);

    const stored = await readModelBytes(entry);
    expect(stored).not.toBeNull();
    expect([...new Uint8Array(stored!)]).toEqual([...MODEL_BYTES]);
  });

  it("REFUSES a hash mismatch and stores nothing", async () => {
    const entry = entryWith("00".repeat(32));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(MODEL_BYTES.slice())),
    );

    expect((await downloadModel(entry, "es")).kind).toBe("verify_failed");
    expect(await isModelDownloaded(entry)).toBe(false);
    expect(await readModelBytes(entry)).toBeNull();
  });

  it("reports a failed download without throwing", async () => {
    const entry = entryWith(await sha256Hex(MODEL_BYTES));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("gone", { status: 404 })),
    );
    expect((await downloadModel(entry, "es")).kind).toBe("failed");
  });

  it("caches the manifest entry beside the bytes for offline lookup", async () => {
    const entry = entryWith(await sha256Hex(MODEL_BYTES));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(MODEL_BYTES.slice())),
    );

    expect(await readCachedModelEntry("es")).toBeNull();
    await downloadModel(entry, "es");
    // The entry round-trips (regioned language resolves too), so a
    // later transcription needs no manifest fetch at all.
    expect(await readCachedModelEntry("es-MX")).toEqual(entry);
    expect(await readCachedModelEntry("bo")).toBeNull();

    await deleteAllModels();
    expect(await readCachedModelEntry("es")).toBeNull();
  });

  it("delete removes everything and presence reports honestly", async () => {
    const entry = entryWith(await sha256Hex(MODEL_BYTES));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(MODEL_BYTES.slice())),
    );
    await downloadModel(entry, "es");
    expect(await isModelDownloaded(entry)).toBe(true);

    await deleteAllModels();
    expect(await isModelDownloaded(entry)).toBe(false);
  });
});
