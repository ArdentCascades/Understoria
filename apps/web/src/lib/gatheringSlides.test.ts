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
import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  buildGatheringSlides,
  hasActionableSlides,
  type GatheringSlidesInput,
} from "./gatheringSlides";
import type { Event, Member, Post, Project, ProjectTask } from "@/types";

const NOW = 1_000_000_000_000;
const ORIGIN = "https://hub.example";

function event(over: Partial<Event>): Event {
  return {
    id: "e1",
    kind: "event",
    title: "Skillshare",
    description: "",
    category: "education",
    startsAt: NOW + 3_600_000,
    endsAt: null,
    location: "Library",
    capacity: null,
    templateId: null,
    createdAt: NOW,
    createdBy: "org",
    nodeId: "n1",
    signature: "",
    ...over,
  };
}

function project(over: Partial<Project>): Project {
  return {
    id: "p1",
    title: "Garden",
    description: "",
    category: "infrastructure",
    organizerKey: "org",
    coOrganizerKeys: [],
    status: "active",
    targetHours: 10,
    contributedHours: 0,
    deadline: null,
    createdAt: NOW,
    completedAt: null,
    pauseNote: null,
    locationZone: "",
    tags: [],
    nodeId: "n1",
    templateId: null,
    ...over,
  } as Project;
}

function taskRow(over: Partial<ProjectTask>): ProjectTask {
  return {
    id: "t1",
    projectId: "p1",
    title: "Dig beds",
    description: "",
    category: "infrastructure",
    estimatedHours: 2,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 1000,
    createdAt: NOW,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
    actualHours: null,
    checkInAcknowledgedAt: null,
    ...over,
  } as ProjectTask;
}

function post(over: Partial<Post>): Post {
  return {
    id: "post1",
    type: "NEED",
    category: "food",
    title: "Need a ride",
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "rosa",
    claimedBy: null,
    status: "open",
    createdAt: NOW,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId: "n1",
    signature: "",
    ...over,
  } as Post;
}

function member(publicKey: string, displayName: string): Member {
  return {
    publicKey,
    displayName,
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 0,
    vouchedBy: [],
    createdAt: NOW,
    nodeId: "n1",
    locationZone: "",
  };
}

function baseInput(over: Partial<GatheringSlidesInput> = {}): GatheringSlidesInput {
  return {
    origin: ORIGIN,
    events: [],
    eventCancellations: [],
    eventRsvps: [],
    projects: [],
    projectTasks: [],
    posts: [],
    members: [],
    currentMemberKey: null,
    now: NOW,
    anonymousName: "a neighbor",
    ...over,
  };
}

describe("buildGatheringSlides", () => {
  it("always leads with a welcome slide", () => {
    const slides = buildGatheringSlides(baseInput());
    expect(slides[0]).toEqual({ kind: "welcome" });
    expect(hasActionableSlides(slides)).toBe(false);
  });

  it("includes upcoming events with an absolute RSVP href and drops past ones", () => {
    const slides = buildGatheringSlides(
      baseInput({
        events: [
          event({ id: "soon", startsAt: NOW + 3_600_000 }),
          event({ id: "past", startsAt: NOW - 7_200_000, endsAt: NOW - 3_600_000 }),
        ],
      }),
    );
    const ev = slides.filter((s) => s.kind === "event");
    expect(ev).toHaveLength(1);
    expect(ev[0]).toMatchObject({
      id: "soon",
      href: "https://hub.example/events/soon",
    });
    expect(hasActionableSlides(slides)).toBe(true);
  });

  it("shows only open tasks on ACTIVE projects, with a claim href", () => {
    const slides = buildGatheringSlides(
      baseInput({
        projects: [
          project({ id: "active", status: "active" }),
          project({ id: "planning", status: "planning" }),
        ],
        projectTasks: [
          taskRow({ id: "open-active", projectId: "active", status: "open" }),
          taskRow({ id: "claimed-active", projectId: "active", status: "claimed" }),
          taskRow({ id: "open-planning", projectId: "planning", status: "open" }),
        ],
      }),
    );
    const tasks = slides.filter((s) => s.kind === "task");
    expect(tasks.map((t) => (t.kind === "task" ? t.id : ""))).toEqual([
      "open-active",
    ]);
    expect(tasks[0]).toMatchObject({
      href: "https://hub.example/project/active/task/open-active",
    });
  });

  it("builds need/offer slides that message the author with the post referenced", () => {
    const slides = buildGatheringSlides(
      baseInput({
        posts: [
          post({ id: "n", type: "NEED", postedBy: "rosa", title: "Ride" }),
          post({ id: "o", type: "OFFER", postedBy: "unknownkey", title: "Tutoring" }),
        ],
        members: [member("rosa", "Rosa")],
      }),
    );
    const need = slides.find((s) => s.kind === "need");
    const offer = slides.find((s) => s.kind === "offer");
    expect(need).toMatchObject({
      authorName: "Rosa",
      href: "https://hub.example/messages/rosa?about=n",
    });
    // Unknown author falls back to the anonymous label.
    expect(offer).toMatchObject({
      authorName: "a neighbor",
      href: "https://hub.example/messages/unknownkey?about=o",
    });
  });

  it("excludes non-open posts", () => {
    const slides = buildGatheringSlides(
      baseInput({
        posts: [
          post({ id: "open", status: "open" }),
          post({ id: "claimed", status: "claimed" }),
        ],
      }),
    );
    const needs = slides.filter((s) => s.kind === "need");
    expect(needs).toHaveLength(1);
    expect(needs[0]).toMatchObject({ id: "open" });
  });

  it("applies per-category caps", () => {
    const slides = buildGatheringSlides(
      baseInput({
        posts: [
          post({ id: "a" }),
          post({ id: "b" }),
          post({ id: "c" }),
        ],
        caps: { needs: 2 },
      }),
    );
    expect(slides.filter((s) => s.kind === "need")).toHaveLength(2);
  });

  it("round-robins categories rather than grouping them", () => {
    const slides = buildGatheringSlides(
      baseInput({
        events: [event({ id: "e" })],
        posts: [
          post({ id: "n", type: "NEED" }),
          post({ id: "of", type: "OFFER" }),
        ],
      }),
    );
    // welcome, then event, then need, then offer (task category empty).
    expect(slides.map((s) => s.kind)).toEqual([
      "welcome",
      "event",
      "need",
      "offer",
    ]);
  });
});

describe("absoluteUrl", () => {
  it("joins origin and path, tolerating a trailing slash", () => {
    expect(absoluteUrl("https://x.test", "/a")).toBe("https://x.test/a");
    expect(absoluteUrl("https://x.test/", "/a")).toBe("https://x.test/a");
  });
});
