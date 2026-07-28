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

// The Portuguese content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-pt` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_PT as PROJECT_TEMPLATES } from "../projectTemplates.pt";
export { TASK_STEPS_PT as TASK_STEPS } from "../taskSteps.pt";
export { TASK_TIPS_PT as TASK_TIPS } from "../taskTips.pt";
export { EVENT_TEMPLATES_PT as EVENT_TEMPLATES } from "../eventTemplates.pt";
export { FAQ_SECTIONS_PT as FAQ_SECTIONS } from "../faq.pt";
export { START_COMMUNITY_PT as START_COMMUNITY } from "../startCommunity.pt";
