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

beforeEach(() => {
  mockState = blankState();
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

    // Toggle the Mine checkbox. After that, only mine should appear.
    const checkbox = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    expect(checkbox).not.toBeNull();
    act(() => {
      checkbox!.click();
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
          'a[href^="/project/"], a[href^="/post/"], a[href^="/events/"]',
        ),
      ).map((a) => a.getAttribute("href"));
    }

    let hrefs = linkHrefs();
    // Before toggling, both the project deadline and the event appear.
    expect(hrefs).toContain("/project/p1");
    expect(hrefs).toContain("/events/ev_a");

    const chip = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => /events only/i.test(b.textContent ?? ""));
    expect(chip, "expected Events-only chip").toBeDefined();
    act(() => {
      chip!.click();
    });

    hrefs = linkHrefs();
    expect(hrefs).toContain("/events/ev_a");
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
        container.querySelectorAll<HTMLAnchorElement>('a[href^="/events/"]'),
      ).map((a) => a.getAttribute("href"));
    }

    // No project filter: both events render.
    expect(eventHrefs()).toContain("/events/linked");
    expect(eventHrefs()).toContain("/events/unlinked");

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
    expect(hrefs).toContain("/events/linked");
    expect(hrefs).not.toContain("/events/unlinked");
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
    const goingChip = container.querySelector('a[href="/events/going"]');
    const otherChip = container.querySelector('a[href="/events/other"]');
    expect(goingChip?.getAttribute("aria-label")).toBe("Event you're going to");
    expect(otherChip?.getAttribute("aria-label")).toBe("Event");
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
        container.querySelectorAll<HTMLAnchorElement>('a[href^="/events/"]'),
      ).map((a) => a.getAttribute("href"));
    }
    // Before toggling Mine, every event shows (community-wide).
    expect(eventHrefs()).toContain("/events/theirs");

    const checkbox = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    act(() => checkbox!.click());

    const hrefs = eventHrefs();
    expect(hrefs).toContain("/events/mine-org");
    expect(hrefs).toContain("/events/mine-going");
    expect(hrefs).toContain("/events/mine-maybe");
    expect(hrefs).not.toContain("/events/theirs");
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
        container.querySelectorAll<HTMLAnchorElement>('a[href^="/events/"]'),
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
    expect(hrefs).toContain("/events/soc");
    expect(hrefs).not.toContain("/events/work");
    vi.useRealTimers();
  });

  it("renders the FAB linking to /events/new with the i18n aria-label", () => {
    render(<CalendarPage />);
    const fab = container.querySelector<HTMLAnchorElement>(
      'a[href="/events/new"]',
    );
    expect(fab).not.toBeNull();
    expect(fab?.getAttribute("aria-label")).toBe("Create an event");
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
      (s) => s.querySelector('a[href="/events/fest"]') !== null,
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
      (s) => s.querySelector('a[href="/events/fest"]') !== null,
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
      (s) => s.querySelector('a[href="/events/build"]') !== null,
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
      container.querySelectorAll<HTMLAnchorElement>('a[href="/events/build"]'),
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
      container.querySelectorAll<HTMLAnchorElement>('a[href="/events/fest"]'),
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
    const chips = container.querySelectorAll('a[href="/events/one"]');
    expect(chips.length).toBe(1);
    vi.useRealTimers();
  });
});
