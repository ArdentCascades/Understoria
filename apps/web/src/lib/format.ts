import i18n from "@/i18n";

export function formatHours(hours: number): string {
  if (Number.isNaN(hours)) return "0h";
  const rounded = Math.round(hours * 10) / 10;
  if (rounded === 0) return "0h";
  if (rounded < 1) {
    const minutes = Math.round(rounded * 60);
    return `${minutes}m`;
  }
  return `${rounded}h`;
}

export function formatSignedHours(hours: number): string {
  if (hours === 0) return "0h";
  const sign = hours > 0 ? "+" : "-";
  return `${sign}${formatHours(Math.abs(hours))}`;
}

export function formatRelativeTime(
  timestamp: number,
  now: number = Date.now(),
): string {
  const t = i18n.t.bind(i18n);
  const diff = now - timestamp;
  if (diff < 0) {
    return formatFutureTime(-diff);
  }
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return t("format.justNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("format.minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("format.hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t("format.daysAgo", { count: days });
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return t("format.weeksAgo", { count: weeks });
  const months = Math.floor(days / 30);
  if (months < 12) return t("format.monthsAgo", { count: months });
  const years = Math.floor(days / 365);
  return t("format.yearsAgo", { count: years });
}

function formatFutureTime(diff: number): string {
  const t = i18n.t.bind(i18n);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return t("format.inMinutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("format.inHours", { count: hours });
  const days = Math.floor(hours / 24);
  return t("format.inDays", { count: days });
}

export function shortKey(publicKey: string): string {
  if (publicKey.length <= 8) return publicKey;
  return `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}`;
}
