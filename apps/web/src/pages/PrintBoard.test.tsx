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
// The printable board sheet (/print/board?tab=…&cat=…). Locks:
//   1. The sheet renders EXACTLY the Board's filter semantics from
//      its query params (shared predicate, lib/boardFilter.ts) —
//      including claimed-post hiding by default.
//   2. Every row's QR encodes that post's canonical /post/:id URL.
//   3. The "paper doesn't sync or purge" footer is present.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Post } from "@/types";

vi.mock("@/state/AppContext", () => ({
  useApp: () => ({ posts: mockPosts }),
}));
vi.mock("@/components/InviteQRCode", () => ({
  InviteQRCode: ({ value }: { value: string }) => (
    <div data-testid="qr" data-value={value} />
  ),
}));

import "@/i18n";
import PrintBoardPage from "./PrintBoard";

let mockPosts: Post[] = [];

function makePost(over: Partial<Post> & { id: string }): Post {
  const base: Post = {
    id: over.id,
    type: "OFFER",
    category: "food",
    title: `Post ${over.id}`,
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "someone",
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
  mockPosts = [];
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function renderAt(search: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[`/print/board${search}`]}>
        <Routes>
          <Route path="/print/board" element={<PrintBoardPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

const qrValues = () =>
  [...container.querySelectorAll('[data-testid="qr"]')].map((el) =>
    el.getAttribute("data-value"),
  );

describe("PrintBoardPage", () => {
  it("prints exactly the filtered view, with a canonical post QR per row", () => {
    mockPosts = [
      makePost({ id: "keep", category: "food" }),
      makePost({ id: "other-cat", category: "transport" }),
      makePost({ id: "need", type: "NEED", category: "food" }),
      makePost({ id: "claimed", category: "food", claimedBy: "helper" }),
      makePost({ id: "cancelled", category: "food", status: "cancelled" }),
    ];
    renderAt("?tab=offers&cat=food");

    expect(container.textContent).toContain("Post keep");
    expect(container.textContent).not.toContain("Post other-cat");
    expect(container.textContent).not.toContain("Post need");
    expect(container.textContent).not.toContain("Post claimed");
    expect(container.textContent).not.toContain("Post cancelled");
    // One row QR + one tear-off tab (P6), both canonical.
    expect(qrValues()).toEqual([
      `${window.location.origin}/post/keep`,
      `${window.location.origin}/post/keep`,
    ]);
    expect(container.textContent).toContain("paper doesn't sync or purge");
  });

  it("claimed=1 adds claimed posts back in, matching the Board's toggle", () => {
    mockPosts = [
      makePost({ id: "open-post" }),
      makePost({ id: "claimed-post", claimedBy: "helper" }),
    ];
    renderAt("?tab=offers&claimed=1");
    // Two rows, then their two tear-off tabs.
    expect(qrValues()).toEqual([
      `${window.location.origin}/post/open-post`,
      `${window.location.origin}/post/claimed-post`,
      `${window.location.origin}/post/open-post`,
      `${window.location.origin}/post/claimed-post`,
    ]);
  });

  it("an empty slice says so honestly", () => {
    renderAt("?tab=needs");
    expect(container.textContent).toContain("Nothing matches this view");
    expect(qrValues()).toEqual([]);
  });
});
