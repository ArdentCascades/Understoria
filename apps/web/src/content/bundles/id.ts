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

// The Indonesian content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-id` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_ID as PROJECT_TEMPLATES } from "../projectTemplates.id";
export { TASK_STEPS_ID as TASK_STEPS } from "../taskSteps.id";
export { TASK_TIPS_ID as TASK_TIPS } from "../taskTips.id";
export { EVENT_TEMPLATES_ID as EVENT_TEMPLATES } from "../eventTemplates.id";
export { FAQ_SECTIONS_ID as FAQ_SECTIONS } from "../faq.id";
export { START_COMMUNITY_ID as START_COMMUNITY } from "../startCommunity.id";
export { DESIGN_PRINCIPLES_ID as DESIGN_PRINCIPLES } from "../design-principles.id";
export { MEMBER_GUIDE_ID as MEMBER_GUIDE } from "../member-guide.id";
export { OPSEC_GUIDE_ID as OPSEC_GUIDE } from "../opsec-guide.id";
export { STUDY_PROMPTS_ID as STUDY_PROMPTS } from "../study-prompts.id";
