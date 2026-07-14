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

/** Returns true when the browser supports at least one path that
 *  ships a URL off-device without rendering it on screen:
 *  `navigator.share` (native share sheet) or
 *  `navigator.clipboard.writeText` (silent clipboard write). Used
 *  by the invite share sheet's camera-awareness gate to decide
 *  whether the "Send the link without showing it" affordance is
 *  honest. False = the option is a lie; surface that to the user
 *  rather than letting them tap into nothing. */
export function canShareUrl(): boolean {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (!nav) return false;
  if (typeof nav.share === "function") return true;
  if (nav.clipboard && typeof nav.clipboard.writeText === "function")
    return true;
  return false;
}

export async function shareUrl(args: ShareUrlArgs): Promise<ShareResult> {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (nav && typeof nav.share === "function") {
    try {
      // Web Share footgun: when BOTH `text` and `url` are passed,
      // several platforms' "Copy" action in the native share sheet
      // (desktop Chrome/Edge, some Android) copy only the `text` and
      // silently DROP the `url` — so an invite got copied as the
      // message with no link. The fix is to fold the URL into the
      // shared text so Copy can never lose it, while STILL passing the
      // typed `url` field — that field is what iOS surfaces to
      // URL-consuming targets (Reading List, link previews) and what
      // Android/PWA share_target manifests bind their `url` param to;
      // dropping it regressed every url-only share surface. Callers
      // that pass no `text` keep the original `{title, url}` shape:
      // with no text to shadow the url, the Copy bug cannot occur, and
      // adding a text copy of the link would render it twice in
      // targets that concatenate both.
      await nav.share(
        args.text
          ? {
              title: args.title,
              text: `${args.text}\n\n${args.url}`,
              url: args.url,
            }
          : { title: args.title, url: args.url },
      );
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
