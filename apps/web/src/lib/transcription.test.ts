/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  canRunTranscription,
  isTranscriptionEnabled,
  setTranscriptionEnabled,
} from "./transcription";
// The no-network-during-inference property is structural: the engine
// module never calls fetch — it consumes verified bytes from the
// model store and hands the worker an object URL. Locked on the
// source text so a refactor that reaches for the network fails here.
import engineSource from "./transcriptionEngine?raw";

afterEach(() => {
  setTranscriptionEnabled(false);
  vi.unstubAllGlobals();
});

describe("transcription preference", () => {
  it("persists per-device and dispatches the change event", () => {
    expect(isTranscriptionEnabled()).toBe(false);
    const heard = vi.fn();
    window.addEventListener("understoria:transcription-changed", heard);

    setTranscriptionEnabled(true);
    expect(isTranscriptionEnabled()).toBe(true);
    setTranscriptionEnabled(false);
    expect(isTranscriptionEnabled()).toBe(false);
    expect(heard).toHaveBeenCalledTimes(2);
    window.removeEventListener("understoria:transcription-changed", heard);
  });
});

describe("canRunTranscription", () => {
  it("is true where WebAssembly compiles and workers exist", () => {
    // Node provides WebAssembly; jsdom has no Worker, so stub one —
    // which doubles as the test that a worker-less environment
    // (the bare jsdom below) answers false.
    vi.stubGlobal("Worker", class {});
    expect(canRunTranscription()).toBe(true);
  });

  it("is false where an API is missing (Worker in bare jsdom)", () => {
    expect(canRunTranscription()).toBe(false);
    vi.stubGlobal("Worker", class {});
    vi.stubGlobal("WebAssembly", undefined);
    expect(canRunTranscription()).toBe(false);
  });

  it("is false where compilation is refused (a CSP without wasm-unsafe-eval)", () => {
    vi.stubGlobal("Worker", class {});
    vi.stubGlobal("WebAssembly", {
      Module: class {
        constructor() {
          throw new Error("blocked by Content Security Policy");
        }
      },
    });
    expect(canRunTranscription()).toBe(false);
  });
});

describe("engine structure: no network during inference", () => {
  it("the engine module never fetches — it is fed local bytes only", () => {
    const src = engineSource as string;
    expect(src.includes("fetch(")).toBe(false);
    // The model reaches the worker as an object URL over verified
    // Cache Storage bytes, never a remote URL.
    expect(src.includes("URL.createObjectURL")).toBe(true);
  });
});
