/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { enablePassphrase, lockSession, disablePassphrase } from "@/db/secrets";
import {
  buildRecoveryKit,
  parseRecoveryKit,
  restoreFromRecoveryKit,
  type RecoveryKit,
} from "./recoveryKit";

const PASS = "correct horse battery";

async function reset() {
  lockSession();
  await Promise.all(db.tables.map((t) => t.clear()));
}

/** Mint an identity, connect a node, and export a kit — the source
 *  device's half of every scenario below. */
async function makeKit(): Promise<{ kit: RecoveryKit; publicKey: string }> {
  const member = await createMember({ displayName: "Kit Rosa" }, "node_home");
  await setSetting(SETTING_KEYS.currentMember, member.publicKey);
  await setSetting(SETTING_KEYS.nodeId, "node_home");
  await setSetting(SETTING_KEYS.communityNodeUrl, "https://home.example/api");
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  const built = await buildRecoveryKit(PASS);
  expect(built.ok).toBe(true);
  if (!built.ok) throw new Error("unreachable");
  return { kit: built.kit, publicKey: member.publicKey };
}

beforeEach(reset);

describe("recovery kit round trip", () => {
  it("build → serialize → parse → restore on a wiped device brings the identity home", async () => {
    const { kit, publicKey } = await makeKit();

    // The kit never carries the secret in the clear.
    const text = JSON.stringify(kit);
    const secretRow = await db.secretKeys.get(publicKey);
    expect(secretRow?.secretKey && text.includes(secretRow.secretKey)).toBeFalsy();

    // The phone is lost.
    await reset();

    const parsed = parseRecoveryKit(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const result = await restoreFromRecoveryKit(parsed.kit, PASS);
    expect(result).toEqual({ ok: true, publicKey });

    expect((await db.members.get(publicKey))?.displayName).toBe("Kit Rosa");
    expect(await db.secretKeys.get(publicKey)).toBeDefined();
    expect(await getSetting(SETTING_KEYS.currentMember)).toBe(publicKey);
    expect(await getSetting(SETTING_KEYS.onboarded)).toBeTruthy();
    // Fresh device adopts the kit's community coordinates.
    expect(await getSetting(SETTING_KEYS.nodeId)).toBe("node_home");
    expect(await getSetting(SETTING_KEYS.communityNodeUrl)).toBe(
      "https://home.example/api",
    );
    expect(await getSetting(SETTING_KEYS.communityNodeEnabled)).toBe("1");
  });

  it("refuses the wrong passphrase and a tampered kit, distinctly", async () => {
    const { kit } = await makeKit();
    await reset();

    expect(await restoreFromRecoveryKit(kit, "not the passphrase")).toEqual({
      ok: false,
      error: "wrong_passphrase",
    });

    // Right passphrase, wrong owner: the decrypted key must BE the
    // named identity.
    const other = await createMember({ displayName: "Mallory" }, "node_x");
    await reset();
    const tampered = { ...kit, publicKey: other.publicKey };
    expect(await restoreFromRecoveryKit(tampered, PASS)).toEqual({
      ok: false,
      error: "corrupted_kit",
    });
  });

  it("never clobbers an existing node config (a stale kit is a suggestion)", async () => {
    const { kit } = await makeKit();
    await reset();
    await setSetting(SETTING_KEYS.communityNodeUrl, "https://current.example/api");
    await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
    // The device also has its own member → its own community id stays.
    await createMember({ displayName: "Resident" }, "node_here");
    await setSetting(SETTING_KEYS.nodeId, "node_here");

    const result = await restoreFromRecoveryKit(kit, PASS);
    expect(result.ok).toBe(true);
    expect(await getSetting(SETTING_KEYS.communityNodeUrl)).toBe(
      "https://current.example/api",
    );
    expect(await getSetting(SETTING_KEYS.nodeId)).toBe("node_here");
  });

  it("refuses to restore onto a locked device (never writes beside wrapped keys)", async () => {
    const { kit } = await makeKit();
    await reset();
    await createMember({ displayName: "Locked Larry" }, "node_l");
    await enablePassphrase("larrys session pass");
    lockSession();

    expect(await restoreFromRecoveryKit(kit, PASS)).toEqual({
      ok: false,
      error: "device_locked",
    });
    // Cleanup for later tests.
    const { unlockSession } = await import("@/db/secrets");
    await unlockSession("larrys session pass");
    await disablePassphrase();
  });
});

describe("buildRecoveryKit", () => {
  it("refuses while locked (the kit wraps the RAW key, independently)", async () => {
    const member = await createMember({ displayName: "Rosa" }, "node_h");
    await setSetting(SETTING_KEYS.currentMember, member.publicKey);
    await enablePassphrase("daily pass");
    lockSession();
    expect(await buildRecoveryKit(PASS)).toEqual({ ok: false, error: "locked" });
    const { unlockSession } = await import("@/db/secrets");
    await unlockSession("daily pass");
    await disablePassphrase();
  });

  it("reports no_identity on a fresh device", async () => {
    expect(await buildRecoveryKit(PASS)).toEqual({
      ok: false,
      error: "no_identity",
    });
  });
});

describe("parseRecoveryKit", () => {
  it("rejects garbage, foreign JSON, and future versions distinctly", () => {
    expect(parseRecoveryKit("not json").ok).toBe(false);
    expect(parseRecoveryKit('{"kind":"something-else"}').ok).toBe(false);
    const future = parseRecoveryKit(
      JSON.stringify({ kind: "understoria-recovery-kit", version: 2 }),
    );
    expect(future).toEqual({ ok: false, error: "unsupported_version" });
  });
});
