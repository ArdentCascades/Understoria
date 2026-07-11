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
import { useLiveQuery } from "dexie-react-hooks";
import { db, SETTING_KEYS } from "@/db/database";
import { useApp } from "@/state/AppContext";
import { parseLastTouched, resolveLastTouched } from "@/lib/lastTouched";

// "Pick up where you left off" — the interruption-recovery doorway
// (lib/lastTouched.ts). After an interruption, the private plan's
// note covers re-entering a task; this covers the step before that:
// remembering which task you were even on. One quiet card, straight
// back into your own context.
//
// Doorways contract (same as DeskDoorway): renders nothing when
// there's nothing valid to resume — no badge, no count, no urgency.
// Validity is re-derived on every render: the task must still exist
// and still be the viewer's own active claim, so a released or
// confirmed task never leaves a dead link here.
export function ResumeCard() {
  const { t } = useTranslation();
  const { currentMember, projects, projectTasks } = useApp();
  const setting = useLiveQuery(
    () => db.settings.get(SETTING_KEYS.lastTouchedTask),
    [],
  );
  const resolved = resolveLastTouched(
    parseLastTouched(setting?.value),
    currentMember?.publicKey,
    projectTasks,
    projects,
  );
  if (!resolved) return null;
  const { task, project } = resolved;
  return (
    <section className="card mb-4 text-sm" aria-labelledby="resume-card-title">
      <h2
        id="resume-card-title"
        className="text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("dashboard.resume.title")}
      </h2>
      <p className="mt-1">
        <Link
          to={`/project/${project.id}/task/${task.id}`}
          className="font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        >
          {task.title}
        </Link>
        <span className="block text-xs text-moss-600 dark:text-moss-300">
          {project.title}
        </span>
      </p>
      {/* Says plainly what this card is, so it never reads as the app
          tracking the member: it's their own navigation memory, on
          their own device. */}
      <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
        {t("dashboard.resume.hint")}
      </p>
    </section>
  );
}
