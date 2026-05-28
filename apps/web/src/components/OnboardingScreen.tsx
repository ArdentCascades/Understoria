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
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface OnboardingScreenProps {
  icon: string;
  title: string;
  /** The body content. Pass paragraphs as `<p>` elements (or any
   *  other ReactNode — the profile-setup step uses form fields).
   *  Centered + capped width is the screen's responsibility, not
   *  the caller's. */
  body: ReactNode;
  stepIndex: number;
  stepCount: number;
  onBack: (() => void) | null;
  onNext: () => void;
  onSkip: () => void;
  nextLabel: string;
  /** When true, both Next and Skip become disabled + aria-busy.
   *  Used by the profile-setup step while the async save is
   *  in flight so the member can't double-tap. */
  busy?: boolean;
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
  busy = false,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col px-6 pb-6 pt-8">
      <header className="mb-6 flex items-center justify-between">
        <ProgressDots current={stepIndex} total={stepCount} />
        <button
          type="button"
          onClick={onSkip}
          disabled={busy}
          className="text-sm text-moss-600 underline-offset-2 hover:underline disabled:opacity-50 dark:text-moss-300"
        >
          {t("welcome.skip")}
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 text-6xl" aria-hidden="true">
          {icon}
        </div>
        <h1 className="page-title mb-4">{title}</h1>
        <div className="w-full max-w-md space-y-3 text-base text-moss-700 dark:text-moss-200">
          {body}
        </div>
      </div>

      <footer className="mt-8 flex items-center justify-between gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            className="btn-secondary"
          >
            {t("common.back")}
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={busy}
          aria-busy={busy}
          className="btn-primary"
        >
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
