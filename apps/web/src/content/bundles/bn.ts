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

// The Bengali content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-bn` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_BN as PROJECT_TEMPLATES } from "../projectTemplates.bn";
export { TASK_STEPS_BN as TASK_STEPS } from "../taskSteps.bn";
export { TASK_TIPS_BN as TASK_TIPS } from "../taskTips.bn";
export { EVENT_TEMPLATES_BN as EVENT_TEMPLATES } from "../eventTemplates.bn";
export { FAQ_SECTIONS_BN as FAQ_SECTIONS } from "../faq.bn";
export { START_COMMUNITY_BN as START_COMMUNITY } from "../startCommunity.bn";
export { DESIGN_PRINCIPLES_BN as DESIGN_PRINCIPLES } from "../design-principles.bn";
export { MEMBER_GUIDE_BN as MEMBER_GUIDE } from "../member-guide.bn";
export { OPSEC_GUIDE_BN as OPSEC_GUIDE } from "../opsec-guide.bn";
export { STUDY_PROMPTS_BN as STUDY_PROMPTS } from "../study-prompts.bn";
