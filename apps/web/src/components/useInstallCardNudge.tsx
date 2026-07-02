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
import { useTranslation } from "react-i18next";
import { IconShare } from "@/components/visual";
import { OneTapInstall } from "@/components/InstallGuide";
import { useInstallGuide, type UseInstallGuide } from "@/lib/useInstallGuide";
import type { InstallEnvironment } from "@/lib/installGuide";
import type { BoardNudgeStatus } from "@/lib/boardNudge";

// The dismissible "Add to Home Screen" card for Board — the calm,
// honest guide that helps a member find and trigger the install,
// never a buzzing nag (no-notifications). It honors PERMANENT
// dismissal and self-suppresses once installed.
//
// The gating lives in this hook (returning a BoardNudgeStatus so the
// Board orchestrator can show at most one prompt at a time); the JSX
// lives in InstallGuideCard below. The install hook is called ONCE
// here and threaded into the card as a `guide` prop, so the card
// itself adds no hooks beyond useTranslation. The re-findable Learn
// PANEL stays in InstallGuide.tsx and calls useInstallGuide()
// independently — the two surfaces never share a hook instance.

export function useInstallCardNudge(): BoardNudgeStatus {
  const g = useInstallGuide();

  // ready once the dismissed flag resolves (`state` is null until then,
  // render-nothing-until-known); visible is the negation of the card's
  // old `return null` guards: not dismissed, and not already installed.
  const ready = g.state !== null;
  const visible =
    g.state !== null && !g.dismissed && g.state.kind !== "installed";

  return { ready, visible, node: <InstallGuideCard guide={g} /> };
}

function InstallGuideCard({ guide }: { guide: UseInstallGuide }) {
  const { t } = useTranslation();
  const { state, promptInstall, dismiss } = guide;

  // The card is only rendered when the orchestrator sees `visible`, so
  // `state` is a resolved, non-installed InstallEnvironment here. Guard
  // defensively anyway — TS narrows the null away and an installed app
  // never nags.
  if (state === null || state.kind === "installed") return null;

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
      {/* Every manual/iOS card points out to the full install answer
          on Help (`/help#install-app`) — per-platform steps that
          actually finish the job, unlike the old landing on /profile
          which left the member to hunt for the Learn panel. The
          touch-target + inline-flex classes give the small-text link
          the 44px hit-area floor and a real box for the global
          :focus-visible outline to draw around. */}
      <Link
        to="/help#install-app"
        className="touch-target inline-flex items-center self-start text-xs
                   font-medium text-canopy-700 underline-offset-2
                   hover:underline dark:text-canopy-300"
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
