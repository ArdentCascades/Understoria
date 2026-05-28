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

// A small decorative sprig of leaves. Used as a quiet ornament
// alongside page-level titles (Welcome lockup, onboarding, etc.).
// Always aria-hidden — purely visual.

export function Sprig({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable={false}
      data-decorative="true"
      className={className}
    >
      <path d="M16 30V8" />
      <path d="M16 18c-3-4-8-5-12-4 1 5 6 8 11 7" />
      <path d="M16 14c3-4 8-5 12-4-1 5-6 8-11 7" />
      <path d="M16 10c-2-3-5-3-8-2 1 3 4 5 7 4" />
      <path d="M16 8c2-3 4-3 6-2-1 3-3 4-5 4" />
    </svg>
  );
}
