/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// The per-surface half of provenance-verified display translation
// (docs/provenance-translation.md): computes the viewer-language
// rendering of a template-derived project's fields, loads the matched
// source locale's bundle to verify descriptions, and owns the ONE
// View-original toggle for the whole surface. Import this hook only
// on the allowlisted surfaces — provenance.guard.test.ts enforces the
// list, because dispute/flag/confirmation surfaces must always show
// the signed bytes.
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { contentLocale, ensureContent } from "@/content/registry";
import {
  matchedEventScaffold,
  matchedNameLocales,
  matchedTaskRow,
  provenanceDescription,
  provenanceEventDescription,
  provenanceEventTitle,
  provenanceTaskDescription,
  provenanceTaskTitle,
  provenanceTitle,
  type ProvenanceText,
} from "@/content/templateProvenance";

export interface ProvenanceTaskInput {
  id: string;
  title: string;
  description: string;
}

/** What a surface actually renders for one field under the current
 *  toggle. `lang`/`dir` are set only when showing the original of a
 *  translated field — the one case where the text's language is
 *  provably not the page's (dir:auto isolates RTL/LTR mixing and
 *  per-language :lang() typography floors apply). */
export interface ProvenanceView {
  text: string;
  translated: boolean;
  lang?: string;
  dir?: "auto";
}

export interface TemplateProvenance {
  /** Any field on this surface is being displayed translated —
   *  drives the marker + toggle visibility. */
  any: boolean;
  /** Some fields verified and others are organizer-authored — the
   *  marker adds the never-machine-translated sentence. */
  mixed: boolean;
  showOriginal: boolean;
  toggleOriginal: () => void;
  title: ProvenanceView;
  description: ProvenanceView;
  taskTitle: (taskId: string) => ProvenanceView | undefined;
  taskDescription: (taskId: string) => ProvenanceView | undefined;
}

function toView(pt: ProvenanceText, showOriginal: boolean): ProvenanceView {
  if (!pt.translated) return { text: pt.text, translated: false };
  if (!showOriginal) return { text: pt.text, translated: true };
  return {
    text: pt.original,
    translated: true,
    lang: pt.sourceLocale,
    dir: "auto",
  };
}

/** Sync, title-only provenance rendering for compact list rows
 *  (My-work rows, calendar options, grouping headers). Titles verify
 *  against the eager index, so no bundle loading and no async state.
 *  These surfaces carry NO inline marker by design: every row links
 *  to the project/task page, where the note and the View-original
 *  toggle live one tap away (docs/provenance-translation.md,
 *  "Honesty on the surface"). */
export function useProvenanceText(): {
  projectTitle: (templateId: string | null, title: string) => string;
  taskTitle: (templateId: string | null, title: string) => string;
  eventTitle: (templateId: string | null, title: string) => string;
} {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  return useMemo(
    () => ({
      projectTitle: (templateId: string | null, title: string) =>
        provenanceTitle(templateId, title, lang).text,
      taskTitle: (templateId: string | null, title: string) =>
        provenanceTaskTitle(templateId, title, lang).text,
      eventTitle: (templateId: string | null, title: string) =>
        provenanceEventTitle(templateId, title, lang).text,
    }),
    [lang],
  );
}

export interface ProjectListProvenance {
  /** Display views for one listed project (undefined when the id
   *  isn't in the list). */
  view: (projectId: string) =>
    | { title: ProvenanceView; description: ProvenanceView }
    | undefined;
  /** The substituted text for one project ("" when nothing
   *  translated) — appended to search haystacks so what the member
   *  SEES is findable alongside what the organizer wrote. */
  searchText: (projectId: string) => string;
}

/** List-level provenance for project card grids (the board's
 *  Projects tab): one candidate-bundle load and one recompute for
 *  the whole list, views handed to each card as props — the TaskList
 *  pattern. Cards carry no inline marker; the project page they open
 *  does. */
export function useProjectListProvenance(
  projects: readonly {
    id: string;
    templateId: string | null;
    title: string;
    description: string;
  }[],
): ProjectListProvenance {
  const { i18n } = useTranslation();
  const viewer = contentLocale(i18n.resolvedLanguage);
  const [bundlesReady, setBundlesReady] = useState(0);

  const candidates = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (!p.templateId) continue;
      for (const code of matchedNameLocales(p.templateId, p.title)) {
        set.add(code);
      }
    }
    set.delete(viewer);
    return [...set].sort();
  }, [projects, viewer]);

  const candidatesKey = candidates.join(",");
  useEffect(() => {
    if (!candidatesKey) return;
    let cancelled = false;
    void Promise.all(
      candidatesKey.split(",").map((c) => ensureContent(c)),
    ).then(() => {
      if (!cancelled) setBundlesReady((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [candidatesKey]);

  return useMemo(() => {
    void bundlesReady;
    const views = new Map<
      string,
      { title: ProvenanceView; description: ProvenanceView }
    >();
    for (const p of projects) {
      const titlePt = provenanceTitle(p.templateId, p.title, viewer);
      const descPt = provenanceDescription(
        p.templateId,
        p.description,
        titlePt.translated && titlePt.sourceLocale
          ? [titlePt.sourceLocale, ...candidates]
          : candidates,
        viewer,
      );
      views.set(p.id, {
        title: toView(titlePt, false),
        description: toView(descPt, false),
      });
    }
    return {
      view: (id: string) => views.get(id),
      searchText: (id: string) => {
        const v = views.get(id);
        if (!v) return "";
        return `${v.title.translated ? v.title.text : ""} ${
          v.description.translated ? v.description.text : ""
        }`.trim();
      },
    };
  }, [projects, viewer, candidates, bundlesReady]);
}

export function useTemplateProvenance(
  project:
    | { templateId: string | null; title: string; description: string }
    | null
    | undefined,
  tasks: readonly ProvenanceTaskInput[] = [],
): TemplateProvenance {
  const { i18n } = useTranslation();
  const viewer = contentLocale(i18n.resolvedLanguage);
  const [showOriginal, setShowOriginal] = useState(false);
  const [bundlesReady, setBundlesReady] = useState(0);

  const templateId = project?.templateId ?? null;
  const title = project?.title ?? "";
  const description = project?.description ?? "";

  // Candidate source locales: every locale any title on this surface
  // byte-matched. The organizer's language necessarily appears here
  // when anything is unmodified, so descriptions never guess.
  const candidates = useMemo(() => {
    if (!templateId) return [] as string[];
    const set = new Set<string>(matchedNameLocales(templateId, title));
    for (const task of tasks) {
      for (const code of matchedTaskRow(templateId, task.title)?.locales ??
        []) {
        set.add(code);
      }
    }
    set.delete(viewer);
    return [...set].sort();
  }, [templateId, title, tasks, viewer]);

  // Load candidate bundles so description verification compares
  // against the real source text instead of the en fallback; bump a
  // counter so the memo below recomputes. ensureContent is cached
  // and idempotent, so this settles after one round.
  const candidatesKey = candidates.join(",");
  useEffect(() => {
    if (!candidatesKey) return;
    let cancelled = false;
    void Promise.all(candidatesKey.split(",").map((c) => ensureContent(c))).then(
      () => {
        if (!cancelled) setBundlesReady((n) => n + 1);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [candidatesKey]);

  return useMemo(() => {
    // bundlesReady is a recompute trigger, not data.
    void bundlesReady;
    const titlePt = provenanceTitle(templateId, title, viewer);
    const descPt = provenanceDescription(
      templateId,
      description,
      candidates,
      viewer,
    );
    const taskViews = new Map<
      string,
      { title: ProvenanceView; description: ProvenanceView }
    >();
    let translatedCount = titlePt.translated ? 1 : 0;
    let fieldCount = title ? 1 : 0;
    if (description) {
      fieldCount += 1;
      if (descPt.translated) translatedCount += 1;
    }
    for (const task of tasks) {
      const tPt = provenanceTaskTitle(templateId, task.title, viewer);
      const row = matchedTaskRow(templateId ?? "", task.title)?.row ?? -1;
      const dPt = provenanceTaskDescription(
        templateId,
        row,
        task.description,
        candidates,
        viewer,
      );
      fieldCount += task.description ? 2 : 1;
      translatedCount +=
        (tPt.translated ? 1 : 0) + (dPt.translated ? 1 : 0);
      taskViews.set(task.id, {
        title: toView(tPt, showOriginal),
        description: toView(dPt, showOriginal),
      });
    }
    return {
      any: translatedCount > 0,
      mixed: translatedCount > 0 && translatedCount < fieldCount,
      showOriginal,
      toggleOriginal: () => setShowOriginal((v) => !v),
      title: toView(titlePt, showOriginal),
      description: toView(descPt, showOriginal),
      taskTitle: (id: string) => taskViews.get(id)?.title,
      taskDescription: (id: string) => taskViews.get(id)?.description,
    };
  }, [
    templateId,
    title,
    description,
    tasks,
    viewer,
    candidates,
    showOriginal,
    bundlesReady,
  ]);
}

export interface EventProvenance {
  any: boolean;
  mixed: boolean;
  showOriginal: boolean;
  toggleOriginal: () => void;
  title: ProvenanceView;
  description: ProvenanceView;
}

/** Event-page provenance (docs/provenance-translation.md, phase 2c):
 *  the scaffold segment of the title and an unedited description
 *  render in the viewer's language, with the page's single
 *  View-original toggle. The title mixes an app-authored scaffold
 *  with the member's own suffix, so its view is never lang-tagged —
 *  the toggled ORIGINAL is, as one whole signed string. */
export function useEventProvenance(
  event:
    | { templateId: string | null; title: string; description: string }
    | null
    | undefined,
): EventProvenance {
  const { i18n } = useTranslation();
  const viewer = contentLocale(i18n.resolvedLanguage);
  const [showOriginal, setShowOriginal] = useState(false);
  const [bundlesReady, setBundlesReady] = useState(0);

  const templateId = event?.templateId ?? null;
  const title = event?.title ?? "";
  const description = event?.description ?? "";

  const candidates = useMemo(() => {
    if (!templateId) return [] as string[];
    const set = new Set<string>(
      matchedEventScaffold(templateId, title)?.locales ?? [],
    );
    set.delete(viewer);
    return [...set].sort();
  }, [templateId, title, viewer]);

  const candidatesKey = candidates.join(",");
  useEffect(() => {
    if (!candidatesKey) return;
    let cancelled = false;
    void Promise.all(
      candidatesKey.split(",").map((c) => ensureContent(c)),
    ).then(() => {
      if (!cancelled) setBundlesReady((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [candidatesKey]);

  return useMemo(() => {
    void bundlesReady;
    const titlePt = provenanceEventTitle(templateId, title, viewer);
    const descPt = provenanceEventDescription(
      templateId,
      description,
      candidates,
      viewer,
    );
    const translated =
      (titlePt.translated ? 1 : 0) + (descPt.translated ? 1 : 0);
    const fields = (title ? 1 : 0) + (description ? 1 : 0);
    return {
      any: translated > 0,
      mixed: translated > 0 && translated < fields,
      showOriginal,
      toggleOriginal: () => setShowOriginal((v) => !v),
      title: toView(titlePt, showOriginal),
      description: toView(descPt, showOriginal),
    };
  }, [templateId, title, description, viewer, candidates, showOriginal, bundlesReady]);
}
