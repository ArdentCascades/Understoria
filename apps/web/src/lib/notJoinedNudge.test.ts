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
import { beforeEach, describe, expect, it } from "vitest";
import {
  dismissNotJoinedNudge,
  isNotJoined,
  isNotJoinedNudgeDismissed,
  notJoinedDismissKey,
} from "./notJoinedNudge";
import { db } from "@/db/database";

const KEY = "member_a";

// One redeemed-invite row naming KEY, one open row, one redeemed row
// naming someone else — only the first counts as "joined".
const redeemedMine = { status: "redeemed" as const, redeemedBy: KEY };
const openRow = { status: "open" as const, redeemedBy: null };
const redeemedOther = {
  status: "redeemed" as const,
  redeemedBy: "member_b",
};

describe("isNotJoined (docs/invite-redemption.md §5.1.4 detection)", () => {
  it("is true for an orphan identity: no redeemed invite, no node", () => {
    expect(
      isNotJoined({
        memberKey: KEY,
        invites: [openRow, redeemedOther],
        communityNodeUrl: "",
      }),
    ).toBe(true);
  });

  it("is false once a redeemed invite names the member", () => {
    expect(
      isNotJoined({
        memberKey: KEY,
        invites: [redeemedMine],
        communityNodeUrl: "",
      }),
    ).toBe(false);
  });

  it("is false once a community node is configured (whitespace doesn't count)", () => {
    expect(
      isNotJoined({
        memberKey: KEY,
        invites: [],
        communityNodeUrl: "https://aid.example.org/api",
      }),
    ).toBe(false);
    expect(
      isNotJoined({ memberKey: KEY, invites: [], communityNodeUrl: "  " }),
    ).toBe(true);
  });

  it("is false with no identity at all — that's Welcome's territory", () => {
    expect(
      isNotJoined({ memberKey: null, invites: [], communityNodeUrl: "" }),
    ).toBe(false);
  });
});

describe("not-joined dismissal (per-identity, permanent)", () => {
  beforeEach(async () => {
    await db.settings.clear();
  });

  it("keys the flag by member public key", () => {
    expect(notJoinedDismissKey("k1")).not.toBe(notJoinedDismissKey("k2"));
  });

  it("dismissing one identity leaves the other undismissed (shared device)", async () => {
    expect(await isNotJoinedNudgeDismissed("k1")).toBe(false);
    await dismissNotJoinedNudge("k1");
    expect(await isNotJoinedNudgeDismissed("k1")).toBe(true);
    expect(await isNotJoinedNudgeDismissed("k2")).toBe(false);
  });
});
