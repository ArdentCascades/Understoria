/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * InviteShareSheet gate contract (docs/threat-model.md §7 —
 * "QR codes are camera-surveillance targets"):
 *
 *   - The sheet opens on the GATE, never on the reveal. The raw
 *     invite URL / token is NOT on screen until the member makes
 *     the explicit "show the invite" choice.
 *   - When the browser CAN share/copy, "Send the link without
 *     showing it" is the visually-primary action and holds focus,
 *     so a stray Enter ships the link off-framebuffer instead of
 *     revealing it. Clicking it routes through shareUrl(); a
 *     native-share success closes the sheet, a clipboard-copy
 *     keeps it open with a status that says the link is NOT on
 *     screen, and a hard failure points back at the reveal path.
 *   - When the browser CANNOT share/copy, that button is disabled
 *     with an inline note, "Show the invite" takes the primary
 *     slot, and focus falls to Cancel (Enter closes, never
 *     reveals).
 *   - "Show the invite" is the only path that puts the URL + QR on
 *     screen. Escape closes from either state.
 *
 * lib/share.ts behavior (native-vs-clipboard branch, AbortError →
 * cancelled) is covered in lib/share.test.ts; this suite mocks the
 * layer and asserts the gate surface + focus discipline.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ShareResult } from "@/lib/share";

const { canShareUrlMock, shareUrlMock } = vi.hoisted(() => ({
  canShareUrlMock: vi.fn<() => boolean>(() => true),
  shareUrlMock: vi.fn<() => Promise<ShareResult>>(async () => "shared"),
}));

vi.mock("@/lib/share", () => ({
  canShareUrl: canShareUrlMock,
  shareUrl: shareUrlMock,
}));

// The QR renderer dynamically imports the `qrcode` package and
// draws an SVG asynchronously; stub it so the reveal assertion is
// deterministic and doesn't depend on that import landing.
vi.mock("@/components/InviteQRCode", () => ({
  InviteQRCode: ({ ariaLabel }: { ariaLabel: string }) => (
    <div data-testid="qr" aria-label={ariaLabel} />
  ),
}));

import "@/i18n";
import { InviteShareSheet } from "./InviteShareSheet";

const TOKEN = "SHARETESTTOKEN_abcdef0123456789";
const URL = `https://node.example/invite#${TOKEN}`;

let container: HTMLDivElement;
let root: Root;
let onClose: ReturnType<typeof vi.fn<() => void>>;

function render(open = true) {
  act(() => {
    root.render(
      <MemoryRouter>
        <InviteShareSheet
          open={open}
          url={URL}
          shareTitle="Join my community"
          shareText="Come join us."
          onClose={onClose}
        />
      </MemoryRouter>,
    );
  });
}

async function click(el: Element | null | undefined) {
  expect(el).toBeTruthy();
  await act(async () => {
    (el as HTMLElement).dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
  });
}

function button(name: string): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => (b.textContent ?? "").trim() === name,
  );
}

const SHARE_LABEL = "Send the link without showing it";
const REVEAL_LABEL = "Show the invite";
const CANCEL_LABEL = "Not now";

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  onClose = vi.fn();
  canShareUrlMock.mockReturnValue(true);
  shareUrlMock.mockResolvedValue("shared");
  vi.clearAllMocks();
  canShareUrlMock.mockReturnValue(true);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("InviteShareSheet — gate hides the invite", () => {
  it("opens on the gate with the URL/token off screen", () => {
    render();
    expect(container.textContent).toContain("Look around before you show this");
    // The whole point: nothing token-shaped is on the framebuffer yet.
    expect(container.textContent).not.toContain(TOKEN);
    expect(container.querySelector('[data-testid="qr"]')).toBeNull();
  });

  it("re-prompts the gate every time it re-opens", async () => {
    render();
    await click(button(REVEAL_LABEL));
    expect(container.textContent).toContain(TOKEN); // revealed
    // Close and re-open: back to the gate, URL hidden again.
    render(false);
    render(true);
    expect(container.textContent).toContain("Look around before you show this");
    expect(container.textContent).not.toContain(TOKEN);
  });
});

describe("InviteShareSheet — share-without-showing (canShare)", () => {
  it("makes the safe path primary and focuses it", () => {
    render();
    const share = button(SHARE_LABEL);
    expect(share?.className).toContain("btn-primary");
    expect(share?.disabled).toBe(false);
    expect(button(REVEAL_LABEL)?.className).toContain("btn-secondary");
    // Stray Enter must ship the link, not reveal it.
    expect(document.activeElement).toBe(share);
  });

  it("ships the link off-screen and closes on native-share success", async () => {
    shareUrlMock.mockResolvedValue("shared");
    render();
    await click(button(SHARE_LABEL));
    expect(shareUrlMock).toHaveBeenCalledWith({
      url: URL,
      title: "Join my community",
      text: "Come join us.",
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps the sheet open on clipboard copy, with an off-screen status", async () => {
    shareUrlMock.mockResolvedValue("copied");
    render();
    await click(button(SHARE_LABEL));
    expect(onClose).not.toHaveBeenCalled();
    // Gate-specific copy: tells the member the link is NOT on screen.
    expect(container.textContent).toContain("the link is not on screen");
    // Still the gate — token never rendered.
    expect(container.textContent).not.toContain(TOKEN);
  });

  it("points back at the reveal path when share and clipboard both fail", async () => {
    shareUrlMock.mockResolvedValue("failed");
    render();
    await click(button(SHARE_LABEL));
    expect(onClose).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Tap "Show the invite"');
    expect(container.textContent).not.toContain(TOKEN);
  });

  it("stays on the gate when the native share is cancelled", async () => {
    shareUrlMock.mockResolvedValue("cancelled");
    render();
    await click(button(SHARE_LABEL));
    expect(onClose).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain(TOKEN);
  });
});

describe("InviteShareSheet — no share/copy available", () => {
  it("disables the safe button, notes why, and focuses Cancel", () => {
    canShareUrlMock.mockReturnValue(false);
    render();
    const share = button(SHARE_LABEL);
    expect(share?.disabled).toBe(true);
    expect(share?.getAttribute("aria-describedby")).toBe(
      "share-without-showing-note",
    );
    // The note explains the fallback...
    expect(
      container.querySelector("#share-without-showing-note")?.textContent,
    ).toContain("copy it by hand");
    // ...reveal becomes primary, and Enter is parked on Cancel (never reveal).
    expect(button(REVEAL_LABEL)?.className).toContain("btn-primary");
    expect(document.activeElement).toBe(button(CANCEL_LABEL));
  });

  it("does not call shareUrl when the disabled button is clicked", async () => {
    canShareUrlMock.mockReturnValue(false);
    render();
    await click(button(SHARE_LABEL));
    expect(shareUrlMock).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("InviteShareSheet — reveal + dismissal", () => {
  it("reveals the URL and QR only after the explicit choice", async () => {
    render();
    expect(container.textContent).not.toContain(TOKEN);
    await click(button(REVEAL_LABEL));
    expect(container.textContent).toContain("Share this invite");
    expect(container.textContent).toContain(TOKEN); // the <code> URL
    expect(container.querySelector('[data-testid="qr"]')).not.toBeNull();
  });

  it("closes on Escape from the gate without revealing", () => {
    render();
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(container.textContent).not.toContain(TOKEN);
  });

  it("closes when the gate Cancel is clicked", async () => {
    render();
    await click(button(CANCEL_LABEL));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
