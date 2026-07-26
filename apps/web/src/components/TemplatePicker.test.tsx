/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The template gallery's fresh / in-your-community tab split. The tabs
// exist ONLY when usage data marks at least one template as in use —
// contexts without project data (and zero-usage communities) must see
// the tabless gallery unchanged. Filters AND-compose with the active
// tab, and the parent-owned selection must survive tab switches.

import "@/i18n";
import { TemplatePicker } from "./TemplatePicker";
import { getProjectTemplates } from "@/content/projectTemplates";
import { matchesTemplate } from "@/lib/templateFilter";
import type { Project } from "@/types";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

// Real gallery — the component loads it internally, so tests must use
// real template ids/names rather than injected fixtures.
const templates = getProjectTemplates("en");
const inUseTemplate = templates[0];
const freshTemplate = templates[1];

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
    createdAt: Date.now(),
    completedAt: null,
    pauseNote: null,
    locationZone: "",
    tags: [],
    nodeId: "node_test",
    templateId: inUseTemplate.id,
    ...overrides,
  };
}

/** One project using templates[0] — the minimal "tabs appear" map. */
function usageMap(): Map<string, Project[]> {
  return new Map([[inUseTemplate.id, [makeProject()]]]);
}

function render(props: {
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  activeProjectsByTemplate?: Map<string, Project[]>;
}) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter>
        <TemplatePicker
          selectedId={props.selectedId ?? null}
          onSelect={props.onSelect ?? (() => {})}
          activeProjectsByTemplate={props.activeProjectsByTemplate}
        />
      </MemoryRouter>,
    );
  });
}

/** The template grid, excluding tab labels / filters / ScratchCard. */
function gridText(): string {
  return container.querySelector("ul")?.textContent ?? "";
}

function tabButtons(): HTMLButtonElement[] {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
  );
}

describe("TemplatePicker tabs", () => {
  it("renders no tablist and the full gallery without usage data", () => {
    render({});
    expect(container.querySelector('[role="tablist"]')).toBeNull();
    // Full gallery: both the would-be-in-use and a fresh template show.
    expect(gridText()).toContain(inUseTemplate.name);
    expect(gridText()).toContain(freshTemplate.name);
  });

  it("splits the gallery when a template is in use; tab switch swaps the lists", () => {
    render({ activeProjectsByTemplate: usageMap() });
    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).not.toBeNull();
    // Default tab is "New ideas": the in-use template is filtered out.
    const [freshTab, inUseTab] = tabButtons();
    expect(freshTab.getAttribute("aria-selected")).toBe("true");
    expect(freshTab.textContent).toContain("New ideas");
    expect(gridText()).not.toContain(inUseTemplate.name);
    expect(gridText()).toContain(freshTemplate.name);

    act(() => {
      inUseTab.click();
    });
    expect(inUseTab.getAttribute("aria-selected")).toBe("true");
    expect(gridText()).toContain(inUseTemplate.name);
    expect(gridText()).not.toContain(freshTemplate.name);
  });

  it("shows the in-use count in the community tab label", () => {
    render({ activeProjectsByTemplate: usageMap() });
    const [, inUseTab] = tabButtons();
    expect(inUseTab.textContent).toContain("1");
  });

  it("keeps the parent's selection untouched across tab switches", () => {
    const onSelect = vi.fn();
    render({
      selectedId: freshTemplate.id,
      onSelect,
      activeProjectsByTemplate: usageMap(),
    });
    const [freshTab, inUseTab] = tabButtons();
    act(() => {
      inUseTab.click();
    });
    act(() => {
      freshTab.click();
    });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("AND-composes the search filter with the fresh tab", () => {
    vi.useFakeTimers();
    try {
      render({ activeProjectsByTemplate: usageMap() });
      // A query matching freshTemplate but not every fresh template —
      // derived via the same predicate the component uses, so the test
      // tracks gallery content instead of hard-coding names.
      const query = freshTemplate.name;
      const nonMatching = templates.find(
        (tpl) =>
          tpl.id !== inUseTemplate.id &&
          !matchesTemplate(tpl, { query, category: "", setupBucket: "" }),
      );
      expect(nonMatching).toBeDefined();
      expect(gridText()).toContain(nonMatching!.name);

      const input = container.querySelector<HTMLInputElement>(
        'input[type="search"]',
      );
      expect(input).not.toBeNull();
      act(() => {
        const setter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )?.set;
        setter?.call(input, query);
        input!.dispatchEvent(new Event("input", { bubbles: true }));
      });
      // Drive the ~200 ms search debounce forward.
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(gridText()).toContain(freshTemplate.name);
      expect(gridText()).not.toContain(nonMatching!.name);
    } finally {
      vi.useRealTimers();
    }
  });
});
