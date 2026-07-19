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

// The house filters-disclosure trio, extracted from Board.tsx when the
// Calendar adopted the same pattern (field report: the always-open
// filter row pushed the actual calendar off a phone screen). One
// grammar for filters everywhere:
//
//   [Filters · N active ▸] [chip ×] [chip ×]     ← collapsed (default)
//   [Filters · N active ▾]                        ← expanded
//   ┌─ card ────────────────────────────┐
//   │  …controls…              Done     │
//   └───────────────────────────────────┘
//
// The pill is the ONE disclosure at every width; the removable chips
// keep applied state visible while collapsed, so collapsing costs a
// click only when actually CHANGING filters — never visibility. The
// count rides the label as plain text ("Filters · 2 active") — no
// badge pill, no dot (no-notifications principle: no badge counts).
// aria-expanded/aria-controls carry the disclosure semantics; Done
// returns focus to the pill so keyboard / screen-reader members land
// back on the trigger rather than at the top of <body>.

/** Compact pill trigger for a collapsed filter drawer. */
export function FiltersToggle({
  open,
  activeCount,
  controlsId,
  onToggle,
  buttonRef,
}: {
  open: boolean;
  activeCount: number;
  /** id of the collapsible drawer wrapper this trigger controls. */
  controlsId: string;
  onToggle: () => void;
  /** The panel's "Done" button returns focus here on close, so
   *  keyboard / screen-reader members land back on the trigger
   *  rather than at the top of <body>. */
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  const { t } = useTranslation();
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-expanded={open}
      aria-controls={controlsId}
      onClick={onToggle}
      className="card flex min-h-[44px] items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-canopy-800 transition-colors hover:bg-moss-50 active:bg-moss-100 dark:text-canopy-200 dark:hover:bg-moss-800"
    >
      <span>
        {activeCount > 0
          ? t("common.filters.toggleActive", { count: activeCount })
          : t("common.filters.toggle")}
      </span>
      {/* Sighted-only state cue; aria-expanded carries the meaning. */}
      <span aria-hidden="true" className="text-moss-600 dark:text-moss-300">
        {open ? "▾" : "▸"}
      </span>
    </button>
  );
}

/** Active-filter chips beside the Filters toggle: the applied state
 *  stays visible while the controls themselves are collapsed, and
 *  each chip removes its filter in one tap. Every chip carries an
 *  explicit accessible name ("Remove filter: …") and the 44px
 *  touch-target floor. */
export function ActiveFilterChips({
  entries,
}: {
  entries: Array<{ id: string; label: string; onRemove: () => void }>;
}) {
  const { t } = useTranslation();
  if (entries.length === 0) return null;
  return (
    <>
      {entries.map((e) => (
        <button
          key={e.id}
          type="button"
          onClick={e.onRemove}
          aria-label={t("common.filters.removeFilter", { label: e.label })}
          className="touch-target inline-flex items-center gap-1 rounded-full bg-canopy-100 px-3 py-1 text-sm font-medium text-canopy-900 hover:bg-canopy-200 dark:bg-canopy-900/60 dark:text-canopy-100 dark:hover:bg-canopy-900"
        >
          {e.label}
          <span aria-hidden="true">×</span>
        </button>
      ))}
    </>
  );
}

/** Bottom-right "Done" inside the open filter drawer — closes the
 *  disclosure without reaching back up to the pill and returns focus
 *  to the trigger (handled by the caller's onDone). Right-aligned,
 *  quiet register; the drawer's controls are the loud content. */
export function FilterPanelDone({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="mt-3 flex justify-end">
      <button
        type="button"
        onClick={onDone}
        className="touch-target inline-flex items-center px-2 text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
      >
        {t("common.filters.done")}
      </button>
    </div>
  );
}
