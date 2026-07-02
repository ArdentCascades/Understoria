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
import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

// The app's one back-link primitive, extracted from TaskDetail's
// "← Back to {project}" affordance so detail pages stop reinventing
// back inconsistently (ghost buttons over navigate(-1), hardcoded
// destinations, unlabeled arrows). It is a real <Link> — middle-click,
// copy-link-address, and long-press all work — styled exactly like
// TaskDetail's original (btn-ghost, tucked to the leading edge).
//
// Two catalog conventions exist for back labels: some keys embed the
// leading arrow ("← Back", "← Back to calendar"), some don't
// ("Back to {{title}}"). The component adds the arrow only when the
// translated string doesn't already carry one, so both conventions
// render identically and no key needs migrating.

/** True when the current entry isn't the first in-app history entry —
 *  i.e. there is somewhere in-app to go back to. `idx` is the
 *  react-router v6 history index (0 on a cold entry / direct link). */
function hasInAppHistory(): boolean {
  const state = window.history.state as { idx?: number } | null;
  return typeof state?.idx === "number" && state.idx > 0;
}

/**
 * History-aware back: `navigate(-1)` when the page was reached from
 * inside the app, `navigate(fallbackTo)` on a cold entry (direct
 * link, fresh tab) where "back" would leave the app or do nothing.
 */
export function useHistoryAwareBack(fallbackTo: string): () => void {
  const navigate = useNavigate();
  return useCallback(() => {
    if (hasInAppHistory()) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  }, [navigate, fallbackTo]);
}

export interface BackLinkProps {
  /** Destination — the page's clear parent. With `preferHistory` this
   *  becomes the cold-entry fallback (and stays the anchor's href for
   *  open-in-new-tab). */
  to: string;
  /** Translated label. A leading "← " is prepended unless the string
   *  already starts with the arrow. */
  label: string;
  /** Override the default TaskDetail-parity classes
   *  (`btn-ghost -ml-2 mb-3 inline-block text-sm`). */
  className?: string;
  /** When true, a plain left-click goes back through in-app history
   *  when there is any, falling back to `to` on a cold entry.
   *  Modified clicks (new tab etc.) always follow the href. */
  preferHistory?: boolean;
}

export function BackLink({
  to,
  label,
  className,
  preferHistory = false,
}: BackLinkProps) {
  const navigate = useNavigate();
  const text = label.startsWith("←") ? label : `← ${label}`;
  return (
    <Link
      to={to}
      className={className ?? "btn-ghost -ml-2 mb-3 inline-block text-sm"}
      onClick={(e) => {
        if (!preferHistory || e.defaultPrevented) return;
        // Leave modified/aux clicks to the browser (new tab/window).
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
          return;
        if (hasInAppHistory()) {
          e.preventDefault();
          navigate(-1);
        }
      }}
    >
      {text}
    </Link>
  );
}
