/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getTemplate } from "@/content/projectTemplates";

/**
 * Decision logic for the ONE quiet work-day hint on a project page —
 * the bridge between rota-shaped templates (fridge cleaning rotas,
 * repair-café sessions…) and the work-day + shifts machinery that
 * coordinates exactly that kind of recurring crew work.
 *
 * Bounded on purpose (`no-notifications`): organizer-only, inline on
 * the page they're already on, gone forever once dismissed, and gone
 * on its own the moment a first work day exists. Never a rail item,
 * never a badge, never re-prompts.
 */

/** Whether the project's template flags rota-shaped work. The flag is
 *  structural (same across locales), so the EN table is authoritative. */
export function projectSuggestsWorkDays(templateId: string | null): boolean {
  if (!templateId) return false;
  return getTemplate(templateId, "en")?.suggestsWorkDays === true;
}

export function shouldShowWorkDayHint(opts: {
  templateId: string | null;
  upcomingWorkDays: number;
  canSchedule: boolean;
  dismissed: boolean;
}): boolean {
  return (
    opts.canSchedule &&
    opts.upcomingWorkDays === 0 &&
    !opts.dismissed &&
    projectSuggestsWorkDays(opts.templateId)
  );
}
