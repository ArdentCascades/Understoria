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
import { CalendarWeek } from "./CalendarWeek";
import {
  WEEK_MS,
  startOfUTCDay,
  startOfUTCWeek,
  type CalendarEntry,
} from "@/lib/calendar";

const MAX_WEEK_OFFSET = 52;

function eventEntry(
  startsAt: number,
  overrides: Partial<Extract<CalendarEntry, { kind: "event" }>> = {},
): CalendarEntry {
  return {
    kind: "event",
    id: `event:${startsAt}`,
    date: startOfUTCDay(startsAt),
    eventId: "ev1",
    title: "Repair Café",
    category: "repair",
    startsAt,
    endsAt: null,
    location: "The library",
    viewerGoing: false,
    organizerKey: "k1",
    path: "/calendar/event/ev1",
    isMultiDay: false,
    dayIndex: 0,
    dayCount: 1,
    ...overrides,
  };
}

// Stateful harness mirroring the page's wiring (`Calendar.tsx`): the
// week offset lives here and is clamped to the paging bounds; the
// component gets the resolved Sunday anchor plus disabled flags, the
// today/date jump callbacks, and the atToday flag.
function WeekHarness({ entries = [] }: { entries?: CalendarEntry[] }) {
  const [offset, setOffset] = useState(0);
  const now = Date.now();
  return (
    <CalendarWeek
      entries={entries}
      anchorMs={startOfUTCWeek(now) + offset * WEEK_MS}
      locale="en"
      onPrevWeek={() => setOffset((o) => Math.max(o - 1, -MAX_WEEK_OFFSET))}
      onNextWeek={() => setOffset((o) => Math.min(o + 1, MAX_WEEK_OFFSET))}
      onJumpToToday={() => setOffset(0)}
      onJumpToDate={(ms) => {
        const target = Math.round(
          (startOfUTCWeek(ms) - startOfUTCWeek(now)) / WEEK_MS,
        );
        setOffset(Math.max(-MAX_WEEK_OFFSET, Math.min(target, MAX_WEEK_OFFSET)));
      }}
      canPrev={offset > -MAX_WEEK_OFFSET}
      canNext={offset < MAX_WEEK_OFFSET}
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

describe("CalendarWeek paging bounds", () => {
  it("steps a week per click and both buttons start enabled", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1))); // Mon Jun 1 → week of May 31
    render(<WeekHarness />);
    expect(navButton(/previous week/i).disabled).toBe(false);
    expect(navButton(/next week/i).disabled).toBe(false);
    expect(container.textContent).toContain("May 31");
    act(() => navButton(/next week/i).click());
    expect(container.textContent).toContain("Jun 7");
  });

  it("clamps forward paging at the bound and disables Next week", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    render(<WeekHarness />);
    for (let i = 0; i < MAX_WEEK_OFFSET + 10; i++) {
      act(() => navButton(/next week/i).click());
    }
    const next = navButton(/next week/i);
    expect(next.disabled).toBe(true);
    expect(next.getAttribute("aria-disabled")).toBe("true");
    // 52 weeks from the week of May 31 2026 → the week of May 30 2027,
    // NOT 62 weeks out.
    expect(container.textContent).toContain("May 30");
    expect(navButton(/previous week/i).disabled).toBe(false);
  });

  it("clamps backward paging at the bound and disables Previous week", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    render(<WeekHarness />);
    for (let i = 0; i < MAX_WEEK_OFFSET + 10; i++) {
      act(() => navButton(/previous week/i).click());
    }
    const prev = navButton(/previous week/i);
    expect(prev.disabled).toBe(true);
    expect(prev.getAttribute("aria-disabled")).toBe("true");
    // 52 weeks back from the week of May 31 2026 → the week of May 31 2025.
    expect(container.textContent).toContain("Jun 1");
    expect(navButton(/next week/i).disabled).toBe(false);
  });
});

describe("CalendarWeek — today jump and week labelling", () => {
  it("shows 'This week' at offset 0 and swaps to a Today jump when paged", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1)));
    render(<WeekHarness />);
    expect(container.textContent).toContain("This week");
    expect(
      Array.from(container.querySelectorAll("button")).some(
        (b) => b.textContent === "Today",
      ),
    ).toBe(false);
    act(() => navButton(/next week/i).click());
    expect(container.textContent).not.toContain("This week");
    act(() => navButton(/^Today$/).click());
    expect(container.textContent).toContain("This week");
    expect(container.textContent).toContain("May 31");
  });

  it("includes the year in the range once the viewed week leaves the current year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 11, 1))); // Dec 2026
    render(<WeekHarness />);
    expect(container.textContent).not.toContain("2026");
    // Page into January — the label must disambiguate the year.
    for (let i = 0; i < 6; i++) {
      act(() => navButton(/next week/i).click());
    }
    expect(container.textContent).toContain("2027");
  });
});

describe("CalendarWeek — event chips carry start times", () => {
  it("prefixes the event chip with its locale-formatted start time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 3))); // Wed Jun 3
    // 14:30 UTC on the viewed Wednesday. The chip formats in the local
    // TZ; vitest runs UTC, so the rendered time is 2:30 PM.
    const startsAt = Date.UTC(2026, 5, 3, 14, 30);
    render(<WeekHarness entries={[eventEntry(startsAt)]} />);
    expect(container.textContent).toContain("2:30");
    expect(container.textContent).toContain("Repair Café");
  });

  it("shows the day position instead of a time on continuation days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 3)));
    const startsAt = Date.UTC(2026, 5, 2, 9, 0); // started yesterday
    render(
      <WeekHarness
        entries={[
          eventEntry(startsAt, {
            date: Date.UTC(2026, 5, 3),
            isMultiDay: true,
            dayIndex: 1,
            dayCount: 3,
          }),
        ]}
      />,
    );
    expect(container.textContent).toContain("2/3");
    expect(container.textContent).not.toContain("9:00");
  });
});

describe("CalendarWeek — quiet weeks", () => {
  it("names a quiet week and jumps to the week of the next scheduled entry", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 3))); // week of May 31
    // Nothing this week; one event three weeks out.
    const startsAt = Date.UTC(2026, 5, 24, 10, 0);
    render(
      <WeekHarness
        entries={[eventEntry(startsAt, { date: Date.UTC(2026, 5, 24) })]}
      />,
    );
    expect(container.textContent).toContain("Nothing scheduled this week");
    const jump = navButton(/Next up: Repair Café/);
    expect(jump.textContent).toContain("Jun 24");
    act(() => jump.click());
    // Now viewing the week of Jun 21–27 — the chip renders, the quiet
    // note is gone.
    expect(container.textContent).toContain("Jun 21");
    expect(container.textContent).not.toContain("Nothing scheduled");
    expect(container.textContent).toContain("Repair Café");
  });

  it("shows the quiet note without a jump when nothing is scheduled ahead", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 3)));
    render(<WeekHarness entries={[]} />);
    expect(container.textContent).toContain("Nothing scheduled this week");
    expect(container.textContent).not.toContain("Next up");
  });

  it("does not count density-only weeks as scheduled", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 3)));
    render(
      <WeekHarness
        entries={[
          {
            kind: "exchange_density",
            id: "d1",
            date: Date.UTC(2026, 5, 3),
            count: 4,
          },
        ]}
      />,
    );
    expect(container.textContent).toContain("Nothing scheduled this week");
  });
});

describe("CalendarWeek — stacked narrow layout", () => {
  it("renders the week twice: a lg-only grid and a below-lg stacked list", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 3)));
    const startsAt = Date.UTC(2026, 5, 3, 14, 30);
    render(<WeekHarness entries={[eventEntry(startsAt)]} />);
    const grid = container.querySelector(".lg\\:grid");
    const stack = container.querySelector("ul.lg\\:hidden");
    expect(grid).not.toBeNull();
    expect(stack).not.toBeNull();
    // Same chip in both layouts; the stacked row uses the full weekday
    // name in its header.
    expect(grid!.textContent).toContain("Repair Café");
    expect(stack!.textContent).toContain("Repair Café");
    expect(stack!.textContent).toContain("Wednesday");
  });
});
