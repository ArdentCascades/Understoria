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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDeskActionableCount } from "@/pages/OrganizerDesk";

// The desk\'s dashboard doorway (docs/desktop-power-tools.md plan 2):
// one quiet line when — and only when — something is actionable at
// the viewer\'s own desk. The doorways contract: renders nothing on
// a calm day; never a badge, never urgency styling.
export function DeskDoorway() {
  const { t } = useTranslation();
  const count = useDeskActionableCount();
  if (count === 0) return null;
  return (
    <section className="card mb-4 text-sm">
      <Link
        to="/desk"
        className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
      >
        {t("desk.doorway", { count })}
      </Link>
    </section>
  );
}
