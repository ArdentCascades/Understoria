/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ManifestResult,
  ModelEntry,
} from "./transcriptionModels";

// Model resolution honesty (the field report that motivated it: a
// member on a node with no models was pointed at a Settings download
// that didn't exist) and the offline contract: a downloaded model is
// found through the cached entry with ZERO network — the manifest is
// only consulted to tell a member without a model the truth.

let mockCachedEntry: ModelEntry | null = null;
let mockManifest: ManifestResult = { kind: "absent" };
let mockBytes: ArrayBuffer | null = null;
const manifestMock = vi.fn(async () => mockManifest);

vi.mock("./transcription", () => ({
  isTranscriptionEnabled: () => mockEnabled,
  canRunTranscription: () => mockCanRun,
}));

vi.mock("./transcriptionModels", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./transcriptionModels")>()),
  readCachedModelEntry: async () => mockCachedEntry,
  fetchModelManifest: () => manifestMock(),
  readModelBytes: async () => mockBytes,
}));

import { transcribeClip } from "./transcriptionEngine";

let mockEnabled = true;
let mockCanRun = true;

const ENTRY: ModelEntry = {
  file: "vosk-model-small-en-us-0.15.tar.gz",
  bytes: 41_000_000,
  sha256: "ab".repeat(32),
  label: "vosk-model-small-en-us-0.15",
};

beforeEach(() => {
  mockEnabled = true;
  mockCanRun = true;
  mockCachedEntry = null;
  mockManifest = { kind: "absent" };
  mockBytes = null;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("transcribeClip model resolution", () => {
  it("answers unsupported when the member hasn't opted in or the device can't", async () => {
    mockEnabled = false;
    expect((await transcribeClip("aGk=", "en")).kind).toBe("unsupported");
    mockEnabled = true;
    mockCanRun = false;
    expect((await transcribeClip("aGk=", "en")).kind).toBe("unsupported");
  });

  it("says the node offers no model — never a pointer to a download that doesn't exist", async () => {
    // Static tier without /models/ at all.
    mockManifest = { kind: "absent" };
    expect((await transcribeClip("aGk=", "en")).kind).toBe("node_no_model");
    // Models exist, none for this language.
    mockManifest = { kind: "ok", models: {} };
    expect((await transcribeClip("aGk=", "bo")).kind).toBe("node_no_model");
  });

  it("points at the Settings download when a model exists but isn't on the device", async () => {
    mockManifest = { kind: "ok", models: { en: ENTRY } };
    mockBytes = null;
    expect((await transcribeClip("aGk=", "en")).kind).toBe("no_model");
  });

  it("reads a downloaded model through the cached entry with NO network", async () => {
    mockCachedEntry = ENTRY;
    mockBytes = new ArrayBuffer(8);
    // jsdom has no OfflineAudioContext, so the run fails at decode —
    // AFTER model resolution. The assertion that matters: the
    // manifest was never fetched. Offline-after-download, held.
    const outcome = await transcribeClip("aGk=", "en");
    expect(outcome.kind).toBe("failed");
    expect(manifestMock).not.toHaveBeenCalled();
  });

  it("treats an unreachable manifest with no local model as not-downloaded", async () => {
    mockManifest = { kind: "unreachable" };
    expect((await transcribeClip("aGk=", "en")).kind).toBe("no_model");
  });
});
