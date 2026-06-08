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

// Mock the app + toast contexts and the data-layer functions the
// co-organizer attention item calls. The component logic (which kind
// renders, which handler fires) is what we exercise here — the
// data-layer functions are tested separately in PR A.
const { respondMock, logActivityMock, getSecretKeyMock, showToastMock } =
  vi.hoisted(() => ({
    respondMock: vi.fn(async () => ({})),
    logActivityMock: vi.fn(async () => undefined),
    getSecretKeyMock: vi.fn(async () => "secret"),
    showToastMock: vi.fn(),
  }));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock, dismissToast: vi.fn(), toast: null }),
}));
vi.mock("@/db/coorgInvitations", () => ({
  respondToCoOrganizerInvitation: respondMock,
}));
vi.mock("@/db/secrets", () => ({ getSecretKey: getSecretKeyMock }));
vi.mock("@/db/projects", () => ({
  acknowledgeTaskCheckIn: vi.fn(),
  unclaimProjectTask: vi.fn(),
  logActivity: logActivityMock,
  canClaimTask: () => true,
}));

import "@/i18n";
import { AttentionSection } from "./AttentionSection";
import type {
  CoOrganizerInvitation,
  Member,
  Project,
} from "@/types";

const nodeId = "node_test";
const inviteeKey = "invitee-key";
const inviterKey = "inviter-key";

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

function project(): Project {
  return {
    id: "proj-1",
    title: "Community Fridge",
    description: "",
    category: "infrastructure",
    organizerKey: inviterKey,
    coOrganizerKeys: [],
    status: "active",
    targetHours: 10,
    contributedHours: 0,
    deadline: null,
    createdAt: 0,
    completedAt: null,
    pauseNote: null,
    locationZone: "",
    tags: [],
    nodeId,
    templateId: null,
  };
}

function invitation(): CoOrganizerInvitation {
  return {
    id: "inv-1",
    projectId: "proj-1",
    inviterKey,
    inviteeKey,
    createdAt: 1000,
    expiresAt: Date.now() + 1_000_000,
    nodeId,
    signature: "sig",
  };
}

interface MockState {
  currentMember: Member | null;
  posts: unknown[];
  projects: Project[];
  projectTasks: unknown[];
  members: Member[];
  vouches: unknown[];
  nodeConfig: undefined;
  nodeId: string;
  lockState: "unprotected" | "locked" | "unlocked";
  coorgInvitations: CoOrganizerInvitation[];
  coorgInvitationResponses: unknown[];
  coorgInvitationRevocations: unknown[];
}

let mockState: MockState;

function freshState(): MockState {
  return {
    currentMember: member(inviteeKey, "Invitee"),
    posts: [],
    projects: [project()],
    projectTasks: [],
    members: [member(inviteeKey, "Invitee"), member(inviterKey, "Ada Inviter")],
    vouches: [],
    nodeConfig: undefined,
    nodeId,
    lockState: "unprotected",
    coorgInvitations: [invitation()],
    coorgInvitationResponses: [],
    coorgInvitationRevocations: [],
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = freshState();
  respondMock.mockClear();
  logActivityMock.mockClear();
  getSecretKeyMock.mockClear();
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

describe("AttentionSection — co-organizer invitation", () => {
  it("renders the invitation line for the invitee", () => {
    render(<AttentionSection />);
    const text = container.textContent ?? "";
    expect(text).toContain("Ada Inviter");
    expect(text).toContain("Community Fridge");
  });

  it("accept opens the comparison card then signs with decision accept", async () => {
    render(<AttentionSection />);
    // Expand the comparison card.
    clickButton("Accept");
    expect(container.textContent ?? "").toContain("What this means");
    // Sign.
    clickButton("Accept and sign");
    await flush();
    expect(respondMock).toHaveBeenCalledTimes(1);
    expect(respondMock.mock.calls[0][0]).toMatchObject({
      invitationId: "inv-1",
      decision: "accept",
      nodeId,
    });
    expect(logActivityMock).toHaveBeenCalledWith(
      "proj-1",
      "coorganizer_accepted",
      inviteeKey,
      expect.any(Object),
      nodeId,
    );
  });

  it("decline confirms then signs with decision decline", async () => {
    render(<AttentionSection />);
    clickButton("Decline");
    // ConfirmDialog confirm button reuses the Decline label.
    const dialogButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) => (b.textContent ?? "").trim() === "Decline",
    );
    // Two "Decline" buttons now: the row trigger and the dialog confirm.
    expect(dialogButtons.length).toBeGreaterThanOrEqual(2);
    act(() => {
      dialogButtons[dialogButtons.length - 1].dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    await flush();
    expect(respondMock).toHaveBeenCalledTimes(1);
    expect(respondMock.mock.calls[0][0]).toMatchObject({
      invitationId: "inv-1",
      decision: "decline",
    });
  });

  it("blocks responding when the session is locked", async () => {
    mockState.lockState = "locked";
    render(<AttentionSection />);
    clickButton("Accept");
    clickButton("Accept and sign");
    await flush();
    expect(respondMock).not.toHaveBeenCalled();
    expect(showToastMock).toHaveBeenCalled();
  });
});
