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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  isReadAloudEnabled,
  setReadAloudEnabled,
} from "@/lib/readAloud";
import { speak } from "@/lib/speak";

/** Settings card for read-aloud mode (#473). The toggle itself
 *  speaks its new state — the one control a non-reader must be able
 *  to operate before the mode exists. */
export function ReadAloudSection() {
  const { t, i18n } = useTranslation();
  const [enabled, setEnabled] = useState(isReadAloudEnabled);
  const supported = typeof window.speechSynthesis !== "undefined";
  const lang = i18n.language?.startsWith("es") ? "es" : "en";

  return (
    <section className="card mb-4" aria-labelledby="read-aloud-title">
      <h2
        id="read-aloud-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        <span aria-hidden="true" className="mr-1">
          🔊
        </span>
        {t("profile.readAloud.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.readAloud.intro")}
      </p>
      {supported ? (
        <button
          type="button"
          aria-pressed={enabled}
          className={enabled ? "btn-primary" : "btn-secondary"}
          onClick={() => {
            const next = !enabled;
            setReadAloudEnabled(next);
            setEnabled(next);
            speak(
              next
                ? t("profile.readAloud.spokenOn")
                : t("profile.readAloud.spokenOff"),
              lang,
            );
          }}
        >
          {enabled
            ? t("profile.readAloud.turnOff")
            : t("profile.readAloud.turnOn")}
        </button>
      ) : (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("profile.readAloud.unsupported")}
        </p>
      )}
    </section>
  );
}
