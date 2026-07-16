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
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/state/AppContext";
import {
  getConversation,
  sendMessage,
  sendReaction,
  type DecryptedMessage,
} from "@/db/messages";
import { isBlocked } from "@/db/blocks";
import { pullFederatedMessages } from "@/lib/federationSync";
import { SYNC_KICK_EVENT } from "@/lib/syncLoop";
import { formatRelativeTime } from "@/lib/format";
import { matchesQuery } from "@/lib/messageSearch";
import { BackLink } from "@/components/BackLink";
import { HighlightedText } from "@/components/HighlightedText";
import { MemberAvatar } from "@/components/MemberAvatar";
import { WhyTooltip } from "@/components/WhyTooltip";
import { BlockConfirmCard } from "@/components/BlockConfirmCard";
import { UnblockConfirmDialog } from "@/components/UnblockConfirmDialog";
import { OverflowMenu } from "@/components/OverflowMenu";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

/** Chat-mode poll cadence — how stale an OPEN thread may go without
 *  a server nudge. Exported for the polling tests. */
export const CHAT_POLL_MS = 2_500;

/** The reaction palette. Deliberately small — a shared, legible
 *  vocabulary beats an open-ended emoji keyboard for 1:1 mutual-aid
 *  threads, and six 44px targets fit a phone-width bubble. */
export const REACTION_EMOJI = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

/** How long a press must hold before it reads as "react" rather than
 *  a scroll or an accidental tap. Exported for the reaction tests. */
export const LONG_PRESS_MS = 450;

/**
 * Route wrapper that REMOUNTS the conversation when `:memberKey`
 * changes. In the lg+ split pane, React Router reuses the same
 * component instance across a param change, so without a key the
 * composer text drafted for member A stayed addressed to member B
 * (a wrong-recipient send risk), the in-conversation search state
 * persisted, and A's decrypted messages briefly rendered under B's
 * header. Keying on the param resets all of that cleanly.
 */
export default function ConversationPage() {
  const { memberKey } = useParams<{ memberKey: string }>();
  return <ConversationView key={memberKey ?? ""} memberKey={memberKey} />;
}

function ConversationView({ memberKey }: { memberKey: string | undefined }) {
  const { currentMember, members, posts, lockState, blockedKeys } = useApp();
  const { t } = useTranslation();
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reduced = useReducedMotion();

  // Header "More actions" menu (block / unblock affordance). The
  // trigger/popover/a11y now live in the reusable <OverflowMenu>; this
  // page only owns the two confirm-dialog open flags.
  const [blockOpen, setBlockOpen] = useState(false);
  const [unblockOpen, setUnblockOpen] = useState(false);

  // Emoji reactions (docs/message-relay.md "Reactions"): which
  // message's picker is open, plus the long-press timer that opens
  // it on touch. A reaction is sent as a sealed v2 envelope over the
  // same E2E relay as a message — the server never sees the emoji.
  const [reactFor, setReactFor] = useState<string | null>(null);
  const pressTimer = useRef<number | null>(null);
  const cancelPress = useCallback(() => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);
  const startPress = useCallback(
    (id: string) => {
      cancelPress();
      pressTimer.current = window.setTimeout(() => {
        pressTimer.current = null;
        setReactFor(id);
      }, LONG_PRESS_MS);
    },
    [cancelPress],
  );
  useEffect(() => cancelPress, [cancelPress]);
  useEffect(() => {
    if (reactFor === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReactFor(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reactFor]);

  const otherKey = memberKey ? decodeURIComponent(memberKey) : "";
  const otherName =
    members.find((m) => m.publicKey === otherKey)?.displayName ??
    t("common.memberFallback");

  // Post-context arming — PostDetail's "Reach out" links here with
  // `?about=<postId>`. While armed, the NEXT message sent carries the
  // post reference inside its encrypted payload (see
  // lib/messageEnvelope.ts) so the other party's copy of the thread
  // shows which offer/need this conversation is about. The URL param
  // itself is the armed state: it survives a refresh, and stripping
  // it (after the first send, or via the dismiss X) disarms exactly
  // once — later messages in the session don't repeat the reference.
  const aboutPostId = searchParams.get("about");
  const aboutPost = aboutPostId
    ? posts.find((p) => p.id === aboutPostId) ?? null
    : null;
  const disarmAbout = useCallback(() => {
    // Functional update — handleSend may race the debounced `q` sync
    // below; reading prev inside the updater keeps both edits.
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("about");
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  // Titles for in-thread context chips: a conversation can reference
  // several posts over its lifetime, so look up every referenced id.
  const postTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of messages) {
      if (!m.aboutPostId) continue;
      const post = posts.find((p) => p.id === m.aboutPostId);
      if (post) map.set(m.aboutPostId, post.title);
    }
    return map;
  }, [messages, posts]);

  // Reactive blocked-state lookup so the menu item swaps between
  // "Block contact" and "Unblock <name>" the moment the underlying
  // table mutates. Mirrors the MemberDetail pattern.
  const blocked = useLiveQuery(
    async () =>
      currentMember && otherKey
        ? await isBlocked(currentMember.publicKey, otherKey)
        : false,
    [currentMember?.publicKey, otherKey],
    false,
  );

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

  // Tapping an emoji sends (or, on the same emoji, clears) the
  // reaction and refreshes the thread. Failures degrade silently to
  // "nothing happened" — the picker closes either way, and the chip
  // simply doesn't appear; same soft posture as message send retries.
  const handleReact = useCallback(
    async (m: DecryptedMessage, emoji: string) => {
      if (!currentMember) return;
      setReactFor(null);
      const mine = m.reactions?.find(
        (r) => r.senderKey === currentMember.publicKey,
      );
      const next = mine?.emoji === emoji ? "" : emoji;
      try {
        await sendReaction(currentMember.publicKey, otherKey, m.id, next);
        await loadMessages();
      } catch {
        // Locked session or blocked party — leave the thread as-is.
      }
    },
    [currentMember, otherKey, loadMessages],
  );

  // Chat-mode polling (docs/sync-liveness.md). An OPEN conversation
  // is the one place the 12s hot cadence feels broken — you're
  // staring at the thread waiting for the reply. While this page is
  // mounted and the tab visible, pull the messages feed every
  // CHAT_POLL_MS and refresh the local view; the pull is cursor-based
  // so an empty tick is one cheap authenticated GET. A server nudge
  // (SYNC_KICK_EVENT) runs the same tick immediately, so with a live
  // stream the reply lands in ~a second and the interval is just the
  // fallback. Hidden tab → ticks skip; leaving the page tears it all
  // down, restoring the normal cadence.
  useEffect(() => {
    if (!currentMember || !otherKey) return;
    let disposed = false;
    let inFlight = false;
    const tick = async () => {
      if (disposed || inFlight) return;
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      ) {
        return;
      }
      inFlight = true;
      try {
        await pullFederatedMessages();
        if (!disposed) await loadMessages();
      } finally {
        inFlight = false;
      }
    };
    const interval = window.setInterval(() => void tick(), CHAT_POLL_MS);
    // Coming back to a foregrounded tab (or a nudge from the server)
    // shouldn't wait out the interval remainder.
    const onWake = () => void tick();
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener(SYNC_KICK_EVENT, onWake);
    return () => {
      disposed = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener(SYNC_KICK_EVENT, onWake);
    };
  }, [currentMember, otherKey, loadMessages]);

  // Phase 3.1 — at lg+ the Messages shell renders this page in a
  // side-pane after the member clicks a list item, so move focus to
  // the message input to make typing the next natural action. At <lg
  // the same route loads as a full page and we explicitly do NOT
  // auto-focus, so the soft keyboard doesn't spring up before the
  // member has even seen the conversation. media-query gate is
  // cheaper than a context plumb-through and is the only thing that
  // varies between the two presentations.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 1024px)").matches) {
      inputRef.current?.focus();
    }
  }, [memberKey]);

  // Keep the URL ?q= in sync after a brief debounce so deep-links
  // from the search list page work and bookmarking is possible,
  // without burning history on every keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => {
      // Functional update so a debounce firing right after a send
      // can't resurrect the just-stripped `about` param from a stale
      // searchParams capture.
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (query.trim() === "") next.delete("q");
          else next.set("q", query);
          return next;
        },
        { replace: true },
      );
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
      bottomRef.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
      });
      return;
    }
    const id = matchIds[Math.min(activeMatchIdx, matchIds.length - 1)];
    const el = matchRefs.current.get(id);
    el?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "center",
    });
  }, [matchIds, activeMatchIdx, messages, reduced]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!currentMember || !text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(currentMember.publicKey, otherKey, text, {
        aboutPostId: aboutPostId ?? undefined,
      });
      setText("");
      // First message of the visit carried the post reference —
      // disarm so follow-up messages (and a refresh) don't repeat it.
      if (aboutPostId) disarmAbout();
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

  // PR F: if the counterparty is in the blocked set, render the
  // generic not-available copy in place of the conversation. No
  // block-specific phrasing per docs/blocking.md §6.1 generic-error
  // discipline; the message is byte-identical to the one any other
  // unavailable conversation would render.
  if (otherKey && blockedKeys.has(otherKey)) {
    return (
      <div className="flex h-full flex-col px-4 pb-4 pt-4">
        <header className="mb-4 flex items-center gap-2">
          <BackLink
            to="/messages"
            label={t("common.back")}
            className="btn-ghost -ml-2 text-sm"
          />
        </header>
        <p className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
          {t("errors.generic.notAvailable")}
        </p>
      </div>
    );
  }

  const locked = lockState === "locked";
  const isSearching = query.trim() !== "";
  const activeId =
    matchIds.length > 0
      ? matchIds[Math.min(activeMatchIdx, matchIds.length - 1)]
      : null;

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-4">
      <header className="mb-4 flex items-center gap-2">
        <BackLink
          to="/messages"
          label={t("common.back")}
          className="btn-ghost -ml-2 text-sm"
        />
        {otherKey && <MemberAvatar publicKey={otherKey} size={48} framed />}
        <h1 className="text-lg font-bold">
          {t("messages.conversationWith", { name: otherName })}
        </h1>
        {currentMember && otherKey && (
          <div className="ml-auto">
            <OverflowMenu
              label={t("messages.conversation.headerMenuLabel")}
              items={[
                {
                  key: "block",
                  tone: "destructive",
                  label: blocked
                    ? t("messages.conversation.headerMenuUnblock", {
                        name: otherName,
                      })
                    : t("messages.conversation.headerMenuBlock"),
                  onSelect: () => {
                    if (blocked) setUnblockOpen(true);
                    else setBlockOpen(true);
                  },
                },
              ]}
            />
          </div>
        )}
      </header>

      {currentMember && otherKey && (
        <>
          <BlockConfirmCard
            open={blockOpen}
            blockedKey={otherKey}
            blockedDisplayName={otherName}
            onClose={() => setBlockOpen(false)}
          />
          <UnblockConfirmDialog
            open={unblockOpen}
            blockedKey={otherKey}
            blockedDisplayName={otherName}
            onClose={() => setUnblockOpen(false)}
          />
        </>
      )}

      <div className="mb-2 flex items-center gap-2">
        <label className="flex-1">
          <span className="sr-only">
            {t("messages.search.inConversation")}
          </span>
          <input
            type="search"
            className="input w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locked
                ? t("messages.search.locked")
                : t("messages.search.inConversation")
            }
            disabled={locked}
          />
        </label>
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

      <p className="mb-2 text-xs text-moss-600 dark:text-moss-300">
        {t("messages.noReadReceipts")}
        <WhyTooltip principleId="no-read-receipts" />
      </p>

      <div className="flex-1 overflow-y-auto rounded-xl bg-moss-50 p-3 dark:bg-moss-950/30">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-moss-600 dark:text-moss-300">
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
                  // Long press (touch) opens the reaction picker; so
                  // does right-click / two-finger tap via contextmenu.
                  // pointercancel fires when the browser claims the
                  // gesture for scrolling, so a scroll never reacts.
                  onPointerDown={() => startPress(m.id)}
                  onPointerUp={cancelPress}
                  onPointerLeave={cancelPress}
                  onPointerCancel={cancelPress}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    cancelPress();
                    setReactFor(reactFor === m.id ? null : m.id);
                  }}
                  className={`group relative max-w-[80%] select-none rounded-xl px-3 py-2 text-sm ${baseTone}${ring}`}
                >
                  {/* Post-context chip: rendered on each message that
                      carried a reference (rather than one sticky
                      header) — a thread can touch several posts over
                      time, and per-message chips stay truthful about
                      WHERE the topic entered the conversation. Title
                      comes from the local post record; a post we
                      don't know locally (federation edge) gets the
                      generic label and PostDetail handles not-found. */}
                  {m.aboutPostId && (
                    <Link
                      to={`/post/${encodeURIComponent(m.aboutPostId)}`}
                      className="mb-1 block truncate rounded-lg bg-moss-900/5 px-2 py-1 text-xs font-medium underline-offset-2 hover:underline dark:bg-white/10"
                    >
                      {postTitleById.has(m.aboutPostId)
                        ? t("messages.conversation.aboutPost", {
                            title: postTitleById.get(m.aboutPostId),
                          })
                        : t("messages.conversation.aboutPostUnknown")}
                      {" →"}
                    </Link>
                  )}
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
                  {/* Keyboard/mouse path to the picker — the same
                      action long-press performs on touch. Invisible
                      until the bubble is hovered or the button is
                      focused, but always in the tab order. */}
                  <button
                    type="button"
                    aria-label={t("messages.reactions.open")}
                    aria-expanded={reactFor === m.id}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() =>
                      setReactFor(reactFor === m.id ? null : m.id)
                    }
                    className={`absolute -top-2 ${
                      isMine ? "-left-2" : "-right-2"
                    } rounded-full border border-moss-200 bg-white px-1.5 py-0.5 text-xs opacity-0 shadow-sm transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-canopy-400 group-hover:opacity-100 dark:border-moss-600 dark:bg-moss-700`}
                  >
                    🙂+
                  </button>
                  {/* Reaction chips — the CURRENT reaction of each
                      party (latest wins; clearing removes it). */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.reactions.map((r) => (
                        <span
                          key={r.senderKey}
                          aria-label={t("messages.reactions.reactedBy", {
                            name:
                              r.senderKey === currentMember.publicKey
                                ? t("messages.reactions.you")
                                : otherName,
                            emoji: r.emoji,
                          })}
                          className={`rounded-full px-2 py-0.5 text-sm ${
                            r.senderKey === currentMember.publicKey
                              ? "bg-canopy-200 dark:bg-canopy-800"
                              : "bg-moss-900/10 dark:bg-white/10"
                          }`}
                        >
                          {r.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* The picker: six 44px emoji, inline under the
                      bubble. Escape closes (window listener above);
                      picking sends, picking your current emoji
                      clears. */}
                  {reactFor === m.id && (
                    <div
                      role="menu"
                      aria-label={t("messages.reactions.pickerLabel")}
                      className="mt-1 flex flex-wrap gap-1"
                    >
                      {REACTION_EMOJI.map((emoji) => {
                        const isCurrent = m.reactions?.some(
                          (r) =>
                            r.senderKey === currentMember.publicKey &&
                            r.emoji === emoji,
                        );
                        return (
                          <button
                            key={emoji}
                            type="button"
                            role="menuitem"
                            aria-label={
                              isCurrent
                                ? t("messages.reactions.remove", { emoji })
                                : t("messages.reactions.reactWith", { emoji })
                            }
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => void handleReact(m, emoji)}
                            className={`min-h-[44px] min-w-[44px] rounded-full text-xl transition-colors hover:bg-moss-900/10 focus:outline-none focus:ring-2 focus:ring-canopy-400 dark:hover:bg-white/10 ${
                              isCurrent
                                ? "bg-canopy-200 dark:bg-canopy-800"
                                : ""
                            }`}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Pre-send hint while the ?about= param is armed: tells the
          member their next message will carry the post reference,
          with an X to detach it (they may have arrived from a post
          but want to talk about something else). */}
      {aboutPostId && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-canopy-50 pl-3 text-xs text-canopy-900 dark:bg-canopy-900/40 dark:text-canopy-100">
          <p className="min-w-0 flex-1 truncate py-2">
            {aboutPost
              ? t("messages.compose.aboutHint", { title: aboutPost.title })
              : t("messages.compose.aboutHintUnknown")}
          </p>
          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl hover:bg-canopy-100 dark:hover:bg-canopy-800/60"
            aria-label={t("messages.compose.aboutDismiss")}
            onClick={disarmAbout}
          >
            {"✕"}
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <label className="flex-1">
          <span className="sr-only">{t("messages.inputLabel")}</span>
          <textarea
            ref={inputRef}
            className="input w-full resize-none"
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
        </label>
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
