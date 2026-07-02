/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `i18n/index.ts` runs side-effects on import; importing it once brings
// the locale resources in so `useTranslation()` returns real strings.
import "@/i18n";
import { CalendarMonth } from "./CalendarMonth";
import {
  addUTCMonths,
  buildCalendar,
  calendarViewWindow,
} from "@/lib/calendar";
import type { Event } from "@/types";

const DAY = 24 * 60 * 60 * 1000;
const MAX_MONTH_OFFSET = 12;

function makeEvent(
  over: Partial<Event> & { id: string; startsAt: number },
): Event {
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

// Stateful harness mirroring the page's wiring (`Calendar.tsx`): the
// offset lives here, the entries window follows the viewed month via
// `calendarViewWindow`, and the paged anchor is `addUTCMonths`.
function MonthHarness({ events = [] }: { events?: Event[] }) {
  const [offset, setOffset] = useState(0);
  const now = Date.now();
  const { windowStart, windowEnd } = calendarViewWindow({
    now,
    defaultStart: now - 30 * DAY,
    defaultEnd: now + 60 * DAY,
    view: "month",
    offset,
  });
  const entries = buildCalendar({
    projects: [],
    posts: [],
    exchanges: [],
    events,
    windowStart,
    windowEnd,
  });
  return (
    <CalendarMonth
      entries={entries}
      anchorMs={addUTCMonths(now, offset)}
      locale="en"
      onPrevMonth={() => setOffset((o) => Math.max(o - 1, -MAX_MONTH_OFFSET))}
      onNextMonth={() => setOffset((o) => Math.min(o + 1, MAX_MONTH_OFFSET))}
      onJumpToToday={() => setOffset(0)}
      canPrev={offset > -MAX_MONTH_OFFSET}
      canNext={offset < MAX_MONTH_OFFSET}
      atToday={offset === 0}
    />
  );
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.useRealTimers();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

function navButton(label: RegExp): HTMLButtonElement {
  const btn = Array.from(
    container.querySelectorAll<HTMLButtonElement>("button"),
  ).find((b) => label.test(b.getAttribute("aria-label") ?? b.textContent ?? ""));
  if (!btn) throw new Error(`No button matching ${label}`);
  return btn;
}

describe("CalendarMonth paging", () => {
  it("renders the next month's grid after clicking Next month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    render(<MonthHarness />);
    expect(container.textContent).toContain("June 2026");
    act(() => navButton(/next month/i).click());
    expect(container.textContent).toContain("July 2026");
    expect(container.textContent).not.toContain("June 2026");
  });

  it("shows an event in a paged-ahead month that the default window hid", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    // ~101 days out — well past the default 60-day forward window.
    const far = makeEvent({
      id: "far",
      title: "Autumn build day",
      startsAt: Date.UTC(2026, 8, 10, 18, 0, 0),
    });
    render(<MonthHarness events={[far]} />);
    expect(container.querySelector('a[href="/events/far"]')).toBeNull();
    const next = navButton(/next month/i);
    act(() => next.click());
    act(() => next.click());
    act(() => next.click());
    expect(container.textContent).toContain("September 2026");
    expect(container.querySelector('a[href="/events/far"]')).not.toBeNull();
  });

  it("does not mark any cell as today on a month that doesn't contain it", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 15)));
    render(<MonthHarness />);
    expect(container.querySelector('[aria-current="date"]')).not.toBeNull();
    const next = navButton(/next month/i);
    // Two months ahead — August's grid (Jul 26 – Sep 5) can't contain
    // June 15, so no cell may claim aria-current.
    act(() => next.click());
    act(() => next.click());
    expect(container.textContent).toContain("August 2026");
    expect(container.querySelector('[aria-current="date"]')).toBeNull();
  });

  it("Today button appears only when paged, and resets to the current month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    render(<MonthHarness />);
    const todayAtStart = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => (b.textContent ?? "").trim() === "Today");
    expect(todayAtStart).toBeUndefined();
    act(() => navButton(/next month/i).click());
    act(() => navButton(/next month/i).click());
    expect(container.textContent).toContain("August 2026");
    const today = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => (b.textContent ?? "").trim() === "Today");
    expect(today).toBeDefined();
    act(() => today!.click());
    expect(container.textContent).toContain("June 2026");
  });

  it("clamps at ±12 months and disables the button at the bound", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    render(<MonthHarness />);
    for (let i = 0; i < MAX_MONTH_OFFSET + 5; i++) {
      act(() => navButton(/next month/i).click());
    }
    // 12 months from June 2026 — clamped, not 17.
    expect(container.textContent).toContain("June 2027");
    expect(navButton(/next month/i).disabled).toBe(true);
    expect(navButton(/next month/i).getAttribute("aria-disabled")).toBe("true");
    expect(navButton(/previous month/i).disabled).toBe(false);
  });
});
