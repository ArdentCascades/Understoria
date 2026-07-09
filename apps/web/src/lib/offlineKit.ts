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
 * The offline kit's WiFi QR (paper-systems P4). Phones natively
 * join a network from a QR carrying the de-facto-standard `WIFI:`
 * scheme (the format Android and iOS camera apps both parse):
 *
 *   WIFI:T:WPA;S:<ssid>;P:<password>;;
 *
 * The special characters `\ ; , " :` must be backslash-escaped in
 * the SSID and password fields, or a password containing `;` would
 * silently truncate the payload — a poster that fails at the wall.
 * An empty password renders an open-network payload (`T:nopass`,
 * no P field).
 */
export function escapeWifiField(value: string): string {
  return value.replace(/([\\;,":])/g, "\\$1");
}

export function wifiQrValue(input: {
  ssid: string;
  password: string;
}): string | null {
  const ssid = input.ssid.trim();
  if (!ssid) return null;
  const password = input.password;
  if (!password) {
    return `WIFI:T:nopass;S:${escapeWifiField(ssid)};;`;
  }
  return `WIFI:T:WPA;S:${escapeWifiField(ssid)};P:${escapeWifiField(password)};;`;
}
