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
import { WEEK_MS, startOfUTCWeek } from "@/lib/calendar";

const MAX_WEEK_OFFSET = 52;

// Stateful harness mirroring the page's wiring (`Calendar.tsx`): the
// week offset lives here and is clamped to the paging bounds; the
// component gets the resolved Sunday anchor plus disabled flags.
function WeekHarness() {
  const [offset, setOffset] = useState(0);
  const now = Date.now();
  return (
    <CalendarWeek
      entries={[]}
      anchorMs={startOfUTCWeek(now) + offset * WEEK_MS}
      locale="en"
      onPrevWeek={() => setOffset((o) => Math.max(o - 1, -MAX_WEEK_OFFSET))}
      onNextWeek={() => setOffset((o) => Math.min(o + 1, MAX_WEEK_OFFSET))}
      canPrev={offset > -MAX_WEEK_OFFSET}
      canNext={offset < MAX_WEEK_OFFSET}
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
