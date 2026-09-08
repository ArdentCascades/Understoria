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

// The Haitian Creole content bundle — loaded lazily by content/registry.ts
// (its own `lazy-content-ht` chunk, excluded from the service-worker
// precache and runtime-cached after first use). Never import this
// statically from app code: a static import anywhere drags the whole
// bundle back into first load for every member.
export { PROJECT_TEMPLATES_HT as PROJECT_TEMPLATES } from "../projectTemplates.ht";
export { TASK_STEPS_HT as TASK_STEPS } from "../taskSteps.ht";
export { TASK_TIPS_HT as TASK_TIPS } from "../taskTips.ht";
export { EVENT_TEMPLATES_HT as EVENT_TEMPLATES } from "../eventTemplates.ht";
export { FAQ_SECTIONS_HT as FAQ_SECTIONS } from "../faq.ht";
export { START_COMMUNITY_HT as START_COMMUNITY } from "../startCommunity.ht";
export { DESIGN_PRINCIPLES_HT as DESIGN_PRINCIPLES } from "../design-principles.ht";
export { MEMBER_GUIDE_HT as MEMBER_GUIDE } from "../member-guide.ht";
export { OPSEC_GUIDE_HT as OPSEC_GUIDE } from "../opsec-guide.ht";
export { STUDY_PROMPTS_HT as STUDY_PROMPTS } from "../study-prompts.ht";
