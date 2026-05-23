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
import { beforeEach, describe, expect, it } from "vitest";
import {
  dismissProfileNudge,
  isProfileNudgeDismissed,
  profileIsBare,
} from "./profileNudge";
import { db, SETTING_KEYS } from "@/db/database";
import type { Member } from "@/types";

function buildMember(overrides: Partial<Member> = {}): Member {
  return {
    publicKey: "test-key",
    nodeId: "test-node",
    displayName: "Test",
    skills: [],
    availability: "",
    locationZone: "",
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    ...overrides,
  };
}

describe("profileIsBare", () => {
  it("is false for a null member (no current member, no nudge)", () => {
    expect(profileIsBare(null)).toBe(false);
  });

  it("is true when zone + skills + availability are all empty", () => {
    expect(profileIsBare(buildMember())).toBe(true);
  });

  it("is false when locationZone is set", () => {
    expect(profileIsBare(buildMember({ locationZone: "North side" }))).toBe(
      false,
    );
  });

  it("is false when skills has at least one entry", () => {
    expect(profileIsBare(buildMember({ skills: ["cooking"] }))).toBe(false);
  });

  it("is false when availability is set", () => {
    expect(profileIsBare(buildMember({ availability: "Evenings" }))).toBe(
      false,
    );
  });

  it("treats whitespace-only zone / availability as empty", () => {
    expect(
      profileIsBare(
        buildMember({ locationZone: "   ", availability: "\t" }),
      ),
    ).toBe(true);
  });
});

describe("dismissProfileNudge / isProfileNudgeDismissed", () => {
  beforeEach(async () => {
    await db.settings.delete(SETTING_KEYS.profileNudgeDismissed);
  });

  it("starts undismissed", async () => {
    expect(await isProfileNudgeDismissed()).toBe(false);
  });

  it("returns true after dismiss is called", async () => {
    await dismissProfileNudge();
    expect(await isProfileNudgeDismissed()).toBe(true);
  });

  it("only treats the exact sentinel as dismissed", async () => {
    await db.settings.put({
      key: SETTING_KEYS.profileNudgeDismissed,
      value: "yes",
    });
    expect(await isProfileNudgeDismissed()).toBe(false);
  });
});
