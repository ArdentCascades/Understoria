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
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the attention pipeline so we can drop a single `task_check_in`
// item in and exercise the row's ack handler in isolation. The
// underlying state math is covered by taskCheckInState.test.ts; here
// we're only proving that on a successful ack we (a) call the data
// layer and (b) close the loop with a toast that names the
// configured private window.
const {
  ackMock,
  unclaimMock,
  showToastMock,
  computeAttentionItemsMock,
} = vi.hoisted(() => ({
  ackMock: vi.fn(async () => undefined),
  unclaimMock: vi.fn(async () => undefined),
  showToastMock: vi.fn(),
  computeAttentionItemsMock: vi.fn(),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("@/db/projects", () => ({
  acknowledgeTaskCheckIn: ackMock,
  unclaimProjectTask: unclaimMock,
  logActivity: vi.fn(),
  canClaimTask: () => true,
}));
vi.mock("@/db/coorgInvitations", () => ({
  respondToCoOrganizerInvitation: vi.fn(),
}));
vi.mock("@/db/secrets", () => ({ getSecretKey: vi.fn() }));
// Spread the real module so KIND_PRIORITY (used by the mobile
// collapse default) survives — only the item pipeline is stubbed.
vi.mock("@/lib/attention", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/attention")>()),
  computeAttentionItems: computeAttentionItemsMock,
}));

import "@/i18n";
import { AttentionSection } from "./AttentionSection";

interface MockState {
  currentMember: { publicKey: string; displayName: string } | null;
  posts: unknown[];
  projects: unknown[];
  projectTasks: unknown[];
  members: unknown[];
  vouches: unknown[];
  nodeConfig: { taskCheckInDays: number };
  nodeId: string;
  lockState: string;
  coorgInvitations: unknown[];
  coorgInvitationResponses: unknown[];
  coorgInvitationRevocations: unknown[];
  events: unknown[];
  eventRsvps: unknown[];
  eventCancellations: unknown[];
  blockedKeys: Set<string>;
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const TASK_ID = "task-xyz";

function freshState(checkInDays = 7): MockState {
  return {
    currentMember: { publicKey: "claimer-pub", displayName: "Claimer" },
    posts: [],
    projects: [],
    projectTasks: [],
    members: [],
    vouches: [],
    nodeConfig: { taskCheckInDays: checkInDays },
    nodeId: "node_test",
    lockState: "unprotected",
    coorgInvitations: [],
    coorgInvitationResponses: [],
    coorgInvitationRevocations: [],
    events: [],
    eventRsvps: [],
    eventCancellations: [],
    blockedKeys: new Set<string>(),
  };
}

function attentionRow() {
  return [
    {
      kind: "task_check_in" as const,
      projectId: "proj-1",
      taskId: TASK_ID,
      projectTitle: "Community Fridge",
      taskTitle: "Install hinges",
      claimedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      createdAt: 0,
    },
  ];
}

beforeEach(() => {
  mockState = freshState();
  ackMock.mockClear();
  unclaimMock.mockClear();
  showToastMock.mockClear();
  computeAttentionItemsMock.mockReset();
  computeAttentionItemsMock.mockReturnValue(attentionRow());
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

function clickButton(label: string) {
  const buttons = Array.from(container.querySelectorAll("button"));
  const btn = buttons.find((b) => (b.textContent ?? "").trim() === label);
  if (!btn) throw new Error(`Button not found: ${label}`);
  act(() => {
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("AttentionSection — task check-in ack", () => {
  it("calls the data layer and shows a toast naming the configured window", async () => {
    render(<AttentionSection />);
    clickButton("Still on it");
    await flush();
    expect(ackMock).toHaveBeenCalledTimes(1);
    expect(ackMock.mock.calls[0]).toEqual([TASK_ID, "claimer-pub"]);
    expect(showToastMock).toHaveBeenCalledTimes(1);
    const msg = String(showToastMock.mock.calls[0]?.[0] ?? "");
    // Truthful number: ack stamps checkInAcknowledgedAt = now and the
    // private prompt fires again after `taskCheckInDays` from now.
    expect(msg).toContain("7 days");
  });

  it("uses the configured taskCheckInDays, not a hardcoded number", async () => {
    mockState = freshState(3);
    render(<AttentionSection />);
    clickButton("Still on it");
    await flush();
    const msg = String(showToastMock.mock.calls[0]?.[0] ?? "");
    expect(msg).toContain("3 days");
  });

  it("does not toast on failure", async () => {
    ackMock.mockRejectedValueOnce(new Error("nope"));
    render(<AttentionSection />);
    clickButton("Still on it");
    await flush();
    // Only the error toast — no success toast.
    expect(showToastMock).toHaveBeenCalledTimes(1);
    expect(showToastMock.mock.calls[0]?.[1]).toBe("error");
  });

  it("deep-links the task line to the task's own page", () => {
    render(<AttentionSection />);
    expect(
      container.querySelector(`a[href="/project/proj-1/task/${TASK_ID}"]`),
    ).not.toBeNull();
  });
});
