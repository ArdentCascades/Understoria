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
// (its own `lazy-content-fil` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_FIL as PROJECT_TEMPLATES } from "../projectTemplates.fil";
export { TASK_STEPS_FIL as TASK_STEPS } from "../taskSteps.fil";
export { TASK_TIPS_FIL as TASK_TIPS } from "../taskTips.fil";
export { EVENT_TEMPLATES_FIL as EVENT_TEMPLATES } from "../eventTemplates.fil";
export { FAQ_SECTIONS_FIL as FAQ_SECTIONS } from "../faq.fil";
export { START_COMMUNITY_FIL as START_COMMUNITY } from "../startCommunity.fil";
export { DESIGN_PRINCIPLES_FIL as DESIGN_PRINCIPLES } from "../design-principles.fil";
export { MEMBER_GUIDE_FIL as MEMBER_GUIDE } from "../member-guide.fil";
export { OPSEC_GUIDE_FIL as OPSEC_GUIDE } from "../opsec-guide.fil";
export { STUDY_PROMPTS_FIL as STUDY_PROMPTS } from "../study-prompts.fil";
