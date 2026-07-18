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
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/state/AppContext";
import {
  getConversation,
  sendMessage,
  sendReaction,
  sendVoiceMessage,
  type DecryptedMessage,
} from "@/db/messages";
import { VoicePlayer } from "@/components/VoicePlayer";
import { VoiceRecorder, type CapturedClip } from "@/components/VoiceRecorder";
import { isBlocked } from "@/db/blocks";
import { pullFederatedMessages } from "@/lib/federationSync";
import { SYNC_KICK_EVENT } from "@/lib/syncLoop";
import { formatRelativeTime } from "@/lib/format";
import { matchesQuery } from "@/lib/messageSearch";
import { isSpeechAvailable, speak, stopSpeaking } from "@/lib/speak";
import { BackLink } from "@/components/BackLink";
import { HighlightedText } from "@/components/HighlightedText";
import { MemberAvatar } from "@/components/MemberAvatar";
import { WhyTooltip } from "@/components/WhyTooltip";
import { BlockConfirmCard } from "@/components/BlockConfirmCard";
import { UnblockConfirmDialog } from "@/components/UnblockConfirmDialog";
import { OverflowMenu } from "@/components/OverflowMenu";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import {
  SHORT_LANDSCAPE_QUERY,
  SPLIT_CAPABLE_QUERY,
  useMediaQuery,
} from "@/lib/viewport";

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

/** Consecutive messages from the same sender within this window read
 *  as one burst: one timestamp for the group, Signal-style, instead
 *  of a time line under every bubble. Exported for tests. */
export const GROUP_WINDOW_MS = 10 * 60 * 1000;

/** "At the bottom" tolerance for follow-scroll — within this many
 *  pixels of the end still counts as reading the latest. Exported
 *  for the chip tests. */
export const NEAR_BOTTOM_PX = 120;

/** Composer auto-grow ceiling, read at the cap site on each input.
 *  ~6 lines (144px) normally; in the short-landscape regime
 *  (SHORT_LANDSCAPE_QUERY — phone sideways, viewport ~400px tall) a
 *  144px composer eats over a third of the screen, so the ceiling
 *  drops to ~4 lines (96px). A module-level imperative read — NOT a
 *  hook/effect — because the input handler runs on every keystroke
 *  anyway and this component's scroll machinery must stay untouched.
 *  Exported for the composer auto-grow tests. */
export function composerHeightCapPx(): number {
  const short =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(SHORT_LANDSCAPE_QUERY).matches;
  return short ? 96 : 144;
}

function isNearBottom(list: HTMLElement): boolean {
  return (
    list.scrollHeight - list.scrollTop - list.clientHeight < NEAR_BOTTOM_PX
  );
}

/** Vertical room the long-press menu wants below a bubble — the
 *  emoji row plus the action row (two 44px rows, gaps, padding).
 *  Only used to pick the menu's open DIRECTION; the menu itself
 *  still sizes to its content. Exported for the placement tests. */
export const MENU_ESTIMATE_PX = 176;

/**
 * Should the long-press menu open UPWARD (overlaying the thread
 * above the bubble) instead of flowing below it?
 *
 * On a landscape phone (~844×390) a bubble in the lower part of the
 * screen has no room below — the in-flow menu rendered entirely past
 * the bottom edge and the long-press looked like it did nothing
 * (round-3 persona blocker). Decided from real geometry at OPEN
 * time: the visible band is the intersection of the list box and the
 * window (the list container is not always the live scrollport —
 * page-level scrolling clips at the viewport instead), and the menu
 * flips up only when the room below is too small AND there is more
 * room above. Pure and layout-only: no scroll effect is read or
 * written here. Under jsdom every rect is 0 → always false, which
 * preserves the in-flow menu all existing tests exercise.
 */
export function menuOpensUpward(
  bubble: HTMLElement | null | undefined,
  list: HTMLElement | null,
): boolean {
  if (!bubble || !list || typeof window === "undefined") return false;
  const viewportH = window.innerHeight || 0;
  if (viewportH <= 0) return false;
  const b = bubble.getBoundingClientRect();
  const l = list.getBoundingClientRect();
  const visibleTop = Math.max(0, l.top);
  const visibleBottom = Math.min(viewportH, l.bottom);
  const spaceBelow = visibleBottom - b.bottom;
  const spaceAbove = b.top - visibleTop;
  return spaceBelow < MENU_ESTIMATE_PX && spaceAbove > spaceBelow;
}

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

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
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Search input value (kept separate from the URL `q` so the URL
  // only changes when the user pauses typing — debounced below).
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);
  // Search is TUCKED AWAY until asked for (the Signal pattern): the
  // always-visible box spent the best row of every conversation on a
  // rarely-used feature. A `?q=` deep link still opens pre-expanded.
  const [searchOpen, setSearchOpen] = useState(
    () => (searchParams.get("q") ?? "") !== "",
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);
  const listRef = useRef<HTMLDivElement>(null);
  const lastScrolledIdRef = useRef<string>("");
  const prevLenRef = useRef(0);
  // Messages that arrived while the reader was scrolled up — the
  // count on the "new messages ↓" chip. Cleared on reaching the
  // bottom (by chip tap or by scrolling there).
  const [unseen, setUnseen] = useState(0);
  const matchRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reduced = useReducedMotion();
  // Sideways-phone split (Messages.tsx renders the conversation list
  // in a pane beside this thread): the back-to-Messages link is
  // redundant there — the list it leads to is already on screen —
  // and header rows are precious at ~400px tall. Presentation-only:
  // the hook just re-renders on rotation; no scroll/poll machinery
  // is involved.
  const splitPane = useMediaQuery(SPLIT_CAPABLE_QUERY);

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
  // Open direction for the long-press menu, decided once per open
  // from the bubble's on-screen position (menuOpensUpward above).
  // Every open path goes through openMenuFor so the decision is
  // never stale geometry from a previous open.
  const [menuUp, setMenuUp] = useState(false);
  // Signal-style long-press menu extras: the emoji row grew Copy /
  // Speak / Info actions. `infoFor` toggles the per-message detail
  // block; `copiedId` flashes the in-menu "Copied ✓" confirmation
  // (no toast — feedback stays where the eyes are).
  const [infoFor, setInfoFor] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Which message the device is reading aloud right now — the Speak
  // item shows "Stop speaking" for it, so tapping Speak visibly DOES
  // something (and offers a way out). Cleared by speak()'s onDone
  // when the utterance ends or errors.
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  // …and whether that message's speech has AUDIBLY started (the
  // utterance's `start` event). Until it does, the menu item reads
  // "Starting…" instead of "Stop speaking" — during the up-to-2s
  // start watchdog (lib/speak.ts) claiming there is something to
  // stop would be a lie on a zero-voices device where nothing will
  // ever play. Keyed by message id so a stale utterance's start
  // can't light up a different message's item.
  const [speakStartedId, setSpeakStartedId] = useState<string | null>(null);
  // A Speak tap that produced no speech at all — some phones ship a
  // speech engine with zero voices: the utterance queues and then
  // NOTHING fires (lib/speak.ts's start watchdog catches it). The
  // failed message's item flips to the "can't read aloud" label for
  // the rest of the menu's lifetime, because a tap must visibly do
  // SOMETHING even when the device can't. In-menu, like "Copied ✓" —
  // feedback stays where the eyes are.
  const [speakFailedId, setSpeakFailedId] = useState<string | null>(null);
  const copyTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      // Leaving the conversation silences it — audio must never
      // outlive the screen it belongs to.
      stopSpeaking();
    },
    [],
  );
  // Closing the menu (however it closes) resets its sub-state so the
  // next open starts clean — and cuts any in-flight speech, since
  // the "Stop speaking" control disappears with the menu.
  useEffect(() => {
    if (reactFor === null) {
      setInfoFor(null);
      setCopiedId(null);
      setSpeakingId(null);
      setSpeakStartedId(null);
      setSpeakFailedId(null);
      stopSpeaking();
    }
  }, [reactFor]);
  const speakLang = i18n.language?.startsWith("es") ? "es" : "en";
  // Day-separator label: Today / Yesterday in the app's language,
  // otherwise a spelled-out date (with the year only when it isn't
  // this year's).
  const dayLabel = useCallback(
    (ts: number) => {
      const now = Date.now();
      if (isSameDay(ts, now)) return t("messages.day.today");
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (isSameDay(ts, yesterday.getTime())) {
        return t("messages.day.yesterday");
      }
      const d = new Date(ts);
      return new Intl.DateTimeFormat(i18n.language, {
        weekday: "long",
        month: "long",
        day: "numeric",
        ...(d.getFullYear() !== new Date(now).getFullYear()
          ? { year: "numeric" }
          : {}),
      }).format(d);
    },
    [t, i18n.language],
  );
  const handleCopy = useCallback(async (m: DecryptedMessage) => {
    if (m.plaintext === null || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(m.plaintext);
    } catch {
      return;
    }
    setCopiedId(m.id);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => {
      setCopiedId(null);
      setReactFor(null);
    }, 1200);
  }, []);
  // Speak toggles: idle → start reading and remember which message;
  // already reading this one → stop. State is set BEFORE speak() so
  // a synchronous synthesis failure (onDone fires inside the call)
  // still lands on "not speaking" — and, since that set-then-clear
  // batches into one paint, the failure flag is what makes the tap
  // visible at all in that case. The functional clear ignores a
  // stale utterance's onDone after the member moved on to another;
  // ok=false only ever means "this device never spoke it" (a
  // deliberate stop or replacement settles as ok=true), so the
  // failure label can't appear just because someone tapped Stop.
  const handleSpeak = useCallback(
    (m: DecryptedMessage) => {
      if (m.plaintext === null) return;
      if (speakingId === m.id) {
        stopSpeaking();
        setSpeakingId(null);
        setSpeakStartedId(null);
        return;
      }
      setSpeakingId(m.id);
      setSpeakStartedId(null);
      speak(
        m.plaintext,
        speakLang,
        (ok) => {
          setSpeakingId((cur) => (cur === m.id ? null : cur));
          setSpeakStartedId((cur) => (cur === m.id ? null : cur));
          if (!ok) setSpeakFailedId(m.id);
        },
        () => setSpeakStartedId(m.id),
      );
    },
    [speakingId, speakLang],
  );
  const pressTimer = useRef<number | null>(null);
  const cancelPress = useCallback(() => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);
  // The one gate every menu-open path goes through (long-press,
  // contextmenu, the 🙂+ button, your own reaction chip): measure
  // where the bubble sits RIGHT NOW and pick the open direction,
  // then open. matchRefs doubles as the bubble-element registry —
  // it already tracks every rendered bubble by message id.
  const openMenuFor = useCallback((id: string) => {
    setMenuUp(menuOpensUpward(matchRefs.current.get(id), listRef.current));
    setReactFor(id);
  }, []);
  const startPress = useCallback(
    (id: string) => {
      cancelPress();
      pressTimer.current = window.setTimeout(() => {
        pressTimer.current = null;
        openMenuFor(id);
      }, LONG_PRESS_MS);
    },
    [cancelPress, openMenuFor],
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

  // Scroll the LIST CONTAINER directly — never scrollIntoView. On
  // iOS, scrollIntoView may scroll every ancestor INCLUDING the page
  // itself, and with the on-screen keyboard open Safari answers by
  // panning the whole layout viewport (the app shell is one screen
  // tall by design — see Layout.tsx). Combined with the next guard's
  // old behavior this made the screen lurch while typing.
  const scrollListTo = useCallback(
    (top: number) => {
      const list = listRef.current;
      if (!list) return;
      if (typeof list.scrollTo === "function") {
        list.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
      } else {
        // jsdom has no Element.scrollTo.
        list.scrollTop = top;
      }
    },
    [reduced],
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (matchIds.length === 0) {
      // Key the bottom-scroll on the LAST MESSAGE, not on array
      // identity: the chat-mode poll rebuilds the array every 2.5 s
      // even when nothing changed, and re-scrolling on every tick is
      // what the member experienced as "unwanted scrolling" the
      // moment the composer had focus.
      const lastId = messages.length > 0 ? messages[messages.length - 1].id : "";
      if (lastId === lastScrolledIdRef.current) {
        prevLenRef.current = messages.length;
        return;
      }
      const firstLoad = lastScrolledIdRef.current === "";
      lastScrolledIdRef.current = lastId;
      const lastMsg = messages[messages.length - 1];
      const mine = lastMsg?.senderKey === currentMember?.publicKey;
      // Respect the reader's position (the Signal rule): only follow
      // a NEW message to the bottom when they're already there (or
      // it's their own send, or the thread just opened). Someone
      // reading older messages gets the "new messages ↓" chip
      // instead of being yanked down.
      if (firstLoad || mine || isNearBottom(list)) {
        scrollListTo(list.scrollHeight);
        setUnseen(0);
      } else {
        setUnseen(
          (c) => c + Math.max(1, messages.length - prevLenRef.current),
        );
      }
      prevLenRef.current = messages.length;
      return;
    }
    const id = matchIds[Math.min(activeMatchIdx, matchIds.length - 1)];
    const el = matchRefs.current.get(id);
    if (!el) return;
    // Center the match within the list (the old block:"center"),
    // computed against the container so only the container moves.
    const top =
      el.getBoundingClientRect().top -
      list.getBoundingClientRect().top +
      list.scrollTop -
      Math.max(0, (list.clientHeight - el.clientHeight) / 2);
    scrollListTo(top);
  }, [matchIds, activeMatchIdx, messages, scrollListTo, currentMember]);

  // Voice notes (docs/message-relay.md §10): the composer's mic
  // button swaps in the recorder; a captured clip sends as a sealed
  // v3 envelope — same error posture as a text send.
  const [recordingVoice, setRecordingVoice] = useState(false);
  const handleVoiceCapture = useCallback(
    async (clip: CapturedClip) => {
      if (!currentMember) return;
      setError(null);
      try {
        await sendVoiceMessage(currentMember.publicKey, otherKey, clip);
        setRecordingVoice(false);
        await loadMessages();
      } catch (err) {
        setError(
          err instanceof Error && err.message.includes("locked")
            ? t("messages.lockedError")
            : t("messages.sendError"),
        );
      }
    },
    [currentMember, otherKey, loadMessages, t],
  );

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
      // Collapse the auto-grown box back to one line.
      if (inputRef.current) inputRef.current.style.height = "auto";
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

  // PR F + honest-dialog round: if the counterparty is in the blocked
  // set, replace the conversation with an honest "you blocked them"
  // state. `blockedKeys` is derived ONLY from the current member's own
  // local block rows (blocks never federate — docs/blocking.md §7), so
  // this branch renders exclusively on the BLOCKER's own device; the
  // §6.1 generic-error discipline protects what the BLOCKED party sees
  // and is untouched by being honest with the blocker about their own
  // decision. No other unavailability cause routes here — this is the
  // only consumer of the blocked-conversation state on this page.
  if (otherKey && blockedKeys.has(otherKey)) {
    return (
      <div className="flex h-full flex-col px-4 pb-4 pt-4">
        <header className="mb-4 flex items-center gap-2">
          {!splitPane && (
            <BackLink
              to="/messages"
              label={t("common.back")}
              className="btn-ghost -ml-2 text-sm"
            />
          )}
        </header>
        <div className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
          <p>{t("messages.conversation.blockedNotice")}</p>
          <Link
            to="/settings"
            className="mt-2 inline-block font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("messages.conversation.blockedNoticeLink")}
          </Link>
        </div>
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
        {!splitPane && (
          <BackLink
            to="/messages"
            label={t("common.back")}
            className="btn-ghost -ml-2 text-sm"
          />
        )}
        {otherKey && <MemberAvatar publicKey={otherKey} size={48} framed />}
        <h1 className="text-lg font-bold">
          {t("messages.conversationWith", { name: otherName })}
        </h1>
        {currentMember && otherKey && (
          <div className="ml-auto flex items-center gap-1">
            {/* Search lives behind this toggle (the Signal pattern) —
                see the searchOpen state for why. */}
            <button
              type="button"
              className="btn-ghost flex min-h-[44px] min-w-[44px] items-center justify-center text-lg"
              aria-label={
                searchOpen
                  ? t("messages.search.close")
                  : t("messages.search.inConversation")
              }
              aria-expanded={searchOpen}
              onClick={() => {
                if (searchOpen) {
                  setSearchOpen(false);
                  setQuery("");
                  setActiveMatchIdx(0);
                } else {
                  setSearchOpen(true);
                }
              }}
            >
              <span aria-hidden="true">🔍</span>
            </button>
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

      {searchOpen && (
      <div className="mb-2 flex items-center gap-2">
        <label className="flex-1">
          <span className="sr-only">
            {t("messages.search.inConversation")}
          </span>
          <input
            ref={searchInputRef}
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
        <button
          type="button"
          className="btn-ghost px-2 text-sm"
          aria-label={t("messages.search.close")}
          onClick={() => {
            setSearchOpen(false);
            setQuery("");
            setActiveMatchIdx(0);
          }}
        >
          {"✕"}
        </button>
      </div>
      )}

      <p className="mb-2 text-xs text-moss-600 dark:text-moss-300">
        {t("messages.noReadReceipts")}
        <WhyTooltip principleId="no-read-receipts" />
      </p>

      <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        onScroll={() => {
          const list = listRef.current;
          if (list && unseen > 0 && isNearBottom(list)) setUnseen(0);
        }}
        className="flex-1 overflow-y-auto rounded-xl bg-moss-50 p-3 dark:bg-moss-950/30"
      >
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-moss-600 dark:text-moss-300">
            {t("messages.empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m, i) => {
              const isMine = m.senderKey === currentMember.publicKey;
              const isActiveMatch = m.id === activeId;
              // Signal-style thread shape: a day chip where the
              // calendar day changes, and ONE timestamp per burst of
              // consecutive same-sender messages (GROUP_WINDOW_MS)
              // instead of a time line under every bubble.
              const prev = i > 0 ? messages[i - 1] : null;
              const next =
                i < messages.length - 1 ? messages[i + 1] : null;
              const startsDay =
                prev === null || !isSameDay(prev.createdAt, m.createdAt);
              const endsGroup =
                next === null ||
                next.senderKey !== m.senderKey ||
                !isSameDay(next.createdAt, m.createdAt) ||
                next.createdAt - m.createdAt > GROUP_WINDOW_MS;
              const baseTone = isMine
                ? "self-end bg-canopy-100 text-canopy-900 dark:bg-canopy-900/40 dark:text-canopy-100"
                : "self-start bg-white text-moss-800 shadow-sm dark:bg-moss-800 dark:text-moss-100";
              const ring = isActiveMatch
                ? " ring-2 ring-amber-400 dark:ring-amber-300"
                : "";
              return (
                <Fragment key={m.id}>
                {startsDay && (
                  <div className="self-center rounded-full bg-moss-900/5 px-3 py-0.5 text-xs text-moss-600 dark:bg-white/10 dark:text-moss-300">
                    {dayLabel(m.createdAt)}
                  </div>
                )}
                <div
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
                    if (reactFor === m.id) setReactFor(null);
                    else openMenuFor(m.id);
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
                  {m.voice ? (
                    <VoicePlayer
                      audioBase64={m.voice.audio}
                      mime={m.voice.mime}
                      durationMs={m.voice.durationMs}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">
                      {m.plaintext === null ? (
                        t("messages.decryptionFailed")
                      ) : isSearching ? (
                        <HighlightedText text={m.plaintext} query={query} />
                      ) : (
                        m.plaintext
                      )}
                    </p>
                  )}
                  {endsGroup && (
                    <p className="mt-1 text-right text-xs opacity-60">
                      {formatRelativeTime(m.createdAt)}
                    </p>
                  )}
                  {/* Keyboard/mouse path to the picker — the same
                      action long-press performs on touch. Invisible
                      until the bubble is hovered or the button is
                      focused, but always in the tab order. */}
                  <button
                    type="button"
                    aria-label={t("messages.reactions.open")}
                    aria-expanded={reactFor === m.id}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      if (reactFor === m.id) setReactFor(null);
                      else openMenuFor(m.id);
                    }}
                    className={`absolute -top-2 ${
                      isMine ? "-left-2" : "-right-2"
                    } rounded-full border border-moss-200 bg-white px-1.5 py-0.5 text-xs opacity-0 shadow-sm transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-canopy-400 group-hover:opacity-100 dark:border-moss-600 dark:bg-moss-700`}
                  >
                    🙂+
                  </button>
                  {/* Reaction chips — the CURRENT reaction of each
                      party (latest wins; clearing removes it). YOUR
                      OWN chip is a button: tapping it opens the same
                      long-press menu for this message, the WhatsApp
                      habit of tapping a reaction to change or remove
                      it (2026-07 usability round). The other party's
                      chip stays display-only — you can't operate on
                      someone else's reaction. The pointerdown stop
                      keeps a chip tap from ALSO arming the bubble's
                      long-press timer (same interplay guard as the
                      🙂+ button above). */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.reactions.map((r) =>
                        r.senderKey === currentMember.publicKey ? (
                          <button
                            key={r.senderKey}
                            type="button"
                            aria-label={t("messages.reactions.changeOwn", {
                              emoji: r.emoji,
                            })}
                            aria-expanded={reactFor === m.id}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              // A chip tap must never double as a
                              // bubble press.
                              e.stopPropagation();
                              cancelPress();
                              if (reactFor === m.id) setReactFor(null);
                              else openMenuFor(m.id);
                            }}
                            className="rounded-full bg-canopy-200 px-2 py-0.5 text-sm hover:bg-canopy-300 focus:outline-none focus:ring-2 focus:ring-canopy-400 dark:bg-canopy-800 dark:hover:bg-canopy-700"
                          >
                            {r.emoji}
                          </button>
                        ) : (
                          <span
                            key={r.senderKey}
                            aria-label={t("messages.reactions.reactedBy", {
                              name: otherName,
                              emoji: r.emoji,
                            })}
                            className="rounded-full bg-moss-900/10 px-2 py-0.5 text-sm dark:bg-white/10"
                          >
                            {r.emoji}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                  {/* The picker: six 44px emoji, inline under the
                      bubble. Escape closes (window listener above);
                      picking sends, picking your current emoji
                      clears. */}
                  {/* The long-press menu (Signal-style): emoji bar on
                      top, actions below. Copy/Speak only apply to
                      readable text; Info shows the exact time and the
                      end-to-end note in plain language. */}
                  {/* When the bubble sits near the bottom of the
                      visible thread the in-flow menu would land past
                      the screen edge (landscape phones made this a
                      hard blocker: long-press "did nothing"). In that
                      case the menu becomes a card OVERLAY anchored to
                      the bubble's top edge, opening upward over
                      already-read messages — a pure positioning swap,
                      identical menu tree either way. */}
                  {reactFor === m.id && (
                    <div
                      role="menu"
                      aria-label={t("messages.reactions.pickerLabel")}
                      className={
                        menuUp
                          ? `absolute bottom-full ${
                              isMine ? "right-0" : "left-0"
                            } z-10 mb-1 flex w-max max-w-[min(20rem,calc(100vw_-_2rem))] flex-col gap-1 rounded-xl border border-moss-200 bg-white p-2 shadow-lg dark:border-moss-600 dark:bg-moss-800`
                          : "mt-1 flex flex-col gap-1"
                      }
                    >
                    <div className="flex flex-wrap gap-1">
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
                    <div className="flex flex-wrap gap-1">
                      {m.plaintext !== null && !m.voice && (
                        <>
                          <button
                            type="button"
                            role="menuitem"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => void handleCopy(m)}
                            className="min-h-[44px] rounded-full px-3 text-sm hover:bg-moss-900/10 focus:outline-none focus:ring-2 focus:ring-canopy-400 dark:hover:bg-white/10"
                          >
                            {copiedId === m.id
                              ? t("messages.menu.copied")
                              : t("messages.menu.copy")}
                          </button>
                          {/* Speak is stateful, not fire-and-forget:
                              until speech audibly starts it reads
                              "Starting…" (claiming there's something
                              to stop during the start watchdog would
                              be a lie on a zero-voices device), while
                              reading it becomes "Stop speaking", and
                              where the device has no
                              speech at all it stays visible but
                              disabled and says so — a hidden control
                              can't explain itself. A tap that turned
                              out to produce no speech (zero-voices
                              engine — the watchdog in lib/speak.ts)
                              lands on the same disabled explanation:
                              the truth arrived late, but it arrives
                              where the member is already looking. */}
                          <button
                            type="button"
                            role="menuitem"
                            disabled={
                              !isSpeechAvailable() || speakFailedId === m.id
                            }
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => handleSpeak(m)}
                            className="min-h-[44px] rounded-full px-3 text-sm hover:bg-moss-900/10 focus:outline-none focus:ring-2 focus:ring-canopy-400 disabled:opacity-60 disabled:hover:bg-transparent dark:hover:bg-white/10 dark:disabled:hover:bg-transparent"
                          >
                            {!isSpeechAvailable() || speakFailedId === m.id
                              ? t("messages.menu.speakUnavailable")
                              : speakingId === m.id
                                ? speakStartedId === m.id
                                  ? t("messages.menu.speakStop")
                                  : t("messages.menu.speakStarting")
                                : t("messages.menu.speak")}
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        aria-expanded={infoFor === m.id}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() =>
                          setInfoFor(infoFor === m.id ? null : m.id)
                        }
                        className="min-h-[44px] rounded-full px-3 text-sm hover:bg-moss-900/10 focus:outline-none focus:ring-2 focus:ring-canopy-400 dark:hover:bg-white/10"
                      >
                        {t("messages.menu.info")}
                      </button>
                    </div>
                    {infoFor === m.id && (
                      <div className="rounded-lg bg-moss-900/5 px-2 py-1.5 text-xs dark:bg-white/10">
                        <p>
                          {t("messages.menu.infoSent", {
                            when: new Intl.DateTimeFormat(i18n.language, {
                              dateStyle: "full",
                              timeStyle: "short",
                            }).format(new Date(m.createdAt)),
                          })}
                        </p>
                        <p className="mt-0.5 opacity-70">
                          {t("messages.menu.infoSealed", { name: otherName })}
                        </p>
                      </div>
                    )}
                    </div>
                  )}
                </div>
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
      {/* The "new messages ↓" chip: floats over the thread while the
          reader is scrolled up and something new arrived. Tapping
          jumps to the latest; reaching the bottom by hand clears it
          too (the onScroll handler above). */}
      {unseen > 0 && (
        <button
          type="button"
          onClick={() => {
            const list = listRef.current;
            if (list) scrollListTo(list.scrollHeight);
            setUnseen(0);
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-canopy-700 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:bg-canopy-800 focus:outline-none focus:ring-2 focus:ring-canopy-400"
        >
          <span aria-hidden="true">{"↓ "}</span>
          {t("messages.newMessages", { count: unseen })}
        </button>
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

      {recordingVoice && (
        <div className="mt-3">
          <VoiceRecorder
            onCapture={handleVoiceCapture}
            onCancel={() => setRecordingVoice(false)}
          />
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
            onChange={(e) => {
              setText(e.target.value);
              // Auto-grow (Signal-style): the box follows the text up
              // to ~6 lines, then scrolls internally. scrollHeight is
              // 0 in jsdom — skip there rather than pinning to 0px.
              const el = e.currentTarget;
              if (el.scrollHeight > 0) {
                el.style.height = "auto";
                el.style.height = `${Math.min(
                  el.scrollHeight,
                  composerHeightCapPx(),
                )}px`;
              }
            }}
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
        {/* One slot, two moods (the Signal morph): the mic while the
            box is empty, Send once there's something to send. Fewer
            buttons on screen at any moment, and the mic is exactly
            where the thumb already is. */}
        {text.trim() === "" && !sending ? (
          <button
            type="button"
            className="btn-ghost min-h-[44px] min-w-[44px] self-end text-lg"
            aria-label={
              recordingVoice
                ? t("messages.voice.closeRecorder")
                : t("messages.voice.record")
            }
            aria-pressed={recordingVoice}
            onClick={() => setRecordingVoice((v) => !v)}
          >
            🎙️
          </button>
        ) : (
          <button
            type="submit"
            className="btn-primary self-end"
            disabled={sending || !text.trim()}
            aria-busy={sending}
          >
            {sending ? t("messages.sending") : t("messages.send")}
          </button>
        )}
      </form>
      {error && (
        <p className="mt-2 text-xs text-rose-700 dark:text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
