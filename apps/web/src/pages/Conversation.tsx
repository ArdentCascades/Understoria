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
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import {
  getConversation,
  sendMessage,
  type DecryptedMessage,
} from "@/db/messages";
import { formatRelativeTime } from "@/lib/format";

export default function ConversationPage() {
  const { memberKey } = useParams<{ memberKey: string }>();
  const { currentMember, members } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      <div className="flex-1 overflow-y-auto rounded-xl bg-moss-50 p-3 dark:bg-moss-950/30">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-moss-500">
            {t("messages.empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => {
              const isMine = m.senderKey === currentMember.publicKey;
              return (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    isMine
                      ? "self-end bg-canopy-100 text-canopy-900 dark:bg-canopy-900/40 dark:text-canopy-100"
                      : "self-start bg-white text-moss-800 shadow-sm dark:bg-moss-800 dark:text-moss-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {m.plaintext ?? t("messages.decryptionFailed")}
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
