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
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { cancelPost, createPost } from "@/db/actions";
import { humanizeError } from "@/lib/humanizeError";
import { clearDraft, loadDraft, type Draft } from "@/db/drafts";
import { useDraftAutosave } from "@/lib/useDraftAutosave";
import { DraftBanner } from "@/components/DraftBanner";
import { WhyTooltip } from "@/components/WhyTooltip";
import {
  combine,
  optional,
  positiveInteger,
  positiveNumber,
  required,
  useFieldValidation,
  type Validator,
} from "@/lib/validation";
import type { Category, PostType, Urgency } from "@/types";

const DRAFT_KEY = "post-new";

interface PostDraftPayload {
  type: PostType;
  title: string;
  description: string;
  category: Category;
  hours: string;
  urgency: Urgency;
  expiresInDays: string;
}

type FieldName = "title" | "hours" | "expiresInDays";

const VALIDATORS: Record<FieldName, Validator> = {
  title: required("postForm.errorNeedTitle"),
  hours: combine(
    required("postForm.errorHoursPositive"),
    positiveNumber("postForm.errorHoursPositive"),
  ),
  expiresInDays: optional(positiveInteger("postForm.errorExpiresInDays")),
};

export default function PostFormPage() {
  const { currentMember, posts, nodeId } = useApp();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const repostId = params.get("repost");
  const repostAgain = params.get("again") === "1";
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
  const [pendingDraft, setPendingDraft] =
    useState<Draft<PostDraftPayload> | null>(null);

  const validation = useFieldValidation<FieldName>(
    { title, hours, expiresInDays },
    VALIDATORS,
  );

  // Open NEEDs in the same category — used by both the inline
  // matching-needs hint (visible <lg) and the lg+ "Active needs in
  // this category" aside (Phase 2.4). Filtering on type/category/
  // status only; no title-similarity heuristic — the aside is
  // solidarity routing, not duplicate detection (which the
  // optimization plan explicitly ruled out as gating behavior).
  const matchingNeeds = useMemo(() => {
    if (type !== "OFFER" || !category) return [];
    return posts.filter(
      (p) => p.type === "NEED" && p.category === category && p.status === "open",
    );
  }, [posts, type, category]);

  useEffect(() => {
    let cancelled = false;
    void loadDraft<PostDraftPayload>(DRAFT_KEY).then((draft) => {
      if (!cancelled && draft) setPendingDraft(draft);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!repostId || !posts.length) return;
    const source = posts.find((p) => p.id === repostId);
    if (!source) return;
    setType(source.type);
    setTitle(source.title);
    setDescription(source.description);
    setCategory(source.category);
    setHours(String(source.estimatedHours));
    setUrgency(source.urgency);
    if (source.expiresAt) {
      const daysLeft = Math.max(1, Math.ceil((source.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
      setExpiresInDays(String(daysLeft));
    }
  }, [repostId, posts]);

  // Treat "user has typed something meaningful" as dirty. The
  // defaults (category=other, hours=1, urgency=low) match a fresh
  // form so we only autosave once the user has actually contributed
  // a title or description.
  const isDirty = title.trim() !== "" || description.trim() !== "";
  useDraftAutosave<PostDraftPayload>(
    DRAFT_KEY,
    { type, title, description, category, hours, urgency, expiresInDays },
    { enabled: pendingDraft === null && isDirty && !submitting },
  );

  function handleRestoreDraft() {
    if (!pendingDraft) return;
    const p = pendingDraft.payload;
    setType(p.type);
    setTitle(p.title);
    setDescription(p.description);
    setCategory(p.category);
    setHours(p.hours);
    setUrgency(p.urgency);
    setExpiresInDays(p.expiresInDays);
    setPendingDraft(null);
  }

  async function handleDiscardDraft() {
    await clearDraft(DRAFT_KEY);
    setPendingDraft(null);
  }

  if (!currentMember) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    validation.markAllTouched();
    if (validation.hasErrors) return;
    const parsedHours = Number.parseFloat(hours);
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
      if (repostId && !repostAgain) {
        try {
          await cancelPost(repostId, currentMember!.publicKey);
        } catch {
          // Original may already be claimed/cancelled — fine to ignore
        }
      }
      await clearDraft(DRAFT_KEY);
      showToast(
        t(type === "NEED" ? "toast.needPosted" : "toast.offerPosted"),
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
        <h1 className="page-title mt-2">
          {type === "NEED" ? t("postForm.titleNeed") : t("postForm.titleOffer")}
        </h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {type === "NEED"
            ? t("postForm.subtitleNeed")
            : t("postForm.subtitleOffer")}
        </p>
      </header>

      {repostId && (
        <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {t("postForm.repostBanner")}
        </p>
      )}

      {/* Phase 2.4: 2-col at lg+ — form stays capped at max-w-2xl
          (deliberately narrow for long-form input); a sticky aside on
          the right surfaces open NEEDs that this OFFER could match, so
          the member sees existing demand before they finalize. Below
          lg the aside is hidden and a one-liner hint stays in the form
          so small-viewport members still get the routing signal.
          Aside is informational, never blocking — see the
          `matchingNeeds` useMemo for why this is solidarity routing
          and not duplicate detection. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-6">
      <div className="lg:col-start-1 lg:row-start-1 lg:min-w-0 lg:max-w-2xl">
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

      {pendingDraft && (
        <DraftBanner
          updatedAt={pendingDraft.updatedAt}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
            onBlur={() => validation.onBlur("title")}
            aria-invalid={validation.shouldShowError("title") || undefined}
            aria-describedby={
              validation.shouldShowError("title") ? "title-error" : undefined
            }
            maxLength={120}
            required
          />
          {validation.shouldShowError("title") && (
            <p
              id="title-error"
              role="alert"
              className="text-xs text-rose-700 dark:text-rose-300"
            >
              {t(validation.errors.title!.key)}
            </p>
          )}
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

        <fieldset className="rounded-xl border border-moss-200 p-3 dark:border-moss-800">
          <legend className="px-1 text-xs uppercase tracking-wide text-moss-500 dark:text-moss-300">
            {t("postForm.fieldCategory")}
          </legend>
          <div className="flex flex-col gap-2">
            {ALL_CATEGORIES.map((c) => (
              <label key={c} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="category"
                  value={c}
                  checked={category === c}
                  onChange={() => setCategory(c)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">
                    {CATEGORY_META[c].emoji} {t(`categories.${c}`)}
                  </span>{" "}
                  <span className="text-xs text-moss-500 dark:text-moss-300">
                    — {CATEGORY_META[c].description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {matchingNeeds.length > 0 && (
          <p className="text-xs text-canopy-700 dark:text-canopy-300 lg:hidden">
            <Link
              to={`/?tab=NEED&category=${category}`}
              className="underline-offset-2 hover:underline"
            >
              {t("postForm.matchingNeeds", { count: matchingNeeds.length })}
            </Link>
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("postForm.fieldHours")}
              <WhyTooltip principleId="equal-time" />
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              className="input"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              onBlur={() => validation.onBlur("hours")}
              aria-invalid={validation.shouldShowError("hours") || undefined}
              aria-describedby={
                validation.shouldShowError("hours")
                  ? "hours-error"
                  : "hours-hint"
              }
              required
            />
            {validation.shouldShowError("hours") ? (
              <p
                id="hours-error"
                role="alert"
                className="text-xs text-rose-700 dark:text-rose-300"
              >
                {t(validation.errors.hours!.key)}
              </p>
            ) : (
              <span
                id="hours-hint"
                className="text-xs text-moss-500 dark:text-moss-300"
              >
                {t("postForm.fieldHoursHint")}
              </span>
            )}
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
            onBlur={() => validation.onBlur("expiresInDays")}
            aria-invalid={
              validation.shouldShowError("expiresInDays") || undefined
            }
            aria-describedby={
              validation.shouldShowError("expiresInDays")
                ? "expiresInDays-error"
                : undefined
            }
          />
          {validation.shouldShowError("expiresInDays") && (
            <p
              id="expiresInDays-error"
              role="alert"
              className="text-xs text-rose-700 dark:text-rose-300"
            >
              {t(validation.errors.expiresInDays!.key)}
            </p>
          )}
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

      {matchingNeeds.length > 0 && (
        <aside
          aria-labelledby="matching-needs-aside-heading"
          className="hidden lg:col-start-2 lg:row-start-1 lg:sticky lg:top-4 lg:self-start lg:block"
        >
          <div className="card">
            <h2
              id="matching-needs-aside-heading"
              className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300"
            >
              {t("postForm.matchingNeedsAside.title")}
            </h2>
            <ul className="flex flex-col gap-2">
              {matchingNeeds.slice(0, 3).map((need) => (
                <li key={need.id}>
                  <Link
                    to={`/post/${need.id}`}
                    className="block rounded-lg p-2 text-sm text-canopy-700 hover:bg-moss-50 dark:text-canopy-300 dark:hover:bg-moss-900"
                  >
                    {need.title}
                  </Link>
                </li>
              ))}
            </ul>
            {matchingNeeds.length > 3 && (
              <Link
                to={`/?tab=NEED&category=${category}`}
                className="mt-2 inline-block text-xs text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
              >
                {t("postForm.matchingNeedsAside.seeAll", {
                  count: matchingNeeds.length,
                })}
              </Link>
            )}
          </div>
        </aside>
      )}
      </div>
    </div>
  );
}
