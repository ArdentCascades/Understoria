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
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { shortKey } from "@/lib/format";

// The identity short key on CASUAL surfaces — hidden behind a subtle
// tap target by default, because pilot members read a ubiquitous
// `(a1b2…c3d4)` as a rendering glitch, not a safety feature. The one
// protective job the inline key does in casual chrome — telling two
// members with the same display name apart — is preserved by the
// caller passing `revealed` from `lib/nameCollisions.ts`, so the key
// surfaces inline exactly when a collision exists.
//
// Verification ceremonies (invite fingerprints, in-person exchange,
// pairing, signed records) do NOT use this component: there the key
// IS the content and never hides. Canonical identity spots
// (MemberDetail header, own Profile) use `alwaysShown`, keeping the
// key visible as before while making it tappable for the explainer.
//
// Disclosure idiom mirrors WhyTooltip.tsx: local state, no portal,
// an inline-block wrapper whose open panel flows in place.

export function IdentityKey({
  publicKey,
  name,
  isYou = false,
  revealed = false,
  alwaysShown = false,
  children,
}: {
  publicKey: string;
  name: string;
  /** Use the second-person explainer (the viewer's own key). */
  isYou?: boolean;
  /** Collision auto-reveal: render the key inline as before. */
  revealed?: boolean;
  /** Canonical identity spots: key always visible, tap explains. */
  alwaysShown?: boolean;
  /** alwaysShown only — the existing key rendering to wrap. */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const keyInline = revealed || alwaysShown;
  const explainer = isYou
    ? t("identity.explainerYou")
    : t("identity.explainer", { name });

  const panel = open && (
    <span
      role="note"
      className="mt-1 block max-w-md rounded-lg bg-moss-50 px-3 py-2 text-left font-sans text-xs font-normal text-moss-700 dark:bg-moss-900/60 dark:text-moss-200"
    >
      {/* When the key is hidden chrome, the tap is what shows it. */}
      {!keyInline && (
        <span className="block font-mono">{shortKey(publicKey)}</span>
      )}
      {explainer}
    </span>
  );

  if (alwaysShown) {
    return (
      <span className="inline-block align-middle">
        <button
          type="button"
          className="underline-offset-2 hover:underline"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          {children ?? shortKey(publicKey)}
        </button>
        {panel}
      </span>
    );
  }

  if (keyInline) {
    // Collision: the disambiguating key renders exactly like the old
    // inline chrome, and stays tappable for the explainer.
    return (
      <span className="inline-block align-middle">
        <button
          type="button"
          className="text-xs text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          ({shortKey(publicKey)})
        </button>
        {panel}
      </span>
    );
  }

  return (
    <span className="inline-block align-middle">
      <button
        type="button"
        className="text-xs text-moss-400 hover:text-moss-600 dark:text-moss-500 dark:hover:text-moss-300"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={t("identity.show")}
      >
        <span aria-hidden="true">{"ⓘ"}</span>
      </button>
      {panel}
    </span>
  );
}
