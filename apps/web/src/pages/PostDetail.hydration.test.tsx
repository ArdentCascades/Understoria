/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Regression: cold-load / deep-link hydration must not crash.
 *
 * On a hard refresh of `/post/:id`, AppContext's live queries start
 * empty, so `post` is null on the first render (not-found branch) and
 * non-null a tick later. A hook placed after the `if (!post) return`
 * early return changed the hook count between those two renders and
 * threw "rendered more hooks than during the previous render", which
 * unmounts the whole app. The other page tests never caught this
 * because they mock `useApp` with synchronously-populated state.
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
import type { Member, Post } from "@/types";

const nodeId = "node_test";

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
    category: "other",
    title: "Help move a couch",
    description: "",
    estimatedHours: 2,
    urgency: "low",
    postedBy: "poster-key",
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
let container: HTMLElement;
let root: Root;

beforeEach(() => {
  mockState = {
    posts: [], // <-- empty first: reproduces the not-found first render
    members: [member("poster-key", "Pat Poster")],
    currentMember: member("viewer-key", "Vic Viewer"),
    nodeId,
    nodeConfig: { autoConfirmHours: 168 },
    proposals: [],
  };
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("PostDetail hydration", () => {
  it("does not crash when the post hydrates after a not-found first render", () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={["/post/post-1"]}>
          <Routes>
            <Route path="/post/:id" element={<PostDetailPage />} />
          </Routes>
        </MemoryRouter>,
      );
    });
    // First render took the not-found branch.
    expect(container.textContent).toContain("");

    // The live query resolves — the post appears and the component
    // re-renders. Before the fix this threw and blanked the tree.
    expect(() => {
      act(() => {
        mockState.posts = [post()];
        root.render(
          <MemoryRouter initialEntries={["/post/post-1"]}>
            <Routes>
              <Route path="/post/:id" element={<PostDetailPage />} />
            </Routes>
          </MemoryRouter>,
        );
      });
    }).not.toThrow();

    expect(container.textContent).toContain("Help move a couch");
  });
});
