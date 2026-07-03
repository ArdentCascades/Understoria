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
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deriveCandidateNodeUrl,
  dismissNodeSuggest,
  isExcludedOrigin,
  isNodeSuggestDismissed,
  probeNodeHealth,
  suggestNodeUrlFromOrigin,
} from "./nodeOriginSuggest";
import { writeSubmitConfig } from "./nodeSubmit";
import { db } from "@/db/database";

const ORIGIN = "https://aid.our-union.example";

function healthyFetch(): typeof fetch {
  return vi.fn(async () =>
    new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  ) as unknown as typeof fetch;
}

describe("isExcludedOrigin (§5.3 exclusions)", () => {
  it("excludes local development origins", () => {
    expect(isExcludedOrigin("http://localhost:5173")).toBe(true);
    expect(isExcludedOrigin("http://app.localhost")).toBe(true);
    expect(isExcludedOrigin("http://127.0.0.1:4173")).toBe(true);
    expect(isExcludedOrigin("http://127.1.2.3")).toBe(true);
    expect(isExcludedOrigin("http://[::1]:8080")).toBe(true);
    expect(isExcludedOrigin("http://0.0.0.0:3000")).toBe(true);
  });

  it("excludes non-http(s) and unparseable origins", () => {
    expect(isExcludedOrigin("file:///home/user/index.html")).toBe(true);
    expect(isExcludedOrigin("not an origin")).toBe(true);
    expect(isExcludedOrigin("")).toBe(true);
  });

  it("allows real deployment origins", () => {
    expect(isExcludedOrigin(ORIGIN)).toBe(false);
    expect(isExcludedOrigin("http://aid.internal:8080")).toBe(false);
  });
});

describe("deriveCandidateNodeUrl", () => {
  it("appends /api to the origin (deploy/Caddyfile shape)", () => {
    expect(deriveCandidateNodeUrl(ORIGIN)).toBe(`${ORIGIN}/api`);
    expect(deriveCandidateNodeUrl(`${ORIGIN}/`)).toBe(`${ORIGIN}/api`);
  });
});

describe("probeNodeHealth", () => {
  it("accepts exactly the Understoria health shape", async () => {
    const fetchImpl = healthyFetch();
    expect(await probeNodeHealth(`${ORIGIN}/api`, fetchImpl)).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      `${ORIGIN}/api/health`,
      expect.objectContaining({ method: "GET", credentials: "omit" }),
    );
  });

  it("rejects non-2xx, wrong-shape, non-JSON, and network failures — silently", async () => {
    const notFound = vi.fn(async () =>
      new Response("not found", { status: 404 }),
    ) as unknown as typeof fetch;
    expect(await probeNodeHealth(`${ORIGIN}/api`, notFound)).toBe(false);

    const wrongShape = vi.fn(async () =>
      new Response(JSON.stringify({ hello: "world" }), { status: 200 }),
    ) as unknown as typeof fetch;
    expect(await probeNodeHealth(`${ORIGIN}/api`, wrongShape)).toBe(false);

    const html = vi.fn(async () =>
      new Response("<!doctype html><title>static host</title>", {
        status: 200,
      }),
    ) as unknown as typeof fetch;
    expect(await probeNodeHealth(`${ORIGIN}/api`, html)).toBe(false);

    const network = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    expect(await probeNodeHealth(`${ORIGIN}/api`, network)).toBe(false);
  });
});

describe("suggestNodeUrlFromOrigin — the full §5.3 gate", () => {
  beforeEach(async () => {
    await db.settings.clear();
  });

  it("suggests the derived URL when every gate passes", async () => {
    const url = await suggestNodeUrlFromOrigin({
      origin: ORIGIN,
      fetchImpl: healthyFetch(),
      isDev: false,
    });
    expect(url).toBe(`${ORIGIN}/api`);
  });

  it("never suggests in dev builds (vite dev exclusion)", async () => {
    const fetchImpl = healthyFetch();
    const url = await suggestNodeUrlFromOrigin({
      origin: ORIGIN,
      fetchImpl,
      isDev: true,
    });
    expect(url).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("never suggests from an excluded origin — no probe fires", async () => {
    const fetchImpl = healthyFetch();
    const url = await suggestNodeUrlFromOrigin({
      origin: "http://localhost:5173",
      fetchImpl,
      isDev: false,
    });
    expect(url).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("never suggests on an already-configured device, even with mirroring off", async () => {
    // A URL the member set (or declined into) is their decision —
    // the suggestion must not second-guess it. `enabled: false` still
    // counts as configured.
    await writeSubmitConfig({
      url: "https://other.example/api",
      enabled: false,
    });
    const url = await suggestNodeUrlFromOrigin({
      origin: ORIGIN,
      fetchImpl: healthyFetch(),
      isDev: false,
    });
    expect(url).toBeNull();
  });

  it("stays silent when the health probe fails (PWA-only static hosting)", async () => {
    const notANode = vi.fn(async () =>
      new Response("<!doctype html>", { status: 200 }),
    ) as unknown as typeof fetch;
    const url = await suggestNodeUrlFromOrigin({
      origin: ORIGIN,
      fetchImpl: notANode,
      isDev: false,
    });
    expect(url).toBeNull();
  });
});

describe("node-suggest dismissal (per-device, permanent)", () => {
  beforeEach(async () => {
    await db.settings.clear();
  });

  it("round-trips the flag", async () => {
    expect(await isNodeSuggestDismissed()).toBe(false);
    await dismissNodeSuggest();
    expect(await isNodeSuggestDismissed()).toBe(true);
  });
});
