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
import { getActiveProjectsForTemplate } from "./templateUsage";
import type { Project } from "@/types";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj_1",
    title: "Test project",
    description: "",
    category: "infrastructure",
    organizerKey: "org_key",
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
    nodeId: "node_test",
    templateId: "community-fridge",
    ...overrides,
  };
}

describe("templateUsage — getActiveProjectsForTemplate", () => {
  it("returns [] when the projects array is empty", () => {
    expect(getActiveProjectsForTemplate([], "community-fridge")).toEqual([]);
  });

  it("returns [] when no project matches the templateId", () => {
    const projects = [
      makeProject({ id: "p1", templateId: "tool-library" }),
      makeProject({ id: "p2", templateId: "skill-share" }),
    ];
    expect(getActiveProjectsForTemplate(projects, "community-fridge")).toEqual(
      [],
    );
  });

  it("returns the single matching active project", () => {
    const match = makeProject({
      id: "p1",
      templateId: "community-fridge",
      status: "active",
    });
    const projects = [
      match,
      makeProject({ id: "p2", templateId: "tool-library", status: "active" }),
    ];
    const result = getActiveProjectsForTemplate(projects, "community-fridge");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p1");
  });

  it("returns multiple matches sorted by createdAt descending", () => {
    const projects = [
      makeProject({
        id: "older",
        templateId: "community-fridge",
        createdAt: 1000,
      }),
      makeProject({
        id: "newest",
        templateId: "community-fridge",
        createdAt: 3000,
      }),
      makeProject({
        id: "middle",
        templateId: "community-fridge",
        createdAt: 2000,
      }),
    ];
    const result = getActiveProjectsForTemplate(projects, "community-fridge");
    expect(result.map((p) => p.id)).toEqual(["newest", "middle", "older"]);
  });

  it("excludes projects whose status is paused, completed, or archived", () => {
    // ProjectStatus is "planning" | "active" | "paused" | "completed" |
    // "archived" — no "cancelled" value exists in the source today.
    const projects = [
      makeProject({
        id: "planning",
        templateId: "community-fridge",
        status: "planning",
      }),
      makeProject({
        id: "active",
        templateId: "community-fridge",
        status: "active",
      }),
      makeProject({
        id: "paused",
        templateId: "community-fridge",
        status: "paused",
      }),
      makeProject({
        id: "completed",
        templateId: "community-fridge",
        status: "completed",
      }),
      makeProject({
        id: "archived",
        templateId: "community-fridge",
        status: "archived",
      }),
    ];
    const result = getActiveProjectsForTemplate(projects, "community-fridge");
    const ids = result.map((p) => p.id).sort();
    expect(ids).toEqual(["active", "planning"]);
  });

  it("excludes projects whose own templateId is null even when the parameter is null", () => {
    const projects = [
      makeProject({ id: "p1", templateId: null, status: "active" }),
      makeProject({ id: "p2", templateId: null, status: "planning" }),
    ];
    expect(getActiveProjectsForTemplate(projects, null)).toEqual([]);
  });

  it("returns [] when the templateId parameter is null regardless of project content", () => {
    const projects = [
      makeProject({ id: "p1", templateId: "community-fridge" }),
      makeProject({ id: "p2", templateId: "tool-library" }),
      makeProject({ id: "p3", templateId: null }),
    ];
    expect(getActiveProjectsForTemplate(projects, null)).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const projects = [
      makeProject({
        id: "older",
        templateId: "community-fridge",
        createdAt: 1000,
      }),
      makeProject({
        id: "newest",
        templateId: "community-fridge",
        createdAt: 3000,
      }),
      makeProject({
        id: "middle",
        templateId: "community-fridge",
        createdAt: 2000,
      }),
    ];
    const snapshotIds = projects.map((p) => p.id);
    const snapshotLength = projects.length;
    getActiveProjectsForTemplate(projects, "community-fridge");
    expect(projects).toHaveLength(snapshotLength);
    expect(projects.map((p) => p.id)).toEqual(snapshotIds);
  });
});
