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
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { createPost } from "@/db/actions";
import { humanizeError } from "@/lib/humanizeError";
import type { Category, PostType, Urgency } from "@/types";

export default function PostFormPage() {
  const { currentMember, nodeId } = useApp();
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialType: PostType =
    (params.get("type") as PostType) === "OFFER" ? "OFFER" : "NEED";

  const [type, setType] = useState<PostType>(initialType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [hours, setHours] = useState("1");
  const [urgency, setUrgency] = useState<Urgency>("low");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!currentMember) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError(t("postForm.errorNeedTitle"));
      return;
    }
    const parsedHours = Number.parseFloat(hours);
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      setError(t("postForm.errorHoursPositive"));
      return;
    }
    const days = expiresInDays ? Number.parseInt(expiresInDays, 10) : null;
    const expiresAt =
      days && Number.isFinite(days) && days > 0
        ? Date.now() + days * 24 * 60 * 60 * 1000
        : null;
    try {
      setSubmitting(true);
      await createPost(
        currentMember!.publicKey,
        currentMember!.locationZone,
        {
          type,
          category,
          title,
          description,
          estimatedHours: parsedHours,
          urgency,
          expiresAt,
        },
        nodeId,
      );
      navigate("/");
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
          {type === "NEED" ? t("postForm.titleNeed") : t("postForm.titleOffer")}
        </h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {type === "NEED"
            ? t("postForm.subtitleNeed")
            : t("postForm.subtitleOffer")}
        </p>
      </header>

      <div
        role="tablist"
        aria-label={t("postForm.tabAriaLabel")}
        className="mb-5 grid grid-cols-2 rounded-full bg-moss-100 p-1 dark:bg-moss-900"
      >
        {(["NEED", "OFFER"] as const).map((tt) => (
          <button
            key={tt}
            type="button"
            role="tab"
            aria-selected={type === tt}
            onClick={() => setType(tt)}
            className={`touch-target rounded-full text-sm font-semibold transition-colors ${
              type === tt
                ? "bg-white text-canopy-800 shadow-sm dark:bg-moss-950 dark:text-canopy-200"
                : "text-moss-700 dark:text-moss-300"
            }`}
          >
            {tt === "NEED" ? t("postForm.tabNeed") : t("postForm.tabOffer")}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t("postForm.fieldTitle")}</span>
          <input
            className="input"
            placeholder={
              type === "NEED"
                ? t("postForm.placeholderTitleNeed")
                : t("postForm.placeholderTitleOffer")
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("postForm.fieldDescription")}
          </span>
          <textarea
            className="input min-h-28"
            placeholder={t("postForm.placeholderDescription")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("postForm.fieldCategory")}
          </span>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t("postForm.categoryOption", {
                  emoji: CATEGORY_META[c].emoji,
                  label: t(`categories.${c}`),
                  description: CATEGORY_META[c].description,
                })}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t("postForm.fieldHours")}</span>
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
            <span className="text-xs text-moss-500 dark:text-moss-400">
              {t("postForm.fieldHoursHint")}
            </span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("postForm.fieldUrgency")}
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

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("postForm.fieldExpiresInDays")}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            className="input"
            placeholder={t("postForm.expiresPlaceholder")}
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
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
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? t("postForm.submitting") : t("postForm.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
