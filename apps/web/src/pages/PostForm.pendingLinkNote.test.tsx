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
// Poster-side half of the pending-author link gate: a still-pending
// member who drafts a link is told — calmly, without blocking the
// post — that readers will see the address but can't tap it until
// the community vouches for them. Trusted members and link-free
// drafts never see the notice.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockApp }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("@/db/actions", () => ({
  createPost: vi.fn(async () => ({}) as unknown),
  cancelPost: vi.fn(async () => undefined),
}));
// Drafts touch Dexie; stub the seam — this suite is about rendering.
vi.mock("@/db/drafts", () => ({
  clearDraft: vi.fn(async () => undefined),
  loadDraft: vi.fn(async () => null),
}));
vi.mock("@/lib/useDraftAutosave", () => ({
  useDraftAutosave: () => undefined,
}));

import "@/i18n";
import PostFormPage from "./PostForm";
import type { Member, Post } from "@/types";
import type { SignedVouch } from "@/lib/vouch";

const FOUNDER = "founder-key";
const ME = "me-key";

let mockApp: {
  currentMember: Pick<Member, "publicKey" | "locationZone"> | null;
  posts: Post[];
  nodeId: string;
  projects: unknown[];
  projectTasks: unknown[];
  vouches: SignedVouch[];
  invites: { status: "redeemed"; inviterKey: string; redeemedBy: string }[];
  founderRoots: ReadonlySet<string>;
};

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  // Founder capture present; ME has no trust edges → pending_trust.
  mockApp = {
    currentMember: { publicKey: ME, locationZone: "" },
    posts: [],
    nodeId: "node-1",
    projects: [],
    projectTasks: [],
    vouches: [],
    invites: [],
    founderRoots: new Set([FOUNDER]),
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

async function render() {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/post/new"]}>
        <PostFormPage />
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
}

function typeDescription(value: string) {
  const ta = container.querySelector("textarea") as HTMLTextAreaElement;
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(ta, value);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function note(): Element | null {
  return (
    Array.from(container.querySelectorAll('[role="note"]')).find((el) =>
      el.textContent?.includes("won't be tappable"),
    ) ?? null
  );
}

describe("PostForm — pending-trust link composer notice", () => {
  it("pending member typing a URL sees the calm notice", async () => {
    await render();
    expect(note()).toBeNull();
    typeDescription("come look at https://example.com/garden");
    const el = note();
    expect(el).not.toBeNull();
    expect(el!.textContent).toContain("This lifts automatically");
  });

  it("trusted member typing a URL sees no notice", async () => {
    // ME invited by the founder plus a second trusted member: founder
    // invited HELPER, then both invited ME → 2 distinct trusted vouchers.
    mockApp.invites = [
      { status: "redeemed", inviterKey: FOUNDER, redeemedBy: "helper-key" },
      { status: "redeemed", inviterKey: FOUNDER, redeemedBy: ME },
      { status: "redeemed", inviterKey: "helper-key", redeemedBy: ME },
    ];
    // The rooted rule needs 2 trusted vouchers for helper-key too; give
    // it a second founder so the chain actually computes trusted.
    mockApp.founderRoots = new Set([FOUNDER, "founder-two"]);
    mockApp.invites.push({
      status: "redeemed",
      inviterKey: "founder-two",
      redeemedBy: "helper-key",
    });
    await render();
    typeDescription("come look at https://example.com/garden");
    expect(note()).toBeNull();
  });

  it("pending member with no link in the draft sees no notice", async () => {
    await render();
    typeDescription("plain words, nothing to tap");
    expect(note()).toBeNull();
  });
});
