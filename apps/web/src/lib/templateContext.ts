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
import { FAQ_SECTIONS, type FaqEntry } from "@/content/faq";
import { FAQ_SECTIONS_ES } from "@/content/faq.es";

/**
 * Resolvers behind the selected-template "Before you start" context
 * block (ProjectNew). Template `learnMore` entries are FAQ entry ids —
 * the label comes from the FAQ question in the viewer's language, so
 * the links stay translated for free and can never drift from the
 * help content they point at (membership is CI-pinned in
 * projectTemplates.test.ts).
 */
export function findFaqEntry(
  entryId: string,
  locale: string,
): FaqEntry | null {
  const sections = locale.startsWith("es") ? FAQ_SECTIONS_ES : FAQ_SECTIONS;
  for (const section of sections) {
    const entry = section.entries.find((e) => e.id === entryId);
    if (entry) return entry;
  }
  return null;
}
