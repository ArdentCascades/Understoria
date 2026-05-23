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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MEMBER_GUIDE } from "@/content/member-guide";
import { promptShareText, STUDY_PROMPTS } from "@/content/study-prompts";

type Panel = "none" | "guide" | "prompts";

export function LearnSection() {
  const { t } = useTranslation();
  const [panel, setPanel] = useState<Panel>("none");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyPrompt(promptId: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(promptId);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // The user can still long-press the text to copy manually.
      setCopiedId(null);
    }
  }

  return (
    <section className="card mb-4" aria-labelledby="learn-section-title">
      <h2
        id="learn-section-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500"
      >
        {t("profile.learn.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.learn.intro")}
      </p>
      <div className="flex flex-wrap gap-2">
        <Link to="/welcome" className="btn-secondary">
          {t("profile.learn.revisitWelcome")}
        </Link>
        <Link to="/help" className="btn-secondary">
          {t("profile.learn.helpFaq")}
        </Link>
        <button
          type="button"
          onClick={() => setPanel(panel === "guide" ? "none" : "guide")}
          className="btn-secondary"
          aria-expanded={panel === "guide"}
        >
          {t("profile.learn.memberGuide")}
        </button>
        <button
          type="button"
          onClick={() => setPanel(panel === "prompts" ? "none" : "prompts")}
          className="btn-secondary"
          aria-expanded={panel === "prompts"}
        >
          {t("profile.learn.studyPrompts")}
        </button>
      </div>

      {panel === "guide" && (
        <div className="mt-4 space-y-4 border-t border-moss-200 pt-4 dark:border-moss-800">
          {MEMBER_GUIDE.map((section) => (
            <article key={section.id}>
              <h3 className="mb-1 text-base font-semibold text-moss-800 dark:text-moss-100">
                {section.title}
              </h3>
              <div className="space-y-2 text-sm text-moss-700 dark:text-moss-200">
                {section.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {panel === "prompts" && (
        <ol className="mt-4 space-y-3 border-t border-moss-200 pt-4 dark:border-moss-800">
          {STUDY_PROMPTS.map((p) => (
            <li key={p.id} className="text-sm text-moss-700 dark:text-moss-200">
              <p>{p.body}</p>
              <button
                type="button"
                onClick={() => copyPrompt(p.id, promptShareText(p))}
                className="mt-1 text-xs text-moss-500 underline-offset-2 hover:underline"
              >
                {copiedId === p.id
                  ? t("profile.learn.promptCopied")
                  : t("profile.learn.promptCopy")}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
