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
import { uuid } from "@/lib/id";
import { db } from "./database";
import { getNodeConfig } from "./nodeConfig";
import { logActivity } from "./projects";
import { ADOPTION_MIN_DELIBERATION_DAYS } from "@/lib/autoCloseProposals";
import type { Proposal, ProjectAdoptionPayload } from "@/types";

// Orphaned-project adoption — see `docs/project-adoption.md`. When a
// project's primary organizer has gone quiet, governance is frozen:
// co-organizers can run the day-to-day, but no new co-organizers, no
// handoff, no archive. Adoption is the community installing stewardship
// that no individual has the standing to grant — the one role transition
// that happens ABOUT someone who isn't there.
//
// It is therefore the exception to every consent-ceremonied transition
// in the codebase, and compensates with structure: a long quiet-period
// precondition, a 14-day notice floor, an always-available one-tap
// cancel for the returning primary, and demotion-not-removal so they
// keep working authority and a path back.
//
// LOCAL governance act: adoption writes no wire records — same
// consistency domain as proposals and votes. Now that project state
// federates (docs/project-federation.md), the honest limit: the
// community node's stored ProjectState still names the absent
// organizer, and an organizerKey change is accepted only from THEIR
// signature — an adopter's takeover never propagates through the node.
// An adopter who was already a co-organizer can still federate
// day-to-day updates; one who wasn't federates nothing until the
// returning primary signs a real handoff. Recorded in
// docs/project-federation.md §4.

const DAY_MS = 24 * 60 * 60 * 1000;

/** Stored on the proposal when it closes because the sitting primary
 *  turned out to be present — both the implicit (activity after filing)
 *  and explicit ("I'm still here") paths use it. Solidarity-framed. */
export const ADOPTION_PRESENCE_REASON =
  "Closed without effect — the organizer is active again.";

export class AdoptionError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * The most recent organizer-authored activity timestamp on a project, or
 * `null` if the organizer has never logged any. A PROXY for presence:
 * `logActivity` stamps `actorKey` on creation, pause/resume, complete,
 * archive, task adds, confirmations, announcements, handoffs, and
 * invitations — but NOT on task edits, reorders, or dependency changes,
 * and never on reads (reads are deliberately untracked,
 * no-read-receipts). So this can under-count a silently-active primary;
 * the notice item and the always-available cancel are the mitigation.
 */
export async function lastOrganizerActivityAt(
  projectId: string,
  organizerKey: string,
): Promise<number | null> {
  const rows = await db.projectActivity
    .where("projectId")
    .equals(projectId)
    .toArray();
  let latest: number | null = null;
  for (const row of rows) {
    if (row.actorKey !== organizerKey) continue;
    if (latest === null || row.createdAt > latest) latest = row.createdAt;
  }
  return latest;
}

/** True if the given member logged any activity on the project strictly
 *  after `afterTs` — the presence signal that voids an adoption. */
async function hasActivityAfter(
  projectId: string,
  memberKey: string,
  afterTs: number,
): Promise<boolean> {
  const rows = await db.projectActivity
    .where("projectId")
    .equals(projectId)
    .toArray();
  return rows.some((r) => r.actorKey === memberKey && r.createdAt > afterTs);
}

/** The single open adoption proposal for a project, or `null`. */
export async function openAdoptionProposalForProject(
  projectId: string,
): Promise<Proposal | null> {
  const open = await db.proposals
    .where("[kind+status]")
    .equals(["proposal", "open"])
    .toArray();
  for (const p of open) {
    if (p.category !== "project_adoption") continue;
    try {
      const payload = JSON.parse(p.payload) as ProjectAdoptionPayload;
      if (payload.projectId === projectId) return p;
    } catch {
      // Malformed payload — not a match.
    }
  }
  return null;
}

export interface FileAdoptionProposalInput {
  projectId: string;
  /** The member offering to take this on. Adoption is self-nomination,
   *  so this is also `proposedPrimaryKey`. */
  proposerKey: string;
  rationale: string;
  nodeId: string;
  now?: number;
}

/**
 * File a community-adoption proposal. All guards enforced here (and
 * re-checked at execution): project exists and isn't archived; the
 * proposer isn't the current primary (that's a handoff); the primary
 * has been quiet for at least `adoptionQuietDays`; at most one open
 * adoption proposal per project; a non-empty rationale.
 */
export async function fileAdoptionProposal(
  input: FileAdoptionProposalInput,
): Promise<Proposal> {
  const rationale = input.rationale.trim();
  if (!rationale) {
    throw new AdoptionError(
      "rationale_required",
      "Say why you're offering to take this on.",
    );
  }
  const now = input.now ?? Date.now();

  return db.transaction(
    "rw",
    [db.proposals, db.projects, db.projectActivity, db.nodeConfig],
    async () => {
      const project = await db.projects.get(input.projectId);
      if (!project) {
        throw new AdoptionError("project_not_found", "Project not found.");
      }
      if (project.status === "archived") {
        throw new AdoptionError(
          "project_archived",
          "An archived project can't be adopted.",
        );
      }
      if (project.organizerKey === input.proposerKey) {
        throw new AdoptionError(
          "already_primary",
          "You're already this project's organizer.",
        );
      }
      const existing = await openAdoptionProposalForProject(input.projectId);
      if (existing) {
        throw new AdoptionError(
          "already_open",
          "There's already an open stewardship proposal for this project.",
        );
      }

      const config = await getNodeConfig(input.nodeId);
      const lastActivity = await lastOrganizerActivityAt(
        input.projectId,
        project.organizerKey,
      );
      const quietCutoff = now - config.adoptionQuietDays * DAY_MS;
      if (lastActivity !== null && lastActivity > quietCutoff) {
        throw new AdoptionError(
          "not_quiet",
          "This project's organizer has been active recently.",
        );
      }

      const payload: ProjectAdoptionPayload = {
        projectId: input.projectId,
        projectTitle: project.title,
        proposedPrimaryKey: input.proposerKey,
        sittingPrimaryKey: project.organizerKey,
        rationale,
        lastOrganizerActivityAt: lastActivity,
      };
      const proposal: Proposal = {
        id: uuid(),
        nodeId: input.nodeId,
        kind: "proposal",
        category: "project_adoption",
        // Fixed by the category (like disputes fix "easy"); reversal is
        // a handoff back or a second adoption — real effort, not
        // rebuild-grade. The social weight is carried by the guards, not
        // by an impact reflection.
        reversibilityTier: "moderate",
        title: project.title,
        description: rationale,
        payload: JSON.stringify(payload),
        proposerKey: input.proposerKey,
        status: "open",
        createdAt: now,
        closedAt: null,
        closedReason: null,
        impactReflection: null,
        disputePostId: null,
      };
      await db.proposals.put(proposal);
      return proposal;
    },
  );
}

export type ExecuteAdoptionResult =
  | { kind: "executed"; proposal: Proposal }
  | { kind: "voided"; proposal: Proposal };

/**
 * Execute a passed adoption proposal: flip the project's primary
 * organizer, demoting the old primary into `coOrganizerKeys` (demote,
 * never drop — they keep working authority and a path back). Re-checks
 * every guard, so it's safe as the single execution path for both the
 * consensus banner and the manual record-outcome flow.
 *
 * Returns `{ kind: "voided" }` (proposal closed `withdrawn`, project
 * untouched) when the sitting primary turns out to be present.
 */
export async function executeAdoptionProposal(
  proposalId: string,
  executorKey: string,
  now: number = Date.now(),
): Promise<ExecuteAdoptionResult> {
  return db.transaction(
    "rw",
    [db.proposals, db.projects, db.projectActivity, db.nodeConfig],
    async () => {
      const proposal = await db.proposals.get(proposalId);
      if (!proposal || proposal.category !== "project_adoption") {
        throw new AdoptionError(
          "not_found",
          "Adoption proposal not found.",
        );
      }
      if (proposal.status !== "open") {
        throw new AdoptionError(
          "already_closed",
          "This proposal is already closed.",
        );
      }
      const payload = JSON.parse(proposal.payload) as ProjectAdoptionPayload;

      // Deliberation floor — hard-enforced here regardless of path, so
      // even a manual "record outcome: passed" cannot shortcut the
      // absent member's notice window.
      const config = await getNodeConfig(proposal.nodeId);
      const minDays = Math.max(
        config.proposalDeliberationDays,
        ADOPTION_MIN_DELIBERATION_DAYS,
      );
      if (now - proposal.createdAt < minDays * DAY_MS) {
        throw new AdoptionError(
          "too_soon",
          "This stewardship proposal hasn't been open long enough yet.",
        );
      }

      // Presence re-check — any sitting-primary activity since filing
      // voids the proposal. Doing anything counts as being here.
      const present = await hasActivityAfter(
        payload.projectId,
        payload.sittingPrimaryKey,
        proposal.createdAt,
      );
      if (present) {
        const voided: Proposal = {
          ...proposal,
          status: "withdrawn",
          closedAt: now,
          closedReason: ADOPTION_PRESENCE_REASON,
        };
        await db.proposals.put(voided);
        return { kind: "voided", proposal: voided };
      }

      const project = await db.projects.get(payload.projectId);
      if (!project) {
        throw new AdoptionError("project_not_found", "Project not found.");
      }
      if (project.status === "archived") {
        throw new AdoptionError(
          "project_archived",
          "An archived project can't be adopted.",
        );
      }
      if (project.organizerKey !== payload.sittingPrimaryKey) {
        throw new AdoptionError(
          "stewardship_changed",
          "This project's stewardship has changed since this was filed.",
        );
      }

      // Flip primary; demote the old primary into the co-organizer list
      // (mirroring handoffOrganizer's shape) and drop the new primary
      // from it if they were already a co-organizer.
      const nextCoOrganizers = Array.from(
        new Set([
          ...project.coOrganizerKeys.filter(
            (k) => k !== payload.proposedPrimaryKey,
          ),
          payload.sittingPrimaryKey,
        ]),
      );
      await db.projects.put({
        ...project,
        organizerKey: payload.proposedPrimaryKey,
        coOrganizerKeys: nextCoOrganizers,
      });

      await logActivity(
        payload.projectId,
        "adopted_by_community",
        executorKey,
        {
          fromKey: payload.sittingPrimaryKey,
          toKey: payload.proposedPrimaryKey,
          proposalId,
        },
        proposal.nodeId,
      );

      const passed: Proposal = {
        ...proposal,
        status: "passed",
        closedAt: now,
        closedReason: null,
      };
      await db.proposals.put(passed);
      return { kind: "executed", proposal: passed };
    },
  );
}

/**
 * The courtesy cancel path — the sitting primary taps "I'm still here"
 * and the proposal closes `withdrawn`, no explanation. Reading is
 * untracked, so a primary who returns and only looks would otherwise
 * stay "quiet"; this lets them void the proposal without having to
 * perform an action just to register presence.
 */
export async function withdrawAdoptionAsPresent(
  proposalId: string,
  callerKey: string,
): Promise<Proposal> {
  return db.transaction("rw", db.proposals, async () => {
    const proposal = await db.proposals.get(proposalId);
    if (!proposal || proposal.category !== "project_adoption") {
      throw new AdoptionError("not_found", "Adoption proposal not found.");
    }
    if (proposal.status !== "open") {
      throw new AdoptionError(
        "already_closed",
        "This proposal is already closed.",
      );
    }
    const payload = JSON.parse(proposal.payload) as ProjectAdoptionPayload;
    if (callerKey !== payload.sittingPrimaryKey) {
      throw new AdoptionError(
        "not_sitting_primary",
        "Only the project's current organizer can close this.",
      );
    }
    const updated: Proposal = {
      ...proposal,
      status: "withdrawn",
      closedAt: Date.now(),
      closedReason: ADOPTION_PRESENCE_REASON,
    };
    await db.proposals.put(updated);
    return updated;
  });
}
