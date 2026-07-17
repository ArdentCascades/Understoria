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
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  SHIFT_LABEL_MAX,
  addShift,
  deleteShift,
  listShiftsForEvent,
  listSignupsForEvent,
  removeSignup,
  setShiftCapacity,
  signUpForShift,
} from "@/db/eventShifts";
import { humanizeError } from "@/lib/humanizeError";
import { buildShiftIcs, icsFilename } from "@/lib/eventIcs";
import { downloadIcs } from "@/lib/ics";
import { WhyTooltip } from "@/components/WhyTooltip";
import { useToast } from "@/state/ToastContext";
import type { Event, EventShiftRow, ShiftSignupRow } from "@/types";

export interface EventShiftsSectionProps {
  event: Event;
  /** Viewing member's pubkey, or null for a keyless viewer (controls
   *  hidden; counts still render). */
  memberKey: string | null;
  /** Viewer is the event's organizer (add/delete affordances). */
  isOrganizer: boolean;
  /** Event is organizer-authoritatively cancelled — everything
   *  renders inert (§5.2): no signup controls, no add form. */
  isCancelled: boolean;
  /** §6.3 tier: organizer or going/maybe RSVP sees roster names. */
  canSeeRoster: boolean;
  /** Display-name resolver shared with the attendee roster. */
  labelFor: (key: string) => string;
  /**
   * §9.3 credit bridge — prefill, not plumbing. When the event is a
   * project work day (a local `eventProjectLinks` row resolves), this
   * is the linked project's route; a quiet "record time together"
   * affordance renders on PASSED shifts, to the organizer and to
   * members on the shift, deep-linking to the project whose existing
   * task flows record credit with claimer-stated hours (equal-time).
   * `null` for plain events — §14 ruling 1 deliberately ships no
   * credit affordance there. NOTHING structural links the resulting
   * Exchange to the event or shift (§9.2, permanent boundary), and
   * nothing ever reconciles this roster against exchanges.
   */
  creditHref: string | null;
  /** Linked project title for the affordance copy. */
  creditProjectTitle: string | null;
}

// Same local-clock rendering discipline as EventDetail's
// formatDateTime; time-only because shifts render under a dated
// event header and a bare "9:00 AM – 12:00 PM" reads best. A shift
// that crosses into another calendar day gets its date prefixed so
// the range is never ambiguous.
function formatShiftRange(
  startsAt: number,
  endsAt: number,
  locale: string | undefined,
): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const time = (d: Date) =>
    d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${start.toLocaleDateString(locale)} · ${time(start)} – ${time(end)}`;
  }
  return `${start.toLocaleDateString(locale)} ${time(start)} – ${end.toLocaleDateString(locale)} ${time(end)}`;
}

// Split an epoch-millis into the YYYY-MM-DD + HH:mm pair the native
// date/time inputs expect (local-clock). Mirrors EventNew.
function splitDate(ms: number): string {
  const d = new Date(ms);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function combine(date: string, time: string): number | null {
  if (!date || !time) return null;
  const ms = new Date(`${date}T${time}`).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/**
 * The shift list on the event detail page — see
 * `docs/shift-signups.md` §6 (signup semantics + visibility) and
 * §6.4 (copy discipline: spot counts render as INVITATION, never
 * deficit — "2 spots open", never "only 2 of 4 filled"; an empty
 * shift renders exactly like a half-full one).
 *
 * The signup consent card (§6.2) extends the RSVP card's discipline:
 * one expansion, naming that signing up also RSVPs "going", who sees
 * the roster, and that removal is one tap with nobody notified.
 */
export function EventShiftsSection({
  event,
  memberKey,
  isOrganizer,
  isCancelled,
  canSeeRoster,
  labelFor,
  creditHref,
  creditProjectTitle,
}: EventShiftsSectionProps) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();

  const shifts = useLiveQuery(
    () => listShiftsForEvent(event.id),
    [event.id],
    [] as EventShiftRow[],
  );
  const signups = useLiveQuery(
    () => listSignupsForEvent(event.id),
    [event.id],
    [] as ShiftSignupRow[],
  );

  const signupsByShift = useMemo(() => {
    const map = new Map<string, ShiftSignupRow[]>();
    for (const s of signups) {
      const list = map.get(s.shiftId);
      if (list) list.push(s);
      else map.set(s.shiftId, [s]);
    }
    return map;
  }, [signups]);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  /** Shift id whose §6.2 consent card is expanded. */
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  /** Shift id whose capacity-edit field is open (organizer only). */
  const [editingCapId, setEditingCapId] = useState<string | null>(null);
  const [capEdit, setCapEdit] = useState("");

  // Add-shift form (organizer only). The DATE fields seed from the
  // event's own day — harmless and visible; times start empty, same
  // deliberate-entry stance as EventNew.
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [startDate, setStartDate] = useState(() => splitDate(event.startsAt));
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState(() => splitDate(event.startsAt));
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState("");

  const now = Date.now();

  // Nothing to show and nothing to add: members without shifts see no
  // section at all (a heading over emptiness is noise); the organizer
  // sees the invitation to structure the day.
  if (shifts.length === 0 && (!isOrganizer || isCancelled)) return null;

  async function handleSignUp(shiftId: string) {
    if (!memberKey) return;
    setError(null);
    setPending(true);
    try {
      await signUpForShift({ shiftId, memberKey });
      setConfirmingId(null);
      showToast(t("events.shifts.recorded"));
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setPending(false);
    }
  }

  async function handleRemove(shiftId: string) {
    if (!memberKey) return;
    setError(null);
    setPending(true);
    try {
      await removeSignup(shiftId, memberKey);
      showToast(t("events.shifts.removed"));
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(shiftId: string) {
    if (!memberKey) return;
    setError(null);
    setPending(true);
    try {
      await deleteShift(shiftId, memberKey);
      showToast(t("events.shifts.deleted"));
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setPending(false);
    }
  }

  async function handleSetCapacity(shiftId: string) {
    if (!memberKey) return;
    setError(null);
    const trimmed = capEdit.trim();
    // Empty clears the cap (uncapped); otherwise a positive whole
    // number. The data layer re-validates and refuses a value below
    // the current roster (§5.2) — surfaced here via humanizeError.
    const cap = trimmed === "" ? null : Number.parseInt(trimmed, 10);
    setPending(true);
    try {
      await setShiftCapacity(shiftId, cap, memberKey);
      setEditingCapId(null);
      showToast(t("events.shifts.capacityUpdated"));
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setPending(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!memberKey) return;
    setError(null);
    const startsAt = combine(startDate, startTime);
    const endsAt = combine(endDate, endTime);
    if (startsAt === null || endsAt === null) {
      setError(t("events.shifts.timesRequired"));
      return;
    }
    const cap = capacity.trim() === "" ? null : Number.parseInt(capacity, 10);
    setPending(true);
    try {
      await addShift({
        eventId: event.id,
        label,
        startsAt,
        endsAt,
        capacity: cap,
        byKey: memberKey,
      });
      setAdding(false);
      setLabel("");
      setStartTime("");
      setEndTime("");
      setCapacity("");
      showToast(t("events.shifts.added"));
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="event-shifts-heading" className="card mb-4">
      <div className="mb-2 inline-flex items-baseline gap-1.5">
        <h2
          id="event-shifts-heading"
          className="text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
        >
          {t("events.shifts.heading")}
        </h2>
        <WhyTooltip principleId="privacy-precondition" />
      </div>

      <ul className="flex flex-col gap-3">
        {shifts.map((shift) => {
          const roster = signupsByShift.get(shift.id) ?? [];
          const mine =
            memberKey !== null &&
            roster.some((r) => r.memberKey === memberKey);
          const passed = now >= shift.endsAt;
          const full =
            shift.capacity !== null && roster.length >= shift.capacity;
          const spotsOpen =
            shift.capacity === null
              ? null
              : Math.max(0, shift.capacity - roster.length);
          const showControls = !isCancelled && !passed && memberKey !== null;

          return (
            <li
              key={shift.id}
              className="rounded-xl border border-moss-200 p-3 dark:border-moss-800"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{shift.label}</p>
                <p className="text-xs text-moss-600 dark:text-moss-300">
                  {formatShiftRange(
                    shift.startsAt,
                    shift.endsAt,
                    i18n.resolvedLanguage,
                  )}
                </p>
              </div>

              {/* §6.4 fill-state copy: invitation, not deficit. The
                  same neutral treatment whether zero or almost-full;
                  "Full" replaces the control, never a warning tone. */}
              <p className="mt-1 text-sm">
                {passed
                  ? t("events.shifts.passedLabel")
                  : full
                    ? t("events.shifts.full", { count: roster.length })
                    : spotsOpen !== null
                      ? t("events.shifts.spotsOpen", { count: spotsOpen })
                      : t("events.shifts.openSignup", {
                          count: roster.length,
                        })}
              </p>

              {canSeeRoster && roster.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1 text-sm">
                  {roster.map((r) => (
                    <li key={r.id}>{labelFor(r.memberKey)}</li>
                  ))}
                </ul>
              )}
              {!canSeeRoster && roster.length > 0 && (
                <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
                  {t("events.shifts.rosterHiddenHint")}
                </p>
              )}

              {showControls && mine && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-canopy-700 dark:text-canopy-300">
                    {t("events.shifts.signedUpChip")}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost min-h-[44px]"
                    disabled={pending}
                    onClick={() => void handleRemove(shift.id)}
                  >
                    {t("events.shifts.removeButton")}
                  </button>
                  {/* Right where the commitment was just made — the
                      member's OWN calendar can hold (and, if they
                      choose, remind about) the clock time; the app
                      never will. Same file the In-my-care row offers
                      (lib/eventIcs.ts buildShiftIcs, §11.5a posture:
                      no VALARM, no roster identities). */}
                  <button
                    type="button"
                    className="text-xs text-canopy-700 underline decoration-canopy-300 underline-offset-2 hover:text-canopy-900 dark:text-canopy-300 dark:decoration-canopy-700 dark:hover:text-canopy-100"
                    onClick={() => {
                      const file = icsFilename(
                        `${shift.label} ${event.title}`,
                      );
                      downloadIcs(
                        file,
                        buildShiftIcs(shift, event, {
                          appUrl: window.location.origin,
                        }),
                      );
                      // Same feedback as the whole-event export: a
                      // silent download reads as "nothing happened".
                      showToast(t("toast.icsShiftSaved", { file }));
                    }}
                  >
                    {t("events.shifts.addToCalendar")}
                  </button>
                </div>
              )}

              {showControls && !mine && !full && (
                <>
                  {confirmingId !== shift.id ? (
                    <button
                      type="button"
                      className="btn-secondary mt-2 min-h-[44px]"
                      disabled={pending}
                      onClick={() => {
                        setError(null);
                        setConfirmingId(shift.id);
                      }}
                    >
                      {t("events.shifts.signUpButton")}
                    </button>
                  ) : (
                    <div className="mt-2 rounded-lg border border-canopy-200 bg-canopy-50 p-3 text-sm dark:border-canopy-900/50 dark:bg-canopy-950/30">
                      {/* §6.2 consent card: the visibility consequence
                          and the RSVP coupling, named BEFORE the tap.
                          "Nobody is notified. Plans change." states the
                          solidarity-not-shame posture at the exact
                          moment a member might hesitate to commit. */}
                      <p className="font-semibold text-canopy-900 dark:text-canopy-100">
                        {t("events.shifts.consentHeading", {
                          label: shift.label,
                        })}
                      </p>
                      <ul className="mt-1 list-disc pl-5 text-canopy-900 dark:text-canopy-100">
                        <li>{t("events.shifts.consentRsvp")}</li>
                        <li>{t("events.shifts.consentRoster")}</li>
                        <li>{t("events.shifts.consentRemove")}</li>
                      </ul>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-primary min-h-[44px]"
                          disabled={pending}
                          aria-busy={pending}
                          onClick={() => void handleSignUp(shift.id)}
                        >
                          {t("events.shifts.confirmButton")}
                        </button>
                        <button
                          type="button"
                          className="btn-ghost min-h-[44px]"
                          disabled={pending}
                          onClick={() => setConfirmingId(null)}
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {showControls && !mine && full && (
                <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
                  {t("events.shifts.fullHint")}
                </p>
              )}

              {/* Capacity edit — organizer, live event, upcoming shift
                  only (editing the cap on a passed shift is
                  meaningless; signups are closed). The cap is soft
                  (§11.5): raise or uncap freely, lower only to a value
                  that still fits everyone signed up (§5.2). The number
                  field seeds from the current cap; the write layer is
                  the authority that refuses a below-roster value. */}
              {isOrganizer && !isCancelled && !passed && (
                <div className="mt-2">
                  {editingCapId !== shift.id ? (
                    <button
                      type="button"
                      className="btn-ghost min-h-[44px] text-xs"
                      disabled={pending}
                      onClick={() => {
                        setError(null);
                        setCapEdit(
                          shift.capacity === null
                            ? ""
                            : String(shift.capacity),
                        );
                        setEditingCapId(shift.id);
                      }}
                    >
                      {t("events.shifts.editCapacityButton")}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 rounded-lg border border-moss-200 p-2 dark:border-moss-800">
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="font-medium">
                          {t("events.shifts.capacityLabel")}
                        </span>
                        <input
                          type="number"
                          className="input"
                          value={capEdit}
                          onChange={(e) => setCapEdit(e.target.value)}
                          min={Math.max(1, roster.length)}
                          step={1}
                          placeholder={t(
                            "events.shifts.capacityPlaceholder",
                          )}
                          aria-label={t("events.shifts.capacityLabel")}
                        />
                      </label>
                      {roster.length > 0 && (
                        <p className="text-xs text-moss-600 dark:text-moss-300">
                          {t("events.shifts.capacityFloorHint", {
                            count: roster.length,
                          })}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-primary min-h-[44px]"
                          disabled={pending}
                          aria-busy={pending}
                          onClick={() => void handleSetCapacity(shift.id)}
                        >
                          {t("common.save")}
                        </button>
                        <button
                          type="button"
                          className="btn-ghost min-h-[44px]"
                          disabled={pending}
                          onClick={() => setEditingCapId(null)}
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isOrganizer && !isCancelled && roster.length === 0 && (
                <button
                  type="button"
                  className="btn-ghost mt-2 min-h-[44px] text-xs"
                  disabled={pending}
                  onClick={() => void handleDelete(shift.id)}
                >
                  {t("events.shifts.deleteButton")}
                </button>
              )}

              {/* §9.3 credit bridge, prefill-only: a passed shift on a
                  work-day event offers the organizer and its own
                  members the path to the project, whose task flows
                  record credit with claimer-stated hours. A quiet
                  affordance — never a prompt, never a completeness
                  meter, never a roster-vs-exchange diff (§9.2). */}
              {passed &&
                !isCancelled &&
                creditHref &&
                (isOrganizer || mine) && (
                  <p className="mt-2 text-sm">
                    <Link
                      to={creditHref}
                      className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                    >
                      {t("events.shifts.recordTimeLink", {
                        project: creditProjectTitle ?? "",
                      })}
                    </Link>
                  </p>
                )}

              {/* The adopted direct-exchange doorway
                  (docs/direct-exchange-label.md §6.1): a passed shift
                  on a PLAIN event — the case shift-signups §14 ruling
                  1 deferred — lands on the direct-exchange ceremony
                  with the shift's duration and the event's category
                  prefilled. FORM prefill only: the recorded exchange
                  carries a random `direct:` label and nothing
                  event-shaped (§3 permanent boundary). Offered to
                  shift members other than the event's creator (the
                  named counterparty); the creator co-signs on their
                  own screen. Same quiet posture as the work-day
                  bridge above: never a prompt, never a roster diff. */}
              {passed &&
                !isCancelled &&
                !creditHref &&
                mine &&
                memberKey !== null &&
                memberKey !== event.createdBy && (
                  <p className="mt-2 text-sm">
                    <Link
                      to={`/record-direct?member=${encodeURIComponent(
                        event.createdBy,
                      )}&hours=${
                        Math.round(
                          ((shift.endsAt - shift.startsAt) / 3_600_000) * 4,
                        ) / 4
                      }&category=${encodeURIComponent(event.category)}`}
                      className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                    >
                      {t("events.shifts.recordDirectLink")}
                    </Link>
                  </p>
                )}
            </li>
          );
        })}
      </ul>

      {shifts.length === 0 && isOrganizer && !isCancelled && (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("events.shifts.emptyOrganizerHint")}
        </p>
      )}

      {isOrganizer && !isCancelled && (
        <div className="mt-3">
          {!adding ? (
            <button
              type="button"
              className="btn-secondary min-h-[44px]"
              disabled={pending}
              onClick={() => {
                setError(null);
                setAdding(true);
              }}
            >
              {t("events.shifts.addButton")}
            </button>
          ) : (
            <form
              className="flex flex-col gap-2 rounded-lg border border-moss-200 p-3 dark:border-moss-800"
              onSubmit={(e) => void handleAdd(e)}
            >
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">
                  {t("events.shifts.labelLabel")}
                </span>
                <input
                  className="input"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={t("events.shifts.labelPlaceholder")}
                  maxLength={SHIFT_LABEL_MAX}
                  required
                />
              </label>
              <fieldset className="flex flex-col gap-1">
                <legend className="text-sm font-medium">
                  {t("events.shifts.startsLabel")}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="date"
                    className="input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label={t("events.shifts.startDateAria")}
                    required
                  />
                  <input
                    type="time"
                    className="input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    aria-label={t("events.shifts.startTimeAria")}
                    required
                  />
                </div>
              </fieldset>
              <fieldset className="flex flex-col gap-1">
                <legend className="text-sm font-medium">
                  {t("events.shifts.endsLabel")}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="date"
                    className="input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-label={t("events.shifts.endDateAria")}
                    required
                  />
                  <input
                    type="time"
                    className="input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    aria-label={t("events.shifts.endTimeAria")}
                    required
                  />
                </div>
              </fieldset>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">
                  {t("events.shifts.capacityLabel")}
                </span>
                <input
                  type="number"
                  className="input"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min={1}
                  step={1}
                  placeholder={t("events.shifts.capacityPlaceholder")}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="btn-primary min-h-[44px]"
                  disabled={pending}
                  aria-busy={pending}
                >
                  {t("events.shifts.addConfirm")}
                </button>
                <button
                  type="button"
                  className="btn-ghost min-h-[44px]"
                  disabled={pending}
                  onClick={() => setAdding(false)}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 text-sm text-rose-700 dark:text-rose-300"
        >
          {error}
        </p>
      )}
    </section>
  );
}
