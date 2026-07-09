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
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@/i18n";
import { TemplatePlaybook } from "./TemplatePlaybook";
import { getTemplate } from "@/content/projectTemplates";

let container: HTMLDivElement;
let root: Root;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});
afterEach(() => {
  act(() => root?.unmount());
  container.remove();
});

function render(node: React.ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

const fridge = getTemplate("community-fridge", "en")!;

describe("TemplatePlaybook", () => {
  it("renders nothing without a template id", () => {
    render(<TemplatePlaybook templateId={null} variant="full" />);
    expect(container.textContent).toBe("");
  });

  it("renders nothing for an unknown template id", () => {
    render(<TemplatePlaybook templateId="not-a-real-template" variant="full" />);
    expect(container.textContent).toBe("");
  });

  it("full variant shows the template name and its first-steps / pitfalls guidance", () => {
    render(<TemplatePlaybook templateId="community-fridge" variant="full" />);
    const text = container.textContent ?? "";
    expect(text).toContain(fridge.name);
    expect(text).toContain(fridge.firstSteps!);
    expect(text).toContain(fridge.commonPitfalls!);
    // whatYoullNeed only appears in the full variant.
    expect(text).toContain(fridge.whatYoullNeed);
  });

  it("compact variant is a collapsed <details> without whatYoullNeed", () => {
    render(
      <TemplatePlaybook templateId="community-fridge" variant="compact" />,
    );
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details!.hasAttribute("open")).toBe(false);
    const text = container.textContent ?? "";
    expect(text).toContain(fridge.firstSteps!);
    // whatYoullNeed is a full-variant detail only.
    expect(text).not.toContain(fridge.whatYoullNeed);
  });
});
