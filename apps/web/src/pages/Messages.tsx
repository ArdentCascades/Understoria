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
import { Link } from "react-router-dom";
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

interface SearchGroup {
  otherKey: string;
  hits: MessageSearchHit[];
}

export default function MessagesPage() {
  const { currentMember, members, lockState } = useApp();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searchGroups, setSearchGroups] = useState<SearchGroup[] | null>(null);

  const nameByKey = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m.displayName])),
    [members],
  );

  useEffect(() => {
    if (!currentMember) return;
    void listConversations(currentMember.publicKey).then(setConversations);
  }, [currentMember]);

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
      // onto how members think about messaging.
      const grouped = new Map<string, MessageSearchHit[]>();
      for (const h of hits) {
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
  }, [currentMember, debounced, conversations, nameByKey]);

  if (!currentMember) return null;

  const locked = lockState === "locked";
  const isSearching = debounced.trim() !== "";

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <h1 className="page-title">{t("messages.title")}</h1>
      </header>

      <label className="mb-3 block">
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

      {isSearching ? (
        <SearchResults
          groups={searchGroups}
          query={debounced}
          nameByKey={nameByKey}
          memberFallback={t("common.memberFallback")}
          noMatches={t("messages.search.noMatches")}
        />
      ) : conversations.length === 0 ? (
        <EmptyState
          illustration="hands"
          title={t("messages.emptyTitle")}
          message={t("messages.empty")}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {conversations.map((c) => (
            <li key={c.otherKey}>
              <Link
                to={`/messages/${encodeURIComponent(c.otherKey)}`}
                className="card block transition-shadow hover:shadow-md"
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
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchResults({
  groups,
  query,
  nameByKey,
  memberFallback,
  noMatches,
}: {
  groups: SearchGroup[] | null;
  query: string;
  nameByKey: Map<string, string>;
  memberFallback: string;
  noMatches: string;
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
    <ul className="flex flex-col gap-2">
      {groups.map((g) => {
        const name = nameByKey.get(g.otherKey) ?? memberFallback;
        const first = g.hits[0];
        return (
          <li key={g.otherKey}>
            <Link
              to={`/messages/${encodeURIComponent(g.otherKey)}?q=${encodeURIComponent(query)}`}
              className="card block transition-shadow hover:shadow-md"
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
