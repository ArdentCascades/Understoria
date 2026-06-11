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
import { useNavigate, useParams } from "react-router-dom";
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
import { getSecretKey } from "@/db/secrets";
import { humanizeError } from "@/lib/humanizeError";
import { shortKey } from "@/lib/format";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { WhyTooltip } from "@/components/WhyTooltip";
import { EventRsvpControl } from "@/components/EventRsvpControl";
import { EventCancellationCard } from "@/components/EventCancellationCard";

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
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { currentMember, members, nodeId, lockState } = useApp();
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
          onClick={() => navigate("/calendar")}
        >
          {t("events.detail.backToCalendar")}
        </button>
      </div>
    );
  }

  const isOrganizer = memberKey === event.createdBy;
  const isCancelled = !!cancellation;
  const organizerName = memberMap.get(event.createdBy) ?? null;

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

  return (
    <div className="px-4 pb-8 pt-4">
      <button
        type="button"
        className="btn-ghost -ml-2 mb-3 text-sm"
        onClick={() => navigate("/calendar")}
      >
        {t("events.detail.backToCalendar")}
      </button>

      <header className="mb-4">
        <h1 className="page-title">{event.title}</h1>
        <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
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
              {event.capacity}
            </Field>
          )}
          <Field label={t("events.detail.categoryLabel")}>
            {t(`categories.${event.category}`, {
              defaultValue: event.category,
            })}
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
          <p className="whitespace-pre-wrap text-sm">
            {event.description}
          </p>
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
