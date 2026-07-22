import { describe, expect, it } from "vitest";
import {
  formatQuickTime,
  formatQuickWeekday,
  quickDays,
  quickTimes,
} from "./eventQuickPick";

describe("quickDays", () => {
  it("returns today, tomorrow, and the upcoming Saturday midweek", () => {
    // Tuesday 2026-07-21.
    const days = quickDays(new Date(2026, 6, 21, 17, 30));
    expect(days).toEqual([
      { id: "today", date: "2026-07-21" },
      { id: "tomorrow", date: "2026-07-22" },
      { id: "weekend", date: "2026-07-25" },
    ]);
  });

  it("drops the weekend chip when Saturday is tomorrow (Friday)", () => {
    const days = quickDays(new Date(2026, 6, 24, 9, 0));
    expect(days.map((d) => d.id)).toEqual(["today", "tomorrow"]);
    expect(days[1].date).toBe("2026-07-25");
  });

  it("drops the weekend chip when Saturday is today", () => {
    const days = quickDays(new Date(2026, 6, 25, 9, 0));
    expect(days.map((d) => d.id)).toEqual(["today", "tomorrow"]);
  });

  it("keeps the weekend chip on Sunday (next Saturday, not yesterday)", () => {
    const days = quickDays(new Date(2026, 6, 26, 9, 0));
    expect(days[2]).toEqual({ id: "weekend", date: "2026-08-01" });
  });

  it("rolls tomorrow across month and year ends", () => {
    expect(quickDays(new Date(2026, 6, 31))[1].date).toBe("2026-08-01");
    expect(quickDays(new Date(2026, 11, 31))[1].date).toBe("2027-01-01");
  });
});

describe("quickTimes", () => {
  it("is the fixed morning/midday/evening trio in input format", () => {
    expect(quickTimes()).toEqual([
      { id: "morning", time: "09:00" },
      { id: "midday", time: "12:00" },
      { id: "evening", time: "18:00" },
    ]);
  });
});

describe("labels", () => {
  it("formats chip times per locale", () => {
    expect(formatQuickTime("18:00", "en")).toMatch(/6:00\s?PM/i);
    expect(formatQuickTime("18:00", "es")).toContain("18:00");
  });

  it("formats the weekend chip's weekday per locale", () => {
    expect(formatQuickWeekday("2026-07-25", "en").toLowerCase()).toContain(
      "sat",
    );
    expect(formatQuickWeekday("2026-07-25", "es").toLowerCase()).toContain(
      "sáb",
    );
  });
});
