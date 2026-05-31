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

// The Board's three top-level tabs. Encoded in the URL via the
// `?tab=` query param so back-buttons can deep-link to a specific
// tab (e.g. `/?tab=projects`), browser back/forward works across
// tab switches, and the active tab is shareable.
export type BoardTab = "NEED" | "OFFER" | "PROJECTS";

const TAB_PARAM_TO_TAB: Record<string, BoardTab> = {
  needs: "NEED",
  offers: "OFFER",
  projects: "PROJECTS",
};

const TAB_TO_PARAM: Record<BoardTab, string> = {
  NEED: "needs",
  OFFER: "offers",
  PROJECTS: "projects",
};

/** Parses a `?tab=` URL search param. Returns the matching board
 *  tab, or "PROJECTS" for any null / undefined / unknown value —
 *  Projects is the Board's default landing tab because a community
 *  project may already address a member's need, so we want members
 *  to scan projects before posting a one-off Need. */
export function parseTabParam(value: string | null | undefined): BoardTab {
  if (!value) return "PROJECTS";
  return TAB_PARAM_TO_TAB[value.toLowerCase()] ?? "PROJECTS";
}

/** Serializes a board tab back into its `?tab=` URL param form. */
export function tabToParam(tab: BoardTab): string {
  return TAB_TO_PARAM[tab];
}
