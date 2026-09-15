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

// The Persian content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-fa` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_FA as PROJECT_TEMPLATES } from "../projectTemplates.fa";
export { TASK_STEPS_FA as TASK_STEPS } from "../taskSteps.fa";
export { TASK_TIPS_FA as TASK_TIPS } from "../taskTips.fa";
export { EVENT_TEMPLATES_FA as EVENT_TEMPLATES } from "../eventTemplates.fa";
export { FAQ_SECTIONS_FA as FAQ_SECTIONS } from "../faq.fa";
export { START_COMMUNITY_FA as START_COMMUNITY } from "../startCommunity.fa";
export { DESIGN_PRINCIPLES_FA as DESIGN_PRINCIPLES } from "../design-principles.fa";
export { MEMBER_GUIDE_FA as MEMBER_GUIDE } from "../member-guide.fa";
export { OPSEC_GUIDE_FA as OPSEC_GUIDE } from "../opsec-guide.fa";
export { STUDY_PROMPTS_FA as STUDY_PROMPTS } from "../study-prompts.fa";
