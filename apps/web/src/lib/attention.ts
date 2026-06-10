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
  Event,
  EventCancellation,
  EventRsvpRow,
  Member,
  NodeConfig,
  Post,
  Project,
  ProjectTask,
} from "@/types";
import { canClaimTask } from "@/db/projects";
import type { SignedVouch } from "@/lib/vouch";
import { startOfUTCDay } from "./calendar";
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
    }
  | {
      /**
       * An event the current member RSVP'd "going" or "maybe" to
       * starts today (UTC). Per `docs/community-events.md` §8.1 this
       * is pull-only and matches the project-deadline shape — no
       * urgency theater, just "here's what's on for you today."
       */
      kind: "event_today";
      eventId: string;
      title: string;
      startsAt: number;
      location: string;
      deepLink: string;
      createdAt: number;
    }
  | {
      /**
       * An event the current member RSVP'd "going" or "maybe" to was
       * cancelled. Per §8.2 surfaces for 7 days from the cancellation,
       * carries the reason (may be empty) and an event-page deep link.
       */
      kind: "event_cancelled";
      eventId: string;
      eventTitle: string;
      cancelledAt: number;
      reason: string;
      deepLink: string;
      createdAt: number;
    }
  | {
      /**
       * Organizer-only: an event the current member created has a
       * non-null capacity and the local "going" count has reached it.
       * Per §8.3 the cap is a planning aid for the organizer, not a
       * public "sold out" signal — only the organizer sees this.
       */
      kind: "event_capacity_reached";
      eventId: string;
      title: string;
      capacity: number;
      deepLink: string;
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
  /** Community events visible on this node — feeds the three event
   *  attention items (`event_today`, `event_cancelled`,
   *  `event_capacity_reached`). Optional so callers that don't yet
   *  read events keep working. */
  events?: readonly Event[];
  /** Local-only RSVP rows. The `event_today` and `event_cancelled`
   *  queries scope to the current member's "going" / "maybe" rows. */
  eventRsvps?: readonly EventRsvpRow[];
  /** Signed cancellation rows. The `event_cancelled` query reads these;
   *  cancelled events are also suppressed from `event_today`. */
  eventCancellations?: readonly EventCancellation[];
  /** PR F: the set of members the current blocker has actively blocked.
   *  Items whose subject is a blocked party are suppressed per
   *  docs/blocking.md §6 row "Attention rail items (a)" — the blocker
   *  is not pulled back toward content from the very member they
   *  blocked. Default empty set when omitted (caller doesn't read
   *  blocks or there's no current member). */
  blockedKeys?: ReadonlySet<string>;
  now?: number;
}

export function computeAttentionItems(
  input: AttentionInput,
): AttentionItem[] {
  const { currentMember, posts, projects, projectTasks, members } = input;
  if (!currentMember) return [];
  // PR F: suppress items whose subject is a blocked member per
  // docs/blocking.md §6 row "Attention rail items (a)" + §6.2. The
  // empty-set fallback keeps callers that don't yet pass `blockedKeys`
  // (tests, old call sites) working unchanged.
  const blockedKeys = input.blockedKeys ?? new Set<string>();

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
    // PR F: skip if the counterparty is a blocked member.
    if (counterpartyKey && blockedKeys.has(counterpartyKey)) continue;
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
    // PR F: skip when the task completer is a blocked member.
    if (t.completedBy && blockedKeys.has(t.completedBy)) continue;

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
      const projectTasksForDep = projectTasks.filter(
        (pt) => pt.projectId === t.projectId,
      );
      if (t.dependencies.length > 0) {
        if (!canClaimTask(t, projectTasksForDep)) continue;
      }
      const checkInState = taskCheckInState(
        t,
        input.config,
        projectTasksForDep,
        input.now,
      );
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
    // PR F: skip when the claimer is a blocked member.
    if (p.claimedBy && blockedKeys.has(p.claimedBy)) continue;

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
      // PR F: skip when the voucher is a blocked member.
      if (blockedKeys.has(v.voucherKey)) continue;
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
      // PR F: skip when the inviter is a blocked member.
      if (blockedKeys.has(invitation.inviterKey)) continue;
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

  // Community events — three items per `docs/community-events.md` §8.
  // All three are pull-only and operate on local-only data; dismissals
  // (per §8 dismissal lifecycle) live in the same local-storage layer
  // the existing items use (we don't add new dismissal plumbing here).
  if (input.events && input.events.length > 0) {
    const cancellationByEventId = new Map<string, EventCancellation>();
    for (const c of input.eventCancellations ?? []) {
      cancellationByEventId.set(c.eventId, c);
    }
    const myRsvpByEventId = new Map<string, EventRsvpRow>();
    for (const r of input.eventRsvps ?? []) {
      if (r.memberKey !== currentMember.publicKey) continue;
      myRsvpByEventId.set(r.eventId, r);
    }
    const eventById = new Map<string, Event>();
    for (const e of input.events) eventById.set(e.id, e);

    const todayStart = startOfUTCDay(now);
    const todayEnd = todayStart + DAY_MS;
    const SEVEN_DAYS_MS = 7 * DAY_MS;

    // event_today — non-cancelled events starting today (UTC), for
    // members who RSVP'd "going" or "maybe". Carries enough fields
    // to render the row + deep link.
    for (const ev of input.events) {
      if (cancellationByEventId.has(ev.id)) continue;
      if (ev.startsAt < todayStart || ev.startsAt >= todayEnd) continue;
      const myRsvp = myRsvpByEventId.get(ev.id);
      if (!myRsvp) continue;
      if (myRsvp.status !== "going" && myRsvp.status !== "maybe") continue;
      // PR F: skip events organized by a blocked member.
      if (blockedKeys.has(ev.createdBy)) continue;
      items.push({
        kind: "event_today",
        eventId: ev.id,
        title: ev.title,
        startsAt: ev.startsAt,
        location: ev.location,
        deepLink: `/events/${ev.id}`,
        // Sort cursor: the event's start. Today's events stack
        // alongside other same-day createdAt items reasonably.
        createdAt: ev.startsAt,
      });
    }

    // event_cancelled — surface for 7 days from the cancellation, to
    // members who RSVP'd "going" or "maybe". Members who said
    // "not_going" weren't planning to be there; the doc §8.2 names
    // them out of scope deliberately.
    for (const cancellation of input.eventCancellations ?? []) {
      if (now - cancellation.cancelledAt > SEVEN_DAYS_MS) continue;
      const myRsvp = myRsvpByEventId.get(cancellation.eventId);
      if (!myRsvp) continue;
      if (myRsvp.status !== "going" && myRsvp.status !== "maybe") continue;
      const ev = eventById.get(cancellation.eventId);
      // The event row is needed to render the title. If federation
      // delivered the cancellation before the event row we just drop
      // quietly — same shape as the coorg-invitation missing-project
      // branch above.
      if (!ev) continue;
      // PR F: skip cancellations of events organized by a blocked member.
      if (blockedKeys.has(ev.createdBy)) continue;
      items.push({
        kind: "event_cancelled",
        eventId: cancellation.eventId,
        eventTitle: ev.title,
        cancelledAt: cancellation.cancelledAt,
        reason: cancellation.reason,
        deepLink: `/events/${cancellation.eventId}`,
        createdAt: cancellation.cancelledAt,
      });
    }

    // event_capacity_reached — organizer-only. Reads from the local
    // RSVP roster (not just the current member's row, so we walk
    // `eventRsvps` directly rather than `myRsvpByEventId`). Peer-node
    // RSVPs are out of scope by design — see §8.3.
    const goingCountByEventId = new Map<string, number>();
    for (const r of input.eventRsvps ?? []) {
      if (r.status !== "going") continue;
      goingCountByEventId.set(
        r.eventId,
        (goingCountByEventId.get(r.eventId) ?? 0) + 1,
      );
    }
    for (const ev of input.events) {
      if (ev.createdBy !== currentMember.publicKey) continue;
      if (ev.capacity === null) continue;
      if (cancellationByEventId.has(ev.id)) continue;
      const goingCount = goingCountByEventId.get(ev.id) ?? 0;
      if (goingCount < ev.capacity) continue;
      items.push({
        kind: "event_capacity_reached",
        eventId: ev.id,
        title: ev.title,
        capacity: ev.capacity,
        deepLink: `/events/${ev.id}`,
        // Sort by the event's own createdAt; capacity-reached doesn't
        // have a moment-it-happened timestamp without tracking each
        // RSVP transition, which we deliberately don't.
        createdAt: ev.createdAt,
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
