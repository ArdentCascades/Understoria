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

// The Spanish content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-es` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_ES as PROJECT_TEMPLATES } from "../projectTemplates.es";
export { TASK_STEPS_ES as TASK_STEPS } from "../taskSteps.es";
export { TASK_TIPS_ES as TASK_TIPS } from "../taskTips.es";
export { EVENT_TEMPLATES_ES as EVENT_TEMPLATES } from "../eventTemplates.es";
export { FAQ_SECTIONS_ES as FAQ_SECTIONS } from "../faq.es";
export { START_COMMUNITY_ES as START_COMMUNITY } from "../startCommunity.es";
export { DESIGN_PRINCIPLES_ES as DESIGN_PRINCIPLES } from "../design-principles.es";
