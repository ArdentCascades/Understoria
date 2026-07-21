/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The infrastructure page's "The software itself" card: the node
// self-serves its Corresponding Source at /source/ (AGPL §13,
// scripts/pack-source.sh). Three response shapes matter: a real
// manifest (links render), the SPA fallback from a pre-feature
// deployment (200 + text/html — must read as ABSENT, not crash on
// JSON.parse), and a network error.

import "@/i18n";
import { SourceCard } from "./Infrastructure";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
});

async function render() {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <MemoryRouter>
        <SourceCard />
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
  // Let the fetch effect settle.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
}

function stubFetchJson(payload: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => payload,
    })),
  );
}

describe("SourceCard", () => {
  it("renders download links, version, and the integrity caution from a real manifest", async () => {
    stubFetchJson({
      name: "understoria",
      version: "0.3.0",
      commit: "abc1234",
      generatedAt: "2026-07-11T00:00:00.000Z",
      files: [
        {
          name: "understoria-source.tar.gz",
          bytes: 2_500_000,
          sha256: "aa",
        },
        { name: "understoria.bundle", bytes: 47_000_000, sha256: "bb" },
      ],
    });
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain("Version 0.3.0 · build (commit) abc1234");
    expect(text).toContain("Download the source (2.4 MB)");
    expect(text).toContain("Full history bundle (44.8 MB)");
    expect(text).toContain("Checksums");
    expect(text).toContain("prove the download wasn't corrupted");
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    // Hrefs are absolute via shareOrigin() — on the web that is
    // exactly window.location.origin, so these stay same-origin.
    expect(hrefs).toContain(
      `${window.location.origin}/source/understoria-source.tar.gz`,
    );
    expect(hrefs).toContain(`${window.location.origin}/source/understoria.bundle`);
    expect(hrefs).toContain(`${window.location.origin}/source/SHA256SUMS`);
  });

  it("treats the SPA fallback (200, text/html) as absent — the pre-feature deployment case", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "text/html" }),
        json: async () => {
          throw new Error("html is not json");
        },
      })),
    );
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain("doesn't offer a source download yet");
    expect(text).toContain("public repository");
    expect(
      container.querySelector(
        `a[href="${window.location.origin}/source/understoria-source.tar.gz"]`,
      ),
    ).toBeNull();
  });

  it("treats a network error as absent rather than crashing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    await render();
    expect(container.textContent ?? "").toContain(
      "doesn't offer a source download yet",
    );
  });
});
