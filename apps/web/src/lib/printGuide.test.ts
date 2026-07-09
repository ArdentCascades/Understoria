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
//
// The field guide's drift guard (paper-systems P5): every curated
// entry id must resolve in BOTH locales. A renamed FAQ id fails
// HERE, at build time — never as a hole in a stack of printed paper.
//
import { describe, expect, it } from "vitest";
import { FAQ_SECTIONS } from "@/content/faq";
import { FAQ_SECTIONS_ES } from "@/content/faq.es";
import { GUIDE_ENTRY_IDS, resolveGuideEntries } from "./printGuide";

describe("resolveGuideEntries", () => {
  it("every curated id resolves in English", () => {
    const { entries, missing } = resolveGuideEntries(FAQ_SECTIONS);
    expect(missing).toEqual([]);
    expect(entries.map((e) => e.id)).toEqual([...GUIDE_ENTRY_IDS]);
  });

  it("every curated id resolves in Spanish", () => {
    const { entries, missing } = resolveGuideEntries(FAQ_SECTIONS_ES);
    expect(missing).toEqual([]);
    expect(entries.map((e) => e.id)).toEqual([...GUIDE_ENTRY_IDS]);
  });

  it("reports (not swallows) a curated id the FAQ no longer has", () => {
    const { missing } = resolveGuideEntries([
      { id: "s", title: "S", entries: [] },
    ]);
    expect(missing).toEqual([...GUIDE_ENTRY_IDS]);
  });
});
