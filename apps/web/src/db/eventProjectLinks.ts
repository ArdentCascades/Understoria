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
import { db } from "./database";
import { uuid } from "@/lib/id";
import { createEvent, type CreateEventInput } from "./events";
import { isOrganizer, logActivity } from "./projects";
import type { Event, EventProjectLinkRow } from "@/types";

/**
 * Project work days — the LOCAL-ONLY link between a federated event and
 * a local-only project. See `docs/community-events.md` ("Project work
 * days") + `docs/project-ux-plans.md` §10 for the federation analysis.
 *
 * The asymmetry this module exists to hold: events federate, projects do
 * not. The link therefore lives only on the node that created it — peers
 * receive a plain community event with no project pointer.
 *
 * There is NO enqueue helper and NO pull helper, and both absences are
 * load-bearing, not omissions: no `enqueueEventProjectLink` in
 * `lib/outbox.ts`, no `pullFederatedEventProjectLinks` in
 * `lib/federationSync.ts`, and the `OutboxRow.kind` union rejects
 * `"event_project_link"` at the type level. `eventProjectLinks.test.ts`
 * locks all three negatives in. `events.ts` itself stays untouched — the
 * federated layer never learns that links exist.
 */

export class WorkDayLinkError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export interface ScheduleProjectWorkDayInput extends CreateEventInput {
  /** The local-only project this event is a work day for. */
  projectId: string;
}

/**
 * Create a community event AND link it to a project as a work day, in a
 * single transaction. Re-validates organizer/co-organizer authority on
 * the project before doing anything — the UI banner is a convenience,
 * this gate is the guarantee. A non-organizer (e.g. someone who
 * hand-crafted `/events/new?projectId=…`) is rejected here, so no event
 * and no link are written.
 *
 * The event signs, persists, and enqueues for federation exactly as a
 * plain `createEvent` would (composed into the ambient transaction). The
 * link row and the `work_day_scheduled` activity are local-only and
 * never touch the outbox.
 */
export async function scheduleProjectWorkDay(
  input: ScheduleProjectWorkDayInput,
): Promise<Event> {
  const { projectId, ...eventInput } = input;
  return db.transaction(
    "rw",
    [
      db.projects,
      db.projectActivity,
      db.events,
      db.outbox,
      db.settings,
      db.eventProjectLinks,
    ],
    async () => {
      const project = await db.projects.get(projectId);
      if (!project) {
        throw new WorkDayLinkError(
          "project_not_found",
          "Project not found on this node.",
        );
      }
      if (!isOrganizer(project, eventInput.organizerKey)) {
        throw new WorkDayLinkError(
          "not_organizer",
          "Only an organizer or co-organizer can schedule a work day for this project.",
        );
      }

      // createEvent runs its own transaction over a subset of this
      // scope, so Dexie composes it into the ambient one. If it rejects
      // (past start, bad signature), the whole transaction aborts and no
      // link is written — exactly the right all-or-nothing behavior.
      const event = await createEvent(eventInput);

      // One link per event. The event is freshly minted here so a real
      // collision can't occur; the guard makes the invariant explicit
      // and keeps the body idempotent if the transaction is retried.
      const existing = await db.eventProjectLinks
        .where("eventId")
        .equals(event.id)
        .first();
      if (!existing) {
        const link: EventProjectLinkRow = {
          id: uuid(),
          eventId: event.id,
          projectId,
          linkedBy: eventInput.organizerKey,
          createdAt: event.createdAt,
        };
        await db.eventProjectLinks.put(link);
        await logActivity(
          projectId,
          "work_day_scheduled",
          eventInput.organizerKey,
          {
            eventId: event.id,
            eventTitle: event.title,
            startsAt: event.startsAt,
          },
          eventInput.nodeId,
        );
      }

      return event;
    },
  );
}

/** Every work-day link for a project (newest-agnostic; caller sorts). */
export async function listLinksForProject(
  projectId: string,
): Promise<EventProjectLinkRow[]> {
  return db.eventProjectLinks.where("projectId").equals(projectId).toArray();
}

/** The work-day link for an event, or `null` if the event isn't linked. */
export async function getLinkForEvent(
  eventId: string,
): Promise<EventProjectLinkRow | null> {
  const row = await db.eventProjectLinks
    .where("eventId")
    .equals(eventId)
    .first();
  return row ?? null;
}
