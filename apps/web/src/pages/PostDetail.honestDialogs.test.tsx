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
 * Honest-dialog assertions for the cancel-post and flag-for-review
 * flows on `/post/:id` (usability round: a member cancelling a need
 * because her appointment moved, and a member afraid a flag was
 * one-way).
 *
 * Locks in:
 *  1. The cancel dialog tells the truth about where the post goes —
 *     off the board immediately, record kept — instead of the old
 *     "stay visible" promise the board then contradicted.
 *  2. The confirm pair is unambiguous: "Keep my post" / "Cancel this
 *     post", never a bare "Cancel" next to "Cancel post".
 *  3. The fresh-post sentence lives with the repost affordance hint,
 *     not inside the cancel dialog.
 *  4. The (why?) explainer answers in plain language — no
 *     cryptography vocabulary.
 *  5. The flag dialog answers "can I take this back?" — a flag can be
 *     closed as withdrawn on the Proposals page.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    toast: null,
  }),
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
const posterKey = "poster-key";
const claimerKey = "claimer-key";

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

function post(overrides: Partial<Post> = {}): Post {
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
    createdAt: Date.now(),
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId,
    signature: "",
    ...overrides,
  };
}

interface MockState {
  posts: Post[];
  members: Member[];
  currentMember: Member | null;
  nodeId: string;
  communityNodeIds?: string[];
  nodeConfig: { autoConfirmHours: number };
  proposals: unknown[];
}

let mockState: MockState;

function freshState(): MockState {
  return {
    posts: [post()],
    members: [member(posterKey, "Pat Poster"), member(claimerKey, "Cleo")],
    currentMember: member(posterKey, "Pat Poster"),
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

function render(initialPath = "/post/post-1") {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/post/:id" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

function clickButton(label: string) {
  const btn = Array.from(container.querySelectorAll("button")).find(
    (b) => (b.textContent ?? "").trim() === label,
  );
  if (!btn) throw new Error(`No button labelled "${label}"`);
  act(() => {
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

/** The ConfirmDialog portals to document.body — query the dialog card
 *  there, not inside the page container. */
function dialog(): HTMLElement {
  const el = document.body.querySelector('[role="dialog"]');
  if (!el) throw new Error("No open dialog");
  return el as HTMLElement;
}

describe("PostDetailPage — cancel-post dialog tells the truth", () => {
  it("states where the post really goes: off the board, record kept", () => {
    render();
    clickButton("Cancel post");
    const text = dialog().textContent ?? "";
    expect(text).toContain("Cancel this post?");
    expect(text).toContain("Your post leaves the board right away");
    expect(text).toContain("It isn't deleted");
    // The old promise the board contradicted is gone.
    expect(text).not.toContain("stay visible");
    // The fresh-post sentence belongs to the repost affordance, not
    // to the cancel dialog.
    expect(text).not.toContain("fresh post");
  });

  it("uses an unambiguous button pair: 'Keep my post' / 'Cancel this post'", () => {
    render();
    clickButton("Cancel post");
    const labels = Array.from(dialog().querySelectorAll("button")).map((b) =>
      (b.textContent ?? "").trim(),
    );
    expect(labels).toContain("Keep my post");
    expect(labels).toContain("Cancel this post");
    // Never a bare "Cancel" a reader has to disambiguate from
    // "Cancel post".
    expect(labels).not.toContain("Cancel");
  });

  it("'Keep my post' closes the dialog without cancelling", async () => {
    const { cancelPost } = await import("@/db/actions");
    render();
    clickButton("Cancel post");
    const keep = Array.from(dialog().querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Keep my post",
    );
    expect(keep).toBeDefined();
    act(() => {
      keep!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    expect(vi.mocked(cancelPost)).not.toHaveBeenCalled();
  });

  it("the repost hint (outside the dialog) carries the fresh-post sentence and points at the post menu", () => {
    render();
    expect(container.textContent).toContain(
      '"Repost with changes" in the post menu cancels this one and creates a fresh post.',
    );
  });

  it("the (why?) explainer answers in plain language — no cryptography vocabulary", () => {
    render();
    clickButton("(why?)");
    const note = container.querySelector('[role="note"]');
    expect(note).not.toBeNull();
    const text = note!.textContent ?? "";
    expect(text).toContain("can't be quietly edited or erased");
    expect(text.toLowerCase()).not.toContain("cryptograph");
    expect(text.toLowerCase()).not.toContain("signature");
    expect(text.toLowerCase()).not.toContain("node");
  });
});

describe("PostDetailPage — flag dialog answers 'can I take this back?'", () => {
  it("says plainly that a flag can be closed as withdrawn", () => {
    mockState.posts = [post({ status: "claimed", claimedBy: claimerKey })];
    render();
    clickButton("Something's wrong — flag it");
    const text = dialog().textContent ?? "";
    expect(text).toContain("Flag this exchange for community review?");
    // The honest answer the code supports: closeProposal(..., "withdrawn")
    // restores the post's pre-dispute status — any member can record it.
    expect(text).toContain("A flag isn't one-way");
    expect(text).toContain("close it as withdrawn on the Proposals page");
    expect(text).toContain("the exchange goes back to where it was");
  });
});
