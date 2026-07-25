/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Drill-card coverage lock: every DRILLS entry must have complete
 * copy in BOTH locales (title, body, step1..N — the DrillCard
 * renders exactly these keys), and the drills the resilience docs
 * promise must exist with the right step counts. A drill added to
 * DRILLS without its i18n block would render raw key names on the
 * Infrastructure page; a drill promised by a plan but missing from
 * DRILLS would silently not exist. Both now fail here instead.
 */
import { describe, expect, it } from "vitest";
import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import { DRILLS } from "./Infrastructure";

type DrillCopy = Record<string, Record<string, string>>;

const locales: Array<[string, DrillCopy]> = [
  ["en", (en as { infra: { drills: DrillCopy } }).infra.drills],
  ["es", (es as { infra: { drills: DrillCopy } }).infra.drills],
];

describe("Infrastructure drills", () => {
  it("includes the four drills the resilience docs promise", () => {
    const byId = Object.fromEntries(DRILLS.map((d) => [d.id, d]));
    expect(byId.stormHub).toBeDefined();
    expect(byId.reseed).toBeDefined();
    expect(byId.flashDrive).toBeDefined();
    // The seizure drill (docs/node-seizure-plan.md §5.1): seven
    // steps, anchored to the operator-guide runbook.
    expect(byId.seizure?.steps).toBe(7);
    expect(byId.seizure?.docRef).toContain("operator-guide.md");
  });

  it.each(locales)(
    "every drill card has complete %s copy for every step it renders",
    (_locale, drills) => {
      for (const drill of DRILLS) {
        const copy = drills[drill.id];
        expect(copy, `missing drills.${drill.id} block`).toBeDefined();
        expect(copy.title).toBeTruthy();
        expect(copy.body).toBeTruthy();
        for (let i = 1; i <= drill.steps; i++) {
          expect(
            copy[`step${i}`],
            `missing drills.${drill.id}.step${i}`,
          ).toBeTruthy();
        }
        // And no orphaned extra steps the card would never render.
        expect(
          copy[`step${drill.steps + 1}`],
          `drills.${drill.id} has step${drill.steps + 1} but DRILLS says ${drill.steps} steps`,
        ).toBeUndefined();
      }
    },
  );
});
