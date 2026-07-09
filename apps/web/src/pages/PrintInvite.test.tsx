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
// The invite poster (/print/invite#<encoded>). Locks:
//   1. The QR encodes the CANONICAL invite URL rebuilt from the
//      fragment — the poster can never point anywhere else.
//   2. The token is verified before rendering: an expired invite
//      gets an honest refusal (posters that fail at the door are
//      worse than no poster), garbage gets the invalid message.
//   3. The "paper doesn't sync or purge" footer is present — the
//      threat-model line this feature owes.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The QR component lazy-imports the qrcode package; the poster tests
// only care WHAT it is asked to encode.
vi.mock("@/components/InviteQRCode", () => ({
  InviteQRCode: ({ value }: { value: string }) => (
    <div data-testid="qr" data-value={value} />
  ),
}));

import "@/i18n";
import { generateKeyPair } from "@/lib/crypto";
import { createInvite, encodeInviteToken } from "@/lib/invite";
import PrintInvitePage from "./PrintInvite";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function renderAt(hash: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[`/print/invite${hash}`]}>
        <Routes>
          <Route path="/print/invite" element={<PrintInvitePage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

function makeEncoded(expiresInMs: number): string {
  const kp = generateKeyPair();
  return encodeInviteToken(
    createInvite({
      inviterKey: kp.publicKey,
      inviterSecretKey: kp.secretKey,
      inviterName: "Imani",
      nodeId: "node-1",
      expiresInMs,
    }),
  );
}

describe("PrintInvitePage", () => {
  it("renders the poster with a QR of the canonical invite URL and the paper footer", () => {
    const encoded = makeEncoded(7 * 24 * 60 * 60 * 1000);
    renderAt(`#${encoded}`);

    const qr = container.querySelector('[data-testid="qr"]')!;
    expect(qr.getAttribute("data-value")).toBe(
      `${window.location.origin}/invite#${encoded}`,
    );
    expect(container.textContent).toContain("paper doesn't sync or purge");
    expect(container.textContent).toContain("This invitation is good until");
  });

  it("refuses to render a poster for an expired invite", () => {
    renderAt(`#${makeEncoded(-1000)}`);
    expect(container.querySelector('[data-testid="qr"]')).toBeNull();
    expect(container.textContent).toContain("expired");
  });

  it("refuses garbage", () => {
    renderAt("#not-a-real-token-aaaaaaaaaaaaaaaa");
    expect(container.querySelector('[data-testid="qr"]')).toBeNull();
    expect(container.textContent).toContain(
      "doesn't look like a valid invitation",
    );
  });
});
