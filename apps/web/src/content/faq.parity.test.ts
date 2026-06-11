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
import { describe, expect, it } from "vitest";
import { FAQ_SECTIONS } from "./faq";
import { FAQ_SECTIONS_ES } from "./faq.es";

// Guardrail against translation drift. The FAQ ids are stable URL
// fragments shared across languages (`/help#confirm-exchange`), so
// if someone adds, renames or removes an entry in the English file
// without mirroring it here, members on Spanish hit a missing
// section. This test makes that a CI failure rather than a quiet
// regression.

describe("FAQ parity — English ↔ Spanish", () => {
  it("has the same section ids in both languages", () => {
    const enSectionIds = FAQ_SECTIONS.map((s) => s.id).sort();
    const esSectionIds = FAQ_SECTIONS_ES.map((s) => s.id).sort();
    expect(esSectionIds).toEqual(enSectionIds);
  });

  it("has the same section ordering in both languages", () => {
    // Ordering matters: members scrolling the page expect to find
    // the same topics in the same order regardless of language.
    expect(FAQ_SECTIONS_ES.map((s) => s.id)).toEqual(
      FAQ_SECTIONS.map((s) => s.id),
    );
  });

  it("has the same entry ids inside each section", () => {
    const enBySection = new Map(
      FAQ_SECTIONS.map((s) => [s.id, s.entries.map((e) => e.id).sort()]),
    );
    const esBySection = new Map(
      FAQ_SECTIONS_ES.map((s) => [s.id, s.entries.map((e) => e.id).sort()]),
    );
    for (const [sectionId, enIds] of enBySection) {
      const esIds = esBySection.get(sectionId);
      expect(esIds, `section "${sectionId}" missing in Spanish`).toBeDefined();
      expect(
        esIds,
        `entry ids drift in section "${sectionId}"`,
      ).toEqual(enIds);
    }
  });

  it("has the same number of answer paragraphs per entry", () => {
    // The English FAQ uses paragraph-level structure to control
    // rhythm; the translation should keep the same beats so an
    // entry doesn't read as a single wall of text in one language
    // and as three short paragraphs in the other.
    const enEntries = new Map(
      FAQ_SECTIONS.flatMap((s) =>
        s.entries.map((e) => [`${s.id}/${e.id}`, e.answer.length] as const),
      ),
    );
    const esEntries = new Map(
      FAQ_SECTIONS_ES.flatMap((s) =>
        s.entries.map((e) => [`${s.id}/${e.id}`, e.answer.length] as const),
      ),
    );
    for (const [key, enLen] of enEntries) {
      expect(esEntries.get(key), `paragraph count for ${key}`).toBe(enLen);
    }
  });

  it("does not translate the stable id strings", () => {
    // Defensive check — ids are URL fragments and must stay
    // ASCII-identifier-shaped. If a translator slipped accented
    // characters into an id, this catches it.
    const idPattern = /^[a-z0-9-]+$/;
    for (const section of FAQ_SECTIONS_ES) {
      expect(section.id).toMatch(idPattern);
      for (const entry of section.entries) {
        expect(entry.id).toMatch(idPattern);
      }
    }
  });
});
