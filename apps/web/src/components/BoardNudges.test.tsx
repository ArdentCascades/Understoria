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
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { BoardNudgeStatus } from "@/lib/boardNudge";

// Each per-prompt hook is mocked to return a dialable BoardNudgeStatus,
// so this suite tests ONLY the orchestrator's priority + flash-free
// logic — never the prompts' real eligibility (those have their own
// harness tests). Every hook reads its slot off this single object so
// the hoisted mock factories reference nothing uninitialized.
const status: Record<
  | "notJoined"
  | "nodeSuggest"
  | "mirrorSuggest"
  | "growRoot"
  | "first"
  | "profile"
  | "keepAccess"
  | "vouch"
  | "install",
  BoardNudgeStatus
> = {
  notJoined: hidden(),
  nodeSuggest: hidden(),
  mirrorSuggest: hidden(),
  growRoot: hidden(),
  first: hidden(),
  profile: hidden(),
  keepAccess: hidden(),
  vouch: hidden(),
  install: hidden(),
};

// A resolved-but-not-shown status — the default for every slot.
function hidden(): BoardNudgeStatus {
  return { ready: true, visible: false, node: null };
}

vi.mock("@/components/useNotJoinedNudge", () => ({
  useNotJoinedNudge: () => status.notJoined,
}));
vi.mock("@/components/useNodeOriginSuggestNudge", () => ({
  useNodeOriginSuggestNudge: () => status.nodeSuggest,
}));
vi.mock("@/components/useMirrorSuggestNudge", () => ({
  useMirrorSuggestNudge: () => status.mirrorSuggest,
}));
vi.mock("@/components/useGrowRootSuggestNudge", () => ({
  useGrowRootSuggestNudge: () => status.growRoot,
}));
vi.mock("@/components/useFirstActionNudge", () => ({
  useFirstActionNudge: () => status.first,
}));
vi.mock("@/components/useProfileNudge", () => ({
  useProfileNudge: () => status.profile,
}));
vi.mock("@/components/useKeepAccessNudge", () => ({
  useKeepAccessNudge: () => status.keepAccess,
}));
vi.mock("@/components/useVouchDiscoveryNudge", () => ({
  useVouchDiscoveryNudge: () => status.vouch,
}));
vi.mock("@/components/useInstallCardNudge", () => ({
  useInstallCardNudge: () => status.install,
}));

import { BoardNudges } from "./BoardNudges";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function visibleWith(node: BoardNudgeStatus["node"]): BoardNudgeStatus {
  return { ready: true, visible: true, node };
}

beforeEach(() => {
  status.notJoined = hidden();
  status.nodeSuggest = hidden();
  status.mirrorSuggest = hidden();
  status.first = hidden();
  status.profile = hidden();
  status.keepAccess = hidden();
  status.vouch = hidden();
  status.install = hidden();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.restoreAllMocks();
});

function render(node: ReactNode = <BoardNudges />) {
  act(() => {
    root = createRoot(container);
    root.render(node);
  });
}

describe("BoardNudges orchestrator", () => {
  it("renders nothing while a higher-priority prompt is still loading, even if lower ones are visible (flash-freedom)", () => {
    // The highest-priority prompt hasn't resolved its async gating yet.
    status.first = { ready: false, visible: false, node: null };
    // Every lower prompt is ready AND wants to show — but none may,
    // because a higher one could still resolve to visible.
    status.profile = visibleWith(<div data-testid="profile" />);
    status.keepAccess = visibleWith(<div data-testid="keep" />);
    status.vouch = visibleWith(<div data-testid="vouch" />);
    status.install = visibleWith(<div data-testid="install" />);
    render();
    expect(container.textContent).toBe("");
    expect(container.querySelector("[data-testid]")).toBeNull();
  });

  it("falls through a resolved-but-hidden higher prompt to the next visible one", () => {
    // First prompt resolved and decided NOT to show.
    status.first = hidden();
    // Second prompt resolved and wants to show.
    status.profile = visibleWith(<div data-testid="profile" />);
    render();
    expect(container.querySelector('[data-testid="profile"]')).not.toBeNull();
    // And nothing else leaks in.
    expect(container.querySelectorAll("[data-testid]").length).toBe(1);
  });

  it("shows only the higher-priority prompt when two are visible", () => {
    // KeepAccess (priority 3) and Vouch (priority 4) both want to show;
    // KeepAccess wins.
    status.keepAccess = visibleWith(<div data-testid="keep" />);
    status.vouch = visibleWith(<div data-testid="vouch" />);
    render();
    expect(container.querySelector('[data-testid="keep"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="vouch"]')).toBeNull();
  });

  it("renders nothing when every prompt is resolved and hidden", () => {
    // All slots default to hidden() in beforeEach.
    render();
    expect(container.textContent).toBe("");
    expect(container.querySelector("[data-testid]")).toBeNull();
  });

  // The `fallback` slot carries Board's ContextualHint so hint and
  // nudge can never stack — one banner at a time, hint last in line.
  it("renders the fallback when every prompt is resolved and hidden", () => {
    render(<BoardNudges fallback={<div data-testid="hint" />} />);
    expect(container.querySelector('[data-testid="hint"]')).not.toBeNull();
  });

  it("suppresses the fallback while a prompt is visible", () => {
    status.profile = visibleWith(<div data-testid="profile" />);
    render(<BoardNudges fallback={<div data-testid="hint" />} />);
    expect(container.querySelector('[data-testid="profile"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="hint"]')).toBeNull();
  });

  it("holds the fallback back while any prompt is still loading (no hint flash)", () => {
    status.keepAccess = { ready: false, visible: false, node: null };
    render(<BoardNudges fallback={<div data-testid="hint" />} />);
    expect(container.querySelector('[data-testid="hint"]')).toBeNull();
    expect(container.textContent).toBe("");
  });

  it("full-order spot check: NotJoined visible wins over every lower visible prompt", () => {
    status.notJoined = visibleWith(<div data-testid="notjoined" />);
    status.nodeSuggest = visibleWith(<div data-testid="nodesuggest" />);
    status.first = visibleWith(<div data-testid="first" />);
    status.profile = visibleWith(<div data-testid="profile" />);
    status.keepAccess = visibleWith(<div data-testid="keep" />);
    status.vouch = visibleWith(<div data-testid="vouch" />);
    status.install = visibleWith(<div data-testid="install" />);
    render();
    expect(container.querySelector('[data-testid="notjoined"]')).not.toBeNull();
    expect(container.querySelectorAll("[data-testid]").length).toBe(1);
  });

  it("node suggestion outranks first-action but yields to not-joined", () => {
    status.nodeSuggest = visibleWith(<div data-testid="nodesuggest" />);
    status.first = visibleWith(<div data-testid="first" />);
    render();
    expect(
      container.querySelector('[data-testid="nodesuggest"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-testid="first"]')).toBeNull();
  });
});
