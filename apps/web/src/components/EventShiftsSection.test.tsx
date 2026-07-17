/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * EventShiftsSection rendering + interaction contract
 * (docs/shift-signups.md §6):
 *
 *   - §6.4 copy discipline — spot counts render as invitation
 *     ("2 spots open"), a full shift replaces the control, an
 *     uncapped shift shows the open-signup line, and a passed shift
 *     shows the settled register with no controls.
 *   - §6.3 tiers — roster names render only for canSeeRoster
 *     viewers; everyone else gets the counts-only hint.
 *   - §6.2 consent card — tapping "Sign up" expands the card naming
 *     the RSVP coupling; confirming calls signUpForShift.
 *   - §5.2 — a cancelled event renders everything inert; the
 *     organizer's add form and empty-shift delete render only on a
 *     live event.
 *
 * Data-layer behavior (guards, transactions, RSVP coupling) is
 * covered in db/eventShifts.test.ts; this suite mocks the layer and
 * asserts the surface.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event, EventShiftRow, ShiftSignupRow } from "@/types";

const {
  addShiftMock,
  deleteShiftMock,
  downloadIcsMock,
  removeSignupMock,
  setShiftCapacityMock,
  showToastMock,
  signUpForShiftMock,
} = vi.hoisted(() => ({
  addShiftMock: vi.fn(async () => ({}) as unknown),
  deleteShiftMock: vi.fn(async () => undefined),
  downloadIcsMock: vi.fn(),
  removeSignupMock: vi.fn(async () => undefined),
  setShiftCapacityMock: vi.fn(async () => ({}) as unknown),
  showToastMock: vi.fn(),
  signUpForShiftMock: vi.fn(async () => ({}) as unknown),
}));

// jsdom has no object URLs, so the real Blob/anchor download can't
// run; the seam is the call, same as the EventDetail suite.
vi.mock("@/lib/ics", () => ({ downloadIcs: downloadIcsMock }));

vi.mock("@/db/eventShifts", () => ({
  SHIFT_LABEL_MAX: 100,
  addShift: addShiftMock,
  deleteShift: deleteShiftMock,
  listShiftsForEvent: vi.fn(),
  listSignupsForEvent: vi.fn(),
  removeSignup: removeSignupMock,
  setShiftCapacity: setShiftCapacityMock,
  signUpForShift: signUpForShiftMock,
}));

// Fixed-order live-query stub, same scheme as the EventDetail suites:
// the section runs exactly two queries (shifts, signups).
let liveSequence: unknown[] = [];
let liveCursor = 0;
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (querier: () => unknown) => {
    if (liveCursor >= liveSequence.length) liveCursor = 0;
    const value = liveSequence[liveCursor];
    liveCursor += 1;
    void querier;
    return value;
  },
}));

vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
    dismissToast: vi.fn(),
    toast: null,
  }),
}));

import "@/i18n";
import { EventShiftsSection } from "./EventShiftsSection";

const NOW = Date.now();
const FUTURE = NOW + 24 * 60 * 60 * 1000;

function makeEvent(over: Partial<Event> = {}): Event {
  return {
    id: "ev_1",
    kind: "event",
    title: "Build day",
    description: "",
    category: "mutual-aid",
    startsAt: FUTURE,
    endsAt: null,
    location: "Community room",
    capacity: null,
    templateId: null,
    createdAt: NOW,
    createdBy: "organizer-key",
    nodeId: "node_test",
    signature: "sig",
    ...over,
  };
}

function makeShift(over: Partial<EventShiftRow> = {}): EventShiftRow {
  return {
    id: "shift_1",
    eventId: "ev_1",
    label: "Setup crew",
    startsAt: FUTURE,
    endsAt: FUTURE + 3 * 60 * 60 * 1000,
    capacity: 4,
    createdBy: "organizer-key",
    createdAt: NOW,
    ...over,
  };
}

function makeSignup(over: Partial<ShiftSignupRow> = {}): ShiftSignupRow {
  return {
    id: `ss_${Math.random().toString(36).slice(2)}`,
    shiftId: "shift_1",
    eventId: "ev_1",
    memberKey: "member-a",
    signedUpAt: NOW,
    ...over,
  };
}

interface RenderProps {
  event?: Event;
  memberKey?: string | null;
  isOrganizer?: boolean;
  isCancelled?: boolean;
  canSeeRoster?: boolean;
  creditHref?: string | null;
  creditProjectTitle?: string | null;
}

let container: HTMLDivElement;
let root: Root;

function renderSection(
  shifts: EventShiftRow[],
  signups: ShiftSignupRow[],
  props: RenderProps = {},
) {
  liveSequence = [shifts, signups];
  liveCursor = 0;
  act(() => {
    root.render(
      <MemoryRouter>
        <EventShiftsSection
          event={props.event ?? makeEvent()}
          memberKey={props.memberKey === undefined ? "viewer-key" : props.memberKey}
          isOrganizer={props.isOrganizer ?? false}
          isCancelled={props.isCancelled ?? false}
          canSeeRoster={props.canSeeRoster ?? false}
          labelFor={(key) => `name:${key}`}
          creditHref={props.creditHref ?? null}
          creditProjectTitle={props.creditProjectTitle ?? null}
        />
      </MemoryRouter>,
    );
  });
}

function click(el: Element | null | undefined) {
  expect(el).toBeTruthy();
  act(() => {
    (el as HTMLElement).dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
  });
}

function buttons(): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll("button"));
}

// Drive a controlled input the way React expects: use the native
// value setter so React's internal value tracker sees the change,
// then dispatch a bubbling input event.
function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;
  act(() => {
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

// Action buttons only — the WhyTooltip principle affordance is also a
// <button>, so "no controls" assertions must not count it.
const ACTION_LABELS = [
  "Sign up",
  "Remove my signup",
  "Add a shift",
  "Add shift",
  "Remove this shift",
];
function actionButtons(): HTMLButtonElement[] {
  return buttons().filter((b) =>
    ACTION_LABELS.includes(b.textContent ?? ""),
  );
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  vi.clearAllMocks();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("EventShiftsSection — §6.4 fill-state copy", () => {
  it("renders open spots as invitation, never deficit", () => {
    renderSection([makeShift({ capacity: 4 })], [makeSignup()]);
    expect(container.textContent).toContain("3 spots open");
    expect(container.textContent).not.toMatch(/only|filled|understaffed/i);
  });

  it("renders an empty shift exactly like a partial one — spots open", () => {
    renderSection([makeShift({ capacity: 2 })], []);
    expect(container.textContent).toContain("2 spots open");
  });

  it("renders the open-signup line for an uncapped shift", () => {
    renderSection([makeShift({ capacity: null })], [makeSignup()]);
    expect(container.textContent).toContain("Open signup — 1 signed up");
  });

  it("renders Full and hides the signup control at the soft cap", () => {
    renderSection(
      [makeShift({ capacity: 1 })],
      [makeSignup({ memberKey: "member-a" })],
    );
    expect(container.textContent).toContain("Full — 1 signed up");
    expect(
      buttons().find((b) => b.textContent === "Sign up"),
    ).toBeUndefined();
    expect(container.textContent).toContain(
      "check with the organizer",
    );
  });

  it("renders the settled register with no controls once the shift passed", () => {
    renderSection(
      [
        makeShift({
          startsAt: NOW - 2 * 60 * 60 * 1000,
          endsAt: NOW - 60 * 60 * 1000,
        }),
      ],
      [makeSignup()],
    );
    expect(container.textContent).toContain("This shift has passed.");
    expect(
      buttons().find((b) => b.textContent === "Sign up"),
    ).toBeUndefined();
  });
});

describe("EventShiftsSection — §6.3 roster tiers", () => {
  it("shows names to a canSeeRoster viewer", () => {
    renderSection(
      [makeShift()],
      [makeSignup({ memberKey: "member-a" })],
      { canSeeRoster: true },
    );
    expect(container.textContent).toContain("name:member-a");
  });

  it("shows the counts-only hint to everyone else", () => {
    renderSection(
      [makeShift()],
      [makeSignup({ memberKey: "member-a" })],
      { canSeeRoster: false },
    );
    expect(container.textContent).not.toContain("name:member-a");
    expect(container.textContent).toContain(
      "Names are visible to the organizer",
    );
  });
});

describe("EventShiftsSection — §6.2 consent card + signup flow", () => {
  it("expands the consent card on tap and signs up on confirm", () => {
    renderSection([makeShift()], []);
    click(buttons().find((b) => b.textContent === "Sign up"));

    // The card names the RSVP coupling and the shame-free exit.
    expect(container.textContent).toContain("RSVPs you");
    expect(container.textContent).toContain("Nobody is notified");
    expect(signUpForShiftMock).not.toHaveBeenCalled();

    click(buttons().find((b) => b.textContent === "Sign up" && b.className.includes("btn-primary")));
    expect(signUpForShiftMock).toHaveBeenCalledWith({
      shiftId: "shift_1",
      memberKey: "viewer-key",
    });
  });

  it("offers remove (not sign up) when the viewer is already on the shift", () => {
    renderSection(
      [makeShift()],
      [makeSignup({ memberKey: "viewer-key" })],
    );
    expect(container.textContent).toContain("You're on this shift");
    const remove = buttons().find(
      (b) => b.textContent === "Remove my signup",
    );
    click(remove);
    expect(removeSignupMock).toHaveBeenCalledWith("shift_1", "viewer-key");
    expect(
      buttons().find((b) => b.textContent === "Sign up"),
    ).toBeUndefined();
  });

  it("hides all controls for a keyless viewer", () => {
    renderSection([makeShift()], [], { memberKey: null });
    expect(actionButtons()).toHaveLength(0);
    expect(container.textContent).toContain("4 spots open");
  });
});

describe("EventShiftsSection — §5.2 lifecycle surfaces", () => {
  it("renders inert on a cancelled event: roster stays, controls gone", () => {
    renderSection(
      [makeShift()],
      [makeSignup({ memberKey: "member-a" })],
      { isCancelled: true, canSeeRoster: true, isOrganizer: true },
    );
    expect(container.textContent).toContain("name:member-a");
    expect(actionButtons()).toHaveLength(0);
  });

  it("renders nothing at all for a member when no shifts exist", () => {
    renderSection([], [], { isOrganizer: false });
    expect(container.textContent).toBe("");
  });

  it("shows the organizer the empty-state invitation and add form", () => {
    renderSection([], [], { isOrganizer: true });
    expect(container.textContent).toContain(
      "Break the day into shifts",
    );
    click(buttons().find((b) => b.textContent === "Add a shift"));
    expect(container.querySelector("form")).toBeTruthy();
    expect(container.textContent).toContain("Spots (optional)");
  });

  it("offers delete only on an empty shift", () => {
    renderSection([makeShift()], [], { isOrganizer: true });
    expect(
      buttons().find((b) => b.textContent === "Remove this shift"),
    ).toBeTruthy();

    renderSection(
      [makeShift()],
      [makeSignup()],
      { isOrganizer: true },
    );
    expect(
      buttons().find((b) => b.textContent === "Remove this shift"),
    ).toBeUndefined();
  });

  it("delete calls the data layer with the organizer key", () => {
    renderSection([makeShift()], [], {
      isOrganizer: true,
      memberKey: "organizer-key",
    });
    click(buttons().find((b) => b.textContent === "Remove this shift"));
    expect(deleteShiftMock).toHaveBeenCalledWith("shift_1", "organizer-key");
  });
});

describe("EventShiftsSection — §11.5 capacity edit (organizer)", () => {
  it("offers the capacity edit to the organizer on an upcoming shift", () => {
    renderSection([makeShift({ capacity: 4 })], [], { isOrganizer: true });
    expect(
      buttons().find((b) => b.textContent === "Edit spots"),
    ).toBeTruthy();
  });

  it("hides it from a non-organizer and on cancelled or passed shifts", () => {
    renderSection([makeShift()], [], { isOrganizer: false });
    expect(
      buttons().find((b) => b.textContent === "Edit spots"),
    ).toBeUndefined();

    renderSection([makeShift()], [], {
      isOrganizer: true,
      isCancelled: true,
    });
    expect(
      buttons().find((b) => b.textContent === "Edit spots"),
    ).toBeUndefined();

    renderSection(
      [
        makeShift({
          startsAt: NOW - 2 * 60 * 60 * 1000,
          endsAt: NOW - 60 * 60 * 1000,
        }),
      ],
      [],
      { isOrganizer: true },
    );
    expect(
      buttons().find((b) => b.textContent === "Edit spots"),
    ).toBeUndefined();
  });

  it("seeds the field from the current cap and saves the parsed number", () => {
    renderSection([makeShift({ capacity: 4 })], [], {
      isOrganizer: true,
      memberKey: "organizer-key",
    });
    click(buttons().find((b) => b.textContent === "Edit spots"));
    const input = container.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement;
    expect(input.value).toBe("4");
    setInputValue(input, "6");
    click(buttons().find((b) => b.textContent === "Save"));
    expect(setShiftCapacityMock).toHaveBeenCalledWith(
      "shift_1",
      6,
      "organizer-key",
    );
  });

  it("clears the cap (null) when the field is emptied", () => {
    renderSection([makeShift({ capacity: 4 })], [], {
      isOrganizer: true,
      memberKey: "organizer-key",
    });
    click(buttons().find((b) => b.textContent === "Edit spots"));
    const input = container.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement;
    setInputValue(input, "");
    click(buttons().find((b) => b.textContent === "Save"));
    expect(setShiftCapacityMock).toHaveBeenCalledWith(
      "shift_1",
      null,
      "organizer-key",
    );
  });

  it("shows the roster floor hint while editing a shift with signups", () => {
    renderSection([makeShift({ capacity: 3 })], [makeSignup(), makeSignup()], {
      isOrganizer: true,
    });
    click(buttons().find((b) => b.textContent === "Edit spots"));
    expect(container.textContent).toContain(
      "2 people signed up — you can't set fewer spots than that.",
    );
  });
});

describe("EventShiftsSection — §9.3 credit bridge (prefill, not plumbing)", () => {
  const passedShift = () =>
    makeShift({
      startsAt: NOW - 3 * 60 * 60 * 1000,
      endsAt: NOW - 60 * 60 * 1000,
    });

  it("offers the project path on a passed work-day shift to a member on it", () => {
    renderSection(
      [passedShift()],
      [makeSignup({ memberKey: "viewer-key" })],
      { creditHref: "/project/p1", creditProjectTitle: "Community Fridge" },
    );
    const link = container.querySelector('a[href="/project/p1"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain("Community Fridge");
  });

  it("offers it to the organizer even when they are not on the shift", () => {
    renderSection([passedShift()], [makeSignup({ memberKey: "member-a" })], {
      isOrganizer: true,
      creditHref: "/project/p1",
      creditProjectTitle: "Community Fridge",
    });
    expect(container.querySelector('a[href="/project/p1"]')).toBeTruthy();
  });

  it("shows nothing to a member who was not on the shift", () => {
    renderSection([passedShift()], [makeSignup({ memberKey: "member-a" })], {
      creditHref: "/project/p1",
      creditProjectTitle: "Community Fridge",
    });
    expect(container.querySelector('a[href="/project/p1"]')).toBeNull();
  });

  it("shows nothing before the shift has passed", () => {
    renderSection(
      [makeShift()],
      [makeSignup({ memberKey: "viewer-key" })],
      { creditHref: "/project/p1", creditProjectTitle: "Community Fridge" },
    );
    expect(container.querySelector('a[href="/project/p1"]')).toBeNull();
  });

  // §14 ruling 1's deferral is now filled by the ADOPTED direct-
  // exchange design (docs/direct-exchange-label.md §6.1): a passed
  // plain-event shift offers the ceremony with FORM-only prefill —
  // the recorded exchange carries a random `direct:` label and
  // nothing event-shaped.
  it("offers the direct-exchange ceremony on a passed plain-event shift to a member on it", () => {
    renderSection(
      [passedShift()],
      [makeSignup({ memberKey: "viewer-key" })],
      { creditHref: null },
    );
    const link = container.querySelector('a[href^="/record-direct"]');
    expect(link).toBeTruthy();
    const href = link!.getAttribute("href")!;
    // Counterparty = the event's creator; the 2h the shift ran and
    // the event's category prefill the FORM only.
    expect(href).toContain("member=organizer-key");
    expect(href).toContain("hours=2");
    expect(href).toContain("category=mutual-aid");
  });

  it("never offers the direct doorway to the event's creator (they co-sign on their own screen)", () => {
    renderSection(
      [passedShift()],
      [makeSignup({ memberKey: "organizer-key" })],
      { creditHref: null, memberKey: "organizer-key", isOrganizer: true },
    );
    expect(container.querySelector('a[href^="/record-direct"]')).toBeNull();
  });

  it("shows no direct doorway to a member who was not on the shift, nor before it has passed", () => {
    renderSection([passedShift()], [makeSignup({ memberKey: "member-a" })], {
      creditHref: null,
    });
    expect(container.querySelector('a[href^="/record-direct"]')).toBeNull();
    renderSection([makeShift()], [makeSignup({ memberKey: "viewer-key" })], {
      creditHref: null,
    });
    expect(container.querySelector('a[href^="/record-direct"]')).toBeNull();
  });

  it("prefers the project path on work-day shifts — the direct doorway is plain-event only", () => {
    renderSection(
      [passedShift()],
      [makeSignup({ memberKey: "viewer-key" })],
      { creditHref: "/project/p1", creditProjectTitle: "Community Fridge" },
    );
    expect(container.querySelector('a[href^="/record-direct"]')).toBeNull();
    expect(container.querySelector('a[href="/project/p1"]')).toBeTruthy();
  });
});

describe("EventShiftsSection — shift .ics export feedback", () => {
  it("downloads the shift file AND toasts its name and purpose", () => {
    // The member is signed up, so their row carries the calendar
    // affordance. A silent download reads as "nothing happened" —
    // the toast names the file and says what to do with it.
    renderSection(
      [makeShift()],
      [makeSignup({ memberKey: "viewer-key" })],
    );
    click(
      buttons().find(
        (b) => b.textContent === "Add this shift to my calendar (.ics)",
      ),
    );
    expect(downloadIcsMock).toHaveBeenCalledTimes(1);
    expect(downloadIcsMock).toHaveBeenCalledWith(
      "setup-crew-build-day.ics",
      expect.stringContaining("BEGIN:VCALENDAR"),
    );
    expect(showToastMock).toHaveBeenCalledWith(
      "Saved setup-crew-build-day.ics — open it to add this shift to your phone's calendar.",
    );
  });
});
