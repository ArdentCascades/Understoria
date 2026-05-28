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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { listConversations, type ConversationSummary } from "@/db/messages";
import { formatRelativeTime } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export default function MessagesPage() {
  const { currentMember, members } = useApp();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

  const nameByKey = new Map(members.map((m) => [m.publicKey, m.displayName]));

  useEffect(() => {
    if (!currentMember) return;
    void listConversations(currentMember.publicKey).then(setConversations);
  }, [currentMember]);

  if (!currentMember) return null;

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <h1 className="page-title">{t("messages.title")}</h1>
      </header>
      {conversations.length === 0 ? (
        <EmptyState message={t("messages.empty")} />
      ) : (
        <ul className="flex flex-col gap-2">
          {conversations.map((c) => (
            <li key={c.otherKey}>
              <Link
                to={`/messages/${encodeURIComponent(c.otherKey)}`}
                className="card block transition-shadow hover:shadow-md"
              >
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
