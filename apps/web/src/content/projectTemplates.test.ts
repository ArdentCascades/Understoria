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
  "harm-reduction-supplies": "other",
  "court-support": "other",
  "cooling-warming-center": "other",
  "community-oral-history": "education",
  "community-fridge": "food",
  "community-garden": "food",
  "tool-lending-library": "infrastructure",
  "neighborhood-care-network": "emotional_support",
  "emergency-preparedness": "organizing",
  "free-store": "mutual_aid_drive",
  "skill-share": "education",
  "bulk-buying-coop": "food",
  "repair-cafe": "skilled_labor",
  "rides-transportation": "transport",
  // Set 2
  "tenant-union": "housing",
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
  "digital-literacy": "tech",
  "weatherization-brigade": "housing",
  "pet-food-bank": "mutual_aid_drive",
  "youth-mentorship": "education",
  "gleaning-network": "food",
  "community-mediation": "other",
  "reentry-support": "other",
  "community-wood-bank": "mutual_aid_drive",
  // Set 4
  "community-wifi-mesh": "tech",
  "mental-health-peer-support": "emotional_support",
  "community-cleanup": "infrastructure",
  "free-tax-prep": "skilled_labor",
  "community-market": "food",
  "welcome-wagon": "emotional_support",
  "library-of-things": "infrastructure",
  "laundry-shower-access": "infrastructure",
  "voter-registration": "organizing",
  "health-navigation": "other",
  // Set 5
  "toy-library": "childcare",
  "food-preservation": "food",
  "free-haircut": "skilled_labor",
  "mutual-aid-moving-crew": "transport",
  "disability-support-network": "organizing",
  "books-to-prisoners": "education",
  "community-music": "education",
  "school-supply-program": "mutual_aid_drive",
  "legal-aid-clinic": "other",
  "resource-hub-dispatch": "organizing",
  // Set 6
  "community-solar-coop": "infrastructure",
  "worker-coop-incubator": "education",
  "elder-meal-delivery": "food",
  "disaster-relief-hub": "organizing",
  "recovery-peer-support": "emotional_support",
  "community-fitness": "other",
  "urban-orchard": "food",
  "new-parent-support": "childcare",
  "foster-kinship-support": "childcare",
  "weather-survival-outreach": "mutual_aid_drive",
};

const VALID_CADENCES: readonly RecurringCadence[] = [
  "session",
  "month",
  "event",
  "cycle",
];

describe("projectTemplates", () => {
  it("ships exactly 64 templates in English", () => {
    expect(PROJECT_TEMPLATES_EN.length).toBe(64);
  });

  it("ships exactly 64 templates in Spanish", () => {
    expect(PROJECT_TEMPLATES_ES.length).toBe(64);
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

// The context pass: firstSteps / commonPitfalls prose in both
// locales, plus locale-INVARIANT pairsWith (template ids) and
// learnMore (FAQ entry ids). Structure is CI-pinned so a content
// edit can't strand a dangling reference or silently drop a locale.
import { FAQ_SECTIONS } from "./faq";

const FAQ_ENTRY_IDS = new Set(
  FAQ_SECTIONS.flatMap((s) => s.entries.map((e) => e.id)),
);

describe.each([
  ["EN", PROJECT_TEMPLATES_EN],
  ["ES", PROJECT_TEMPLATES_ES],
] as const)("template context fields (%s)", (_locale, templates) => {
  const idsInLocale = new Set(templates.map((t) => t.id));

  it("every template carries non-empty firstSteps and commonPitfalls", () => {
    for (const tpl of templates) {
      expect(
        (tpl.firstSteps ?? "").trim().length,
        `${tpl.id} firstSteps`,
      ).toBeGreaterThan(0);
      expect(
        (tpl.commonPitfalls ?? "").trim().length,
        `${tpl.id} commonPitfalls`,
      ).toBeGreaterThan(0);
    }
  });

  it("pairsWith references existing templates and never itself", () => {
    for (const tpl of templates) {
      const pairs = tpl.pairsWith ?? [];
      expect(pairs.length, `${tpl.id} pairsWith count`).toBeGreaterThan(0);
      expect(pairs.length).toBeLessThanOrEqual(3);
      for (const pid of pairs) {
        expect(idsInLocale.has(pid), `${tpl.id} → unknown ${pid}`).toBe(true);
        expect(pid, `${tpl.id} self-reference`).not.toBe(tpl.id);
      }
    }
  });

  it("learnMore points only at real FAQ entry ids", () => {
    for (const tpl of templates) {
      for (const faqId of tpl.learnMore ?? []) {
        expect(
          FAQ_ENTRY_IDS.has(faqId),
          `${tpl.id} → unknown FAQ id ${faqId}`,
        ).toBe(true);
      }
      expect((tpl.learnMore ?? []).length).toBeLessThanOrEqual(2);
    }
  });
});

it("pairsWith and learnMore are locale-invariant (identical EN/ES)", () => {
  for (const enTpl of PROJECT_TEMPLATES_EN) {
    const esTpl = PROJECT_TEMPLATES_ES.find((t) => t.id === enTpl.id)!;
    expect(esTpl.pairsWith).toEqual(enTpl.pairsWith);
    expect(esTpl.learnMore).toEqual(enTpl.learnMore);
  }
});
