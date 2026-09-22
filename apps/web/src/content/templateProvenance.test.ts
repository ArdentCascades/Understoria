/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// Provenance-verified display translation (docs/provenance-translation.md).
// The contract under test: substitution happens ONLY on a byte-exact,
// template-scoped, row-agreed match against the shipped corpus; every
// miss — an edited field, an unknown template, an ambiguous row —
// falls back to the signed bytes. Plus the corpus gate that keeps row
// recovery unambiguous as templates evolve.
import { describe, expect, it } from "vitest";
import { ensureContent, getContentBundle } from "./registry";
import {
  composeTemplateDescription,
  matchedNameLocales,
  matchedTaskRow,
  provenanceDescription,
  provenanceTaskDescription,
  provenanceTaskTitle,
  provenanceTitle,
} from "./templateProvenance";
import { TEMPLATE_NAMES, TEMPLATE_TASK_NAMES } from "./taskTitleIndex";

const TID = "community-fridge";
const esName = TEMPLATE_NAMES[TID].es;
const enName = TEMPLATE_NAMES[TID].en;
const esTask0 = TEMPLATE_TASK_NAMES[TID].es[0];
const enTask0 = TEMPLATE_TASK_NAMES[TID].en[0];

describe("title provenance (sync, eager index)", () => {
  it("substitutes the viewer's name for an unmodified foreign title", () => {
    expect(matchedNameLocales(TID, esName)).toContain("es");
    const pt = provenanceTitle(TID, esName, "en");
    expect(pt).toMatchObject({
      text: enName,
      original: esName,
      translated: true,
      sourceLocale: "es",
    });
  });

  it("never substitutes an edited title — byte-exact or nothing", () => {
    expect(provenanceTitle(TID, `${esName}!`, "en").translated).toBe(false);
    expect(provenanceTitle(TID, esName.slice(0, -1), "en").translated).toBe(
      false,
    );
  });

  it("is a no-op when the title is already the viewer's language", () => {
    const pt = provenanceTitle(TID, enName, "en");
    expect(pt.translated).toBe(false);
    expect(pt.text).toBe(enName);
  });

  it("is a no-op without a templateId — free-form projects never translate", () => {
    expect(provenanceTitle(null, esName, "en").translated).toBe(false);
  });

  it("is a no-op for an unknown templateId", () => {
    expect(provenanceTitle("no-such-template", esName, "en").translated).toBe(
      false,
    );
  });
});

describe("task-title provenance (row agreement)", () => {
  it("recovers the row and every matching locale", () => {
    const match = matchedTaskRow(TID, esTask0);
    expect(match?.row).toBe(0);
    expect(match?.locales).toContain("es");
  });

  it("substitutes the viewer's task name at the same row", () => {
    const pt = provenanceTaskTitle(TID, esTask0, "en");
    expect(pt).toMatchObject({
      text: enTask0,
      original: esTask0,
      translated: true,
    });
  });

  it("returns null (no substitution) for text matching no row", () => {
    expect(matchedTaskRow(TID, "not a task name")).toBeNull();
    expect(
      provenanceTaskTitle(TID, "not a task name", "en").translated,
    ).toBe(false);
  });
});

describe("description provenance (bundle-verified)", () => {
  it("substitutes the viewer's composition for an unmodified description", async () => {
    await ensureContent("es");
    const esTpl = getContentBundle("es").PROJECT_TEMPLATES.find(
      (t) => t.id === TID,
    )!;
    const enTpl = getContentBundle("en").PROJECT_TEMPLATES.find(
      (t) => t.id === TID,
    )!;
    const stored = composeTemplateDescription(esTpl);
    const pt = provenanceDescription(TID, stored, ["es"], "en");
    expect(pt).toMatchObject({
      text: composeTemplateDescription(enTpl),
      original: stored,
      translated: true,
      sourceLocale: "es",
    });
  });

  it("never substitutes an edited description", async () => {
    await ensureContent("es");
    const esTpl = getContentBundle("es").PROJECT_TEMPLATES.find(
      (t) => t.id === TID,
    )!;
    const edited = `${composeTemplateDescription(esTpl)} (editado)`;
    expect(provenanceDescription(TID, edited, ["es"], "en").translated).toBe(
      false,
    );
  });

  it("verifies a task description against the row its title fixed", async () => {
    await ensureContent("es");
    const esDesc = getContentBundle("es").PROJECT_TEMPLATES.find(
      (t) => t.id === TID,
    )!.tasks[0].description;
    const enDesc = getContentBundle("en").PROJECT_TEMPLATES.find(
      (t) => t.id === TID,
    )!.tasks[0].description;
    const pt = provenanceTaskDescription(TID, 0, esDesc, ["es"], "en");
    expect(pt).toMatchObject({
      text: enDesc,
      original: esDesc,
      translated: true,
    });
    // Wrong row: same bytes, different address — no substitution.
    expect(
      provenanceTaskDescription(TID, 1, esDesc, ["es"], "en").translated,
    ).toBe(false);
  });
});

describe("corpus gates the mechanism depends on", () => {
  it("keeps task names unique within each template and locale", () => {
    // Row recovery is only sound while no template reuses a task name
    // within one locale. This held for all 18 languages when the
    // feature shipped; a future template edit that breaks it must
    // come argue with docs/provenance-translation.md.
    for (const [tid, tables] of Object.entries(TEMPLATE_TASK_NAMES)) {
      for (const [code, names] of Object.entries(tables)) {
        expect(new Set(names).size, `${tid} (${code})`).toBe(names.length);
      }
    }
  });

  it("ships a display name for every template in every locale", () => {
    for (const [tid, tables] of Object.entries(TEMPLATE_TASK_NAMES)) {
      const nameTable = TEMPLATE_NAMES[tid];
      expect(nameTable, tid).toBeTruthy();
      for (const code of Object.keys(tables)) {
        expect(nameTable[code], `${tid} (${code})`).toBeTruthy();
      }
    }
  });

  it("keeps the staged description composition in sync with ProjectNew", () => {
    // composeTemplateDescription IS the byte-match contract; if the
    // staging format ever changes shape, this fixture forces the
    // historical-wording plan in the design doc before shipping.
    expect(
      composeTemplateDescription({
        purpose: "a",
        whoItServes: "b",
        whatYoullNeed: "c",
      }),
    ).toBe("a\n\nb\n\nc");
  });
});
