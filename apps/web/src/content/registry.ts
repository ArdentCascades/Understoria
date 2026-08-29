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

// The authored-content registry (docs/i18n-expansion.md Phase 2a).
// Mirrors the UI-locale posture in src/i18n/index.ts: English ships
// eagerly (it is the fallback for every surface), every other
// language's content is its own lazily-imported bundle, and the app
// GATES on the active language's bundle before rendering — boot
// chains ensureContent() into i18nReady, and setLanguage awaits it
// before i18next switches. That gate is what lets every existing
// content selector (getProjectTemplates, getTaskSteps, …) stay
// SYNCHRONOUS: by the time a component renders in language X,
// X's bundle is either cached here or X has no bundle and English
// is the honest answer (the Settings language card discloses it).
import * as enBundle from "./bundles/en";

export type ContentBundle = typeof enBundle;

// One loader per language WITH translated content — as of the Tibetan
// corpus that is every shipped language (all ten). A future ui-only language (UI
// strings translated, content not yet) simply has no entry here: it
// falls back to English below, which is exactly what a registry
// entry's `content: "ui-only"` discloses in Settings. When its
// content ships, add the bundle here and flip the registry flag.
const LOADERS: Record<string, () => Promise<ContentBundle>> = {
  en: () => Promise.resolve(enBundle),
  es: () => import("./bundles/es"),
  fr: () => import("./bundles/fr"),
  pt: () => import("./bundles/pt"),
  zh: () => import("./bundles/zh"),
  hi: () => import("./bundles/hi"),
  vi: () => import("./bundles/vi"),
  ru: () => import("./bundles/ru"),
  ar: () => import("./bundles/ar"),
  bo: () => import("./bundles/bo"),
};

const cache = new Map<string, ContentBundle>([["en", enBundle]]);

/** The content language a UI locale resolves to: base-language
 *  prefix match against available loaders, English otherwise. */
export function contentLocale(locale: string | undefined): string {
  const base = (locale ?? "en").toLowerCase();
  for (const code of Object.keys(LOADERS)) {
    if (base === code || base.startsWith(`${code}-`)) return code;
  }
  return "en";
}

/** Load (and cache) the content bundle for a locale. Idempotent;
 *  resolves immediately for English and for anything already
 *  loaded. Callers gate rendering on this — see module comment. */
export async function ensureContent(locale: string | undefined): Promise<void> {
  const code = contentLocale(locale);
  if (cache.has(code)) return;
  cache.set(code, await LOADERS[code]());
}

/** Synchronous bundle access. Falls back to English when the
 *  locale's bundle isn't loaded (first visit racing the gate, or a
 *  ui-only language) — never throws, never returns partial data. */
export function getContentBundle(locale: string | undefined): ContentBundle {
  return cache.get(contentLocale(locale)) ?? enBundle;
}
