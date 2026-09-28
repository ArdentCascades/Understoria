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
// The Korean content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-ko` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_KO as PROJECT_TEMPLATES } from "../projectTemplates.ko";
export { TASK_STEPS_KO as TASK_STEPS } from "../taskSteps.ko";
export { TASK_TIPS_KO as TASK_TIPS } from "../taskTips.ko";
export { EVENT_TEMPLATES_KO as EVENT_TEMPLATES } from "../eventTemplates.ko";
export { FAQ_SECTIONS_KO as FAQ_SECTIONS } from "../faq.ko";
export { START_COMMUNITY_KO as START_COMMUNITY } from "../startCommunity.ko";
export { DESIGN_PRINCIPLES_KO as DESIGN_PRINCIPLES } from "../design-principles.ko";
export { MEMBER_GUIDE_KO as MEMBER_GUIDE } from "../member-guide.ko";
export { OPSEC_GUIDE_KO as OPSEC_GUIDE } from "../opsec-guide.ko";
export { STUDY_PROMPTS_KO as STUDY_PROMPTS } from "../study-prompts.ko";
