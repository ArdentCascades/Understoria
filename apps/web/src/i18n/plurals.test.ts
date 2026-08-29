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
import zh from "./locales/zh.json";
import hi from "./locales/hi.json";
import vi from "./locales/vi.json";
import ru from "./locales/ru.json";
import ar from "./locales/ar.json";
import bo from "./locales/bo.json";
import ur from "./locales/ur.json";

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
  { code: "zh", data: zh },
  { code: "hi", data: hi },
  { code: "vi", data: vi },
  { code: "ru", data: ru },
  { code: "ar", data: ar },
  { code: "bo", data: bo },
  { code: "ur", data: ur },
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

function flatEntries(obj: unknown, prefix = ""): Array<[string, unknown]> {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return [[prefix, obj]];
  }
  const out: Array<[string, unknown]> = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out.push(...flatEntries(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

/** The CLDR categories i18next appends as key suffixes. */
const CLDR_CATEGORIES = [
  "zero",
  "one",
  "two",
  "few",
  "many",
  "other",
] as const;

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

  /**
   * Every form of a count-driven family must interpolate {{count}} —
   * never a hardcoded numeral.
   *
   * This looks harmless in English, whose `one` category is exactly
   * n=1, so "1 open task" always renders truthfully. It is not
   * harmless anywhere else. Russian's `one` also covers 21, 31, 101…
   * and Hindi's, French's and Portuguese's also cover 0 — so a
   * hardcoded "1" tells a Russian member with 21 open tasks that
   * they have one, and a French member with none that they have one.
   *
   * Worse, the source file dictates the ceiling: parity.test.ts
   * requires each locale to use exactly the interpolation variables
   * en uses, so a `_one` string without {{count}} in en actively
   * FORBIDS every translation from having it. That is how nine such
   * strings shipped, and why the Russian translator had to drop the
   * number from three of them rather than get it right.
   *
   * The one exemption is computed, not hand-listed: a category that
   * admits a SINGLE integer for the locale (Arabic's zero {0}, one
   * {1}, two {2}) may omit {{count}}, because there the grammar IS
   * the number — the dual «ساعتان» cannot lie about being two, while
   * «2 ساعة» is simply wrong Arabic. French's `one` covers 0 and 1
   * and Russian's covers 21, 31…, so neither qualifies — exactly the
   * lie this test exists to prevent. parity.test.ts sanctions the
   * same omission and nothing else.
   */
  for (const { code, data } of LOCALES) {
    it(`${code}.json interpolates {{count}} in every count-driven plural form`, () => {
      const entries = flatEntries(data);
      const byKey = new Map(entries);
      const rules = new Intl.PluralRules(code);
      const hitsPerCategory = new Map<string, number>();
      for (let n = 0; n <= 1000; n++) {
        const cat = rules.select(n);
        hitsPerCategory.set(cat, (hitsPerCategory.get(cat) ?? 0) + 1);
      }
      const singleIntegerCategories = new Set(
        [...hitsPerCategory]
          .filter(([, hits]) => hits === 1)
          .map(([cat]) => cat),
      );
      const offenders: string[] = [];
      for (const base of families) {
        // A family is count-driven when its _other form takes the
        // count; families that never show a number are exempt.
        const other = byKey.get(`${base}_other`);
        if (typeof other !== "string" || !other.includes("{{count}}")) {
          continue;
        }
        for (const category of CLDR_CATEGORIES) {
          if (singleIntegerCategories.has(category)) continue;
          const key = `${base}_${category}`;
          const value = byKey.get(key);
          if (typeof value === "string" && !value.includes("{{count}}")) {
            offenders.push(`${key}: ${JSON.stringify(value)}`);
          }
        }
      }
      expect(offenders).toEqual([]);
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
