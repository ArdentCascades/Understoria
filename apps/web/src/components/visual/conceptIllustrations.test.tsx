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
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  ConceptIllustration,
  type ConceptIllustrationName,
} from "./conceptIllustrations";

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

// Every concept's meaning lives in the OnboardingScreen text; these
// SVGs are enhancement only. The decorative contract is what lets
// prefers-contrast: more hide them safely, so assert it holds for all
// five names — including the two that reuse empty-state drawings.
const NAMES: readonly ConceptIllustrationName[] = [
  "timebank",
  "credit",
  "identity",
  "community",
  "projects",
];

describe("ConceptIllustration", () => {
  for (const name of NAMES) {
    it(`renders a decorative svg for "${name}"`, () => {
      act(() => {
        root = createRoot(container);
        root.render(<ConceptIllustration name={name} />);
      });
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute("data-decorative")).toBe("true");
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    });
  }
});
