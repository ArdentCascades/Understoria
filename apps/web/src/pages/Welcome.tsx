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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { markOnboarded } from "@/db/onboarding";
import { useApp } from "@/state/AppContext";

interface ScreenSpec {
  key: string;
  icon: string;
  titleKey: string;
  bodyKeys: readonly string[];
}

const SCREENS: readonly ScreenSpec[] = [
  {
    key: "timebank",
    icon: "\u{23F3}",
    titleKey: "welcome.screens.timebank.title",
    bodyKeys: [
      "welcome.screens.timebank.body1",
      "welcome.screens.timebank.body2",
    ],
  },
  {
    key: "credit",
    icon: "\u{1F33E}",
    titleKey: "welcome.screens.credit.title",
    bodyKeys: [
      "welcome.screens.credit.body1",
      "welcome.screens.credit.body2",
    ],
  },
  {
    key: "identity",
    icon: "\u{1F511}",
    titleKey: "welcome.screens.identity.title",
    bodyKeys: [
      "welcome.screens.identity.body1",
      "welcome.screens.identity.body2",
    ],
  },
  {
    key: "community",
    icon: "\u{1F33F}",
    titleKey: "welcome.screens.community.title",
    bodyKeys: [
      "welcome.screens.community.body1",
      "welcome.screens.community.body2",
    ],
  },
];

export default function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshOnboarded } = useApp();
  const [stepIndex, setStepIndex] = useState(0);

  async function finish() {
    await markOnboarded();
    await refreshOnboarded();
    navigate("/", { replace: true });
  }

  const screen = SCREENS[stepIndex];
  const isLast = stepIndex === SCREENS.length - 1;

  return (
    <OnboardingScreen
      icon={screen.icon}
      title={t(screen.titleKey)}
      body={screen.bodyKeys.map((k) => t(k))}
      stepIndex={stepIndex}
      stepCount={SCREENS.length}
      onBack={stepIndex === 0 ? null : () => setStepIndex(stepIndex - 1)}
      onNext={() => {
        if (isLast) {
          void finish();
        } else {
          setStepIndex(stepIndex + 1);
        }
      }}
      onSkip={() => void finish()}
      nextLabel={isLast ? t("welcome.start") : t("welcome.next")}
    />
  );
}
