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
// (its own `lazy-content-sw` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_SW as PROJECT_TEMPLATES } from "../projectTemplates.sw";
export { TASK_STEPS_SW as TASK_STEPS } from "../taskSteps.sw";
export { TASK_TIPS_SW as TASK_TIPS } from "../taskTips.sw";
export { EVENT_TEMPLATES_SW as EVENT_TEMPLATES } from "../eventTemplates.sw";
export { FAQ_SECTIONS_SW as FAQ_SECTIONS } from "../faq.sw";
export { START_COMMUNITY_SW as START_COMMUNITY } from "../startCommunity.sw";
export { DESIGN_PRINCIPLES_SW as DESIGN_PRINCIPLES } from "../design-principles.sw";
export { MEMBER_GUIDE_SW as MEMBER_GUIDE } from "../member-guide.sw";
export { OPSEC_GUIDE_SW as OPSEC_GUIDE } from "../opsec-guide.sw";
export { STUDY_PROMPTS_SW as STUDY_PROMPTS } from "../study-prompts.sw";
