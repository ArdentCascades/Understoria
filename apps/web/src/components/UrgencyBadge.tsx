import { useTranslation } from "react-i18next";
import type { Urgency } from "@/types";

const STYLES: Record<Urgency, string> = {
  low: "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200",
  medium:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  high: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const { t } = useTranslation();
  const label = t(`urgency.${urgency}`);
  return (
    <span
      className={`chip ${STYLES[urgency]}`}
      role="status"
      aria-label={t("urgency.ariaLabel", { label })}
    >
      {label}
    </span>
  );
}
