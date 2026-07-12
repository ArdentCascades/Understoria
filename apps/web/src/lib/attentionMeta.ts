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
import type { AttentionItem } from "./attention";

// Per-kind glyph used as a sighted-only at-a-glance cue on the
// attention rail. Rendered with aria-hidden so screen readers skip
// it; the row's title and hint carry the meaning standalone. Mirrors
// the established CATEGORY_META pattern in lib/categories.ts.
//
// TypeScript's Record<AttentionItem["kind"], string> makes this
// exhaustive at compile time — a new kind in the AttentionItem union
// cannot ship without an entry here.
export const ATTENTION_EMOJI: Record<AttentionItem["kind"], string> = {
  confirm_exchange: "✅", // ✅
  confirm_task: "✅", // ✅
  post_claimed: "\u{1F91D}", // 🤝
  vouch_received: "\u{1F331}", // 🌱
  project_deadline_approaching: "⏰", // ⏰
  project_paused_long: "\u{1F343}", // 🍃
  task_check_in: "\u{1F4CB}", // 📋
  coorganizer_invitation_received: "\u{1F33F}", // 🌿
  event_today: "\u{1F4C5}", // 📅
  event_cancelled: "\u{1F6AB}", // 🚫
  event_capacity_reached: "\u{1F465}", // 👥
  project_adoption_proposed: "\u{1F91D}", // 🤝
  grow_a_root: "\u{1F333}", // 🌳
};
