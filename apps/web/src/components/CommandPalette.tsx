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
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import {
  buildPaletteIndex,
  searchPalette,
  type PaletteEntry,
} from "@/lib/commandPalette";
import { FAQ_SECTIONS } from "@/content/faq";
import { FAQ_SECTIONS_ES } from "@/content/faq.es";

// The command palette (docs/desktop-power-tools.md plan 1, P1):
// Ctrl/Cmd+K anywhere opens a search over everything this device
// already holds — posts, projects, events, members, proposals, Help
// — plus navigation. All local, nothing recorded.
//
// Interaction contract:
//   - Ctrl/Cmd+K toggles, DELIBERATELY including while focus is in a
//     form field — that is how every palette behaves and the whole
//     point of a chord shortcut (contrast useSlashFocus, whose bare
//     `/` must never fire mid-typing).
//   - Focus lives in the input the whole time (combobox +
//     aria-activedescendant); ArrowUp/Down move the active option,
//     Enter selects, Escape closes. Mouse selection uses mousedown
//     so it wins against the input's blur.
//   - Selection navigates and closes; query resets so the next open
//     starts fresh (a launcher, not a saved search — nothing about
//     what was searched persists anywhere).
// The me-menu's Search row opens the palette without a keyboard —
// dispatched as a window event so the two components stay uncoupled
// (and the first palette doorway mobile users have ever had).
export const OPEN_PALETTE_EVENT = "understoria:open-palette";

export function CommandPalette() {
  const { posts, projects, events, members, proposals } = useApp();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onOpenEvent() {
      setOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  const index = useMemo(() => {
    const es = i18n.resolvedLanguage?.startsWith("es") ?? false;
    const faq = es ? FAQ_SECTIONS_ES : FAQ_SECTIONS;
    return buildPaletteIndex({
      routes: [
        { kind: "route", id: "route:/", title: t("nav.board"), to: "/" },
        {
          kind: "route",
          id: "route:/dashboard",
          title: t("nav.dashboard"),
          to: "/dashboard",
        },
        {
          kind: "route",
          id: "route:/calendar",
          title: t("nav.calendar"),
          to: "/calendar",
        },
        {
          kind: "route",
          id: "route:/messages",
          title: t("nav.messages"),
          to: "/messages",
        },
        {
          kind: "route",
          id: "route:/my-work",
          title: t("nav.myWork"),
          to: "/my-work",
        },
        {
          kind: "route",
          id: "route:/profile",
          title: t("nav.profile"),
          to: "/profile",
        },
        {
          kind: "route",
          id: "route:/help",
          title: t("palette.routes.help"),
          to: "/help",
        },
        {
          kind: "route",
          id: "route:/settings",
          title: t("palette.routes.settings"),
          to: "/settings",
        },
        {
          kind: "route",
          id: "route:/proposals",
          title: t("palette.routes.proposals"),
          to: "/proposals",
        },
        {
          kind: "route",
          id: "route:/desk",
          title: t("palette.routes.desk"),
          to: "/desk",
        },
        {
          kind: "route",
          id: "route:/present",
          title: t("palette.routes.present"),
          to: "/present",
        },
        {
          kind: "route",
          id: "route:/infrastructure",
          title: t("palette.routes.infrastructure"),
          to: "/infrastructure",
        },
        {
          kind: "route",
          id: "route:/post/new",
          title: t("palette.routes.newPost"),
          to: "/post/new",
        },
        {
          kind: "route",
          id: "route:/project/new",
          title: t("palette.routes.newProject"),
          to: "/project/new",
        },
        {
          kind: "route",
          id: "route:/events/new",
          title: t("palette.routes.newEvent"),
          to: "/events/new",
        },
      ],
      posts,
      projects,
      events,
      members,
      proposals,
      help: faq.flatMap((s) => s.entries.map((e) => ({ id: e.id, question: e.question }))),
      labels: {
        postNeed: t("palette.kind.postNeed"),
        postOffer: t("palette.kind.postOffer"),
        project: t("palette.kind.project"),
        event: t("palette.kind.event"),
        member: t("palette.kind.member"),
        proposal: t("palette.kind.proposal"),
        help: t("palette.kind.help"),
      },
    });
  }, [posts, projects, events, members, proposals, t, i18n.resolvedLanguage]);

  const results = useMemo(() => searchPalette(index, query), [index, query]);

  // Keep the active option in range as results narrow.
  useEffect(() => {
    if (activeIndex >= results.length) setActiveIndex(0);
  }, [results.length, activeIndex]);

  function select(entry: PaletteEntry) {
    setOpen(false);
    navigate(entry.to);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const entry = results[activeIndex];
      if (entry) {
        e.preventDefault();
        select(entry);
      }
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("palette.ariaLabel")}
      className="fixed inset-0 z-50 flex items-start justify-center bg-moss-950/40 p-4 pt-[12vh] print:hidden"
    >
      {/* Click-away backdrop as a real button (a11y-clean, and the
          dialog's Escape is already on the input). */}
      <button
        type="button"
        aria-label={t("palette.close")}
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={() => setOpen(false)}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-xl rounded-2xl border border-moss-200 bg-white shadow-xl motion-safe:animate-fade-in dark:border-moss-700 dark:bg-moss-950"
      >
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="palette-listbox"
          aria-activedescendant={
            results[activeIndex] ? `palette-opt-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          className="input rounded-b-none border-0 border-b border-moss-200 px-4 py-3 focus:ring-0 dark:border-moss-700"
          placeholder={t("palette.placeholder")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleInputKeyDown}
        />
        <ul
          id="palette-listbox"
          role="listbox"
          aria-label={t("palette.resultsAriaLabel")}
          className="max-h-[50vh] overflow-y-auto p-2"
        >
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-moss-600 dark:text-moss-300">
              {t("palette.noResults")}
            </li>
          )}
          {results.map((entry, i) => (
            <li
              key={entry.id}
              id={`palette-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                i === activeIndex
                  ? "bg-canopy-50 text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100"
                  : "text-moss-900 dark:text-moss-100"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                select(entry);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className="min-w-0 flex-1 truncate">{entry.title}</span>
              {entry.subtitle && (
                <span className="shrink-0 text-xs text-moss-600 dark:text-moss-300">
                  {entry.subtitle}
                </span>
              )}
            </li>
          ))}
        </ul>
        {/* Keyboard-hint footer. Visual only — the combobox a11y
            wiring above carries the interaction model — and hidden on
            touch-primary devices, where "↑↓ / Enter / Esc" is
            meaningless (Tailwind 3 has no pointer-coarse: variant, so
            an arbitrary media variant does it). */}
        <p className="hidden border-t border-moss-100 px-4 py-2 text-xs text-moss-600 dark:border-moss-800 dark:text-moss-300 [@media(pointer:fine)]:block">
          {t("palette.hint")}
        </p>
      </div>
    </div>
  );
}
