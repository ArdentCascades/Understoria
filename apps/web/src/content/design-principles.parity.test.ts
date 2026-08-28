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
import { DESIGN_PRINCIPLES } from "./design-principles";
import { DESIGN_PRINCIPLES_ES } from "./design-principles.es";
import { DESIGN_PRINCIPLES_FR } from "./design-principles.fr";
import { DESIGN_PRINCIPLES_PT } from "./design-principles.pt";
import { DESIGN_PRINCIPLES_ZH } from "./design-principles.zh";
import { DESIGN_PRINCIPLES_HI } from "./design-principles.hi";
import { DESIGN_PRINCIPLES_VI } from "./design-principles.vi";
import { DESIGN_PRINCIPLES_RU } from "./design-principles.ru";
import { DESIGN_PRINCIPLES_AR } from "./design-principles.ar";

// Guardrail against translation drift, same shape as faq.parity.
// Principle ids are stable anchors shared across languages: WhyTooltip
// looks a principle up by id on thirty-one screens, LearnSection
// renders `#principle-<id>` anchors, and code comments cite ids like
// `no-notifications`. If someone adds, renames or reorders a principle
// in the English file without mirroring every translation, a member on
// that language loses the "why" behind a surface — this makes that a
// CI failure rather than a quiet regression.

describe.each([
  ["Spanish", DESIGN_PRINCIPLES_ES],
  ["French", DESIGN_PRINCIPLES_FR],
  ["Portuguese", DESIGN_PRINCIPLES_PT],
  ["Chinese", DESIGN_PRINCIPLES_ZH],
  ["Hindi", DESIGN_PRINCIPLES_HI],
  ["Vietnamese", DESIGN_PRINCIPLES_VI],
  ["Russian", DESIGN_PRINCIPLES_RU],
  ["Arabic", DESIGN_PRINCIPLES_AR],
] as const)(
  "design principles parity — English ↔ %s",
  (localeName, PRINCIPLES_TR) => {
    it("has the same principle ids, in the same order", () => {
      // Unsorted on purpose: LearnSection renders the list in file
      // order, and a member comparing notes with a neighbor on
      // another language expects the same principle at the same
      // position.
      expect(PRINCIPLES_TR.map((p) => p.id)).toEqual(
        DESIGN_PRINCIPLES.map((p) => p.id),
      );
    });

    it("leaves no field empty", () => {
      for (const p of PRINCIPLES_TR) {
        expect(p.title, `${localeName} ${p.id} title`).not.toBe("");
        expect(p.statement, `${localeName} ${p.id} statement`).not.toBe("");
        expect(p.example, `${localeName} ${p.id} example`).not.toBe("");
      }
    });

    it("actually translates the prose rather than copying English", () => {
      // A translation file that still carries an English statement or
      // example is a placeholder that shipped. Titles can legitimately
      // stay close ("No push notifications" → "Pas de notifications
      // push"), so only the two prose fields are held to this.
      const en = new Map(DESIGN_PRINCIPLES.map((p) => [p.id, p]));
      for (const p of PRINCIPLES_TR) {
        const source = en.get(p.id)!;
        expect(p.statement, `${localeName} ${p.id} statement`).not.toBe(
          source.statement,
        );
        expect(p.example, `${localeName} ${p.id} example`).not.toBe(
          source.example,
        );
      }
    });

    it("does not translate the stable id strings", () => {
      // Ids are anchors and code references — ASCII-identifier-shaped
      // in every language.
      for (const p of PRINCIPLES_TR) {
        expect(p.id).toMatch(/^[a-z0-9-]+$/);
      }
    });
  },
);
