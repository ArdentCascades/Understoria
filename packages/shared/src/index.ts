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
/**
 * Barrel exports for the shared primitives. Consumers should generally
 * import from the dedicated subpath modules
 * (`@understoria/shared/types`, `@understoria/shared/bytes`,
 * `@understoria/shared/crypto`) for cleaner intent and to keep tree-shaking
 * happy. This barrel exists for one-shot scripts.
 */

export * from "./types.js";
export * from "./bytes.js";
export * from "./crypto.js";
export * from "./trust.js";
