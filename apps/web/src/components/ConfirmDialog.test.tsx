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
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import i18n from "@/i18n";
import { ConfirmDialog } from "./ConfirmDialog";

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
    root.render(node);
  });
}

describe("ConfirmDialog — localized default labels", () => {
  // Regression guard: the component used to default to hardcoded
  // English "Cancel"/"Confirm", which leaked "Cancel" next to
  // "Sí, tomarla" on the Spanish claim dialog. Defaults now come
  // from common.cancel / common.confirm.
  it("falls back to Spanish labels under the es locale", async () => {
    await i18n.changeLanguage("es");
    try {
      render(
        <ConfirmDialog
          open
          title="¿Tomar esta publicación?"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );
      const buttons = Array.from(document.querySelectorAll("button")).map(
        (b) => b.textContent,
      );
      expect(buttons).toContain("Cancelar");
      expect(buttons).toContain("Confirmar");
      expect(buttons).not.toContain("Cancel");
    } finally {
      await i18n.changeLanguage("en");
    }
  });

  it("still honors caller-provided labels", () => {
    render(
      <ConfirmDialog
        open
        title="Cancel event?"
        confirmLabel="Sign cancellation"
        cancelLabel="Keep the event"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    const buttons = Array.from(document.querySelectorAll("button")).map(
      (b) => b.textContent,
    );
    expect(buttons).toContain("Sign cancellation");
    expect(buttons).toContain("Keep the event");
  });
});
