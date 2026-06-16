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
import { Link } from "react-router-dom";
import { IconShare } from "@/components/visual";
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
// Two surfaces, one component:
//   - variant="card"  → a dismissible card on Board. Has a header and a
//     "Not now" button wired to PERMANENT dismissal; renders nothing
//     once dismissed (mirrors FirstActionNudge's render-nothing-until-
//     known + permanent dismiss).
//   - variant="panel" → a re-findable panel inside the Learn section.
//     No dismiss — it's a reference a member can always come back to.
//
// (Designed so a "step" variant for the onboarding flow can slot in
// later; that integration is deliberately deferred to avoid a merge
// collision with Welcome.tsx.)

type Variant = "card" | "panel";

export function InstallGuide({ variant }: { variant: Variant }) {
  const { t } = useTranslation();
  const {
    state,
    dismissed,
    instructions,
    selectedDevice,
    selectDevice,
    promptInstall,
    dismiss,
  } = useInstallGuide();

  // The card carries its own framing (header + dismiss); the panel is
  // already wrapped by the Learn section, so it renders bare. The card
  // is permanently dismissible; the panel is a re-findable reference
  // and ignores the dismiss flag entirely.
  const isCard = variant === "card";

  // Render nothing until we know the dismissed state — avoids a
  // flash-then-hide on every page load (same posture as the Board
  // nudges). `state` is null while the dismiss flag is loading.
  if (state === null) return null;

  // The card honors permanent dismissal (render nothing once
  // dismissed); the panel does not.
  if (isCard && dismissed) return null;

  // An installed app never nags about installing.
  if (state.kind === "installed") return null;

  if (!isCard) {
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
        <PanelBody
          state={state}
          instructions={instructions}
          selectedDevice={selectedDevice}
          selectDevice={selectDevice}
          onPrompt={promptInstall}
        />
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={t("install.card.label")}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-canopy-200
                 bg-canopy-50 px-3 py-2 text-sm
                 dark:border-canopy-900 dark:bg-canopy-950/40"
    >
      <p className="font-medium text-canopy-900 dark:text-canopy-100">
        {t("install.card.title")}
      </p>
      <CardBody state={state} onPrompt={promptInstall} />
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => void dismiss()}
        >
          {t("install.card.dismiss")}
        </button>
      </div>
    </div>
  );
}

// --- Card body: minimal, one line at rest --------------------------
// The card lives on Board where space is precious, so each state gets a
// single line — never a dropdown, never an <ol>. The full guide (steps,
// the device toggle) lives in the Learn panel; every non-promptable
// card carries a "More help" link out to it.

function CardBody({
  state,
  onPrompt,
}: {
  state: InstallEnvironment;
  onPrompt: () => Promise<void>;
}) {
  const { t } = useTranslation();

  // Chromium one-tap stands alone — the install happens right here, so
  // there's nothing more to send the member to Learn for.
  if (state.kind === "promptable") {
    return <OneTapInstall onPrompt={onPrompt} />;
  }

  return (
    <>
      <CardHint state={state} />
      {/* Every manual/iOS card points out to the full guide in Learn.
          Deep-linking that link to auto-open the install panel is a
          follow-up; for now it lands on Profile, where the panel lives. */}
      <Link
        to="/profile"
        className="self-start text-xs font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
      >
        {t("install.card.moreHelp")} →
      </Link>
    </>
  );
}

/** The single-line hint for a non-promptable card state. The iOS-Safari
 *  line carries the live Share glyph so "tap Share" is unmistakable. */
function CardHint({ state }: { state: InstallEnvironment }) {
  const { t } = useTranslation();
  switch (state.kind) {
    case "ios-safari":
      return (
        <p className="flex flex-wrap items-center gap-1 text-canopy-900 dark:text-canopy-100">
          <IconShare
            size={18}
            className="text-canopy-700 dark:text-canopy-300"
            data-decorative=""
          />
          <span>{t("install.card.iosHint")}</span>
        </p>
      );
    case "ios-other":
      return (
        <p className="text-canopy-900 dark:text-canopy-100">
          {t("install.iosOther.body")}
        </p>
      );
    case "in-app-browser":
      return (
        <p className="text-canopy-900 dark:text-canopy-100">
          {t("install.inAppBrowser.body")}
        </p>
      );
    case "manual":
      return (
        <p className="text-canopy-900 dark:text-canopy-100">
          {state.device === "android"
            ? t("install.card.androidHint")
            : t("install.card.desktopHint")}
        </p>
      );
    // `promptable` is handled by CardBody; `installed` never reaches a
    // body. Listed for exhaustiveness (noFallthroughCasesInSwitch).
    case "promptable":
    case "installed":
      return null;
  }
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
 *  beforeinstallprompt. Surfaces working / done states without buzzing. */
function OneTapInstall({ onPrompt }: { onPrompt: () => Promise<void> }) {
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
          ) : (
            <li key={key}>{t(key)}</li>
          ),
        )}
      </ol>
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
