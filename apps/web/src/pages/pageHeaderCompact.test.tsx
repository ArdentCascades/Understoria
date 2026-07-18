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
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Compact page headers on landscape phones (landscape-short). jsdom
// computes no layout, so these are class/CSS contracts:
//   1. index.css compacts `.page-title` and folds `.page-subtitle`
//      under a media query byte-identical to the landscape-short
//      variant in tailwind.config.js — if the two queries ever drift,
//      the title would shrink at a different height than the rail
//      moves, and the drift test below goes red.
//   2. A representative page (My work) renders its subtitle <p> with
//      the fold class while keeping its portrait classes untouched.

vi.mock("@/state/AppContext", () => {
  return {
    useApp: () => mockState,
  };
});

import "@/i18n";
import MyWorkPage from "./MyWork";
import type { Member } from "@/types";

// The exact query the landscape-short variant registers in
// tailwind.config.js. KEEP byte-identical to that definition.
const LANDSCAPE_SHORT_QUERY =
  "@media (orientation: landscape) and (max-height: 500px)";

const indexCss = readFileSync(join(__dirname, "..", "index.css"), "utf8");
const tailwindConfig = readFileSync(
  join(__dirname, "..", "..", "tailwind.config.js"),
  "utf8",
);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("landscape-short page-header compaction (CSS contract)", () => {
  it("tailwind.config.js still defines the landscape-short variant with the shared query", () => {
    expect(tailwindConfig).toContain(LANDSCAPE_SHORT_QUERY);
  });

  it("compacts .page-title under the exact landscape-short query", () => {
    // A .page-title rule with a smaller font-size inside the
    // landscape-short media block (index.css uses a plain nested
    // block, not @apply, so the source is the contract).
    const compactTitle = new RegExp(
      escapeRegExp(LANDSCAPE_SHORT_QUERY) +
        String.raw`\s*\{\s*\.page-title\s*\{[^}]*font-size:\s*1\.5rem`,
    );
    expect(indexCss).toMatch(compactTitle);
  });

  it("folds .page-subtitle away under the exact landscape-short query", () => {
    const foldSubtitle = new RegExp(
      escapeRegExp(LANDSCAPE_SHORT_QUERY) +
        String.raw`\s*\{\s*\.page-subtitle\s*\{\s*display:\s*none`,
    );
    expect(indexCss).toMatch(foldSubtitle);
  });

  it("does not change .page-title's portrait declaration", () => {
    // The base rule keeps the display-size serif anchor.
    expect(indexCss).toMatch(
      /\.page-title\s*\{\s*@apply font-serif text-display text-canopy-900 dark:text-canopy-50;/,
    );
  });
});

// ─── Representative page render ─────────────────────────────────────

interface MockState {
  currentMember: Member | null;
  projects: never[];
  projectTasks: never[];
  exchanges: never[];
  posts: never[];
  events: never[];
  eventCancellations: never[];
  coorgInvitations: never[];
  coorgInvitationResponses: never[];
  coorgInvitationRevocations: never[];
  blockedKeys: Set<string>;
  members: Member[];
}

let mockState: MockState = blankState();

function blankState(): MockState {
  return {
    currentMember: null,
    projects: [],
    projectTasks: [],
    exchanges: [],
    posts: [],
    events: [],
    eventCancellations: [],
    coorgInvitations: [],
    coorgInvitationResponses: [],
    coorgInvitationRevocations: [],
    blockedKeys: new Set<string>(),
    members: [],
  };
}

function makeMember(publicKey: string): Member {
  return {
    publicKey,
    displayName: "Tester",
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 0,
    vouchedBy: [],
    createdAt: 0,
    nodeId: "node-1",
    locationZone: "",
  } satisfies Member;
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = blankState();
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
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

describe("MyWorkPage header (representative fold contract)", () => {
  it("renders the subtitle with the fold class and portrait classes untouched", () => {
    mockState.currentMember = makeMember("me-key");
    render(<MyWorkPage />);

    const title = container.querySelector("h1.page-title");
    expect(title).not.toBeNull();

    const subtitle = container.querySelector("header p.page-subtitle");
    expect(subtitle).not.toBeNull();
    // Portrait styling is pixel-identical to before: the pre-existing
    // utility classes must survive alongside the new fold class.
    expect(subtitle!.classList.contains("text-sm")).toBe(true);
    expect(subtitle!.classList.contains("text-moss-600")).toBe(true);
    expect(subtitle!.classList.contains("dark:text-moss-300")).toBe(true);
  });

  it("reclaims header spacing in landscape-short", () => {
    mockState.currentMember = makeMember("me-key");
    render(<MyWorkPage />);

    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    expect(header!.className).toContain("mb-4");
    expect(header!.className).toContain("landscape-short:mb-2");
  });
});
