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
// PostCard renders only inside the Board's NEED / OFFER tabs, where
// the active tab already declares the type — so the card's meta row
// carries NO redundant "needs help" / "offers" type label (screen-
// real-estate polish). If PostCard ever gains a mixed-type context,
// reintroduce the label behind a `showTypeLabel` prop and flip this
// suite accordingly.
//
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@/i18n";
import { PostCard } from "./PostCard";
import type { Post } from "@/types";

function makePost(over: Partial<Post> = {}): Post {
  return {
    id: "p1",
    type: "NEED",
    category: "food",
    title: "Groceries run",
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "poster-key",
    claimedBy: null,
    status: "open",
    createdAt: Date.now(),
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId: "node-1",
    signature: "",
    ...over,
  };
}

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

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

describe("PostCard type label", () => {
  it("renders no 'needs help' label on NEED cards", () => {
    render(
      <PostCard
        post={makePost({ type: "NEED" })}
        posterName="Ana"
        isCurrentMember={false}
      />,
    );
    expect(container.textContent).toContain("Groceries run");
    expect(container.textContent).not.toContain("needs help");
  });

  it("renders no 'offers' label on OFFER cards", () => {
    render(
      <PostCard
        post={makePost({ type: "OFFER", title: "Bike repairs" })}
        posterName="Ana"
        isCurrentMember={false}
      />,
    );
    expect(container.textContent).toContain("Bike repairs");
    expect(container.textContent).not.toContain("offers");
  });
});
