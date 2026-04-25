import { useTranslation } from "react-i18next";
import type { TrustStatus } from "@/lib/vouch";

export function TrustChip({ status }: { status: TrustStatus }) {
  const { t } = useTranslation();
  if (status === "trusted") {
    return (
      <span
        className="chip bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100"
        title={t("trust.trustedTooltip")}
      >
        <span aria-hidden="true" className="mr-1">
          {"\u{2714}"}
        </span>
        {t("trust.trusted")}
      </span>
    );
  }
  return (
    <span
      className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
      title={t("trust.pendingTooltip")}
    >
      <span aria-hidden="true" className="mr-1">
        {"\u{231B}"}
      </span>
      {t("trust.pending")}
    </span>
  );
}
