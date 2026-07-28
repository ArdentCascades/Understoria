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
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import pt from "./locales/pt.json";
import zh from "./locales/zh.json";
import hi from "./locales/hi.json";
import vi from "./locales/vi.json";
import { LANGUAGES } from "./languages";

// Every shipped locale, keyed for the gates below. Locale files are
// static imports (tests stay synchronous), so this table is the one
// place a new language's file gets registered for testing — and the
// registry-coverage test right below makes forgetting that loud.
const SHIPPED_LOCALES: ReadonlyArray<{ code: string; data: unknown }> = [
  { code: "en", data: en },
  { code: "es", data: es },
  { code: "fr", data: fr },
  { code: "pt", data: pt },
  { code: "zh", data: zh },
  { code: "hi", data: hi },
  { code: "vi", data: vi },
];

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function flattenEntries(
  obj: JsonValue,
  prefix = "",
): Array<[string, JsonValue]> {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return [[prefix, obj]];
  }
  const out: Array<[string, JsonValue]> = [];
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    out.push(...flattenEntries(v as JsonValue, next));
  }
  return out;
}

/** Interpolation variables a string consumes, e.g. {{count}}. */
function interpolationVars(value: string): Set<string> {
  const out = new Set<string>();
  for (const m of value.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)) out.add(m[1]);
  return out;
}

const CLDR_PLURAL_SUFFIX = /^(.*)_(zero|one|two|few|many|other)$/;

/** True when `key` is a CLDR plural-suffix variant of a plural family
 *  en itself declares (its `_other` form exists in en). Such keys are
 *  the one sanctioned locale-only addition — see the key-set test. */
function isExtraPluralVariant(key: string, enSet: Set<string>): boolean {
  const m = key.match(CLDR_PLURAL_SUFFIX);
  return m !== null && enSet.has(`${m[1]}_other`);
}

/** The en string an extra plural variant should be compared against
 *  for interpolation parity: its family's `_other` form. */
function pluralFamilyEnKey(key: string): string | null {
  const m = key.match(CLDR_PLURAL_SUFFIX);
  return m ? `${m[1]}_other` : null;
}

const enEntries = flattenEntries(en as JsonValue);
const enKeys = enEntries.map(([k]) => k).sort();
const enMap = new Map(enEntries);

describe("i18n locale parity", () => {
  it("the test table covers every language in the registry", () => {
    // A locale added to languages.ts without being wired into this
    // file would silently skip every gate below.
    const tested = new Set(SHIPPED_LOCALES.map((l) => l.code));
    for (const lang of LANGUAGES) {
      expect(tested.has(lang.code), `add ${lang.code} to SHIPPED_LOCALES`).toBe(
        true,
      );
    }
  });

  for (const { code, data } of SHIPPED_LOCALES) {
    if (code === "en") continue;

    /**
     * The locales must always have identical key sets. Anything else
     * means a member in one language sees raw key names where the UI
     * used to be — a silent regression. When this fails, fix the
     * missing-side translation file: adding a key in en without a
     * matching entry in every shipped locale (or vice versa) is the
     * bug.
     *
     * ONE deliberate relaxation (the plan's Wave-2 Russian case): a
     * locale may carry EXTRA CLDR plural-suffix keys for a family en
     * already declares — Russian needs `hours_few`/`hours_many`
     * beyond en's `hours_one`/`hours_other`, because its plural
     * categories genuinely differ. Only recognized CLDR suffixes on
     * an existing en `_other` family qualify; anything else is still
     * drift. plurals.test.ts enforces that the categories present
     * are exactly the ones the language's Intl.PluralRules demands.
     */
    it(`en.json and ${code}.json have identical key sets`, () => {
      const keys = flattenEntries(data as JsonValue)
        .map(([k]) => k)
        .sort();
      const enSet = new Set(enKeys);
      const set = new Set(keys);
      const onlyInEn = enKeys.filter((k) => !set.has(k));
      const onlyInLocale = keys
        .filter((k) => !enSet.has(k))
        .filter((k) => !isExtraPluralVariant(k, enSet));
      expect(
        onlyInEn,
        `Keys present in en.json but missing from ${code}.json`,
      ).toEqual([]);
      expect(
        onlyInLocale,
        `Keys present in ${code}.json but missing from en.json`,
      ).toEqual([]);
    });

    /**
     * Interpolation variables must survive translation verbatim: a
     * translated string that drops {{name}} loses information, and
     * one that invents {{nombre}} renders the raw placeholder. Same
     * variables, any order.
     */
    it(`${code}.json keeps every interpolation variable from en.json`, () => {
      const mismatches: string[] = [];
      for (const [key, value] of flattenEntries(data as JsonValue)) {
        // Extra plural variants (see the key-set test) have no exact
        // en twin; their variables must match the family's en _other.
        const enValue =
          enMap.get(key) ?? enMap.get(pluralFamilyEnKey(key) ?? "");
        if (typeof value !== "string" || typeof enValue !== "string") continue;
        const a = [...interpolationVars(enValue)].sort();
        const b = [...interpolationVars(value)].sort();
        if (a.join(",") !== b.join(",")) {
          mismatches.push(`${key}: en={{${a}}} ${code}={{${b}}}`);
        }
      }
      expect(mismatches).toEqual([]);
    });
  }

  it("every leaf in every locale is a non-empty string", () => {
    function check(obj: JsonValue, path: string, file: string) {
      if (typeof obj === "string") {
        expect(
          obj.length,
          `${file}: ${path} should not be empty`,
        ).toBeGreaterThan(0);
        return;
      }
      if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
        throw new Error(
          `${file}: ${path} is not a string or nested object — locales should only contain strings`,
        );
      }
      for (const [k, v] of Object.entries(obj)) {
        check(v as JsonValue, path ? `${path}.${k}` : k, file);
      }
    }
    for (const { code, data } of SHIPPED_LOCALES) {
      check(data as JsonValue, "", `${code}.json`);
    }
  });
});
