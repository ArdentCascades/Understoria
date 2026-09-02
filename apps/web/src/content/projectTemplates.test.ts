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
  type RecurringCadence,
} from "./projectTemplates";
import { PROJECT_TEMPLATES_ES } from "./projectTemplates.es";
import { PROJECT_TEMPLATES_FR } from "./projectTemplates.fr";
import { PROJECT_TEMPLATES_PT } from "./projectTemplates.pt";
import { PROJECT_TEMPLATES_ZH } from "./projectTemplates.zh";
import { PROJECT_TEMPLATES_HI } from "./projectTemplates.hi";
import { PROJECT_TEMPLATES_VI } from "./projectTemplates.vi";
import { PROJECT_TEMPLATES_RU } from "./projectTemplates.ru";
import { PROJECT_TEMPLATES_AR } from "./projectTemplates.ar";
import { PROJECT_TEMPLATES_BO } from "./projectTemplates.bo";
import { PROJECT_TEMPLATES_UR } from "./projectTemplates.ur";
import { PROJECT_TEMPLATES_ID } from "./projectTemplates.id";
import { PROJECT_TEMPLATES_SW } from "./projectTemplates.sw";

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

  it("ships exactly 64 templates in French", () => {
    expect(PROJECT_TEMPLATES_FR.length).toBe(64);
  });

  it("ships exactly 64 templates in Portuguese", () => {
    expect(PROJECT_TEMPLATES_PT.length).toBe(64);
  });

  it("ships exactly 64 templates in Chinese", () => {
    expect(PROJECT_TEMPLATES_ZH.length).toBe(64);
  });

  it("ships exactly 64 templates in Hindi", () => {
    expect(PROJECT_TEMPLATES_HI.length).toBe(64);
  });

  it("ships exactly 64 templates in Vietnamese", () => {
    expect(PROJECT_TEMPLATES_VI.length).toBe(64);
  });

  it("ships exactly 64 templates in Russian", () => {
    expect(PROJECT_TEMPLATES_RU.length).toBe(64);
  });

  it("ships exactly 64 templates in Arabic", () => {
    expect(PROJECT_TEMPLATES_AR.length).toBe(64);
  });

  it("ships exactly 64 templates in Tibetan", () => {
    expect(PROJECT_TEMPLATES_BO.length).toBe(64);
  });

  it("ships exactly 64 templates in Urdu", () => {
    expect(PROJECT_TEMPLATES_UR.length).toBe(64);
  });

  it("ships exactly 64 templates in Indonesian", () => {
    expect(PROJECT_TEMPLATES_ID.length).toBe(64);
  });

  it("ships exactly 64 templates in Swahili", () => {
    expect(PROJECT_TEMPLATES_SW.length).toBe(64);
  });

  it.each([
    ["es", PROJECT_TEMPLATES_ES] as const,
    ["fr", PROJECT_TEMPLATES_FR] as const,
    ["pt", PROJECT_TEMPLATES_PT] as const,
    ["zh", PROJECT_TEMPLATES_ZH] as const,
    ["hi", PROJECT_TEMPLATES_HI] as const,
    ["vi", PROJECT_TEMPLATES_VI] as const,
    ["ru", PROJECT_TEMPLATES_RU] as const,
    ["ar", PROJECT_TEMPLATES_AR] as const,
    ["bo", PROJECT_TEMPLATES_BO] as const,
    ["ur", PROJECT_TEMPLATES_UR] as const,
    ["id", PROJECT_TEMPLATES_ID] as const,
    ["sw", PROJECT_TEMPLATES_SW] as const,
  ])("en and %s share the same id set in the same order", (_, list) => {
    const enIds = PROJECT_TEMPLATES_EN.map((t) => t.id);
    expect(list.map((t) => t.id)).toEqual(enIds);
  });

  it.each(PROJECT_TEMPLATES_EN.map((t) => [t.id, t] as const))(
    "[%s] default category matches the approved mapping",
    (id, tpl) => {
      expect(tpl.defaultCategory).toBe(EXPECTED_CATEGORY[id]);
    },
  );

  it.each([
    ["es", PROJECT_TEMPLATES_ES] as const,
    ["fr", PROJECT_TEMPLATES_FR] as const,
    ["pt", PROJECT_TEMPLATES_PT] as const,
    ["zh", PROJECT_TEMPLATES_ZH] as const,
    ["hi", PROJECT_TEMPLATES_HI] as const,
    ["vi", PROJECT_TEMPLATES_VI] as const,
    ["ru", PROJECT_TEMPLATES_RU] as const,
    ["ar", PROJECT_TEMPLATES_AR] as const,
    ["bo", PROJECT_TEMPLATES_BO] as const,
    ["ur", PROJECT_TEMPLATES_UR] as const,
    ["id", PROJECT_TEMPLATES_ID] as const,
    ["sw", PROJECT_TEMPLATES_SW] as const,
  ])("%s templates use the same default categories as English", (_, list) => {
    for (const tpl of list) {
      expect(tpl.defaultCategory).toBe(EXPECTED_CATEGORY[tpl.id]);
    }
  });

  it.each([
    ["en", PROJECT_TEMPLATES_EN] as const,
    ["es", PROJECT_TEMPLATES_ES] as const,
    ["fr", PROJECT_TEMPLATES_FR] as const,
    ["pt", PROJECT_TEMPLATES_PT] as const,
    ["zh", PROJECT_TEMPLATES_ZH] as const,
    ["hi", PROJECT_TEMPLATES_HI] as const,
    ["vi", PROJECT_TEMPLATES_VI] as const,
    ["ru", PROJECT_TEMPLATES_RU] as const,
    ["ar", PROJECT_TEMPLATES_AR] as const,
    ["bo", PROJECT_TEMPLATES_BO] as const,
    ["ur", PROJECT_TEMPLATES_UR] as const,
    ["id", PROJECT_TEMPLATES_ID] as const,
    ["sw", PROJECT_TEMPLATES_SW] as const,
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
    ["fr", PROJECT_TEMPLATES_FR] as const,
    ["pt", PROJECT_TEMPLATES_PT] as const,
    ["zh", PROJECT_TEMPLATES_ZH] as const,
    ["hi", PROJECT_TEMPLATES_HI] as const,
    ["vi", PROJECT_TEMPLATES_VI] as const,
    ["ru", PROJECT_TEMPLATES_RU] as const,
    ["ar", PROJECT_TEMPLATES_AR] as const,
    ["bo", PROJECT_TEMPLATES_BO] as const,
    ["ur", PROJECT_TEMPLATES_UR] as const,
    ["id", PROJECT_TEMPLATES_ID] as const,
    ["sw", PROJECT_TEMPLATES_SW] as const,
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
    ["fr", PROJECT_TEMPLATES_FR] as const,
    ["pt", PROJECT_TEMPLATES_PT] as const,
    ["zh", PROJECT_TEMPLATES_ZH] as const,
    ["hi", PROJECT_TEMPLATES_HI] as const,
    ["vi", PROJECT_TEMPLATES_VI] as const,
    ["ru", PROJECT_TEMPLATES_RU] as const,
    ["ar", PROJECT_TEMPLATES_AR] as const,
    ["bo", PROJECT_TEMPLATES_BO] as const,
    ["ur", PROJECT_TEMPLATES_UR] as const,
    ["id", PROJECT_TEMPLATES_ID] as const,
    ["sw", PROJECT_TEMPLATES_SW] as const,
  ])("[%s] sum of task hours per template is positive", (_, list) => {
    for (const tpl of list) {
      const total = tpl.tasks.reduce((s, t) => s + t.hours, 0);
      expect(total).toBeGreaterThan(0);
    }
  });

  it.each([
    ["en", PROJECT_TEMPLATES_EN] as const,
    ["es", PROJECT_TEMPLATES_ES] as const,
    ["fr", PROJECT_TEMPLATES_FR] as const,
    ["pt", PROJECT_TEMPLATES_PT] as const,
    ["zh", PROJECT_TEMPLATES_ZH] as const,
    ["hi", PROJECT_TEMPLATES_HI] as const,
    ["vi", PROJECT_TEMPLATES_VI] as const,
    ["ru", PROJECT_TEMPLATES_RU] as const,
    ["ar", PROJECT_TEMPLATES_AR] as const,
    ["bo", PROJECT_TEMPLATES_BO] as const,
    ["ur", PROJECT_TEMPLATES_UR] as const,
    ["id", PROJECT_TEMPLATES_ID] as const,
    ["sw", PROJECT_TEMPLATES_SW] as const,
  ])("[%s] every recurring task uses a known cadence enum value", (_, list) => {
    for (const tpl of list) {
      for (const task of tpl.tasks) {
        if (task.recurringCadence !== undefined) {
          expect(VALID_CADENCES).toContain(task.recurringCadence);
        }
      }
    }
  });

  it.each([
    ["es", PROJECT_TEMPLATES_ES] as const,
    ["fr", PROJECT_TEMPLATES_FR] as const,
    ["pt", PROJECT_TEMPLATES_PT] as const,
    ["zh", PROJECT_TEMPLATES_ZH] as const,
    ["hi", PROJECT_TEMPLATES_HI] as const,
    ["vi", PROJECT_TEMPLATES_VI] as const,
    ["ru", PROJECT_TEMPLATES_RU] as const,
    ["ar", PROJECT_TEMPLATES_AR] as const,
    ["bo", PROJECT_TEMPLATES_BO] as const,
    ["ur", PROJECT_TEMPLATES_UR] as const,
    ["id", PROJECT_TEMPLATES_ID] as const,
    ["sw", PROJECT_TEMPLATES_SW] as const,
  ])("en and %s templates have matching task counts per id", (code, list) => {
    for (const enTpl of PROJECT_TEMPLATES_EN) {
      const tpl = list.find((t) => t.id === enTpl.id);
      expect(tpl, `Missing ${code} template for ${enTpl.id}`).toBeDefined();
      expect(tpl!.tasks.length).toBe(enTpl.tasks.length);
    }
  });

  it.each([
    ["es", PROJECT_TEMPLATES_ES] as const,
    ["fr", PROJECT_TEMPLATES_FR] as const,
    ["pt", PROJECT_TEMPLATES_PT] as const,
    ["zh", PROJECT_TEMPLATES_ZH] as const,
    ["hi", PROJECT_TEMPLATES_HI] as const,
    ["vi", PROJECT_TEMPLATES_VI] as const,
    ["ru", PROJECT_TEMPLATES_RU] as const,
    ["ar", PROJECT_TEMPLATES_AR] as const,
    ["bo", PROJECT_TEMPLATES_BO] as const,
    ["ur", PROJECT_TEMPLATES_UR] as const,
    ["id", PROJECT_TEMPLATES_ID] as const,
    ["sw", PROJECT_TEMPLATES_SW] as const,
  ])("en and %s recurring-cadence positions match within each template", (_, list) => {
    // Recurring tasks should line up so the cadence-suffix UI is
    // identical in every locale — otherwise one language would tag
    // "recurring" on a different task than the other.
    for (const enTpl of PROJECT_TEMPLATES_EN) {
      const tpl = list.find((t) => t.id === enTpl.id)!;
      for (let i = 0; i < enTpl.tasks.length; i++) {
        expect(tpl.tasks[i].recurringCadence).toBe(
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

  it("returns the French set for 'fr' and fr-* sublocales", () => {
    expect(getProjectTemplates("fr")).toBe(PROJECT_TEMPLATES_FR);
    expect(getProjectTemplates("fr-CA")).toBe(PROJECT_TEMPLATES_FR);
  });

  it("returns the Portuguese set for 'pt' and pt-* sublocales", () => {
    expect(getProjectTemplates("pt")).toBe(PROJECT_TEMPLATES_PT);
    expect(getProjectTemplates("pt-BR")).toBe(PROJECT_TEMPLATES_PT);
  });

  it("returns the Chinese set for 'zh' and zh-* sublocales", () => {
    expect(getProjectTemplates("zh")).toBe(PROJECT_TEMPLATES_ZH);
    expect(getProjectTemplates("hi")).toBe(PROJECT_TEMPLATES_HI);
    expect(getProjectTemplates("vi")).toBe(PROJECT_TEMPLATES_VI);
    expect(getProjectTemplates("ru")).toBe(PROJECT_TEMPLATES_RU);
    expect(getProjectTemplates("ar")).toBe(PROJECT_TEMPLATES_AR);
    expect(getProjectTemplates("bo")).toBe(PROJECT_TEMPLATES_BO);
    expect(getProjectTemplates("ur")).toBe(PROJECT_TEMPLATES_UR);
    expect(getProjectTemplates("id")).toBe(PROJECT_TEMPLATES_ID);
    expect(getProjectTemplates("sw")).toBe(PROJECT_TEMPLATES_SW);
    expect(getProjectTemplates("zh-CN")).toBe(PROJECT_TEMPLATES_ZH);
  });

  it("returns the English set for 'en'", () => {
    expect(getProjectTemplates("en")).toBe(PROJECT_TEMPLATES_EN);
  });

  it("falls back to English for an unknown locale", () => {
    expect(getProjectTemplates("xx")).toBe(PROJECT_TEMPLATES_EN);
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
  ["FR", PROJECT_TEMPLATES_FR],
  ["PT", PROJECT_TEMPLATES_PT],
  ["ZH", PROJECT_TEMPLATES_ZH],
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
  ["FR", PROJECT_TEMPLATES_FR],
  ["PT", PROJECT_TEMPLATES_PT],
  ["ZH", PROJECT_TEMPLATES_ZH],
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

it("pairsWith and learnMore are locale-invariant across translations", () => {
  for (const list of [PROJECT_TEMPLATES_ES, PROJECT_TEMPLATES_FR, PROJECT_TEMPLATES_PT, PROJECT_TEMPLATES_ZH]) {
    for (const enTpl of PROJECT_TEMPLATES_EN) {
      const tpl = list.find((t) => t.id === enTpl.id)!;
      expect(tpl.pairsWith).toEqual(enTpl.pairsWith);
      expect(tpl.learnMore).toEqual(enTpl.learnMore);
    }
  }
});
