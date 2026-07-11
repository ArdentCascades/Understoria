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
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import {
  addPlanStep,
  localDayString,
  MAX_NOTE_LENGTH,
  MAX_PLAN_STEPS,
  MAX_STEP_LENGTH,
  removePlanStep,
  setPlannedDay,
  setPlanNote,
  togglePlanStep,
} from "@/db/taskPlans";
import { downloadIcs, plannedDayIcs } from "@/lib/ics";

// The claimer's PRIVATE working plan for a task: their own step
// breakdown plus an optional planned day. The gap this fills is
// executive-function, not information — "paint the fence" is clear,
// but *starting* it needs "find the brushes" written down somewhere
// that isn't the claimer's working memory. Renders only for the
// task's assignee; the rows live in the local-only `taskPlans` table
// (db/taskPlans.ts) and never reach another member or the wire.
//
// Deliberately absent, by ethos: reminders and notifications for the
// planned day (`no-notifications`), any red/overdue styling when the
// day passes (`solidarity-not-shame` — the gentle "life happens" line
// below is the whole treatment), and any surface where someone else
// could see progress percentages (`no-leaderboards`). The checklist
// is scaffolding the member builds for themselves, not accountability
// anyone can inspect.
export function TaskPrivateChecklist({
  taskId,
  memberKey,
  taskTitle,
  projectId,
}: {
  taskId: string;
  memberKey: string;
  /** For the calendar-file event title. */
  taskTitle: string;
  /** For the deep link back to this task inside the calendar file. */
  projectId: string;
}) {
  const { t, i18n } = useTranslation();
  const [draft, setDraft] = useState("");
  // null = not editing (textarea mirrors the stored note); a string =
  // unsaved edit in progress. Keeps a background live-query refresh
  // from clobbering half-typed text.
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const [noteSavedFlash, setNoteSavedFlash] = useState(false);
  const noteFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const row = useLiveQuery(
    async () => (await db.taskPlans.get(taskId)) ?? null,
    [taskId],
  );
  // A row authored by a previous claimer reads as "no plan" — their
  // notes are theirs, even on a shared device. First write replaces.
  const plan = row && row.memberKey === memberKey ? row : null;
  const steps = plan?.steps ?? [];
  const doneCount = steps.filter((s) => s.done).length;
  const storedNote = plan?.note ?? "";
  const noteValue = noteDraft ?? storedNote;
  const noteDirty = noteDraft !== null && noteDraft.trim() !== storedNote;

  async function saveNote() {
    if (noteDraft === null) return;
    await setPlanNote(taskId, memberKey, noteDraft);
    setNoteDraft(null);
    setNoteSavedFlash(true);
    if (noteFlashTimer.current) clearTimeout(noteFlashTimer.current);
    noteFlashTimer.current = setTimeout(() => setNoteSavedFlash(false), 2500);
  }

  const today = localDayString();
  const tomorrow = localDayString(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const plannedDay = plan?.plannedDay ?? null;
  const dayIsPast = plannedDay !== null && plannedDay < today;

  async function submitDraft() {
    const text = draft.trim();
    if (!text) return;
    const added = await addPlanStep(taskId, memberKey, text);
    if (added) setDraft("");
  }

  // "YYYY-MM-DD" → a friendly local date ("Sat, Jul 12"). Parsed as
  // LOCAL midnight — `new Date("YYYY-MM-DD")` would read it as UTC
  // and shift the shown day near midnight in western timezones.
  function formatDay(day: string): string {
    const [y, m, d] = day.split("-").map(Number);
    return new Intl.DateTimeFormat(i18n.language, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(y, m - 1, d));
  }

  return (
    <section
      aria-labelledby={`task-plan-${taskId}`}
      className="rounded-md border border-moss-200 bg-moss-50/50 p-3 dark:border-moss-700 dark:bg-moss-900/40"
    >
      <h3
        id={`task-plan-${taskId}`}
        className="text-sm font-semibold text-moss-800 dark:text-moss-100"
      >
        {t("projects.task.plan.heading")}
      </h3>
      <p className="mt-0.5 text-xs text-moss-600 dark:text-moss-300">
        {t("projects.task.plan.privacy")}
      </p>

      {steps.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {steps.map((step) => (
            <li key={step.id} className="flex items-start gap-2">
              <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={step.done}
                  onChange={() => void togglePlanStep(taskId, memberKey, step.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-canopy-600"
                />
                <span
                  className={
                    step.done
                      ? "min-w-0 break-words text-moss-600 line-through dark:text-moss-300"
                      : "min-w-0 break-words text-moss-800 dark:text-moss-100"
                  }
                >
                  {step.text}
                </span>
              </label>
              <button
                type="button"
                onClick={() => void removePlanStep(taskId, memberKey, step.id)}
                aria-label={t("projects.task.plan.removeStep", {
                  step: step.text,
                })}
                className="shrink-0 rounded px-1 text-moss-600 hover:bg-moss-100 hover:text-moss-800 dark:text-moss-300 dark:hover:bg-moss-800 dark:hover:text-moss-100"
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {steps.length > 0 && (
        <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
          {t("projects.task.plan.progress", {
            done: doneCount,
            total: steps.length,
          })}
        </p>
      )}

      {steps.length < MAX_PLAN_STEPS && (
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submitDraft();
          }}
        >
          <input
            className="input min-w-0 flex-1 text-sm"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_STEP_LENGTH}
            placeholder={t("projects.task.plan.addPlaceholder")}
            aria-label={t("projects.task.plan.addPlaceholder")}
          />
          <button
            type="submit"
            className="btn-secondary shrink-0"
            disabled={draft.trim() === ""}
          >
            {t("projects.task.plan.addButton")}
          </button>
        </form>
      )}
      {steps.length === 0 && (
        <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
          {t("projects.task.plan.stepsHint")}
        </p>
      )}

      {/* "Where things stand" — the re-entry note. Coming back to a
          task days later means reconstructing context from scratch;
          this field holds the context instead. Explicit Save (not
          autosave) so the member knows exactly when their words are
          kept. */}
      <div className="mt-3 border-t border-moss-200 pt-2 dark:border-moss-700">
        <label
          className="flex flex-col gap-1 text-xs text-moss-700 dark:text-moss-200"
          htmlFor={`task-plan-note-${taskId}`}
        >
          <span className="font-medium">
            {t("projects.task.plan.noteLabel")}
          </span>
          <span className="text-moss-600 dark:text-moss-300">
            {t("projects.task.plan.noteHint")}
          </span>
          <textarea
            id={`task-plan-note-${taskId}`}
            className="input min-h-16 text-sm"
            value={noteValue}
            maxLength={MAX_NOTE_LENGTH}
            placeholder={t("projects.task.plan.notePlaceholder")}
            onChange={(e) => setNoteDraft(e.target.value)}
          />
        </label>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary text-xs"
            disabled={!noteDirty}
            onClick={() => void saveNote()}
          >
            {t("projects.task.plan.noteSave")}
          </button>
          {noteSavedFlash && (
            <span
              role="status"
              className="text-xs text-canopy-700 dark:text-canopy-300"
            >
              {t("projects.task.plan.noteSaved")}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 border-t border-moss-200 pt-2 dark:border-moss-700">
        <label
          className="flex flex-col gap-1 text-xs text-moss-700 dark:text-moss-200"
          htmlFor={`task-plan-day-${taskId}`}
        >
          <span className="font-medium">
            {t("projects.task.plan.dayLabel")}
          </span>
          <span className="flex flex-wrap items-center gap-2">
            <input
              id={`task-plan-day-${taskId}`}
              type="date"
              className="input max-w-[11rem] text-sm"
              value={plannedDay ?? ""}
              onChange={(e) =>
                void setPlannedDay(taskId, memberKey, e.target.value || null)
              }
            />
            {plannedDay !== today && (
              <button
                type="button"
                className="chip bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
                onClick={() => void setPlannedDay(taskId, memberKey, today)}
              >
                {t("projects.task.plan.dayToday")}
              </button>
            )}
            {plannedDay !== tomorrow && (
              <button
                type="button"
                className="chip bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
                onClick={() => void setPlannedDay(taskId, memberKey, tomorrow)}
              >
                {t("projects.task.plan.dayTomorrow")}
              </button>
            )}
            {plannedDay !== null && (
              <button
                type="button"
                className="chip bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
                onClick={() => void setPlannedDay(taskId, memberKey, null)}
              >
                {t("projects.task.plan.dayClear")}
              </button>
            )}
          </span>
        </label>
        {/* The planned day is a self-promise, not a deadline: when it
            passes, the only response is this quiet line — no red, no
            "overdue", no count of days missed (solidarity-not-shame). */}
        {dayIsPast && (
          <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
            {t("projects.task.plan.dayPast", {
              day: formatDay(plannedDay),
            })}
          </p>
        )}
        {/* The no-notifications bridge: Understoria never reminds, but
            the member's OWN calendar can — if they choose to put the
            day there. A local file download; nothing leaves the
            device (lib/ics.ts). */}
        {plannedDay !== null && (
          <div className="mt-2">
            <button
              type="button"
              className="text-xs text-canopy-700 underline decoration-canopy-300 underline-offset-2 hover:text-canopy-900 dark:text-canopy-300 dark:decoration-canopy-700 dark:hover:text-canopy-100"
              onClick={() =>
                downloadIcs(
                  "understoria-planned-day.ics",
                  plannedDayIcs({
                    uidKey: taskId,
                    summary: taskTitle,
                    day: plannedDay,
                    description: t("projects.task.plan.icsDescription"),
                    url: `${window.location.origin}/project/${projectId}/task/${taskId}`,
                  }),
                )
              }
            >
              {t("projects.task.plan.icsButton")}
            </button>
            <p className="mt-0.5 text-xs text-moss-600 dark:text-moss-300">
              {t("projects.task.plan.icsHint")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
