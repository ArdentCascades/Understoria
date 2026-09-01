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
// PrintToolbar's one behavioral fork: in the installed iOS app
// `window.print()` is a silent no-op (standalone WebKit has no print
// UI), so the toolbar must swap the dead button for the honest
// guidance — everywhere else the Print button stays and fires
// window.print(). Locks both branches so neither regresses into a
// button that "doesn't seem to do anything".
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/installGuide", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/installGuide")>()),
  isInstalledIosApp: () => mockIosApp,
}));

import "@/i18n";
import i18n from "@/i18n";
import { PrintToolbar } from "./PrintChrome";

let mockIosApp = false;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

function render() {
  act(() => {
    root.render(
      <MemoryRouter>
        <PrintToolbar />
      </MemoryRouter>,
    );
  });
}

describe("PrintToolbar", () => {
  it("shows a working Print button outside the installed iOS app", () => {
    mockIosApp = false;
    const printSpy = vi
      .spyOn(window, "print")
      .mockImplementation(() => undefined);
    render();

    const label = i18n.t("print.printButton");
    const button = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === label,
    );
    expect(button).toBeDefined();
    expect(container.textContent).not.toContain(i18n.t("print.iosApp.explain"));

    act(() => button!.click());
    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it("replaces the dead button with honest guidance in the installed iOS app", () => {
    mockIosApp = true;
    render();

    const label = i18n.t("print.printButton");
    const button = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === label,
    );
    expect(button).toBeUndefined();
    expect(container.textContent).toContain(i18n.t("print.iosApp.explain"));
    expect(container.textContent).toContain(
      i18n.t("print.iosApp.screenshot"),
    );
    expect(container.textContent).toContain(i18n.t("print.iosApp.safari"));
    // Back stays available either way.
    expect(container.textContent).toContain(i18n.t("common.back"));
  });
});
