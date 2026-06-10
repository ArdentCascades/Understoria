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
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import {
  listConversations,
  searchAllMessages,
  type ConversationSummary,
  type MessageSearchHit,
} from "@/db/messages";
import { formatRelativeTime } from "@/lib/format";
import { matchesQuery } from "@/lib/messageSearch";
import { EmptyState } from "@/components/EmptyState";
import { HighlightedText } from "@/components/HighlightedText";
import { MemberAvatar } from "@/components/MemberAvatar";
import { WhyTooltip } from "@/components/WhyTooltip";

interface SearchGroup {
  otherKey: string;
  hits: MessageSearchHit[];
}

// Phase 3.1: Messages is a routing shell — at lg+ it renders the
// conversation list + the selected conversation side-by-side via
// nested routing (the `/messages/:memberKey` child route renders
// inside `<Outlet />`). Below lg the shell collapses to single-pane:
// when on `/messages` the list shows; when on `/messages/:memberKey`
// the conversation takes the full screen — matching pre-3.1 behavior
// for small viewports.
//
// Read receipts, presence dots, typing indicators, and unread badges
// are deliberately absent — the no-read-receipts and
// privacy-precondition principles forbid the surveillance affordances
// that "modern chat" UIs accrete around split-pane layouts.

export default function MessagesShell() {
  const { currentMember, members, lockState, blockedKeys } = useApp();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searchGroups, setSearchGroups] = useState<SearchGroup[] | null>(null);

  // Which conversation (if any) is open in the right pane. Drives
  // both the aria-current marker on the list item and the
  // single-pane visibility toggle below lg.
  const conversationMatch = useMatch("/messages/:memberKey");
  const selectedKey = conversationMatch?.params.memberKey
    ? decodeURIComponent(conversationMatch.params.memberKey)
    : null;
  const hasConversation = selectedKey !== null;

  const nameByKey = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m.displayName])),
    [members],
  );

  useEffect(() => {
    if (!currentMember) return;
    // `blockedKeys` is in the deps so a new block (e.g., from the
    // Conversation header menu in PR #211) reactively drops the
    // blocked counterparty from the list without a page reload.
    // `listConversations` reads the same set internally — see
    // db/messages.ts §"PR F: filter blocked counterparties".
    void listConversations(currentMember.publicKey).then(setConversations);
  }, [currentMember, blockedKeys]);

  // Debounce the query so each keystroke doesn't run a full
  // decrypt-and-scan. 250 ms feels responsive without re-scanning
  // mid-word.
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), 250);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!currentMember) return;
    const trimmed = debounced.trim();
    if (trimmed === "") {
      setSearchGroups(null);
      return;
    }
    let cancelled = false;
    void searchAllMessages(currentMember.publicKey, trimmed).then((hits) => {
      if (cancelled) return;
      // Group hits by counterparty so the UI is "conversations
      // containing matches" rather than a flat hit list — that maps
      // onto how members think about messaging. Hits from blocked
      // counterparties drop out here at the render layer; the
      // `searchAllMessages` data-layer doesn't know about blocks, so
      // the gate is local to this page until / unless we lift it.
      const grouped = new Map<string, MessageSearchHit[]>();
      for (const h of hits) {
        if (blockedKeys.has(h.otherKey)) continue;
        const existing = grouped.get(h.otherKey);
        if (existing) existing.push(h);
        else grouped.set(h.otherKey, [h]);
      }
      // Also include conversations whose participant name matches
      // the query but whose messages don't (e.g. "I remember
      // talking to Maria but can't remember what about").
      for (const c of conversations) {
        const name = nameByKey.get(c.otherKey) ?? "";
        if (
          matchesQuery(name, trimmed) &&
          !grouped.has(c.otherKey) &&
          c.lastMessage.plaintext !== null
        ) {
          grouped.set(c.otherKey, []);
        }
      }
      setSearchGroups(
        Array.from(grouped.entries()).map(([otherKey, hs]) => ({
          otherKey,
          hits: hs,
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [currentMember, debounced, conversations, nameByKey, blockedKeys]);

  if (!currentMember) return null;

  const locked = lockState === "locked";
  const isSearching = debounced.trim() !== "";

  return (
    <div className="flex h-full flex-col lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
      <div
        className={`min-h-0 lg:h-full lg:overflow-y-auto lg:border-r lg:border-moss-200 lg:dark:border-moss-800 ${
          hasConversation ? "hidden lg:block" : ""
        }`}
      >
        <div className="px-4 pb-8 pt-4">
          <header className="mb-4">
            <h1 className="page-title">
              {t("messages.title")}
              <WhyTooltip principleId="no-read-receipts" />
            </h1>
          </header>

          {/* Sticky search within the list pane scroll context — at
              <lg the page scrolls; at lg+ the pane scrolls internally
              (lg:overflow-y-auto on the pane wrapper). Either way the
              input pins to the top so members can search from
              anywhere in a long conversation list. */}
          <div className="sticky top-0 z-10 -mx-4 mb-3 bg-white/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-moss-950/95 dark:supports-[backdrop-filter]:bg-moss-950/70">
            <label className="block">
              <span className="sr-only">{t("messages.search.placeholder")}</span>
              <input
                type="search"
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  locked
                    ? t("messages.search.locked")
                    : t("messages.search.placeholder")
                }
                disabled={locked}
              />
            </label>
          </div>

          {isSearching ? (
            <SearchResults
              groups={searchGroups}
              query={debounced}
              nameByKey={nameByKey}
              memberFallback={t("common.memberFallback")}
              noMatches={t("messages.search.noMatches")}
              selectedKey={selectedKey}
            />
          ) : conversations.length === 0 ? (
            <EmptyState
              illustration="hands"
              title={t("messages.emptyTitle")}
              message={t("messages.empty")}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-1">
              {conversations.map((c) => {
                const isSelected = c.otherKey === selectedKey;
                return (
                  <li key={c.otherKey}>
                    <Link
                      to={`/messages/${encodeURIComponent(c.otherKey)}`}
                      aria-current={isSelected ? "page" : undefined}
                      className={`card block transition-shadow hover:shadow-md ${
                        isSelected
                          ? "ring-2 ring-canopy-500 dark:ring-canopy-400"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <MemberAvatar publicKey={c.otherKey} size={48} framed />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              {nameByKey.get(c.otherKey) ?? t("common.memberFallback")}
                            </span>
                            <span className="text-xs text-moss-500">
                              {formatRelativeTime(c.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-1 text-sm text-moss-600 dark:text-moss-300">
                            {c.lastMessage.plaintext
                              ? c.lastMessage.plaintext.slice(0, 80)
                              : t("messages.decryptionFailed")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div
        className={`min-h-0 lg:h-full ${
          !hasConversation ? "hidden lg:block" : ""
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}

// Index route placeholder shown in the right pane at lg+ when no
// conversation is selected. Hidden at <lg because the list takes the
// whole viewport there (member hasn't picked a conversation yet).
export function MessagesEmptyPane() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full items-center justify-center px-4 py-8 text-center">
      <p className="text-sm text-moss-500 dark:text-moss-400">
        {t("messages.shell.emptyPane")}
      </p>
    </div>
  );
}

function SearchResults({
  groups,
  query,
  nameByKey,
  memberFallback,
  noMatches,
  selectedKey,
}: {
  groups: SearchGroup[] | null;
  query: string;
  nameByKey: Map<string, string>;
  memberFallback: string;
  noMatches: string;
  selectedKey: string | null;
}) {
  const { t } = useTranslation();
  if (groups === null) return null;
  if (groups.length === 0) {
    return (
      <p className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
        {noMatches}
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-1">
      {groups.map((g) => {
        const name = nameByKey.get(g.otherKey) ?? memberFallback;
        const first = g.hits[0];
        const isSelected = g.otherKey === selectedKey;
        return (
          <li key={g.otherKey}>
            <Link
              to={`/messages/${encodeURIComponent(g.otherKey)}?q=${encodeURIComponent(query)}`}
              aria-current={isSelected ? "page" : undefined}
              className={`card block transition-shadow hover:shadow-md ${
                isSelected ? "ring-2 ring-canopy-500 dark:ring-canopy-400" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <MemberAvatar publicKey={g.otherKey} size={48} framed />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      <HighlightedText text={name} query={query} />
                    </span>
                    {g.hits.length > 0 && (
                      <span className="text-xs text-moss-500">
                        {t("messages.search.matchCount", { count: g.hits.length })}
                      </span>
                    )}
                  </div>
                  {first && first.message.plaintext && (
                    <p className="mt-1 line-clamp-2 text-sm text-moss-600 dark:text-moss-300">
                      <HighlightedText
                        text={first.message.plaintext}
                        query={query}
                      />
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
