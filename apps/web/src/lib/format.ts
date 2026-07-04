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
  // Gate the year handoff on DAYS, not on `months < 12`. With a 30-day
  // month and a 365-day year, days 360–364 give months=12 (failing
  // `months < 12`) but years=0 — rendering a nonsensical "0y ago". Any
  // timestamp ages through that 5-day window. Handing off at 365 days
  // shows "12 months ago" there instead, then "1 year" at day 365.
  if (days < 365) return t("format.monthsAgo", { count: months });
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

// Single source of truth for "absolute date" rendering. Always
// uses the current i18n locale — `toLocaleDateString()` with no
// argument falls back to the browser default, which can mismatch
// the app's chosen language (Spanish UI, English dates).
export function formatAbsoluteDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(i18n.resolvedLanguage);
}

// Same as formatAbsoluteDate but includes the time of day. For
// events where the hour-of-day matters (federation sync timestamps,
// invite redemption moment).
export function formatAbsoluteDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(i18n.resolvedLanguage);
}

// Smart formatter for future-facing events (invite expiries,
// project deadlines). Reads relative ("in 3 days") when close
// enough to feel actionable; falls back to absolute ("Mar 5, 2026")
// when far enough that "in 180 days" is awkward. 7 days is the
// cutoff — the same week-boundary formatRelativeTime uses for past
// events ("3 days ago" → "2 weeks ago").
const DEADLINE_RELATIVE_CUTOFF_MS = 7 * 24 * 60 * 60 * 1000;

export function formatDeadline(
  timestamp: number,
  now: number = Date.now(),
): string {
  if (Math.abs(timestamp - now) < DEADLINE_RELATIVE_CUTOFF_MS) {
    return formatRelativeTime(timestamp, now);
  }
  return formatAbsoluteDate(timestamp);
}

export function shortKey(publicKey: string): string {
  if (publicKey.length <= 8) return publicKey;
  return `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}`;
}
