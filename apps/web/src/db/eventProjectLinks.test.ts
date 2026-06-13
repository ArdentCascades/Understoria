/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  WorkDayLinkError,
  getLinkForEvent,
  listLinksForProject,
  scheduleProjectWorkDay,
  type ScheduleProjectWorkDayInput,
} from "./eventProjectLinks";
import { db, SETTING_KEYS, setSetting } from "./database";
import { generateKeyPair } from "@/lib/crypto";
import type { EventProjectLinkRow, Project } from "@/types";

const NODE = "node_workday_test";

async function reset() {
  await Promise.all([
    db.events.clear(),
    db.eventCancellations.clear(),
    db.eventProjectLinks.clear(),
    db.projects.clear(),
    db.projectActivity.clear(),
    db.outbox.clear(),
    db.settings.clear(),
  ]);
  // enqueueEvent no-ops unless a community node is configured.
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
}

interface OrganizerFixture {
  organizerKey: string;
  organizerSecretKey: string;
}

function makeOrganizer(): OrganizerFixture {
  const kp = generateKeyPair();
  return { organizerKey: kp.publicKey, organizerSecretKey: kp.secretKey };
}

async function putProject(over: Partial<Project> & { id: string }): Promise<Project> {
  const base: Project = {
    id: over.id,
    title: `Project ${over.id}`,
    description: "",
    category: "infrastructure",
    organizerKey: "someone",
    coOrganizerKeys: [],
    status: "active",
    targetHours: 10,
    contributedHours: 0,
    deadline: null,
    createdAt: 0,
    completedAt: null,
    pauseNote: null,
    locationZone: "",
    tags: [],
    nodeId: NODE,
    templateId: null,
  };
  const project = { ...base, ...over };
  await db.projects.put(project);
  return project;
}

function workDayInput(
  organizer: OrganizerFixture,
  projectId: string,
  over: Partial<ScheduleProjectWorkDayInput> = {},
): ScheduleProjectWorkDayInput {
  return {
    title: "Saturday build day",
    description: "",
    category: "skills-exchange",
    startsAt: 5_000_000,
    endsAt: null,
    location: "Community room",
    capacity: null,
    templateId: null,
    organizerKey: organizer.organizerKey,
    organizerSecretKey: organizer.organizerSecretKey,
    nodeId: NODE,
    now: 1_000_000,
    projectId,
    ...over,
  };
}

describe("scheduleProjectWorkDay", () => {
  beforeEach(reset);

  it("creates the event, writes exactly one link, and logs the activity for the primary organizer", async () => {
    const organizer = makeOrganizer();
    await putProject({ id: "p1", organizerKey: organizer.organizerKey });

    const event = await scheduleProjectWorkDay(workDayInput(organizer, "p1"));

    // The event itself persisted and federates like any other event.
    expect(await db.events.get(event.id)).toBeTruthy();

    // Exactly one link row, pointing event → project, attributed and
    // timestamped to the event.
    const links = await listLinksForProject("p1");
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      eventId: event.id,
      projectId: "p1",
      linkedBy: organizer.organizerKey,
      createdAt: event.createdAt,
    });
    expect(await getLinkForEvent(event.id)).not.toBeNull();

    // A work_day_scheduled activity was logged on the project.
    const activity = await db.projectActivity
      .where("projectId")
      .equals("p1")
      .toArray();
    expect(activity).toHaveLength(1);
    expect(activity[0].type).toBe("work_day_scheduled");
    expect(activity[0].data).toMatchObject({ eventId: event.id });
  });

  it("accepts a co-organizer", async () => {
    const primary = makeOrganizer();
    const coorg = makeOrganizer();
    await putProject({
      id: "p1",
      organizerKey: primary.organizerKey,
      coOrganizerKeys: [coorg.organizerKey],
    });

    const event = await scheduleProjectWorkDay(workDayInput(coorg, "p1"));
    expect(await getLinkForEvent(event.id)).not.toBeNull();
    expect((await listLinksForProject("p1"))[0].linkedBy).toBe(
      coorg.organizerKey,
    );
  });

  it("rejects a non-organizer and writes nothing — no event, no link, no outbox row", async () => {
    const organizer = makeOrganizer();
    const stranger = makeOrganizer();
    await putProject({ id: "p1", organizerKey: organizer.organizerKey });

    await expect(
      scheduleProjectWorkDay(workDayInput(stranger, "p1")),
    ).rejects.toBeInstanceOf(WorkDayLinkError);

    expect(await db.events.count()).toBe(0);
    expect(await db.eventProjectLinks.count()).toBe(0);
    expect(await db.outbox.count()).toBe(0);
    expect(await db.projectActivity.count()).toBe(0);
  });

  it("rejects when the project does not exist locally", async () => {
    const organizer = makeOrganizer();
    await expect(
      scheduleProjectWorkDay(workDayInput(organizer, "missing")),
    ).rejects.toMatchObject({ code: "project_not_found" });
  });

  it("LOAD-BEARING: the outbox grows by exactly 1 (the event enqueue), never by a link record", async () => {
    const organizer = makeOrganizer();
    await putProject({ id: "p1", organizerKey: organizer.organizerKey });

    expect(await db.outbox.count()).toBe(0);
    await scheduleProjectWorkDay(workDayInput(organizer, "p1"));

    const rows = await db.outbox.toArray();
    expect(rows).toHaveLength(1);
    // The only enqueued record is the federated event — the link never
    // touches the outbox, by construction.
    expect(rows[0].kind).toBe("event");
  });

  it("supports several work days for the same project, one link each", async () => {
    const organizer = makeOrganizer();
    await putProject({ id: "p1", organizerKey: organizer.organizerKey });

    const a = await scheduleProjectWorkDay(
      workDayInput(organizer, "p1", { title: "Build day 1", startsAt: 5_000_000 }),
    );
    const b = await scheduleProjectWorkDay(
      workDayInput(organizer, "p1", { title: "Build day 2", startsAt: 6_000_000 }),
    );

    const links = await listLinksForProject("p1");
    expect(links).toHaveLength(2);
    expect(new Set(links.map((l) => l.eventId))).toEqual(
      new Set([a.id, b.id]),
    );
    // Each event has exactly one link.
    expect(await getLinkForEvent(a.id)).not.toBeNull();
    expect(await getLinkForEvent(b.id)).not.toBeNull();
  });
});

// --------------------------------------------------------------------------
// Type-level negatives — compile-time assertions that lock in the
// local-only design. The link MUST NEVER acquire a federation path.
// --------------------------------------------------------------------------

describe("event_project_link is local-only (type-level negatives)", () => {
  it('rejects "event_project_link" as an OutboxRow kind', () => {
    type OutboxKind = import("./database").OutboxRow["kind"];
    // @ts-expect-error — the discriminator must not be assignable to the union.
    const _bad: OutboxKind = "event_project_link";
    void _bad;
  });

  it("has no `enqueueEventProjectLink` helper exported from lib/outbox", async () => {
    const outbox = await import("@/lib/outbox");
    expect(
      (outbox as unknown as Record<string, unknown>).enqueueEventProjectLink,
    ).toBeUndefined();
  });

  it("has no `pullFederatedEventProjectLinks` helper exported from lib/federationSync", async () => {
    const fed = await import("@/lib/federationSync");
    // @ts-expect-error — the function does not exist, and the absence is load-bearing.
    const fn = fed.pullFederatedEventProjectLinks;
    expect(fn).toBeUndefined();
  });

  it("EventProjectLinkRow carries no signature and no nodeId", () => {
    const row: EventProjectLinkRow = {
      id: "l1",
      eventId: "e1",
      projectId: "p1",
      linkedBy: "k",
      createdAt: 0,
    };
    // @ts-expect-error — local-only rows are never signed.
    void row.signature;
    // @ts-expect-error — local-only rows carry no origin-node stamp.
    void row.nodeId;
    expect(row.id).toBe("l1");
  });
});
