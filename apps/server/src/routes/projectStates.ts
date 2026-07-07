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
import type { FastifyInstance } from "fastify";
import {
  verifyProjectState,
  verifyTaskState,
} from "@understoria/shared/crypto";
import type { ProjectState } from "@understoria/shared/types";
import type { ProjectStateStore, TaskStateStore } from "../db.js";
import { parseProjectState, parseTaskState } from "../validate.js";

interface Deps {
  projectStore: ProjectStateStore;
  taskStore: TaskStateStore;
}

/**
 * Project & participation federation Phase 1
 * (docs/project-federation.md §§3–4). These are the node's first
 * MUTABLE record kinds: signed last-writer-wins state records that
 * REPLACE the stored row when a strictly-newer version passes the
 * authority rules below. Everything is checked against the STORED
 * version, never the incoming one, so a hostile update cannot grant
 * itself authority in the same write.
 *
 * POST /project-states
 *   - 201 { stored: true }  — accepted (genesis or newer authorized version)
 *   - 200 { stored: false } — stale (updatedAt not strictly newer); the
 *                             idempotent answer the outbox expects
 *   - 400 — malformed body
 *   - 403 — signer lacks authority (genesis not self-organized; update
 *           not from stored organizer/co-organizer; organizer handoff
 *           not signed by the stored organizer)
 *   - 422 — signature doesn't verify
 *
 * POST /task-states — same contract, plus:
 *   - 409 { error: "unknown_project" } — task arrived before its
 *     project; retryable (the same device queues the project first,
 *     so outbox ordering self-heals).
 *
 * GET /project-states, GET /task-states
 *   - Query: ?since=<ms>&sinceId=<id>&limit=<n>, cursor on `updatedAt`
 *     (composite pair semantics — docs/composite-federation-cursors.md).
 *     An updated row re-enters every puller's window by construction:
 *     that IS the LWW propagation.
 *
 * Accepted residual (threat model §7): a task's claimer can vandalize
 * non-claim fields of the task they hold — the server does not diff
 * fields. The comment trail and the organizer's next LWW write repair
 * it at community scale.
 */
export async function registerProjectStateRoutes(
  app: FastifyInstance,
  { projectStore, taskStore }: Deps,
): Promise<void> {
  const isOrganizer = (project: ProjectState, signer: string): boolean =>
    signer === project.organizerKey ||
    project.coOrganizerKeys.includes(signer);

  app.post("/project-states", async (req, reply) => {
    const parsed = parseProjectState(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;

    if (!verifyProjectState(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    const stored = projectStore.get(record.id);
    if (!stored) {
      // Genesis establishes the authority anchor: only a project whose
      // first version is signed by its own organizer is accepted.
      if (record.signerKey !== record.organizerKey) {
        reply.code(403);
        return { error: "not_authorized", reason: "genesis_not_organizer" };
      }
      projectStore.upsert(record);
      reply.code(201);
      return { stored: true, id: record.id };
    }

    if (record.updatedAt <= stored.updatedAt) {
      reply.code(200);
      return { stored: false, id: record.id };
    }

    if (!isOrganizer(stored, record.signerKey)) {
      reply.code(403);
      return { error: "not_authorized", reason: "not_project_organizer" };
    }
    // Organizer handoff: only a version the STORED organizer signed may
    // name a different organizer. A co-organizer can change anything
    // else but cannot seize the project.
    if (
      record.organizerKey !== stored.organizerKey &&
      record.signerKey !== stored.organizerKey
    ) {
      reply.code(403);
      return { error: "not_authorized", reason: "handoff_not_organizer" };
    }

    projectStore.upsert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  app.post("/task-states", async (req, reply) => {
    const parsed = parseTaskState(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;

    if (!verifyTaskState(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    // Task authority derives from the STORED project — without it
    // there is nothing to check against. 409 (not 4xx-permanent) so
    // the sender's outbox retries after the project record lands.
    const project = projectStore.get(record.projectId);
    if (!project) {
      reply.code(409);
      return { error: "unknown_project", projectId: record.projectId };
    }

    const signer = record.signerKey;
    const org = isOrganizer(project, signer);
    const stored = taskStore.get(record.id);

    if (stored && record.updatedAt <= stored.updatedAt) {
      reply.code(200);
      return { stored: false, id: record.id };
    }

    // Claimer rules (checked only for non-organizers): you may write a
    // task you hold (`stored.assignedTo === signer` — edit, complete,
    // unclaim) or claim an open one (`stored.assignedTo == null &&
    // incoming.assignedTo === signer`). Genesis by a non-organizer is
    // the open-task claim case with no stored row.
    const claimAllowed = stored
      ? stored.assignedTo === signer ||
        (stored.assignedTo == null && record.assignedTo === signer)
      : record.assignedTo === signer;
    if (!org && !claimAllowed) {
      reply.code(403);
      return { error: "not_authorized", reason: "not_organizer_or_claimer" };
    }

    taskStore.upsert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  const parseListQuery = (q: {
    since?: string;
    sinceId?: string;
    limit?: string;
  }) => {
    const since = q.since ? Number.parseInt(q.since, 10) : undefined;
    const limit = q.limit ? Number.parseInt(q.limit, 10) : undefined;
    return {
      since:
        since !== undefined && Number.isFinite(since) && since >= 0
          ? since
          : undefined,
      sinceId: q.sinceId && q.sinceId.length > 0 ? q.sinceId : undefined,
      limit:
        limit !== undefined && Number.isFinite(limit) && limit > 0
          ? limit
          : undefined,
    };
  };

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/project-states", async (req) => {
    const projectStates = projectStore.list(parseListQuery(req.query));
    return { count: projectStates.length, projectStates };
  });

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/task-states", async (req) => {
    const taskStates = taskStore.list(parseListQuery(req.query));
    return { count: taskStates.length, taskStates };
  });
}
