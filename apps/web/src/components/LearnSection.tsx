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
import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DESIGN_PRINCIPLES } from "@/content/design-principles";
import { MEMBER_GUIDE } from "@/content/member-guide";
import { OPSEC_GUIDE } from "@/content/opsec-guide";
import { promptShareText, STUDY_PROMPTS } from "@/content/study-prompts";
import { LeafDivider } from "@/components/visual";
import { InstallGuide } from "@/components/InstallGuide";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

type Panel = "none" | "guide" | "opsec" | "principles" | "prompts" | "install";

// A row in Profile's "Community & account" index. Learn used to be a
// standalone card whose seven inline toggles sat open on every
// visit; it now folds behind a native <details> disclosure — the
// reading content (guides, principles, prompts, install steps) is
// reference material, not every-visit material. The panel buttons
// and their content are unchanged inside the disclosure.
export function LearnSection() {
  const { t } = useTranslation();
  const location = useLocation();
  const reduced = useReducedMotion();
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const [panel, setPanel] = useState<Panel>("none");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // `/profile#design-principles` (WhyTooltip's "Read more" link) must
  // land on the principles reading even though Learn is a collapsed
  // row: open the disclosure AND the principles panel. Before the
  // fold, the link already depended on the panel being open (the
  // anchor div only renders inside it) — handling the hash here makes
  // the deep link reliable rather than merely not-worse.
  useEffect(() => {
    if (location.hash !== "#design-principles") return;
    if (detailsRef.current) detailsRef.current.open = true;
    setPanel("principles");
  }, [location.hash]);
  // Scroll on the render AFTER the panel state lands — the anchor
  // target doesn't exist until the principles panel is in the DOM.
  useEffect(() => {
    if (location.hash !== "#design-principles" || panel !== "principles")
      return;
    document.getElementById("design-principles")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, [location.hash, panel, reduced]);

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
    <details ref={detailsRef} className="py-2">
      <summary className="-m-2 flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-xl p-2 marker:hidden hover:bg-moss-50 dark:hover:bg-moss-900">
        <div className="min-w-0 flex-1">
          <h3
            id="learn-section-title"
            className="text-sm font-semibold text-moss-800 dark:text-moss-100"
          >
            {t("profile.learn.title")}
          </h3>
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("profile.learn.rowDescription")}
          </p>
        </div>
        {/* `+` (discloses in place) rather than the `›` the index's
            navigation rows carry. */}
        <span
          aria-hidden="true"
          className="shrink-0 text-lg text-moss-400 dark:text-moss-500"
        >
          +
        </span>
      </summary>

      <div className="mt-3">
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
            onClick={() => setPanel(panel === "opsec" ? "none" : "opsec")}
            className="btn-secondary"
            aria-expanded={panel === "opsec"}
          >
            {t("profile.learn.opsecGuide")}
          </button>
          <button
            type="button"
            onClick={() =>
              setPanel(panel === "principles" ? "none" : "principles")
            }
            className="btn-secondary"
            aria-expanded={panel === "principles"}
          >
            {t("profile.learn.designPrinciples")}
          </button>
          <button
            type="button"
            onClick={() => setPanel(panel === "prompts" ? "none" : "prompts")}
            className="btn-secondary"
            aria-expanded={panel === "prompts"}
          >
            {t("profile.learn.studyPrompts")}
          </button>
          <button
            type="button"
            onClick={() => setPanel(panel === "install" ? "none" : "install")}
            className="btn-secondary"
            aria-expanded={panel === "install"}
          >
            {t("profile.learn.addToPhone")}
          </button>
        </div>

        {panel === "guide" && (
          <div className="mt-4 space-y-4 border-t border-moss-200 pt-4 dark:border-moss-800">
            {MEMBER_GUIDE.map((section) => (
              <article key={section.id}>
                <h4 className="mb-1 text-base font-semibold text-moss-800 dark:text-moss-100">
                  {section.title}
                </h4>
                <div className="space-y-2 text-sm text-moss-700 dark:text-moss-200">
                  {section.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {panel === "opsec" && (
          <div className="mt-4 space-y-4 border-t border-moss-200 pt-4 dark:border-moss-800">
            <p className="text-xs text-moss-600 dark:text-moss-300">
              {t("profile.learn.opsecIntro")}
            </p>
            {OPSEC_GUIDE.map((section) => (
              <article key={section.id}>
                <h4 className="mb-1 text-base font-semibold text-moss-800 dark:text-moss-100">
                  {section.title}
                </h4>
                <div className="space-y-2 text-sm text-moss-700 dark:text-moss-200">
                  {section.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {panel === "principles" && (
          <div
            id="design-principles"
            className="mt-4 space-y-4 border-t border-moss-200 pt-4 dark:border-moss-800"
          >
            <p className="text-xs text-moss-600 dark:text-moss-300">
              {t("profile.learn.principlesIntro")}
            </p>
            {DESIGN_PRINCIPLES.map((p, i) => (
              <Fragment key={p.id}>
                {i > 0 && <LeafDivider variant="short" />}
                <article id={`principle-${p.id}`}>
                  <h4 className="mb-1 text-base font-semibold text-moss-800 dark:text-moss-100">
                    {p.title}
                  </h4>
                  <p className="text-sm font-medium text-moss-700 dark:text-moss-200">
                    {p.statement}
                  </p>
                  <p className="mt-1 text-sm italic text-moss-600 dark:text-moss-300">
                    {p.example}
                  </p>
                </article>
              </Fragment>
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
                  className="mt-1 text-xs text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
                >
                  {copiedId === p.id
                    ? t("profile.learn.promptCopied")
                    : t("profile.learn.promptCopy")}
                </button>
              </li>
            ))}
          </ol>
        )}

        {panel === "install" && (
          <div className="mt-4 border-t border-moss-200 pt-4 dark:border-moss-800">
            <InstallGuide variant="panel" />
          </div>
        )}
      </div>
    </details>
  );
}
