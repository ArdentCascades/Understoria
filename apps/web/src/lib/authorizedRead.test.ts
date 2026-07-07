/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  canonicalReadAuthMessage,
  generateKeyPair,
  verify,
} from "@understoria/shared/crypto";
import { db, setSetting, SETTING_KEYS } from "@/db/database";
import { persistSecretKey } from "@/db/secrets";
import { authorizedFetch } from "./authorizedRead";

describe("authorizedFetch", () => {
  beforeEach(async () => {
    await Promise.all([db.settings.clear(), db.secretKeys.clear()]);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("signs the NODE-RELATIVE path so the /api-stripping proxy verifies", async () => {
    const member = generateKeyPair();
    await setSetting(SETTING_KEYS.currentMember, member.publicKey);
    await persistSecretKey(member.publicKey, member.secretKey);

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await authorizedFetch(
      "https://community.test/api/posts?since=42&limit=200",
      "https://community.test/api",
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["x-understoria-key"]).toBe(member.publicKey);
    // The signature must cover "/posts?since=42&limit=200" — what the
    // server sees AFTER Caddy's handle_path strips /api — not the
    // absolute client-side path.
    expect(
      verify(
        canonicalReadAuthMessage(
          "/posts?since=42&limit=200",
          Number(headers["x-understoria-ts"]),
        ),
        headers["x-understoria-sig"],
        member.publicKey,
      ),
    ).toBe(true);
  });

  it("degrades to a plain request when this device has no identity", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    await authorizedFetch("https://node.test/posts", "https://node.test");
    expect(fetchMock.mock.calls[0][1]).toBeUndefined();
  });

  it("degrades to a plain request when the secret key is unavailable", async () => {
    const member = generateKeyPair();
    // Identity named but no secret row (e.g. cleared, or locked state
    // where unwrap fails) — must not throw, must not send headers.
    await setSetting(SETTING_KEYS.currentMember, member.publicKey);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    await authorizedFetch("https://node.test/posts", "https://node.test");
    expect(fetchMock.mock.calls[0][1]).toBeUndefined();
  });
});
