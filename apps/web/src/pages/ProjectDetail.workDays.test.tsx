/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), toast: null }),
}));
vi.mock("@/db/secrets", () => ({ getSecretKey: vi.fn(async () => "secret") }));
vi.mock("@/db/coorgInvitations", () => ({
  issueCoOrganizerInvitation: vi.fn(),
  revokeCoOrganizerInvitation: vi.fn(),
}));
// Mock @/db/projects (isOrganizer + the module-scope imports). The
// announcement / history live queries resolve to empty arrays via the
// real useLiveQuery calling these mocked readers — so we do NOT mock
// dexie-react-hooks and the work-day links query hits the real
// (fake-indexeddb) table we seed per test.
vi.mock("@/db/projects", () => ({
  isOrganizer: (p: Project, key: string) =>
    p.organizerKey === key || p.coOrganizerKeys.includes(key),
  canClaimTask: () => true,
  logActivity: vi.fn(async () => undefined),
  listActivityForProject: vi.fn(async () => []),
  listAnnouncements: vi.fn(async () => []),
  addProjectTask: vi.fn(),
  archiveProject: vi.fn(),
  bulkAddTasks: vi.fn(),
  claimProjectTask: vi.fn(),
  cloneProject: vi.fn(),
  completeProject: vi.fn(),
  confirmProjectTaskCompletion: vi.fn(),
  editProjectTask: vi.fn(),
  handoffOrganizer: vi.fn(),
  launchProject: vi.fn(),
  markProjectTaskComplete: vi.fn(),
  pauseProject: vi.fn(),
  postAnnouncement: vi.fn(),
  removeCoOrganizer: vi.fn(),
  reorderProjectTask: vi.fn(),
  resumeProject: vi.fn(),
  unarchiveProject: vi.fn(),
  unclaimProjectTask: vi.fn(),
}));

import "@/i18n";
import { db } from "@/db/database";
import ProjectDetailPage from "./ProjectDetail";
import type {
  Event,
  EventCancellation,
  EventProjectLinkRow,
  Member,
  Project,
  ProjectTask,
} from "@/types";

const nodeId = "node_test";
const organizerKey = "organizer-key";
const DAY = 24 * 60 * 60 * 1000;

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

function project(over: Partial<Project> = {}): Project {
  return {
    id: "proj-1",
    title: "Community Fridge",
    description: "",
    category: "infrastructure",
    organizerKey,
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
    ...over,
  };
}

function eventRow(over: Partial<Event> & { id: string }): Event {
  return {
    kind: "event",
    title: `Event ${over.id}`,
    description: "",
    category: "skills-exchange",
    startsAt: Date.now() + 2 * DAY,
    endsAt: null,
    location: "Community room",
    capacity: null,
    templateId: null,
    createdAt: 0,
    createdBy: organizerKey,
    nodeId,
    signature: "sig",
    ...over,
  };
}

function link(eventId: string): EventProjectLinkRow {
  return {
    id: `link-${eventId}`,
    eventId,
    projectId: "proj-1",
    linkedBy: organizerKey,
    createdAt: 0,
  };
}

interface MockState {
  projects: Project[];
  projectTasks: ProjectTask[];
  members: Member[];
  currentMember: Member | null;
  nodeId: string;
  nodeConfig: {
    taskCheckInDays: number;
    taskNeedsHelpDays: number;
    taskCheckInGraceDays: number;
  };
  exchanges: unknown[];
  proposals: unknown[];
  lockState: "unprotected" | "locked" | "unlocked";
  coorgInvitations: unknown[];
  coorgInvitationResponses: unknown[];
  coorgInvitationRevocations: unknown[];
  blockedKeys: Set<string>;
  taskComments: unknown[];
  events: Event[];
  eventCancellations: EventCancellation[];
}

let mockState: MockState;

function freshState(): MockState {
  return {
    projects: [project()],
    projectTasks: [],
    members: [member(organizerKey, "Organizer")],
    currentMember: member(organizerKey, "Organizer"),
    nodeId,
    nodeConfig: {
      taskCheckInDays: 7,
      taskNeedsHelpDays: 14,
      taskCheckInGraceDays: 3,
    },
    exchanges: [],
    proposals: [],
    lockState: "unprotected",
    coorgInvitations: [],
    coorgInvitationResponses: [],
    coorgInvitationRevocations: [],
    blockedKeys: new Set<string>(),
    taskComments: [],
    events: [],
    eventCancellations: [],
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  mockState = freshState();
  await db.eventProjectLinks.clear();
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
      <MemoryRouter initialEntries={["/project/proj-1"]}>
        <Routes>
          <Route path="/project/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
}

const HEADING = "Upcoming work days";
const SCHEDULE = "Schedule a work day";

describe("ProjectDetail — work days section", () => {
  it("is hidden for a non-organizer when there are no work days", async () => {
    mockState.members = [
      member(organizerKey, "Organizer"),
      member("rando", "Rando"),
    ];
    mockState.currentMember = member("rando", "Rando");
    render();
    await flush();
    expect(container.textContent ?? "").not.toContain(HEADING);
    expect(container.textContent ?? "").not.toContain(SCHEDULE);
  });

  it("shows the schedule button to an organizer even with no work days yet", async () => {
    render();
    await flush();
    expect(container.textContent ?? "").toContain(HEADING);
    expect(container.textContent ?? "").toContain(SCHEDULE);
  });

  it("lists upcoming linked work days soonest-first", async () => {
    mockState.events = [
      eventRow({ id: "later", title: "Later build day", startsAt: Date.now() + 5 * DAY }),
      eventRow({ id: "sooner", title: "Sooner build day", startsAt: Date.now() + 1 * DAY }),
    ];
    await db.eventProjectLinks.bulkPut([link("later"), link("sooner")]);
    render();
    await flush();
    const text = container.textContent ?? "";
    expect(text).toContain("Sooner build day");
    expect(text).toContain("Later build day");
    // Soonest first.
    expect(text.indexOf("Sooner build day")).toBeLessThan(
      text.indexOf("Later build day"),
    );
  });

  it("drops a cancelled linked event", async () => {
    mockState.events = [eventRow({ id: "ev1", title: "Cancelled build day" })];
    mockState.eventCancellations = [
      {
        id: "c1",
        kind: "event_cancellation",
        eventId: "ev1",
        reason: "rain",
        cancelledAt: Date.now(),
        createdBy: organizerKey,
        nodeId,
        signature: "sig",
      },
    ];
    await db.eventProjectLinks.put(link("ev1"));
    render();
    await flush();
    expect(container.textContent ?? "").not.toContain("Cancelled build day");
  });

  it("drops past events but still shows the section to an organizer", async () => {
    mockState.events = [
      eventRow({ id: "past", title: "Past build day", startsAt: Date.now() - 10 * DAY }),
    ];
    await db.eventProjectLinks.put(link("past"));
    render();
    await flush();
    const text = container.textContent ?? "";
    expect(text).not.toContain("Past build day");
    // The section still renders for the organizer (schedule affordance).
    expect(text).toContain(HEADING);
  });

  it("hides the schedule button on a completed project but still lists the work day", async () => {
    mockState.projects = [project({ status: "completed", completedAt: 1 })];
    mockState.events = [eventRow({ id: "ev1", title: "Final build day" })];
    await db.eventProjectLinks.put(link("ev1"));
    render();
    await flush();
    const text = container.textContent ?? "";
    expect(text).toContain("Final build day");
    expect(text).not.toContain(SCHEDULE);
  });
});
