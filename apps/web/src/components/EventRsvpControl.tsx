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
import { useTranslation } from "react-i18next";
import { rsvpToEvent } from "@/db/events";
import { humanizeError } from "@/lib/humanizeError";
import { WhyTooltip } from "@/components/WhyTooltip";
import { useToast } from "@/state/ToastContext";
import type { EventRsvpRow } from "@/types";

type RsvpStatus = "going" | "maybe" | "not_going";

export interface EventRsvpControlProps {
  eventId: string;
  /** The viewing member's pubkey. Required — a non-member viewer
   *  should not see this control. */
  memberKey: string;
  /** The current RSVP row for this (event, member), or `null` if the
   *  member has not yet RSVP'd. Parent supplies this from a live
   *  Dexie query so the control re-renders without local state when
   *  the row changes. */
  rsvp: EventRsvpRow | null;
}

/**
 * RSVP informed-consent surface. Names the visibility consequence of
 * a `going`/`maybe` RSVP BEFORE the row is written — same discipline
 * as the co-organizer invitation acceptance card. RSVPs themselves are
 * not federated (see `docs/community-events.md` §4 + §7), but the
 * local visibility consequence is real and the member deserves to
 * see it before tapping.
 *
 * States:
 *
 *   - Pre-RSVP (`rsvp === null`): comparison card + three buttons.
 *   - Post-RSVP, idle: shows the current status + "Change" / "Withdraw"
 *     buttons. "Withdraw" sets the row to `not_going`, which removes
 *     the member from the visible roster per §6.
 *   - Post-RSVP, changing: same comparison card + three buttons; the
 *     selected status overwrites the existing row in place.
 */
export function EventRsvpControl({
  eventId,
  memberKey,
  rsvp,
}: EventRsvpControlProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [changing, setChanging] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(status: RsvpStatus) {
    setError(null);
    try {
      setPending(true);
      await rsvpToEvent({ eventId, memberKey, status });
      setChanging(false);
      showToast(t("events.rsvp.recorded"));
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setPending(false);
    }
  }

  const showChooser = rsvp === null || changing;

  return (
    <section
      aria-labelledby="event-rsvp-heading"
      className="card mb-4"
    >
      <h2
        id="event-rsvp-heading"
        className="text-sm font-semibold uppercase tracking-wide text-moss-500"
      >
        {t("events.rsvp.heading")}
      </h2>

      {!showChooser && rsvp && (
        <>
          <p className="mt-2 text-sm">
            {t("events.rsvp.currentLabel", {
              status: t(`events.rsvp.status.${rsvp.status}`),
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary min-h-[44px]"
              disabled={pending}
              onClick={() => {
                setError(null);
                setChanging(true);
              }}
            >
              {t("events.rsvp.changeButton")}
            </button>
            {rsvp.status !== "not_going" && (
              <button
                type="button"
                className="btn-ghost min-h-[44px]"
                disabled={pending}
                aria-busy={pending}
                onClick={() => void handleSubmit("not_going")}
              >
                {t("events.rsvp.withdrawButton")}
              </button>
            )}
          </div>
        </>
      )}

      {showChooser && (
        <>
          {/* Comparison card — name the visibility consequence BEFORE
              the signature. RSVPs aren't federated but the local
              roster IS visible to organizer + other RSVPs (§6), so a
              member tapping "Going" deserves to know that. */}
          <div className="mt-2 rounded-lg border border-canopy-200 bg-canopy-50 p-3 text-sm dark:border-canopy-900/50 dark:bg-canopy-950/30">
            <div className="inline-flex items-baseline gap-1.5">
              <p className="font-semibold text-canopy-900 dark:text-canopy-100">
                {t("events.rsvp.signingHeading")}
              </p>
              <WhyTooltip principleId="privacy-precondition" />
            </div>
            <ul className="mt-1 list-disc pl-5 text-canopy-900 dark:text-canopy-100">
              <li>{t("events.rsvp.signingBodyGoing")}</li>
              <li>{t("events.rsvp.signingBodyNotGoing")}</li>
              <li>{t("events.rsvp.signingBodyLocalOnly")}</li>
            </ul>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary min-h-[44px]"
              disabled={pending}
              aria-busy={pending}
              onClick={() => void handleSubmit("going")}
            >
              {t("events.rsvp.going")}
            </button>
            <button
              type="button"
              className="btn-secondary min-h-[44px]"
              disabled={pending}
              aria-busy={pending}
              onClick={() => void handleSubmit("maybe")}
            >
              {t("events.rsvp.maybe")}
            </button>
            <button
              type="button"
              className="btn-secondary min-h-[44px]"
              disabled={pending}
              aria-busy={pending}
              onClick={() => void handleSubmit("not_going")}
            >
              {t("events.rsvp.notGoing")}
            </button>
            {changing && (
              <button
                type="button"
                className="btn-ghost min-h-[44px]"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  setChanging(false);
                }}
              >
                {t("common.cancel")}
              </button>
            )}
          </div>
        </>
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
