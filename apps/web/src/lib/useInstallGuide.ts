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
  clearDeferredPrompt,
  currentInstallEnvironment,
  DEVICE_INSTRUCTIONS,
  dismissInstallGuide,
  getDeferredPrompt,
  isInstallGuideDismissed,
  subscribeInstallPrompt,
  subscribeStandalone,
  type DeviceId,
  type InstallEnvironment,
} from "@/lib/installGuide";

/** What `useInstallGuide` returns. `state` is null until the dismissed
 *  flag has been read (render-nothing-until-known, like the nudges);
 *  once known it's the live `InstallEnvironment`. `instructions` is the
 *  per-device key bundle for the effective device (null when there's no
 *  device to show steps for — e.g. promptable / in-app-browser).
 *  `selectedDevice` overrides the detected device when the member picks
 *  a different one from the "different device?" toggle. */
export interface UseInstallGuide {
  /** The detected install posture, or null while loading. */
  state: InstallEnvironment | null;
  /** True once the member dismissed the card permanently. */
  dismissed: boolean;
  /** Per-device instruction keys for the currently effective device
   *  (selected override, else detected). Null when no device applies. */
  instructions:
    | { labelKey: string; introKey: string; stepKeys: string[] }
    | null;
  /** The device whose steps are showing — selected override or the
   *  detected one. Null when no device applies. */
  selectedDevice: DeviceId | null;
  /** Pick a device for the "different device?" toggle. */
  selectDevice: (device: DeviceId) => void;
  /** Replay the captured beforeinstallprompt. Resolves once the member
   *  has answered the native dialog. */
  promptInstall: () => Promise<void>;
  /** Permanently dismiss the install card. */
  dismiss: () => Promise<void>;
}

/**
 * Drives the install guide. Subscribes to the capture + standalone
 * signals so the environment stays live (e.g. a `beforeinstallprompt`
 * arriving after mount flips `manual` → `promptable`, and an install
 * mid-session flips everything → `installed`). Reads the dismissed
 * sentinel once on mount, like the Board nudges, so we never
 * flash-then-hide.
 */
export function useInstallGuide(): UseInstallGuide {
  const [dismissedState, setDismissedState] = useState<boolean | null>(null);
  const [environment, setEnvironment] = useState<InstallEnvironment>(() =>
    currentInstallEnvironment(),
  );
  const [selectedDevice, setSelectedDevice] = useState<DeviceId | null>(null);

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

  const selectDevice = useCallback((device: DeviceId) => {
    setSelectedDevice(device);
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

  // The device whose steps to show: the explicit selection wins; else
  // the detected device for the manual/iOS states (so the panel's toggle
  // defaults sensibly). null for promptable / in-app-browser, where no
  // device steps apply.
  const effectiveDevice: DeviceId | null =
    selectedDevice ??
    (environment.kind === "manual"
      ? environment.device
      : environment.kind === "ios-safari" || environment.kind === "ios-other"
        ? "ios"
        : null);

  const instructions =
    effectiveDevice !== null ? DEVICE_INSTRUCTIONS[effectiveDevice] : null;

  // Render-nothing-until-known: `state` is null until the dismissed
  // flag resolves. Components branch on `state === null` → render null.
  const state = dismissedState === null ? null : environment;

  return {
    state,
    dismissed: dismissedState === true,
    instructions,
    selectedDevice: effectiveDevice,
    selectDevice,
    promptInstall,
    dismiss,
  };
}
