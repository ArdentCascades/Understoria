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
//
// The offline kit (/print/offline-kit). Locks:
//   1. Without an SSID the kit degrades honestly: no WiFi QR, the
//      "ask for the community WiFi" line instead, and NO printed
//      credential caveat (there's no credential).
//   2. With a typed SSID + password: the WiFi QR carries the native
//      WIFI: payload, the password prints in plain text, and the
//      shares-with-everyone caveat prints with it.
//   3. Two wallet cards with dashed cut borders; the paper footer.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/InviteQRCode", () => ({
  InviteQRCode: ({ value }: { value: string }) => (
    <div data-testid="qr" data-value={value} />
  ),
}));

import "@/i18n";
import PrintOfflineKitPage from "./PrintOfflineKit";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/print/offline-kit"]}>
        <PrintOfflineKitPage />
      </MemoryRouter>,
    );
  });
}

// React 18 swallows direct `.value =` writes; use the native setter.
function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

const qrValues = () =>
  [...container.querySelectorAll('[data-testid="qr"]')].map((el) =>
    el.getAttribute("data-value"),
  );

describe("PrintOfflineKitPage", () => {
  it("degrades honestly without an SSID: address QR only, ask-for-WiFi copy, no credential caveat", () => {
    render();
    expect(qrValues()).toEqual([window.location.origin]);
    expect(container.textContent).toContain(
      "Ask a member or the shelter desk",
    );
    expect(container.textContent).not.toContain("shares the hub WiFi");
    expect(container.textContent).toContain("paper doesn't sync or purge");
  });

  it("with typed WiFi: the native WIFI: QR, the printed password, and the caveat", () => {
    render();
    const inputs = container.querySelectorAll<HTMLInputElement>(
      'input[type="text"]',
    );
    setInputValue(inputs[0], "Riverside-Hub");
    setInputValue(inputs[1], "acorns");

    expect(qrValues()).toEqual([
      "WIFI:T:WPA;S:Riverside-Hub;P:acorns;;",
      window.location.origin,
    ]);
    expect(container.textContent).toContain("Password: acorns");
    expect(container.textContent).toContain("shares the hub WiFi");
    expect(container.textContent).toContain("Hub WiFi: Riverside-Hub");
  });

  it("prints two wallet cards with dashed cut borders", () => {
    render();
    const cards = [...container.querySelectorAll("div")].filter((el) =>
      el.className.includes("border-dashed"),
    );
    expect(cards.length).toBe(2);
  });
});
