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
import { Link } from "react-router-dom";

// Shared empty-state surface. Two layout variants:
//   - "card" — stands as its own card (e.g. an entire tab with no
//     items). Larger padding, the card chrome is owned here.
//   - "inset" — slots inside an existing card / section. No card
//     chrome, smaller padding.
//
// The optional action is a Link, not a button, because every
// current use case navigates to a route. If a non-navigation
// action ever appears, add an onClick branch then.

interface EmptyStateProps {
  /** Decorative emoji. Default: a sapling. Set to `null` to omit. */
  icon?: string | null;
  /** Plain-language description of what's empty and (often) why. */
  message: string;
  /** Optional call-to-action that links somewhere actionable. */
  action?: { label: string; to: string };
  variant?: "card" | "inset";
}

export function EmptyState({
  icon = "\u{1F331}",
  message,
  action,
  variant = "card",
}: EmptyStateProps) {
  const container =
    variant === "card"
      ? "card flex flex-col items-center gap-2 py-10 text-center"
      : "flex flex-col items-center gap-2 py-6 text-center";
  return (
    <div className={container}>
      {icon ? (
        <div className="text-4xl" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <p className="max-w-sm text-sm text-moss-600 dark:text-moss-300">
        {message}
      </p>
      {action ? (
        <Link to={action.to} className="btn-primary mt-2">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
