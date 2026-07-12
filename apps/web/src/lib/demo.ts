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
import { db } from "@/db/database";

// Demo-build flag. TRUE only in a build produced with `VITE_DEMO=1`
// (the `build:demo` script / the showcase "tour" deploy). Everything
// gated on this — the demo banner, the boot-time sample seed — is
// completely inert in a normal production build, where `VITE_DEMO` is
// absent and this is `false`. It is a build-time constant, so a
// production bundle can dead-code-eliminate the demo branches entirely.
//
// This exists so the SAME app can serve two very different jobs: a real
// community node's front end (starts empty, identities minted by
// onboarding — operator ruling R1), and a public, throwaway "tour" that
// loads straight onto a populated sample community so a curious visitor
// can look around. The demo lives ENTIRELY in the visitor's browser
// (IndexedDB); there is no shared server, nothing federates, and only
// they can see what they do.
export const IS_DEMO: boolean = import.meta.env.VITE_DEMO === "1";

/**
 * Wipe the in-browser database and cached UI preferences, then reload.
 * On the next boot the app finds an empty database and — because this is
 * a demo build — re-seeds the sample community from scratch, so the
 * visitor gets a clean slate. Only meaningful in a demo build; the
 * demo banner is the only caller.
 *
 * Deleting the Dexie database (rather than clearing each table) also
 * resets the schema/version cleanly and drops the demo members' local
 * secret keys. We do NOT touch service-worker caches — those hold the
 * app CODE, which a reset has no reason to re-download.
 */
export async function resetDemo(): Promise<void> {
  await db.delete();
  try {
    // UI caches only (theme, text size, density, no-FOUC hints). All of
    // it repopulates from the fresh seed / defaults on reload.
    localStorage.clear();
  } catch {
    // Private-mode / storage-disabled browsers: nothing to clear.
  }
  window.location.reload();
}
