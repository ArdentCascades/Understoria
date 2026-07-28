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

// The Hindi content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-hi` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_HI as PROJECT_TEMPLATES } from "../projectTemplates.hi";
export { TASK_STEPS_HI as TASK_STEPS } from "../taskSteps.hi";
export { TASK_TIPS_HI as TASK_TIPS } from "../taskTips.hi";
export { EVENT_TEMPLATES_HI as EVENT_TEMPLATES } from "../eventTemplates.hi";
export { FAQ_SECTIONS_HI as FAQ_SECTIONS } from "../faq.hi";
export { START_COMMUNITY_HI as START_COMMUNITY } from "../startCommunity.hi";
