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

export interface OnboardingScreenProps {
  icon: string;
  title: string;
  body: readonly string[];
  stepIndex: number;
  stepCount: number;
  onBack: (() => void) | null;
  onNext: () => void;
  onSkip: () => void;
  nextLabel: string;
}

export function OnboardingScreen({
  icon,
  title,
  body,
  stepIndex,
  stepCount,
  onBack,
  onNext,
  onSkip,
  nextLabel,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col px-6 pb-6 pt-8">
      <header className="mb-6 flex items-center justify-between">
        <ProgressDots current={stepIndex} total={stepCount} />
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
        >
          {t("welcome.skip")}
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 text-6xl" aria-hidden="true">
          {icon}
        </div>
        <h1 className="mb-4 text-2xl font-semibold text-moss-800 dark:text-moss-100">
          {title}
        </h1>
        <div className="space-y-3 text-base text-moss-700 dark:text-moss-200">
          {body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      <footer className="mt-8 flex items-center justify-between gap-3">
        {onBack ? (
          <button type="button" onClick={onBack} className="btn-secondary">
            {t("common.back")}
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <button type="button" onClick={onNext} className="btn-primary">
          {nextLabel}
        </button>
      </footer>
    </div>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      className="flex gap-1.5"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={
            i === current
              ? "h-2 w-6 rounded-full bg-moss-600 dark:bg-moss-300"
              : "h-2 w-2 rounded-full bg-moss-200 dark:bg-moss-700"
          }
        />
      ))}
    </div>
  );
}
