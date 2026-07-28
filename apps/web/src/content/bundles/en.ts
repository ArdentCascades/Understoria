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

// The English content bundle — eager (English is the fallback for
// every content surface). Every bundle module exports this exact
// shape; content/registry.ts types itself off this one.
export { PROJECT_TEMPLATES_EN as PROJECT_TEMPLATES } from "../projectTemplates.en";
export { TASK_STEPS_EN as TASK_STEPS } from "../taskSteps.en";
export { TASK_TIPS_EN as TASK_TIPS } from "../taskTips.en";
export { EVENT_TEMPLATES_EN as EVENT_TEMPLATES } from "../eventTemplates.en";
export { FAQ_SECTIONS } from "../faq";
export { START_COMMUNITY } from "../startCommunity";
