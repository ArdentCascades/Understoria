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
import type { FaqEntry, FaqSection } from "@/content/faq";

/**
 * The field guide's curated FAQ projection (paper-systems P5). The
 * guide is a PROJECTION of the FAQ — content stays in content/faq.ts
 * / faq.es.ts so the two can never drift; this module only names
 * which entries make the tabling one-pager, in reading order.
 *
 * The drift guard: a test resolves this list against BOTH locales
 * and fails on any miss — a renamed FAQ id must fail the build, not
 * print a hole in a stack of paper.
 */
export const GUIDE_ENTRY_IDS: readonly string[] = [
  "post-something",
  "claim-post",
  "confirm-exchange",
  "what-is-balance",
  "invite-someone",
  "internet-outage",
];

export interface GuideResolution {
  entries: FaqEntry[];
  /** Curated ids with no matching FAQ entry — must be empty. */
  missing: string[];
}

export function resolveGuideEntries(
  sections: readonly FaqSection[],
): GuideResolution {
  const byId = new Map<string, FaqEntry>();
  for (const section of sections) {
    for (const entry of section.entries) byId.set(entry.id, entry);
  }
  const entries: FaqEntry[] = [];
  const missing: string[] = [];
  for (const id of GUIDE_ENTRY_IDS) {
    const entry = byId.get(id);
    if (entry) entries.push(entry);
    else missing.push(id);
  }
  return { entries, missing };
}
