/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock `useApp` BEFORE importing the page. The real provider needs a
// hydrated Dexie connection; for a smoke test we just supply the
// shape `Calendar.tsx` consumes.
vi.mock("@/state/AppContext", () => {
  return {
    useApp: () => mockState,
  };
});

// `i18n/index.ts` runs side-effects on import (the `void i18n.init()`).
// Importing it once here brings the locale resources in so `useTranslation()`
// returns real strings during render rather than the raw key names.
import "@/i18n";
// `@/db/database` is NOT mocked — the page persists its view + filter
// state through the real settings store, backed by fake-indexeddb
// (src/test/setup.ts). We clear it per test so persistence never leaks
// between cases.
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import CalendarPage from "./Calendar";
import type {
  Event,
  EventCancellation,
  EventProjectLinkRow,
  EventRsvpRow,
  Exchange,
  Member,
  Post,
  Project,
  ProjectTask,
} from "@/types";

interface MockState {
  projects: Project[];
  posts: Post[];
  exchanges: Exchange[];
  projectTasks: ProjectTask[];
  currentMember: Member | null;
  events: Event[];
  eventCancellations: EventCancellation[];
  eventProjectLinks: EventProjectLinkRow[];
  eventRsvps: EventRsvpRow[];
}

let mockState: MockState = blankState();

function blankState(): MockState {
  return {
    projects: [],
    posts: [],
    exchanges: [],
    projectTasks: [],
    currentMember: null,
    events: [],
    eventCancellations: [],
    eventProjectLinks: [],
    eventRsvps: [],
  };
}

function makeEvent(over: Partial<Event> & { id: string; startsAt: number }): Event {
  const base: Event = {
    id: over.id,
    kind: "event",
    title: `Event ${over.id}`,
    description: "",
    category: "skills",
    startsAt: over.startsAt,
    endsAt: null,
    location: "the bench",
    capacity: null,
    templateId: null,
    createdAt: 0,
    createdBy: "someone-else",
    nodeId: "node-1",
    signature: "sig",
  };
  return { ...base, ...over };
}

// Minimal Member stub — only `publicKey` is read by Calendar.tsx for
// the "Mine" filter.
function makeMember(publicKey: string): Member {
  return {
    publicKey,
    displayName: "Tester",
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 0,
    vouchedBy: [],
    createdAt: 0,
    nodeId: "node-1",
    locationZone: "",
  } satisfies Member;
}

function makeProject(over: Partial<Project> & { id: string }): Project {
  const base: Project = {
    id: over.id,
    title: `Project ${over.id}`,
    description: "",
    category: "infrastructure",
    organizerKey: "someone-else",
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
    nodeId: "node-1",
    templateId: null,
  };
  return { ...base, ...over };
}

function makePost(over: Partial<Post> & { id: string }): Post {
  const base: Post = {
    id: over.id,
    type: "NEED",
    category: "food",
    title: `Post ${over.id}`,
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "someone-else",
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

// React 18 emits a warning when `act()` is called without this global
// flag. Setting it once at module load suppresses the noise without
// changing behavior — vitest's jsdom environment is otherwise correct.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  mockState = blankState();
  await db.settings.clear();
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

// The Mine filter is a chip (aria-pressed toggle button), sibling of
// the Events-only chip — not a checkbox.
function mineChip(): HTMLButtonElement {
  const chip = Array.from(
    container.querySelectorAll<HTMLButtonElement>("button[aria-pressed]"),
  ).find((b) => (b.textContent ?? "").trim() === "Mine");
  if (!chip) throw new Error("Mine chip not found");
  return chip;
}

// Let React effects and the fake-indexeddb reads/writes settle (real
// timers only — under vi.useFakeTimers the IDB callbacks never fire).
async function flushDb() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe("CalendarPage", () => {
  it("renders the empty-state copy when there is no data", () => {
    render(<CalendarPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("calendar is quiet");
  });

  it("shows agenda day headers when entries exist", () => {
    const day = Date.UTC(2026, 5, 15); // 2026-06-15 — within the +60d window
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.projects = [
      makeProject({
        id: "p1",
        title: "Community fridge build",
        deadline: day,
        organizerKey: "someone-else",
        category: "infrastructure",
      }),
    ];
    render(<CalendarPage />);
    // The agenda day header uses Intl.DateTimeFormat — assert on the
    // project title which is stable across locales we ship.
    const text = container.textContent ?? "";
    expect(text).toContain("Community fridge build");
    vi.useRealTimers();
  });

  it("Mine filter restricts to the viewing member's projects and posts", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    const me = makeMember("me-key");
    mockState.currentMember = me;
    mockState.projects = [
      makeProject({
        id: "p-mine",
        title: "Mine project",
        deadline: day,
        organizerKey: "me-key",
      }),
      makeProject({
        id: "p-theirs",
        title: "Theirs project",
        deadline: day,
        organizerKey: "other-key",
      }),
    ];
    mockState.posts = [
      makePost({
        id: "post-mine",
        title: "My need",
        expiresAt: day,
        postedBy: "me-key",
      }),
      makePost({
        id: "post-theirs",
        title: "Their need",
        expiresAt: day,
        postedBy: "other-key",
      }),
    ];
    render(<CalendarPage />);
    // Force agenda view — jsdom's innerWidth is 1024 by default which
    // selects month; agenda lists every entry without overflow.
    const agendaPill = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => /agenda/i.test(b.textContent ?? ""));
    expect(agendaPill).toBeDefined();
    act(() => {
      agendaPill!.click();
    });

    // Helper: collect entry link hrefs (project & post links), which
    // identify what's actually rendered in the calendar body
    // independent of the project-dropdown options.
    function linkHrefs() {
      return Array.from(
        container.querySelectorAll<HTMLAnchorElement>(
          'a[href^="/project/"], a[href^="/post/"]',
        ),
      ).map((a) => a.getAttribute("href"));
    }

    // Before toggling Mine, both projects + both posts render.
    let hrefs = linkHrefs();
    expect(hrefs).toContain("/project/p-mine");
    expect(hrefs).toContain("/project/p-theirs");
    expect(hrefs).toContain("/post/post-mine");
    expect(hrefs).toContain("/post/post-theirs");

    // Toggle the Mine chip. After that, only mine should appear.
    act(() => {
      mineChip().click();
    });
    hrefs = linkHrefs();
    expect(hrefs).toContain("/project/p-mine");
    expect(hrefs).not.toContain("/project/p-theirs");
    expect(hrefs).toContain("/post/post-mine");
    expect(hrefs).not.toContain("/post/post-theirs");
    vi.useRealTimers();
  });

  it('Events-only chip narrows the entry list to event entries', () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.projects = [
      makeProject({
        id: "p1",
        title: "Project deadline thing",
        deadline: day,
      }),
    ];
    mockState.events = [
      makeEvent({
        id: "ev_a",
        title: "Saturday skillshare",
        startsAt: day + 3 * 3_600_000,
      }),
    ];
    render(<CalendarPage />);
    // Pick agenda view so we can read link hrefs unambiguously.
    const agendaPill = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => /agenda/i.test(b.textContent ?? ""));
    act(() => {
      agendaPill!.click();
    });

    function linkHrefs() {
      return Array.from(
        container.querySelectorAll<HTMLAnchorElement>(
          'a[href^="/project/"], a[href^="/post/"], a[href^="/calendar/event/"], a[href^="/calendar/event/"]',
        ),
      ).map((a) => a.getAttribute("href"));
    }

    let hrefs = linkHrefs();
    // Before toggling, both the project deadline and the event appear.
    expect(hrefs).toContain("/project/p1");
    expect(hrefs).toContain("/calendar/event/ev_a");

    const chip = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => /events only/i.test(b.textContent ?? ""));
    expect(chip, "expected Events-only chip").toBeDefined();
    act(() => {
      chip!.click();
    });

    hrefs = linkHrefs();
    expect(hrefs).toContain("/calendar/event/ev_a");
    expect(hrefs).not.toContain("/project/p1");
    vi.useRealTimers();
  });

  it("project filter narrows events to that project's linked work days", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.projects = [
      makeProject({ id: "p1", title: "Fridge", deadline: day }),
    ];
    mockState.events = [
      makeEvent({ id: "linked", title: "Linked work day", startsAt: day + 3 * 3_600_000 }),
      makeEvent({ id: "unlinked", title: "Unrelated event", startsAt: day + 4 * 3_600_000 }),
    ];
    mockState.eventProjectLinks = [
      { id: "l1", eventId: "linked", projectId: "p1", linkedBy: "x", createdAt: 0 },
    ];
    render(<CalendarPage />);
    const agendaPill = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => /agenda/i.test(b.textContent ?? ""));
    act(() => {
      agendaPill!.click();
    });

    function eventHrefs() {
      return Array.from(
        container.querySelectorAll<HTMLAnchorElement>('a[href^="/calendar/event/"]'),
      ).map((a) => a.getAttribute("href"));
    }

    // No project filter: both events render.
    expect(eventHrefs()).toContain("/calendar/event/linked");
    expect(eventHrefs()).toContain("/calendar/event/unlinked");

    // Select the project. The project <select> is the one with a "p1"
    // option (the other select holds categories).
    const projectSelect = Array.from(
      container.querySelectorAll<HTMLSelectElement>("select"),
    ).find((s) => Array.from(s.options).some((o) => o.value === "p1"));
    expect(projectSelect, "expected the project filter select").toBeDefined();
    act(() => {
      projectSelect!.value = "p1";
      projectSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Now only the linked work day survives among events; the unlinked
    // event is filtered out, and the project's own deadline still shows.
    const hrefs = eventHrefs();
    expect(hrefs).toContain("/calendar/event/linked");
    expect(hrefs).not.toContain("/calendar/event/unlinked");
    expect(
      Array.from(
        container.querySelectorAll<HTMLAnchorElement>('a[href="/project/p1"]'),
      ).length,
    ).toBeGreaterThan(0);
    vi.useRealTimers();
  });

  it("gives an event chip its category emoji (visual identity)", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.events = [
      makeEvent({
        id: "soc",
        title: "Potluck night",
        startsAt: day + 3 * 3_600_000,
        category: "social",
      }),
    ];
    render(<CalendarPage />);
    // The "social" category emoji (🎉) renders on the chip.
    expect(container.textContent ?? "").toContain("\u{1F389}");
    vi.useRealTimers();
  });

  it("renders an event with an unknown peer category without crashing", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.events = [
      makeEvent({
        id: "x",
        title: "Mystery gathering",
        startsAt: day + 3 * 3_600_000,
        category: "zzz-future-category",
      }),
    ];
    // The render itself must not throw on an unrecognized free-text
    // category — the resolver falls back to a neutral glyph/colour.
    render(<CalendarPage />);
    expect(container.textContent ?? "").toContain("Mystery gathering");
    vi.useRealTimers();
  });

  it("marks an event the viewer RSVP'd 'going' to (own status, via the aria-label)", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.currentMember = makeMember("me-key");
    mockState.events = [
      makeEvent({ id: "going", title: "Potluck", startsAt: day + 3 * 3_600_000 }),
      makeEvent({ id: "other", title: "Meeting", startsAt: day + 4 * 3_600_000 }),
    ];
    mockState.eventRsvps = [
      {
        id: "r1",
        eventId: "going",
        memberKey: "me-key",
        status: "going",
        respondedAt: 1,
      },
    ];
    render(<CalendarPage />);
    // The event the viewer is going to carries the going-specific
    // aria-label; the other event keeps the plain one.
    const goingChip = container.querySelector('a[href="/calendar/event/going"]');
    const otherChip = container.querySelector('a[href="/calendar/event/other"]');
    expect(goingChip?.getAttribute("aria-label")).toBe("Event you're going to");
    expect(otherChip?.getAttribute("aria-label")).toBe("Event");
    vi.useRealTimers();
  });

  it("distinguishes a NEED from an OFFER post by its leading glyph (agenda)", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.posts = [
      makePost({ id: "need-1", title: "Ride to clinic", type: "NEED", expiresAt: day }),
      makePost({ id: "offer-1", title: "Spare tomatoes", type: "OFFER", expiresAt: day }),
    ];
    render(<CalendarPage />);
    // Agenda view lists every entry; switch to it so both posts render.
    const agendaPill = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => /agenda/i.test(b.textContent ?? ""));
    act(() => agendaPill!.click());

    // Scope each glyph to its own /post/<id> row (the <li> wrapping the
    // Link) so the need glyph (🤲) lands on the need and the seedling
    // (🌱) on the offer — same per-row scoping the going-✓ tests use.
    const needRow = container
      .querySelector('a[href="/post/need-1"]')
      ?.closest("li");
    const offerRow = container
      .querySelector('a[href="/post/offer-1"]')
      ?.closest("li");
    expect(needRow?.textContent ?? "").toContain("\u{1F932}");
    expect(needRow?.textContent ?? "").not.toContain("\u{1F331}");
    expect(offerRow?.textContent ?? "").toContain("\u{1F331}");
    expect(offerRow?.textContent ?? "").not.toContain("\u{1F932}");
    vi.useRealTimers();
  });

  it("reframes the expiring-post copy from scarcity to solidarity (agenda)", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.posts = [
      makePost({ id: "need-1", title: "Ride to clinic", type: "NEED", expiresAt: day }),
      makePost({ id: "offer-1", title: "Spare tomatoes", type: "OFFER", expiresAt: day }),
    ];
    render(<CalendarPage />);
    const agendaPill = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => /agenda/i.test(b.textContent ?? ""));
    act(() => agendaPill!.click());

    const text = container.textContent ?? "";
    expect(text).toContain("Help wanted");
    expect(text).toContain("Offer ending");
    // Regression guard: the old scarcity framing must be gone.
    expect(text).not.toContain("Need expires");
    expect(text).not.toContain("Offer expires");
    vi.useRealTimers();
  });

  it("conveys a post's kind through the chip aria-label (month view)", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.posts = [
      makePost({ id: "need-1", title: "Ride to clinic", type: "NEED", expiresAt: day }),
      makePost({ id: "offer-1", title: "Spare tomatoes", type: "OFFER", expiresAt: day }),
    ];
    // Default jsdom innerWidth (1024) selects the month view — no view
    // switch needed; the chips carry the reframed label on aria-label.
    render(<CalendarPage />);
    const needChip = container.querySelector('a[href="/post/need-1"]');
    const offerChip = container.querySelector('a[href="/post/offer-1"]');
    expect(needChip?.getAttribute("aria-label") ?? "").toMatch(/help wanted/i);
    expect(offerChip?.getAttribute("aria-label") ?? "").toMatch(/offer ending/i);
    vi.useRealTimers();
  });

  it("Mine narrows events to ones I organize or RSVP'd going/maybe to", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.currentMember = makeMember("me-key");
    mockState.events = [
      makeEvent({ id: "mine-org", title: "I organize", startsAt: day + 1 * 3_600_000, createdBy: "me-key" }),
      makeEvent({ id: "mine-going", title: "Going", startsAt: day + 2 * 3_600_000, createdBy: "other" }),
      makeEvent({ id: "mine-maybe", title: "Maybe", startsAt: day + 3 * 3_600_000, createdBy: "other" }),
      makeEvent({ id: "theirs", title: "Not mine", startsAt: day + 4 * 3_600_000, createdBy: "other" }),
    ];
    mockState.eventRsvps = [
      { id: "r1", eventId: "mine-going", memberKey: "me-key", status: "going", respondedAt: 1 },
      { id: "r2", eventId: "mine-maybe", memberKey: "me-key", status: "maybe", respondedAt: 1 },
    ];
    render(<CalendarPage />);
    const agendaPill = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => /agenda/i.test(b.textContent ?? ""));
    act(() => agendaPill!.click());

    function eventHrefs() {
      return Array.from(
        container.querySelectorAll<HTMLAnchorElement>('a[href^="/calendar/event/"]'),
      ).map((a) => a.getAttribute("href"));
    }
    // Before toggling Mine, every event shows (community-wide).
    expect(eventHrefs()).toContain("/calendar/event/theirs");

    act(() => mineChip().click());

    const hrefs = eventHrefs();
    expect(hrefs).toContain("/calendar/event/mine-org");
    expect(hrefs).toContain("/calendar/event/mine-going");
    expect(hrefs).toContain("/calendar/event/mine-maybe");
    expect(hrefs).not.toContain("/calendar/event/theirs");
    vi.useRealTimers();
  });

  it("the category filter offers and narrows by an event-specific category", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.events = [
      makeEvent({ id: "soc", title: "Potluck", startsAt: day + 1 * 3_600_000, category: "social" }),
      makeEvent({ id: "work", title: "Build day", startsAt: day + 2 * 3_600_000, category: "skilled_labor" }),
    ];
    render(<CalendarPage />);
    const agendaPill = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => /agenda/i.test(b.textContent ?? ""));
    act(() => agendaPill!.click());

    function eventHrefs() {
      return Array.from(
        container.querySelectorAll<HTMLAnchorElement>('a[href^="/calendar/event/"]'),
      ).map((a) => a.getAttribute("href"));
    }

    // The category dropdown is data-derived, so "social" is selectable
    // because a social event exists.
    const categorySelect = Array.from(
      container.querySelectorAll<HTMLSelectElement>("select"),
    ).find((s) => Array.from(s.options).some((o) => o.value === "social"));
    expect(categorySelect, "expected a 'social' category option").toBeDefined();
    act(() => {
      categorySelect!.value = "social";
      categorySelect!.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const hrefs = eventHrefs();
    expect(hrefs).toContain("/calendar/event/soc");
    expect(hrefs).not.toContain("/calendar/event/work");
    vi.useRealTimers();
  });

  it("renders the FAB linking to /calendar/event/new with the i18n aria-label", () => {
    render(<CalendarPage />);
    const fab = container.querySelector<HTMLAnchorElement>(
      'a[href="/events/new"]',
    );
    expect(fab).not.toBeNull();
    expect(fab?.getAttribute("aria-label")).toBe("Create an event");
  });

  it("reserves the shared FAB clearance on the page wrapper so covered rows can scroll clear", () => {
    // Class-presence only — the actual padding lives in index.css
    // (.pb-fab-clear) and is verified by inspection; jsdom applies no
    // stylesheet. Guards against the clearance being dropped or
    // drifting back to a per-page magic number.
    render(<CalendarPage />);
    expect(container.querySelector(".pb-fab-clear")).not.toBeNull();
  });

  // Force the agenda view (jsdom defaults innerWidth to 1024 → month).
  // The agenda lists every entry under day headers, which is what the
  // multi-day cases below assert against.
  function clickAgenda() {
    const agendaPill = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => /agenda/i.test(b.textContent ?? ""));
    act(() => agendaPill!.click());
  }

  it("renders a 2-day event under two day headers in the agenda", () => {
    // Day D 20:00 → day D+1 02:00 UTC: the festival spans two UTC days.
    const startsAt = Date.UTC(2026, 5, 15, 20, 0, 0);
    const endsAt = Date.UTC(2026, 5, 16, 2, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.events = [
      makeEvent({ id: "fest", title: "Weekend festival", startsAt, endsAt }),
    ];
    render(<CalendarPage />);
    clickAgenda();
    // The event's link appears in BOTH day sections.
    const sections = Array.from(container.querySelectorAll("section")).filter(
      (s) => s.querySelector('a[href="/calendar/event/fest"]') !== null,
    );
    expect(sections.length).toBe(2);
    vi.useRealTimers();
  });

  it("suppresses the start time and shows the day-of copy on a continuation day", () => {
    const startsAt = Date.UTC(2026, 5, 15, 20, 0, 0);
    const endsAt = Date.UTC(2026, 5, 16, 2, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.events = [
      makeEvent({ id: "fest", title: "Weekend festival", startsAt, endsAt }),
    ];
    render(<CalendarPage />);
    clickAgenda();
    // Find the two day sections in grid order; the SECOND is the
    // continuation (final) day. For a 2-day span the continuation day IS
    // the final day, so it renders the "Ends" line, which still carries
    // the "day 2 of 2" cue only on the title attribute — assert here on
    // the final-day "Ends" copy and that the start time is absent.
    const sections = Array.from(container.querySelectorAll("section")).filter(
      (s) => s.querySelector('a[href="/calendar/event/fest"]') !== null,
    );
    expect(sections.length).toBe(2);
    const finalText = sections[1].textContent ?? "";
    expect(finalText).toContain("Ends");
    // The start time string is "8:00" (20:00 → 8:00 PM in en-US Intl).
    // It must NOT appear on the continuation/final day row.
    expect(finalText).not.toContain("8:00");
    vi.useRealTimers();
  });

  it("shows a 'Day 2 of 3' continuation line on a true middle day", () => {
    // A 3-day span so the middle day is a continuation that is NOT the
    // final day — it renders the "Continues · Day 2 of 3" copy.
    const startsAt = Date.UTC(2026, 5, 15, 9, 0, 0);
    const endsAt = Date.UTC(2026, 5, 17, 17, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.events = [
      makeEvent({ id: "build", title: "Three-day build", startsAt, endsAt }),
    ];
    render(<CalendarPage />);
    clickAgenda();
    const sections = Array.from(container.querySelectorAll("section")).filter(
      (s) => s.querySelector('a[href="/calendar/event/build"]') !== null,
    );
    expect(sections.length).toBe(3);
    const middleText = sections[1].textContent ?? "";
    expect(middleText).toContain("Day 2 of 3");
    expect(middleText).toContain("Continues");
    // The start time (9:00) belongs to day 1, not the middle day.
    expect(middleText).not.toContain("9:00");
    // The final day shows the "Ends" line.
    expect(sections[2].textContent ?? "").toContain("Ends");
    vi.useRealTimers();
  });

  it("gives a continuation chip a day-aware aria-label (week view)", () => {
    const startsAt = Date.UTC(2026, 5, 15, 9, 0, 0);
    const endsAt = Date.UTC(2026, 5, 17, 17, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.events = [
      makeEvent({ id: "build", title: "Three-day build", startsAt, endsAt }),
    ];
    render(<CalendarPage />);
    // Switch to week view, then step it onto the event's week (the view
    // anchors to "now" = the start of June, the event is mid-June).
    const weekPill = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => /week/i.test(b.textContent ?? ""));
    act(() => weekPill!.click());
    const nextBtn = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => /next/i.test(b.textContent ?? ""));
    // June 1 (Mon) → the event week (the 15th) is two weeks forward.
    act(() => nextBtn!.click());
    act(() => nextBtn!.click());
    // Collect this event's chips; at least one is a continuation day
    // (dayIndex > 0) and carries a "day N of 3" aria-label.
    const chips = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[href="/calendar/event/build"]'),
    );
    const labels = chips.map((c) => c.getAttribute("aria-label") ?? "");
    expect(labels.some((l) => /day 2 of 3/i.test(l))).toBe(true);
    vi.useRealTimers();
  });

  it("marks EVERY day of a multi-day event the viewer is going to", () => {
    const startsAt = Date.UTC(2026, 5, 15, 20, 0, 0);
    const endsAt = Date.UTC(2026, 5, 16, 2, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.currentMember = makeMember("me-key");
    mockState.events = [
      makeEvent({ id: "fest", title: "Weekend festival", startsAt, endsAt }),
    ];
    mockState.eventRsvps = [
      {
        id: "r1",
        eventId: "fest",
        memberKey: "me-key",
        status: "going",
        respondedAt: 1,
      },
    ];
    render(<CalendarPage />);
    clickAgenda();
    const chips = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[href="/calendar/event/fest"]'),
    );
    expect(chips.length).toBe(2);
    // Both day entries carry a "going" aria-label (the going-specific
    // multi-day variant mentions "going to").
    for (const chip of chips) {
      expect(chip.getAttribute("aria-label") ?? "").toMatch(/going to/i);
    }
    vi.useRealTimers();
  });

  it("renders a single-day (null endsAt) event as exactly one link (regression)", () => {
    const startsAt = Date.UTC(2026, 5, 15, 18, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.events = [
      makeEvent({ id: "one", title: "Single evening", startsAt, endsAt: null }),
    ];
    render(<CalendarPage />);
    clickAgenda();
    const chips = container.querySelectorAll('a[href="/calendar/event/one"]');
    expect(chips.length).toBe(1);
    vi.useRealTimers();
  });

  it("weights the viewer's commitments in the agenda (canopy accent + sr-only suffix); ambient rows stay plain", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.currentMember = makeMember("me-key");
    mockState.projects = [
      makeProject({ id: "p-mine", title: "Mine project", deadline: day, organizerKey: "me-key" }),
      makeProject({ id: "p-theirs", title: "Theirs project", deadline: day, organizerKey: "other-key" }),
    ];
    mockState.posts = [
      makePost({ id: "post-mine", title: "My need", expiresAt: day, postedBy: "me-key" }),
    ];
    mockState.events = [
      makeEvent({ id: "going", title: "Potluck", startsAt: day + 3 * 3_600_000 }),
      makeEvent({ id: "ambient", title: "Meeting", startsAt: day + 4 * 3_600_000 }),
    ];
    mockState.eventRsvps = [
      { id: "r1", eventId: "going", memberKey: "me-key", status: "going", respondedAt: 1 },
    ];
    render(<CalendarPage />);
    clickAgenda();

    // Own project deadline: canopy accent + semibold + sr-only "(yours)".
    const mineRow = container.querySelector('a[href="/project/p-mine"]');
    expect(mineRow?.className ?? "").toContain("border-canopy");
    expect(mineRow?.querySelector("span.sr-only")?.textContent ?? "").toContain(
      "(yours)",
    );
    expect(mineRow?.innerHTML ?? "").toContain("font-semibold");

    // Someone else's deadline: no accent, no suffix, no weight.
    const theirsRow = container.querySelector('a[href="/project/p-theirs"]');
    expect(theirsRow?.className ?? "").not.toContain("border-canopy");
    expect(theirsRow?.textContent ?? "").not.toContain("(yours)");
    expect(theirsRow?.innerHTML ?? "").not.toContain("font-semibold");

    // Own expiring post carries the same treatment.
    const postRow = container.querySelector('a[href="/post/post-mine"]');
    expect(postRow?.className ?? "").toContain("border-canopy");
    expect(postRow?.querySelector("span.sr-only")?.textContent ?? "").toContain(
      "(yours)",
    );

    // RSVP'd-going event: accent + weight + the existing ✓ stays; the
    // going aria-label (not colour) carries it for screen readers.
    const goingChip = container.querySelector('a[href="/calendar/event/going"]');
    expect(goingChip?.className ?? "").toContain("border-canopy");
    expect(goingChip?.innerHTML ?? "").toContain("font-semibold");
    expect(goingChip?.textContent ?? "").toContain("✓");
    // Ambient event: none of it.
    const ambientChip = container.querySelector('a[href="/calendar/event/ambient"]');
    expect(ambientChip?.className ?? "").not.toContain("border-canopy");
    expect(ambientChip?.innerHTML ?? "").not.toContain("font-semibold");
    vi.useRealTimers();
  });

  it("shows an active-filter count reflecting each filter and drops it on clear", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    mockState.currentMember = makeMember("me-key");
    mockState.projects = [makeProject({ id: "p1", deadline: day })];
    render(<CalendarPage />);

    expect(container.textContent ?? "").not.toContain("Filters ·");

    // Events-only on → 1 active.
    const eventsOnlyChip = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => /events only/i.test(b.textContent ?? ""));
    act(() => eventsOnlyChip!.click());
    expect(container.textContent ?? "").toContain("Filters · 1 active");

    // Mine on → 2 active.
    act(() => mineChip().click());
    expect(container.textContent ?? "").toContain("Filters · 2 active");

    // Project select set → 3 active.
    const projectSelect = Array.from(
      container.querySelectorAll<HTMLSelectElement>("select"),
    ).find((s) => Array.from(s.options).some((o) => o.value === "p1"));
    act(() => {
      projectSelect!.value = "p1";
      projectSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(container.textContent ?? "").toContain("Filters · 3 active");

    // The narrowed list is empty (Events-only with no events), so the
    // filtered-empty state offers Clear filters; clicking it resets
    // every filter and the count disappears.
    const clearBtn = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => /clear filters/i.test(b.textContent ?? ""));
    expect(clearBtn, "expected the Clear filters affordance").toBeDefined();
    act(() => clearBtn!.click());
    expect(container.textContent ?? "").not.toContain("Filters ·");
    vi.useRealTimers();
  });

  it("truly-empty state points at the + button; no guilt framing", () => {
    render(<CalendarPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("calendar is quiet");
    expect(text).toContain("The + button below starts an event.");
    // Not the filtered-empty variant.
    expect(text).not.toContain("Nothing matches these filters.");
  });

  it("filtered-empty shows the clear-filters variant instead of the truly-empty copy", () => {
    const day = Date.UTC(2026, 5, 15);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    // Data exists (a project deadline), but Events-only narrows to zero.
    mockState.projects = [makeProject({ id: "p1", deadline: day })];
    render(<CalendarPage />);
    const eventsOnlyChip = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => /events only/i.test(b.textContent ?? ""));
    act(() => eventsOnlyChip!.click());

    let text = container.textContent ?? "";
    expect(text).toContain("Nothing matches these filters.");
    expect(text).not.toContain("calendar is quiet");

    // Clear filters brings the entries back.
    const clearBtn = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => /clear filters/i.test(b.textContent ?? ""));
    act(() => clearBtn!.click());
    text = container.textContent ?? "";
    expect(text).not.toContain("Nothing matches these filters.");
    expect(
      container.querySelector('a[href="/project/p1"]'),
    ).not.toBeNull();
    vi.useRealTimers();
  });

  it("persists the view mode and filters and restores them on remount", async () => {
    // Real timers throughout — fake-indexeddb schedules its callbacks
    // through the timer queue.
    mockState.currentMember = makeMember("me-key");
    render(<CalendarPage />);
    await flushDb(); // initial hydration (nothing stored yet)

    // Explicit picks: agenda view, Events-only + Mine on.
    clickAgenda();
    const eventsOnlyChip = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => /events only/i.test(b.textContent ?? ""));
    act(() => eventsOnlyChip!.click());
    act(() => mineChip().click());
    await flushDb(); // write-through lands

    expect(await getSetting(SETTING_KEYS.calendarViewMode)).toBe("agenda");
    const storedFilters = await getSetting(SETTING_KEYS.calendarFilters);
    expect(storedFilters).toBeDefined();
    expect(JSON.parse(storedFilters!)).toMatchObject({
      eventsOnly: true,
      mine: true,
    });

    // Unmount and remount fresh — the restore effect rehydrates both.
    act(() => root.unmount());
    container.remove();
    container = document.createElement("div");
    document.body.appendChild(container);
    render(<CalendarPage />);
    await flushDb();

    const agendaPill = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => /agenda/i.test(b.textContent ?? ""));
    expect(agendaPill?.getAttribute("aria-selected")).toBe("true");
    // Scoped to [aria-pressed] like mineChip(): with the filters
    // disclosure, an ACTIVE filter also renders a removable chip with
    // the same visible text but no pressed state — the drawer's
    // toggle is the one that carries it.
    const restoredEventsOnly = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button[aria-pressed]"),
    ).find((b) => /events only/i.test(b.textContent ?? ""));
    expect(restoredEventsOnly?.getAttribute("aria-pressed")).toBe("true");
    expect(mineChip().getAttribute("aria-pressed")).toBe("true");
  });
});

// ─── Month paging + window-follows-view (page wiring) ───────────────

describe("CalendarPage month paging", () => {
  it("paging ahead widens the entries window: a far-out event appears", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    // ~101 days out — past the fixed 60-day forward window that used
    // to silently hide it from every view.
    mockState.events = [
      makeEvent({
        id: "far",
        title: "Autumn build day",
        startsAt: Date.UTC(2026, 8, 10, 18, 0, 0),
      }),
    ];
    // Also seed a near event so the page doesn't short-circuit to the
    // empty state before we can page.
    mockState.events.push(
      makeEvent({ id: "near", startsAt: Date.UTC(2026, 5, 10, 18, 0, 0) }),
    );
    // Default jsdom innerWidth (1024) selects the month view.
    render(<CalendarPage />);
    expect(container.textContent).toContain("June 2026");
    expect(container.querySelector('a[href="/calendar/event/far"]')).toBeNull();

    const nextMonth = () =>
      Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
        (b) => /next month/i.test(b.getAttribute("aria-label") ?? ""),
      );
    act(() => nextMonth()!.click());
    act(() => nextMonth()!.click());
    act(() => nextMonth()!.click());
    expect(container.textContent).toContain("September 2026");
    expect(container.querySelector('a[href="/calendar/event/far"]')).not.toBeNull();

    // The quiet Today jump resets to the current month.
    const today = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => (b.textContent ?? "").trim() === "Today");
    expect(today).toBeDefined();
    act(() => today!.click());
    expect(container.textContent).toContain("June 2026");
    expect(container.querySelector('a[href="/calendar/event/far"]')).toBeNull();
    vi.useRealTimers();
  });
});

// ─── Short-landscape default view ───────────────────────────────────
//
// A phone held sideways (the shared `landscape-short` variant —
// tailwind.config.js: landscape AND ≤500px tall) defaults to the
// stacked agenda view: jsdom's 1024px innerWidth would otherwise pick
// the month grid, whose six ~50px rows can't breathe on a short
// screen. jsdom carries no matchMedia at all — the page treats that
// as "not short" — so these tests install a stub per case.

describe("CalendarPage short-landscape default view", () => {
  const SHORT_QUERY = "(orientation: landscape) and (max-height: 500px)";

  function stubMatchMedia(matches: boolean) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string) =>
        ({
          matches: query === SHORT_QUERY ? matches : false,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList,
    });
  }

  afterEach(() => {
    // Restore jsdom's native matchMedia-less window.
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  function selectedTab(): string {
    const tab = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => b.getAttribute("aria-selected") === "true");
    return (tab?.textContent ?? "").trim();
  }

  it("defaults to agenda when the viewport is short-landscape", () => {
    stubMatchMedia(true);
    render(<CalendarPage />);
    expect(selectedTab()).toMatch(/agenda/i);
  });

  it("keeps the width-derived month default when not short-landscape", () => {
    stubMatchMedia(false);
    // jsdom innerWidth is 1024 — at/above the lg breakpoint.
    render(<CalendarPage />);
    expect(selectedTab()).toMatch(/month/i);
  });

  it("a stored view preference beats the short-landscape default", async () => {
    stubMatchMedia(true);
    await setSetting(SETTING_KEYS.calendarViewMode, "month");
    render(<CalendarPage />);
    await flushDb(); // restore effect rehydrates the explicit choice
    expect(selectedTab()).toMatch(/month/i);
  });

  it("a stored preference also beats the width default outside short-landscape", async () => {
    stubMatchMedia(false);
    await setSetting(SETTING_KEYS.calendarViewMode, "week");
    render(<CalendarPage />);
    await flushDb();
    expect(selectedTab()).toMatch(/week/i);
  });
});

// ─── View switching re-anchors paging (round-3 confusion fix) ───────
//
// The paging offsets are session-local and RELATIVE TO NOW, kept one
// per view. Before this fix, an offset left behind by an earlier
// visit to the week/month view (paged back, switched to agenda, came
// back later) silently reopened the wrong week — with a "Today" pill
// implying today was on screen. Switching INTO a paged view now
// always lands on the period containing today; explicit paging
// INSIDE the view is untouched.

describe("CalendarPage view switching re-anchors paging", () => {
  function viewPill(name: RegExp): HTMLButtonElement {
    const pill = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((b) => name.test(b.textContent ?? ""));
    if (!pill) throw new Error(`view pill ${name} not found`);
    return pill;
  }

  function navButton(label: RegExp): HTMLButtonElement {
    const btn = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => label.test(b.getAttribute("aria-label") ?? ""));
    if (!btn) throw new Error(`nav button ${label} not found`);
    return btn;
  }

  // The week header's atToday signal: a quiet "This week" tag when
  // the rendered week contains now, a "Today" jump button otherwise.
  const onThisWeek = () => (container.textContent ?? "").includes("This week");

  function seedEntries() {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 15, 12))); // Mon 2026-06-15
    mockState.events = [
      makeEvent({ id: "near", startsAt: Date.UTC(2026, 5, 16, 18) }),
    ];
  }

  it("Agenda → Week lands on the week containing today despite a stale offset", () => {
    seedEntries();
    render(<CalendarPage />);
    act(() => viewPill(/week/i).click());
    expect(onThisWeek()).toBe(true);

    // Page back a week — the member's explicit navigation.
    act(() => navButton(/previous week/i).click());
    expect(onThisWeek()).toBe(false);

    // Wander off to Agenda, then come back to Week: the stale -1
    // offset must NOT reopen last week under a "Today" pill.
    act(() => viewPill(/agenda/i).click());
    act(() => viewPill(/week/i).click());
    expect(onThisWeek()).toBe(true);
    vi.useRealTimers();
  });

  it("clicking the already-active Week pill keeps the paged-to week", () => {
    seedEntries();
    render(<CalendarPage />);
    act(() => viewPill(/week/i).click());
    act(() => navButton(/previous week/i).click());
    expect(onThisWeek()).toBe(false);

    // Re-clicking the active pill is not a view switch — the member's
    // place survives.
    act(() => viewPill(/week/i).click());
    expect(onThisWeek()).toBe(false);
    vi.useRealTimers();
  });

  it("Agenda → Month lands on the month containing today despite a stale offset", () => {
    seedEntries();
    render(<CalendarPage />);
    // Default jsdom innerWidth (1024) already selects month view;
    // page it away, detour through agenda, and return.
    expect(container.textContent).toContain("June 2026");
    act(() => navButton(/next month/i).click());
    expect(container.textContent).toContain("July 2026");
    act(() => viewPill(/agenda/i).click());
    act(() => viewPill(/month/i).click());
    expect(container.textContent).toContain("June 2026");
    vi.useRealTimers();
  });
});

// ─── FAB placement (round-3 papercut) ───────────────────────────────
//
// landscape-short pins the "+ New event" pill bottom-right (centered,
// it floated over the middle of an already-short page) and the pill
// unmounts entirely while the docked event panel is open — in
// split-capable short landscape the panel docks exactly where a
// centered pill floats, and below lg the panel's full-screen takeover
// covers it anyway (same discipline as the Board FAB).

describe("CalendarPage FAB placement", () => {
  const fab = () => container.querySelector("div.pointer-events-none.fixed");

  it("carries the landscape-short bottom-right classes", () => {
    render(<CalendarPage />);
    const el = fab();
    expect(el).not.toBeNull();
    expect(el!.className).toContain("landscape-short:justify-end");
    expect(el!.className).toContain(
      "landscape-short:bottom-[calc(1rem+env(safe-area-inset-bottom))]",
    );
  });

  it("unmounts the FAB while the docked event panel route is open", () => {
    act(() => {
      root = createRoot(container);
      root.render(
        <MemoryRouter initialEntries={["/calendar/event/evt-1"]}>
          <CalendarPage />
        </MemoryRouter>,
      );
    });
    expect(fab()).toBeNull();
  });

  it("keeps the FAB on the plain /calendar route", () => {
    act(() => {
      root = createRoot(container);
      root.render(
        <MemoryRouter initialEntries={["/calendar"]}>
          <CalendarPage />
        </MemoryRouter>,
      );
    });
    expect(fab()).not.toBeNull();
  });
});
