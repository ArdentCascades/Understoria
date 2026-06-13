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
import { computeProjectClosure } from "./projectClosure";
import type { Exchange, Project } from "@/types";

const ORGANIZER = "organizer-key";

function makeProject(id: string): Project {
  return {
    id,
    title: `Project ${id}`,
    description: "",
    category: "infrastructure",
    organizerKey: ORGANIZER,
    coOrganizerKeys: [],
    status: "completed",
    targetHours: 10,
    contributedHours: 0,
    deadline: null,
    createdAt: 0,
    completedAt: 100,
    pauseNote: null,
    locationZone: "",
    tags: [],
    nodeId: "node-1",
    templateId: null,
  };
}

function makeExchange(
  over: Partial<Exchange> & { id: string; postId: string; helperKey: string },
): Exchange {
  const base: Exchange = {
    id: over.id,
    postId: over.postId,
    helperKey: over.helperKey,
    helpedKey: ORGANIZER,
    hoursExchanged: 1,
    helperSignature: "h-sig",
    helpedSignature: "p-sig",
    completedAt: 100,
    category: "other",
    nodeId: "node-1",
  };
  return { ...base, ...over };
}

describe("computeProjectClosure", () => {
  it("returns zeros when no exchange belongs to the project", () => {
    const project = makeProject("p1");
    const closure = computeProjectClosure({ project, exchanges: [] });
    expect(closure).toEqual({ contributorCount: 0, hoursMoved: 0 });
  });

  it("counts each helper once across multiple task exchanges", () => {
    const project = makeProject("p1");
    const exchanges = [
      makeExchange({ id: "e1", postId: "project:p1/task:t1", helperKey: "ana" }),
      makeExchange({ id: "e2", postId: "project:p1/task:t2", helperKey: "ana" }),
      makeExchange({ id: "e3", postId: "project:p1/task:t3", helperKey: "ben" }),
    ];
    const closure = computeProjectClosure({ project, exchanges });
    expect(closure.contributorCount).toBe(2);
    expect(closure.hoursMoved).toBe(3);
  });

  it("counts an auto-confirmed exchange whose helper is the organizer-completer", () => {
    const project = makeProject("p1");
    const exchanges = [
      makeExchange({
        id: "e1",
        postId: "project:p1/task:t1",
        helperKey: ORGANIZER,
        hoursExchanged: 2,
      }),
    ];
    const closure = computeProjectClosure({ project, exchanges });
    expect(closure.contributorCount).toBe(1);
    expect(closure.hoursMoved).toBe(2);
  });

  it("excludes non-project exchanges and other projects' exchanges", () => {
    const project = makeProject("p1");
    const exchanges = [
      makeExchange({ id: "e1", postId: "project:p1/task:t1", helperKey: "ana" }),
      // A plain post exchange — not a project task.
      makeExchange({ id: "e2", postId: "post-42", helperKey: "ben" }),
      // Another project entirely.
      makeExchange({ id: "e3", postId: "project:p2/task:t9", helperKey: "cleo" }),
      // A project whose id is a prefix of this one must not match — the
      // trailing slash guards against `p1` catching `p10`.
      makeExchange({ id: "e4", postId: "project:p10/task:t1", helperKey: "dee" }),
    ];
    const closure = computeProjectClosure({ project, exchanges });
    expect(closure.contributorCount).toBe(1);
    expect(closure.hoursMoved).toBe(1);
  });

  it("rounds summed hours to two decimal places", () => {
    const project = makeProject("p1");
    const exchanges = [
      makeExchange({
        id: "e1",
        postId: "project:p1/task:t1",
        helperKey: "ana",
        hoursExchanged: 0.1,
      }),
      makeExchange({
        id: "e2",
        postId: "project:p1/task:t2",
        helperKey: "ben",
        hoursExchanged: 0.2,
      }),
    ];
    const closure = computeProjectClosure({ project, exchanges });
    // 0.1 + 0.2 is 0.30000000000000004 in IEEE-754; rounding settles it.
    expect(closure.hoursMoved).toBe(0.3);
  });
});
