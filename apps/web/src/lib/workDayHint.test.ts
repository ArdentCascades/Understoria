/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  projectSuggestsWorkDays,
  shouldShowWorkDayHint,
} from "./workDayHint";

const BASE = {
  templateId: "community-garden", // flagged rota-shaped
  upcomingWorkDays: 0,
  canSchedule: true,
  dismissed: false,
};

describe("projectSuggestsWorkDays", () => {
  it("is true for a rota-shaped template and false otherwise", () => {
    expect(projectSuggestsWorkDays("community-garden")).toBe(true);
    // skill-share is deliberately unflagged (sessions, not rotas that
    // need many hands at once).
    expect(projectSuggestsWorkDays("skill-share")).toBe(false);
    expect(projectSuggestsWorkDays("does-not-exist")).toBe(false);
    expect(projectSuggestsWorkDays(null)).toBe(false);
  });
});

describe("shouldShowWorkDayHint — every bound is load-bearing", () => {
  it("shows for the organizer of a fresh rota-shaped template project", () => {
    expect(shouldShowWorkDayHint(BASE)).toBe(true);
  });

  it("never shows to non-organizers", () => {
    expect(shouldShowWorkDayHint({ ...BASE, canSchedule: false })).toBe(false);
  });

  it("retires itself once a work day exists", () => {
    expect(shouldShowWorkDayHint({ ...BASE, upcomingWorkDays: 1 })).toBe(false);
  });

  it("stays dismissed forever", () => {
    expect(shouldShowWorkDayHint({ ...BASE, dismissed: true })).toBe(false);
  });

  it("never shows for from-scratch or unflagged-template projects", () => {
    expect(shouldShowWorkDayHint({ ...BASE, templateId: null })).toBe(false);
    expect(
      shouldShowWorkDayHint({ ...BASE, templateId: "skill-share" }),
    ).toBe(false);
  });
});
