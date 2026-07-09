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
import { matchesQuery } from "@/lib/messageSearch";
import type { Category, Post, Urgency } from "@/types";

/**
 * The Board's post-tab filter predicate, extracted so the printable
 * board sheet (docs/desktop-power-tools.md plan 5) renders EXACTLY
 * the list the member is looking at — the member's filters are the
 * print-selection mechanism, so the two surfaces must never drift.
 * Claimed-post hiding stays with each caller: the Board needs the
 * claimed-in-scope count for its toggle label, the print sheet just
 * includes or excludes.
 */
export interface BoardPostFilter {
  type: "NEED" | "OFFER";
  category: Category | "";
  urgency: Urgency | "";
  zone: string;
  query: string;
}

export function filterBoardPosts(posts: Post[], f: BoardPostFilter): Post[] {
  const q = f.query.trim();
  return posts.filter((p) => {
    if (p.type !== f.type) return false;
    if (p.status === "cancelled") return false;
    if (f.category && p.category !== f.category) return false;
    if (f.urgency && p.urgency !== f.urgency) return false;
    if (f.zone && p.locationZone !== f.zone) return false;
    if (q !== "" && !matchesQuery(`${p.title} ${p.description}`, q)) {
      return false;
    }
    return true;
  });
}
