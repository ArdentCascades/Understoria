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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import {
  getConversation,
  sendMessage,
  type DecryptedMessage,
} from "@/db/messages";
import { formatRelativeTime } from "@/lib/format";
import { matchesQuery } from "@/lib/messageSearch";
import { HighlightedText } from "@/components/HighlightedText";
import { WhyTooltip } from "@/components/WhyTooltip";

export default function ConversationPage() {
  const { memberKey } = useParams<{ memberKey: string }>();
  const { currentMember, members, lockState } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Search input value (kept separate from the URL `q` so the URL
  // only changes when the user pauses typing — debounced below).
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const otherKey = memberKey ? decodeURIComponent(memberKey) : "";
  const otherName =
    members.find((m) => m.publicKey === otherKey)?.displayName ??
    t("common.memberFallback");

  const loadMessages = useCallback(async () => {
    if (!currentMember || !otherKey) return;
    const msgs = await getConversation(
      currentMember.publicKey,
      otherKey,
    );
    setMessages(msgs);
  }, [currentMember, otherKey]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  // Keep the URL ?q= in sync after a brief debounce so deep-links
  // from the search list page work and bookmarking is possible,
  // without burning history on every keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (query.trim() === "") next.delete("q");
      else next.set("q", query);
      setSearchParams(next, { replace: true });
      setActiveMatchIdx(0);
    }, 250);
    return () => window.clearTimeout(id);
  }, [query]);

  // Auto-scroll behavior:
  //  - Searching: scroll to the active match, NOT the bottom (the
  //    bottom would defeat the search).
  //  - Not searching: scroll to the bottom on new messages, matching
  //    the pre-search behavior.
  const matchIds = useMemo(() => {
    const q = query.trim();
    if (q === "") return [];
    return messages
      .filter((m) => matchesQuery(m.plaintext, q))
      .map((m) => m.id);
  }, [messages, query]);

  useEffect(() => {
    if (matchIds.length === 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const id = matchIds[Math.min(activeMatchIdx, matchIds.length - 1)];
    const el = matchRefs.current.get(id);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [matchIds, activeMatchIdx, messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!currentMember || !text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(currentMember.publicKey, otherKey, text);
      setText("");
      await loadMessages();
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("locked")
          ? t("messages.lockedError")
          : t("messages.sendError"),
      );
    } finally {
      setSending(false);
    }
  }

  if (!currentMember) return null;

  const locked = lockState === "locked";
  const isSearching = query.trim() !== "";
  const activeId =
    matchIds.length > 0
      ? matchIds[Math.min(activeMatchIdx, matchIds.length - 1)]
      : null;

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-4">
      <header className="mb-4 flex items-center gap-2">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={() => navigate("/messages")}
        >
          {t("common.back")}
        </button>
        <h1 className="text-lg font-bold">
          {t("messages.conversationWith", { name: otherName })}
        </h1>
      </header>

      <div className="mb-2 flex items-center gap-2">
        <input
          type="search"
          className="input flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            locked
              ? t("messages.search.locked")
              : t("messages.search.inConversation")
          }
          disabled={locked}
        />
        {isSearching && (
          <>
            <span className="text-xs text-moss-600 dark:text-moss-300">
              {matchIds.length === 0
                ? t("messages.search.noMatchesShort")
                : t("messages.search.matchPosition", {
                    current: Math.min(activeMatchIdx + 1, matchIds.length),
                    total: matchIds.length,
                  })}
            </span>
            <button
              type="button"
              className="btn-ghost px-2 text-sm"
              onClick={() =>
                setActiveMatchIdx((i) =>
                  matchIds.length === 0
                    ? 0
                    : (i - 1 + matchIds.length) % matchIds.length,
                )
              }
              disabled={matchIds.length === 0}
              aria-label={t("messages.search.previous")}
            >
              {"▲"}
            </button>
            <button
              type="button"
              className="btn-ghost px-2 text-sm"
              onClick={() =>
                setActiveMatchIdx((i) =>
                  matchIds.length === 0 ? 0 : (i + 1) % matchIds.length,
                )
              }
              disabled={matchIds.length === 0}
              aria-label={t("messages.search.next")}
            >
              {"▼"}
            </button>
          </>
        )}
      </div>

      <p className="mb-2 text-xs text-moss-500 dark:text-moss-400">
        {t("messages.noReadReceipts")}
        <WhyTooltip principleId="no-read-receipts" />
      </p>

      <div className="flex-1 overflow-y-auto rounded-xl bg-moss-50 p-3 dark:bg-moss-950/30">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-moss-500">
            {t("messages.empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => {
              const isMine = m.senderKey === currentMember.publicKey;
              const isActiveMatch = m.id === activeId;
              const baseTone = isMine
                ? "self-end bg-canopy-100 text-canopy-900 dark:bg-canopy-900/40 dark:text-canopy-100"
                : "self-start bg-white text-moss-800 shadow-sm dark:bg-moss-800 dark:text-moss-100";
              const ring = isActiveMatch
                ? " ring-2 ring-amber-400 dark:ring-amber-300"
                : "";
              return (
                <div
                  key={m.id}
                  ref={(el) => {
                    if (el) matchRefs.current.set(m.id, el);
                    else matchRefs.current.delete(m.id);
                  }}
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${baseTone}${ring}`}
                >
                  <p className="whitespace-pre-wrap">
                    {m.plaintext === null ? (
                      t("messages.decryptionFailed")
                    ) : isSearching ? (
                      <HighlightedText text={m.plaintext} query={query} />
                    ) : (
                      m.plaintext
                    )}
                  </p>
                  <p className="mt-1 text-right text-xs opacity-60">
                    {formatRelativeTime(m.createdAt)}
                  </p>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <textarea
          className="input flex-1 resize-none"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("messages.inputPlaceholder")}
          maxLength={5000}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend(e);
            }
          }}
        />
        <button
          type="submit"
          className="btn-primary self-end"
          disabled={sending || !text.trim()}
          aria-busy={sending}
        >
          {sending ? t("messages.sending") : t("messages.send")}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-xs text-rose-700 dark:text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
