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
import { clearDraft, loadDraft, type Draft } from "@/db/drafts";
import { useDraftAutosave } from "@/lib/useDraftAutosave";
import { DraftBanner } from "@/components/DraftBanner";
import { WhyTooltip } from "@/components/WhyTooltip";
import { MarkdownHint } from "@/components/MarkdownHint";
import { EventTemplatePicker } from "@/components/EventTemplatePicker";
import { getEventTemplate } from "@/content/eventTemplates";
import {
  optional,
  positiveInteger,
  required,
  useFieldValidation,
  type Validator,
} from "@/lib/validation";
import { focusFirstInvalidField } from "@/lib/focusFirstInvalid";

const DRAFT_KEY = "event-new";

interface EventDraftPayload {
  title: string;
  description: string;
  category: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  hasEnd: boolean;
  /** Whether the end date differs from the start date (the end
   *  fieldset's "Ends on a different day" toggle). Optional because
   *  drafts saved before the same-day-end default existed lack it —
   *  restore derives it from `endDate !== startDate` then. */
  endsOtherDay?: boolean;
  location: string;
  capacity: string;
  /** Selected template at save time, `null` for "from scratch".
   *  Carried so a restore doesn't silently strip the signed
   *  `templateId` from the record the member goes on to create
   *  (same rationale as ProjectDraftPayload.templateId). */
  templateId: string | null;
}

type FieldName = "title" | "location" | "capacity" | "startDate" | "startTime";

const VALIDATORS: Record<FieldName, Validator> = {
  title: required("events.new.errorTitleRequired"),
  location: required("events.new.errorLocationRequired"),
  capacity: optional(positiveInteger("events.new.errorCapacityInvalid")),
  // Date and time are separate inputs but share one message — "pick a
  // start date and time" — surfaced at the group, not per-input.
  startDate: required("events.new.errorStartRequired"),
  startTime: required("events.new.errorStartRequired"),
};

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

// Seed only the start DATE (today — harmless and plainly visible in
// the input). The start TIME deliberately begins EMPTY. This form
// used to default it to the next round hour, but an event is a
// permanent, signed, federated record with no edit path (cancel and
// re-create is the only correction), so a plausible-looking default
// time that a member never consciously confirmed is a silent-wrong-
// time risk on every peer node. One extra tap beats an unnoticed
// default on an append-only wire — operator-approved trade-off.
function todayDateString(): string {
  return splitDateAndTime(Date.now()).date;
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

  const initialDate = useMemo(todayDateString, []);

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

  // Deep-link vs draft precedence: arriving WITH `?projectId=` means
  // the member explicitly navigated here to schedule a work day, so
  // the deep-link seed wins — no DraftBanner is offered and autosave
  // is disabled for the whole visit. The stored draft is neither
  // surfaced nor overwritten; it stays in Dexie for a later plain
  // visit. Gated on the raw param (not the resolved project) so the
  // banner can't flash while the live query settles, and so an
  // unknown-id / non-organizer visit degrades consistently.
  const isDeepLinkVisit = projectIdParam !== null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Free-text string, not the legacy `Category` enum: a template may set
  // an event-specific category ("social", "celebration", "learning") that
  // rides the free-text wire `category` field. The select below surfaces
  // a non-legacy value as its own option so it shows and is preserved.
  const [category, setCategory] = useState<string>("other");
  const [startDate, setStartDate] = useState(initialDate);
  const [startTime, setStartTime] = useState("");
  const [hasEnd, setHasEnd] = useState(false);
  const [endDate, setEndDate] = useState(initialDate);
  const [endTime, setEndTime] = useState("");
  // Same-day is the default: with this false, the end DATE field is
  // hidden and the effective end date is the start date, live — a
  // member who moves the start date never has to re-enter it on the
  // end side. The rare overnight event opts in via the toggle.
  const [endsOtherDay, setEndsOtherDay] = useState(false);
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] =
    useState<Draft<EventDraftPayload> | null>(null);
  // The chosen template id, threaded to the signed `templateId` on
  // submit. `null` = "from scratch" (the plain form). The work-day
  // deep-link sets it to "work-day" — work-day is just the first
  // template (it additionally writes the local event⇄project link).
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [pickerExpanded, setPickerExpanded] = useState(true);
  // A template picked before the start time exists parks its suggested
  // duration here; the effect below applies it as an editable end time
  // the moment the start fields become a complete timestamp. Cleared
  // whenever the member touches the end fields themselves, so a hand-
  // set end time is never clobbered by a late-arriving suggestion.
  const [pendingDurationMinutes, setPendingDurationMinutes] = useState<
    number | null
  >(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const validation = useFieldValidation<FieldName>(
    { title, location, capacity, startDate, startTime },
    VALIDATORS,
  );

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

  // Offer a stored draft back — but never on a deep-link visit (see
  // the precedence comment above).
  useEffect(() => {
    if (isDeepLinkVisit) return;
    let cancelled = false;
    void loadDraft<EventDraftPayload>(DRAFT_KEY).then((draft) => {
      if (!cancelled && draft) setPendingDraft(draft);
    });
    return () => {
      cancelled = true;
    };
  }, [isDeepLinkVisit]);

  const isDirty =
    title.trim() !== "" || description.trim() !== "" || location.trim() !== "";
  useDraftAutosave<EventDraftPayload>(
    DRAFT_KEY,
    {
      title,
      description,
      category,
      startDate,
      startTime,
      endDate,
      endTime,
      hasEnd,
      endsOtherDay,
      location,
      capacity,
      templateId: selectedTemplateId,
    },
    {
      enabled:
        !isDeepLinkVisit && pendingDraft === null && isDirty && !submitting,
    },
  );

  // Part 4 follow-through: apply a parked suggested duration once the
  // start fields combine into a real timestamp.
  useEffect(() => {
    if (pendingDurationMinutes === null) return;
    const startMs = combineDateAndTime(startDate, startTime);
    if (startMs === null) return;
    const end = splitDateAndTime(startMs + pendingDurationMinutes * 60_000);
    setHasEnd(true);
    setEndDate(end.date);
    setEndTime(end.time);
    // A suggestion that crosses midnight must surface the date field —
    // otherwise the visible time would silently mean the wrong day.
    setEndsOtherDay(end.date !== startDate);
    setPendingDurationMinutes(null);
  }, [pendingDurationMinutes, startDate, startTime]);

  if (!currentMember) return null;

  const lang = i18n.resolvedLanguage ?? "en";
  const pickedTemplate = selectedTemplateId
    ? (getEventTemplate(selectedTemplateId, lang) ?? null)
    : null;

  function handleRestoreDraft() {
    if (!pendingDraft) return;
    const p = pendingDraft.payload;
    setTitle(p.title);
    setDescription(p.description);
    setCategory(p.category);
    setStartDate(p.startDate);
    setStartTime(p.startTime);
    setEndDate(p.endDate);
    setEndTime(p.endTime);
    setHasEnd(p.hasEnd);
    // Legacy drafts predate the toggle: an end date that differs from
    // the start date is the only signal they carried.
    setEndsOtherDay(p.endsOtherDay ?? (p.hasEnd && p.endDate !== p.startDate));
    setLocation(p.location);
    setCapacity(p.capacity);
    setSelectedTemplateId(p.templateId ?? null);
    setPendingDurationMinutes(null);
    setPendingDraft(null);
    // Mirror handleSelectTemplate's collapse (the #233 rule) — the
    // member has made a decision (continue their draft) and the form
    // is the next thing they care about. Without this, on mobile the
    // template picker stays expanded above the now-populated form and
    // the member has to scroll past every template card to reach
    // their own work.
    setPickerExpanded(false);
  }

  async function handleDiscardDraft() {
    await clearDraft(DRAFT_KEY);
    setPendingDraft(null);
  }

  function handleSelectTemplate(templateId: string | null) {
    setSelectedTemplateId(templateId);
    setPickerExpanded(false);
    // "Start from scratch" — leave fields as they are (don't clobber a
    // member who already typed); the event just carries no templateId.
    if (templateId === null) {
      setPendingDurationMinutes(null);
      return;
    }
    const tpl = getEventTemplate(templateId, lang);
    if (!tpl) return;
    setTitle(tpl.titleScaffold);
    setDescription(tpl.descriptionScaffold);
    setCategory(tpl.category);
    // Auto-apply the suggested duration as an editable end time. NEVER a
    // location. Computed from the current start fields — and since the
    // start time now begins empty, the duration is parked and applied
    // by the effect above the moment the member picks a start time.
    const startMs = combineDateAndTime(startDate, startTime);
    if (startMs !== null) {
      const end = splitDateAndTime(
        startMs + tpl.suggestedDurationMinutes * 60_000,
      );
      setHasEnd(true);
      setEndDate(end.date);
      setEndTime(end.time);
      setEndsOtherDay(end.date !== startDate);
      setPendingDurationMinutes(null);
    } else {
      setPendingDurationMinutes(tpl.suggestedDurationMinutes);
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

  // Cross-field inline errors, derived on change. The past-start check
  // shows the moment both parts are filled and the combination is
  // already behind the clock — same threshold and copy as the submit
  // guard, which stays in place (the clock moves between field-fill
  // and submit; this is defense in depth, not a replacement).
  const startMsNow = combineDateAndTime(startDate, startTime);
  const startRequiredShown =
    validation.shouldShowError("startDate") ||
    validation.shouldShowError("startTime");
  const startInPast =
    startMsNow !== null && startMsNow < Date.now() - EVENT_START_GRACE_MS;
  const startErrorKey = startRequiredShown
    ? "events.new.errorStartRequired"
    : startInPast
      ? "events.new.errorStartInPast"
      : null;
  // Effective end date: the start date unless the member opted into a
  // different day — so the inline check and the submit guard agree.
  const effectiveEndDate = endsOtherDay ? endDate : startDate;
  const endMsNow = hasEnd
    ? combineDateAndTime(effectiveEndDate, endTime)
    : null;

  // Rendered in two spots (beside the time input in same-day mode,
  // below the date+time row in different-day mode) — a plain element,
  // not a nested component, so the checkbox doesn't remount and drop
  // focus when the mode flips.
  const endsOtherDayToggle = (
    <label className="inline-flex items-center gap-2 text-xs text-moss-600 dark:text-moss-300">
      <input
        type="checkbox"
        checked={endsOtherDay}
        onChange={(e) => {
          setEndsOtherDay(e.target.checked);
          // Opting in starts from the same day the member picked —
          // an overnight event is usually start-date + 1 tweak away.
          if (e.target.checked) setEndDate(startDate);
          setPendingDurationMinutes(null);
        }}
        className="h-4 w-4 rounded border-moss-300"
      />
      {t("events.new.endsOtherDay")}
    </label>
  );
  const endBeforeStart =
    hasEnd && startMsNow !== null && endMsNow !== null && endMsNow <= startMsNow;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Surface every untouched required field inline before anything
    // else runs.
    validation.markAllTouched();
    if (validation.hasErrors) {
      // Short viewports can have the errored field scrolled away —
      // bring it into view so the blocked submit is never silent.
      focusFirstInvalidField();
      return;
    }
    // The guards below repeat what the inline layer already covers
    // (plus the cross-field checks). They are deliberately kept — the
    // clock moves between field-blur and submit, and a submit-time
    // re-check is the last line of defense before a permanent signed
    // record.
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
      const candidate = combineDateAndTime(
        endsOtherDay ? endDate : startDate,
        endTime,
      );
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
      // A deep-link visit never touches the stored plain-visit draft —
      // clearing here would delete work that belongs to a different
      // composition (see the precedence comment near the top).
      if (!isDeepLinkVisit) await clearDraft(DRAFT_KEY);
      showToast(t("events.new.created"));
      navigate(`/events/${event.id}`);
    } catch (err) {
      setError(humanizeError(err) || t("events.new.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  const form = (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
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
          onBlur={() => validation.onBlur("title")}
          aria-invalid={validation.shouldShowError("title") || undefined}
          aria-describedby={
            validation.shouldShowError("title")
              ? "event-title-error"
              : undefined
          }
          placeholder={t("events.new.titlePlaceholder")}
          maxLength={200}
          required
        />
        {validation.shouldShowError("title") && (
          <p
            id="event-title-error"
            role="alert"
            className="text-xs text-rose-700 dark:text-rose-300"
          >
            {t(validation.errors.title!.key)}
          </p>
        )}
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

      {/* Short-field pair: category + the starts-at fieldset share a
          row in short landscape (width is the abundant axis there);
          everywhere else this wrapper is an inert flex column with
          the form's own gap. Both children are self-contained cells —
          the fieldset's validation error lives inside it, so errors
          stay attached to their fields in both layouts. */}
      <div className="flex flex-col gap-4 landscape-short:grid landscape-short:grid-cols-2 landscape-short:items-start">
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
        {/* Two columns at every width EXCEPT under the largest-text
            preference, where the fields stack full-width: at 125% font
            the native pickers cannot render their values un-clipped
            side by side on narrow phones, and largest-text members
            have already chosen legibility over density. */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-2 [.text-largest_&]:grid-cols-1">
          <input
            type="date"
            className="input min-w-0"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            onBlur={() => validation.onBlur("startDate")}
            aria-label={t("events.new.startDateAria")}
            aria-invalid={
              validation.shouldShowError("startDate") || startInPast || undefined
            }
            aria-describedby={startErrorKey ? "event-start-error" : undefined}
            required
          />
          <input
            type="time"
            className="input min-w-0"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            onBlur={() => validation.onBlur("startTime")}
            aria-label={t("events.new.startTimeAria")}
            aria-invalid={
              validation.shouldShowError("startTime") || startInPast || undefined
            }
            aria-describedby={startErrorKey ? "event-start-error" : undefined}
            required
          />
        </div>
        {startErrorKey && (
          <p
            id="event-start-error"
            role="alert"
            className="text-xs text-rose-700 dark:text-rose-300"
          >
            {t(startErrorKey)}
          </p>
        )}
      </fieldset>
      </div>
      {/* end category + starts-at pair */}

      <div className="flex flex-col gap-2">
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={hasEnd}
            onChange={(e) => {
              setHasEnd(e.target.checked);
              // Manual enable starts from the common case: ends the
              // same day. (Template suggestions set the flag
              // themselves when their duration crosses midnight.)
              if (e.target.checked) setEndsOtherDay(false);
              // The member is taking over the end fields — a parked
              // template duration must not clobber them later.
              setPendingDurationMinutes(null);
            }}
            className="h-4 w-4 rounded border-moss-300"
          />
          {t("events.new.addEndTime")}
        </label>
        {hasEnd && (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">{t("events.new.endsAt")}</legend>
            {/* Same-day is the default: one row of [end time | the
                different-day toggle]. Opting in swaps the toggle's
                cell for the date input and moves the (checked) toggle
                below — the common case costs one row, the overnight
                case two. */}
            <div
              className={
                endsOtherDay
                  ? "grid grid-cols-[1.4fr_1fr] items-center gap-2 [.text-largest_&]:grid-cols-1"
                  : "grid grid-cols-2 items-center gap-2 [.text-largest_&]:grid-cols-1"
              }
            >
              {endsOtherDay && (
                <input
                  type="date"
                  className="input min-w-0"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPendingDurationMinutes(null);
                  }}
                  aria-label={t("events.new.endDateAria")}
                  aria-invalid={endBeforeStart || undefined}
                  aria-describedby={
                    endBeforeStart ? "event-end-error" : undefined
                  }
                />
              )}
              <input
                type="time"
                className="input min-w-0"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setPendingDurationMinutes(null);
                }}
                aria-label={t("events.new.endTimeAria")}
                aria-invalid={endBeforeStart || undefined}
                aria-describedby={
                  endBeforeStart ? "event-end-error" : undefined
                }
              />
              {!endsOtherDay && endsOtherDayToggle}
            </div>
            {endsOtherDay && endsOtherDayToggle}
            {endBeforeStart && (
              <p
                id="event-end-error"
                role="alert"
                className="text-xs text-rose-700 dark:text-rose-300"
              >
                {t("events.new.errorEndBeforeStart")}
                {!endsOtherDay && (
                  <> {t("events.new.errorEndBeforeStartMidnightHint")}</>
                )}
              </p>
            )}
          </fieldset>
        )}
      </div>

      {/* Location + capacity share a row at sm+: location is the
          flexible column, capacity is a short numeric. Below sm both
          stay stacked full-width (thumb-friendly) — except in short
          landscape, where the row layout applies at any width. */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] landscape-short:grid-cols-[1fr_auto]">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("events.new.locationField")}
          </span>
          <input
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={() => validation.onBlur("location")}
            aria-invalid={
              validation.shouldShowError("location") || undefined
            }
            aria-describedby={
              validation.shouldShowError("location")
                ? "event-location-error"
                : "event-location-hint"
            }
            placeholder={t("events.new.locationPlaceholder")}
            maxLength={200}
            required
          />
          {validation.shouldShowError("location") ? (
            <p
              id="event-location-error"
              role="alert"
              className="text-xs text-rose-700 dark:text-rose-300"
            >
              {t(validation.errors.location!.key)}
            </p>
          ) : (
            <span
              id="event-location-hint"
              className="text-xs text-moss-600 dark:text-moss-300"
            >
              {t("events.new.locationHint")}
            </span>
          )}
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
            className="input sm:w-32"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            onBlur={() => validation.onBlur("capacity")}
            aria-invalid={
              validation.shouldShowError("capacity") || undefined
            }
            aria-describedby={
              validation.shouldShowError("capacity")
                ? "event-capacity-error"
                : "event-capacity-hint"
            }
          />
          {validation.shouldShowError("capacity") ? (
            <p
              id="event-capacity-error"
              role="alert"
              className="text-xs text-rose-700 dark:text-rose-300"
            >
              {t(validation.errors.capacity!.key)}
            </p>
          ) : (
            <span
              id="event-capacity-hint"
              className="text-xs text-moss-600 dark:text-moss-300"
            >
              {t("events.new.capacityHint")}
            </span>
          )}
        </label>
      </div>

      {/* "What you're signing" comparison card — mirrors the
          discipline of the co-organizer invitation acceptance card.
          Names the consequences of the signature BEFORE the member
          submits, not after. Content adapted from
          docs/community-events.md §3.

          GUARDRAIL (docs/community-events.md §3): this card's
          placement is mandated — in-flow in the form column,
          immediately above Cancel/Submit, always visible. Never
          sticky, never collapsed, never a tooltip. A future layout
          reflow must not move it. */}
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
  );

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

      {/* Never rendered on a deep-link visit (pendingDraft never loads
          there) — the guard is belt-and-braces. */}
      {pendingDraft && !isDeepLinkVisit && (
        <DraftBanner
          updatedAt={pendingDraft.updatedAt}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      {workDayProject ? (
        // Work-day deep-link: the work-day banner spans the top in
        // place of the template rail (the template is fixed to
        // "work-day"; the form is already seeded), and the form keeps
        // its single-column reading-width flow.
        <>
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
          <div className="mx-auto max-w-2xl">{form}</div>
        </>
      ) : (
        // Two-pane at lg+ (mirrors ProjectNew): the template picker
        // docks in a sticky LEFT rail with its own scroll context, the
        // form lives on the right with a reading-width cap. Below lg
        // the grid collapses and DOM order (picker → form) matches the
        // visual order — the standing WCAG 2.4.3 rule, no CSS `order`.
        <div className="lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <aside
            aria-label={t("events.templates.asideAriaLabel")}
            className="mb-4 lg:mb-0 lg:col-start-1 lg:row-start-1 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto"
          >
            {/* Mobile-only collapsed summary. Hidden on lg+ because
                the sticky rail stays open at that breakpoint. */}
            {!pickerExpanded && (
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-moss-200 bg-white px-4 py-3 text-left text-sm shadow-sm dark:border-moss-700 dark:bg-moss-900 lg:hidden"
                aria-expanded={false}
                aria-controls="event-template-picker"
                onClick={() => setPickerExpanded(true)}
              >
                <span className="min-w-0 flex-1 truncate text-moss-900 dark:text-moss-100">
                  {pickedTemplate
                    ? t("events.templates.selected", {
                        name: pickedTemplate.name,
                      })
                    : t("events.templates.collapsedScratch")}
                </span>
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-canopy-700 dark:text-canopy-300">
                  {pickedTemplate
                    ? t("events.templates.collapsedChange")
                    : t("events.templates.collapsedPick")}
                </span>
              </button>
            )}

            {/* The picker itself. Mobile: hidden when collapsed.
                Desktop: always visible (lg:block overrides). */}
            <div
              id="event-template-picker"
              className={pickerExpanded ? "" : "hidden lg:block"}
            >
              <EventTemplatePicker
                selectedId={selectedTemplateId}
                onSelect={handleSelectTemplate}
                layout="rail"
              />
            </div>
          </aside>

          <div className="lg:col-start-2 lg:row-start-1 lg:min-w-0 lg:max-w-2xl">
            {form}
          </div>
        </div>
      )}
    </div>
  );
}
