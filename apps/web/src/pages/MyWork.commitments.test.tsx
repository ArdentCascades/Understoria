/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The two commitment sections added to the combined My work page:
// shift signups (read live from Dexie, like the organizer's desk) and
// claimed NEED posts (from app context). The task/project halves are
// covered by MyWork.tasks.test.tsx / MyWork.projects.test.tsx.

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));

import "@/i18n";
import MyWorkPage from "./MyWork";
import { db } from "@/db/database";
import type { Event, Member, Post } from "@/types";

const ME = "me-key";
const HOUR = 3_600_000;

interface MockState {
  currentMember: Member | null;
  projects: never[];
  projectTasks: never[];
  exchanges: never[];
  posts: Post[];
  events: Event[];
  eventCancellations: never[];
  coorgInvitations: never[];
  coorgInvitationResponses: never[];
  coorgInvitationRevocations: never[];
  blockedKeys: Set<string>;
  members: Member[];
}

let mockState: MockState;

function makeMember(): Member {
  return {
    publicKey: ME,
    displayName: "Tester",
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 0,
    vouchedBy: [],
    createdAt: 0,
    nodeId: "node-1",
    locationZone: "",
  };
}

function makeEvent(id: string): Event {
  return {
    id,
    title: "Repair Café",
    description: "",
    category: "repair",
    startsAt: Date.now() + 24 * HOUR,
    endsAt: null,
    location: "the library",
    capacity: null,
    createdBy: "organizer-key",
    createdAt: Date.now() - HOUR,
    nodeId: "node-1",
    signature: "sig",
  } as Event;
}

function makePost(id: string, over: Partial<Post> = {}): Post {
  return {
    id,
    type: "NEED",
    category: "food",
    title: `Grocery run for ${id}`,
    description: "",
    estimatedHours: 1,
    urgency: "medium",
    postedBy: "author-key",
    claimedBy: ME,
    status: "claimed",
    createdAt: Date.now() - HOUR,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId: "node-1",
    ...over,
  } as Post;
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  mockState = {
    currentMember: makeMember(),
    projects: [],
    projectTasks: [],
    exchanges: [],
    posts: [],
    events: [],
    eventCancellations: [],
    coorgInvitations: [],
    coorgInvitationResponses: [],
    coorgInvitationRevocations: [],
    blockedKeys: new Set<string>(),
    members: [],
  };
  await db.eventShifts.clear();
  await db.shiftSignups.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(async () => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  await db.eventShifts.clear();
  await db.shiftSignups.clear();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

// useLiveQuery resolves async — flush a few microtask rounds.
async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe("MyWorkPage — shift signups", () => {
  it("lists an upcoming signed-up shift with its event, linking to the event page", async () => {
    mockState.events = [makeEvent("ev1")];
    const now = Date.now();
    await db.eventShifts.put({
      id: "sh1",
      eventId: "ev1",
      label: "Setup crew",
      startsAt: now + 23 * HOUR,
      endsAt: now + 25 * HOUR,
      capacity: null,
      createdBy: "organizer-key",
      createdAt: now - HOUR,
    });
    await db.shiftSignups.put({
      id: "su1",
      shiftId: "sh1",
      eventId: "ev1",
      memberKey: ME,
      signedUpAt: now - HOUR,
    });
    render(<MyWorkPage />);
    await flush();
    const text = container.textContent ?? "";
    expect(text).toContain("Shifts you're signed up for");
    expect(text).toContain("Setup crew");
    expect(text).toContain("Repair Café");
    const link = Array.from(container.querySelectorAll("a")).find((a) =>
      (a.textContent ?? "").includes("Setup crew"),
    );
    expect(link?.getAttribute("href")).toBe("/events/ev1");
  });

  it("omits other members' signups — the section renders nothing, not an empty shell", async () => {
    mockState.events = [makeEvent("ev1")];
    const now = Date.now();
    await db.eventShifts.put({
      id: "sh1",
      eventId: "ev1",
      label: "Setup crew",
      startsAt: now + HOUR,
      endsAt: now + 2 * HOUR,
      capacity: null,
      createdBy: "organizer-key",
      createdAt: now - HOUR,
    });
    await db.shiftSignups.put({
      id: "su-other",
      shiftId: "sh1",
      eventId: "ev1",
      memberKey: "someone-else",
      signedUpAt: now - HOUR,
    });
    render(<MyWorkPage />);
    await flush();
    expect(container.textContent ?? "").not.toContain(
      "Shifts you're signed up for",
    );
  });
});

describe("MyWorkPage — claimed NEED posts", () => {
  it("lists posts I'm on my way to help with, linking to the post", async () => {
    mockState.posts = [
      makePost("p1"),
      makePost("p2", { status: "awaiting_confirmation" }),
      makePost("p-offer", { type: "OFFER" }),
    ];
    render(<MyWorkPage />);
    await flush();
    const text = container.textContent ?? "";
    expect(text).toContain("Help you're on your way to give");
    expect(text).toContain("Grocery run for p1");
    expect(text).toContain("Grocery run for p2");
    expect(text).toContain("Awaiting confirmation");
    // The claimed OFFER is help I receive, not work — excluded.
    expect(text).not.toContain("Grocery run for p-offer");
    const link = Array.from(container.querySelectorAll("a")).find((a) =>
      (a.textContent ?? "").includes("Grocery run for p1"),
    );
    expect(link?.getAttribute("href")).toBe("/post/p1");
  });

  it("keeps the combined empty state only when ALL commitment kinds are empty", async () => {
    render(<MyWorkPage />);
    await flush();
    expect(container.textContent ?? "").toContain(
      "Nothing in your care right now",
    );
    // A claimed post alone lifts the page out of the empty state.
    mockState.posts = [makePost("p1")];
    act(() => {
      root.unmount();
    });
    render(<MyWorkPage />);
    await flush();
    expect(container.textContent ?? "").not.toContain(
      "Nothing in your care right now",
    );
  });
});
