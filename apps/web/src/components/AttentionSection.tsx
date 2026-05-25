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
import { useToast } from "@/state/ToastContext";
import { computeAttentionItems } from "@/lib/attention";
import {
  acknowledgeTaskCheckIn,
  unclaimProjectTask,
} from "@/db/projects";
import { humanizeError } from "@/lib/humanizeError";
import { usePendingAction } from "@/lib/usePendingAction";

// "Needs your attention" — see lib/attention.ts for what counts.
// Renders null when nothing is waiting, so members never see "you
// have 0 things to do." Lives at the top of the Board.

export function AttentionSection() {
  const {
    currentMember, posts, projects, projectTasks, members, vouches, nodeConfig,
  } = useApp();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { pending, run } = usePendingAction();
  const items = useMemo(
    () =>
      computeAttentionItems({
        currentMember,
        posts,
        projects,
        projectTasks,
        members,
        vouches,
        config: nodeConfig,
      }),
    [currentMember, posts, projects, projectTasks, members, vouches, nodeConfig],
  );

  if (items.length === 0) return null;

  async function handleAck(taskId: string) {
    if (!currentMember) return;
    try {
      await run(() => acknowledgeTaskCheckIn(taskId, currentMember.publicKey));
    } catch (err) {
      showToast(humanizeError(err), "error");
    }
  }

  async function handleRelease(taskId: string) {
    if (!currentMember) return;
    try {
      await run(() => unclaimProjectTask(taskId, currentMember.publicKey));
    } catch (err) {
      showToast(humanizeError(err), "error");
    }
  }

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
            return (
              <li key={`ex_${item.postId}`}>
                <Link
                  to={`/post/${item.postId}`}
                  className="block rounded-lg bg-canopy-50 px-3 py-2 hover:bg-canopy-100 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
                >
                  <span className="block text-sm font-medium">
                    {t("attention.exchangeLine", {
                      name: item.counterpartyName,
                      title: item.postTitle,
                    })}
                  </span>
                  <span className="text-xs text-moss-500">
                    {t("attention.tapToConfirm")}
                  </span>
                </Link>
              </li>
            );
          }
          if (item.kind === "confirm_task") {
            return (
              <li key={`task_${item.taskId}`}>
                <Link
                  to={`/project/${item.projectId}`}
                  className="block rounded-lg bg-canopy-50 px-3 py-2 hover:bg-canopy-100 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
                >
                  <span className="block text-sm font-medium">
                    {t("attention.taskLine", {
                      name: item.completerName,
                      task: item.taskTitle,
                      project: item.projectTitle,
                    })}
                  </span>
                  <span className="text-xs text-moss-500">
                    {t("attention.tapToConfirmTask")}
                  </span>
                </Link>
              </li>
            );
          }
          if (item.kind === "post_claimed") {
            return (
              <li key={`claimed_${item.postId}`}>
                <Link
                  to={`/post/${item.postId}`}
                  className="block rounded-lg bg-canopy-50 px-3 py-2 hover:bg-canopy-100 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
                >
                  <span className="block text-sm font-medium">
                    {item.postType === "NEED"
                      ? t("attention.postClaimed.needLine", {
                          name: item.claimerName,
                          title: item.postTitle,
                        })
                      : t("attention.postClaimed.offerLine", {
                          name: item.claimerName,
                          title: item.postTitle,
                        })}
                  </span>
                  <span className="text-xs text-moss-500">
                    {t("attention.postClaimed.hint")}
                  </span>
                </Link>
              </li>
            );
          }
          if (item.kind === "vouch_received") {
            return (
              <li key={`vouch_${item.voucherName}_${item.createdAt}`}>
                <Link
                  to="/profile"
                  className="block rounded-lg bg-canopy-50 px-3 py-2 hover:bg-canopy-100 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
                >
                  <span className="block text-sm font-medium">
                    {t("attention.vouchReceived.line", {
                      name: item.voucherName,
                    })}
                  </span>
                  <span className="text-xs text-moss-500">
                    {t("attention.vouchReceived.hint")}
                  </span>
                </Link>
              </li>
            );
          }
          // task_check_in — private nudge, claimer only. Not a
          // Link wrapper because the actions live here; the
          // project name is still tappable as a deep-link.
          return (
            <li
              key={`checkin_${item.taskId}`}
              className="rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950/40"
            >
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                {t("attention.taskCheckIn.line", {
                  task: item.taskTitle,
                  project: item.projectTitle,
                  days: item.daysSinceClaim,
                })}
              </p>
              <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-200">
                {t("attention.taskCheckIn.hint")}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleAck(item.taskId)}
                  disabled={pending}
                  className="rounded-full bg-canopy-700 px-3 py-1 text-xs font-semibold text-canopy-50 hover:bg-canopy-800 disabled:opacity-50"
                >
                  {t("attention.taskCheckIn.stillOn")}
                </button>
                <button
                  type="button"
                  onClick={() => void handleRelease(item.taskId)}
                  disabled={pending}
                  className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-200 disabled:opacity-50 dark:bg-amber-900/60 dark:text-amber-100"
                >
                  {t("attention.taskCheckIn.release")}
                </button>
                <Link
                  to={`/project/${item.projectId}`}
                  className="ml-auto text-xs text-amber-800 underline-offset-2 hover:underline dark:text-amber-200"
                >
                  {t("attention.taskCheckIn.openProject")}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
