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
/**
 * CommunitySettingsSection as a collapsed-by-default disclosure
 * (the ProjectDetail "Manage project" precedent). The
 * community-authority principle keeps the editor ON the page and
 * reachable by every member; the disclosure only stops the ~500px
 * threshold form from hogging every Profile visit.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_NODE_CONFIG } from "@understoria/shared/types";

vi.mock("@/state/AppContext", () => ({
  useApp: () => ({
    nodeId: "node_test",
    nodeConfig: DEFAULT_NODE_CONFIG,
    refreshNodeConfig: vi.fn(async () => undefined),
  }),
}));
vi.mock("@/db/nodeConfig", () => ({
  InvalidNodeConfigError: class extends Error {},
  putNodeConfig: vi.fn(async () => undefined),
  resetNodeConfig: vi.fn(async () => DEFAULT_NODE_CONFIG),
  MAX_CUSTOM_MILESTONES: 10,
}));

import "@/i18n";
import { CommunitySettingsSection } from "./CommunitySettingsSection";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/profile"]}>
        <CommunitySettingsSection />
      </MemoryRouter>,
    );
  });
}

describe("CommunitySettingsSection — collapsed disclosure", () => {
  it("renders a CLOSED <details> whose summary names the section with a one-line description", () => {
    render();
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details!.open).toBe(false);
    const summary = details!.querySelector("summary");
    expect(summary!.textContent).toContain("Community settings");
    expect(summary!.textContent).toContain(
      "Open to review or tune the community's thresholds.",
    );
  });

  it("keeps the whole editor reachable inside the disclosure — never removed", () => {
    render();
    const details = container.querySelector("details")!;
    // The form (with its save/reset controls and the bootstrap note's
    // propose link) is in the DOM, ready the moment the member opens
    // the summary.
    expect(details.querySelector("form")).not.toBeNull();
    expect(details.querySelector('a[href="/proposals/new"]')).not.toBeNull();
    expect(details.querySelector("#cfg-daily")).not.toBeNull();

    act(() => {
      details.open = true;
    });
    expect(details.open).toBe(true);
    expect(
      Array.from(details.querySelectorAll("button")).some(
        (b) => b.getAttribute("type") === "submit",
      ),
    ).toBe(true);
  });
});
