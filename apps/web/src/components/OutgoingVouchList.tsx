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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatRelativeTime, shortKey } from "@/lib/format";
import type { VoucheeRef } from "@/lib/vouch";
import type { Member } from "@/types";

// The inverse of TrustedByList: shows people the CURRENT member has
// vouched for (or invited). Personal record on Profile so the
// member can see their own role in the trust web and avoid
// accidentally vouching twice for the same person.

interface OutgoingVouchListProps {
  vouchees: readonly VoucheeRef[];
  members: readonly Member[];
}

export function OutgoingVouchList({
  vouchees,
  members,
}: OutgoingVouchListProps) {
  const { t } = useTranslation();
  const memberByKey = new Map(members.map((m) => [m.publicKey, m]));

  if (vouchees.length === 0) {
    return (
      <p className="text-sm text-moss-600 dark:text-moss-300">
        {t("outgoingVouches.empty")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-moss-100 dark:divide-moss-800">
      {vouchees.map((entry) => {
        const vouchee = memberByKey.get(entry.voucheeKey);
        const name = vouchee?.displayName ?? t("common.memberFallback");
        const keyHint = shortKey(entry.voucheeKey);
        return (
          <li
            key={entry.voucheeKey}
            className="flex items-center justify-between gap-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <Link
                to={`/member/${entry.voucheeKey}`}
                className="text-sm font-medium text-canopy-800 underline-offset-2 hover:underline dark:text-canopy-200"
              >
                {name}
              </Link>
              <span className="ml-2 font-mono text-xs text-moss-500">
                ({keyHint})
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5 text-xs text-moss-500 dark:text-moss-400">
              <span
                className={
                  entry.kind === "manual"
                    ? "chip bg-canopy-50 text-canopy-800 dark:bg-canopy-950/40 dark:text-canopy-200"
                    : "chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200"
                }
              >
                {entry.kind === "manual"
                  ? t("outgoingVouches.kindManual")
                  : t("outgoingVouches.kindInvite")}
              </span>
              {entry.kind === "manual" && entry.createdAt > 0 && (
                <span>{formatRelativeTime(entry.createdAt)}</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
