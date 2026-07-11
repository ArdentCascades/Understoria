/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  PROJECT_TEMPLATES_EN,
  PROJECT_TEMPLATES_ES,
} from "@/content/projectTemplates";
import { TASK_STEPS, getTaskSteps } from "@/content/taskSteps";

// Coverage guard for the suggested-starter-steps content — the same
// tie taskTips.test.ts provides for the tips: the steps are keyed by
// template id + task index with nothing in the type system linking
// them to the templates, so if a template gains/loses/reorders a
// task, THIS suite fails until the steps move with it.
describe("TASK_STEPS coverage", () => {
  it("covers exactly the template id set (no missing, no strays)", () => {
    expect(Object.keys(TASK_STEPS).sort()).toEqual(
      PROJECT_TEMPLATES_EN.map((tpl) => tpl.id).sort(),
    );
  });

  it("has one step list per task, index-aligned, in both locales", () => {
    for (const tpl of PROJECT_TEMPLATES_EN) {
      expect(TASK_STEPS[tpl.id], tpl.id).toBeDefined();
      expect(TASK_STEPS[tpl.id].length, tpl.id).toBe(tpl.tasks.length);
    }
    for (const tpl of PROJECT_TEMPLATES_ES) {
      expect(TASK_STEPS[tpl.id].length, `${tpl.id} (es)`).toBe(
        tpl.tasks.length,
      );
    }
  });

  it("gives every task 3-5 steps per locale, with matching counts", () => {
    for (const [id, entries] of Object.entries(TASK_STEPS)) {
      entries.forEach((entry, i) => {
        expect(entry.en.length, `${id}[${i}].en`).toBeGreaterThanOrEqual(3);
        expect(entry.en.length, `${id}[${i}].en`).toBeLessThanOrEqual(5);
        expect(entry.es.length, `${id}[${i}] es/en counts`).toBe(
          entry.en.length,
        );
      });
    }
  });

  it("keeps every step a short, checkable to-do (non-empty, translated, no essays)", () => {
    for (const [id, entries] of Object.entries(TASK_STEPS)) {
      entries.forEach((entry, i) => {
        entry.en.forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].en[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].en[${j}]`).toBeLessThanOrEqual(120);
        });
        entry.es.forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].es[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].es[${j}]`).toBeLessThanOrEqual(120);
          expect(s, `${id}[${i}].es[${j}] es===en`).not.toBe(entry.en[j]);
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
    expect(es).toEqual([...TASK_STEPS[tpl.id][0].es]);
  });

  it("yields null for from-scratch projects, unknown templates, and renamed tasks", () => {
    expect(getTaskSteps(null, "anything", "en")).toBeNull();
    expect(getTaskSteps("no-such-template", "anything", "en")).toBeNull();
    expect(
      getTaskSteps(PROJECT_TEMPLATES_EN[0].id, "A renamed task", "en"),
    ).toBeNull();
  });
});
