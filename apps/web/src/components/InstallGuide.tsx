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
import { IconShare } from "@/components/visual";
import { useInstallGuide } from "@/lib/useInstallGuide";
import { SELECTABLE_BROWSERS, type BrowserId } from "@/lib/installGuide";

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
    selectedBrowser,
    selectBrowser,
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

  function Body() {
    switch (state!.kind) {
      case "promptable":
        return <OneTapInstall onPrompt={promptInstall} />;
      case "ios-safari":
        return <IosSteps />;
      case "in-app-browser":
        return <InAppBrowserNotice />;
      case "manual":
      case "unknown":
        return (
          <ManualSteps
            instructions={instructions}
            selectedBrowser={selectedBrowser}
            selectBrowser={selectBrowser}
            // For `unknown` the selector is the PRIMARY affordance, so
            // surface it prominently rather than as an afterthought.
            selectorIsPrimary={state!.kind === "unknown"}
          />
        );
      // `installed` is handled above (returns null); listed for
      // exhaustiveness so noFallthroughCasesInSwitch stays satisfied.
      case "installed":
        return null;
    }
  }

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
        <Body />
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
      <p className="text-canopy-900 dark:text-canopy-100">
        {t("install.card.body")}
      </p>
      <Body />
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

/** iOS Safari: the three Share steps, with the live Share glyph next to
 *  the "tap the Share button" mention so the instruction is
 *  unmistakable. */
function IosSteps() {
  const { t } = useTranslation();
  return (
    <div>
      <p className="text-canopy-900 dark:text-canopy-100">
        {t("install.ios.intro")}
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-canopy-900 dark:text-canopy-100">
        <li className="flex flex-wrap items-center gap-1">
          <span>{t("install.ios.step1")}</span>
          <IconShare
            size={18}
            className="text-canopy-700 dark:text-canopy-300"
            data-decorative=""
          />
        </li>
        <li>{t("install.ios.step2")}</li>
        <li>{t("install.ios.step3")}</li>
      </ol>
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

/** Manual / unknown: pictured steps for the effective browser plus the
 *  "different browser?" selector. For `unknown`, no steps render until
 *  the member picks a browser — the selector is the primary affordance. */
function ManualSteps({
  instructions,
  selectedBrowser,
  selectBrowser,
  selectorIsPrimary,
}: {
  instructions:
    | { labelKey: string; introKey: string; stepKeys: string[] }
    | null;
  selectedBrowser: BrowserId | null;
  selectBrowser: (browser: BrowserId) => void;
  selectorIsPrimary: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      {instructions && (
        <div>
          <p className="text-canopy-900 dark:text-canopy-100">
            {t(instructions.introKey)}
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-canopy-900 dark:text-canopy-100">
            {instructions.stepKeys.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
        </div>
      )}
      <BrowserSelector
        value={selectedBrowser}
        onChange={selectBrowser}
        primary={selectorIsPrimary}
      />
    </div>
  );
}

/** The "Using a different browser?" picker — a labelled <select> that
 *  drives `selectBrowser`. */
function BrowserSelector({
  value,
  onChange,
  primary,
}: {
  value: BrowserId | null;
  onChange: (browser: BrowserId) => void;
  primary: boolean;
}) {
  const { t } = useTranslation();
  const labelText = primary
    ? t("install.selector.choose")
    : t("install.selector.prompt");
  return (
    <label className="block text-xs text-moss-600 dark:text-moss-300">
      <span>{labelText}</span>
      <select
        className="input mt-1 text-sm"
        value={value ?? ""}
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value as BrowserId);
        }}
      >
        <option value="" disabled>
          {t("install.selector.choose")}
        </option>
        {SELECTABLE_BROWSERS.map((browser) => (
          <option key={browser} value={browser}>
            {t(`install.selector.browsers.${browserKeyMap[browser]}`)}
          </option>
        ))}
      </select>
    </label>
  );
}

// BrowserId values are kebab-case; the i18n leaf names are camelCase.
// This small map keeps the option labels keyed off the canonical
// BrowserId without spreading the naming mismatch through the deck.
const browserKeyMap: Record<BrowserId, string> = {
  "ios-safari": "iosSafari",
  "chrome-android": "chromeAndroid",
  samsung: "samsung",
  "firefox-android": "firefoxAndroid",
  "chrome-desktop": "chromeDesktop",
  "edge-desktop": "edgeDesktop",
};
