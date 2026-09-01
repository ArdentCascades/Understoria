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

// The Arabic content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-ar` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_AR as PROJECT_TEMPLATES } from "../projectTemplates.ar";
export { TASK_STEPS_AR as TASK_STEPS } from "../taskSteps.ar";
export { TASK_TIPS_AR as TASK_TIPS } from "../taskTips.ar";
export { EVENT_TEMPLATES_AR as EVENT_TEMPLATES } from "../eventTemplates.ar";
export { FAQ_SECTIONS_AR as FAQ_SECTIONS } from "../faq.ar";
export { START_COMMUNITY_AR as START_COMMUNITY } from "../startCommunity.ar";
export { DESIGN_PRINCIPLES_AR as DESIGN_PRINCIPLES } from "../design-principles.ar";
export { MEMBER_GUIDE_AR as MEMBER_GUIDE } from "../member-guide.ar";
export { OPSEC_GUIDE_AR as OPSEC_GUIDE } from "../opsec-guide.ar";
export { STUDY_PROMPTS_AR as STUDY_PROMPTS } from "../study-prompts.ar";
