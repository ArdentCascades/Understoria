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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Lazy-renders a QR code from `value`. The `qrcode` package is
// dynamically imported on first render so the cost (~25 KB
// gzipped) is paid only when a member opens the share sheet.
// Output is SVG: scales cleanly, themes via CSS if we ever want
// to, and accessibly text-traversable.
//
// Colors are intentionally fixed at black-on-white regardless of
// the app's dark-mode preference. QR scanners on cheap phones
// expect maximum contrast and white quiet zones; a dark-mode QR
// trades scanning reliability for visual consistency, and the
// reliability matters more for a once-in-a-while invite share.

export interface InviteQRCodeProps {
  value: string;
  /** Pixel size of one side of the rendered QR. Defaults to 256. */
  size?: number;
  /** ARIA label for the SVG. Required because the visual is the
   *  payload — screen readers need a description. */
  ariaLabel: string;
}

export function InviteQRCode({
  value,
  size = 256,
  ariaLabel,
}: InviteQRCodeProps) {
  const { t } = useTranslation();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(false);
    void (async () => {
      try {
        const mod = await import("qrcode");
        const out = await mod.toString(value, {
          type: "svg",
          margin: 2,
          errorCorrectionLevel: "M",
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        if (!cancelled) setSvg(out);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-100"
      >
        {t("profile.invites.shareSheet.qrFallback")}
      </p>
    );
  }

  if (!svg) {
    // Stable-size placeholder so the sheet doesn't jump in height
    // between async import and render.
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-xl bg-moss-100 dark:bg-moss-800"
        aria-hidden="true"
      />
    );
  }

  // We control the input (a self-issued invite URL) and the QR
  // library's SVG output — no XSS surface from dangerouslySetInnerHTML
  // here. The wrapping div carries the aria-label so AT users get the
  // textual description even though the visual is opaque.
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{ width: size, height: size }}
      className="rounded-xl bg-white p-2"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
