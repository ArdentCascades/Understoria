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
// Mobile collapse of the attention rail (screen-real-estate polish).
// The rail renders once; below lg a summary/toggle row precedes it
// and the rail itself gains `hidden lg:block` while collapsed. The
// default state is derived from KIND_PRIORITY: EXPANDED when any
// tier-0 item is present (confirm_exchange / confirm_task — someone
// else's credit is blocked on your signature), COLLAPSED otherwise.
// jsdom has no viewport, so these tests assert the class/aria
// mechanics plus the DOM order (summary precedes rail — WCAG 2.4.3).
//
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { computeAttentionItemsMock } = vi.hoisted(() => ({
  computeAttentionItemsMock: vi.fn(),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("@/db/projects", () => ({
  acknowledgeTaskCheckIn: vi.fn(),
  unclaimProjectTask: vi.fn(),
  logActivity: vi.fn(),
  canClaimTask: () => true,
}));
vi.mock("@/db/coorgInvitations", () => ({
  respondToCoOrganizerInvitation: vi.fn(),
}));
vi.mock("@/db/secrets", () => ({ getSecretKey: vi.fn() }));
// Spread the real module so KIND_PRIORITY (which drives the
// default-expanded rule under test) stays real — only the item
// pipeline is stubbed.
vi.mock("@/lib/attention", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/attention")>()),
  computeAttentionItems: computeAttentionItemsMock,
}));

import "@/i18n";
import { AttentionSection } from "./AttentionSection";
import { ATTENTION_EMOJI } from "@/lib/attentionMeta";

const mockState = {
  currentMember: { publicKey: "me-pub", displayName: "Me" },
  posts: [],
  projects: [],
  projectTasks: [],
  members: [],
  vouches: [],
  nodeConfig: { taskCheckInDays: 7 },
  nodeId: "node_test",
  lockState: "unprotected",
  coorgInvitations: [],
  coorgInvitationResponses: [],
  coorgInvitationRevocations: [],
  events: [],
  eventRsvps: [],
  eventCancellations: [],
  proposals: [],
  blockedKeys: new Set<string>(),
};

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function confirmExchangeItem() {
  return {
    kind: "confirm_exchange" as const,
    postId: "post-1",
    postTitle: "Fix the fence",
    counterpartyName: "Ana",
    createdAt: 0,
  };
}

function vouchItem() {
  return {
    kind: "vouch_received" as const,
    voucherName: "Rio",
    createdAt: 1,
  };
}

function eventTodayItem() {
  return {
    kind: "event_today" as const,
    eventId: "ev-1",
    title: "Repair café",
    location: "The shed",
    deepLink: "/calendar",
    createdAt: 2,
  };
}

beforeEach(() => {
  computeAttentionItemsMock.mockReset();
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

function summaryButton(): HTMLButtonElement {
  const btn = container.querySelector<HTMLButtonElement>(
    'button[aria-controls="attention-rail"]',
  );
  if (!btn) throw new Error("Attention summary button not found");
  return btn;
}

function railSection(): HTMLElement {
  const el = container.querySelector<HTMLElement>("#attention-rail");
  if (!el) throw new Error("Attention rail section not found");
  return el;
}

describe("AttentionSection mobile collapse", () => {
  it("renders nothing at all when there are no items (no empty summary row)", () => {
    computeAttentionItemsMock.mockReturnValue([]);
    render(<AttentionSection />);
    expect(container.innerHTML).toBe("");
  });

  it("defaults EXPANDED when a tier-0 confirm item is present", () => {
    computeAttentionItemsMock.mockReturnValue([
      confirmExchangeItem(),
      vouchItem(),
    ]);
    render(<AttentionSection />);
    expect(summaryButton().getAttribute("aria-expanded")).toBe("true");
    expect(railSection().className).not.toContain("hidden");
  });

  it("defaults COLLAPSED when only informational items are present, hiding on mobile but never at lg", () => {
    computeAttentionItemsMock.mockReturnValue([vouchItem(), eventTodayItem()]);
    render(<AttentionSection />);
    expect(summaryButton().getAttribute("aria-expanded")).toBe("false");
    // Mobile-only hiding: lg keeps the rail fully visible.
    expect(railSection().className).toContain("hidden");
    expect(railSection().className).toContain("lg:block");
    // And the summary trigger itself never appears on desktop.
    expect(summaryButton().className).toContain("lg:hidden");
  });

  it("summary row previews the item kinds via their emoji prefixes (deduped, no count badge)", () => {
    computeAttentionItemsMock.mockReturnValue([
      eventTodayItem(),
      confirmExchangeItem(),
      vouchItem(),
    ]);
    render(<AttentionSection />);
    const text = summaryButton().textContent ?? "";
    expect(text).toContain(ATTENTION_EMOJI.event_today);
    expect(text).toContain(ATTENTION_EMOJI.confirm_exchange);
    expect(text).toContain(ATTENTION_EMOJI.vouch_received);
    expect(text).toContain("Things need you");
    // No badge-count pill: the only digits allowed would come from a
    // count, and there is none.
    expect(text).not.toMatch(/\d/);
  });

  it("tap toggles the rail open and closed, overriding the derived default", () => {
    computeAttentionItemsMock.mockReturnValue([vouchItem()]);
    render(<AttentionSection />);
    expect(summaryButton().getAttribute("aria-expanded")).toBe("false");
    act(() => {
      summaryButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(summaryButton().getAttribute("aria-expanded")).toBe("true");
    expect(railSection().className).not.toContain("hidden");
    act(() => {
      summaryButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(summaryButton().getAttribute("aria-expanded")).toBe("false");
    expect(railSection().className).toContain("hidden");
  });

  it("summary row precedes the rail in DOM order (occupies the rail's slot)", () => {
    computeAttentionItemsMock.mockReturnValue([vouchItem()]);
    render(<AttentionSection />);
    const btn = summaryButton();
    const rail = railSection();
    expect(
      (btn.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING) !==
        0,
    ).toBe(true);
  });
});
