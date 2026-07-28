/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  PROJECT_TEMPLATES_EN,
} from "@/content/projectTemplates";
import { PROJECT_TEMPLATES_ES } from "@/content/projectTemplates.es";
import { PROJECT_TEMPLATES_FR } from "@/content/projectTemplates.fr";
import { getTaskSteps } from "@/content/taskSteps";
import { TASK_STEPS_EN } from "@/content/taskSteps.en";
import { TASK_STEPS_ES } from "@/content/taskSteps.es";
import { TASK_STEPS_FR } from "@/content/taskSteps.fr";

// Coverage guard for the suggested-starter-steps content — the same
// tie taskTips.test.ts provides for the tips: the steps are keyed by
// template id + task index with nothing in the type system linking
// them to the templates, so if a template gains/loses/reorders a
// task, THIS suite fails until the steps move with it.
describe("TASK_STEPS coverage", () => {
  it("covers exactly the template id set (no missing, no strays)", () => {
    expect(Object.keys(TASK_STEPS_EN).sort()).toEqual(
      PROJECT_TEMPLATES_EN.map((tpl) => tpl.id).sort(),
    );
  });

  it("has one step list per task, index-aligned, in every locale", () => {
    for (const tpl of PROJECT_TEMPLATES_EN) {
      expect(TASK_STEPS_EN[tpl.id], tpl.id).toBeDefined();
      expect(TASK_STEPS_EN[tpl.id].length, tpl.id).toBe(tpl.tasks.length);
    }
    for (const tpl of PROJECT_TEMPLATES_ES) {
      expect(TASK_STEPS_ES[tpl.id]?.length, `${tpl.id} (es)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_FR) {
      expect(TASK_STEPS_FR[tpl.id]?.length, `${tpl.id} (fr)`).toBe(
        tpl.tasks.length,
      );
    }
  });

  it("gives every task 3-5 steps per locale, with matching counts", () => {
    for (const [id, en] of Object.entries(TASK_STEPS_EN)) {
      en.forEach((list, i) => {
        expect(list.length, `${id}[${i}].en`).toBeGreaterThanOrEqual(3);
        expect(list.length, `${id}[${i}].en`).toBeLessThanOrEqual(5);
        expect(TASK_STEPS_ES[id]?.[i]?.length, `${id}[${i}] es/en counts`).toBe(
          list.length,
        );
        expect(TASK_STEPS_FR[id]?.[i]?.length, `${id}[${i}] fr/en counts`).toBe(
          list.length,
        );
      });
    }
  });

  it("keeps every step a short, checkable to-do (non-empty, translated, no essays)", () => {
    for (const [id, en] of Object.entries(TASK_STEPS_EN)) {
      en.forEach((enList, i) => {
        enList.forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].en[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].en[${j}]`).toBeLessThanOrEqual(120);
        });
        (TASK_STEPS_ES[id]?.[i] ?? []).forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].es[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].es[${j}]`).toBeLessThanOrEqual(120);
          expect(s, `${id}[${i}].es[${j}] es===en`).not.toBe(enList[j]);
        });
        (TASK_STEPS_FR[id]?.[i] ?? []).forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].fr[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].fr[${j}]`).toBeLessThanOrEqual(120);
          expect(s, `${id}[${i}].fr[${j}] fr===en`).not.toBe(enList[j]);
        });
      });
    }
  });
});

describe("getTaskSteps", () => {
  it("resolves by template + verbatim task title in either locale", () => {
    const tpl = PROJECT_TEMPLATES_EN[0];
    const en = getTaskSteps(tpl.id, tpl.tasks[0].name, "en");
    expect(en).not.toBeNull();
    expect(en!.length).toBeGreaterThanOrEqual(3);
    // A project created in Spanish carries the es task name; the same
    // index (and thus the es steps) must resolve from it.
    const tplEs = PROJECT_TEMPLATES_ES.find((t) => t.id === tpl.id)!;
    const es = getTaskSteps(tpl.id, tplEs.tasks[0].name, "es");
    expect(es).toEqual([...TASK_STEPS_ES[tpl.id][0]]);
    // Same recovery for a project created in French.
    const tplFr = PROJECT_TEMPLATES_FR.find((t) => t.id === tpl.id)!;
    const fr = getTaskSteps(tpl.id, tplFr.tasks[0].name, "fr");
    expect(fr).toEqual([...TASK_STEPS_FR[tpl.id][0]]);
  });

  it("yields null for from-scratch projects, unknown templates, and renamed tasks", () => {
    expect(getTaskSteps(null, "anything", "en")).toBeNull();
    expect(getTaskSteps("no-such-template", "anything", "en")).toBeNull();
    expect(
      getTaskSteps(PROJECT_TEMPLATES_EN[0].id, "A renamed task", "en"),
    ).toBeNull();
  });
});
