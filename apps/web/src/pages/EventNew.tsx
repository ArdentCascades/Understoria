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
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import { createEvent, EVENT_START_GRACE_MS } from "@/db/events";
import { scheduleProjectWorkDay } from "@/db/eventProjectLinks";
import { isOrganizer } from "@/db/projects";
import { getSecretKey } from "@/db/secrets";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { humanizeError } from "@/lib/humanizeError";
import { WhyTooltip } from "@/components/WhyTooltip";
import { MarkdownHint } from "@/components/MarkdownHint";
import { EventTemplatePicker } from "@/components/EventTemplatePicker";
import { getEventTemplate } from "@/content/eventTemplates";

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

// Split an epoch-millis into the YYYY-MM-DD + HH:mm pair the native
// date/time inputs expect (local-clock, matching what they collect).
function splitDateAndTime(ms: number): { date: string; time: string } {
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
}

// Seed the start-time inputs with a reasonable default (today + next
// hour) so a member doesn't stare at empty fields.
function defaultStartParts(): { date: string; time: string } {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return splitDateAndTime(d.getTime());
}

// Fallback label for an event-specific category string the i18n
// `categories.*` block doesn't yet carry a key for ("social" → "Social").
function prettifyCategory(c: string): string {
  const s = c.replace(/[_-]+/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function EventNewPage() {
  const { currentMember, nodeId, lockState, projects } = useApp();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialStart = useMemo(defaultStartParts, []);

  // Work-day context: when `?projectId=` resolves to a project this
  // member organizes, the form becomes "Schedule a work day" — a banner
  // appears, title/description/category seed once, and submit links the
  // event to the project. A non-organizer (or an unknown id) gets the
  // plain form; authority is re-checked again in the data layer, so a
  // hand-crafted URL can never forge the link.
  const projectIdParam = searchParams.get("projectId");
  const workDayProject = useMemo(() => {
    if (!projectIdParam || !currentMember) return null;
    const p = projects.find((proj) => proj.id === projectIdParam);
    if (!p || !isOrganizer(p, currentMember.publicKey)) return null;
    return p;
  }, [projectIdParam, projects, currentMember]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Free-text string, not the legacy `Category` enum: a template may set
  // an event-specific category ("social", "celebration", "learning") that
  // rides the free-text wire `category` field. The select below surfaces
  // a non-legacy value as its own option so it shows and is preserved.
  const [category, setCategory] = useState<string>("other");
  const [startDate, setStartDate] = useState(initialStart.date);
  const [startTime, setStartTime] = useState(initialStart.time);
  const [hasEnd, setHasEnd] = useState(false);
  const [endDate, setEndDate] = useState(initialStart.date);
  const [endTime, setEndTime] = useState(initialStart.time);
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The chosen template id, threaded to the signed `templateId` on
  // submit. `null` = "from scratch" (the plain form). The work-day
  // deep-link sets it to "work-day" — work-day is just the first
  // template (it additionally writes the local event⇄project link).
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [pickerExpanded, setPickerExpanded] = useState(true);
  const titleRef = useRef<HTMLInputElement>(null);

  // Seed the work-day prefill exactly once, when the project first
  // resolves (it may arrive a tick after mount as the live query
  // settles). The ref guard means a member's own edits are never
  // clobbered by a re-render. Location is deliberately NEVER prefilled —
  // it's the threat-model-sensitive field and must be typed by hand.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !workDayProject) return;
    seededRef.current = true;
    setSelectedTemplateId("work-day");
    setTitle(t("events.new.workDayTitlePrefill", { project: workDayProject.title }));
    setDescription(
      t("events.new.workDayDescriptionPrefill", { project: workDayProject.title }),
    );
    const cat = workDayProject.category;
    setCategory(
      (ALL_CATEGORIES as readonly string[]).includes(cat) ? cat : "other",
    );
  }, [workDayProject, t]);

  if (!currentMember) return null;

  const lang = i18n.resolvedLanguage ?? "en";
  const pickedTemplate = selectedTemplateId
    ? (getEventTemplate(selectedTemplateId, lang) ?? null)
    : null;

  function handleSelectTemplate(templateId: string | null) {
    setSelectedTemplateId(templateId);
    setPickerExpanded(false);
    // "Start from scratch" — leave fields as they are (don't clobber a
    // member who already typed); the event just carries no templateId.
    if (templateId === null) return;
    const tpl = getEventTemplate(templateId, lang);
    if (!tpl) return;
    setTitle(tpl.titleScaffold);
    setDescription(tpl.descriptionScaffold);
    setCategory(tpl.category);
    // Auto-apply the suggested duration as an editable end time. NEVER a
    // location. Computed from the current start fields.
    const startMs = combineDateAndTime(startDate, startTime);
    if (startMs !== null) {
      const end = splitDateAndTime(
        startMs + tpl.suggestedDurationMinutes * 60_000,
      );
      setHasEnd(true);
      setEndDate(end.date);
      setEndTime(end.time);
    }
    // Focus the title and place the caret after the scaffold stem so the
    // member types straight into the completion ("Potluck — ▮").
    requestAnimationFrame(() => {
      const el = titleRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  }

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
      const eventInput = {
        title: trimmedTitle,
        description: description.trim(),
        category,
        startsAt,
        endsAt,
        location: trimmedLocation,
        capacity: capacityValue,
        templateId: selectedTemplateId,
        organizerKey,
        organizerSecretKey,
        nodeId,
      };
      // When scheduling a work day, the same signed event is created and
      // a local-only link is written in one transaction. Otherwise it's
      // a plain event — the federated record is identical either way.
      const event = workDayProject
        ? await scheduleProjectWorkDay({
            ...eventInput,
            projectId: workDayProject.id,
          })
        : await createEvent(eventInput);
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

      {workDayProject ? (
        // Work-day deep-link: the work-day banner, no gallery (the
        // template is fixed to "work-day"; the form is already seeded).
        <section
          aria-labelledby="workday-banner-heading"
          className="mx-auto mb-4 max-w-2xl rounded-2xl border border-canopy-200 bg-canopy-50 p-4 dark:border-canopy-900/50 dark:bg-canopy-950/30"
        >
          <h2
            id="workday-banner-heading"
            className="text-sm font-semibold text-canopy-900 dark:text-canopy-100"
          >
            {t("events.new.workDayBannerTitle", { project: workDayProject.title })}
          </h2>
          <p className="mt-1 text-sm text-canopy-900 dark:text-canopy-100">
            {t("events.new.workDayBannerBody")}
          </p>
        </section>
      ) : (
        <div className="mx-auto mb-4 max-w-2xl">
          {pickerExpanded ? (
            <div id="event-template-picker">
              <EventTemplatePicker
                selectedId={selectedTemplateId}
                onSelect={handleSelectTemplate}
              />
            </div>
          ) : (
            <section className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-canopy-200 bg-canopy-50 p-3 dark:border-canopy-900/50 dark:bg-canopy-950/30">
              <p className="text-sm text-canopy-900 dark:text-canopy-100">
                {pickedTemplate
                  ? t("events.templates.selected", { name: pickedTemplate.name })
                  : t("events.templates.collapsedScratch")}
              </p>
              <button
                type="button"
                className="btn-secondary text-sm"
                aria-expanded={false}
                aria-controls="event-template-picker"
                onClick={() => setPickerExpanded(true)}
              >
                {pickedTemplate
                  ? t("events.templates.collapsedChange")
                  : t("events.templates.collapsedPick")}
              </button>
            </section>
          )}
        </div>
      )}

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
            ref={titleRef}
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
          <MarkdownHint />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("events.new.category")}
          </span>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {/* When a template set an event-specific category (e.g.
                "social"), surface it as an option so the value shows and
                is preserved. Task 4 gives these first-class labels/emoji;
                until then a humanized fallback. */}
            {!(ALL_CATEGORIES as readonly string[]).includes(category) && (
              <option value={category}>
                {t(`categories.${category}`, {
                  defaultValue: prettifyCategory(category),
                })}
              </option>
            )}
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
          <span className="text-xs text-moss-600 dark:text-moss-300">
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
          <span className="text-xs text-moss-600 dark:text-moss-300">
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
