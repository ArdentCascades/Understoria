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
//
// The WIFI: payload builder (paper-systems P4). The escaping lock
// matters most: an unescaped `;` in a password silently truncates
// the payload — a poster that fails at the shelter wall.
//
import { describe, expect, it } from "vitest";
import { escapeWifiField, wifiQrValue } from "./offlineKit";

describe("wifiQrValue", () => {
  it("builds a WPA payload with ssid and password", () => {
    expect(wifiQrValue({ ssid: "Riverside-Hub", password: "acorns" })).toBe(
      "WIFI:T:WPA;S:Riverside-Hub;P:acorns;;",
    );
  });

  it("an empty password is an open network (nopass, no P field)", () => {
    expect(wifiQrValue({ ssid: "Riverside-Hub", password: "" })).toBe(
      "WIFI:T:nopass;S:Riverside-Hub;;",
    );
  });

  it("no ssid, no payload", () => {
    expect(wifiQrValue({ ssid: "  ", password: "x" })).toBeNull();
  });

  it("escapes the five special characters in both fields", () => {
    expect(escapeWifiField('a;b,c:d"e\\f')).toBe('a\\;b\\,c\\:d\\"e\\\\f');
    expect(
      wifiQrValue({ ssid: "Cafe;Net", password: 'p:a,s"s\\w' }),
    ).toBe('WIFI:T:WPA;S:Cafe\\;Net;P:p\\:a\\,s\\"s\\\\w;;');
  });
});
