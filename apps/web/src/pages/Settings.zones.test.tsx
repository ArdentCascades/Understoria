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
// Settings-by-authority contract: the page is organized into three
// zones — "On this device", "How this community is run", "This node" —
// in that order, so a control's position states who can change it. The
// community zone leads with a READ-ONLY mirror of the node thresholds
// plus the "propose a change" doorway (governance, not a personal
// switch), with the editable bootstrap form beneath. jsdom does no
// layout; these pin the structure + the honest doorway.
//
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockNodeConfig = {
  dailyHelperLimit: 7,
  shortExchangeHours: 0.25,
  reciprocalPairThreshold: 8,
  taskCheckInDays: 5,
  taskNeedsHelpDays: 10,
  taskCheckInGraceDays: 3,
  proposalDeliberationDays: 4,
  proposalMinAffirms: 3,
  adoptionQuietDays: 2,
  autoConfirmHours: 336,
  customMilestones: [],
  inviteOnly: false,
};

vi.mock("@/state/AppContext", () => ({
  useApp: () => ({ nodeConfig: mockNodeConfig, nodeId: "node-1" }),
}));

// Stub the leaf sections — each reaches into Dexie / live queries that
// have no home in jsdom. We're testing the zone scaffolding and the
// community summary, not these.
vi.mock("@/components/LanguageSection", () => ({ LanguageSection: () => null }));
vi.mock("@/components/ReadAloudSection", () => ({ ReadAloudSection: () => null }));
vi.mock("@/components/AppearanceSection", () => ({ AppearanceSection: () => null }));
vi.mock("@/components/BlockedContactsPanel", () => ({
  BlockedContactsPanel: () => null,
}));
vi.mock("@/components/NodeSection", () => ({
  NodeSection: () => <div data-testid="node-section" />,
}));
vi.mock("@/components/ReseedSection", () => ({ ReseedSection: () => null }));
vi.mock("@/components/SecuritySection", () => ({ SecuritySection: () => null }));
vi.mock("@/components/RecoveryKitCard", () => ({ RecoveryKitCard: () => null }));
vi.mock("@/components/GuardianShardsCard", () => ({
  GuardianShardsCard: () => null,
}));
vi.mock("@/components/StorageWindowSection", () => ({
  StorageWindowSection: () => null,
}));
vi.mock("@/components/CommunitySettingsSection", () => ({
  CommunitySettingsSection: () => <div data-testid="bootstrap-editor" />,
}));
vi.mock("@/lib/storageBudget", () => ({
  readStorageStatus: async () => null,
  formatBytes: (n: number) => String(n),
}));

import "@/i18n";
import SettingsPage from "./Settings";

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
    root.render(<MemoryRouter initialEntries={["/settings"]}>{node}</MemoryRouter>);
  });
}

describe("Settings authority zones", () => {
  it("renders the three authority zones in device → community → node order", () => {
    render(<SettingsPage />);
    const zoneHeadings = Array.from(
      container.querySelectorAll<HTMLElement>('[id^="settings-zone-"]'),
    ).map((h) => h.id);
    expect(zoneHeadings).toEqual([
      "settings-zone-device",
      "settings-zone-community",
      "settings-zone-node",
    ]);
  });

  it("each zone section is aria-labelledby its heading", () => {
    render(<SettingsPage />);
    for (const id of ["device", "community", "node"]) {
      const section = container.querySelector<HTMLElement>(
        `section[aria-labelledby="settings-zone-${id}"]`,
      );
      expect(section).not.toBeNull();
    }
  });

  it("community zone mirrors the node thresholds read-only and offers the propose doorway", () => {
    render(<SettingsPage />);
    const communitySection = container.querySelector<HTMLElement>(
      'section[aria-labelledby="settings-zone-community"]',
    )!;
    // Read-only reflection carries a live nodeConfig value…
    expect(communitySection.textContent).toContain("7"); // dailyHelperLimit
    // …and there are NO editable inputs in the summary card (the summary
    // is a definition list, not a form). The bootstrap editor is a
    // separate stubbed child.
    const summaryCard = communitySection.querySelector("dl");
    expect(summaryCard).not.toBeNull();
    expect(summaryCard!.querySelector("input")).toBeNull();
    // The governance doorway points at /proposals/new — a proposal, not
    // a switch.
    const propose = communitySection.querySelector<HTMLAnchorElement>(
      'a[href="/proposals/new"]',
    );
    expect(propose).not.toBeNull();
    const seeAll = communitySection.querySelector<HTMLAnchorElement>(
      'a[href="/proposals"]',
    );
    expect(seeAll).not.toBeNull();
    // The bootstrap editor still lives here (moved off Profile), beneath
    // the summary.
    expect(
      communitySection.querySelector('[data-testid="bootstrap-editor"]'),
    ).not.toBeNull();
  });

  it("node zone holds the device's link to the community server", () => {
    render(<SettingsPage />);
    const nodeSection = container.querySelector<HTMLElement>(
      'section[aria-labelledby="settings-zone-node"]',
    )!;
    expect(
      nodeSection.querySelector('[data-testid="node-section"]'),
    ).not.toBeNull();
  });
});
