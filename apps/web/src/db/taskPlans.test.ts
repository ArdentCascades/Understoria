/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db, type OutboxRow } from "@/db/database";
import {
  addPlanStep,
  getOwnTaskPlan,
  localDayString,
  MAX_NOTE_LENGTH,
  MAX_PLAN_STEPS,
  removePlanStep,
  seedPlanSteps,
  setPlannedDay,
  setPlanNote,
  togglePlanStep,
} from "./taskPlans";
import { EXPORT_EXCLUDED_TABLES } from "@/lib/exportData";
import { SNAPSHOT_TABLES } from "@/lib/communitySnapshot";
import { softPurge } from "@/lib/panic";

// Private task plans (checklist + planned day) — the member's own
// executive-function scaffolding on a claimed task. Two halves under
// test: the CRUD contract of db/taskPlans.ts, and the privacy posture
// the feature is named for (local-only: no outbox kind, no export, no
// pairing snapshot, cleared by soft purge).

const TASK = "task-1";
const ME = "member-me";
const OTHER = "member-other";

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
});

describe("taskPlans — steps", () => {
  it("adds, toggles, and removes steps", async () => {
    const step = await addPlanStep(TASK, ME, "  find the ladder  ");
    expect(step?.text).toBe("find the ladder");
    expect(step?.done).toBe(false);

    await togglePlanStep(TASK, ME, step!.id);
    let plan = await getOwnTaskPlan(TASK, ME);
    expect(plan?.steps[0].done).toBe(true);

    await togglePlanStep(TASK, ME, step!.id);
    plan = await getOwnTaskPlan(TASK, ME);
    expect(plan?.steps[0].done).toBe(false);

    await removePlanStep(TASK, ME, step!.id);
    plan = await getOwnTaskPlan(TASK, ME);
    expect(plan).toBeNull();
  });

  it("rejects empty text and caps the step count", async () => {
    expect(await addPlanStep(TASK, ME, "   ")).toBeNull();
    for (let i = 0; i < MAX_PLAN_STEPS; i++) {
      expect(await addPlanStep(TASK, ME, `step ${i}`)).not.toBeNull();
    }
    expect(await addPlanStep(TASK, ME, "one too many")).toBeNull();
    const plan = await getOwnTaskPlan(TASK, ME);
    expect(plan?.steps.length).toBe(MAX_PLAN_STEPS);
  });

  it("keeps step order and only removes the targeted step", async () => {
    const a = await addPlanStep(TASK, ME, "a");
    const b = await addPlanStep(TASK, ME, "b");
    const c = await addPlanStep(TASK, ME, "c");
    await removePlanStep(TASK, ME, b!.id);
    const plan = await getOwnTaskPlan(TASK, ME);
    expect(plan?.steps.map((s) => s.id)).toEqual([a!.id, c!.id]);
  });
});

describe("taskPlans — planned day", () => {
  it("sets, changes, and clears the day; clearing an otherwise-empty plan deletes the row", async () => {
    await setPlannedDay(TASK, ME, "2026-07-12");
    expect((await getOwnTaskPlan(TASK, ME))?.plannedDay).toBe("2026-07-12");

    await setPlannedDay(TASK, ME, "2026-07-14");
    expect((await getOwnTaskPlan(TASK, ME))?.plannedDay).toBe("2026-07-14");

    await setPlannedDay(TASK, ME, null);
    expect(await getOwnTaskPlan(TASK, ME)).toBeNull();
    expect(await db.taskPlans.get(TASK)).toBeUndefined();
  });

  it("keeps the row when steps remain after clearing the day", async () => {
    await addPlanStep(TASK, ME, "a step");
    await setPlannedDay(TASK, ME, "2026-07-12");
    await setPlannedDay(TASK, ME, null);
    const plan = await getOwnTaskPlan(TASK, ME);
    expect(plan?.steps.length).toBe(1);
    expect(plan?.plannedDay).toBeNull();
  });

  it("drops malformed day strings", async () => {
    await setPlannedDay(TASK, ME, "tomorrow-ish" as string);
    expect(await db.taskPlans.get(TASK)).toBeUndefined();
  });

  it("localDayString speaks the <input type=date> shape", () => {
    expect(localDayString(new Date(2026, 6, 11))).toBe("2026-07-11");
    expect(localDayString(new Date(2026, 0, 2))).toBe("2026-01-02");
  });
});

describe("taskPlans — suggested-step seeding", () => {
  it("seeds suggestions as ordinary unchecked steps", async () => {
    const ok = await seedPlanSteps(TASK, ME, [
      "Send one text",
      "  Find the tape measure  ",
      "Walk the site",
    ]);
    expect(ok).toBe(true);
    const plan = await getOwnTaskPlan(TASK, ME);
    expect(plan?.steps.map((s) => s.text)).toEqual([
      "Send one text",
      "Find the tape measure",
      "Walk the site",
    ]);
    expect(plan?.steps.every((s) => !s.done)).toBe(true);
    // Ordinary steps: toggling and removing work like hand-written ones.
    await togglePlanStep(TASK, ME, plan!.steps[0].id);
    expect((await getOwnTaskPlan(TASK, ME))?.steps[0].done).toBe(true);
  });

  it("never lands on a plan that already has steps — the member's words win", async () => {
    await addPlanStep(TASK, ME, "my own first step");
    const ok = await seedPlanSteps(TASK, ME, ["Suggested step"]);
    expect(ok).toBe(false);
    const plan = await getOwnTaskPlan(TASK, ME);
    expect(plan?.steps.map((s) => s.text)).toEqual(["my own first step"]);
  });

  it("seeds alongside an existing planned day or note without touching them", async () => {
    await setPlannedDay(TASK, ME, "2026-08-01");
    await setPlanNote(TASK, ME, "context");
    expect(await seedPlanSteps(TASK, ME, ["Step one"])).toBe(true);
    const plan = await getOwnTaskPlan(TASK, ME);
    expect(plan?.plannedDay).toBe("2026-08-01");
    expect(plan?.note).toBe("context");
    expect(plan?.steps.length).toBe(1);
  });

  it("caps and cleans the input", async () => {
    const many = Array.from({ length: MAX_PLAN_STEPS + 10 }, (_, i) =>
      i === 3 ? "   " : `step ${i}`,
    );
    await seedPlanSteps(TASK, ME, many);
    const plan = await getOwnTaskPlan(TASK, ME);
    expect(plan?.steps.length).toBe(MAX_PLAN_STEPS);
    expect(await seedPlanSteps("t-empty", ME, ["  ", ""])).toBe(false);
    expect(await db.taskPlans.get("t-empty")).toBeUndefined();
  });
});

describe("taskPlans — where-things-stand note", () => {
  it("sets, trims, and clears the note; a note-only row prunes on clear", async () => {
    await setPlanNote(TASK, ME, "  waiting on Sam's reply  ");
    expect((await getOwnTaskPlan(TASK, ME))?.note).toBe(
      "waiting on Sam's reply",
    );

    await setPlanNote(TASK, ME, "hinges are in the shed");
    expect((await getOwnTaskPlan(TASK, ME))?.note).toBe(
      "hinges are in the shed",
    );

    await setPlanNote(TASK, ME, "");
    expect(await getOwnTaskPlan(TASK, ME)).toBeNull();
    expect(await db.taskPlans.get(TASK)).toBeUndefined();
  });

  it("keeps the row when steps or a day remain after clearing the note", async () => {
    await addPlanStep(TASK, ME, "a step");
    await setPlanNote(TASK, ME, "some context");
    await setPlanNote(TASK, ME, "");
    const plan = await getOwnTaskPlan(TASK, ME);
    expect(plan?.steps.length).toBe(1);
    expect(plan?.note).toBe("");
  });

  it("caps the note length", async () => {
    await setPlanNote(TASK, ME, "x".repeat(MAX_NOTE_LENGTH + 100));
    expect((await getOwnTaskPlan(TASK, ME))?.note?.length).toBe(
      MAX_NOTE_LENGTH,
    );
  });

  it("a new claimer's note replaces the previous claimer's whole plan", async () => {
    await setPlanNote(TASK, ME, "my context");
    await setPlanNote(TASK, OTHER, "their context");
    expect(await getOwnTaskPlan(TASK, ME)).toBeNull();
    expect((await getOwnTaskPlan(TASK, OTHER))?.note).toBe("their context");
  });
});

describe("taskPlans — ownership", () => {
  it("never shows one member's plan to another, and a new claimer's write replaces the stale row whole", async () => {
    await addPlanStep(TASK, ME, "my private step");
    await setPlannedDay(TASK, ME, "2026-07-12");

    // The task changed hands: the new claimer reads no plan…
    expect(await getOwnTaskPlan(TASK, OTHER)).toBeNull();

    // …and their first write starts fresh instead of merging into the
    // previous claimer's notes.
    await addPlanStep(TASK, OTHER, "their first step");
    const theirs = await getOwnTaskPlan(TASK, OTHER);
    expect(theirs?.steps.map((s) => s.text)).toEqual(["their first step"]);
    expect(theirs?.plannedDay).toBeNull();

    // The original author's notes are gone with the row — and they no
    // longer see a plan either.
    expect(await getOwnTaskPlan(TASK, ME)).toBeNull();
  });

  it("ignores toggle/remove from a non-author", async () => {
    const step = await addPlanStep(TASK, ME, "mine");
    await togglePlanStep(TASK, OTHER, step!.id);
    await removePlanStep(TASK, OTHER, step!.id);
    const plan = await getOwnTaskPlan(TASK, ME);
    expect(plan?.steps[0].done).toBe(false);
    expect(plan?.steps.length).toBe(1);
  });
});

describe("taskPlans — local-only posture", () => {
  it("has no outbox kind (type-level lock)", () => {
    const row: OutboxRow = {
      id: "o1",
      // @ts-expect-error — "task_plan" is deliberately NOT an outbox
      // kind: private plans never federate (see database.ts).
      kind: "task_plan",
      payload: "{}",
      recordId: TASK,
      createdAt: 0,
      attempts: 0,
      nextAttemptAt: 0,
      status: "pending",
    };
    expect(row.recordId).toBe(TASK);
  });

  it("is excluded from the data export", () => {
    expect(EXPORT_EXCLUDED_TABLES).toContain("taskPlans");
  });

  it("does not ride the device-pairing community snapshot", () => {
    expect(SNAPSHOT_TABLES).not.toContain("taskPlans");
  });

  it("is cleared whole by soft purge", async () => {
    await addPlanStep(TASK, ME, "sensitive process note");
    await setPlannedDay(TASK, ME, "2026-07-12");
    const result = await softPurge();
    expect(result.tablesTouched).toContain("taskPlans");
    expect(await db.taskPlans.count()).toBe(0);
  });
});
