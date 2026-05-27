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
 * Byte / base64 helpers. All Uint8Arrays returned from this module are
 * freshly-allocated in the current realm so strict `instanceof Uint8Array`
 * checks (as used by tweetnacl) pass across jsdom / Node / browser.
 */

export function freshBytes(length: number): Uint8Array {
  return new Uint8Array(length);
}

export function b64encode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  if (typeof btoa !== "undefined") return btoa(binary);
  return Buffer.from(bytes).toString("base64");
}

export function b64decode(s: string): Uint8Array {
  let binary: string;
  if (typeof atob !== "undefined") {
    binary = atob(s);
  } else {
    binary = Buffer.from(s, "base64").toString("binary");
  }
  const out = freshBytes(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function utf8encode(s: string): Uint8Array {
  let source: ArrayLike<number>;
  if (typeof TextEncoder !== "undefined") {
    source = new TextEncoder().encode(s);
  } else {
    source = Buffer.from(s, "utf8");
  }
  const out = freshBytes(source.length);
  for (let i = 0; i < source.length; i++) out[i] = source[i];
  return out;
}

export function utf8decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function randomBytes(n: number): Uint8Array {
  const out = freshBytes(n);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(out);
  } else {
    for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
  }
  return out;
}
