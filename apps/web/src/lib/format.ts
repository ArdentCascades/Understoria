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
  const diff = now - timestamp;
  if (diff < 0) {
    return formatFutureTime(-diff);
  }
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function formatFutureTime(diff: number): string {
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `in ${hours}h`;
  const days = Math.floor(hours / 24);
  return `in ${days}d`;
}

export function shortKey(publicKey: string): string {
  if (publicKey.length <= 8) return publicKey;
  return `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}`;
}
