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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconInstall, IconShare } from "@/components/visual";
import { useInstallGuide } from "@/lib/useInstallGuide";
import {
  SELECTABLE_DEVICES,
  type DeviceId,
  type InstallEnvironment,
} from "@/lib/installGuide";

// The human-facing "Add to Home Screen" affordance. The PWA is already
// fully installable (manifest + service worker); this is the calm,
// honest guide that helps a member actually find and trigger the
// install — never a buzzing nag (no-notifications).
//
// This component is the re-findable PANEL inside the Learn section: a
// reference a member can always come back to, with no dismiss. The
// dismissible Board CARD lives in components/useInstallCardNudge.tsx
// (so Board can show at most one calm prompt at a time); both surfaces
// drive off the same useInstallGuide() hook and share OneTapInstall,
// which is exported below.
//
// The `variant` prop selects the chrome around the shared `PanelBody`:
//
//   - "panel" (Learn section): the re-findable reference. Renders the
//     install.panel.title/intro heading above the body.
//   - "step" (onboarding tour): the body ONLY — the OnboardingScreen
//     supplies the screen title/intro, so a duplicate heading here would
//     read as a stutter. Everything below the heading is identical.
//
// Both variants drive off the same useInstallGuide() hook and share
// OneTapInstall (exported below), which the dismissible Board card in
// components/useInstallCardNudge.tsx also reuses.

type Variant = "panel" | "step";

export function InstallGuide({ variant }: { variant: Variant }) {
  const { t } = useTranslation();
  const { state, instructions, selectedDevice, selectDevice, promptInstall } =
    useInstallGuide();

  // Render nothing until we know the dismissed state — avoids a
  // flash-then-hide on every page load (same posture as the Board
  // nudges). `state` is null while the dismiss flag is loading.
  if (state === null) return null;

  // An installed app never nags about installing.
  if (state.kind === "installed") return null;

  const body = (
    <PanelBody
      state={state}
      instructions={instructions}
      selectedDevice={selectedDevice}
      selectDevice={selectDevice}
      onPrompt={promptInstall}
    />
  );

  // The onboarding step gets the body alone — its OnboardingScreen owns
  // the title + intro, so the panel heading would duplicate it.
  if (variant === "step") return body;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-moss-800 dark:text-moss-100">
          {t("install.panel.title")}
        </h3>
        <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
          {t("install.panel.intro")}
        </p>
      </div>
      {body}
    </div>
  );
}

// --- Panel body: the full guide, room to breathe -------------------
// The Learn panel is a re-findable reference, so it shows the primary
// affordance for the detected state plus a three-device toggle for the
// member to correct a misdetection or look up another device.

function PanelBody({
  state,
  instructions,
  selectedDevice,
  selectDevice,
  onPrompt,
}: {
  state: InstallEnvironment;
  instructions:
    | { labelKey: string; introKey: string; stepKeys: string[] }
    | null;
  selectedDevice: DeviceId | null;
  selectDevice: (device: DeviceId) => void;
  onPrompt: () => Promise<void>;
}) {
  // Chromium one-tap and the two "you can't install from here" states
  // are terminal — no device steps, no toggle.
  if (state.kind === "promptable") {
    return <OneTapInstall onPrompt={onPrompt} />;
  }
  if (state.kind === "ios-other") {
    return <IosOtherNotice />;
  }
  if (state.kind === "in-app-browser") {
    return <InAppBrowserNotice />;
  }

  // Otherwise (ios-safari / manual): the pictured steps for the
  // effective device, plus the device toggle so the member can switch.
  return (
    <div className="space-y-3">
      {instructions && (
        <DeviceSteps instructions={instructions} device={selectedDevice} />
      )}
      <DevicePicker value={selectedDevice} onChange={selectDevice} />
    </div>
  );
}

// --- Per-environment bodies ------------------------------------------

/** Chromium one-tap: a calm primary button that replays the captured
 *  beforeinstallprompt. Surfaces working / done states without buzzing.
 *  Shared by the Learn panel (here) and the Board card
 *  (components/useInstallCardNudge.tsx) — exported so the card reuses it
 *  rather than duplicating the working/done state machine. */
export function OneTapInstall({ onPrompt }: { onPrompt: () => Promise<void> }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "working" | "done">("idle");

  async function handleClick() {
    setStatus("working");
    await onPrompt();
    setStatus("done");
  }

  if (status === "done") {
    return (
      <p className="text-canopy-900 dark:text-canopy-100">
        {t("install.oneTap.done")}
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="btn-primary text-sm"
        onClick={() => void handleClick()}
        disabled={status === "working"}
      >
        {status === "working"
          ? t("install.oneTap.working")
          : t("install.oneTap.button")}
      </button>
    </div>
  );
}

/** Pictured steps for a device. For `ios` the live Share glyph sits on
 *  step 1 next to the "tap the Share button" mention so the instruction
 *  is unmistakable; other devices get plain numbered steps. */
function DeviceSteps({
  instructions,
  device,
}: {
  instructions: { labelKey: string; introKey: string; stepKeys: string[] };
  device: DeviceId | null;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="text-canopy-900 dark:text-canopy-100">
        {t(instructions.introKey)}
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-canopy-900 dark:text-canopy-100">
        {instructions.stepKeys.map((key, i) =>
          device === "ios" && i === 0 ? (
            <li key={key} className="flex flex-wrap items-center gap-1">
              <span>{t(key)}</span>
              <IconShare
                size={18}
                className="text-canopy-700 dark:text-canopy-300"
                data-decorative=""
              />
            </li>
          ) : device === "desktop" && i === 0 ? (
            // The desktop steps describe the address-bar install icon —
            // show the shape being described, mirroring the iOS Share
            // treatment (pilot report: "worth showing them what the
            // icon looks like").
            <li key={key} className="flex flex-wrap items-center gap-1">
              <span>{t(key)}</span>
              <IconInstall
                size={18}
                className="text-canopy-700 dark:text-canopy-300"
                data-decorative=""
              />
            </li>
          ) : (
            <li key={key}>{t(key)}</li>
          ),
        )}
      </ol>
      {device === "desktop" && (
        // The steps above are the Chrome/Edge family's. Firefox has no
        // desktop web-app install and Safari's lives in a menu — say
        // so instead of leaving members of those browsers hunting for
        // an icon that isn't there (pilot report).
        <p className="mt-2 text-xs text-canopy-800 dark:text-canopy-200">
          {t("install.desktop.otherBrowsersNote")}
        </p>
      )}
    </div>
  );
}

/** iOS on a non-Safari browser: on iOS only Safari can add to the home
 *  screen, so there are no steps to give — the only move is to reopen
 *  the page in Safari. */
function IosOtherNotice() {
  const { t } = useTranslation();
  return (
    <div className="space-y-1 text-canopy-900 dark:text-canopy-100">
      <p className="font-medium">{t("install.iosOther.title")}</p>
      <p>{t("install.iosOther.body")}</p>
    </div>
  );
}

/** In-app browser: there is no Add-to-Home-Screen affordance inside an
 *  embedded web view, so we point the member out to a real browser. No
 *  steps — the steps live in the real browser. */
function InAppBrowserNotice() {
  const { t } = useTranslation();
  return (
    <div className="space-y-1 text-canopy-900 dark:text-canopy-100">
      <p className="font-medium">{t("install.inAppBrowser.title")}</p>
      <p>{t("install.inAppBrowser.body")}</p>
      <p className="text-xs text-moss-600 dark:text-moss-300">
        {t("install.inAppBrowser.hint")}
      </p>
    </div>
  );
}

/** The "Adding from a different device?" toggle — a small segmented
 *  group of three buttons (iPhone or iPad / Android / Computer), NOT a
 *  <select>. Device ids map straight to their i18n leaves, so there's no
 *  kebab/camel bridge. The active device carries `aria-pressed` /
 *  `aria-current` so assistive tech reads the current selection. */
function DevicePicker({
  value,
  onChange,
}: {
  value: DeviceId | null;
  onChange: (device: DeviceId) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="text-xs text-moss-600 dark:text-moss-300">
      <p>{t("install.devicePicker.prompt")}</p>
      <div className="mt-1 inline-flex gap-1" role="group">
        {SELECTABLE_DEVICES.map((device) => {
          const active = value === device;
          return (
            <button
              key={device}
              type="button"
              aria-pressed={active}
              aria-current={active ? "true" : undefined}
              onClick={() => onChange(device)}
              className={
                active
                  ? "rounded-full bg-canopy-600 px-3 py-1 font-medium text-white dark:bg-canopy-500"
                  : "rounded-full border border-canopy-200 px-3 py-1 text-canopy-800 hover:bg-canopy-100 dark:border-canopy-800 dark:text-canopy-200 dark:hover:bg-canopy-900/40"
              }
            >
              {t(`install.devicePicker.${device}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
