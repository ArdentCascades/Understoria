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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { createProject } from "@/db/projects";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { humanizeError } from "@/lib/humanizeError";
import type { ProjectCategory } from "@/types";

export default function ProjectNewPage() {
  const { currentMember, nodeId } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("other");
  const [targetHours, setTargetHours] = useState("10");
  const [deadlineDays, setDeadlineDays] = useState("");
  const [area, setArea] = useState(currentMember?.locationZone ?? "");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentMember) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError(t("projects.create.errorTitle"));
      return;
    }
    const hours = Number.parseFloat(targetHours);
    if (!Number.isFinite(hours) || hours <= 0) {
      setError(t("projects.create.errorHours"));
      return;
    }
    const days = deadlineDays ? Number.parseInt(deadlineDays, 10) : null;
    const deadline =
      days && Number.isFinite(days) && days > 0
        ? Date.now() + days * 24 * 60 * 60 * 1000
        : null;
    try {
      setSubmitting(true);
      const project = await createProject(
        currentMember!.publicKey,
        {
          title,
          description,
          category,
          targetHours: hours,
          deadline,
          locationZone: area,
          tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
        },
        nodeId,
      );
      navigate(`/project/${project.id}`);
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={() => navigate(-1)}
        >
          {t("common.back")}
        </button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {t("projects.create.title")}
        </h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("projects.create.subtitle")}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("projects.create.fieldTitle")}
          </span>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("projects.create.fieldDescription")}
          </span>
          <textarea
            className="input min-h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("projects.create.fieldCategory")}
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
            <option value="infrastructure">🏗️ Infrastructure</option>
            <option value="organizing">📋 Organizing</option>
            <option value="mutual_aid_drive">💛 Mutual aid drive</option>
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("projects.create.fieldTargetHours")}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              className="input"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              required
            />
            <span className="text-xs text-moss-500 dark:text-moss-400">
              {t("projects.create.fieldTargetHoursHint")}
            </span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("projects.create.fieldDeadlineDays")}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              className="input"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(e.target.value)}
            />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("projects.create.fieldArea")}
          </span>
          <input
            className="input"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            maxLength={80}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("projects.create.fieldTags")}
          </span>
          <input
            className="input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="garden, tool-library"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            {t("common.cancel")}
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting
              ? t("projects.create.submitting")
              : t("projects.create.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
