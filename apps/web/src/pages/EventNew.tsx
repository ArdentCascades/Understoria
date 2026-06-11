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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import { createEvent, EVENT_START_GRACE_MS } from "@/db/events";
import { getSecretKey } from "@/db/secrets";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { humanizeError } from "@/lib/humanizeError";
import { WhyTooltip } from "@/components/WhyTooltip";
import type { Category } from "@/types";

// Combine a YYYY-MM-DD date input string and a HH:mm time input string
// into an epoch-millis number. Returns `null` when either is empty or
// the combined value doesn't parse — the form treats `null` as "no
// time selected" and refuses to submit. Local time is used (matches
// what the native date/time inputs collect from the device); the
// federated record then stores the resulting UTC epoch ms per
// `EventPayload.startsAt`.
function combineDateAndTime(date: string, time: string): number | null {
  if (!date || !time) return null;
  const ms = new Date(`${date}T${time}`).getTime();
  if (!Number.isFinite(ms)) return null;
  return ms;
}

// Split an epoch-millis into the YYYY-MM-DD + HH:mm pair the inputs
// expect. Used only to seed the start-time inputs with a reasonable
// default (today + next hour) so a member doesn't stare at empty
// fields and wonder what format to type.
function defaultStartParts(): { date: string; time: string } {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
}

export default function EventNewPage() {
  const { currentMember, nodeId, lockState } = useApp();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const initialStart = useMemo(defaultStartParts, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [startDate, setStartDate] = useState(initialStart.date);
  const [startTime, setStartTime] = useState(initialStart.time);
  const [hasEnd, setHasEnd] = useState(false);
  const [endDate, setEndDate] = useState(initialStart.date);
  const [endTime, setEndTime] = useState(initialStart.time);
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentMember) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmedTitle = title.trim();
    const trimmedLocation = location.trim();
    if (!trimmedTitle) {
      setError(t("events.new.errorTitleRequired"));
      return;
    }
    if (!trimmedLocation) {
      setError(t("events.new.errorLocationRequired"));
      return;
    }
    const startsAt = combineDateAndTime(startDate, startTime);
    if (startsAt === null) {
      setError(t("events.new.errorStartRequired"));
      return;
    }
    if (startsAt < Date.now() - EVENT_START_GRACE_MS) {
      setError(t("events.new.errorStartInPast"));
      return;
    }
    let endsAt: number | null = null;
    if (hasEnd) {
      const candidate = combineDateAndTime(endDate, endTime);
      if (candidate === null) {
        setError(t("events.new.errorEndInvalid"));
        return;
      }
      if (candidate <= startsAt) {
        setError(t("events.new.errorEndBeforeStart"));
        return;
      }
      endsAt = candidate;
    }
    let capacityValue: number | null = null;
    if (capacity.trim() !== "") {
      const parsed = Number.parseInt(capacity, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setError(t("events.new.errorCapacityInvalid"));
        return;
      }
      capacityValue = parsed;
    }
    if (lockState === "locked") {
      setError(t("events.new.errorLocked"));
      return;
    }
    try {
      setSubmitting(true);
      const organizerKey = currentMember!.publicKey;
      const organizerSecretKey = await getSecretKey(organizerKey);
      const event = await createEvent({
        title: trimmedTitle,
        description: description.trim(),
        category,
        startsAt,
        endsAt,
        location: trimmedLocation,
        capacity: capacityValue,
        templateId: null,
        organizerKey,
        organizerSecretKey,
        nodeId,
      });
      showToast(t("events.new.created"));
      navigate(`/events/${event.id}`);
    } catch (err) {
      setError(humanizeError(err) || t("events.new.errorGeneric"));
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
        <h1 className="page-title mt-2">{t("events.new.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("events.new.subtitle")}
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-2xl flex-col gap-4"
        noValidate
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("events.new.titleField")}
          </span>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("events.new.titlePlaceholder")}
            maxLength={200}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("events.new.descriptionField")}
          </span>
          <textarea
            className="input min-h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("events.new.descriptionPlaceholder")}
            maxLength={2000}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("events.new.category")}
          </span>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].emoji} {t(`categories.${c}`)}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">
            {t("events.new.startsAt")}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label={t("events.new.startDateAria")}
              required
            />
            <input
              type="time"
              className="input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              aria-label={t("events.new.startTimeAria")}
              required
            />
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={hasEnd}
              onChange={(e) => setHasEnd(e.target.checked)}
              className="h-4 w-4 rounded border-moss-300"
            />
            {t("events.new.addEndTime")}
          </label>
          {hasEnd && (
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">{t("events.new.endsAt")}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="date"
                  className="input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  aria-label={t("events.new.endDateAria")}
                />
                <input
                  type="time"
                  className="input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  aria-label={t("events.new.endTimeAria")}
                />
              </div>
            </fieldset>
          )}
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("events.new.locationField")}
          </span>
          <input
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("events.new.locationPlaceholder")}
            maxLength={200}
            required
          />
          <span className="text-xs text-moss-500 dark:text-moss-300">
            {t("events.new.locationHint")}
          </span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("events.new.capacityField")}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            className="input"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          <span className="text-xs text-moss-500 dark:text-moss-300">
            {t("events.new.capacityHint")}
          </span>
        </label>

        {/* "What you're signing" comparison card — mirrors the
            discipline of the co-organizer invitation acceptance card.
            Names the consequences of the signature BEFORE the member
            submits, not after. Content adapted from
            docs/community-events.md §3. */}
        <section
          aria-labelledby="events-signing-heading"
          className="rounded-2xl border border-canopy-200 bg-canopy-50 p-4 dark:border-canopy-900/50 dark:bg-canopy-950/30"
        >
          <div className="mb-2 inline-flex items-baseline gap-1.5">
            <h2
              id="events-signing-heading"
              className="text-sm font-semibold uppercase tracking-wide text-canopy-800 dark:text-canopy-200"
            >
              {t("events.new.signingHeading")}
            </h2>
            <WhyTooltip principleId="privacy-precondition" />
          </div>
          <p className="text-sm font-medium text-canopy-900 dark:text-canopy-100">
            {t("events.new.signingMeansTitle")}
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm text-canopy-900 dark:text-canopy-100">
            <li>{t("events.new.signingMeansOrganizer")}</li>
            <li>{t("events.new.signingMeansPublic")}</li>
            <li>{t("events.new.signingMeansPermanent")}</li>
            <li>{t("events.new.signingMeansRsvp")}</li>
          </ul>
          <p className="mt-3 text-sm font-medium text-canopy-900 dark:text-canopy-100">
            {t("events.new.signingNotTitle")}
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm text-canopy-900 dark:text-canopy-100">
            <li>{t("events.new.signingNotEditable")}</li>
            <li>{t("events.new.signingNotPrivate")}</li>
          </ul>
        </section>

        {error && (
          <p
            role="alert"
            className="text-sm text-rose-700 dark:text-rose-300"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting
              ? t("events.new.submitting")
              : t("events.new.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
