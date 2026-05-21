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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Post } from "@/types";
import { formatHours, formatRelativeTime } from "@/lib/format";
import { CategoryBadge } from "./CategoryBadge";
import { UrgencyBadge } from "./UrgencyBadge";

export function PostCard({
  post,
  posterName,
  isCurrentMember,
}: {
  post: Post;
  posterName: string;
  isCurrentMember: boolean;
}) {
  const { t } = useTranslation();
  const typeLabel =
    post.type === "NEED" ? t("postCard.needs") : t("postCard.offers");
  return (
    <Link
      to={`/post/${post.id}`}
      className="card block animate-fade-in transition-shadow hover:shadow-md
                 focus-visible:ring-2 focus-visible:ring-canopy-600/50"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <CategoryBadge category={post.category} size="sm" />
        <UrgencyBadge urgency={post.urgency} />
        {post.status !== "open" && <StatusChip status={post.status} />}
      </div>
      <h3 className="text-base font-semibold leading-snug">{post.title}</h3>
      {post.description && (
        <p className="mt-1 line-clamp-2 text-sm text-moss-600 dark:text-moss-300">
          {post.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-moss-600 dark:text-moss-400">
        <span>
          <span className="font-medium">
            {isCurrentMember ? t("common.you") : posterName}
          </span>{" "}
          {typeLabel}{" "}
          <span className="font-medium">
            {formatHours(post.estimatedHours)}
          </span>
        </span>
        <span>{formatRelativeTime(post.createdAt)}</span>
      </div>
    </Link>
  );
}

function StatusChip({ status }: { status: Post["status"] }) {
  const { t } = useTranslation();
  return (
    <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
      {t(`postStatus.${status}`)}
    </span>
  );
}
