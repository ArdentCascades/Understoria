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
//
// Mobile "Filters" disclosure on the Board (screen-real-estate
// polish). Below sm the filter rail collapses behind a full-width
// trigger; jsdom has no viewport, so these tests assert the
// class/state mechanics: default collapsed (`hidden sm:block` on the
// rail wrapper + aria-expanded=false), expansion on click, and the
// "Filters · N active" label variant whenever a filter narrows the
// list — so a member never wonders why a collapsed rail is
// shortening it.
//
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));
vi.mock("@/components/AttentionSection", () => ({
  AttentionSection: () => <div data-testid="attention-section" />,
}));
vi.mock("@/components/BoardNudges", () => ({
  BoardNudges: () => null,
}));
vi.mock("@/components/ContextualHint", () => ({
  ContextualHint: () => null,
}));

import "@/i18n";
import BoardPage from "./Board";
import type { Member, Post, SignedVouch } from "@/types";
import type { InviteRow } from "@/db/database";

interface MockState {
  posts: Post[];
  members: Member[];
  currentMember: Member | null;
  projects: unknown[];
  projectTasks: unknown[];
  vouches: SignedVouch[];
  invites: InviteRow[];
  nodeId: string;
  communityNodeIds: ReadonlySet<string>;
}

let mockState: MockState;

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
  };
}

function makePost(over: Partial<Post> & { id: string }): Post {
  const base: Post = {
    id: over.id,
    type: "NEED",
    category: "food",
    title: `Post ${over.id}`,
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "me-key",
    claimedBy: null,
    status: "open",
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId: "node-1",
    signature: "",
  };
  return { ...base, ...over };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  const me = makeMember("me-key");
  mockState = {
    posts: [makePost({ id: "n1", type: "NEED", title: "Need one" })],
    members: [me],
    currentMember: me,
    projects: [],
    projectTasks: [],
    vouches: [],
    invites: [],
    nodeId: "node-1",
    communityNodeIds: new Set(["node-1"]),
  };
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(node: ReactNode, initialEntry = "/?tab=needs") {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>{node}</MemoryRouter>,
    );
  });
}

function trigger(): HTMLButtonElement {
  const btn = container.querySelector<HTMLButtonElement>(
    'button[aria-controls="board-post-filters"]',
  );
  if (!btn) throw new Error("Filters disclosure trigger not found");
  return btn;
}

function railWrapper(): HTMLElement {
  const el = container.querySelector<HTMLElement>("#board-post-filters");
  if (!el) throw new Error("Filter rail wrapper not found");
  return el;
}

/** Set a controlled <select> the way a user would — via the native
 *  value setter (bypassing React's value-tracking dedupe) plus a
 *  bubbling change event. */
function chooseOption(select: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(select, value);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

describe("Board mobile Filters disclosure", () => {
  it("defaults collapsed at EVERY width: trigger says 'Filters', rail hidden", () => {
    render(<BoardPage />);
    const btn = trigger();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.textContent).toContain("Filters");
    expect(btn.textContent).not.toContain("active");
    // Board-calm pass: ONE disclosure everywhere — collapsed means
    // hidden at all widths (no sm:block escape), and the trigger
    // renders at all widths (no sm:hidden), compacting to a pill
    // from sm up.
    expect(railWrapper().className).toContain("hidden");
    expect(railWrapper().className).not.toContain("sm:block");
    expect(btn.className).not.toContain("sm:hidden");
    // Compact pill at every width — the full-width mobile card is
    // retired so the Being-built/Tended scope shares its line.
    expect(btn.className).toContain("rounded-full");
    expect(btn.className).not.toContain("w-full");
  });

  it("active filters surface as removable chips while the rail is collapsed", () => {
    render(<BoardPage />);
    // Open, apply a category, close — the chip keeps the state
    // visible and removes it in one tap.
    act(() => {
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const select = container.querySelectorAll<HTMLSelectElement>(
      "#category-filter",
    )[0]!;
    chooseOption(select, "food");
    act(() => {
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(railWrapper().className).toContain("hidden");
    const chip = container.querySelector<HTMLButtonElement>(
      'button[aria-label^="Remove filter"]',
    );
    expect(chip).not.toBeNull();
    expect(chip!.textContent).toContain("Food");
    act(() => {
      chip!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(
      container.querySelector('button[aria-label^="Remove filter"]'),
    ).toBeNull();
    expect(trigger().textContent).not.toContain("active");
  });

  it("opens as a card panel and 'Done' closes it, returning focus to the trigger", () => {
    render(<BoardPage />);
    act(() => {
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // The open drawer is a contained card panel (board-calm drawer
    // pass), not loose page rows.
    expect(railWrapper().className).toContain("card");
    const done = Array.from(
      railWrapper().querySelectorAll("button"),
    ).find((b) => (b.textContent ?? "").trim() === "Done")!;
    expect(done).toBeTruthy();
    act(() => {
      done.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // Closed, and focus returned to the trigger (not dropped to body).
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(railWrapper().className).toContain("hidden");
    expect(document.activeElement).toBe(trigger());
  });

  it("expands on tap and collapses again on a second tap", () => {
    render(<BoardPage />);
    act(() => {
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(railWrapper().className).not.toContain("hidden");

    act(() => {
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(railWrapper().className).toContain("hidden");
  });

  it("shows the active-count variant when a filter narrows the list", () => {
    render(<BoardPage />);
    // The mobile rail copy is the first #category-filter in the tree.
    const select = container.querySelectorAll<HTMLSelectElement>(
      "#category-filter",
    )[0]!;
    chooseOption(select, "food");
    expect(trigger().textContent).toContain("Filters · 1 active");

    const urgency = container.querySelectorAll<HTMLSelectElement>(
      "#urgency-filter",
    )[0]!;
    chooseOption(urgency, "high");
    expect(trigger().textContent).toContain("Filters · 2 active");

    // Clearing goes back to the quiet label.
    chooseOption(select, "");
    chooseOption(urgency, "");
    expect(trigger().textContent).not.toContain("active");
  });

  it("PROJECTS tab has its own disclosure wired to the project rail", () => {
    render(<BoardPage />, "/?tab=projects");
    const btn = container.querySelector<HTMLButtonElement>(
      'button[aria-controls="board-project-filters"]',
    );
    expect(btn).not.toBeNull();
    expect(btn!.getAttribute("aria-expanded")).toBe("false");
    expect(
      container.querySelector("#board-project-filters")?.className,
    ).toContain("hidden");
  });
});
