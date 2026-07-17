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
 * Identity-key chrome on the post detail page (`/post/:id`).
 *
 * The short key next to the poster/helper name is hidden behind a
 * tappable ⓘ affordance by default — pilot members read the
 * ubiquitous `(a1b2…c3d4)` as a rendering glitch. Tapping reveals
 * the key plus a one-sentence explainer. When two members share a
 * display name (case-insensitive, trimmed), the key comes back
 * inline automatically — the anti-impersonation disambiguator
 * activates exactly when it's needed. See IdentityKey.tsx and
 * lib/nameCollisions.ts.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), toast: null }),
}));
vi.mock("@/db/actions", () => ({
  cancelPost: vi.fn(),
  claimPost: vi.fn(),
  confirmExchange: vi.fn(),
  disputeExchange: vi.fn(),
  unclaimPost: vi.fn(),
}));

import "@/i18n";
import PostDetailPage from "./PostDetail";
import { shortKey } from "@/lib/format";
import type { Member, Post } from "@/types";

const nodeId = "node_test";
const posterKey = "poster-key";
const viewerKey = "viewer-key";
const posterShort = shortKey(posterKey);

function member(publicKey: string, displayName: string): Member {
  return {
    publicKey,
    displayName,
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId,
    locationZone: "",
  };
}

function post(): Post {
  return {
    id: "post-1",
    type: "NEED",
    category: "food",
    title: "Help carrying groceries",
    description: "",
    estimatedHours: 2,
    urgency: "low",
    postedBy: posterKey,
    claimedBy: null,
    status: "open",
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId,
    signature: "",
  };
}

interface MockState {
  posts: Post[];
  members: Member[];
  currentMember: Member | null;
  nodeId: string;
  nodeConfig: { autoConfirmHours: number };
  proposals: unknown[];
}

let mockState: MockState;

function freshState(): MockState {
  return {
    posts: [post()],
    members: [member(posterKey, "Pat Poster"), member(viewerKey, "Vic Viewer")],
    currentMember: member(viewerKey, "Vic Viewer"),
    nodeId,
    nodeConfig: { autoConfirmHours: 168 },
    proposals: [],
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = freshState();
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
      <MemoryRouter initialEntries={["/post/post-1"]}>
        <Routes>
          <Route path="/post/:id" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

function revealTrigger(): HTMLButtonElement {
  const btn = container.querySelector<HTMLButtonElement>(
    'button[aria-label="Show identity code"]',
  );
  if (!btn) throw new Error("identity reveal trigger not found");
  return btn;
}

function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("PostDetailPage — identity key chrome", () => {
  it("hides the short key by default behind a labelled toggle", () => {
    render();
    expect(container.textContent).toContain("Pat Poster");
    expect(container.textContent).not.toContain(posterShort);
    const trigger = revealTrigger();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("tapping the toggle reveals the key and the explainer sentence", () => {
    render();
    const trigger = revealTrigger();
    click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.textContent).toContain(posterShort);
    expect(container.textContent).toContain(
      "This code is Pat Poster's unique identity",
    );
    // Tapping again re-hides.
    click(trigger);
    expect(container.textContent).not.toContain(posterShort);
  });

  it("uses the second-person explainer when the party is the viewer", () => {
    mockState.currentMember = member(posterKey, "Pat Poster");
    render();
    // The poster row renders as "You" with the key still hidden.
    expect(container.textContent).not.toContain(posterShort);
    click(revealTrigger());
    expect(container.textContent).toContain(
      "This code is your unique identity",
    );
  });

  it("auto-reveals the key inline when two members share a display name", () => {
    // Case-insensitive + trimmed: "  pat poster " collides with
    // "Pat Poster".
    mockState.members.push(member("doppel-key", "  pat poster "));
    render();
    expect(container.textContent).toContain(`(${posterShort})`);
    // The inline key stays tappable for the explainer.
    const keyButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => (b.textContent ?? "").includes(posterShort));
    expect(keyButton).toBeDefined();
    click(keyButton!);
    expect(container.textContent).toContain(
      "This code is Pat Poster's unique identity",
    );
  });

  it("keeps unique-name pages free of inline keys (no collision, no tap)", () => {
    render();
    // No `(xxxx…yyyy)` chrome anywhere before a tap.
    expect(container.textContent).not.toMatch(/\([^)]*…[^)]*\)/);
  });
});
