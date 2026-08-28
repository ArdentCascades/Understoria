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
import "fake-indexeddb/auto";

// Translated content bundles are lazy in production (content/registry
// gates rendering on them); tests exercise real translated content
// synchronously all over the suite, so preload them here once.
import { ensureContent } from "@/content/registry";
await ensureContent("es");
await ensureContent("fr");
await ensureContent("pt");
await ensureContent("zh");
await ensureContent("hi");
await ensureContent("vi");
await ensureContent("ru");
await ensureContent("ar");
