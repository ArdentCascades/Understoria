/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * DevicePairingDisplay — the copy-hatch contract (design doc §6.3,
 * as revised):
 *   - the hatch is closed by default; the warning precedes the
 *     affordance
 *   - copy writes the ENVELOPE, exactly and only — the passphrase
 *     never rides along
 *   - blocked clipboard access degrades to an honest failure line
 *   - unmount clears the clipboard best-effort, and ONLY when the
 *     clipboard still holds this envelope (never clobbers whatever
 *     the member copied since)
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
import { DevicePairingDisplay } from "./DevicePairingDisplay";

// The QR renderer lazy-loads the `qrcode` chunk; stub it so the test
// exercises this component, not the QR pipeline.
vi.mock("@/components/InviteQRCode", () => ({
  InviteQRCode: ({ ariaLabel }: { ariaLabel: string }) => (
    <div aria-label={ariaLabel} data-testid="qr-stub" />
  ),
}));

const ENVELOPE = "dGVzdC1lbnZlbG9wZS1ieXRlcw";
const PASSPHRASE = "canvas river toolbox yellow march empty";

let container: HTMLDivElement;
let root: Root;
let writeText: ReturnType<typeof vi.fn>;
let readText: ReturnType<typeof vi.fn>;

function renderDisplay() {
  act(() => {
    root.render(
      <DevicePairingDisplay
        encodedEnvelope={ENVELOPE}
        passphrase={PASSPHRASE}
        publicKey="AAAAC3NzaC1lZDI1NTE5AAAA"
        expiresAt={Date.now() + 5 * 60_000}
        onExpired={() => {}}
      />,
    );
  });
}

function clickByText(text: string) {
  const el = Array.from(container.querySelectorAll("button")).find((b) =>
    (b.textContent ?? "").includes(text),
  );
  expect(el, `button containing "${text}"`).toBeDefined();
  act(() => {
    el!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

// Let the fire-and-forget clipboard promise chains settle.
const flush = () => act(async () => {});

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  writeText = vi.fn().mockResolvedValue(undefined);
  readText = vi.fn().mockResolvedValue("");
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText, readText },
    configurable: true,
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("DevicePairingDisplay copy hatch", () => {
  it("keeps the hatch closed by default — warning and copy button absent", () => {
    renderDisplay();
    const toggle = container.querySelector('button[aria-expanded="false"]');
    expect(toggle).not.toBeNull();
    expect(container.textContent).not.toContain("Copy pairing code");
  });

  it("copies the envelope exactly — and never the passphrase", async () => {
    renderDisplay();
    clickByText("Copy the code instead");
    clickByText("Copy pairing code");
    await flush();
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(ENVELOPE);
    const copied = writeText.mock.calls[0][0] as string;
    for (const word of PASSPHRASE.split(" ")) {
      expect(copied).not.toContain(word);
    }
    expect(container.textContent).toContain("Copied.");
  });

  it("shows the honest failure line when the browser blocks clipboard access", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    renderDisplay();
    clickByText("Copy the code instead");
    clickByText("Copy pairing code");
    await flush();
    expect(container.textContent).toContain("Couldn't copy");
  });

  it("clears the clipboard on unmount when it still holds this envelope", async () => {
    readText.mockResolvedValue(ENVELOPE);
    renderDisplay();
    clickByText("Copy the code instead");
    clickByText("Copy pairing code");
    await flush();
    act(() => root.unmount());
    await act(async () => {});
    expect(readText).toHaveBeenCalled();
    expect(writeText).toHaveBeenLastCalledWith("");
  });

  it("leaves the clipboard alone on unmount when the member copied something else since", async () => {
    readText.mockResolvedValue("grocery list");
    renderDisplay();
    clickByText("Copy the code instead");
    clickByText("Copy pairing code");
    await flush();
    writeText.mockClear();
    act(() => root.unmount());
    await act(async () => {});
    expect(writeText).not.toHaveBeenCalled();
  });

  it("never touches the clipboard on unmount when nothing was copied", async () => {
    renderDisplay();
    act(() => root.unmount());
    await act(async () => {});
    expect(readText).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });
});
