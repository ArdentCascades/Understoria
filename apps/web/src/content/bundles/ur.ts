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

// The Urdu content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-ur` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_UR as PROJECT_TEMPLATES } from "../projectTemplates.ur";
export { TASK_STEPS_UR as TASK_STEPS } from "../taskSteps.ur";
export { TASK_TIPS_UR as TASK_TIPS } from "../taskTips.ur";
export { EVENT_TEMPLATES_UR as EVENT_TEMPLATES } from "../eventTemplates.ur";
export { FAQ_SECTIONS_UR as FAQ_SECTIONS } from "../faq.ur";
export { START_COMMUNITY_UR as START_COMMUNITY } from "../startCommunity.ur";
export { DESIGN_PRINCIPLES_UR as DESIGN_PRINCIPLES } from "../design-principles.ur";
export { MEMBER_GUIDE_UR as MEMBER_GUIDE } from "../member-guide.ur";
export { OPSEC_GUIDE_UR as OPSEC_GUIDE } from "../opsec-guide.ur";
export { STUDY_PROMPTS_UR as STUDY_PROMPTS } from "../study-prompts.ur";
