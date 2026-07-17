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
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@/i18n";
import {
  VoiceRecorder,
  pickRecorderMime,
  type CapturedClip,
} from "./VoiceRecorder";

// Voice capture (voice workstream V1, #471). jsdom has neither
// getUserMedia nor MediaRecorder, so the harness fakes both — which
// is exactly what lets the tests drive the iOS (audio/mp4) and
// Chromium (audio/webm) codec paths deliberately.

const AUDIO_BYTES = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

let supportedMimes: string[] = ["audio/webm;codecs=opus"];
let recorderInstances: FakeMediaRecorder[] = [];
let denyMic = false;

class FakeMediaRecorder {
  static isTypeSupported(type: string): boolean {
    return supportedMimes.includes(type);
  }
  state: "inactive" | "recording" = "inactive";
  mimeType: string;
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  constructor(_stream: unknown, opts?: { mimeType?: string }) {
    this.mimeType = opts?.mimeType ?? "";
    recorderInstances.push(this);
  }
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({
      data: new Blob([AUDIO_BYTES], { type: this.mimeType || "audio/webm" }),
    });
    this.onstop?.();
  }
}

const stopTrack = vi.fn();
function fakeStream() {
  return { getTracks: () => [{ stop: stopTrack }] };
}

let container: HTMLDivElement;
let root: Root;
let captured: CapturedClip | null;
let cancelled: boolean;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  vi.useFakeTimers();
  supportedMimes = ["audio/webm;codecs=opus"];
  recorderInstances = [];
  denyMic = false;
  captured = null;
  cancelled = false;
  stopTrack.mockClear();
  vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn(async () => {
        if (denyMic) throw new DOMException("denied", "NotAllowedError");
        return fakeStream();
      }),
    },
  });
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:fake"),
    revokeObjectURL: vi.fn(),
  });
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.useRealTimers();
});

async function render(maxMs?: number) {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <VoiceRecorder
        maxMs={maxMs}
        onCapture={(clip) => {
          captured = clip;
        }}
        onCancel={() => {
          cancelled = true;
        }}
      />,
    );
    await vi.advanceTimersByTimeAsync(0);
  });
}

function button(label: string): HTMLButtonElement {
  const btn = Array.from(container.querySelectorAll("button")).find((b) =>
    b.textContent?.includes(label),
  );
  if (!btn) throw new Error(`Button "${label}" not found`);
  return btn as HTMLButtonElement;
}

describe("pickRecorderMime", () => {
  it("prefers Opus/WebM, falls back to mp4 (the iOS Safari path)", () => {
    vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
    supportedMimes = ["audio/webm;codecs=opus", "audio/mp4"];
    expect(pickRecorderMime()).toBe("audio/webm;codecs=opus");
    supportedMimes = ["audio/mp4"];
    expect(pickRecorderMime()).toBe("audio/mp4");
    supportedMimes = [];
    expect(pickRecorderMime()).toBe("");
  });
});

describe("VoiceRecorder", () => {
  it("records, stops, reviews, and hands the caller base64 + mime + duration", async () => {
    await render();
    expect(recorderInstances).toHaveLength(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    await act(async () => {
      button("Stop").click();
      await vi.advanceTimersByTimeAsync(100); // FileReader tick
    });
    // Review phase: send it.
    await act(async () => {
      button("Send voice note").click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(captured).not.toBeNull();
    expect(captured!.mime).toBe("audio/webm;codecs=opus");
    expect(captured!.durationMs).toBeGreaterThanOrEqual(3_000);
    const decoded = Uint8Array.from(atob(captured!.base64), (c) =>
      c.charCodeAt(0),
    );
    expect(Array.from(decoded)).toEqual(Array.from(AUDIO_BYTES));
    // Mic released.
    expect(stopTrack).toHaveBeenCalled();
  });

  it("records AAC/MP4 when that is all the platform offers (iOS)", async () => {
    supportedMimes = ["audio/mp4"];
    await render();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
      button("Stop").click();
      await vi.advanceTimersByTimeAsync(100); // FileReader tick
    });
    await act(async () => {
      button("Send voice note").click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(captured!.mime).toBe("audio/mp4");
  });

  it("auto-stops at the cap and keeps the take", async () => {
    await render(2_000);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_600);
    });
    // Recorder stopped itself → review phase visible.
    expect(recorderInstances[0].state).toBe("inactive");
    expect(container.textContent).toContain("Send voice note");
    await act(async () => {
      button("Send voice note").click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(captured!.durationMs).toBeLessThanOrEqual(2_000);
  });

  it("shows plain-language guidance when the microphone is refused", async () => {
    denyMic = true;
    await render();
    expect(container.textContent).toContain(
      "We could not use the microphone",
    );
    expect(recorderInstances).toHaveLength(0);
    // The dismiss button must show translated text, not a raw i18n key.
    expect(button("Close").textContent).toBe("Close");
    expect(container.textContent).not.toContain("common.close");
  });

  it("cancel during recording releases the microphone and tells the caller", async () => {
    await render();
    await act(async () => {
      button("Cancel").click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(cancelled).toBe(true);
    expect(stopTrack).toHaveBeenCalled();
  });
});
