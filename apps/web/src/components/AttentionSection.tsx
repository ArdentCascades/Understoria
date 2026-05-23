/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { computeAttentionItems } from "@/lib/attention";
import { trustStatusWithInvites, type TrustStatus } from "@/lib/vouch";
import { TrustChip } from "@/components/TrustChip";

// "Needs your attention" — see lib/attention.ts for what counts.
// Renders null when nothing is waiting, so members never see "you
// have 0 things to do." Lives at the top of the Board.

export function AttentionSection() {
  const {
    currentMember,
    posts,
    projects,
    projectTasks,
    members,
    vouches,
    invites,
  } = useApp();
  const { t } = useTranslation();
  const items = useMemo(
    () =>
      computeAttentionItems({
        currentMember,
        posts,
        projects,
        projectTasks,
        members,
      }),
    [currentMember, posts, projects, projectTasks, members],
  );

  // Compute trust state only for counterparties / completers that
  // actually appear in the attention list — usually a handful at
  // most, so this is cheap. Done at the section level so the same
  // member appearing in multiple items doesn't trigger repeat
  // verification.
  const trustByKey = useMemo(() => {
    const keys = new Set<string>();
    for (const item of items) {
      if (item.kind === "confirm_exchange" && item.counterpartyKey) {
        keys.add(item.counterpartyKey);
      } else if (item.kind === "confirm_task" && item.completerKey) {
        keys.add(item.completerKey);
      }
    }
    const map = new Map<string, TrustStatus>();
    for (const key of keys) {
      map.set(key, trustStatusWithInvites(key, { vouches, invites }));
    }
    return map;
  }, [items, vouches, invites]);

  if (items.length === 0) return null;

  return (
    <section
      className="card mb-4 border-l-4 border-canopy-500"
      aria-labelledby="attention-title"
    >
      <h2
        id="attention-title"
        className="mb-1 text-sm font-semibold uppercase tracking-wide text-canopy-700 dark:text-canopy-300"
      >
        {t("attention.title")}
      </h2>
      <p className="mb-3 text-xs text-moss-600 dark:text-moss-300">
        {t("attention.intro")}
      </p>
      <ul
        className="flex flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {items.map((item) => {
          if (item.kind === "confirm_exchange") {
            const trust = item.counterpartyKey
              ? trustByKey.get(item.counterpartyKey)
              : undefined;
            return (
              <li key={`ex_${item.postId}`}>
                <Link
                  to={`/post/${item.postId}`}
                  className="block rounded-lg bg-canopy-50 px-3 py-2 hover:bg-canopy-100 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
                >
                  <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                    <span>
                      {t("attention.exchangeLine", {
                        name: item.counterpartyName,
                        title: item.postTitle,
                      })}
                    </span>
                    {trust && <TrustChip status={trust} compact />}
                  </span>
                  <span className="text-xs text-moss-500">
                    {t("attention.tapToConfirm")}
                  </span>
                </Link>
              </li>
            );
          }
          const trust = item.completerKey
            ? trustByKey.get(item.completerKey)
            : undefined;
          return (
            <li key={`task_${item.taskId}`}>
              <Link
                to={`/project/${item.projectId}`}
                className="block rounded-lg bg-canopy-50 px-3 py-2 hover:bg-canopy-100 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
              >
                <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                  <span>
                    {t("attention.taskLine", {
                      name: item.completerName,
                      task: item.taskTitle,
                      project: item.projectTitle,
                    })}
                  </span>
                  {trust && <TrustChip status={trust} compact />}
                </span>
                <span className="text-xs text-moss-500">
                  {t("attention.tapToConfirmTask")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
