import { useTranslation } from "react-i18next";
import type { AchievementType } from "@/types";

const ICONS: Record<AchievementType, string> = {
  first_exchange: "\u{1F331}",
  connector_5: "\u{1F517}",
  regular_4weeks: "\u{1F33F}",
  bridge_builder: "\u{1F309}",
  seed_planter: "\u{1F33E}",
  listener: "\u{1F442}",
};

export function AchievementBadge({
  type,
  earnedAt,
}: {
  type: AchievementType;
  earnedAt?: number;
}) {
  const { t, i18n } = useTranslation();
  const formattedDate = earnedAt
    ? new Date(earnedAt).toLocaleDateString(i18n.resolvedLanguage)
    : null;
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
          <div className="mt-1 text-[11px] text-moss-500 dark:text-moss-400">
            {t("achievement.earnedDate", { date: formattedDate })}
          </div>
        )}
      </div>
    </div>
  );
}
