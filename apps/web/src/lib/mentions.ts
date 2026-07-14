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

// @-mentions in task comments — see docs/mentions.md for the design
// and the reasoning behind its unusual choices. The two rules
// everything in this module serves:
//
//   1. DERIVED, NOT DELIVERED. There is no notification row, no unread
//      count, no delivery bookkeeping anywhere. "Someone asked for me"
//      is a pure function of data that already exists (comments + my
//      key + task/project status + my blocks), recomputed live on the
//      surfaces the member already visits. The predicates in
//      `askedOfYou` are the entire lifecycle: when they stop matching,
//      the raised hand lowers itself.
//
//   2. LOCAL ONLY. Autocomplete matches against the device's own
//      members table and nothing else; extraction and the asked-of-you
//      query run entirely on-device. No server ever parses a comment
//      body, indexes a mention, or answers a people-search query.
//
// The token itself — `@[Name](mention:KEY)` — lives INSIDE the
// already-signed comment body (grammar in lib/markdown.ts), so the
// wire format, canonical payload, and server schema are untouched.

import { parseMarkdown, type MdBlock, type MdInline } from "@/lib/markdown";
import type { Project, ProjectTask, TaskComment } from "@/types";

/** One member as the mention machinery sees them: key = identity,
 *  name = current display name (render-time concern only). */
export interface MentionMember {
  key: string;
  name: string;
}

/**
 * Build the wire token for one mention. The label is the display name
 * AT COMPOSE TIME — it rides in the signed body as the permanent
 * fallback rendering for any viewer who can't resolve the key (peer
 * communities, older builds). Renderers that CAN resolve always
 * prefer the key's current name over this label (docs/mentions.md
 * §4: resolver-name-wins is the anti-impersonation rule), so the
 * label going stale after a rename is cosmetic, never load-bearing.
 * Characters that would terminate the bracket grammar are stripped
 * from the label rather than escaped — names are prose, not markup.
 */
export function mentionToken(name: string, key: string): string {
  const label =
    name.replace(/[[\]()\\]/g, "").replace(/\s+/g, " ").trim() || "member";
  return `@[${label}](mention:${key})`;
}

/**
 * Every member key mentioned in a body, deduped, in first-appearance
 * order. Walks the SAME AST the renderer uses rather than regexing
 * the raw string, so the extraction semantics exactly match what a
 * reader sees: a token inside a code span or fenced block is code on
 * screen, so it is not a mention here either.
 */
export function extractMentionKeys(body: string): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();

  const walkInline = (nodes: MdInline[]): void => {
    for (const node of nodes) {
      switch (node.type) {
        case "mention":
          if (!seen.has(node.key)) {
            seen.add(node.key);
            keys.push(node.key);
          }
          break;
        case "strong":
        case "em":
        case "del":
        case "link":
          walkInline(node.children);
          break;
        default:
          break;
      }
    }
  };

  const walkBlock = (block: MdBlock): void => {
    switch (block.type) {
      case "paragraph":
      case "heading":
        walkInline(block.children);
        break;
      case "blockquote":
        block.children.forEach(walkBlock);
        break;
      case "list":
        for (const item of block.items) {
          walkInline(item.content);
          item.children.forEach(walkBlock);
        }
        break;
      case "table":
        block.header.forEach(walkInline);
        block.rows.forEach((row) => row.forEach(walkInline));
        break;
      default:
        // codeBlock / hr: verbatim or empty — never mentions.
        break;
    }
  };

  parseMarkdown(body).forEach(walkBlock);
  return keys;
}

/** The in-progress "@quer" the member is typing at the caret, if any. */
export interface ActiveMentionQuery {
  /** Index of the `@` in the text. */
  start: number;
  /** Everything between the `@` and the caret. */
  query: string;
}

// An autocomplete query may span a couple of words ("Rosa D") but a
// bracket, paren, newline, or another `@` means the member is past
// the name (or inside an already-inserted token) — stop offering.
const QUERY_BREAK_RE = /[[\]()\n@]/;
const MAX_QUERY_LENGTH = 40;

/**
 * Detect whether the caret sits inside an in-progress mention query
 * (`@ros|`). Returns the query and the `@` position, or null when the
 * member is just typing prose. The `@` must sit at the start of the
 * text or after whitespace/`(` — `email@example.org` never triggers.
 */
export function activeMentionQuery(
  text: string,
  caret: number,
): ActiveMentionQuery | null {
  const upto = text.slice(0, caret);
  const at = upto.lastIndexOf("@");
  if (at === -1) return null;
  const before = at === 0 ? undefined : upto[at - 1];
  if (before !== undefined && !/[\s(]/.test(before)) return null;
  const query = upto.slice(at + 1);
  if (query.length > MAX_QUERY_LENGTH) return null;
  if (QUERY_BREAK_RE.test(query)) return null;
  return { start: at, query };
}

/**
 * Replace the active `@query` with the chosen member's token (plus a
 * trailing space so typing continues naturally). Returns the new text
 * and where the caret belongs.
 */
export function insertMention(
  text: string,
  active: ActiveMentionQuery,
  caret: number,
  member: MentionMember,
): { text: string; caret: number } {
  const token = `${mentionToken(member.name, member.key)} `;
  return {
    text: text.slice(0, active.start) + token + text.slice(caret),
    caret: active.start + token.length,
  };
}

/** Suggestion cap: a taller list is a directory, not an autocomplete. */
const MAX_SUGGESTIONS = 5;

/**
 * Rank members against the typed query: name-prefix matches first,
 * then substring matches, both in the pool's given order. `excludeKey`
 * drops the composer themself — mentioning yourself is legal to TYPE
 * (the grammar allows it; askedOfYou ignores it) but never suggested.
 */
export function matchMembers(
  query: string,
  members: readonly MentionMember[],
  excludeKey?: string,
): MentionMember[] {
  const pool = members.filter((m) => m.key !== excludeKey);
  const q = query.trim().toLowerCase();
  if (q === "") return pool.slice(0, MAX_SUGGESTIONS);
  const starts: MentionMember[] = [];
  const contains: MentionMember[] = [];
  for (const m of pool) {
    const name = m.name.toLowerCase();
    if (name.startsWith(q)) starts.push(m);
    else if (name.includes(q)) contains.push(m);
  }
  return [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
}

/** One raised hand: the asking comment plus its task and project. */
export interface AskedOfYouItem {
  comment: TaskComment;
  task: ProjectTask;
  project: Project;
}

/**
 * The "Asked of you" list — the whole mention lifecycle in one pure
 * function. A comment is a raised hand for the viewer while ALL of
 * these hold; the moment any stops holding, the item disappears with
 * no unread-state to clean up (docs/mentions.md §3):
 *
 *   - the comment is live (not tombstoned) and mentions the viewer;
 *   - someone ELSE wrote it (self-mentions are notes, not asks);
 *   - the author isn't blocked by the viewer (docs/blocking.md §6 —
 *     the thread view already hides these rows; the derived list must
 *     never resurrect what the blocker chose not to see);
 *   - the task still wants attention (any status but completed) on a
 *     project that's still breathing (not archived, not completed);
 *   - the viewer hasn't commented on that task SINCE the ask — a
 *     reply lowers the hand. Deliberately task-scoped, not
 *     thread-scoped: any later comment of yours on the task counts
 *     as having shown up.
 *
 * Newest ask first. Called from a live query over plain local tables;
 * comment volume in a real community is small, so a full scan is fine
 * — and keeping this a scan (not an index) preserves the property
 * that mention state lives NOWHERE except the comments themselves.
 */
export function askedOfYou(args: {
  myKey: string;
  comments: readonly TaskComment[];
  tasks: readonly ProjectTask[];
  projects: readonly Project[];
  blockedKeys: ReadonlySet<string>;
}): AskedOfYouItem[] {
  const { myKey, comments, tasks, projects, blockedKeys } = args;

  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const projectById = new Map(projects.map((p) => [p.id, p]));

  // Latest live comment of MINE per task — the "I showed up" marker.
  const myLatestByTask = new Map<string, number>();
  for (const c of comments) {
    if (c.authorKey !== myKey || c.deletedAt !== null) continue;
    const prev = myLatestByTask.get(c.taskId);
    if (prev === undefined || c.createdAt > prev) {
      myLatestByTask.set(c.taskId, c.createdAt);
    }
  }

  const items: AskedOfYouItem[] = [];
  for (const comment of comments) {
    if (comment.deletedAt !== null) continue;
    if (comment.authorKey === myKey) continue;
    if (blockedKeys.has(comment.authorKey)) continue;

    const task = taskById.get(comment.taskId);
    if (!task || task.status === "completed") continue;
    const project = projectById.get(task.projectId);
    if (!project || project.status === "archived") continue;
    if (project.status === "completed") continue;

    const myLatest = myLatestByTask.get(comment.taskId);
    if (myLatest !== undefined && myLatest > comment.createdAt) continue;

    if (!extractMentionKeys(comment.body).includes(myKey)) continue;

    items.push({ comment, task, project });
  }

  items.sort((a, b) => b.comment.createdAt - a.comment.createdAt);
  return items;
}
