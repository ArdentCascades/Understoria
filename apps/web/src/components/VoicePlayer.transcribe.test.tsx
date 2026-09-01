/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The Transcribe affordance on VoicePlayer (V7 #477 Phase 1): shown
// only when the member opted in — the default player is unchanged,
// zero-cost — and every outcome renders honestly: the transcript,
// the empty result, the missing model pointing at Settings, and the
// failure that leaves playback alone.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TranscribeOutcome } from "@/lib/transcriptionEngine";

let mockOutcome: TranscribeOutcome = { kind: "ok", text: "hello there" };
const transcribeMock = vi.fn(async () => mockOutcome);

vi.mock("@/lib/transcriptionEngine", () => ({
  transcribeClip: (...args: unknown[]) =>
    transcribeMock(...(args as [])),
}));

import "@/i18n";
import i18n from "@/i18n";
import { setTranscriptionEnabled } from "@/lib/transcription";
import { VoicePlayer } from "./VoicePlayer";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  mockOutcome = { kind: "ok", text: "hello there" };
  setTranscriptionEnabled(false);
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:fake"),
    revokeObjectURL: vi.fn(),
  });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  setTranscriptionEnabled(false);
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function render() {
  act(() => {
    root.render(
      <VoicePlayer audioBase64="aGVsbG8=" mime="audio/webm" durationMs={3000} />,
    );
  });
}

function transcribeButton(): HTMLButtonElement | undefined {
  return [...container.querySelectorAll("button")].find(
    (b) => b.textContent === i18n.t("messages.voice.transcribe"),
  );
}

describe("VoicePlayer transcription", () => {
  it("shows nothing transcription-related while the member hasn't opted in", () => {
    render();
    expect(transcribeButton()).toBeUndefined();
    expect(transcribeMock).not.toHaveBeenCalled();
  });

  it("transcribes on tap and renders the transcript", async () => {
    setTranscriptionEnabled(true);
    render();
    const button = transcribeButton();
    expect(button).toBeDefined();

    await act(async () => button!.click());
    expect(transcribeMock).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain(
      i18n.t("messages.voice.transcriptLine", { text: "hello there" }),
    );
    // One-shot: the button gives way to the result.
    expect(transcribeButton()).toBeUndefined();
  });

  it("points at Settings when the model isn't on the device", async () => {
    setTranscriptionEnabled(true);
    mockOutcome = { kind: "no_model" };
    render();
    await act(async () => transcribeButton()!.click());
    expect(container.textContent).toContain(
      i18n.t("messages.voice.transcriptNoModel"),
    );
  });

  it("reports failure without touching playback", async () => {
    setTranscriptionEnabled(true);
    mockOutcome = { kind: "failed" };
    render();
    await act(async () => transcribeButton()!.click());
    expect(container.textContent).toContain(
      i18n.t("messages.voice.transcriptFailed"),
    );
    // The audio element is still there, unaffected.
    expect(container.querySelector("audio")).not.toBeNull();
  });
});
