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
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import {
  addProjectTask,
  claimProjectTask,
  completeProject,
  confirmProjectTaskCompletion,
  launchProject,
  markProjectTaskComplete,
  pauseProject,
  resumeProject,
  unclaimProjectTask,
} from "@/db/projects";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { formatHours, formatRelativeTime } from "@/lib/format";
import type {
  Project,
  ProjectCategory,
  ProjectTask,
  Urgency,
} from "@/types";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, projectTasks, members, currentMember, nodeId } = useApp();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const project = useMemo(
    () => projects.find((p) => p.id === id) ?? null,
    [projects, id],
  );
  const tasks = useMemo(
    () =>
      projectTasks
        .filter((task) => task.projectId === id)
        .sort((a, b) => a.createdAt - b.createdAt),
    [projectTasks, id],
  );
  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m.displayName])),
    [members],
  );

  if (!project) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("projects.detail.notFound")}
        </p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => navigate("/")}
        >
          {t("projects.detail.back")}
        </button>
      </div>
    );
  }

  const isOrganizer = currentMember?.publicKey === project.organizerKey;
  const percent =
    project.targetHours > 0
      ? Math.min(
          100,
          Math.round((project.contributedHours / project.targetHours) * 100),
        )
      : 0;
  const contributors = new Set(
    tasks
      .filter((task) => task.status === "completed" && task.completedBy)
      .map((task) => task.completedBy as string),
  );

  async function run<T>(action: () => Promise<T>): Promise<T | null> {
    try {
      setError(null);
      return await action();
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <button
        type="button"
        className="btn-ghost -ml-2 mb-3 text-sm"
        onClick={() => navigate("/")}
      >
        {t("projects.detail.back")}
      </button>

      <div className="card mb-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
            {t(`projects.status${capitalize(project.status)}` as `projects.statusActive`)}
          </span>
          <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
            {project.category.replace(/_/g, " ")}
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-tight">{project.title}</h1>
        {project.description && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-moss-700 dark:text-moss-200">
            {project.description}
          </p>
        )}
        <div className="mt-4">
          <div
            className="h-3 overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div
              className="h-full rounded-full bg-canopy-600 transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
            {t("projects.progressLabel", {
              contributed: formatHours(project.contributedHours),
              target: formatHours(project.targetHours),
              percent,
            })}
          </p>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Field
            label={t("projects.byOrganizer", {
              name: memberMap.get(project.organizerKey) ?? "—",
            })}
          >
            {formatRelativeTime(project.createdAt)}
          </Field>
          {project.locationZone && (
            <Field label={t("projects.detail.area", { area: project.locationZone })}>
              {project.locationZone}
            </Field>
          )}
          {project.deadline && (
            <Field
              label={t("projects.detail.deadline", {
                date: new Date(project.deadline).toLocaleDateString(),
              })}
            >
              {new Date(project.deadline).toLocaleDateString()}
            </Field>
          )}
          <Field label={t("projects.detail.contributors", { count: contributors.size })}>
            {contributors.size}
          </Field>
        </dl>
        {project.status === "completed" && project.completedAt && (
          <p className="mt-3 rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100">
            {t("projects.detail.completed", {
              when: formatRelativeTime(project.completedAt),
            })}
          </p>
        )}
        {project.status === "paused" && project.pauseNote && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {t("projects.detail.paused", { note: project.pauseNote })}
          </p>
        )}
      </div>

      {isOrganizer && (
        <OrganizerControls project={project} onRun={run} />
      )}

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {error}
        </p>
      )}

      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
          {t("projects.detail.tasks")}
        </h2>
        {tasks.length === 0 ? (
          <p className="card text-sm text-moss-600 dark:text-moss-300">
            {t("projects.detail.noTasks")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskRow
                  task={task}
                  isOrganizer={isOrganizer}
                  currentKey={currentMember?.publicKey}
                  memberMap={memberMap}
                  nodeId={nodeId}
                  onRun={run}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {isOrganizer &&
        project.status !== "completed" &&
        project.status !== "archived" && (
          <AddTaskForm project={project} onRun={run} />
        )}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-moss-500">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}

function OrganizerControls({
  project,
  onRun,
}: {
  project: Project;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const [pauseNote, setPauseNote] = useState("");
  const [showPauseForm, setShowPauseForm] = useState(false);

  return (
    <div className="card mb-4 flex flex-col gap-3">
      {project.status === "planning" && (
        <>
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              onRun(() => launchProject(project.id, project.organizerKey))
            }
          >
            {t("projects.detail.launch")}
          </button>
          <p className="text-xs text-moss-500 dark:text-moss-400">
            {t("projects.detail.launchHint")}
          </p>
        </>
      )}
      {project.status === "active" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowPauseForm((v) => !v)}
          >
            {t("projects.detail.pause")}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              onRun(() => completeProject(project.id, project.organizerKey))
            }
          >
            {t("projects.detail.markComplete")}
          </button>
        </div>
      )}
      {project.status === "active" && showPauseForm && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await onRun(() =>
              pauseProject(project.id, project.organizerKey, pauseNote),
            );
            if (ok) {
              setShowPauseForm(false);
              setPauseNote("");
            }
          }}
          className="flex flex-col gap-2"
        >
          <input
            className="input"
            placeholder="Why pause? (one short line)"
            value={pauseNote}
            onChange={(e) => setPauseNote(e.target.value)}
            maxLength={140}
          />
          <button type="submit" className="btn-primary self-end">
            {t("projects.detail.pause")}
          </button>
        </form>
      )}
      {project.status === "paused" && (
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            onRun(() => resumeProject(project.id, project.organizerKey))
          }
        >
          {t("projects.detail.resume")}
        </button>
      )}
    </div>
  );
}

function TaskRow({
  task,
  isOrganizer,
  currentKey,
  memberMap,
  nodeId,
  onRun,
}: {
  task: ProjectTask;
  isOrganizer: boolean;
  currentKey: string | undefined;
  memberMap: Map<string, string>;
  nodeId: string;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const isAssignee = task.assignedTo === currentKey;
  const isCompleter = task.completedBy === currentKey;

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`chip ${statusChipClass(task.status)}`}
          title={task.status}
        >
          {t(`projects.task.status${capitalize(task.status === "awaiting_confirmation" ? "Awaiting" : task.status)}` as `projects.task.statusOpen`)}
        </span>
        <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
          {formatHours(task.estimatedHours)}
        </span>
      </div>
      <h3 className="text-base font-semibold leading-snug">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {task.description}
        </p>
      )}
      {task.assignedTo && (
        <p className="text-xs text-moss-500 dark:text-moss-400">
          {task.status === "awaiting_confirmation"
            ? t("projects.task.completedBy", {
                name: memberMap.get(task.completedBy ?? "") ?? "—",
              })
            : t("projects.task.claimedBy", {
                name: memberMap.get(task.assignedTo) ?? "—",
              })}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {task.status === "open" && currentKey && !isOrganizer && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => onRun(() => claimProjectTask(task.id, currentKey))}
          >
            {t("projects.task.claim")}
          </button>
        )}
        {task.status === "claimed" && isAssignee && (
          <>
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                onRun(() => markProjectTaskComplete(task.id, currentKey!))
              }
            >
              {t("projects.task.markDone")}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => onRun(() => unclaimProjectTask(task.id, currentKey!))}
            >
              {t("projects.task.release")}
            </button>
          </>
        )}
        {task.status === "awaiting_confirmation" && isOrganizer && !isCompleter && (
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              onRun(() =>
                confirmProjectTaskCompletion(task.id, currentKey!, nodeId),
              )
            }
          >
            {t("projects.task.confirm")}
          </button>
        )}
        {task.status === "awaiting_confirmation" && !isOrganizer && (
          <span className="text-xs text-moss-500 dark:text-moss-400">
            {t("projects.task.awaitingConfirmation")}
          </span>
        )}
      </div>
    </div>
  );
}

function statusChipClass(status: ProjectTask["status"]): string {
  switch (status) {
    case "open":
      return "bg-canopy-50 text-canopy-800 dark:bg-canopy-950/40 dark:text-canopy-100";
    case "claimed":
      return "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200";
    case "awaiting_confirmation":
      return "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100";
    case "completed":
      return "bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100";
    case "blocked":
      return "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100";
  }
}

function AddTaskForm({
  project,
  onRun,
}: {
  project: Project;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("1");
  const [urgency, setUrgency] = useState<Urgency>("low");
  const [category, setCategory] = useState<ProjectCategory>(project.category);
  const [skills, setSkills] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const h = Number.parseFloat(hours);
    if (!Number.isFinite(h) || h <= 0) return;
    setSubmitting(true);
    const ok = await onRun(() =>
      addProjectTask(project.id, project.organizerKey, {
        title,
        description,
        category,
        estimatedHours: h,
        urgency,
        requiredSkills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        dependencies: [],
      }),
    );
    setSubmitting(false);
    if (ok) {
      setTitle("");
      setDescription("");
      setHours("1");
      setUrgency("low");
      setCategory(project.category);
      setSkills("");
    }
  }

  return (
    <section className="card mb-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("projects.detail.addTaskTitle")}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {t("projects.task.addTask.fieldTitle")}
          </span>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {t("projects.task.addTask.fieldDescription")}
          </span>
          <textarea
            className="input min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {t("projects.task.addTask.fieldHours")}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              className="input"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {t("projects.task.addTask.fieldUrgency")}
            </span>
            <select
              className="input"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
            >
              <option value="low">{t("urgency.low")}</option>
              <option value="medium">{t("urgency.medium")}</option>
              <option value="high">{t("urgency.high")}</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {t("projects.task.addTask.fieldCategory")}
          </span>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProjectCategory)}
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].emoji} {t(`categories.${c}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {t("projects.task.addTask.fieldSkills")}
          </span>
          <input
            className="input"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="carpentry, listening"
          />
        </label>
        <button
          type="submit"
          className="btn-primary self-end"
          disabled={submitting}
        >
          {submitting
            ? t("projects.task.addTask.submitting")
            : t("projects.task.addTask.submit")}
        </button>
      </form>
    </section>
  );
}
