/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@/i18n";
import { AddDeviceSection } from "./AddDeviceSection";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});
afterEach(() => {
  act(() => root?.unmount());
  container.remove();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route path="/settings" element={node} />
          <Route path="/add-device" element={<div>PAIRING FLOW</div>} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

describe("AddDeviceSection", () => {
  it("renders a card with the title and a labelled heading", () => {
    render(<AddDeviceSection />);
    const heading = container.querySelector("#profile-addDevice-heading");
    expect(heading?.textContent).toContain("Add another device");
    const section = container.querySelector("section");
    expect(section?.getAttribute("aria-labelledby")).toBe(
      "profile-addDevice-heading",
    );
  });

  it("navigates to the pairing flow when the CTA is clicked", () => {
    render(<AddDeviceSection />);
    const cta = Array.from(container.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Start pairing",
    )!;
    expect(cta).toBeTruthy();
    act(() => {
      cta.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("PAIRING FLOW");
  });
});
