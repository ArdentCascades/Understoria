/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the contexts BEFORE importing the page. The drafts module is
// deliberately NOT mocked — the regression this file guards (a draft
// round-trip losing `templateId`) lives in what gets serialized to
// and parsed from the real drafts table, so the test goes through
// the real Dexie path on fake-indexeddb.
vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), toast: null }),
}));

import "@/i18n";
import ProjectNewPage from "./ProjectNew";
import { clearDraft, loadDraft, saveDraft } from "@/db/drafts";
import { getTemplate } from "@/content/projectTemplates";
import type { Member } from "@/types";

const DRAFT_KEY = "project-new";
const TEMPLATE_ID = "community-fridge";

interface MockState {
  currentMember: Member | null;
  nodeId: string;
  projects: never[];
}

function makeMember(publicKey: string): Member {
  return {
    publicKey,
    displayName: "Tester",
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 0,
    vouchedBy: [],
    createdAt: 0,
    nodeId: "node-1",
    locationZone: "",
  } satisfies Member;
}

let mockState: MockState;

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  await clearDraft(DRAFT_KEY);
  mockState = {
    currentMember: makeMember("me-key"),
    nodeId: "node-1",
    projects: [],
  };
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

/** Pump real timers/microtasks until `predicate` holds (Dexie I/O is
 *  genuinely async under fake-indexeddb, so a single flush isn't
 *  guaranteed to land the loadDraft state update). */
async function waitFor(predicate: () => boolean, timeoutMs = 2000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("waitFor timed out");
    }
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
  }
}

function restoreButton(): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent === "Continue draft",
  );
  if (!button) throw new Error("restore button not found");
  return button;
}

describe("ProjectNew draft round-trip", () => {
  it("restores the template selection from a saved draft and keeps it through re-save", async () => {
    await saveDraft(DRAFT_KEY, {
      title: "Fridge revival",
      description: "Bring the corner fridge back",
      category: "food",
      targetHours: "12",
      deadlineDays: "",
      area: "",
      tags: "",
      templateId: TEMPLATE_ID,
    });

    render(<ProjectNewPage />);
    await waitFor(() =>
      (container.textContent ?? "").includes("Continue draft"),
    );

    act(() => {
      restoreButton().click();
    });

    // The selected-template banner reflects the restored choice —
    // this is what used to silently disappear, taking the template's
    // staged task list with it at submit time.
    const templateName = getTemplate(TEMPLATE_ID, "en")?.name ?? "";
    expect(templateName).not.toBe("");
    expect(container.textContent ?? "").toContain(
      `Starting from the ${templateName} template`,
    );
    const titleInput = container.querySelector(
      "form input",
    ) as HTMLInputElement | null;
    expect(titleInput?.value).toBe("Fridge revival");

    // The autosave that follows the restore (600 ms debounce) must
    // write templateId back — otherwise one restore cycle would
    // strip it for the next.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 700));
    });
    const resaved = await loadDraft<{ templateId?: string | null }>(DRAFT_KEY);
    expect(resaved?.payload.templateId).toBe(TEMPLATE_ID);
  });

  it("restores drafts saved before templateId existed as from-scratch", async () => {
    // Legacy payload shape — no templateId field at all.
    await saveDraft(DRAFT_KEY, {
      title: "Old draft",
      description: "",
      category: "other",
      targetHours: "10",
      deadlineDays: "",
      area: "",
      tags: "",
    });

    render(<ProjectNewPage />);
    await waitFor(() =>
      (container.textContent ?? "").includes("Continue draft"),
    );

    act(() => {
      restoreButton().click();
    });

    const titleInput = container.querySelector(
      "form input",
    ) as HTMLInputElement | null;
    expect(titleInput?.value).toBe("Old draft");
    // No template banner — the legacy draft restores as from-scratch.
    expect(container.textContent ?? "").not.toContain("Starting from the");
  });
});
