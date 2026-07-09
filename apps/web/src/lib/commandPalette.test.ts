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
//
// The command palette's pure half. Locks:
//   1. Empty query = navigation launcher: route entries only, in
//      the given order, never a dump of records.
//   2. Ranking: title prefix > word-boundary > substring > label
//      match, ties by index order (routes first at equal score).
//   3. Every record kind lands in the index with the right path —
//      including the member-key URI encoding and the event entry
//      pointing at the docked-panel path.
//   4. The result cap holds.
//
import { describe, expect, it } from "vitest";
import {
  buildPaletteIndex,
  searchPalette,
  PALETTE_RESULT_LIMIT,
  type PaletteEntry,
} from "./commandPalette";
import type { Event, Member, Post, Project, Proposal } from "@/types";

const LABELS = {
  postNeed: "Need",
  postOffer: "Offer",
  project: "Project",
  event: "Event",
  member: "Member",
  proposal: "Proposal",
  help: "Help",
};

const ROUTES: PaletteEntry[] = [
  { kind: "route", id: "route:/", title: "Board", to: "/" },
  { kind: "route", id: "route:/calendar", title: "Calendar", to: "/calendar" },
];

function post(id: string, title: string, type: "NEED" | "OFFER" = "NEED"): Post {
  return { id, title, type } as Post;
}

function baseIndex(over: Partial<Parameters<typeof buildPaletteIndex>[0]> = {}) {
  return buildPaletteIndex({
    routes: ROUTES,
    posts: [],
    projects: [],
    events: [],
    members: [],
    proposals: [],
    help: [],
    labels: LABELS,
    ...over,
  });
}

describe("buildPaletteIndex", () => {
  it("maps every kind to the right destination", () => {
    const index = baseIndex({
      posts: [post("p1", "Childcare Friday")],
      projects: [{ id: "pr1", title: "Fridge revival" } as Project],
      events: [{ id: "ev1", title: "Potluck" } as Event],
      members: [
        { publicKey: "abc+/=", displayName: "Rosa" } as Member,
      ],
      proposals: [{ id: "gov1", title: "Adopt passkey restore" } as Proposal],
      help: [{ id: "internet-outage", question: "What about outages?" }],
    });
    const byId = new Map(index.map((e) => [e.id, e]));
    expect(byId.get("post:p1")?.to).toBe("/post/p1");
    expect(byId.get("project:pr1")?.to).toBe("/project/pr1");
    // Events open the docked calendar panel, not the bare page.
    expect(byId.get("event:ev1")?.to).toBe("/calendar/event/ev1");
    // Member keys are base64 and can contain '/'+'=' — must be encoded.
    expect(byId.get("member:abc+/=")?.to).toBe(
      `/member/${encodeURIComponent("abc+/=")}`,
    );
    expect(byId.get("proposal:gov1")?.to).toBe("/proposals");
    expect(byId.get("help:internet-outage")?.to).toBe(
      "/help#internet-outage",
    );
  });
});

describe("searchPalette", () => {
  it("empty query returns routes only, in order", () => {
    const index = baseIndex({ posts: [post("p1", "Board games night")] });
    const results = searchPalette(index, "  ");
    expect(results.map((e) => e.id)).toEqual(["route:/", "route:/calendar"]);
  });

  it("ranks prefix over word-boundary over substring", () => {
    const index = baseIndex({
      posts: [
        post("mid", "Weekly childcare swap"), // word-boundary "chi"
        post("sub", "Watching children after school"), // word-boundary too
        post("pre", "Childcare Friday night"), // prefix
        post("inner", "Herbs and chives to share"), // substring only
      ],
    });
    const ids = searchPalette(index, "chi").map((e) => e.id);
    expect(ids[0]).toBe("post:pre");
    // Both word-boundary matches beat the substring-only match,
    // keeping index order between themselves.
    expect(ids.slice(1, 3)).toEqual(["post:mid", "post:sub"]);
    expect(ids[3]).toBe("post:inner");
  });

  it("matches the kind label as the weakest tier", () => {
    const index = baseIndex({
      posts: [post("p1", "Garden tools", "OFFER")],
    });
    const results = searchPalette(index, "offer");
    expect(results.map((e) => e.id)).toContain("post:p1");
  });

  it("caps results", () => {
    const posts = Array.from({ length: 30 }, (_, i) =>
      post(`p${i}`, `Soup batch ${i}`),
    );
    const index = baseIndex({ posts });
    expect(searchPalette(index, "soup")).toHaveLength(PALETTE_RESULT_LIMIT);
  });
});
