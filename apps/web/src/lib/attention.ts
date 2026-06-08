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
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Member,
  NodeConfig,
  Post,
  Project,
  ProjectTask,
} from "@/types";
import { canClaimTask } from "@/db/projects";
import type { SignedVouch } from "@/lib/vouch";
import {
  daysSinceClaim as daysSinceClaimHelper,
  taskCheckInState,
} from "./taskCheckInState";

// "Needs your attention" — things waiting on the current member to
// act. Pure utility surface: information you already need but
// currently have to dig for. No nag, no push, no time-on-app metric.
// When the list is empty the UI hides the section entirely so
// there's never a "you're not doing enough" feeling.
//
// In scope:
// - Exchanges in `awaiting_confirmation` state where you haven't
//   added your signature yet. Without confirming, credits don't
//   transfer.
// - Project tasks an organizer needs to confirm. Without
//   confirmation, the contributing member's task stays in limbo.
// - Private "still on it?" nudge for tasks you've claimed.
// - Informational: "your post was claimed" — not blocking, but
//   you'd want to know a helper is incoming.
// - Informational: "someone vouched for you" — actionable
//   because vouch count determines trust status.

export type AttentionItem =
  | {
      kind: "confirm_exchange";
      postId: string;
      postTitle: string;
      counterpartyName: string;
      createdAt: number;
    }
  | {
      kind: "confirm_task";
      projectId: string;
      taskId: string;
      projectTitle: string;
      taskTitle: string;
      completerName: string;
      createdAt: number;
    }
  | {
      kind: "task_check_in";
      projectId: string;
      taskId: string;
      projectTitle: string;
      taskTitle: string;
      daysSinceClaim: number;
      /** Cursor for sort — the moment the prompt became due
       *  (claim time or last ack, whichever's later). */
      createdAt: number;
    }
  | {
      kind: "post_claimed";
      postId: string;
      postTitle: string;
      postType: "NEED" | "OFFER";
      claimerName: string;
      createdAt: number;
    }
  | {
      kind: "project_deadline_approaching";
      projectId: string;
      projectTitle: string;
      daysRemaining: number;
      createdAt: number;
    }
  | {
      kind: "project_paused_long";
      projectId: string;
      projectTitle: string;
      daysPaused: number;
      createdAt: number;
    }
  | {
      kind: "vouch_received";
      voucherName: string;
      createdAt: number;
    }
  | {
      /**
       * A co-organizer invitation addressed to the current member is
       * waiting on their decision. See
       * `docs/co-organizer-invitations.md` §7 for the invitee-side
       * UX. The renderer (PR C) opens the accept comparison card or
       * the decline confirm; this data-layer surface just carries
       * enough context for the home screen.
       */
      kind: "coorganizer_invitation_received";
      invitationId: string;
      projectId: string;
      projectTitle: string;
      inviterName: string;
      inviterKey: string;
      expiresAt: number;
      createdAt: number;
    };

export interface AttentionInput {
  currentMember: Pick<Member, "publicKey"> | null;
  posts: readonly Post[];
  projects: readonly Project[];
  projectTasks: readonly ProjectTask[];
  members: readonly Member[];
  vouches?: readonly SignedVouch[];
  /** Outstanding co-organizer invitations on this node — feeds the
   *  `coorganizer_invitation_received` item. Optional so callers
   *  that don't yet read the three new tables (older renderers,
   *  tests that don't exercise the flow) keep their existing
   *  behaviour. */
  coorgInvitations?: readonly CoOrganizerInvitation[];
  coorgInvitationResponses?: readonly CoOrganizerInvitationResponse[];
  coorgInvitationRevocations?: readonly CoOrganizerInvitationRevocation[];
  /** Per-node thresholds for the private "still on it?" nudge.
   *  Optional so the `task_check_in` items just don't surface
   *  when the caller can't supply config (tests, edge cases). */
  config?: Pick<
    NodeConfig,
    "taskCheckInDays" | "taskNeedsHelpDays" | "taskCheckInGraceDays"
  >;
  now?: number;
}

export function computeAttentionItems(
  input: AttentionInput,
): AttentionItem[] {
  const { currentMember, posts, projects, projectTasks, members } = input;
  if (!currentMember) return [];

  const nameByKey = new Map<string, string>();
  for (const m of members) nameByKey.set(m.publicKey, m.displayName);

  const items: AttentionItem[] = [];

  // Exchanges waiting for the current member's confirmation. A post
  // in `awaiting_confirmation` has one party's signature on file via
  // `confirmedBy`; the other party still needs to sign for credits
  // to transfer.
  for (const p of posts) {
    if (p.status !== "awaiting_confirmation") continue;
    if (p.postedBy !== currentMember.publicKey && p.claimedBy !== currentMember.publicKey) {
      continue;
    }
    if (p.confirmedBy.includes(currentMember.publicKey)) continue;

    // Whoever isn't me is the counterparty.
    const counterpartyKey =
      p.postedBy === currentMember.publicKey ? p.claimedBy : p.postedBy;
    const counterpartyName =
      (counterpartyKey && nameByKey.get(counterpartyKey)) ??
      "another community member";

    items.push({
      kind: "confirm_exchange",
      postId: p.id,
      postTitle: p.title,
      counterpartyName,
      createdAt: p.createdAt,
    });
  }

  // Project tasks the current member is the organizer of, which the
  // helper has marked complete and which still need the organizer's
  // confirmation. (Self-confirmation is rejected in
  // confirmProjectTaskCompletion; if completedBy === organizerKey
  // the task can't be confirmed by the same member, so it's not
  // really "needs my attention" — it needs another project member.)
  const projectByKey = new Map<string, Project>();
  for (const p of projects) projectByKey.set(p.id, p);

  for (const t of projectTasks) {
    if (t.status !== "awaiting_confirmation") continue;
    const project = projectByKey.get(t.projectId);
    if (!project) continue;
    if (
      project.organizerKey !== currentMember.publicKey &&
      !project.coOrganizerKeys.includes(currentMember.publicKey)
    )
      continue;
    if (t.completedBy === currentMember.publicKey) continue;

    const completerName =
      (t.completedBy && nameByKey.get(t.completedBy)) ??
      "another community member";

    items.push({
      kind: "confirm_task",
      projectId: project.id,
      taskId: t.id,
      projectTitle: project.title,
      taskTitle: t.title,
      completerName,
      createdAt: t.createdAt,
    });
  }

  // Private "still on it?" nudge — only surfaces to the claimer
  // when the task is `check_in_due` (past the private threshold
  // but not yet at the public "could use more hands" point). At
  // `needs_more_hands` the community-visible chip on the project
  // page is doing the work, so we don't double-up here.
  if (input.config) {
    for (const t of projectTasks) {
      if (t.assignedTo !== currentMember.publicKey) continue;
      if (t.dependencies.length > 0) {
        const projectTasksForDep = projectTasks.filter(
          (pt) => pt.projectId === t.projectId,
        );
        if (!canClaimTask(t, projectTasksForDep)) continue;
      }
      const checkInState = taskCheckInState(t, input.config, input.now);
      if (checkInState !== "check_in_due") continue;
      const project = projectByKey.get(t.projectId);
      if (!project) continue;
      // Use the moment the prompt actually became due (claim or
      // last ack, whichever's later) as the sort cursor so the
      // oldest-pending-nudge surfaces first.
      const anchor = Math.max(
        t.claimedAt ?? 0,
        t.checkInAcknowledgedAt ?? 0,
      );
      items.push({
        kind: "task_check_in",
        projectId: project.id,
        taskId: t.id,
        projectTitle: project.title,
        taskTitle: t.title,
        daysSinceClaim: daysSinceClaimHelper(t, input.now),
        createdAt: anchor,
      });
    }
  }

  // Your post was claimed — a helper is incoming (NEED) or someone
  // accepted your offer (OFFER). Informational, not blocking.
  // Shows until the exchange progresses past "claimed" status.
  for (const p of posts) {
    if (p.status !== "claimed") continue;
    if (p.postedBy !== currentMember.publicKey) continue;
    if (p.claimedBy === currentMember.publicKey) continue;

    const claimerName =
      (p.claimedBy && nameByKey.get(p.claimedBy)) ??
      "another community member";

    items.push({
      kind: "post_claimed",
      postId: p.id,
      postTitle: p.title,
      postType: p.type,
      claimerName,
      createdAt: p.createdAt,
    });
  }

  // Project deadline approaching — organizers get a heads-up
  // when a project they organize is within 3 days of deadline.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = input.now ?? Date.now();

  function isProjectOrganizer(project: Project, memberKey: string): boolean {
    return project.organizerKey === memberKey || project.coOrganizerKeys.includes(memberKey);
  }

  for (const p of projects) {
    if (!isProjectOrganizer(p, currentMember.publicKey)) continue;
    if (p.status === "completed" || p.status === "archived") continue;
    if (p.deadline && p.deadline > now && p.deadline - now <= 3 * DAY_MS) {
      items.push({
        kind: "project_deadline_approaching",
        projectId: p.id,
        projectTitle: p.title,
        daysRemaining: Math.ceil((p.deadline - now) / DAY_MS),
        createdAt: p.deadline - 3 * DAY_MS,
      });
    }
  }

  // Project paused too long — nudge the organizer if a project
  // has been paused for over 7 days. Pull-based, not a nag.
  for (const p of projects) {
    if (!isProjectOrganizer(p, currentMember.publicKey)) continue;
    if (p.status !== "paused") continue;
    // Use the latest activity timestamp as proxy for when it was paused
    // (we don't have a dedicated pausedAt field).
    const pausedDuration = now - p.createdAt; // rough — uses createdAt as fallback
    if (pausedDuration > 7 * DAY_MS) {
      items.push({
        kind: "project_paused_long",
        projectId: p.id,
        projectTitle: p.title,
        daysPaused: Math.floor(pausedDuration / DAY_MS),
        createdAt: p.createdAt,
      });
    }
  }

  // Someone vouched for you — actionable because vouch count
  // determines trust status (2 vouches = trusted). Time-boxed to
  // the last 7 days since there's no natural "progress" event
  // that would dismiss it (unlike post_claimed which clears when
  // the exchange moves forward).
  if (input.vouches) {
    const now = input.now ?? Date.now();
    const VOUCH_WINDOW = 7 * 24 * 60 * 60 * 1000;
    for (const v of input.vouches) {
      if (v.voucheeKey !== currentMember.publicKey) continue;
      if (now - v.createdAt > VOUCH_WINDOW) continue;
      const voucherName =
        nameByKey.get(v.voucherKey) ?? "another community member";
      items.push({
        kind: "vouch_received",
        voucherName,
        createdAt: v.createdAt,
      });
    }
  }

  // Co-organizer invitations addressed to the current member that
  // are still outstanding — no response, no revocation, not
  // expired. See `docs/co-organizer-invitations.md` §7.
  if (input.coorgInvitations && input.coorgInvitations.length > 0) {
    const responseByInvitationId = new Map<
      string,
      CoOrganizerInvitationResponse
    >();
    for (const r of input.coorgInvitationResponses ?? []) {
      responseByInvitationId.set(r.invitationId, r);
    }
    const revocationByInvitationId = new Map<
      string,
      CoOrganizerInvitationRevocation
    >();
    for (const r of input.coorgInvitationRevocations ?? []) {
      revocationByInvitationId.set(r.invitationId, r);
    }
    for (const invitation of input.coorgInvitations) {
      if (invitation.inviteeKey !== currentMember.publicKey) continue;
      if (responseByInvitationId.has(invitation.id)) continue;
      if (revocationByInvitationId.has(invitation.id)) continue;
      if (now >= invitation.expiresAt) continue;
      const project = projectByKey.get(invitation.projectId);
      // Without the project row we can't render a meaningful
      // attention item — drop quietly. This shouldn't happen in
      // practice (the invitation row references a project that
      // exists on this node), but federation could conceivably
      // deliver an invitation before the project.
      if (!project) continue;
      const inviterName =
        nameByKey.get(invitation.inviterKey) ?? "another community member";
      items.push({
        kind: "coorganizer_invitation_received",
        invitationId: invitation.id,
        projectId: invitation.projectId,
        projectTitle: project.title,
        inviterName,
        inviterKey: invitation.inviterKey,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      });
    }
  }

  // Newest items first. createdAt is the right cursor because all
  // record types use it for ordering elsewhere; using "moment the
  // first confirmation happened" would be more accurate but we
  // don't persist that timestamp.
  items.sort((a, b) => b.createdAt - a.createdAt);

  return items;
}
