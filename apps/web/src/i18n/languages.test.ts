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
import {
  intlLocale,
  LANGUAGES,
  languageInfo,
  RTL_PSEUDO,
  RTL_PSEUDO_AVAILABLE,
  SELECTABLE_LANGUAGES,
  SUPPORTED_LANGUAGES,
} from "./languages";

// The registry's RTL gate (docs/rtl-plan.md), as a test instead of
// only a comment. LANGUAGES is the shipped-languages source of truth:
// the parity gates, the plural gates and the README language count all
// derive from it, so the RTL preview pseudo-locale must never leak in.

describe("language registry — the RTL gate", () => {
  it("ships rtl only for languages the RTL program earned", () => {
    // R4 retired the original all-ltr assertion deliberately — with
    // R1–R3's verification in hand, exactly as its comment required.
    // The gate's successor: every dir:"rtl" entry must be on this
    // explicit list, so each next rtl language is added here
    // consciously, alongside its translation, never by accident.
    // Urdu was added with the R5 fleet; Persian with the fa fleet
    // (it rides Arabic's Naskh font stack, no new CSS spike).
    const rtlShipped = LANGUAGES.filter((l) => l.dir === "rtl").map(
      (l) => l.code,
    );
    expect(rtlShipped).toEqual(["ar", "ur", "fa"]);
  });

  it("keeps the pseudo-locale out of the shipped registry and its counts", () => {
    expect(LANGUAGES.map((l) => l.code)).not.toContain(RTL_PSEUDO.code);
    expect(SUPPORTED_LANGUAGES).not.toContain(RTL_PSEUDO.code);
  });

  it("offers the pseudo-locale in dev builds (vitest runs as dev)", () => {
    // import.meta.env.DEV is true under vitest, so this suite sees the
    // preview enabled; the member-build branch is compile-time and
    // carries no entry (RTL_PSEUDO_AVAILABLE is false there).
    expect(RTL_PSEUDO_AVAILABLE).toBe(true);
    expect(SELECTABLE_LANGUAGES.map((l) => l.code)).toContain("rtl");
    expect(languageInfo("rtl")).toBe(RTL_PSEUDO);
    expect(languageInfo("rtl").dir).toBe("rtl");
  });

  it("resolves regioned and unknown tags exactly as before", () => {
    expect(languageInfo("es-MX").code).toBe("es");
    expect(languageInfo("xx").code).toBe("en");
    expect(languageInfo(undefined).code).toBe("en");
  });
});

// The Intl digit pin (docs/i18n-glossary/bn.md, rule 8). Bengali is
// the first shipped language whose CLDR default numbering system is
// not Western: bare "bn" makes Intl render ১,২৩৪ and ৭/৯/২০২৬ against
// a locale file written in Western digits. intlLocale() is the one
// helper every Intl call site routes the language tag through.
describe("intlLocale — the numbering-system pin", () => {
  it("pins Bengali to Western digits, region preserved", () => {
    expect(intlLocale("bn")).toBe("bn-u-nu-latn");
    expect(intlLocale("bn-BD")).toBe("bn-BD-u-nu-latn");
    expect(new Intl.NumberFormat(intlLocale("bn")).format(1234)).toBe(
      "1,234",
    );
    expect(
      new Intl.NumberFormat("bn").resolvedOptions().numberingSystem,
      "if this fails, the ICU default changed and the pin may be moot",
    ).toBe("beng");
  });

  it("pins Persian to Western digits — and digits ONLY", () => {
    // fa's CLDR default numbering is arabext (۱٬۲۳۴ against the
    // locale file's Western digits), so the pin applies like bn's.
    expect(intlLocale("fa")).toBe("fa-u-nu-latn");
    expect(intlLocale("fa-IR")).toBe("fa-IR-u-nu-latn");
    expect(new Intl.NumberFormat(intlLocale("fa")).format(1234)).toBe(
      "1,234",
    );
    // The CALENDAR is deliberately not pinned: fa's Intl default is
    // the Solar Hijri (persian) calendar, which is what Iranian
    // members actually use — dates keep it under the digit pin
    // (docs/i18n-glossary/fa.md, rule 10).
    expect(
      new Intl.DateTimeFormat(intlLocale("fa")).resolvedOptions().calendar,
    ).toBe("persian");
  });

  it("pins Burmese to Western digits", () => {
    // my's CLDR default numbering is mymr (၁,၂၃၄ against the locale
    // file's Western digits), so the pin applies like bn's and fa's
    // (docs/i18n-glossary/my.md, Stage-0 finding 2).
    expect(intlLocale("my")).toBe("my-u-nu-latn");
    expect(intlLocale("my-MM")).toBe("my-MM-u-nu-latn");
    expect(new Intl.NumberFormat(intlLocale("my")).format(1234)).toBe(
      "1,234",
    );
    expect(
      new Intl.NumberFormat("my").resolvedOptions().numberingSystem,
      "if this fails, the ICU default changed and the pin may be moot",
    ).toBe("mymr");
  });

  it("leaves every other shipped tag untouched", () => {
    // bn, fa and my are the three registry entries carrying
    // intlNumbering; each is excluded here consciously, alongside its
    // own pin test above — never by accident.
    for (const l of LANGUAGES) {
      if (l.code === "bn" || l.code === "fa" || l.code === "my") continue;
      expect(intlLocale(l.code)).toBe(l.code);
    }
    expect(intlLocale("es-MX")).toBe("es-MX");
    expect(intlLocale(undefined)).toBe("en");
  });
});
