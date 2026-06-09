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
import { useTranslation } from "react-i18next";
import { formatAbsoluteDate } from "@/lib/format";
import type { EventCancellation } from "@/types";

export interface EventCancellationCardProps {
  cancellation: EventCancellation;
  /** Resolved organizer display name (from `members` lookup). Falls
   *  back to a truncated pubkey or to the i18n fallback if the
   *  parent passes `null`. */
  organizerName: string | null;
}

/**
 * Renders the "This event was cancelled" banner. Same calm,
 * informational tone as the project pause banner — amber palette,
 * named consequence ("you weren't ghosted; here's why"), no WhyTooltip
 * (the prior signing surface already named the cancellation
 * affordance).
 *
 * The `reason` line is omitted when the organizer left it empty; the
 * design doc §4.3 specifies "empty reason is allowed and rendered as
 * 'Cancelled (no reason given).'" — we honor that by surfacing the
 * top line in either case but only listing the `reason` field when
 * non-empty.
 */
export function EventCancellationCard({
  cancellation,
  organizerName,
}: EventCancellationCardProps) {
  const { t } = useTranslation();
  const reason = cancellation.reason.trim();
  return (
    <section
      role="status"
      aria-labelledby="event-cancellation-heading"
      className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30"
    >
      <h2
        id="event-cancellation-heading"
        className="text-sm font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100"
      >
        {t("events.cancellation.bannerHeading")}
      </h2>
      <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">
        {t("events.cancellation.bannerBody", {
          name: organizerName ?? t("common.memberFallback"),
          date: formatAbsoluteDate(cancellation.cancelledAt),
        })}
      </p>
      {reason !== "" && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-amber-900 dark:text-amber-100">
          {t("events.cancellation.reasonLine", { reason })}
        </p>
      )}
    </section>
  );
}
