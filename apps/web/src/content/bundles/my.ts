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

// The Burmese content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-my` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_MY as PROJECT_TEMPLATES } from "../projectTemplates.my";
export { TASK_STEPS_MY as TASK_STEPS } from "../taskSteps.my";
export { TASK_TIPS_MY as TASK_TIPS } from "../taskTips.my";
export { EVENT_TEMPLATES_MY as EVENT_TEMPLATES } from "../eventTemplates.my";
export { FAQ_SECTIONS_MY as FAQ_SECTIONS } from "../faq.my";
export { START_COMMUNITY_MY as START_COMMUNITY } from "../startCommunity.my";
export { DESIGN_PRINCIPLES_MY as DESIGN_PRINCIPLES } from "../design-principles.my";
export { MEMBER_GUIDE_MY as MEMBER_GUIDE } from "../member-guide.my";
export { OPSEC_GUIDE_MY as OPSEC_GUIDE } from "../opsec-guide.my";
export { STUDY_PROMPTS_MY as STUDY_PROMPTS } from "../study-prompts.my";
