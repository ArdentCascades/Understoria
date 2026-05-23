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
import { useTranslation } from "react-i18next";

// "Skip to main content" link. Visually hidden until it receives
// focus (first Tab press on any page); then renders as a normal
// link that jumps the focus past the layout chrome to whatever
// the page treats as primary content. WCAG 2.1 SC 2.4.1.

interface SkipLinkProps {
  /** ID of the element to jump to. Defaults to "main". */
  targetId?: string;
}

export function SkipLink({ targetId = "main" }: SkipLinkProps) {
  const { t } = useTranslation();
  return (
    <a
      href={`#${targetId}`}
      className="
        sr-only
        focus:not-sr-only
        focus:fixed
        focus:left-4
        focus:top-4
        focus:z-50
        focus:rounded-md
        focus:bg-canopy-700
        focus:px-3
        focus:py-2
        focus:text-sm
        focus:font-medium
        focus:text-canopy-50
        focus:shadow-lg
      "
    >
      {t("a11y.skipToMain")}
    </a>
  );
}
