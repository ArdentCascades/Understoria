/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The Transcription settings card (V7 #477 Phase 1): every cost
// stated before it's paid, every can't-do said honestly — an
// unsupported device, a node without models, a language without one
// — and the model download offered with its size in plain language.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ManifestResult,
  ModelEntry,
} from "@/lib/transcriptionModels";

let mockSupported = true;
let mockManifest: ManifestResult = { kind: "absent" };
let mockDownloaded = false;
const downloadMock = vi.fn(async (_entry: ModelEntry) => ({ kind: "ok" }) as const);
const deleteMock = vi.fn(async () => undefined);

vi.mock("@/lib/transcription", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/transcription")>()),
  canRunTranscription: () => mockSupported,
}));

vi.mock("@/lib/transcriptionModels", async (importOriginal) => {
  const real =
    await importOriginal<typeof import("@/lib/transcriptionModels")>();
  return {
    ...real,
    fetchModelManifest: async () => mockManifest,
    isModelDownloaded: async () => mockDownloaded,
    downloadModel: (entry: ModelEntry) => downloadMock(entry as never),
    deleteAllModels: () => deleteMock(),
  };
});

import "@/i18n";
import i18n from "@/i18n";
import { setTranscriptionEnabled } from "@/lib/transcription";
import { TranscriptionSection } from "./TranscriptionSection";

const ES_ENTRY: ModelEntry = {
  file: "vosk-model-small-es-0.42.tar.gz",
  bytes: 39_000_000,
  sha256: "ab".repeat(32),
  label: "vosk-model-small-es-0.42",
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  mockSupported = true;
  mockManifest = { kind: "absent" };
  mockDownloaded = false;
  setTranscriptionEnabled(false);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  setTranscriptionEnabled(false);
  vi.clearAllMocks();
});

async function render() {
  await act(async () => {
    root.render(<TranscriptionSection />);
  });
}

describe("TranscriptionSection", () => {
  it("says the device can't run it instead of offering a dead toggle", async () => {
    mockSupported = false;
    await render();
    expect(container.textContent).toContain(
      i18n.t("transcription.unsupported"),
    );
    expect(
      [...container.querySelectorAll("button")].map((b) => b.textContent),
    ).toEqual([]);
  });

  it("toggles and persists; model states appear only while enabled", async () => {
    await render();
    const on = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === i18n.t("transcription.turnOn"),
    );
    expect(on).toBeDefined();
    // Nothing about models while the feature is off.
    expect(container.textContent).not.toContain(
      i18n.t("transcription.noModels"),
    );

    await act(async () => on!.click());
    expect(container.textContent).toContain(
      i18n.t("transcription.turnOff"),
    );
    // Node hosts no /models/ — the honest state, not an error.
    expect(container.textContent).toContain(
      i18n.t("transcription.noModels"),
    );
  });

  it("shows the honest per-language note when no model exists for the language", async () => {
    setTranscriptionEnabled(true);
    mockManifest = { kind: "ok", models: {} };
    await render();
    expect(container.textContent).toContain(
      i18n.t("transcription.noModelForLanguage", { language: "English" }),
    );
  });

  it("offers the download with its size stated, then reports downloaded", async () => {
    setTranscriptionEnabled(true);
    mockManifest = { kind: "ok", models: { en: ES_ENTRY } };
    await render();

    const label = i18n.t("transcription.download", {
      language: "English",
      size: "37 MB",
    });
    const button = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === label,
    );
    expect(button).toBeDefined();

    await act(async () => button!.click());
    expect(downloadMock).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain(
      i18n.t("transcription.downloaded", {
        language: "English",
        size: "37 MB",
      }),
    );
  });

  it("skips the download offer when the model is already on the device", async () => {
    setTranscriptionEnabled(true);
    mockManifest = { kind: "ok", models: { en: ES_ENTRY } };
    mockDownloaded = true;
    await render();
    expect(container.textContent).toContain(
      i18n.t("transcription.removeModel"),
    );

    const remove = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === i18n.t("transcription.removeModel"),
    );
    await act(async () => remove!.click());
    expect(deleteMock).toHaveBeenCalledTimes(1);
    // Back to the offer — presence is never assumed after a delete.
    expect(container.textContent).toContain(
      i18n.t("transcription.download", {
        language: "English",
        size: "37 MB",
      }),
    );
  });
});
