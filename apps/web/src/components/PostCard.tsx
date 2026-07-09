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
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { AvailabilityChip, Post } from "@/types";
import { formatHours, formatRelativeTime } from "@/lib/format";
import { stripMarkdown } from "@/lib/markdown";
import type { TrustStatus } from "@/lib/vouch";
import { AvailabilityChips } from "./AvailabilityChips";
import { CategoryBadge } from "./CategoryBadge";
import { HighlightedText } from "./HighlightedText";
import { TrustChip } from "./TrustChip";
import { UrgencyBadge } from "./UrgencyBadge";
import { MemberAvatar } from "./MemberAvatar";

export function PostCard({
  post,
  posterName,
  isCurrentMember,
  posterTrust,
  isCrossNode,
  posterAvailabilityChips,
  searchQuery,
}: {
  post: Post;
  posterName: string;
  isCurrentMember: boolean;
  posterTrust?: TrustStatus;
  isCrossNode?: boolean;
  posterAvailabilityChips?: AvailabilityChip[];
  /** Optional active search query — when non-empty, every match in
   *  the title is wrapped in <mark> via HighlightedText so the
   *  member sees why this card matched. Description stays plain
   *  for v1 (title is enough; pilots can ask for description). */
  searchQuery?: string;
}) {
  const { t } = useTranslation();
  // Carry the current query string into the post URL. PostCard only
  // renders on the Board, whose ?tab= lives in the URL — the post
  // route nests under the Board (the docked panel), so preserving
  // the search keeps the board behind the panel on the tab the
  // member was browsing, and closing the panel restores it exactly.
  // PostDetail ignores query params, so this is inert otherwise.
  const { search } = useLocation();
  // No "needs help" / "offers" type label in the meta row: PostCard
  // renders only inside the Board's NEED / OFFER tabs, where the
  // active tab already declares the type — repeating it on every
  // card was pure chrome. If PostCard ever gains a mixed-type
  // context (cross-type search results, profile history), reintroduce
  // the label behind a `showTypeLabel` prop defaulting to false.
  return (
    <Link
      to={{ pathname: `/post/${post.id}`, search }}
      className="card block animate-fade-in transition-shadow hover:shadow-md
                 focus-visible:ring-2 focus-visible:ring-canopy-600/50"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <CategoryBadge category={post.category} size="sm" />
        <UrgencyBadge urgency={post.urgency} />
        {post.status !== "open" && <StatusChip status={post.status} />}
        {isCrossNode && (
          <span className="chip bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
            {t("postCard.peerCommunity")}
          </span>
        )}
        <ExpiryChip expiresAt={post.expiresAt} />
      </div>
      <div className="flex items-start gap-3">
        <MemberAvatar publicKey={post.postedBy} size={40} framed />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug">
            {searchQuery && searchQuery.trim() !== "" ? (
              <HighlightedText text={post.title} query={searchQuery} />
            ) : (
              post.title
            )}
          </h3>
          {post.description && (
            <p className="mt-1 line-clamp-2 text-sm text-moss-600 dark:text-moss-300">
              {stripMarkdown(post.description)}
            </p>
          )}
          {post.type === "OFFER" &&
            !isCrossNode &&
            posterAvailabilityChips &&
            posterAvailabilityChips.length > 0 && (
              <div className="mt-2">
                <AvailabilityChips chips={posterAvailabilityChips} compact />
              </div>
            )}
          <div className="mt-3 flex items-center justify-between text-xs text-moss-600 dark:text-moss-300">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium">
                {isCurrentMember ? t("common.you") : posterName}
              </span>
              {posterTrust && !isCurrentMember && (
                <TrustChip status={posterTrust} compact />
              )}
              <span className="font-medium">
                {formatHours(post.estimatedHours)}
              </span>
            </span>
            <span>{formatRelativeTime(post.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ExpiryChip({ expiresAt }: { expiresAt: number | null }) {
  const { t } = useTranslation();
  if (!expiresAt) return null;
  const now = Date.now();
  const msRemaining = expiresAt - now;
  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
  if (daysRemaining <= 0)
    return (
      <span className="chip bg-moss-100 text-moss-600 dark:bg-moss-800 dark:text-moss-300">
        {t("postCard.expired")}
      </span>
    );
  if (daysRemaining <= 1)
    return (
      <span className="chip bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100">
        {t("postCard.expiresToday")}
      </span>
    );
  if (daysRemaining <= 3)
    return (
      <span className="chip bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
        {t("postCard.expiresIn", { count: daysRemaining })}
      </span>
    );
  return null;
}

function StatusChip({ status }: { status: Post["status"] }) {
  const { t } = useTranslation();
  return (
    <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
      {t(`postStatus.${status}`)}
    </span>
  );
}
