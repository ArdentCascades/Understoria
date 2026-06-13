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
  EVENT_TEMPLATES_ES,
  getEventTemplate,
  getEventTemplates,
  type EventTemplate,
} from "./eventTemplates";
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
  });

  it("en and es share the same id set in the same order", () => {
    expect(EVENT_TEMPLATES_ES.map((t) => t.id)).toEqual(
      EVENT_TEMPLATES_EN.map((t) => t.id),
    );
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

  it("keeps locale-invariant fields identical across en and es", () => {
    const esById = new Map(EVENT_TEMPLATES_ES.map((t) => [t.id, t]));
    for (const en of EVENT_TEMPLATES_EN) {
      const es = esById.get(en.id);
      expect(es).toBeDefined();
      expect(es!.category).toBe(en.category);
      expect(es!.emoji).toBe(en.emoji);
      expect(es!.suggestedDurationMinutes).toBe(en.suggestedDurationMinutes);
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
  it("returns the Spanish set for es / es-MX and English otherwise", () => {
    expect(getEventTemplates("es")).toBe(EVENT_TEMPLATES_ES);
    expect(getEventTemplates("es-MX")).toBe(EVENT_TEMPLATES_ES);
    expect(getEventTemplates("en")).toBe(EVENT_TEMPLATES_EN);
    expect(getEventTemplates("zh-CN")).toBe(EVENT_TEMPLATES_EN);
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
