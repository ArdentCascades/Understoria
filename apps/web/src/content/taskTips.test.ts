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
import { PROJECT_TEMPLATES_UR } from "@/content/projectTemplates.ur";
import { PROJECT_TEMPLATES_ID } from "@/content/projectTemplates.id";
import { PROJECT_TEMPLATES_SW } from "@/content/projectTemplates.sw";
import { getTaskTips } from "@/content/taskTips";
import { TASK_TIPS_EN } from "@/content/taskTips.en";
import { TASK_TIPS_ES } from "@/content/taskTips.es";
import { TASK_TIPS_FR } from "@/content/taskTips.fr";
import { TASK_TIPS_PT } from "@/content/taskTips.pt";
import { TASK_TIPS_ZH } from "@/content/taskTips.zh";
import { TASK_TIPS_HI } from "@/content/taskTips.hi";
import { TASK_TIPS_VI } from "@/content/taskTips.vi";
import { TASK_TIPS_RU } from "@/content/taskTips.ru";
import { TASK_TIPS_AR } from "@/content/taskTips.ar";
import { TASK_TIPS_BO } from "@/content/taskTips.bo";
import { TASK_TIPS_UR } from "@/content/taskTips.ur";
import { TASK_TIPS_ID } from "@/content/taskTips.id";
import { TASK_TIPS_SW } from "@/content/taskTips.sw";

// Coverage guard for the per-task tips content. The tips live in their
// own table keyed by template id + task index, so nothing in the type
// system ties them to the templates — these tests are that tie. If a
// template gains/loses/reorders a task, the index-aligned tips MUST be
// updated in the same PR, and this suite is what fails until they are.
describe("TASK_TIPS coverage", () => {
  it("covers exactly the template id set (no missing, no strays)", () => {
    expect(Object.keys(TASK_TIPS_EN).sort()).toEqual(
      PROJECT_TEMPLATES_EN.map((tpl) => tpl.id).sort(),
    );
  });

  it("has one tip per task, index-aligned, in every locale", () => {
    for (const tpl of PROJECT_TEMPLATES_EN) {
      expect(TASK_TIPS_EN[tpl.id], tpl.id).toBeDefined();
      expect(TASK_TIPS_EN[tpl.id].length, tpl.id).toBe(tpl.tasks.length);
    }
    // The es arrays are parity-locked to en in projectTemplates.test.ts,
    // but assert directly so THIS suite stands alone.
    for (const tpl of PROJECT_TEMPLATES_ES) {
      expect(TASK_TIPS_ES[tpl.id]?.length, `${tpl.id} (es)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_FR) {
      expect(TASK_TIPS_FR[tpl.id]?.length, `${tpl.id} (fr)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_PT) {
      expect(TASK_TIPS_PT[tpl.id]?.length, `${tpl.id} (pt)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_ZH) {
      expect(TASK_TIPS_ZH[tpl.id]?.length, `${tpl.id} (zh)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_HI) {
      expect(TASK_TIPS_HI[tpl.id]?.length, `${tpl.id} (hi)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_VI) {
      expect(TASK_TIPS_VI[tpl.id]?.length, `${tpl.id} (vi)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_RU) {
      expect(TASK_TIPS_RU[tpl.id]?.length, `${tpl.id} (ru)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_AR) {
      expect(TASK_TIPS_AR[tpl.id]?.length, `${tpl.id} (ar)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_BO) {
      expect(TASK_TIPS_BO[tpl.id]?.length, `${tpl.id} (bo)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_UR) {
      expect(TASK_TIPS_UR[tpl.id]?.length, `${tpl.id} (ur)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_ID) {
      expect(TASK_TIPS_ID[tpl.id]?.length, `${tpl.id} (id)`).toBe(
        tpl.tasks.length,
      );
    }
    for (const tpl of PROJECT_TEMPLATES_SW) {
      expect(TASK_TIPS_SW[tpl.id]?.length, `${tpl.id} (sw)`).toBe(
        tpl.tasks.length,
      );
    }
  });

  it("every tip is non-empty and actually translated", () => {
    for (const [id, tips] of Object.entries(TASK_TIPS_EN)) {
      tips.forEach((tip, i) => {
        const es = TASK_TIPS_ES[id]?.[i] ?? "";
        const fr = TASK_TIPS_FR[id]?.[i] ?? "";
        const pt = TASK_TIPS_PT[id]?.[i] ?? "";
        const zh = TASK_TIPS_ZH[id]?.[i] ?? "";
        const hi = TASK_TIPS_HI[id]?.[i] ?? "";
        const vi = TASK_TIPS_VI[id]?.[i] ?? "";
        const ru = TASK_TIPS_RU[id]?.[i] ?? "";
        const ar = TASK_TIPS_AR[id]?.[i] ?? "";
        const bo = TASK_TIPS_BO[id]?.[i] ?? "";
        const ur = TASK_TIPS_UR[id]?.[i] ?? "";
        const idTip = TASK_TIPS_ID[id]?.[i] ?? "";
        const sw = TASK_TIPS_SW[id]?.[i] ?? "";
        expect(tip.trim(), `${id}[${i}].en`).not.toBe("");
        expect(es.trim(), `${id}[${i}].es`).not.toBe("");
        expect(es, `${id}[${i}] es===en`).not.toBe(tip);
        expect(fr.trim(), `${id}[${i}].fr`).not.toBe("");
        expect(fr, `${id}[${i}] fr===en`).not.toBe(tip);
        expect(pt.trim(), `${id}[${i}].pt`).not.toBe("");
        expect(pt, `${id}[${i}] pt===en`).not.toBe(tip);
        expect(zh.trim(), `${id}[${i}].zh`).not.toBe("");
        expect(zh, `${id}[${i}] zh===en`).not.toBe(tip);
        expect(hi.trim(), `${id}[${i}].hi`).not.toBe("");
        expect(hi, `${id}[${i}] hi===en`).not.toBe(tip);
        expect(vi.trim(), `${id}[${i}].vi`).not.toBe("");
        expect(vi, `${id}[${i}] vi===en`).not.toBe(tip);
        expect(ru.trim(), `${id}[${i}].ru`).not.toBe("");
        expect(ru, `${id}[${i}] ru===en`).not.toBe(tip);
        expect(ar.trim(), `${id}[${i}].ar`).not.toBe("");
        expect(ar, `${id}[${i}] ar===en`).not.toBe(tip);
        expect(bo.trim(), `${id}[${i}].bo`).not.toBe("");
        expect(bo, `${id}[${i}] bo===en`).not.toBe(tip);
        expect(ur.trim(), `${id}[${i}].ur`).not.toBe("");
        expect(ur, `${id}[${i}] ur===en`).not.toBe(tip);
        expect(idTip.trim(), `${id}[${i}].id`).not.toBe("");
        expect(idTip, `${id}[${i}] id===en`).not.toBe(tip);
        expect(sw.trim(), `${id}[${i}].sw`).not.toBe("");
        expect(sw, `${id}[${i}] sw===en`).not.toBe(tip);
      });
    }
  });

  it("keeps tips short enough for a task page (no essays)", () => {
    for (const [id, tips] of Object.entries(TASK_TIPS_EN)) {
      tips.forEach((tip, i) => {
        expect(tip.length, `${id}[${i}].en`).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_ES[id]?.[i] ?? "").length,
          `${id}[${i}].es`,
        ).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_FR[id]?.[i] ?? "").length,
          `${id}[${i}].fr`,
        ).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_PT[id]?.[i] ?? "").length,
          `${id}[${i}].pt`,
        ).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_ZH[id]?.[i] ?? "").length,
          `${id}[${i}].zh`,
        ).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_HI[id]?.[i] ?? "").length,
          `${id}[${i}].hi`,
        ).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_VI[id]?.[i] ?? "").length,
          `${id}[${i}].vi`,
        ).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_RU[id]?.[i] ?? "").length,
          `${id}[${i}].ru`,
        ).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_AR[id]?.[i] ?? "").length,
          `${id}[${i}].ar`,
        ).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_BO[id]?.[i] ?? "").length,
          `${id}[${i}].bo`,
        ).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_UR[id]?.[i] ?? "").length,
          `${id}[${i}].ur`,
        ).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_ID[id]?.[i] ?? "").length,
          `${id}[${i}].id`,
        ).toBeLessThanOrEqual(400);
        expect(
          (TASK_TIPS_SW[id]?.[i] ?? "").length,
          `${id}[${i}].sw`,
        ).toBeLessThanOrEqual(400);
      });
    }
  });
});

describe("getTaskTips", () => {
  const tpl = PROJECT_TEMPLATES_EN[0];
  const tplEs = PROJECT_TEMPLATES_ES.find((x) => x.id === tpl.id)!;

  it("resolves a tip by the en task title", () => {
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "en")).toBe(
      TASK_TIPS_EN[tpl.id][0],
    );
  });

  it("resolves by an es-created task title too", () => {
    // A project created under es stores the es task names verbatim.
    expect(getTaskTips(tpl.id, tplEs.tasks[0].name, "es")).toBe(
      TASK_TIPS_ES[tpl.id][0],
    );
  });

  it("serves the viewer's language independent of creation language", () => {
    // en-created project viewed in es (and regional es variants).
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "es")).toBe(
      TASK_TIPS_ES[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "es-MX")).toBe(
      TASK_TIPS_ES[tpl.id][0],
    );
    // …and in French, including a project created UNDER es viewed
    // in fr — the title index recovers across any language pair.
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "fr")).toBe(
      TASK_TIPS_FR[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tplEs.tasks[0].name, "fr")).toBe(
      TASK_TIPS_FR[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "pt-BR")).toBe(
      TASK_TIPS_PT[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "zh-CN")).toBe(
      TASK_TIPS_ZH[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "hi")).toBe(
      TASK_TIPS_HI[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "vi")).toBe(
      TASK_TIPS_VI[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "ru")).toBe(
      TASK_TIPS_RU[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "ar")).toBe(
      TASK_TIPS_AR[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "bo")).toBe(
      TASK_TIPS_BO[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "ur")).toBe(
      TASK_TIPS_UR[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "id")).toBe(
      TASK_TIPS_ID[tpl.id][0],
    );
    expect(getTaskTips(tpl.id, tpl.tasks[0].name, "sw")).toBe(
      TASK_TIPS_SW[tpl.id][0],
    );
  });

  it("returns null for from-scratch projects, renamed tasks, unknown ids", () => {
    expect(getTaskTips(null, tpl.tasks[0].name, "en")).toBeNull();
    expect(getTaskTips(tpl.id, "A renamed task", "en")).toBeNull();
    expect(getTaskTips("no-such-template", tpl.tasks[0].name, "en")).toBeNull();
  });
});
