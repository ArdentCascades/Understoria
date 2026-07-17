/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@/i18n";
import { AudioPostPlayer } from "./AudioPostPlayer";
import { fetchAudioBlob } from "@/lib/audioBlobs";

// Voice board (#474): the board card / post panel player over the
// content-addressed blob fetch. Fetch behavior itself is covered in
// lib/audioBlobs (and the server route tests); here we lock the three
// UI states — tap-to-load, ready, unavailable-with-retry.

vi.mock("@/lib/audioBlobs", () => ({
  fetchAudioBlob: vi.fn(),
}));
const fetchMock = vi.mocked(fetchAudioBlob);

const AUDIO = {
  blobId: "ab".repeat(32),
  mime: "audio/webm;codecs=opus",
  durationMs: 12_000,
};

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  fetchMock.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(node);
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("AudioPostPlayer", () => {
  it("starts as tap-to-load and fetches only on demand", async () => {
    fetchMock.mockResolvedValue({ base64: "AAAA", mime: AUDIO.mime });
    render(<AudioPostPlayer audio={AUDIO} />);
    expect(fetchMock).not.toHaveBeenCalled();
    const button = container.querySelector("button");
    expect(button?.textContent).toContain("12");

    act(() => {
      button!.click();
    });
    await flush();
    expect(fetchMock).toHaveBeenCalledWith(AUDIO.blobId);
    expect(container.querySelector("audio")).not.toBeNull();
  });

  it("eager mode fetches on mount (the post panel)", async () => {
    fetchMock.mockResolvedValue({ base64: "AAAA", mime: AUDIO.mime });
    render(<AudioPostPlayer audio={AUDIO} eager />);
    await flush();
    expect(fetchMock).toHaveBeenCalledWith(AUDIO.blobId);
    expect(container.querySelector("audio")).not.toBeNull();
  });

  it("shows the not-available-yet fallback with a retry", async () => {
    fetchMock.mockResolvedValue(null);
    render(<AudioPostPlayer audio={AUDIO} eager />);
    await flush();
    expect(container.querySelector("audio")).toBeNull();
    const retry = container.querySelector("button");
    expect(retry).not.toBeNull();

    // The uploader came back online — retry succeeds.
    fetchMock.mockResolvedValue({ base64: "AAAA", mime: AUDIO.mime });
    act(() => {
      retry!.click();
    });
    await flush();
    expect(container.querySelector("audio")).not.toBeNull();
  });
});
