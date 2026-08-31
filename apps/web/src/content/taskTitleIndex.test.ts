/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  TEMPLATE_TASK_NAMES,
  TEMPLATE_SUGGESTS_WORK_DAYS,
} from "./taskTitleIndex";
import { PROJECT_TEMPLATES_EN } from "./projectTemplates.en";
import { PROJECT_TEMPLATES_ES } from "./projectTemplates.es";
import { PROJECT_TEMPLATES_FR } from "./projectTemplates.fr";
import { PROJECT_TEMPLATES_PT } from "./projectTemplates.pt";
import { PROJECT_TEMPLATES_ZH } from "./projectTemplates.zh";
import { PROJECT_TEMPLATES_HI } from "./projectTemplates.hi";
import { PROJECT_TEMPLATES_VI } from "./projectTemplates.vi";
import { PROJECT_TEMPLATES_RU } from "./projectTemplates.ru";
import { PROJECT_TEMPLATES_AR } from "./projectTemplates.ar";
import { PROJECT_TEMPLATES_BO } from "./projectTemplates.bo";
import { PROJECT_TEMPLATES_UR } from "./projectTemplates.ur";

// The title index is GENERATED from the per-language template tables
// and must never drift from them: it is what resolves a stored
// ProjectTask.title (verbatim template task name in whichever locale
// created the project) back to its index for tips/steps, and what
// answers the work-day hint without loading a content bundle. When
// this fails, regenerate the index from the template tables.
describe("taskTitleIndex drift lock", () => {
  const tables: ReadonlyArray<{
    code: string;
    templates: typeof PROJECT_TEMPLATES_EN;
  }> = [
    { code: "en", templates: PROJECT_TEMPLATES_EN },
    { code: "es", templates: PROJECT_TEMPLATES_ES },
    { code: "fr", templates: PROJECT_TEMPLATES_FR },
    { code: "pt", templates: PROJECT_TEMPLATES_PT },
    { code: "zh", templates: PROJECT_TEMPLATES_ZH },
    { code: "hi", templates: PROJECT_TEMPLATES_HI },
    { code: "vi", templates: PROJECT_TEMPLATES_VI },
    { code: "ru", templates: PROJECT_TEMPLATES_RU },
    { code: "ar", templates: PROJECT_TEMPLATES_AR },
    { code: "bo", templates: PROJECT_TEMPLATES_BO },
    { code: "ur", templates: PROJECT_TEMPLATES_UR },
  ];

  for (const { code, templates } of tables) {
    it(`${code} task names match the template tables exactly`, () => {
      for (const tpl of templates) {
        expect(
          TEMPLATE_TASK_NAMES[tpl.id]?.[code],
          `${tpl.id} (${code})`,
        ).toEqual(tpl.tasks.map((t) => t.name));
      }
    });
  }

  it("covers no template ids beyond the tables (no strays)", () => {
    expect(Object.keys(TEMPLATE_TASK_NAMES).sort()).toEqual(
      PROJECT_TEMPLATES_EN.map((t) => t.id).sort(),
    );
  });

  it("suggestsWorkDays flags match the EN table (structural source)", () => {
    for (const tpl of PROJECT_TEMPLATES_EN) {
      expect(
        TEMPLATE_SUGGESTS_WORK_DAYS[tpl.id] === true,
        tpl.id,
      ).toBe(tpl.suggestsWorkDays === true);
    }
  });
});
