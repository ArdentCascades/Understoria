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
  provenanceEventDescription,
  provenanceEventTitle,
  provenanceTaskDescription,
  provenanceTaskSkills,
  provenanceTaskTitle,
  provenanceTitle,
  wordingHash,
} from "./templateProvenance";
import {
  EVENT_TITLE_SCAFFOLDS,
  TEMPLATE_NAMES,
  TEMPLATE_TASK_NAMES,
} from "./taskTitleIndex";

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

describe("task-skill provenance (per-skill byte-exact)", () => {
  it("translates template skills by aligned position, and only those", async () => {
    await ensureContent("es");
    // en task 1 of community-fridge suggests ["carpentry","driving"];
    // the es bundle's same row carries ["carpintería","conducir"].
    // An organizer-added skill matches nothing and stays verbatim.
    const view = provenanceTaskSkills(
      TID,
      1,
      ["carpentry", "welding", "driving"],
      ["en"],
      "es",
    );
    expect(view).toEqual(["carpintería", "welding", "conducir"]);
  });

  it("substitutes nothing without a matched row or for the source's own locale", async () => {
    await ensureContent("es");
    const skills = ["carpentry", "driving"];
    expect(provenanceTaskSkills(TID, -1, skills, ["en"], "es")).toBe(skills);
    // Viewer IS the source: their words already.
    expect(provenanceTaskSkills(TID, 1, skills, ["en"], "en")).toBe(skills);
    // Wrong row: same bytes, different address — no substitution.
    expect(
      provenanceTaskSkills(TID, 0, ["carpentry"], ["en"], "es"),
    ).toEqual(["carpentry"]);
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

describe("historical wording sets (docs/provenance-translation.md)", () => {
  // A native-review reword moves the old wording into the generated
  // history; projects created under it keep verifying and display
  // the CURRENT viewer-language text. History is injectable here —
  // in production it is the generated (initially empty) module.
  const OLD_ES_NAME = "Refrigerador comunitario (redacción antigua)";
  const OLD_ES_TASK0 = "Encuentra un sitio (redacción antigua)";
  const OLD_ES_DESC = "Una descripción antigua\n\ncompuesta\n\ncomo siempre";
  const OLD_ES_TASK0_DESC = "Una descripción de tarea antigua.";
  const HIST = {
    [TID]: {
      names: { es: [OLD_ES_NAME] },
      taskNames: {
        es: TEMPLATE_TASK_NAMES[TID].es.map((_, i) =>
          i === 0 ? [OLD_ES_TASK0] : [],
        ),
      },
      descHashes: { es: [wordingHash(OLD_ES_DESC)] },
      taskDescHashes: {
        es: TEMPLATE_TASK_NAMES[TID].es.map((_, i) =>
          i === 0 ? [wordingHash(OLD_ES_TASK0_DESC)] : [],
        ),
      },
    },
  };

  it("translates a title stored under a historical wording", () => {
    const pt = provenanceTitle(TID, OLD_ES_NAME, "en", HIST);
    expect(pt).toMatchObject({
      text: enName,
      original: OLD_ES_NAME,
      translated: true,
      sourceLocale: "es",
    });
    // Same wording viewed in the language it belongs to: no-op.
    expect(provenanceTitle(TID, OLD_ES_NAME, "es", HIST).translated).toBe(
      false,
    );
  });

  it("recovers a task row from a historical task name", () => {
    const pt = provenanceTaskTitle(TID, OLD_ES_TASK0, "en", HIST);
    expect(pt).toMatchObject({ text: enTask0, translated: true });
  });

  it("verifies a historical description by hash — no source bundle needed", () => {
    const pt = provenanceDescription(TID, OLD_ES_DESC, [], "en", HIST);
    expect(pt.translated).toBe(true);
    expect(pt.sourceLocale).toBe("es");
    expect(pt.original).toBe(OLD_ES_DESC);
    // And per-row for task descriptions.
    const tp = provenanceTaskDescription(
      TID,
      0,
      OLD_ES_TASK0_DESC,
      [],
      "en",
      HIST,
    );
    expect(tp.translated).toBe(true);
    // Wrong row: same bytes, different address — no substitution.
    expect(
      provenanceTaskDescription(TID, 1, OLD_ES_TASK0_DESC, [], "en", HIST)
        .translated,
    ).toBe(false);
  });

  it("still refuses anything outside history — byte-exact or nothing", () => {
    expect(
      provenanceTitle(TID, `${OLD_ES_NAME}!`, "en", HIST).translated,
    ).toBe(false);
    expect(
      provenanceDescription(TID, `${OLD_ES_DESC} `, [], "en", HIST)
        .translated,
    ).toBe(false);
  });
});

describe("event-template provenance (scaffold composition)", () => {
  // Events stage title = the template's titleScaffold (ends " — ",
  // the member's own words follow) and description = the
  // descriptionScaffold verbatim. The scaffold segment is app text
  // and substitutes; the member's suffix stays verbatim, always.
  const EID = "potluck";
  const esScaffold = EVENT_TITLE_SCAFFOLDS[EID].es;
  const enScaffold = EVENT_TITLE_SCAFFOLDS[EID].en;

  it("ships a scaffold for every event template in every locale, ending in the composition boundary", () => {
    for (const [eid, table] of Object.entries(EVENT_TITLE_SCAFFOLDS)) {
      for (const [code, scaffold] of Object.entries(table)) {
        // The boundary is the trailing em dash + space; what precedes
        // it is script-specific (Tibetan's tsheg replaces the space).
        expect(scaffold.endsWith("— "), `${eid} (${code})`).toBe(true);
      }
    }
  });

  it("substitutes the scaffold segment and keeps the member's suffix verbatim", () => {
    const stored = `${esScaffold}tamales y música`;
    const pt = provenanceEventTitle(EID, stored, "en");
    expect(pt).toMatchObject({
      text: `${enScaffold}tamales y música`,
      original: stored,
      translated: true,
      sourceLocale: "es",
    });
    // Bare scaffold (member typed nothing yet) substitutes whole.
    expect(provenanceEventTitle(EID, esScaffold, "en").text).toBe(enScaffold);
  });

  it("is a no-op when the scaffold is already the viewer's, and for non-scaffold titles", () => {
    expect(
      provenanceEventTitle(EID, `${enScaffold}potluck in the park`, "en")
        .translated,
    ).toBe(false);
    expect(
      provenanceEventTitle(EID, "A fully rewritten title", "en").translated,
    ).toBe(false);
    expect(provenanceEventTitle(null, esScaffold, "en").translated).toBe(
      false,
    );
  });

  it("verifies an unedited description against the source scaffold, and a historical one by hash", async () => {
    await ensureContent("es");
    const esDesc = getContentBundle("es").EVENT_TEMPLATES.find(
      (t) => t.id === EID,
    )!.descriptionScaffold;
    const enDesc = getContentBundle("en").EVENT_TEMPLATES.find(
      (t) => t.id === EID,
    )!.descriptionScaffold;
    const pt = provenanceEventDescription(EID, esDesc, ["es"], "en");
    expect(pt).toMatchObject({ text: enDesc, translated: true });
    expect(
      provenanceEventDescription(EID, `${esDesc}!`, ["es"], "en").translated,
    ).toBe(false);
    // History: an old scaffold wording verifies by hash, bundle-free.
    const OLD = "Una redacción antigua de la descripción del convite.";
    const HIST = {
      [EID]: { eventDescHashes: { es: [wordingHash(OLD)] } },
    };
    const hp = provenanceEventDescription(EID, OLD, [], "en", HIST);
    expect(hp).toMatchObject({ text: enDesc, translated: true, sourceLocale: "es" });
  });

  it("matches a historical scaffold prefix", () => {
    const OLD_SCAFFOLD = "Convite (redacción antigua) — ";
    const HIST = { [EID]: { eventScaffolds: { es: [OLD_SCAFFOLD] } } };
    const stored = `${OLD_SCAFFOLD}tamales`;
    const pt = provenanceEventTitle(EID, stored, "en", HIST);
    expect(pt).toMatchObject({
      text: `${enScaffold}tamales`,
      translated: true,
      sourceLocale: "es",
    });
  });
});
