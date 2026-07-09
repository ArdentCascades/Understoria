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
import { getTemplate } from "@/content/projectTemplates";
import { findFaqEntry } from "@/lib/templateContext";

// Bring the template "playbook" back to the people doing the work.
//
// Templates ship real how-to guidance — what you'll need, first steps,
// what trips people up, and Learn-more links — but it's shown only once,
// to the organizer, at the create-project screen, then dropped. Nothing
// is persisted except `Project.templateId`, so we RE-DERIVE the playbook
// here from that id (no schema change, always current with the content).
// It reads as reference — "the {template} playbook says…" — because the
// organizer may have since diverged from the template.
//
//   • full    — a "How this works" card on the project page.
//   • compact — a collapsed "Before you start" on a task's own page, so
//               a member who deep-links to one task still gets the
//               project's hard-won advice.

export function TemplatePlaybook({
  templateId,
  variant,
}: {
  templateId: string | null;
  variant: "full" | "compact";
}) {
  const { t, i18n } = useTranslation();
  if (!templateId) return null;
  const locale = i18n.resolvedLanguage ?? "en";
  const tpl = getTemplate(templateId, locale);
  if (!tpl) return null;

  const showLearnMore = variant === "full" && (tpl.learnMore?.length ?? 0) > 0;
  const showWhatYoullNeed = variant === "full" && Boolean(tpl.whatYoullNeed);
  const hasContent =
    Boolean(tpl.firstSteps) ||
    Boolean(tpl.commonPitfalls) ||
    showWhatYoullNeed ||
    showLearnMore;
  if (!hasContent) return null;

  const body = (
    <div className="mt-2 flex flex-col gap-2 text-sm text-moss-700 dark:text-moss-200">
      {showWhatYoullNeed && (
        <p>
          <span className="font-semibold">
            {t("projects.templates.context.whatYoullNeed")}
          </span>{" "}
          {tpl.whatYoullNeed}
        </p>
      )}
      {tpl.firstSteps && (
        <p>
          <span className="font-semibold">
            {t("projects.templates.context.firstSteps")}
          </span>{" "}
          {tpl.firstSteps}
        </p>
      )}
      {tpl.commonPitfalls && (
        <p>
          <span className="font-semibold">
            {t("projects.templates.context.pitfalls")}
          </span>{" "}
          {tpl.commonPitfalls}
        </p>
      )}
      {showLearnMore && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold">
            {t("projects.templates.context.learnMore")}
          </span>
          {tpl.learnMore!.map((faqId) => {
            const entry = findFaqEntry(faqId, locale);
            if (!entry) return null;
            return (
              <Link
                key={faqId}
                to={`/help#${faqId}`}
                className="text-canopy-700 underline underline-offset-2 dark:text-canopy-300"
              >
                {entry.question}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );

  if (variant === "compact") {
    return (
      <details className="rounded-xl bg-canopy-50 p-3 dark:bg-canopy-950/30">
        <summary className="cursor-pointer text-sm font-semibold text-canopy-800 dark:text-canopy-200">
          {t("projects.templates.playbook.compactSummary")}
        </summary>
        {body}
      </details>
    );
  }

  return (
    <section className="card border-canopy-200 bg-canopy-50/60 dark:border-canopy-800 dark:bg-canopy-950/30">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-canopy-800 dark:text-canopy-200">
        {t("projects.templates.playbook.title", { name: tpl.name })}
      </h2>
      {body}
    </section>
  );
}
