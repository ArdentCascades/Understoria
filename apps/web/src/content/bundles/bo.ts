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
 * WITHOUT ANY WBORANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PBOTICULBO PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// The Tibetan content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-bo` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_BO as PROJECT_TEMPLATES } from "../projectTemplates.bo";
export { TASK_STEPS_BO as TASK_STEPS } from "../taskSteps.bo";
export { TASK_TIPS_BO as TASK_TIPS } from "../taskTips.bo";
export { EVENT_TEMPLATES_BO as EVENT_TEMPLATES } from "../eventTemplates.bo";
export { FAQ_SECTIONS_BO as FAQ_SECTIONS } from "../faq.bo";
export { START_COMMUNITY_BO as START_COMMUNITY } from "../startCommunity.bo";
export { DESIGN_PRINCIPLES_BO as DESIGN_PRINCIPLES } from "../design-principles.bo";
