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
import { FAQ_SECTIONS_FR } from "./faq.fr";
import { FAQ_SECTIONS_PT } from "./faq.pt";
import { FAQ_SECTIONS_ZH } from "./faq.zh";
import { FAQ_SECTIONS_HI } from "./faq.hi";
import { FAQ_SECTIONS_VI } from "./faq.vi";
import { FAQ_SECTIONS_RU } from "./faq.ru";
import { FAQ_SECTIONS_AR } from "./faq.ar";
import { FAQ_SECTIONS_BO } from "./faq.bo";

// Guardrail against translation drift. The FAQ ids are stable URL
// fragments shared across languages (`/help#confirm-exchange`), so
// if someone adds, renames or removes an entry in the English file
// without mirroring it here, members on Spanish hit a missing
// section. This test makes that a CI failure rather than a quiet
// regression.

describe.each([
  ["Spanish", FAQ_SECTIONS_ES],
  ["French", FAQ_SECTIONS_FR],
  ["Portuguese", FAQ_SECTIONS_PT],
  ["Chinese", FAQ_SECTIONS_ZH],
  ["Hindi", FAQ_SECTIONS_HI],
  ["Vietnamese", FAQ_SECTIONS_VI],
  ["Russian", FAQ_SECTIONS_RU],
  ["Arabic", FAQ_SECTIONS_AR],
  ["Tibetan", FAQ_SECTIONS_BO],
] as const)("FAQ parity — English ↔ %s", (localeName, FAQ_SECTIONS_TR) => {
  it("has the same section ids in both languages", () => {
    const enSectionIds = FAQ_SECTIONS.map((s) => s.id).sort();
    const trSectionIds = FAQ_SECTIONS_TR.map((s) => s.id).sort();
    expect(trSectionIds).toEqual(enSectionIds);
  });

  it("has the same section ordering in both languages", () => {
    // Ordering matters: members scrolling the page expect to find
    // the same topics in the same order regardless of language.
    expect(FAQ_SECTIONS_TR.map((s) => s.id)).toEqual(
      FAQ_SECTIONS.map((s) => s.id),
    );
  });

  it("has the same entry ids inside each section, in the same order", () => {
    // Unsorted on purpose: a member following "see the question below"
    // (or comparing notes with a neighbor on another language) expects
    // the entries at the same positions. Sorted comparison let the
    // Spanish identity section ship with install-app three slots away
    // from its English position.
    const enBySection = new Map(
      FAQ_SECTIONS.map((s) => [s.id, s.entries.map((e) => e.id)]),
    );
    const trBySection = new Map(
      FAQ_SECTIONS_TR.map((s) => [s.id, s.entries.map((e) => e.id)]),
    );
    for (const [sectionId, enIds] of enBySection) {
      const trIds = trBySection.get(sectionId);
      expect(trIds, `section "${sectionId}" missing in ${localeName}`).toBeDefined();
      expect(
        trIds,
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
    const trEntries = new Map(
      FAQ_SECTIONS_TR.flatMap((s) =>
        s.entries.map((e) => [`${s.id}/${e.id}`, e.answer.length] as const),
      ),
    );
    for (const [key, enLen] of enEntries) {
      expect(trEntries.get(key), `paragraph count for ${key}`).toBe(enLen);
    }
  });

  it("does not translate the stable id strings", () => {
    // Defensive check — ids are URL fragments and must stay
    // ASCII-identifier-shaped. If a translator slipped accented
    // characters into an id, this catches it.
    const idPattern = /^[a-z0-9-]+$/;
    for (const section of FAQ_SECTIONS_TR) {
      expect(section.id).toMatch(idPattern);
      for (const entry of section.entries) {
        expect(entry.id).toMatch(idPattern);
      }
    }
  });
});
