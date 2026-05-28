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
import { Illustration, type IllustrationName } from "@/components/visual";

// Shared empty-state surface. Two layout variants:
//   - "card" — stands as its own card (e.g. an entire tab with no
//     items). Larger padding, the card chrome is owned here.
//   - "inset" — slots inside an existing card / section. No card
//     chrome, smaller padding.
//
// The optional action is a Link, not a button, because every
// current use case navigates to a route. If a non-navigation
// action ever appears, add an onClick branch then.
//
// Visual: prefer `illustration` (one of the named line-art SVGs)
// for new callsites. The legacy `icon` prop accepts an emoji
// string and remains supported until existing callsites migrate
// in the empty-states PR (workstream C). Set `illustration="none"`
// to omit the decorative element entirely.

interface EmptyStateProps {
  /** Named line-art illustration. Default: "sapling". */
  illustration?: IllustrationName | "none";
  /**
   * Legacy emoji icon. Used only when no `illustration` is given.
   * Prefer `illustration` in new code.
   */
  icon?: string | null;
  /** Optional short headline above the message. */
  title?: string;
  /** Plain-language description of what's empty and (often) why. */
  message: string;
  /** Optional call-to-action that links somewhere actionable. */
  action?: { label: string; to: string };
  variant?: "card" | "inset";
}

export function EmptyState({
  illustration,
  icon,
  title,
  message,
  action,
  variant = "card",
}: EmptyStateProps) {
  const container =
    variant === "card"
      ? "card flex flex-col items-center gap-stack-sm py-10 text-center"
      : "flex flex-col items-center gap-stack-sm py-6 text-center";

  // Precedence: explicit illustration > legacy icon > default sapling.
  // illustration="none" suppresses the graphic even if `icon` is set.
  const resolved: IllustrationName | null =
    illustration === "none"
      ? null
      : illustration
        ? illustration
        : icon
          ? null
          : "sapling";

  return (
    <div className={container}>
      {resolved ? (
        <Illustration
          name={resolved}
          className="text-canopy-700 dark:text-canopy-300"
        />
      ) : icon && illustration !== "none" ? (
        <div className="text-4xl" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      {title ? (
        <h3 className="text-heading font-semibold text-bark-800 dark:text-moss-100">
          {title}
        </h3>
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
