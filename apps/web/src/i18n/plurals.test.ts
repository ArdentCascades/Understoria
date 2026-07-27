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
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import i18n from "./index";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import pt from "./locales/pt.json";

// CLDR plural-suffix completeness for every shipped locale
// (docs/i18n-expansion.md Phase 0), plus the original Spanish
// agreement regressions. i18next resolves plural keys through
// Intl.PluralRules, so the same API defines which suffixes each
// language must ship: Spanish needs _one/_other, Russian will need
// _one/_few/_many, Chinese collapses to _other alone. A missing form
// renders the wrong grammatical number silently — these make it loud.

const LOCALES: ReadonlyArray<{ code: string; data: unknown }> = [
  { code: "en", data: en },
  { code: "es", data: es },
  { code: "fr", data: fr },
  { code: "pt", data: pt },
];

function flatKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return [prefix];
  }
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out.push(...flatKeys(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

/** Base names of genuine plural families. A family is plural only if
 *  its `_other` form exists — i18next requires _other for count keys,
 *  and the guard keeps literal key names that merely END in a suffix
 *  word (e.g. `cofounder.errors.root_count_not_one`) out of scope. */
function pluralFamilies(keys: string[]): string[] {
  const bases = new Set<string>();
  for (const k of keys) {
    if (k.endsWith("_other")) bases.add(k.slice(0, -"_other".length));
  }
  return [...bases];
}

/** The plural categories a language actually uses for the count range
 *  UI surfaces render (0–200 covers one/few/many switchovers in every
 *  shipped and planned language). Derived from Intl.PluralRules — the
 *  same engine i18next resolves suffixes with — so this test can never
 *  disagree with the runtime. */
function requiredCategories(code: string): Set<string> {
  const rules = new Intl.PluralRules(code);
  const needed = new Set<string>();
  for (let n = 0; n <= 200; n++) needed.add(rules.select(n));
  return needed;
}

describe("plural-suffix completeness", () => {
  // Families are defined by en (the reference file); parity.test.ts
  // already guarantees every locale carries the same key set, so this
  // asserts each family covers the CATEGORIES the locale's own
  // grammar needs.
  const families = pluralFamilies(flatKeys(en));

  it("en defines at least one plural family (sanity)", () => {
    expect(families.length).toBeGreaterThan(20);
  });

  for (const { code, data } of LOCALES) {
    it(`${code}.json covers every plural category its grammar uses`, () => {
      const keySet = new Set(flatKeys(data));
      const needed = requiredCategories(code);
      const missing: string[] = [];
      for (const base of families) {
        for (const category of needed) {
          if (!keySet.has(`${base}_${category}`)) {
            missing.push(`${base}_${category}`);
          }
        }
      }
      expect(missing).toEqual([]);
    });
  }
});

// The original Spanish agreement guardrails. These caught a real
// screen bug: an event with one RSVP rendered "1 confirmadas" because
// the key had no _one/_other forms. Kept as concrete end-to-end
// assertions through i18next itself (suffix presence above can't see
// a wrong TRANSLATION in the right key).
describe("es plural forms", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });

  afterAll(async () => {
    await i18n.changeLanguage("en");
  });

  it("agrees in number on the event attendee count", () => {
    expect(
      i18n.t("events.detail.attendeeCountLabel", { count: 1, maybe: 0 }),
    ).toBe("1 confirmada · 0 tal vez");
    expect(
      i18n.t("events.detail.attendeeCountLabel", { count: 4, maybe: 2 }),
    ).toBe("4 confirmadas · 2 tal vez");
  });
});
