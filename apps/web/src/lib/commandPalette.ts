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
import { matchesQuery } from "./messageSearch";
import type { Event, Member, Post, Project, Proposal } from "@/types";

/**
 * Command palette (docs/desktop-power-tools.md plan 1, phase P1:
 * search + navigate). The pure half: build an index over the data
 * the device already holds and score it against a query. Everything
 * is local Dexie state — results are instant, private, and work
 * offline; nothing about a search is stored anywhere.
 *
 * Localization split: this module is pure and language-blind. The
 * component builds the route table and the kind labels with `t()`
 * and picks the right FAQ language, then passes them in — so the
 * index rebuilds naturally when the language changes, and the
 * tests here run against fixed strings.
 */

export type PaletteKind =
  | "route"
  | "post"
  | "project"
  | "event"
  | "member"
  | "proposal"
  | "help";

export interface PaletteEntry {
  kind: PaletteKind;
  /** Unique within one index — namespaced by kind. */
  id: string;
  title: string;
  subtitle?: string;
  /** Router path the entry navigates to on selection. */
  to: string;
}

export interface PaletteLabels {
  postNeed: string;
  postOffer: string;
  project: string;
  event: string;
  member: string;
  proposal: string;
  help: string;
}

export interface PaletteIndexInput {
  /** Pre-localized navigation entries (kind "route"), in the order
   *  they should appear for an empty query. */
  routes: PaletteEntry[];
  posts: Post[];
  projects: Project[];
  events: Event[];
  members: Member[];
  proposals: Proposal[];
  /** The current language's FAQ, flattened to {id, question}. */
  help: { id: string; question: string }[];
  labels: PaletteLabels;
}

export function buildPaletteIndex(input: PaletteIndexInput): PaletteEntry[] {
  const entries: PaletteEntry[] = [...input.routes];
  for (const p of input.posts) {
    entries.push({
      kind: "post",
      id: `post:${p.id}`,
      title: p.title,
      subtitle: p.type === "NEED" ? input.labels.postNeed : input.labels.postOffer,
      to: `/post/${p.id}`,
    });
  }
  for (const pr of input.projects) {
    entries.push({
      kind: "project",
      id: `project:${pr.id}`,
      title: pr.title,
      subtitle: input.labels.project,
      to: `/project/${pr.id}`,
    });
  }
  for (const ev of input.events) {
    entries.push({
      kind: "event",
      id: `event:${ev.id}`,
      title: ev.title,
      subtitle: input.labels.event,
      // The nested path: opens as the docked panel at lg with the
      // calendar behind it, full-screen below.
      to: `/calendar/event/${ev.id}`,
    });
  }
  for (const m of input.members) {
    entries.push({
      kind: "member",
      id: `member:${m.publicKey}`,
      title: m.displayName,
      subtitle: input.labels.member,
      to: `/member/${encodeURIComponent(m.publicKey)}`,
    });
  }
  for (const pp of input.proposals) {
    entries.push({
      kind: "proposal",
      id: `proposal:${pp.id}`,
      title: pp.title,
      subtitle: input.labels.proposal,
      to: "/proposals",
    });
  }
  for (const h of input.help) {
    entries.push({
      kind: "help",
      id: `help:${h.id}`,
      title: h.question,
      subtitle: input.labels.help,
      to: `/help#${h.id}`,
    });
  }
  return entries;
}

export const PALETTE_RESULT_LIMIT = 12;

/**
 * Score one entry against a normalized query. 0 = no match.
 * Prefix beats word-boundary beats substring beats subtitle-only —
 * typing "chi" should put "Childcare Friday night" above a post
 * that merely mentions "child" mid-title, and both above entries
 * matched only through their kind label.
 */
function score(entry: PaletteEntry, q: string): number {
  const title = entry.title.toLowerCase();
  if (title.startsWith(q)) return 4;
  if (title.split(/\s+/).some((w) => w.startsWith(q))) return 3;
  if (matchesQuery(entry.title, q)) return 2;
  if (entry.subtitle && matchesQuery(entry.subtitle, q)) return 1;
  return 0;
}

/**
 * Search the index. An empty query is the palette's "just opened"
 * state: navigation only, in the order the route table gave —
 * a launcher, not a dump of every record. Ties keep index order,
 * which keeps routes (first into the index) ahead of records at
 * equal score.
 */
export function searchPalette(
  index: PaletteEntry[],
  query: string,
  limit: number = PALETTE_RESULT_LIMIT,
): PaletteEntry[] {
  const q = query.trim().toLowerCase();
  if (q === "") {
    return index.filter((e) => e.kind === "route").slice(0, limit);
  }
  const scored: { entry: PaletteEntry; s: number; i: number }[] = [];
  index.forEach((entry, i) => {
    const s = score(entry, q);
    if (s > 0) scored.push({ entry, s, i });
  });
  scored.sort((a, b) => b.s - a.s || a.i - b.i);
  return scored.slice(0, limit).map(({ entry }) => entry);
}
