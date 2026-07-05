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
import { describe, expect, it } from "vitest";
import {
  getProjectTemplates,
  getTemplate,
  PROJECT_TEMPLATES_EN,
  PROJECT_TEMPLATES_ES,
  type RecurringCadence,
} from "./projectTemplates";

// Canonical category mapping per the design decision. If you change a
// template's defaultCategory and don't update this map, the test will
// flag it — keeping content drift visible.
const EXPECTED_CATEGORY: Record<string, string> = {
  "community-fridge": "food",
  "community-garden": "food",
  "tool-lending-library": "skilled_labor",
  "neighborhood-care-network": "emotional_support",
  "emergency-preparedness": "other",
  "free-store": "other",
  "skill-share": "education",
  "bulk-buying-coop": "food",
  "repair-cafe": "skilled_labor",
  "rides-transportation": "transport",
  // Set 2
  "tenant-union": "organizing",
  "childcare-collective": "childcare",
  "community-composting": "infrastructure",
  "free-little-library": "education",
  "community-first-aid-training": "education",
  "time-bank": "organizing",
  "solidarity-fund": "mutual_aid_drive",
  "diaper-hygiene-bank": "mutual_aid_drive",
  "community-bike-workshop": "transport",
  "newcomer-translation-network": "other",
  // Set 3
  "community-meal": "food",
  "seed-library": "food",
  "digital-literacy": "education",
  "weatherization-brigade": "skilled_labor",
  "pet-food-bank": "mutual_aid_drive",
  "youth-mentorship": "education",
  "gleaning-network": "food",
  "community-mediation": "other",
  "reentry-support": "other",
  "community-wood-bank": "infrastructure",
  // Set 4
  "community-wifi-mesh": "infrastructure",
  "mental-health-peer-support": "emotional_support",
  "community-cleanup": "infrastructure",
  "free-tax-prep": "other",
  "community-market": "food",
  "welcome-wagon": "other",
  "library-of-things": "other",
  "laundry-shower-access": "other",
  "voter-registration": "organizing",
  "health-navigation": "other",
  // Set 5
  "toy-library": "childcare",
  "food-preservation": "food",
  "free-haircut": "other",
  "mutual-aid-moving-crew": "transport",
  "disability-support-network": "organizing",
  "books-to-prisoners": "education",
  "community-music": "education",
  "school-supply-program": "mutual_aid_drive",
  "legal-aid-clinic": "other",
  "resource-hub-dispatch": "organizing",
};

const VALID_CADENCES: readonly RecurringCadence[] = [
  "session",
  "month",
  "event",
  "cycle",
];

describe("projectTemplates", () => {
  it("ships exactly 50 templates in English", () => {
    expect(PROJECT_TEMPLATES_EN.length).toBe(50);
  });

  it("ships exactly 50 templates in Spanish", () => {
    expect(PROJECT_TEMPLATES_ES.length).toBe(50);
  });

  it("en and es share the same id set in the same order", () => {
    const enIds = PROJECT_TEMPLATES_EN.map((t) => t.id);
    const esIds = PROJECT_TEMPLATES_ES.map((t) => t.id);
    expect(esIds).toEqual(enIds);
  });

  it.each(PROJECT_TEMPLATES_EN.map((t) => [t.id, t] as const))(
    "[%s] default category matches the approved mapping",
    (id, tpl) => {
      expect(tpl.defaultCategory).toBe(EXPECTED_CATEGORY[id]);
    },
  );

  it("Spanish templates use the same default categories as English", () => {
    for (const esTpl of PROJECT_TEMPLATES_ES) {
      expect(esTpl.defaultCategory).toBe(EXPECTED_CATEGORY[esTpl.id]);
    }
  });

  it.each([
    ["en", PROJECT_TEMPLATES_EN] as const,
    ["es", PROJECT_TEMPLATES_ES] as const,
  ])("[%s] every template has non-empty copy and at least one task", (_, list) => {
    for (const tpl of list) {
      expect(tpl.name.length).toBeGreaterThan(0);
      expect(tpl.purpose.length).toBeGreaterThan(0);
      expect(tpl.whoItServes.length).toBeGreaterThan(0);
      expect(tpl.whatYoullNeed.length).toBeGreaterThan(0);
      expect(tpl.tasks.length).toBeGreaterThan(0);
    }
  });

  it.each([
    ["en", PROJECT_TEMPLATES_EN] as const,
    ["es", PROJECT_TEMPLATES_ES] as const,
  ])("[%s] every task has positive hours and non-empty copy", (_, list) => {
    for (const tpl of list) {
      for (const task of tpl.tasks) {
        expect(task.name.length).toBeGreaterThan(0);
        expect(task.description.length).toBeGreaterThan(0);
        expect(task.hours).toBeGreaterThan(0);
      }
    }
  });

  it.each([
    ["en", PROJECT_TEMPLATES_EN] as const,
    ["es", PROJECT_TEMPLATES_ES] as const,
  ])("[%s] sum of task hours per template is positive", (_, list) => {
    for (const tpl of list) {
      const total = tpl.tasks.reduce((s, t) => s + t.hours, 0);
      expect(total).toBeGreaterThan(0);
    }
  });

  it.each([
    ["en", PROJECT_TEMPLATES_EN] as const,
    ["es", PROJECT_TEMPLATES_ES] as const,
  ])("[%s] every recurring task uses a known cadence enum value", (_, list) => {
    for (const tpl of list) {
      for (const task of tpl.tasks) {
        if (task.recurringCadence !== undefined) {
          expect(VALID_CADENCES).toContain(task.recurringCadence);
        }
      }
    }
  });

  it("en and es templates have matching task counts per id", () => {
    for (const enTpl of PROJECT_TEMPLATES_EN) {
      const esTpl = PROJECT_TEMPLATES_ES.find((t) => t.id === enTpl.id);
      expect(esTpl, `Missing Spanish template for ${enTpl.id}`).toBeDefined();
      expect(esTpl!.tasks.length).toBe(enTpl.tasks.length);
    }
  });

  it("en and es recurring-cadence positions match within each template", () => {
    // Recurring tasks should line up so the cadence-suffix UI is
    // identical in both locales — otherwise one language would tag
    // "recurring" on a different task than the other.
    for (const enTpl of PROJECT_TEMPLATES_EN) {
      const esTpl = PROJECT_TEMPLATES_ES.find((t) => t.id === enTpl.id)!;
      for (let i = 0; i < enTpl.tasks.length; i++) {
        expect(esTpl.tasks[i].recurringCadence).toBe(
          enTpl.tasks[i].recurringCadence,
        );
      }
    }
  });
});

describe("getProjectTemplates", () => {
  it("returns the Spanish set for 'es'", () => {
    expect(getProjectTemplates("es")).toBe(PROJECT_TEMPLATES_ES);
  });

  it("returns the Spanish set for an es-* sublocale", () => {
    expect(getProjectTemplates("es-MX")).toBe(PROJECT_TEMPLATES_ES);
  });

  it("returns the English set for 'en'", () => {
    expect(getProjectTemplates("en")).toBe(PROJECT_TEMPLATES_EN);
  });

  it("falls back to English for an unknown locale", () => {
    expect(getProjectTemplates("zh-CN")).toBe(PROJECT_TEMPLATES_EN);
  });
});

describe("getTemplate", () => {
  it("returns the matching template by id", () => {
    const tpl = getTemplate("community-fridge", "en");
    expect(tpl?.id).toBe("community-fridge");
  });

  it("returns the locale-appropriate variant", () => {
    const en = getTemplate("community-fridge", "en");
    const es = getTemplate("community-fridge", "es");
    expect(en?.name).not.toBe(es?.name);
  });

  it("returns undefined for an unknown id", () => {
    expect(getTemplate("does-not-exist", "en")).toBeUndefined();
  });
});

// Structural invariant on the NEW `follows` field: every entry must
// reference a strictly earlier task in the same template.
// createProjectWithTasks throws on a violation at project-creation
// time — this moves that discovery to CI, where a content author sees
// it, instead of to a member's create button.
describe.each([
  ["EN", PROJECT_TEMPLATES_EN],
  ["ES", PROJECT_TEMPLATES_ES],
] as const)("template follows invariant (%s)", (_locale, templates) => {
  it("every follows entry references a strictly earlier task", () => {
    for (const tpl of templates) {
      tpl.tasks.forEach((task, i) => {
        for (const dep of task.follows ?? []) {
          expect(
            Number.isInteger(dep) && dep >= 0 && dep < i,
            `${tpl.id} task ${i} ("${task.name}") follows invalid index ${dep}`,
          ).toBe(true);
        }
      });
    }
  });
});
