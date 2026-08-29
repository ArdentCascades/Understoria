/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  EVENT_CATEGORY_IDS,
  EVENT_TEMPLATES_EN,
  getEventTemplate,
  getEventTemplates,
  type EventTemplate,
} from "./eventTemplates";
import { EVENT_TEMPLATES_ES } from "./eventTemplates.es";
import { EVENT_TEMPLATES_FR } from "./eventTemplates.fr";
import { EVENT_TEMPLATES_PT } from "./eventTemplates.pt";
import { EVENT_TEMPLATES_ZH } from "./eventTemplates.zh";
import { EVENT_TEMPLATES_HI } from "./eventTemplates.hi";
import { EVENT_TEMPLATES_VI } from "./eventTemplates.vi";
import { EVENT_TEMPLATES_RU } from "./eventTemplates.ru";
import { EVENT_TEMPLATES_AR } from "./eventTemplates.ar";
import { EVENT_TEMPLATES_BO } from "./eventTemplates.bo";
import { PROJECT_CATEGORY_META } from "@/lib/categories";

// Every category a template may use: the new event-specific strings plus
// any legacy / project category (organizing, skilled_labor, etc.).
const ALLOWED_CATEGORIES = new Set<string>([
  ...EVENT_CATEGORY_IDS,
  ...Object.keys(PROJECT_CATEGORY_META),
]);

const BOTH: Array<[string, readonly EventTemplate[]]> = [
  ["en", EVENT_TEMPLATES_EN],
  ["es", EVENT_TEMPLATES_ES],
  ["fr", EVENT_TEMPLATES_FR],
  ["pt", EVENT_TEMPLATES_PT],
  ["zh", EVENT_TEMPLATES_ZH],
  ["hi", EVENT_TEMPLATES_HI],
  ["vi", EVENT_TEMPLATES_VI],
  ["ru", EVENT_TEMPLATES_RU],
  ["ar", EVENT_TEMPLATES_AR],
  ["bo", EVENT_TEMPLATES_BO],
];

describe("eventTemplates — vocabulary", () => {
  it("exposes exactly the three event-category ids", () => {
    expect([...EVENT_CATEGORY_IDS]).toEqual([
      "social",
      "celebration",
      "learning",
    ]);
  });
});

describe("eventTemplates — set shape and parity", () => {
  it("ships 14 templates in each locale", () => {
    expect(EVENT_TEMPLATES_EN).toHaveLength(14);
    expect(EVENT_TEMPLATES_ES).toHaveLength(14);
    expect(EVENT_TEMPLATES_FR).toHaveLength(14);
    expect(EVENT_TEMPLATES_PT).toHaveLength(14);
    expect(EVENT_TEMPLATES_ZH).toHaveLength(14);
  });

  it.each([
    ["es", EVENT_TEMPLATES_ES] as const,
    ["fr", EVENT_TEMPLATES_FR] as const,
    ["pt", EVENT_TEMPLATES_PT] as const,
    ["zh", EVENT_TEMPLATES_ZH] as const,
    ["hi", EVENT_TEMPLATES_HI] as const,
    ["vi", EVENT_TEMPLATES_VI] as const,
    ["ru", EVENT_TEMPLATES_RU] as const,
    ["ar", EVENT_TEMPLATES_AR] as const,
    ["bo", EVENT_TEMPLATES_BO] as const,
  ])("en and %s share the same id set in the same order", (_, set) => {
    expect(set.map((t) => t.id)).toEqual(EVENT_TEMPLATES_EN.map((t) => t.id));
  });

  it("leads with social templates and ends with the functional four", () => {
    // The array order is the gallery order — social-first is intentional.
    expect(EVENT_TEMPLATES_EN[0].id).toBe("potluck");
    expect(EVENT_TEMPLATES_EN.slice(-4).map((t) => t.id)).toEqual([
      "work-day",
      "repair-cafe",
      "care-circle",
      "meeting",
    ]);
  });

  it.each(BOTH)("every %s template has non-empty copy and a valid duration", (_locale, set) => {
    for (const t of set) {
      expect(t.id.trim()).not.toBe("");
      expect(t.name.trim()).not.toBe("");
      expect(t.emoji.trim()).not.toBe("");
      expect(t.titleScaffold.trim()).not.toBe("");
      expect(t.descriptionScaffold.trim()).not.toBe("");
      expect(t.blurb.trim()).not.toBe("");
      expect(Number.isInteger(t.suggestedDurationMinutes)).toBe(true);
      expect(t.suggestedDurationMinutes).toBeGreaterThan(0);
    }
  });

  it.each([
    ["es", EVENT_TEMPLATES_ES] as const,
    ["fr", EVENT_TEMPLATES_FR] as const,
    ["pt", EVENT_TEMPLATES_PT] as const,
    ["zh", EVENT_TEMPLATES_ZH] as const,
    ["hi", EVENT_TEMPLATES_HI] as const,
    ["vi", EVENT_TEMPLATES_VI] as const,
    ["ru", EVENT_TEMPLATES_RU] as const,
    ["ar", EVENT_TEMPLATES_AR] as const,
    ["bo", EVENT_TEMPLATES_BO] as const,
  ])("keeps locale-invariant fields identical across en and %s", (_, set) => {
    const byId = new Map(set.map((t) => [t.id, t]));
    for (const en of EVENT_TEMPLATES_EN) {
      const tr = byId.get(en.id);
      expect(tr).toBeDefined();
      expect(tr!.category).toBe(en.category);
      expect(tr!.emoji).toBe(en.emoji);
      expect(tr!.suggestedDurationMinutes).toBe(en.suggestedDurationMinutes);
    }
  });

  it.each(BOTH)("every %s template uses an allowed category", (_locale, set) => {
    for (const t of set) {
      expect(ALLOWED_CATEGORIES.has(t.category)).toBe(true);
    }
  });

  it.each(BOTH)("every %s titleScaffold is a stem ending in a separator", (_locale, set) => {
    // Scaffolds are prefixes the member completes ("Potluck — "), not
    // finished titles — so the typed text reads on after the separator.
    for (const t of set) {
      expect(t.titleScaffold.endsWith("— ")).toBe(true);
    }
  });

  it.each(BOTH)("no %s descriptionScaffold smuggles a coordinate", (_locale, set) => {
    // Location is never prefilled (threat-model §7). This guards the
    // most dangerous shape — a lat/long pair in the seed copy. It is a
    // conservative documentary check; the real rule is "no location."
    for (const t of set) {
      expect(t.descriptionScaffold).not.toMatch(/-?\d+\.\d{3,}/);
    }
  });

  it("reserves work-day as skilled_labor / 240 min (plan-10 reconciliation)", () => {
    const wd = getEventTemplate("work-day", "en");
    expect(wd?.category).toBe("skilled_labor");
    expect(wd?.suggestedDurationMinutes).toBe(240);
  });
});

describe("eventTemplates — accessors", () => {
  it("returns each translated set for its locale and English otherwise", () => {
    expect(getEventTemplates("es")).toBe(EVENT_TEMPLATES_ES);
    expect(getEventTemplates("es-MX")).toBe(EVENT_TEMPLATES_ES);
    expect(getEventTemplates("fr")).toBe(EVENT_TEMPLATES_FR);
    expect(getEventTemplates("fr-CA")).toBe(EVENT_TEMPLATES_FR);
    expect(getEventTemplates("pt")).toBe(EVENT_TEMPLATES_PT);
    expect(getEventTemplates("pt-BR")).toBe(EVENT_TEMPLATES_PT);
    expect(getEventTemplates("zh")).toBe(EVENT_TEMPLATES_ZH);
    expect(getEventTemplates("hi")).toBe(EVENT_TEMPLATES_HI);
    expect(getEventTemplates("zh-CN")).toBe(EVENT_TEMPLATES_ZH);
    expect(getEventTemplates("en")).toBe(EVENT_TEMPLATES_EN);
    expect(getEventTemplates("vi")).toBe(EVENT_TEMPLATES_VI);
    expect(getEventTemplates("ru")).toBe(EVENT_TEMPLATES_RU);
    expect(getEventTemplates("ar")).toBe(EVENT_TEMPLATES_AR);
    expect(getEventTemplates("bo")).toBe(EVENT_TEMPLATES_BO);
    expect(getEventTemplates("sw")).toBe(EVENT_TEMPLATES_EN);
  });

  it("looks up a template by id, locale-aware", () => {
    expect(getEventTemplate("potluck", "en")?.id).toBe("potluck");
    // Same id, different localized name.
    expect(getEventTemplate("potluck", "en")?.name).not.toBe(
      getEventTemplate("potluck", "es")?.name,
    );
  });

  it("returns undefined for an unknown id", () => {
    expect(getEventTemplate("not-a-template", "en")).toBeUndefined();
  });
});
