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
import type {
  ProjectTemplate,
  TemplateTask,
} from "@/content/projectTemplates";
import type { StagedTaskInput } from "@/db/projects";

/**
 * Pure helpers behind the staged-task review step on the
 * Start-a-project page. Picking a template stages its tasks into
 * editable rows — each with an include/exclude toggle and an hours
 * field — BEFORE anything is created, because "Templates are NOT
 * prescriptions" (the content file's own header): a community that
 * already owns a fridge shouldn't have to create and then delete
 * "Source a fridge" to say so.
 *
 * Kept off the React tree so the exclusion/remap arithmetic — the
 * part that can silently corrupt dependency edges — is unit-testable
 * without rendering anything.
 */

export interface StagedTemplateTask {
  /** Stable key for React lists + toggles: the template-task index. */
  index: number;
  name: string;
  /** Description WITHOUT the recurring-cadence suffix — the suffix is
   *  locale text applied at submit, same as the pre-staging flow. */
  description: string;
  /** Editable hours as input text; parsed at summing/submit time. */
  hours: string;
  included: boolean;
  recurringCadence: TemplateTask["recurringCadence"];
  skills: readonly string[];
  /** Template-task INDEXES this task follows (verbatim from the
   *  template; remapped past exclusions at submit). */
  follows: readonly number[];
}

/** Initial staged rows for a just-selected template — everything
 *  included, hours prefilled from the template. */
export function buildStagedTasks(
  tpl: ProjectTemplate,
): StagedTemplateTask[] {
  return tpl.tasks.map((task, index) => ({
    index,
    name: task.name,
    description: task.description,
    hours: String(task.hours),
    included: true,
    recurringCadence: task.recurringCadence,
    skills: task.skills ?? [],
    follows: task.follows ?? [],
  }));
}

/** Parsed hours for one staged row; 0 for unparsable/empty input so a
 *  half-typed field never yields NaN in the live sum. */
export function stagedHours(task: StagedTemplateTask): number {
  const n = Number.parseFloat(task.hours);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Live target-hours sum over the INCLUDED rows — what the form's
 *  target-hours field tracks while the member trims the list. */
export function sumIncludedHours(tasks: readonly StagedTemplateTask[]): number {
  let sum = 0;
  for (const task of tasks) {
    if (task.included) sum += stagedHours(task);
  }
  // One decimal place: template hours are integers today, but a
  // member may type 1.5, and float accumulation must not render as
  // 11.499999999999998.
  return Math.round(sum * 10) / 10;
}

/**
 * The submit-time projection: included rows only, in template order,
 * with each `follows` reference REMAPPED to the included-array index
 * of its target — and dropped entirely when the target was excluded.
 *
 * Dropping (rather than transitively rewiring a→b→c into a→c when b
 * is excluded) is deliberate: dependencies here are advisory
 * soft-blocks, and inventing an edge the template author never wrote
 * is worse than losing one the member decided against. The member
 * can add edges later from the task page.
 *
 * The template's cadence tag rides through as the task's REAL
 * `recurringCadence` field (confirming such a task re-opens it — see
 * the respawn hook in db/projects.ts), not a description suffix. The
 * cadence used to be deliberately text-only; that ruling predates
 * templates carrying cadence tags at scale — 58 tagged tasks per
 * locale that the product displayed but never acted on became the
 * bigger dishonesty.
 */
export function includedStagedTasks(
  tasks: readonly StagedTemplateTask[],
): StagedTaskInput[] {
  const includedIndexByTemplateIndex = new Map<number, number>();
  const included = tasks.filter((task) => task.included);
  included.forEach((task, i) => {
    includedIndexByTemplateIndex.set(task.index, i);
  });
  return included.map((task) => ({
    title: task.name,
    description: task.description,
    estimatedHours: stagedHours(task) || 1,
    requiredSkills: task.skills,
    recurringCadence: task.recurringCadence ?? null,
    follows: task.follows
      .map((templateIndex) => includedIndexByTemplateIndex.get(templateIndex))
      .filter((i): i is number => i !== undefined),
  }));
}
