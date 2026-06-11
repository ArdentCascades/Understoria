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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import { useFlipAnimation } from "@/lib/a11y/useFlipAnimation";
import { useToast } from "@/state/ToastContext";
import { reorderProjectTask } from "@/db/projects";
import type { ProjectTask } from "@/types";

// Focused-reorder modal. Same @dnd-kit setup as the inline TaskList
// (PR E / #214), but scoped to a single column of title-only rows so
// drag-reorder feels uncluttered. Each drop fires reorderProjectTask
// immediately — this is a focused view, not a staged transaction.
// The inline Move up / Move down buttons stay; this dialog is the
// optimized-for-drag sibling.
export interface ReorderTasksDialogProps {
  open: boolean;
  tasks: readonly ProjectTask[];
  projectId: string;
  organizerKey: string;
  onClose: () => void;
}

export function ReorderTasksDialog({
  open,
  tasks,
  organizerKey,
  onClose,
}: ReorderTasksDialogProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const firstTaskRef = useRef<HTMLLIElement>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");

  useFocusTrap(cardRef, open);

  // Esc closes. Reused from ConfirmDialog's pattern.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Initial focus on the first task (after one tick so the focus
  // trap's first-focusable selection has run and we can override it).
  // Lands keyboard users directly in the sortable list.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      firstTaskRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const fromIdx = tasks.findIndex((task) => task.id === active.id);
      const toIdx = tasks.findIndex((task) => task.id === over.id);
      if (fromIdx < 0 || toIdx < 0) return;
      const reordered = [...tasks];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      const beforeId = toIdx > 0 ? reordered[toIdx - 1].id : null;
      const afterId =
        toIdx < reordered.length - 1 ? reordered[toIdx + 1].id : null;
      if (beforeId === null && afterId === null) return;
      try {
        await reorderProjectTask({
          taskId: String(active.id),
          organizerKey,
          beforeId,
          afterId,
        });
      } catch {
        showToast(t("projects.task.reorderError"), { tone: "error" });
      }
    },
    [tasks, organizerKey, showToast, t],
  );

  if (!open) return null;

  const activeTask = activeDragId
    ? tasks.find((task) => task.id === activeDragId)
    : null;

  // Backdrop click — only fires when the click landed on the
  // backdrop itself, not bubbling out of the card. Same pattern as
  // common React modal idioms (target === currentTarget).
  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    // Backdrop click closes — kept as a mouse-only path because
    // the equivalent keyboard dismissal is the Esc key (wired above)
    // and the Done button. Suppress the a11y lints: the click is
    // intentional, the keyboard path exists, and the role / aria-modal
    // are required on the dialog root.
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reorder-tasks-dialog-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-moss-950/40 p-4 sm:items-center"
    >
      <div
        ref={cardRef}
        className="card flex max-h-[80vh] w-full max-w-md flex-col animate-fade-in"
      >
        <h2
          id="reorder-tasks-dialog-title"
          className="text-lg font-semibold"
        >
          {t("projects.task.reorderDialogTitle")}
        </h2>

        <div className="mt-3 flex-1 overflow-y-auto">
          {tasks.length < 2 ? (
            <p className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
              {t("projects.task.reorderDialogEmpty")}
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={() => {
                if (activeTask) {
                  setLiveMessage(
                    t("projects.task.dragCancel", { title: activeTask.title }),
                  );
                }
                setActiveDragId(null);
              }}
              accessibility={{
                announcements: {
                  onDragStart: ({ active }) => {
                    const found = tasks.find((x) => x.id === active.id);
                    return found
                      ? t("projects.task.dragStart", { title: found.title })
                      : "";
                  },
                  onDragOver: () => "",
                  onDragEnd: ({ active, over }) => {
                    const found = tasks.find((x) => x.id === active.id);
                    if (!found || !over) return "";
                    const overIdx = tasks.findIndex((x) => x.id === over.id);
                    return t("projects.task.dragEnd", {
                      title: found.title,
                      position: overIdx + 1,
                      total: tasks.length,
                    });
                  },
                  onDragCancel: ({ active }) => {
                    const found = tasks.find((x) => x.id === active.id);
                    return found
                      ? t("projects.task.dragCancel", { title: found.title })
                      : "";
                  },
                },
              }}
            >
              <SortableContext
                items={taskIds}
                strategy={verticalListSortingStrategy}
              >
                <ReorderTaskList
                  tasks={tasks}
                  taskIds={taskIds}
                  activeDragId={activeDragId}
                  firstTaskRef={firstTaskRef}
                />
              </SortableContext>
              <DragOverlay>
                {activeTask ? (
                  <div className="card opacity-90 shadow-lg">
                    <span className="text-base font-medium">
                      {activeTask.title}
                    </span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        <p className="mt-3 text-xs text-moss-600 dark:text-moss-300">
          {t("projects.task.reorderDialogHint")}
        </p>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
          >
            {t("projects.task.reorderDialogClose")}
          </button>
        </div>

        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          data-testid="reorder-dialog-live-region"
        >
          {liveMessage}
        </div>
      </div>
    </div>
    /* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
  );
}

// The actual <ul>. Pulled into its own component so the FLIP hook
// can run on every render of the sortable list without re-running
// the modal's effects (focus trap / Esc handler).
function ReorderTaskList({
  tasks,
  taskIds,
  activeDragId,
  firstTaskRef,
}: {
  tasks: readonly ProjectTask[];
  taskIds: readonly string[];
  activeDragId: string | null;
  firstTaskRef: React.RefObject<HTMLLIElement | null>;
}) {
  const isRowDragging = useCallback(
    (id: string) => id === activeDragId,
    [activeDragId],
  );
  const { register } = useFlipAnimation(taskIds, { isRowDragging });
  return (
    <ul className="flex flex-col gap-1">
      {tasks.map((task, idx) => (
        <ReorderTaskRow
          key={task.id}
          task={task}
          flipRef={register(task.id)}
          rowRef={idx === 0 ? firstTaskRef : undefined}
        />
      ))}
    </ul>
  );
}

function ReorderTaskRow({
  task,
  flipRef,
  rowRef,
}: {
  task: ProjectTask;
  flipRef: (node: HTMLElement | null) => void;
  rowRef?: React.RefObject<HTMLLIElement | null>;
}) {
  const sortableHook = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(sortableHook.transform),
    transition: sortableHook.transition,
  };
  function setRef(node: HTMLLIElement | null) {
    sortableHook.setNodeRef(node);
    flipRef(node);
    if (rowRef) {
      // Writing to a RefObject from a callback ref is fine — we own
      // it. (React's RefObject type allows mutation via .current.)
      (rowRef as React.MutableRefObject<HTMLLIElement | null>).current = node;
    }
  }
  return (
    <li
      ref={setRef}
      style={style}
      data-dragging={sortableHook.isDragging ? "true" : undefined}
      {...sortableHook.attributes}
      {...sortableHook.listeners}
      className="flex min-h-[44px] cursor-grab touch-none select-none items-center gap-2 rounded-lg border border-moss-200 bg-moss-50 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-600 active:cursor-grabbing dark:border-moss-700 dark:bg-moss-900"
    >
      <DragHandleIcon />
      <span className="flex-1 font-medium">{task.title}</span>
    </li>
  );
}

function DragHandleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="currentColor"
      className="text-moss-500 dark:text-moss-300"
    >
      <circle cx="5" cy="4" r="1.2" />
      <circle cx="11" cy="4" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="11" cy="12" r="1.2" />
    </svg>
  );
}
