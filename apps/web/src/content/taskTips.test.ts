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
  PROJECT_TEMPLATES_EN,
  PROJECT_TEMPLATES_ES,
} from "@/content/projectTemplates";
import { TASK_TIPS, getTaskTips } from "@/content/taskTips";

// Coverage guard for the per-task tips content. The tips live in their
// own table keyed by template id + task index, so nothing in the type
// system ties them to the templates — these tests are that tie. If a
// template gains/loses/reorders a task, the index-aligned tips MUST be
// updated in the same PR, and this suite is what fails until they are.
describe("TASK_TIPS coverage", () => {
  it("covers exactly the template id set (no missing, no strays)", () => {
    expect(Object.keys(TASK_TIPS).sort()).toEqual(
      PROJECT_TEMPLATES_EN.map((tpl) => tpl.id).sort(),
    );
  });

  it("has one tip per task, index-aligned, in both locales", () => {
    for (const tpl of PROJECT_TEMPLATES_EN) {
      expect(TASK_TIPS[tpl.id], tpl.id).toBeDefined();
      expect(TASK_TIPS[tpl.id].length, tpl.id).toBe(tpl.tasks.length);
    }
    // The es arrays are parity-locked to en in projectTemplates.test.ts,
    // but assert directly so THIS suite stands alone.
    for (const tpl of PROJECT_TEMPLATES_ES) {
      expect(TASK_TIPS[tpl.id].length, `${tpl.id} (es)`).toBe(
        tpl.tasks.length,
      );
    }
  });

  it("every tip is non-empty and actually translated", () => {
    for (const [id, tips] of Object.entries(TASK_TIPS)) {
      tips.forEach((tip, i) => {
        expect(tip.en.trim(), `${id}[${i}].en`).not.toBe("");
        expect(tip.es.trim(), `${id}[${i}].es`).not.toBe("");
        expect(tip.es, `${id}[${i}] es===en`).not.toBe(tip.en);
      });
    }
  });

  it("keeps tips short enough for a task page (no essays)", () => {
    for (const [id, tips] of Object.entries(TASK_TIPS)) {
      tips.forEach((tip, i) => {
        expect(tip.en.length, `${id}[${i}].en`).toBeLessThanOrEqual(400);
        expect(tip.es.length, `${id}[${i}].es`).toBeLessThanOrEqual(400);
      });
    }
  });
});

describe("getTaskTips", () => {
  const tpl = PROJECT_TEMPLATES_EN[0];
  const tplEs = PROJECT_TEMPLATES_ES.find((x) => x.id === tpl.id)!;

  it("resolves a tip by the en task title", () => {
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "en")).toBe(
      TASK_TIPS[tpl.id][0].en,
    );
  });

  it("resolves by an es-created task title too", () => {
    // A project created under es stores the es task names verbatim.
    expect(getTaskTips(tpl.id, tplEs.tasks[0].name, "es")).toBe(
      TASK_TIPS[tpl.id][0].es,
    );
  });

  it("serves the viewer's language independent of creation language", () => {
    // en-created project viewed in es (and regional es variants).
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "es")).toBe(
      TASK_TIPS[tpl.id][0].es,
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "es-MX")).toBe(
      TASK_TIPS[tpl.id][0].es,
    );
  });

  it("returns null for from-scratch projects, renamed tasks, unknown ids", () => {
    expect(getTaskTips(null, tpl.tasks[0].name, "en")).toBeNull();
    expect(getTaskTips(tpl.id, "A renamed task", "en")).toBeNull();
    expect(getTaskTips("no-such-template", tpl.tasks[0].name, "en")).toBeNull();
  });
});
