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
import { formatRelativeTime } from "@/lib/format";

// "Continue your draft from X ago?" banner. Rendered above a form
// when a saved draft is available. Two actions — restore (populate
// the form) and discard (delete the draft, start fresh). Visually
// understated (canopy-50 card, no big colors) so it reads as helpful
// context, not a modal blocker.

interface DraftBannerProps {
  updatedAt: number;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftBanner({
  updatedAt,
  onRestore,
  onDiscard,
}: DraftBannerProps) {
  const { t } = useTranslation();
  const when = formatRelativeTime(updatedAt);
  return (
    <div
      role="region"
      aria-label={t("drafts.bannerLabel")}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-canopy-200
                 bg-canopy-50 px-3 py-2 text-sm
                 dark:border-canopy-900 dark:bg-canopy-950/40
                 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-canopy-900 dark:text-canopy-100">
        {t("drafts.bannerMessage", { when })}
      </p>
      <div className="flex gap-2 self-end sm:self-auto">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={onDiscard}
        >
          {t("drafts.discard")}
        </button>
        <button
          type="button"
          className="btn-primary text-xs"
          onClick={onRestore}
        >
          {t("drafts.restore")}
        </button>
      </div>
    </div>
  );
}
