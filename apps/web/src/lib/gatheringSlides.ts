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
  Event,
  EventCancellation,
  EventRsvpRow,
  Member,
  Post,
  Project,
  ProjectTask,
} from "@/types";
import { selectUpcomingGatherings } from "@/lib/upcomingEvents";

// The gathering-screen slide model (docs/gathering-screen.md §6.3). A
// PURE selector from live community state to a rotation of glanceable,
// scannable slides — every actionable slide carries an ABSOLUTE `href`
// that becomes its QR target, so a phone in the room can act.
//
// Phase 1 draws only from content that federates reliably and is already
// public: upcoming events, open (claimable) tasks on active projects, and
// open needs/offers. No people directory, no join slide — those wait on
// member-profile federation and a multi-use invite respectively (§7).
//
// The QR origin is passed in (the caller supplies window.location.origin):
// the device running the kiosk loaded the app from whichever origin —
// public URL or a local offline hub — and that SAME origin is what phones
// in the room should hit, so no separate hub logic is needed here.

export type GatheringSlide =
  | { kind: "welcome" }
  | {
      kind: "event";
      id: string;
      title: string;
      startsAt: number;
      endsAt: number | null;
      location: string;
      href: string;
      viewerGoing: boolean;
    }
  | {
      kind: "task";
      id: string;
      taskTitle: string;
      projectTitle: string;
      href: string;
    }
  | {
      // Needs and offers share a shape; the discriminant drives the
      // eyebrow + call-to-action copy.
      kind: "need" | "offer";
      id: string;
      title: string;
      authorKey: string;
      authorName: string;
      href: string;
    };

export interface GatheringSlidesInput {
  /** window.location.origin — see the module note on why this is correct
   *  both online and on a local hub. */
  origin: string;
  events: readonly Event[];
  eventCancellations: readonly EventCancellation[];
  eventRsvps: readonly EventRsvpRow[];
  projects: readonly Project[];
  projectTasks: readonly ProjectTask[];
  posts: readonly Post[];
  members: readonly Member[];
  /** Viewer's own key — only used to mark the viewer's own "going" on
   *  event slides (never anyone else's). */
  currentMemberKey?: string | null;
  now: number;
  /** Fallback name for a poster whose member row this device doesn't know
   *  (e.g. a cross-node author). */
  anonymousName: string;
  /** Per-category caps so one busy category can't swamp the rotation. */
  caps?: { events?: number; tasks?: number; needs?: number; offers?: number };
  /** Optional organizer curation (docs/gathering-screen.md §7.2) — all
   *  device-local, all operating on already-public content, so it carries
   *  no privacy weight. */
  filter?: GatheringSlideFilter;
}

export interface GatheringSlideFilter {
  /** Coarse category on/off. A category defaults to ON; only `false`
   *  suppresses it. */
  categories?: {
    events?: boolean;
    tasks?: boolean;
    needs?: boolean;
    offers?: boolean;
  };
  /** Slide ids hoisted to the front, in this order (if still live). */
  pinnedIds?: readonly string[];
  /** Slide ids never shown. */
  hiddenIds?: readonly string[];
}

/** The display label for a slide (the item's own title), for the
 *  curation list. Welcome has no label. */
export function slideLabel(slide: GatheringSlide): string {
  switch (slide.kind) {
    case "welcome":
      return "";
    case "task":
      return slide.taskTitle;
    default:
      return slide.title;
  }
}

/** The curation key for a slide (its underlying item id). Welcome has
 *  none. */
export function slideId(slide: GatheringSlide): string {
  return slide.kind === "welcome" ? "" : slide.id;
}

/** Join an origin and an absolute path into one URL, tolerating a
 *  trailing slash on the origin. */
export function absoluteUrl(origin: string, path: string): string {
  return `${origin.replace(/\/$/, "")}${path}`;
}

// A need/offer QR opens a compose-to-the-poster thread with the post
// referenced (`?about=`), so a scanner lands ready to offer help with
// context already attached.
function messageAuthorPath(authorKey: string, postId: string): string {
  return `/messages/${encodeURIComponent(authorKey)}?about=${encodeURIComponent(
    postId,
  )}`;
}

// Round-robin so the rotation alternates categories (event, task, need,
// offer, event, …) instead of showing every event then every need.
function roundRobin<T>(lists: readonly T[][]): T[] {
  const out: T[] = [];
  const max = lists.reduce((m, l) => Math.max(m, l.length), 0);
  for (let i = 0; i < max; i++) {
    for (const list of lists) {
      if (i < list.length) out.push(list[i]);
    }
  }
  return out;
}

export function buildGatheringSlides(
  input: GatheringSlidesInput,
): GatheringSlide[] {
  const caps = { events: 4, tasks: 4, needs: 4, offers: 4, ...input.caps };
  const nameOf = (key: string) =>
    input.members.find((m) => m.publicKey === key)?.displayName ||
    input.anonymousName;

  // A category defaults ON; only an explicit `false` suppresses it.
  const on = (k: keyof NonNullable<GatheringSlideFilter["categories"]>) =>
    input.filter?.categories?.[k] !== false;

  const eventSlides: GatheringSlide[] = !on("events")
    ? []
    : selectUpcomingGatherings({
    events: input.events,
    eventCancellations: input.eventCancellations,
    eventRsvps: input.eventRsvps,
    currentMemberKey: input.currentMemberKey ?? null,
    now: input.now,
    limit: caps.events,
  }).map(({ event, viewerGoing }) => ({
    kind: "event",
    id: event.id,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    location: event.location,
    href: absoluteUrl(input.origin, `/events/${event.id}`),
    viewerGoing,
  }));

  // Open, unclaimed tasks on ACTIVE (claimable) projects — "scan to
  // claim." Planning/paused projects aren't claimable, so their tasks
  // stay off the wall; a claimed task drops out the moment it's taken
  // (the live re-query on the page keeps the rotation honest).
  const activeProjectIds = new Set(
    input.projects.filter((p) => p.status === "active").map((p) => p.id),
  );
  const projectTitle = new Map(input.projects.map((p) => [p.id, p.title]));
  const taskSlides: GatheringSlide[] = !on("tasks")
    ? []
    : input.projectTasks
        .filter((t) => t.status === "open" && activeProjectIds.has(t.projectId))
        .slice(0, caps.tasks)
        .map((t) => ({
          kind: "task",
          id: t.id,
          taskTitle: t.title,
          projectTitle: projectTitle.get(t.projectId) ?? "",
          href: absoluteUrl(
            input.origin,
            `/project/${t.projectId}/task/${t.id}`,
          ),
        }));

  const needSlides: GatheringSlide[] = !on("needs")
    ? []
    : input.posts
        .filter((p) => p.type === "NEED" && p.status === "open")
        .slice(0, caps.needs)
        .map((p) => ({
          kind: "need",
          id: p.id,
          title: p.title,
          authorKey: p.postedBy,
          authorName: nameOf(p.postedBy),
          href: absoluteUrl(input.origin, messageAuthorPath(p.postedBy, p.id)),
        }));

  const offerSlides: GatheringSlide[] = !on("offers")
    ? []
    : input.posts
        .filter((p) => p.type === "OFFER" && p.status === "open")
        .slice(0, caps.offers)
        .map((p) => ({
          kind: "offer",
          id: p.id,
          title: p.title,
          authorKey: p.postedBy,
          authorName: nameOf(p.postedBy),
          href: absoluteUrl(input.origin, messageAuthorPath(p.postedBy, p.id)),
        }));

  // Hide, then pin. `hiddenIds` removes an item entirely (the interim
  // "please don't feature my post" control); `pinnedIds` hoists survivors
  // to the front in the organizer's chosen order.
  const hidden = new Set(input.filter?.hiddenIds ?? []);
  const pinnedRank = new Map(
    (input.filter?.pinnedIds ?? []).map((id, i) => [id, i] as const),
  );
  const idOf = (s: GatheringSlide) => (s.kind === "welcome" ? "" : s.id);

  const actionable = roundRobin([
    eventSlides,
    taskSlides,
    needSlides,
    offerSlides,
  ]).filter((s) => !hidden.has(idOf(s)));

  const pinned = actionable
    .filter((s) => pinnedRank.has(idOf(s)))
    .sort((a, b) => pinnedRank.get(idOf(a))! - pinnedRank.get(idOf(b))!);
  const rest = actionable.filter((s) => !pinnedRank.has(idOf(s)));

  // The welcome slide always leads; it's the calm interstitial that names
  // the community and stands alone when nothing else qualifies.
  return [{ kind: "welcome" }, ...pinned, ...rest];
}

/** True when the rotation has something to act on beyond the welcome
 *  interstitial — the page uses it to show a gentle empty hint. */
export function hasActionableSlides(slides: readonly GatheringSlide[]): boolean {
  return slides.some((s) => s.kind !== "welcome");
}
