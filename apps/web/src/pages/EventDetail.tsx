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
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import {
  cancelEvent,
  getEvent,
  getEventCancellation,
  getMemberRsvp,
  listRsvpsForEvent,
} from "@/db/events";
import { getLinkForEvent } from "@/db/eventProjectLinks";
import { getSecretKey } from "@/db/secrets";
import { isAuthoritativeCancellation } from "@/lib/eventCancellation";
import { humanizeError } from "@/lib/humanizeError";
import { shortKey } from "@/lib/format";
import { eventCategoryMeta } from "@/lib/categories";
import { BackLink, useHistoryAwareBack } from "@/components/BackLink";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { WhyTooltip } from "@/components/WhyTooltip";
import { EventRsvpControl } from "@/components/EventRsvpControl";
import { EventCancellationCard } from "@/components/EventCancellationCard";
import { Markdown } from "@/components/Markdown";
import { OverflowMenu, type OverflowMenuItem } from "@/components/OverflowMenu";
import { shareUrl } from "@/lib/share";
import { buildEventIcs, icsFilename } from "@/lib/eventIcs";

// Render an epoch-ms timestamp as "<date> <time>" in the active
// locale. The native date+time pickers collected local-time values
// from the device; we render them back the same way. No timezone
// suffix — the federated record carries UTC epoch ms; UI display is
// always local-clock.
function formatDateTime(ms: number, locale: string | undefined): string {
  const date = new Date(ms);
  const datePart = date.toLocaleDateString(locale);
  const timePart = date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  // History-aware back: an event reached from inside the app (project
  // page → work-day link, calendar, a shared conversation) returns to
  // where the member actually was; a cold entry (direct link) falls
  // back to the calendar. Fixes the project → event → Back dead-end
  // that used to dump members onto /calendar and lose the project.
  const goBack = useHistoryAwareBack("/calendar");
  const { t, i18n } = useTranslation();
  const { currentMember, members, nodeId, lockState, projects } = useApp();
  const { showToast } = useToast();

  const event = useLiveQuery(
    () => (eventId ? getEvent(eventId) : Promise.resolve(null)),
    [eventId],
    undefined,
  );
  const cancellation = useLiveQuery(
    () =>
      eventId
        ? getEventCancellation(eventId)
        : Promise.resolve(null),
    [eventId],
    undefined,
  );
  const memberKey = currentMember?.publicKey ?? null;
  const myRsvp = useLiveQuery(
    () =>
      eventId && memberKey
        ? getMemberRsvp(eventId, memberKey)
        : Promise.resolve(null),
    [eventId, memberKey],
    undefined,
  );
  const rsvps = useLiveQuery(
    () => (eventId ? listRsvpsForEvent(eventId) : Promise.resolve([])),
    [eventId],
    [],
  );
  // Local-only work-day link (plan 10). Resolves only on the node that
  // created the link — peers have neither the row nor the project, so
  // the back-link renders nowhere else, which is itself the honest UI
  // statement of the federation posture.
  const projectLink = useLiveQuery(
    () => (eventId ? getLinkForEvent(eventId) : Promise.resolve(null)),
    [eventId],
    undefined,
  );

  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m.displayName])),
    [members],
  );

  const [error, setError] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (!eventId) return null;
  // The live queries resolve undefined while loading. Render nothing
  // (cleaner than a flashing 404) until they settle.
  if (event === undefined) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("common.loading")}
        </p>
      </div>
    );
  }
  if (event === null) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("events.detail.notFound")}
        </p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={goBack}
        >
          {t("events.detail.backToCalendar")}
        </button>
      </div>
    );
  }

  const isOrganizer = memberKey === event.createdBy;
  // A cancellation only counts if the organizer signed it — a
  // non-organizer's forged cancellation must not mark the event
  // cancelled (Round-4 review; lib/eventCancellation.ts).
  const isCancelled = isAuthoritativeCancellation(cancellation, event);
  const organizerName = memberMap.get(event.createdBy) ?? null;
  // Only render the project back-link when BOTH the link row and the
  // project it points at exist locally. (The project always exists on
  // the linking node; the guard is honest about the general case.)
  const linkedProject = projectLink
    ? (projects.find((p) => p.id === projectLink.projectId) ?? null)
    : null;

  // Visibility tier per design doc §6: the roster of names is shown
  // only to the organizer or to members who RSVP'd "going" or "maybe."
  // Everyone else sees a count.
  const goingRsvps = rsvps.filter((r) => r.status === "going");
  const maybeRsvps = rsvps.filter((r) => r.status === "maybe");
  const canSeeRoster =
    isOrganizer ||
    myRsvp?.status === "going" ||
    myRsvp?.status === "maybe";

  function labelFor(key: string): string {
    return (
      memberMap.get(key) ??
      t("events.detail.attendeeFallbackKey", { shortKey: shortKey(key) })
    );
  }

  async function handleCancelConfirm() {
    if (!currentMember || !event) return;
    if (lockState === "locked") {
      showToast(t("events.detail.cancelLocked"), "error");
      return;
    }
    try {
      const organizerSecretKey = await getSecretKey(currentMember.publicKey);
      await cancelEvent({
        eventId: event.id,
        reason: cancelReason.trim(),
        organizerKey: currentMember.publicKey,
        organizerSecretKey,
        nodeId,
      });
      setConfirmingCancel(false);
      setCancelReason("");
      showToast(t("events.detail.cancelled"));
    } catch (err) {
      setError(humanizeError(err));
      setConfirmingCancel(false);
    }
  }

  // Copy-link handler. Shares the canonical event URL via the share
  // helper (native sheet → clipboard fallback). A cancelled share stays
  // quiet; a copy/share toasts the confirmation; a hard failure surfaces
  // the manual-copy guidance as an error. Mirrors TaskDetailBody.
  async function handleCopyLink() {
    const result = await shareUrl({
      url: `${window.location.origin}/events/${event!.id}`,
      title: event!.title,
    });
    if (result === "copied" || result === "shared") {
      showToast(t("common.linkCopied"));
    } else if (result === "failed") {
      showToast(t("common.copyFailed"), { tone: "error" });
    }
    // "cancelled" → stay silent.
  }

  // Single-event .ics export per community-events.md §11.5a: build the
  // file entirely client-side (the event is already in Dexie) and hand
  // it to the browser as a download. No server route exists for this,
  // ever — a server-rendered .ics recreates the subscription-URL shape
  // calendar.md §10.5 permanently rejected. The generator deliberately
  // emits no VALARM (reminders belong to the member's own calendar
  // app, per §11.5a) and no ATTENDEE/ORGANIZER properties.
  function handleAddToCalendar() {
    const ics = buildEventIcs(event!, { appUrl: window.location.origin });
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = icsFilename(event!.title);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Header overflow-menu actions. Copy link and Add to calendar are
  // quiet secondary actions; RSVP is a primary control and Cancel
  // Event is destructive (and needs its reason textarea), so both of
  // those stay inline.
  const menuItems: OverflowMenuItem[] = [
    {
      key: "copy-link",
      label: t("common.copyLink"),
      onSelect: () => {
        void handleCopyLink();
      },
    },
  ];
  // Hidden once the event is cancelled — importing a cancelled event
  // into a device calendar is a footgun. Same treatment as the RSVP
  // control, which also disappears on cancellation (the cancellation
  // banner above carries the state).
  if (!isCancelled) {
    menuItems.push({
      key: "add-to-calendar",
      label: t("events.detail.addToCalendar"),
      // The hint carries the no-VALARM stance to the member: the file
      // has no embedded reminder; their calendar app is in charge.
      description: t("events.detail.addToCalendarHint"),
      onSelect: () => {
        handleAddToCalendar();
      },
    });
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <BackLink
        to="/calendar"
        label={t("events.detail.backToCalendar")}
        preferHistory
        className="btn-ghost -ml-2 mb-3 inline-block text-sm"
      />

      <header className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="page-title">{event.title}</h1>
          <OverflowMenu label={t("events.detail.menuLabel")} items={menuItems} />
        </div>
        <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {linkedProject && (
            <Field label={t("events.detail.projectLinkLabel")}>
              <Link
                to={`/project/${linkedProject.id}`}
                className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
              >
                {t("events.detail.projectLinkLine", {
                  project: linkedProject.title,
                })}
              </Link>
            </Field>
          )}
          <Field label={t("events.detail.organizerLabel")}>
            {organizerName ?? shortKey(event.createdBy)}
          </Field>
          <Field label={t("events.detail.startsAtLabel")}>
            {formatDateTime(event.startsAt, i18n.resolvedLanguage)}
          </Field>
          {event.endsAt !== null && (
            <Field label={t("events.detail.endsAtLabel")}>
              {formatDateTime(event.endsAt, i18n.resolvedLanguage)}
            </Field>
          )}
          <Field label={t("events.detail.locationLabel")}>
            {event.location}
          </Field>
          {event.capacity !== null && (
            <Field label={t("events.detail.capacityLabel")}>
              {/* "8 of 12 going" — fill at a glance where capacity
                  renders. The going count here is the same node-local
                  aggregate the attendees section already shows to every
                  local viewer (§6 tiers unchanged — counts, never
                  names). Uncapped events skip this Field entirely and
                  keep the plain going count below. */}
              {t("events.detail.capacityFill", {
                going: goingRsvps.length,
                capacity: event.capacity,
              })}
            </Field>
          )}
          <Field label={t("events.detail.categoryLabel")}>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`inline-block h-2.5 w-2.5 rounded-full ${eventCategoryMeta(event.category).barColorClass}`}
              />
              <span aria-hidden="true">
                {eventCategoryMeta(event.category).emoji}
              </span>
              {/* Label stays i18n'd, falling back to the raw peer string
                  for a category this node doesn't recognize. */}
              {t(`categories.${event.category}`, {
                defaultValue: event.category,
              })}
            </span>
          </Field>
        </dl>
      </header>

      {isCancelled && cancellation && (
        <EventCancellationCard
          cancellation={cancellation}
          organizerName={organizerName}
        />
      )}

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {error}
        </p>
      )}

      {event.description && (
        <section className="card mb-4">
          <Markdown text={event.description} className="text-sm" />
        </section>
      )}

      {/* RSVP control hides once the event is cancelled — RSVP'ing to
          a cancelled event would be meaningless. Members who already
          RSVP'd see the cancellation banner above instead. */}
      {!isCancelled && memberKey && (
        <EventRsvpControl
          eventId={event.id}
          memberKey={memberKey}
          rsvp={myRsvp ?? null}
        />
      )}

      <section
        aria-labelledby="event-attendees-heading"
        className="card mb-4"
      >
        <div className="mb-2 inline-flex items-baseline gap-1.5">
          <h2
            id="event-attendees-heading"
            className="text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
          >
            {t("events.detail.attendeesHeading")}
          </h2>
          <WhyTooltip principleId="no-leaderboards" />
        </div>
        <p className="text-sm">
          {t("events.detail.attendeeCountLabel", {
            count: goingRsvps.length,
            maybe: maybeRsvps.length,
          })}
        </p>
        {canSeeRoster ? (
          <>
            {goingRsvps.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
                  {t("events.detail.goingRosterHeading")}
                </p>
                <ul className="mt-1 flex flex-col gap-1 text-sm">
                  {goingRsvps.map((r) => (
                    <li key={r.id}>{labelFor(r.memberKey)}</li>
                  ))}
                </ul>
              </div>
            )}
            {maybeRsvps.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
                  {t("events.detail.maybeRosterHeading")}
                </p>
                <ul className="mt-1 flex flex-col gap-1 text-sm">
                  {maybeRsvps.map((r) => (
                    <li key={r.id}>{labelFor(r.memberKey)}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
            {t("events.detail.rosterHiddenHint")}
          </p>
        )}
      </section>

      {isOrganizer && !isCancelled && (
        <section className="card mb-4 flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
            {t("events.detail.organizerControlsHeading")}
          </h2>
          <p className="text-xs text-moss-600 dark:text-moss-300">
            {t("events.detail.cancelHint")}
          </p>
          <button
            type="button"
            className="btn-secondary self-start"
            onClick={() => {
              setError(null);
              setCancelReason("");
              setConfirmingCancel(true);
            }}
          >
            {t("events.detail.cancelButton")}
          </button>
        </section>
      )}

      <ConfirmDialog
        open={confirmingCancel}
        title={t("events.detail.cancelDialogTitle", { title: event.title })}
        description={
          <div className="flex flex-col gap-2">
            <p>{t("events.detail.cancelDialogBody")}</p>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">
                {t("events.detail.cancelReasonLabel")}
              </span>
              <textarea
                className="input min-h-20"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t("events.detail.cancelReasonPlaceholder")}
                maxLength={500}
              />
            </label>
          </div>
        }
        confirmLabel={t("events.detail.cancelConfirm")}
        confirmingLabel={t("common.working")}
        cancelLabel={t("events.detail.cancelDismiss")}
        tone="caution"
        onCancel={() => setConfirmingCancel(false)}
        onConfirm={() => handleCancelConfirm()}
      />
    </div>
  );
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
      <dt className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}
