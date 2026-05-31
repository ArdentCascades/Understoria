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
import type { VoucherRef } from "@/lib/vouch";
import type { Member } from "@/types";
import { MemberAvatar } from "./MemberAvatar";

// Renders the set of members who have vouched for someone — both the
// manual signed vouches and the implicit "I invited you" vouches.
// Lives on MemberDetail so a member's trust state is transparent (who
// vouched, not just "is trusted: yes/no"). Per GOVERNANCE.md: trust
// is a community property, not an admin grant.
//
// Each entry links to the voucher's MemberDetail page so trust can
// be followed transitively — "Rosa vouched for them, and I trust
// Rosa, so I have a reason to extend trust here too."

interface TrustedByListProps {
  vouchers: ReadonlyMap<string, VoucherRef>;
  members: readonly Member[];
}

export function TrustedByList({ vouchers, members }: TrustedByListProps) {
  const { t } = useTranslation();
  const memberByKey = new Map(members.map((m) => [m.publicKey, m]));

  // Order: manual vouches newest-first, then invite vouches (which
  // don't carry a useful timestamp).
  const entries = Array.from(vouchers.values()).sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === "manual" ? -1 : 1;
    }
    return b.createdAt - a.createdAt;
  });

  if (entries.length === 0) {
    return (
      <p className="text-sm text-moss-600 dark:text-moss-300">
        {t("trustedBy.empty")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-moss-100 dark:divide-moss-800">
      {entries.map((entry) => {
        const voucher = memberByKey.get(entry.voucherKey);
        const name = voucher?.displayName ?? t("common.memberFallback");
        const keyHint = shortKey(entry.voucherKey);
        return (
          <li
            key={entry.voucherKey}
            className="flex items-center justify-between gap-3 py-2"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <MemberAvatar publicKey={entry.voucherKey} size={28} />
              <div className="min-w-0">
                <Link
                  to={`/member/${entry.voucherKey}`}
                  className="text-sm font-medium text-canopy-800 underline-offset-2 hover:underline dark:text-canopy-200"
                >
                  {name}
                </Link>
                <span className="ml-2 font-mono text-xs text-moss-500">
                  ({keyHint})
                </span>
              </div>
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
                  ? t("trustedBy.kindManual")
                  : t("trustedBy.kindInvite")}
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
