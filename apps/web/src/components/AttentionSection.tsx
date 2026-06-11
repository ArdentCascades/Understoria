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
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import { computeAttentionItems } from "@/lib/attention";
import { ATTENTION_EMOJI } from "@/lib/attentionMeta";
import {
  acknowledgeTaskCheckIn,
  logActivity,
  unclaimProjectTask,
} from "@/db/projects";
import { respondToCoOrganizerInvitation } from "@/db/coorgInvitations";
import { getSecretKey } from "@/db/secrets";
import { humanizeError } from "@/lib/humanizeError";
import { usePendingAction } from "@/lib/usePendingAction";
import { WhyTooltip } from "@/components/WhyTooltip";
import { ConfirmDialog } from "@/components/ConfirmDialog";

// "Needs your attention" — see lib/attention.ts for what counts.
// Renders null when nothing is waiting, so members never see "you
// have 0 things to do." Lives at the top of the Board.

// aria-hidden so screen readers don't read "right arrow" — the row
// itself is already a link and announces its label.
function RowChevron() {
  return (
    <span aria-hidden="true" className="ml-auto text-moss-400 dark:text-moss-300">
      →
    </span>
  );
}

// Per-kind sighted-only at-a-glance cue. aria-hidden so screen
// readers skip it — the row's title and hint already carry the
// meaning standalone (WCAG 1.1.1). Mirrors the emoji-prefix pattern
// CATEGORY_META establishes across Board / Calendar / Dashboard.
function KindEmoji({ kind }: { kind: keyof typeof ATTENTION_EMOJI }) {
  return (
    <span aria-hidden="true" className="mr-1.5 inline-block">
      {ATTENTION_EMOJI[kind]}
    </span>
  );
}

export function AttentionSection() {
  const {
    currentMember, posts, projects, projectTasks, members, vouches, nodeConfig,
    nodeId, lockState,
    coorgInvitations, coorgInvitationResponses, coorgInvitationRevocations,
    events, eventRsvps, eventCancellations,
    blockedKeys,
  } = useApp();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { pending, run } = usePendingAction();
  // Which co-organizer invitation, if any, has its Accept comparison
  // card or Decline confirm open. `null` when neither is open. Per §7
  // the consequences are named before the member signs.
  const [acceptInvitationId, setAcceptInvitationId] = useState<string | null>(
    null,
  );
  const [declineInvitationId, setDeclineInvitationId] = useState<string | null>(
    null,
  );
  const items = useMemo(
    () =>
      computeAttentionItems({
        currentMember,
        posts,
        projects,
        projectTasks,
        members,
        vouches,
        coorgInvitations,
        coorgInvitationResponses,
        coorgInvitationRevocations,
        events,
        eventRsvps,
        eventCancellations,
        config: nodeConfig,
        blockedKeys,
      }),
    [
      currentMember, posts, projects, projectTasks, members, vouches,
      coorgInvitations, coorgInvitationResponses, coorgInvitationRevocations,
      events, eventRsvps, eventCancellations,
      nodeConfig, blockedKeys,
    ],
  );

  if (items.length === 0) return null;

  async function handleAck(taskId: string) {
    if (!currentMember) return;
    try {
      await run(() => acknowledgeTaskCheckIn(taskId, currentMember.publicKey));
      // The data layer stamps `checkInAcknowledgedAt = now`, which
      // resets the `taskCheckInDays` clock used by `taskCheckInState`
      // (see lib/taskCheckInState.ts). So the truthful number is
      // exactly the configured private window — no grace stacking,
      // no needs-help-floor arithmetic. Closing the loop with that
      // number turns a silent button-press into a small relief
      // moment: the claimer knows when they'll hear from us next.
      showToast(
        t("projects.task.checkInAckToast", { days: nodeConfig.taskCheckInDays }),
      );
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

  // Accept / decline a co-organizer invitation. Both sign with the
  // invitee's secret key, so a locked session blocks them — surface
  // the lock message rather than failing silently. On success the
  // response row exists, so the attention item drops out of
  // `computeAttentionItems` on the next live-query tick. We also write
  // the activity row here (the data layer doesn't log activity — see
  // `db/coorgInvitations.ts`), so the project history reflects the
  // decision.
  async function handleRespond(
    invitationId: string,
    projectId: string,
    decision: "accept" | "decline",
  ) {
    if (!currentMember) return;
    if (lockState === "locked") {
      showToast(t("attention.coorgInvitation.lockedToRespond"), "error");
      return;
    }
    try {
      await run(async () => {
        const inviteeSecretKey = await getSecretKey(currentMember.publicKey);
        await respondToCoOrganizerInvitation({
          invitationId,
          inviteeSecretKey,
          decision,
          nodeId,
        });
        await logActivity(
          projectId,
          decision === "accept"
            ? "coorganizer_accepted"
            : "coorganizer_declined",
          currentMember.publicKey,
          { invitationId },
          nodeId,
        );
      });
      setAcceptInvitationId(null);
      setDeclineInvitationId(null);
      // Accept-only pointer to the persistent capability card on the
      // project page. Non-blocking — no modal, no forced tour. Members
      // who declined don't need a pointer to a role they don't have.
      if (decision === "accept") {
        showToast(t("projects.coorg.acceptedPointer"));
      }
    } catch (err) {
      showToast(humanizeError(err), "error");
    }
  }

  return (
    <section
      className="card mb-3 border-l-4 border-canopy-500"
      aria-labelledby="attention-title"
    >
      <div className="mb-2 inline-flex items-baseline gap-1.5">
        <h2
          id="attention-title"
          className="text-sm font-semibold uppercase tracking-wide text-canopy-700 dark:text-canopy-300"
        >
          {t("attention.title")}
        </h2>
        <WhyTooltip principleId="no-notifications" />
      </div>
      <ul
        className="flex flex-col gap-1.5"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {items.map((item) => {
          if (item.kind === "confirm_exchange") {
            return (
              <li key={`ex_${item.postId}`}>
                <Link
                  to={`/post/${item.postId}`}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-canopy-50 px-3 py-1.5 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      <KindEmoji kind={item.kind} />
                      {t("attention.exchangeLine", {
                        name: item.counterpartyName,
                        title: item.postTitle,
                      })}
                    </span>
                    <span className="block text-xs text-moss-500 dark:text-moss-300">
                      {t("attention.tapToConfirm")}
                    </span>
                  </span>
                  <RowChevron />
                </Link>
              </li>
            );
          }
          if (item.kind === "confirm_task") {
            return (
              <li key={`task_${item.taskId}`}>
                <Link
                  to={`/project/${item.projectId}`}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-canopy-50 px-3 py-1.5 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      <KindEmoji kind={item.kind} />
                      {t("attention.taskLine", {
                        name: item.completerName,
                        task: item.taskTitle,
                        project: item.projectTitle,
                      })}
                    </span>
                    <span className="block text-xs text-moss-500 dark:text-moss-300">
                      {t("attention.tapToConfirmTask")}
                    </span>
                  </span>
                  <RowChevron />
                </Link>
              </li>
            );
          }
          if (item.kind === "post_claimed") {
            return (
              <li key={`claimed_${item.postId}`}>
                <Link
                  to={`/post/${item.postId}`}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-canopy-50 px-3 py-1.5 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      <KindEmoji kind={item.kind} />
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
                    <span className="block text-xs text-moss-500 dark:text-moss-300">
                      {t("attention.postClaimed.hint")}
                    </span>
                  </span>
                  <RowChevron />
                </Link>
              </li>
            );
          }
          if (item.kind === "vouch_received") {
            return (
              <li key={`vouch_${item.voucherName}_${item.createdAt}`}>
                <Link
                  to="/profile"
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-canopy-50 px-3 py-1.5 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      <KindEmoji kind={item.kind} />
                      {t("attention.vouchReceived.line", {
                        name: item.voucherName,
                      })}
                    </span>
                    <span className="block text-xs text-moss-500 dark:text-moss-300">
                      {t("attention.vouchReceived.hint")}
                    </span>
                  </span>
                  <RowChevron />
                </Link>
              </li>
            );
          }
          if (item.kind === "project_deadline_approaching") {
            return (
              <li key={`deadline_${item.projectId}`}>
                <Link
                  to={`/project/${item.projectId}`}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:bg-amber-950/40 dark:hover:bg-amber-950/60"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-amber-900 dark:text-amber-100">
                      <KindEmoji kind={item.kind} />
                      {t("attention.projectDeadline.line", {
                        project: item.projectTitle,
                        days: item.daysRemaining,
                      })}
                    </span>
                    <span className="block text-xs text-amber-800 dark:text-amber-200">
                      {t("attention.projectDeadline.hint")}
                    </span>
                  </span>
                  <RowChevron />
                </Link>
              </li>
            );
          }
          if (item.kind === "project_paused_long") {
            return (
              <li key={`paused_${item.projectId}`}>
                <Link
                  to={`/project/${item.projectId}`}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-moss-50 px-3 py-1.5 transition-colors hover:bg-moss-100 focus-visible:bg-moss-100 dark:bg-moss-950/40 dark:hover:bg-moss-950/60"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-moss-900 dark:text-moss-100">
                      <KindEmoji kind={item.kind} />
                      {t("attention.projectPaused.line", {
                        project: item.projectTitle,
                      })}
                    </span>
                    <span className="block text-xs text-moss-700 dark:text-moss-300">
                      {t("attention.projectPaused.hint")}
                    </span>
                  </span>
                  <RowChevron />
                </Link>
              </li>
            );
          }
          // task_check_in — private nudge, claimer only. Not a
          // Link wrapper because the actions live here; the
          // project name is still tappable as a deep-link.
          if (item.kind === "task_check_in") {
          return (
            <li
              key={`checkin_${item.taskId}`}
              className="min-h-[44px] rounded-lg bg-amber-50 px-3 py-1.5 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:bg-amber-950/40"
            >
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                <KindEmoji kind={item.kind} />
                <Link
                  to={`/project/${item.projectId}`}
                  className="underline-offset-2 hover:underline focus-visible:underline"
                >
                  {t("attention.taskCheckIn.line", {
                    task: item.taskTitle,
                    project: item.projectTitle,
                    days: item.daysSinceClaim,
                  })}
                </Link>
              </p>
              <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-200">
                {t("attention.taskCheckIn.hint")}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleAck(item.taskId)}
                  disabled={pending}
                  className="inline-flex min-h-[44px] items-center rounded-full bg-canopy-700 px-3 py-1 text-xs font-semibold text-canopy-50 hover:bg-canopy-800 disabled:opacity-50"
                >
                  {t("attention.taskCheckIn.stillOn")}
                </button>
                <button
                  type="button"
                  onClick={() => void handleRelease(item.taskId)}
                  disabled={pending}
                  className="inline-flex min-h-[44px] items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-200 disabled:opacity-50 dark:bg-amber-900/60 dark:text-amber-100"
                >
                  {t("attention.taskCheckIn.release")}
                </button>
              </div>
            </li>
          );
          }
          // Co-organizer invitation addressed to the current member.
          // Per §7 the consequences are named in a comparison card
          // (same discipline as device pairing) before signing. The
          // card and the decline confirm expand inline.
          if (item.kind === "coorganizer_invitation_received") {
            const accepting = acceptInvitationId === item.invitationId;
            return (
              <li
                key={`coorg_${item.invitationId}`}
                className="min-h-[44px] rounded-lg bg-canopy-50 px-3 py-1.5 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:bg-canopy-950/40"
              >
                <p className="text-sm font-medium">
                  <KindEmoji kind={item.kind} />
                  <Link
                    to={`/project/${item.projectId}`}
                    className="underline-offset-2 hover:underline focus-visible:underline"
                  >
                    {t("attention.coorgInvitation.line", {
                      name: item.inviterName,
                      project: item.projectTitle,
                    })}
                  </Link>
                </p>
                <p className="mt-0.5 text-xs text-moss-600 dark:text-moss-300">
                  {t("attention.coorgInvitation.hint")}
                </p>
                {accepting && (
                  <div className="mt-1.5 rounded-lg border border-canopy-200 bg-white/60 p-2 text-xs dark:border-canopy-900/50 dark:bg-canopy-950/30">
                    <p className="font-semibold text-canopy-900 dark:text-canopy-100">
                      {t("attention.coorgInvitation.accept.title", {
                        project: item.projectTitle,
                      })}
                    </p>
                    <p className="mt-1 font-medium text-moss-700 dark:text-moss-200">
                      {t("attention.coorgInvitation.accept.meansTitle")}
                    </p>
                    <ul className="mt-0.5 list-disc pl-4 text-[11px] leading-snug text-moss-600 dark:text-moss-300">
                      <li>{t("attention.coorgInvitation.accept.meansConfirm")}</li>
                      <li>{t("attention.coorgInvitation.accept.meansSign")}</li>
                      <li>{t("attention.coorgInvitation.accept.meansVisible")}</li>
                    </ul>
                    <p className="mt-2 font-medium text-moss-700 dark:text-moss-200">
                      {t("attention.coorgInvitation.accept.notTitle")}
                    </p>
                    <ul className="mt-0.5 list-disc pl-4 text-[11px] leading-snug text-moss-600 dark:text-moss-300">
                      <li>{t("attention.coorgInvitation.accept.notObligation")}</li>
                      <li>{t("attention.coorgInvitation.accept.notDeputy")}</li>
                    </ul>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {accepting ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          void handleRespond(
                            item.invitationId,
                            item.projectId,
                            "accept",
                          )
                        }
                        disabled={pending}
                        className="inline-flex min-h-[44px] items-center rounded-full bg-canopy-700 px-3 py-1 text-xs font-semibold text-canopy-50 hover:bg-canopy-800 disabled:opacity-50"
                      >
                        {t("attention.coorgInvitation.accept.sign")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAcceptInvitationId(null)}
                        disabled={pending}
                        className="inline-flex min-h-[44px] items-center rounded-full bg-moss-100 px-3 py-1 text-xs font-semibold text-moss-800 hover:bg-moss-200 disabled:opacity-50 dark:bg-moss-800 dark:text-moss-100"
                      >
                        {t("common.cancel")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setDeclineInvitationId(null);
                          setAcceptInvitationId(item.invitationId);
                        }}
                        disabled={pending}
                        className="inline-flex min-h-[44px] items-center rounded-full bg-canopy-700 px-3 py-1 text-xs font-semibold text-canopy-50 hover:bg-canopy-800 disabled:opacity-50"
                      >
                        {t("attention.coorgInvitation.accept.cta")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAcceptInvitationId(null);
                          setDeclineInvitationId(item.invitationId);
                        }}
                        disabled={pending}
                        className="inline-flex min-h-[44px] items-center rounded-full bg-moss-100 px-3 py-1 text-xs font-semibold text-moss-800 hover:bg-moss-200 disabled:opacity-50 dark:bg-moss-800 dark:text-moss-100"
                      >
                        {t("attention.coorgInvitation.decline.cta")}
                      </button>
                    </>
                  )}
                </div>
                <ConfirmDialog
                  open={declineInvitationId === item.invitationId}
                  title={t("attention.coorgInvitation.decline.confirmTitle", {
                    project: item.projectTitle,
                  })}
                  description={t(
                    "attention.coorgInvitation.decline.confirmBody",
                  )}
                  confirmLabel={t("attention.coorgInvitation.decline.cta")}
                  tone="caution"
                  onCancel={() => setDeclineInvitationId(null)}
                  onConfirm={() =>
                    handleRespond(
                      item.invitationId,
                      item.projectId,
                      "decline",
                    )
                  }
                />
              </li>
            );
          }
          if (item.kind === "event_today") {
            return (
              <li key={`event_today_${item.eventId}`}>
                <Link
                  to={item.deepLink}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-canopy-50 px-3 py-1.5 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      <KindEmoji kind={item.kind} />
                      {t("events.attention.eventTodayLine", {
                        title: item.title,
                        location: item.location,
                      })}
                    </span>
                    <span className="block text-xs text-moss-500 dark:text-moss-300">
                      {t("events.attention.eventTodayHint")}
                      {/* `no-notifications` tooltip per design doc §8.1 —
                          named on the row so members can see why the
                          surface isn't pushy. */}
                      <WhyTooltip principleId="no-notifications" />
                    </span>
                  </span>
                  <RowChevron />
                </Link>
              </li>
            );
          }
          if (item.kind === "event_cancelled") {
            const hint = item.reason
              ? t("events.attention.eventCancelledHint", { reason: item.reason })
              : t("events.attention.eventCancelledHintNoReason");
            return (
              <li key={`event_cancelled_${item.eventId}`}>
                <Link
                  to={item.deepLink}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:bg-amber-950/40 dark:hover:bg-amber-950/60"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-amber-900 dark:text-amber-100">
                      <KindEmoji kind={item.kind} />
                      {t("events.attention.eventCancelledLine", {
                        title: item.eventTitle,
                      })}
                    </span>
                    <span className="block text-xs text-amber-800 dark:text-amber-200">
                      {hint}
                    </span>
                  </span>
                  <RowChevron />
                </Link>
              </li>
            );
          }
          if (item.kind === "event_capacity_reached") {
            return (
              <li key={`event_capacity_${item.eventId}`}>
                <Link
                  to={item.deepLink}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-canopy-50 px-3 py-1.5 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:bg-canopy-950/40 dark:hover:bg-canopy-950/60"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      <KindEmoji kind={item.kind} />
                      {t("events.attention.eventCapacityReachedLine", {
                        title: item.title,
                        capacity: item.capacity,
                      })}
                    </span>
                    <span className="block text-xs text-moss-500 dark:text-moss-300">
                      {t("events.attention.eventCapacityReachedHint")}
                    </span>
                  </span>
                  <RowChevron />
                </Link>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </section>
  );
}
