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
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import {
  MAX_COMMENT_LENGTH,
  deleteTaskComment,
  flagTaskComment,
  listTaskComments,
  postTaskComment,
} from "@/db/taskComments";
import { useApp } from "@/state/AppContext";
import { humanizeError } from "@/lib/humanizeError";
import { formatRelativeTime } from "@/lib/format";
import {
  activeMentionQuery,
  extractMentionKeys,
  insertMention,
  matchMembers,
  type MentionMember,
} from "@/lib/mentions";
import {
  Markdown,
  MentionResolverContext,
  type MentionResolver,
} from "@/components/Markdown";
import { MarkdownHint } from "@/components/MarkdownHint";

// Density cap: once a thread has more than this many comments,
// the older ones collapse behind a "Show older (N)" toggle so a
// long-running task can't push later content off-screen. Newest
// comments stay inline (listTaskComments returns oldest→newest,
// so we slice from the tail).
const MAX_VISIBLE_COMMENTS = 3;

// Per-task comment thread. Collapsed by default so a project with
// many tasks doesn't sprawl. The toggle shows the comment count;
// expanded view shows the thread (oldest → newest) plus a composer.
//
// Permission model:
//   - Anyone with an unlocked session can post a comment.
//   - Only the author can soft-delete their own comment; tombstones
//     render as "(comment deleted)" so federated peers converge.
//   - The toggle is always visible — even with zero comments,
//     someone may want to start the thread.

interface TaskCommentsProps {
  projectId: string;
  taskId: string;
  currentKey: string | undefined;
  /** Map from publicKey → displayName for rendering author names. */
  memberMap: Map<string, string>;
  nodeId: string;
  /** Comment ids currently carrying an open dispute proposal. Used
   *  to render the "Flagged" chip and hide the Flag button (one flag
   *  is sufficient — the community-visible dispute aggregates the
   *  signal). Pass an empty set if flag state isn't loaded yet. */
  flaggedCommentIds: ReadonlySet<string>;
}

export function TaskComments({
  projectId,
  taskId,
  currentKey,
  memberMap,
  nodeId,
  flaggedCommentIds,
}: TaskCommentsProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mention autocomplete state. `caret` tracks the textarea's cursor
  // (updated on change AND selection moves) so the "@quer" detection
  // follows the member around the text; `suggestionIdx` is the
  // keyboard-highlighted row; `dismissedQuery` remembers an Escape so
  // the list doesn't pop straight back for the same half-typed name.
  const [caret, setCaret] = useState(0);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [dismissedQuery, setDismissedQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const allComments = useLiveQuery(
    () => listTaskComments(projectId, taskId),
    [projectId, taskId],
    [],
  );
  // PR F: TaskComments is an (a) hide-from-blocker row per
  // docs/blocking.md §6 — filter rows authored by a blocked member
  // from the blocker's view. The blocked party can STILL POST
  // comments (we don't gate the action — project authority governs
  // the comment surface, not the blocker); the asymmetry is
  // deliberate per §6.2.
  const { blockedKeys } = useApp();
  const comments = useMemo(() => {
    if (blockedKeys.size === 0) return allComments;
    return allComments.filter((c) => !blockedKeys.has(c.authorKey));
  }, [allComments, blockedKeys]);

  // The autocomplete pool: the local members table (as the memberMap
  // the parent already resolves names from), NEVER anything fetched.
  // This is the mention design's privacy floor — suggestions can only
  // surface people the member can already see on the Members page
  // (docs/mentions.md §2 D4). Self is excluded from suggestions; a
  // hand raised at yourself isn't an ask.
  const mentionMembers = useMemo<MentionMember[]>(
    () => Array.from(memberMap, ([key, name]) => ({ key, name })),
    [memberMap],
  );
  const active = activeMentionQuery(body, caret);
  const suggestions = useMemo(
    () =>
      active && active.query !== dismissedQuery
        ? matchMembers(active.query, mentionMembers, currentKey)
        : [],
    [active, dismissedQuery, mentionMembers, currentKey],
  );

  // Who the draft currently mentions — drives the compose-time honesty
  // line ("Rosa will see this next time she opens Understoria"), which
  // is what sets the social contract for a mention with no push behind
  // it: a raised hand, not a tap on the shoulder.
  const mentionedNames = useMemo(
    () =>
      extractMentionKeys(body)
        .filter((k) => k !== currentKey)
        .map((k) => memberMap.get(k))
        .filter((n): n is string => n !== undefined),
    [body, currentKey, memberMap],
  );

  // Resolver for rendering mention chips inside comment bodies: the
  // key's CURRENT display name (label in the token is only the
  // fallback for keys we can't resolve — resolver-name-wins is the
  // anti-impersonation rule, docs/mentions.md §4).
  const mentionResolver = useMemo<MentionResolver>(
    () => ({
      resolveName: (key: string) => memberMap.get(key),
      currentMemberKey: currentKey,
    }),
    [memberMap, currentKey],
  );

  const pickSuggestion = useCallback(
    (member: MentionMember) => {
      if (!active) return;
      const next = insertMention(body, active, caret, member);
      setBody(next.text);
      setCaret(next.caret);
      setSuggestionIdx(0);
      setDismissedQuery(null);
      // Return focus to the textarea with the caret after the token so
      // typing flows on. rAF: the value must commit before we can seat
      // the selection.
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(next.caret, next.caret);
        }
      });
    },
    [active, body, caret],
  );

  const handleComposerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (suggestions.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIdx((i) => (i + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pickSuggestion(suggestions[Math.min(suggestionIdx, suggestions.length - 1)]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setDismissedQuery(active?.query ?? null);
      }
    },
    [suggestions, suggestionIdx, pickSuggestion, active],
  );

  const count = comments.length;
  const hiddenCount = Math.max(0, comments.length - MAX_VISIBLE_COMMENTS);
  // listTaskComments returns oldest → newest, so the newest live at
  // the tail. When collapsed, slice from hiddenCount to end keeps
  // the newest MAX_VISIBLE_COMMENTS visible.
  const visibleComments = showAll ? comments : comments.slice(hiddenCount);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentKey || !body.trim() || submitting) return;
      setError(null);
      setSubmitting(true);
      try {
        await postTaskComment(taskId, body, currentKey, nodeId);
        setBody("");
        setCaret(0);
      } catch (err) {
        setError(humanizeError(err));
      } finally {
        setSubmitting(false);
      }
    },
    [body, currentKey, nodeId, submitting, taskId],
  );

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!currentKey) return;
      if (!window.confirm(t("projects.task.comments.deleteConfirm"))) return;
      try {
        await deleteTaskComment(commentId, currentKey);
      } catch (err) {
        setError(humanizeError(err));
      }
    },
    [currentKey, t],
  );

  const handleFlag = useCallback(
    async (commentId: string) => {
      if (!currentKey) return;
      // window.prompt is the lightest dialog that lets the flagger
      // optionally include a reason. Empty string / cancel → no
      // reason, still flags. The dispute surface shows the reason
      // when present.
      const reason = window.prompt(t("projects.task.comments.flagPrompt"));
      // null = user cancelled; empty string = user submitted no reason.
      if (reason === null) return;
      try {
        await flagTaskComment(commentId, currentKey, reason, nodeId);
      } catch (err) {
        setError(humanizeError(err));
      }
    },
    [currentKey, nodeId, t],
  );

  return (
    <div className="border-t border-bark-200/60 pt-stack-sm dark:border-moss-800">
      <button
        type="button"
        className="text-xs font-medium text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded
          ? t("projects.task.comments.hide")
          : count === 0
            ? t("projects.task.comments.startThread")
            : t(
                count === 1
                  ? "projects.task.comments.showOne"
                  : "projects.task.comments.showOther",
                { count },
              )}
      </button>
      {expanded && (
        <MentionResolverContext.Provider value={mentionResolver}>
        <div className="mt-stack-sm space-y-stack-sm">
          {count === 0 && (
            <p className="text-xs italic text-moss-600 dark:text-moss-300">
              {t("projects.task.comments.empty")}
            </p>
          )}
          {hiddenCount > 0 && (
            <button
              type="button"
              className="self-start text-xs font-medium text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll
                ? t("projects.task.comments.showFewer")
                : t(
                    hiddenCount === 1
                      ? "projects.task.comments.showOlderOne"
                      : "projects.task.comments.showOlderOther",
                    { count: hiddenCount },
                  )}
            </button>
          )}
          {visibleComments.map((c) => {
            const isAuthor = currentKey === c.authorKey;
            const isDeleted = c.deletedAt !== null;
            const isFlagged = flaggedCommentIds.has(c.id);
            return (
              <article
                key={c.id}
                className="rounded-xl border border-bark-200/60 bg-bark-50 p-stack-sm dark:border-moss-800 dark:bg-moss-900/40"
              >
                <p className="mb-1 flex flex-wrap items-center gap-2 text-xs text-moss-600 dark:text-moss-300">
                  <span>
                    {t("projects.task.comments.postedBy", {
                      name:
                        memberMap.get(c.authorKey) ??
                        t("common.memberFallback"),
                      when: formatRelativeTime(c.createdAt),
                    })}
                  </span>
                  {isFlagged && (
                    <span className="chip bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100">
                      {t("projects.task.comments.flaggedChip")}
                    </span>
                  )}
                </p>
                {isDeleted ? (
                  <p className="text-sm italic text-moss-600 dark:text-moss-300">
                    {t("projects.task.comments.tombstone")}
                  </p>
                ) : (
                  <Markdown
                    text={c.body}
                    className="text-sm text-bark-800 dark:text-moss-100"
                  />
                )}
                <div className="mt-1 flex flex-wrap gap-3">
                  {isAuthor && !isDeleted && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
                    >
                      {t("projects.task.comments.delete")}
                    </button>
                  )}
                  {!isAuthor && !isDeleted && !isFlagged && currentKey && (
                    <button
                      type="button"
                      onClick={() => handleFlag(c.id)}
                      className="text-xs text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
                    >
                      {t("projects.task.comments.flag")}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {currentKey && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <label htmlFor={`comment-${taskId}`} className="sr-only">
                {t("projects.task.comments.composerLabel")}
              </label>
              <textarea
                id={`comment-${taskId}`}
                ref={textareaRef}
                className="input min-h-16"
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setCaret(e.target.selectionStart ?? e.target.value.length);
                  setSuggestionIdx(0);
                  setDismissedQuery(null);
                }}
                onSelect={(e) =>
                  setCaret(e.currentTarget.selectionStart ?? 0)
                }
                onKeyDown={handleComposerKeyDown}
                maxLength={MAX_COMMENT_LENGTH}
                placeholder={t("projects.task.comments.placeholder")}
                aria-autocomplete="list"
                aria-controls={`mention-listbox-${taskId}`}
              />
              {suggestions.length > 0 && (
                <ul
                  id={`mention-listbox-${taskId}`}
                  role="listbox"
                  aria-label={t("mentions.suggestionsLabel")}
                  className="overflow-hidden rounded-xl border border-bark-200/60 bg-white text-sm shadow-sm dark:border-moss-800 dark:bg-moss-900"
                >
                  {suggestions.map((m, idx) => (
                    <li
                      key={m.key}
                      role="option"
                      aria-selected={idx === suggestionIdx}
                    >
                      <button
                        type="button"
                        className={`block w-full px-3 py-1.5 text-left ${
                          idx === suggestionIdx
                            ? "bg-canopy-50 text-canopy-900 dark:bg-canopy-950/60 dark:text-canopy-100"
                            : "hover:bg-moss-50 dark:hover:bg-moss-800"
                        }`}
                        // onMouseDown (not onClick) so the pick lands
                        // before the textarea's blur re-renders the list.
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pickSuggestion(m);
                        }}
                        onMouseEnter={() => setSuggestionIdx(idx)}
                      >
                        @{m.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {mentionedNames.length > 0 && (
                // The social contract for a mention with no push behind
                // it, stated at the moment of writing: they'll see it
                // when they next show up, nothing buzzes them.
                <p className="text-xs text-moss-600 dark:text-moss-300">
                  {mentionedNames.length === 1
                    ? t("mentions.willSeeOne", { name: mentionedNames[0] })
                    : t("mentions.willSeeMany")}
                </p>
              )}
              <MarkdownHint />
              {error && (
                <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="btn-secondary self-end"
                disabled={submitting || !body.trim()}
                aria-busy={submitting}
              >
                {submitting
                  ? t("projects.task.comments.submitting")
                  : t("projects.task.comments.submit")}
              </button>
            </form>
          )}
        </div>
        </MentionResolverContext.Provider>
      )}
    </div>
  );
}
