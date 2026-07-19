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
import type { ReactNode } from "react";

// Settings is organized by the ONE question that matters when you look
// at a control: who can change this, and how? Three zones answer it —
//   • "On this device"        — you change these; device-local.
//   • "How this community is run" — decided together by proposal & vote.
//   • "This node"             — set up by whoever runs the server.
// The `authority` line under each heading states that answer in plain
// words, so the honesty is in the structure, not buried in per-field
// copy. A control that lives in the wrong zone is a lie about who holds
// the power over it — the zones exist to keep that from happening.
//
// Presentational only: the heading + the authority lead-in + the cards.
// `columns` opts a zone into the lg two-column masonry (used by the
// device zone, which carries the bulk of the cards); the community and
// node zones stay single-column because two or three cards balance
// worse than they read stacked.
export function SettingsZone({
  id,
  title,
  authority,
  columns = false,
  children,
}: {
  id: string;
  title: string;
  authority: string;
  columns?: boolean;
  children: ReactNode;
}) {
  const headingId = `settings-zone-${id}`;
  return (
    <section
      aria-labelledby={headingId}
      className="mb-8 last:mb-0 landscape-short:mb-6"
    >
      <div className="mb-3 border-b border-bark-200/60 pb-2 dark:border-moss-800">
        <h2
          id={headingId}
          className="text-base font-semibold text-canopy-800 dark:text-canopy-200"
        >
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-moss-600 dark:text-moss-300">
          {authority}
        </p>
      </div>
      {columns ? (
        <div className="lg:columns-2 lg:gap-4 [&>*]:break-inside-avoid">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
