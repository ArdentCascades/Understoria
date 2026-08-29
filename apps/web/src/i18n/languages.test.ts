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
    // explicit list, so the NEXT rtl language (Urdu) is added here
    // consciously, alongside its translation, never by accident.
    const rtlShipped = LANGUAGES.filter((l) => l.dir === "rtl").map(
      (l) => l.code,
    );
    expect(rtlShipped).toEqual(["ar", "ur"]);
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
