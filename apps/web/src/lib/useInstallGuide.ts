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
import { useCallback, useEffect, useState } from "react";
import {
  BROWSER_INSTRUCTIONS,
  clearDeferredPrompt,
  currentInstallEnvironment,
  dismissInstallGuide,
  getDeferredPrompt,
  isInstallGuideDismissed,
  subscribeInstallPrompt,
  subscribeStandalone,
  type BrowserId,
  type InstallEnvironment,
} from "@/lib/installGuide";

/** What `useInstallGuide` returns. `state` is null until the dismissed
 *  flag has been read (render-nothing-until-known, like the nudges);
 *  once known it's the live `InstallEnvironment`. `instructions` is the
 *  per-browser key bundle for the manual branch (null when not manual).
 *  `selectedBrowser` overrides the detected browser when the member
 *  picks a different one from the "different browser?" selector. */
export interface UseInstallGuide {
  /** The detected install posture, or null while loading. */
  state: InstallEnvironment | null;
  /** True once the member dismissed the card permanently. */
  dismissed: boolean;
  /** Per-browser instruction keys for the currently effective browser
   *  (selected override, else detected). Null unless manual/unknown. */
  instructions:
    | { labelKey: string; introKey: string; stepKeys: string[] }
    | null;
  /** The browser whose steps are showing — selected override or the
   *  detected one. Null unless manual/unknown. */
  selectedBrowser: BrowserId | null;
  /** Pick a browser for the "different browser?" selector. */
  selectBrowser: (browser: BrowserId) => void;
  /** Replay the captured beforeinstallprompt. Resolves once the member
   *  has answered the native dialog. */
  promptInstall: () => Promise<void>;
  /** Permanently dismiss the install card. */
  dismiss: () => Promise<void>;
}

/**
 * Drives the install guide. Subscribes to the capture + standalone
 * signals so the environment stays live (e.g. a `beforeinstallprompt`
 * arriving after mount flips `unknown`/`manual` → `promptable`, and an
 * install mid-session flips everything → `installed`). Reads the
 * dismissed sentinel once on mount, like the Board nudges, so we never
 * flash-then-hide.
 */
export function useInstallGuide(): UseInstallGuide {
  const [dismissedState, setDismissedState] = useState<boolean | null>(null);
  const [environment, setEnvironment] = useState<InstallEnvironment>(() =>
    currentInstallEnvironment(),
  );
  const [selectedBrowser, setSelectedBrowser] = useState<BrowserId | null>(
    null,
  );

  // Read the permanent-dismiss flag once. Until it resolves, `state`
  // stays null so the component renders nothing (no flash for members
  // who already dismissed).
  useEffect(() => {
    let cancelled = false;
    void isInstallGuideDismissed().then((v) => {
      if (!cancelled) setDismissedState(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the environment live. A captured beforeinstallprompt or a
  // display-mode change both re-derive it from the current globals.
  useEffect(() => {
    const recompute = () => setEnvironment(currentInstallEnvironment());
    const unsubPrompt = subscribeInstallPrompt(recompute);
    const unsubStandalone = subscribeStandalone(recompute);
    // Re-derive once on mount in case the prompt was captured between
    // the initial useState and this effect running.
    recompute();
    return () => {
      unsubPrompt();
      unsubStandalone();
    };
  }, []);

  const selectBrowser = useCallback((browser: BrowserId) => {
    setSelectedBrowser(browser);
  }, []);

  const promptInstall = useCallback(async () => {
    const event = getDeferredPrompt();
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    // A prompt can only be replayed once — drop it either way.
    clearDeferredPrompt();
    if (choice.outcome === "accepted") {
      // Accepting writes the dismiss flag so the card never resurfaces.
      // (`appinstalled` also writes it, but that event can lag or, on
      // some engines, not fire — writing here keeps the contract tight.)
      setDismissedState(true);
      await dismissInstallGuide();
    }
  }, []);

  const dismiss = useCallback(async () => {
    setDismissedState(true);
    await dismissInstallGuide();
  }, []);

  // The browser whose steps to show: the explicit selection wins; else
  // the detected one for a `manual` environment. Only meaningful for
  // the manual / unknown branches.
  const effectiveBrowser: BrowserId | null =
    selectedBrowser ??
    (environment.kind === "manual" ? environment.browser : null);

  const instructions =
    effectiveBrowser !== null ? BROWSER_INSTRUCTIONS[effectiveBrowser] : null;

  // Render-nothing-until-known: `state` is null until the dismissed
  // flag resolves. Components branch on `state === null` → render null.
  const state = dismissedState === null ? null : environment;

  return {
    state,
    dismissed: dismissedState === true,
    instructions,
    selectedBrowser: effectiveBrowser,
    selectBrowser,
    promptInstall,
    dismiss,
  };
}
