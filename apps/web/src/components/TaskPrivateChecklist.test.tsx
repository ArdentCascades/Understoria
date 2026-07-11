/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/database";
import { addPlanStep, localDayString, setPlannedDay } from "@/db/taskPlans";

import "@/i18n";
import { TaskPrivateChecklist } from "./TaskPrivateChecklist";

// The claimer's private plan section on the task page: add/check/remove
// steps and pick a planned day, all against the real (fake-indexeddb)
// Dexie table through useLiveQuery. Also locks two ethos properties in
// the DOM: the privacy note renders, and a passed planned day gets the
// gentle line — never a red/overdue treatment.

const TASK = "task-1";
const ME = "member-me";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  await db.taskPlans.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

async function render(memberKey = ME) {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <TaskPrivateChecklist
        taskId={TASK}
        memberKey={memberKey}
        taskTitle="Fix the fence"
        projectId="proj-1"
      />,
    );
    await Promise.resolve();
  });
  // Let useLiveQuery settle.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
}

async function flushLiveQuery() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe("TaskPrivateChecklist", () => {
  it("renders the privacy note and adds a step through the form", async () => {
    await render();
    expect(container.textContent).toContain("Only you can see this.");

    const input = container.querySelector<HTMLInputElement>(
      'input[type="text"], input:not([type])',
    );
    const form = container.querySelector("form");
    expect(input).not.toBeNull();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(input, "find the ladder");
      input!.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      form!.dispatchEvent(new Event("submit", { bubbles: true }));
    });
    await flushLiveQuery();

    expect(container.textContent).toContain("find the ladder");
    expect(container.textContent).toContain("0 of 1 done");
    const stored = await db.taskPlans.get(TASK);
    expect(stored?.steps[0].text).toBe("find the ladder");
    expect(stored?.memberKey).toBe(ME);
  });

  it("toggles a step done via its checkbox and updates the quiet count", async () => {
    await addPlanStep(TASK, ME, "buy hinges");
    await render();
    const checkbox = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    expect(checkbox).not.toBeNull();
    await act(async () => {
      checkbox!.click();
    });
    await flushLiveQuery();
    expect(container.textContent).toContain("1 of 1 done");
    expect((await db.taskPlans.get(TASK))?.steps[0].done).toBe(true);
  });

  it("sets the planned day from the date input and clears it", async () => {
    await render();
    const dateInput = container.querySelector<HTMLInputElement>(
      'input[type="date"]',
    );
    expect(dateInput).not.toBeNull();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(dateInput, "2027-03-05");
      dateInput!.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await flushLiveQuery();
    expect((await db.taskPlans.get(TASK))?.plannedDay).toBe("2027-03-05");

    const clear = Array.from(container.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Clear",
    );
    expect(clear).toBeDefined();
    await act(async () => {
      clear!.click();
    });
    await flushLiveQuery();
    expect(await db.taskPlans.get(TASK)).toBeUndefined();
  });

  it("offers one-tap Today, which stores the local day string", async () => {
    await render();
    const todayBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Today",
    );
    expect(todayBtn).toBeDefined();
    await act(async () => {
      todayBtn!.click();
    });
    await flushLiveQuery();
    expect((await db.taskPlans.get(TASK))?.plannedDay).toBe(localDayString());
  });

  it("greets a passed planned day with the gentle line, never red styling", async () => {
    await setPlannedDay(TASK, ME, "2020-01-06");
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain("Life happens");
    // No rose/red classes anywhere in the section — solidarity-not-shame.
    expect(container.innerHTML).not.toMatch(/rose-|red-/);
  });

  it("hides another member's plan entirely", async () => {
    await addPlanStep(TASK, "someone-else", "their private note");
    await render(ME);
    expect(container.textContent).not.toContain("their private note");
  });

  it("saves the where-things-stand note via its explicit Save button", async () => {
    await render();
    expect(container.textContent).toContain(
      "Where things stand — a note to future you",
    );
    const textarea = container.querySelector("textarea");
    expect(textarea).not.toBeNull();
    const save = Array.from(container.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Save note",
    );
    expect(save).toBeDefined();
    expect(save!.disabled).toBe(true);

    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      setter.call(textarea, "waiting on Sam's reply");
      textarea!.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(save!.disabled).toBe(false);
    await act(async () => {
      save!.click();
    });
    await flushLiveQuery();
    expect(container.textContent).toContain("Saved.");
    expect((await db.taskPlans.get(TASK))?.note).toBe(
      "waiting on Sam's reply",
    );
  });

  it("offers the calendar-file download only once a day is planned", async () => {
    await render();
    const icsButton = () =>
      Array.from(container.querySelectorAll("button")).find((b) =>
        (b.textContent ?? "").includes("Put it on my calendar"),
      );
    expect(icsButton()).toBeUndefined();

    const todayBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Today",
    );
    await act(async () => {
      todayBtn!.click();
    });
    await flushLiveQuery();
    expect(icsButton()).toBeDefined();
    // The why/how line rides with the button.
    expect(container.textContent).toContain(
      "Understoria never sends reminders",
    );
  });
});
