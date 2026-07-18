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
/**
 * Category options — names AND descriptions must render through i18n.
 * The names always did (`categories.*`); the one-line descriptions
 * were hardcoded English in lib/categories.ts, so a Spanish member
 * read "Cuidado infantil — Babysitting, school pickups, kid help" on
 * the post form. Both halves now come from the parity-checked locale
 * files (`categoryDescriptions.*`).
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockApp }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("@/db/actions", () => ({
  createPost: vi.fn(async () => ({}) as unknown),
  cancelPost: vi.fn(async () => undefined),
}));
// Drafts touch Dexie; stub the seam — this suite is about rendering.
vi.mock("@/db/drafts", () => ({
  clearDraft: vi.fn(async () => undefined),
  loadDraft: vi.fn(async () => null),
}));
vi.mock("@/lib/useDraftAutosave", () => ({
  useDraftAutosave: () => undefined,
}));

import i18n from "@/i18n";
import PostFormPage from "./PostForm";
import type { Member, Post } from "@/types";

let mockApp: {
  currentMember: Pick<Member, "publicKey" | "locationZone"> | null;
  posts: Post[];
  nodeId: string;
  projects: unknown[];
  projectTasks: unknown[];
};

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockApp = {
    currentMember: { publicKey: "me-key", locationZone: "" },
    posts: [],
    nodeId: "node-1",
    projects: [],
    projectTasks: [],
  };
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(async () => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  await i18n.changeLanguage("en");
});

async function render() {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/post/new"]}>
        <PostFormPage />
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
}

describe("PostForm — category descriptions render through i18n", () => {
  it("English: every category shows its translated name and blurb", async () => {
    await i18n.changeLanguage("en");
    await render();
    expect(container.textContent).toContain("Childcare");
    expect(container.textContent).toContain(
      "Babysitting, school pickups, kid help",
    );
    expect(container.textContent).toContain("Rides, carpools, moving help");
  });

  it("Spanish: the description is Spanish too, never leftover English", async () => {
    await i18n.changeLanguage("es");
    await render();
    // Name (already translated before this fix)…
    expect(container.textContent).toContain("Cuidado infantil");
    // …and the blurb, which used to leak hardcoded English.
    expect(container.textContent).toContain("Cuidado de niños");
    expect(container.textContent).not.toContain(
      "Babysitting, school pickups, kid help",
    );
    expect(container.textContent).not.toContain(
      "Rides, carpools, moving help",
    );
    expect(container.textContent).toContain(
      "Viajes, transporte compartido, ayuda con mudanzas",
    );
  });
});
