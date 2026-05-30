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

// Local-only share helper. Wraps the Web Share API
// (navigator.share) with a clipboard fallback so the same call
// site works on iOS/Android (native share sheet) and on desktop
// browsers that don't implement it. No analytics, no telemetry —
// Web Share is in-OS, not a third-party service, so once the user
// picks a target the URL travels via whatever app they chose.
//
// A user-cancelled share is NOT an error; we return "cancelled"
// so the caller can stay quiet (no toast, no "Couldn't share").

export type ShareResult = "shared" | "cancelled" | "copied" | "failed";

export interface ShareUrlArgs {
  url: string;
  title?: string;
  text?: string;
}

export async function shareUrl(args: ShareUrlArgs): Promise<ShareResult> {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (nav && typeof nav.share === "function") {
    try {
      await nav.share({
        url: args.url,
        title: args.title,
        text: args.text,
      });
      return "shared";
    } catch (err) {
      // User dismissed the native share sheet — silent path.
      if (err instanceof Error && err.name === "AbortError") {
        return "cancelled";
      }
      // Permission denied / unsupported target / other — fall through
      // to clipboard so the link doesn't get lost.
    }
  }
  return copyToClipboard(args.url);
}

async function copyToClipboard(url: string): Promise<ShareResult> {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (nav && nav.clipboard && typeof nav.clipboard.writeText === "function") {
    try {
      await nav.clipboard.writeText(url);
      return "copied";
    } catch {
      return "failed";
    }
  }
  return "failed";
}
