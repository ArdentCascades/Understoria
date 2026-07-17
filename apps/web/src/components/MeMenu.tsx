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
import { useEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import { OPEN_PALETTE_EVENT } from "@/components/CommandPalette";
import {
  IconHelp,
  IconInfrastructure,
  IconInvite,
  IconProfile,
  IconSearch,
  IconSettings,
  type IconProps,
} from "@/components/visual";

// The "me menu" — a right-side drawer holding the low-frequency,
// about-you destinations so the tab bar can spend its five slots on
// daily work. Deliberately SHORT (see docs/navigation-shell.md): every
// extra row makes Profile/Settings/Help harder to find, so additions
// need a reason a member would look for them *here*.
//
// A right-side drawer (not left) because the bottom tabs / left rail
// remain the primary navigation — this is the account/utility tier,
// which convention puts top-right. Focus-trapped, Esc-closes, closes
// on any selection; the slide honors prefers-reduced-motion by
// arriving without the transform transition.

export function MeMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { currentMember } = useApp();
  const panelRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(panelRef, open);

  // Entrance animation: mount closed, then slide in on the next
  // frame. Rendered only while open, so closing is immediate — a
  // member dismissing chrome shouldn't wait on a transition.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const itemClass =
    "touch-target flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-moss-700 hover:bg-canopy-50 hover:text-canopy-800 dark:text-moss-200 dark:hover:bg-canopy-950/40 dark:hover:text-canopy-200";

  // Portaled to <body>: the component mounts inside the AppHeader,
  // whose backdrop-filter makes the header the CONTAINING BLOCK for
  // fixed-position descendants — rendered in place, this "fullscreen"
  // overlay is actually sized to the 44px header band (the scrim only
  // dimmed and tap-closed the top strip, and the off-screen panel sat
  // in the header's coordinate space). The portal restores true
  // viewport geometry.
  return createPortal(
    <div className="fixed inset-0 z-50 print:hidden">
      {/* Scrim — same tone as ConfirmDialog's. The close handler
          lives on the scrim itself: it covers every pixel the panel
          doesn't, so "tap outside the panel" and "tap the scrim" are
          the same event (a container-level target check never fires —
          the scrim is always the topmost target). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-moss-950/40"
        onPointerDown={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu.title")}
        className={`absolute right-0 top-0 flex h-dvh w-80 max-w-[85vw] flex-col border-l border-moss-200 bg-white pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-xl transition-transform duration-200 motion-reduce:transition-none dark:border-moss-800 dark:bg-moss-950 ${
          entered ? "translate-x-0" : "translate-x-full motion-reduce:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-moss-200 p-3 dark:border-moss-800">
          <span className="px-1 text-sm font-semibold text-moss-700 dark:text-moss-200">
            {t("menu.title")}
          </span>
          <button
            type="button"
            className="touch-target rounded-xl px-3 py-2 text-moss-600 hover:bg-moss-100 hover:text-moss-900 dark:text-moss-300 dark:hover:bg-moss-800 dark:hover:text-moss-50"
            aria-label={t("menu.close")}
            onClick={onClose}
          >
            <span aria-hidden="true">{"✕"}</span>
          </button>
        </div>
        <nav aria-label={t("menu.title")} className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col gap-1">
            {/* Profile leads, rendered as an identity row — the member's
                own name answers "where did my profile go?" faster than
                the word "Profile" would. */}
            <li>
              <Link to="/profile" className={itemClass} onClick={onClose}>
                <IconProfile size={20} />
                <span className="min-w-0">
                  <span className="block truncate">
                    {currentMember?.displayName ?? t("menu.profile")}
                  </span>
                  {currentMember && (
                    <span className="block truncate text-xs font-normal text-moss-600 dark:text-moss-300">
                      {t("menu.profileHint")}
                    </span>
                  )}
                </span>
              </Link>
            </li>
            <MenuLink
              to="/settings"
              Icon={IconSettings}
              label={t("menu.settings")}
              onClose={onClose}
            />
            <MenuLink
              to="/profile#invites"
              Icon={IconInvite}
              label={t("menu.invite")}
              onClose={onClose}
            />
            <MenuLink
              to="/help"
              Icon={IconHelp}
              label={t("menu.help")}
              onClose={onClose}
            />
            <li>
              <button
                type="button"
                className={itemClass}
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT));
                }}
              >
                <IconSearch size={20} />
                <span className="flex-1">{t("menu.search")}</span>
                <kbd
                  aria-hidden="true"
                  className="hidden rounded border border-moss-200 px-1.5 py-0.5 text-[0.6875rem] font-normal text-moss-600 lg:inline dark:border-moss-700 dark:text-moss-300"
                >
                  {"Ctrl+K"}
                </kbd>
              </button>
            </li>
            <MenuLink
              to="/infrastructure"
              Icon={IconInfrastructure}
              label={t("menu.infrastructure")}
              onClose={onClose}
            />
          </ul>
        </nav>
      </div>
    </div>,
    document.body,
  );
}

function MenuLink({
  to,
  Icon,
  label,
  onClose,
}: {
  to: string;
  Icon: ComponentType<IconProps>;
  label: string;
  onClose: () => void;
}) {
  return (
    <li>
      <Link
        to={to}
        className="touch-target flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-moss-700 hover:bg-canopy-50 hover:text-canopy-800 dark:text-moss-200 dark:hover:bg-canopy-950/40 dark:hover:text-canopy-200"
        onClick={onClose}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    </li>
  );
}
