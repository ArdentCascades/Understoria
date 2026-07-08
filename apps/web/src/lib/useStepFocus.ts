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
import { useEffect, useRef, type MutableRefObject } from "react";

/**
 * Focus discipline for INLINE multi-step flows (the ceremony/recovery
 * wizards) — the same principle `ConfirmDialog` applies to dialogs
 * (`docs/accessibility.md` §5): when a step change unmounts the
 * button the user just pressed, focus falls to `<body>` and a
 * keyboard or screen-reader user loses their place.
 *
 * Attach the returned ref to each step's container along with
 * `tabIndex={-1}`; the container receives focus whenever `step`
 * CHANGES. The first render deliberately does not steal focus —
 * unlike a dialog, an inline section appearing on a page must not
 * yank the reading position.
 */
export function useStepFocus<T extends HTMLElement = HTMLDivElement>(
  step: unknown,
): MutableRefObject<T | null> {
  const ref = useRef<T | null>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.focus();
  }, [step]);
  return ref;
}
