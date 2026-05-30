/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useTranslation } from "react-i18next";
import { formatAbsoluteDate } from "@/lib/format";
import type { AchievementType } from "@/types";

const ICONS: Record<AchievementType, string> = {
  first_exchange: "\u{1F331}",
  connector_5: "\u{1F517}",
  regular_4weeks: "\u{1F33F}",
  bridge_builder: "\u{1F309}",
  seed_planter: "\u{1F33E}",
  listener: "\u{1F442}",
  weaver: "\u{1F578}",
  groundbreaker: "\u{1FAB4}",
  crew_member: "\u{1F91D}",
  momentum_maker: "\u{1F30A}",
  keystone: "\u{1F511}",
};

export function AchievementBadge({
  type,
  earnedAt,
}: {
  type: AchievementType;
  earnedAt?: number;
}) {
  const { t } = useTranslation();
  const formattedDate = earnedAt ? formatAbsoluteDate(earnedAt) : null;
  return (
    <div className="flex items-start gap-3 rounded-xl bg-moss-50 p-3 dark:bg-moss-900/50">
      <div
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canopy-100 text-xl dark:bg-canopy-900/60"
      >
        {ICONS[type]}
      </div>
      <div>
        <div className="text-sm font-semibold">{t(`achievement.${type}.label`)}</div>
        <div className="text-xs text-moss-600 dark:text-moss-300">
          {t(`achievement.${type}.description`)}
        </div>
        {formattedDate && (
          <div className="mt-1 text-[0.6875rem] text-moss-500 dark:text-moss-400">
            {t("achievement.earnedDate", { date: formattedDate })}
          </div>
        )}
      </div>
    </div>
  );
}
