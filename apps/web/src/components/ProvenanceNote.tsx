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
// The honesty half of provenance-verified display translation
// (docs/provenance-translation.md): ONE note per surface — never a
// badge per string — saying playbook text is being shown in the
// viewer's language, with the View-original toggle that flips the
// whole surface back to the signed bytes. When the surface mixes
// translated playbook text with organizer-authored text, the note
// adds the second sentence: member text is never machine-translated.
import { useTranslation } from "react-i18next";

/** The note only needs the toggle-and-state slice, so any provenance
 *  hook (project surface, event surface) can drive it. */
interface ProvenanceNoteState {
  any: boolean;
  mixed: boolean;
  showOriginal: boolean;
  toggleOriginal: () => void;
}

export function ProvenanceNote({ prov }: { prov: ProvenanceNoteState }) {
  const { t } = useTranslation();
  if (!prov.any) return null;
  return (
    <p
      role="note"
      className="mt-2 rounded-lg bg-moss-50 px-3 py-2 text-xs text-moss-700 dark:bg-moss-900/60 dark:text-moss-200"
    >
      {t("provenance.note")}
      {prov.mixed && <> {t("provenance.mixedNote")}</>}{" "}
      <button
        type="button"
        className="font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        aria-pressed={prov.showOriginal}
        onClick={prov.toggleOriginal}
      >
        {prov.showOriginal
          ? t("provenance.showTranslated")
          : t("provenance.viewOriginal")}
      </button>
    </p>
  );
}
