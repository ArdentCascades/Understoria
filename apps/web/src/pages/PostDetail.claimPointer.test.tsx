/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Claim success pointer. Claiming a post removes it from the board's
 * open lists immediately — the success toast must say where it went
 * ("In my care") so the member doesn't hunt for their commitment.
 * A failed claim must NOT show the pointer (the error toast with
 * Retry covers that path).
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { claimPostMock, showToastMock } = vi.hoisted(() => ({
  claimPostMock: vi.fn(async () => ({}) as unknown),
  showToastMock: vi.fn(),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("@/db/actions", () => ({
  cancelPost: vi.fn(),
  claimPost: claimPostMock,
  confirmExchange: vi.fn(),
  disputeExchange: vi.fn(),
  unclaimPost: vi.fn(),
}));

import "@/i18n";
import PostDetailPage from "./PostDetail";
import type { Member, Post } from "@/types";

const nodeId = "node_test";
const posterKey = "poster-key";
const viewerKey = "viewer-key";

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
    createdAt: 0,
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
  communityNodeIds: ReadonlySet<string>;
  nodeConfig: { autoConfirmHours: number };
  proposals: unknown[];
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = {
    posts: [post()],
    members: [member(posterKey, "Pat Poster"), member(viewerKey, "Vic Viewer")],
    currentMember: member(viewerKey, "Vic Viewer"),
    nodeId,
    communityNodeIds: new Set([nodeId]),
    nodeConfig: { autoConfirmHours: 168 },
    proposals: [],
  };
  claimPostMock.mockClear();
  claimPostMock.mockResolvedValue(post({ status: "claimed", claimedBy: viewerKey }));
  showToastMock.mockClear();
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

function buttonByText(scope: ParentNode, label: string): HTMLButtonElement {
  const btn = Array.from(scope.querySelectorAll("button")).find(
    (b) => (b.textContent ?? "").trim() === label,
  );
  expect(btn, `button "${label}"`).toBeDefined();
  return btn as HTMLButtonElement;
}

async function clickThroughClaim(claimLabel: string) {
  act(() => {
    buttonByText(container, claimLabel).dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
  });
  // The ConfirmDialog portals to the document root.
  const dialog = document.querySelector('[role="dialog"]');
  expect(dialog).not.toBeNull();
  await act(async () => {
    buttonByText(dialog!, "Yes, claim it").dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("PostDetailPage — claim success pointer", () => {
  it("claiming a NEED toasts where the post now lives (In my care)", async () => {
    render();
    await clickThroughClaim("Offer to help");
    expect(claimPostMock).toHaveBeenCalledTimes(1);
    expect(claimPostMock).toHaveBeenCalledWith(
      "post-1",
      viewerKey,
      nodeId,
      mockState.communityNodeIds,
    );
    expect(showToastMock).toHaveBeenCalledWith(
      "You'll find this under In my care.",
    );
  });

  it("claiming an OFFER shows the same pointer", async () => {
    mockState.posts = [post({ type: "OFFER" })];
    render();
    await clickThroughClaim("Claim this offer");
    expect(showToastMock).toHaveBeenCalledWith(
      "You'll find this under In my care.",
    );
  });

  it("a failed claim surfaces the error toast, not the pointer", async () => {
    claimPostMock.mockRejectedValue(new Error("nope"));
    render();
    await clickThroughClaim("Offer to help");
    const messages = showToastMock.mock.calls.map((c) => c[0] as string);
    expect(messages).not.toContain("You'll find this under In my care.");
    // The failure path still speaks — as an error toast.
    expect(showToastMock).toHaveBeenCalledTimes(1);
    expect(showToastMock.mock.calls[0][1]).toMatchObject({ tone: "error" });
  });
});
