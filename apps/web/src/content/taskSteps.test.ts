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
import { PROJECT_TEMPLATES_PT } from "@/content/projectTemplates.pt";
import { PROJECT_TEMPLATES_ZH } from "@/content/projectTemplates.zh";
import { PROJECT_TEMPLATES_HI } from "@/content/projectTemplates.hi";
import { PROJECT_TEMPLATES_VI } from "@/content/projectTemplates.vi";
import { PROJECT_TEMPLATES_RU } from "@/content/projectTemplates.ru";
import { PROJECT_TEMPLATES_AR } from "@/content/projectTemplates.ar";
import { PROJECT_TEMPLATES_BO } from "@/content/projectTemplates.bo";
import { getTaskSteps } from "@/content/taskSteps";
import { TASK_STEPS_EN } from "@/content/taskSteps.en";
import { TASK_STEPS_ES } from "@/content/taskSteps.es";
import { TASK_STEPS_FR } from "@/content/taskSteps.fr";
import { TASK_STEPS_PT } from "@/content/taskSteps.pt";
import { TASK_STEPS_ZH } from "@/content/taskSteps.zh";
import { TASK_STEPS_HI } from "@/content/taskSteps.hi";
import { TASK_STEPS_VI } from "@/content/taskSteps.vi";
import { TASK_STEPS_RU } from "@/content/taskSteps.ru";
import { TASK_STEPS_AR } from "@/content/taskSteps.ar";
import { TASK_STEPS_BO } from "@/content/taskSteps.bo";

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
    for (const tpl of PROJECT_TEMPLATES_PT) {
      expect(TASK_STEPS_PT[tpl.id]?.length, `${tpl.id} (pt)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_ZH) {
      expect(TASK_STEPS_ZH[tpl.id]?.length, `${tpl.id} (zh)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_HI) {
      expect(TASK_STEPS_HI[tpl.id]?.length, `${tpl.id} (hi)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_VI) {
      expect(TASK_STEPS_VI[tpl.id]?.length, `${tpl.id} (vi)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_RU) {
      expect(TASK_STEPS_RU[tpl.id]?.length, `${tpl.id} (ru)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_AR) {
      expect(TASK_STEPS_AR[tpl.id]?.length, `${tpl.id} (ar)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_BO) {
      expect(TASK_STEPS_BO[tpl.id]?.length, `${tpl.id} (bo)`).toBe(
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
        expect(TASK_STEPS_PT[id]?.[i]?.length, `${id}[${i}] pt/en counts`).toBe(
          list.length,
        );
        expect(TASK_STEPS_ZH[id]?.[i]?.length, `${id}[${i}] zh/en counts`).toBe(
          list.length,
        );
        expect(TASK_STEPS_HI[id]?.[i]?.length, `${id}[${i}] hi/en counts`).toBe(
          list.length,
        );
        expect(TASK_STEPS_VI[id]?.[i]?.length, `${id}[${i}] vi/en counts`).toBe(
          list.length,
        );
        expect(TASK_STEPS_RU[id]?.[i]?.length, `${id}[${i}] ru/en counts`).toBe(
          list.length,
        );
        expect(TASK_STEPS_AR[id]?.[i]?.length, `${id}[${i}] ar/en counts`).toBe(
          list.length,
        );
        expect(TASK_STEPS_BO[id]?.[i]?.length, `${id}[${i}] bo/en counts`).toBe(
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
        (TASK_STEPS_PT[id]?.[i] ?? []).forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].pt[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].pt[${j}]`).toBeLessThanOrEqual(120);
          expect(s, `${id}[${i}].pt[${j}] pt===en`).not.toBe(enList[j]);
        });
        (TASK_STEPS_ZH[id]?.[i] ?? []).forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].zh[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].zh[${j}]`).toBeLessThanOrEqual(120);
          expect(s, `${id}[${i}].zh[${j}] zh===en`).not.toBe(enList[j]);
        });
        (TASK_STEPS_HI[id]?.[i] ?? []).forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].hi[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].hi[${j}]`).toBeLessThanOrEqual(120);
          expect(s, `${id}[${i}].hi[${j}] hi===en`).not.toBe(enList[j]);
        });
        (TASK_STEPS_VI[id]?.[i] ?? []).forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].vi[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].vi[${j}]`).toBeLessThanOrEqual(120);
          expect(s, `${id}[${i}].vi[${j}] vi===en`).not.toBe(enList[j]);
        });
        (TASK_STEPS_RU[id]?.[i] ?? []).forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].ru[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].ru[${j}]`).toBeLessThanOrEqual(120);
          expect(s, `${id}[${i}].ru[${j}] ru===en`).not.toBe(enList[j]);
        });
        (TASK_STEPS_AR[id]?.[i] ?? []).forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].ar[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].ar[${j}]`).toBeLessThanOrEqual(120);
          expect(s, `${id}[${i}].ar[${j}] ar===en`).not.toBe(enList[j]);
        });
        (TASK_STEPS_BO[id]?.[i] ?? []).forEach((s, j) => {
          expect(s.trim(), `${id}[${i}].bo[${j}]`).not.toBe("");
          expect(s.length, `${id}[${i}].bo[${j}]`).toBeLessThanOrEqual(120);
          expect(s, `${id}[${i}].bo[${j}] bo===en`).not.toBe(enList[j]);
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
    // Same recovery for a project created in French or Portuguese.
    const tplFr = PROJECT_TEMPLATES_FR.find((t) => t.id === tpl.id)!;
    const fr = getTaskSteps(tpl.id, tplFr.tasks[0].name, "fr");
    expect(fr).toEqual([...TASK_STEPS_FR[tpl.id][0]]);
    const tplPt = PROJECT_TEMPLATES_PT.find((t) => t.id === tpl.id)!;
    const pt = getTaskSteps(tpl.id, tplPt.tasks[0].name, "pt");
    expect(pt).toEqual([...TASK_STEPS_PT[tpl.id][0]]);
    const tplZh = PROJECT_TEMPLATES_ZH.find((t) => t.id === tpl.id)!;
    const zh = getTaskSteps(tpl.id, tplZh.tasks[0].name, "zh");
    expect(zh).toEqual([...TASK_STEPS_ZH[tpl.id][0]]);
    const tplHi = PROJECT_TEMPLATES_HI.find((t) => t.id === tpl.id)!;
    const hi = getTaskSteps(tpl.id, tplHi.tasks[0].name, "hi");
    expect(hi).toEqual([...TASK_STEPS_HI[tpl.id][0]]);
    const tplVi = PROJECT_TEMPLATES_VI.find((t) => t.id === tpl.id)!;
    const vi = getTaskSteps(tpl.id, tplVi.tasks[0].name, "vi");
    expect(vi).toEqual([...TASK_STEPS_VI[tpl.id][0]]);
    const tplRu = PROJECT_TEMPLATES_RU.find((t) => t.id === tpl.id)!;
    const ru = getTaskSteps(tpl.id, tplRu.tasks[0].name, "ru");
    expect(ru).toEqual([...TASK_STEPS_RU[tpl.id][0]]);
    const tplAr = PROJECT_TEMPLATES_AR.find((t) => t.id === tpl.id)!;
    const arSteps = getTaskSteps(tpl.id, tplAr.tasks[0].name, "ar");
    expect(arSteps).toEqual([...TASK_STEPS_AR[tpl.id][0]]);
    const tplBo = PROJECT_TEMPLATES_BO.find((t) => t.id === tpl.id)!;
    const boSteps = getTaskSteps(tpl.id, tplBo.tasks[0].name, "bo");
    expect(boSteps).toEqual([...TASK_STEPS_BO[tpl.id][0]]);
  });

  it("yields null for from-scratch projects, unknown templates, and renamed tasks", () => {
    expect(getTaskSteps(null, "anything", "en")).toBeNull();
    expect(getTaskSteps("no-such-template", "anything", "en")).toBeNull();
    expect(
      getTaskSteps(PROJECT_TEMPLATES_EN[0].id, "A renamed task", "en"),
    ).toBeNull();
  });
});
