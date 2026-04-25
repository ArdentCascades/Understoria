import { describe, expect, it } from "vitest";
import { generateKeyPair } from "./crypto";
import {
  createVouch,
  trustStatus,
  trustStatusWithInvites,
  verifyVouch,
  vouchesFor,
} from "./vouch";

describe("createVouch + verifyVouch", () => {
  it("creates a vouch that verifies with the voucher's public key", () => {
    const voucher = generateKeyPair();
    const vouchee = generateKeyPair();
    const v = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    expect(verifyVouch(v)).toBe(true);
  });

  it("rejects a tampered vouch", () => {
    const voucher = generateKeyPair();
    const vouchee = generateKeyPair();
    const attacker = generateKeyPair();
    const v = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    const tampered = { ...v, voucheeKey: attacker.publicKey };
    expect(verifyVouch(tampered)).toBe(false);
  });
});

describe("trustStatus", () => {
  const vouchee = generateKeyPair();
  function makeVouch() {
    const voucher = generateKeyPair();
    return createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "invite",
    });
  }

  it("starts as pending_trust with no vouches", () => {
    expect(trustStatus(vouchee.publicKey, [])).toBe("pending_trust");
  });

  it("is still pending_trust with a single vouch", () => {
    expect(trustStatus(vouchee.publicKey, [makeVouch()])).toBe(
      "pending_trust",
    );
  });

  it("becomes trusted with two vouches from distinct keys", () => {
    expect(
      trustStatus(vouchee.publicKey, [makeVouch(), makeVouch()]),
    ).toBe("trusted");
  });

  it("does not count duplicate vouches from the same voucher", () => {
    const voucher = generateKeyPair();
    const a = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
      now: 1,
    });
    const b = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
      now: 2,
    });
    expect(trustStatus(vouchee.publicKey, [a, b])).toBe("pending_trust");
  });

  it("ignores invalid vouches", () => {
    const good = makeVouch();
    const bad = { ...makeVouch(), signature: "x".repeat(88) };
    expect(trustStatus(vouchee.publicKey, [good, bad])).toBe("pending_trust");
  });
});

describe("trustStatusWithInvites", () => {
  const vouchee = generateKeyPair();

  it("treats a redeemed invite as an implicit vouch", () => {
    const inviter = generateKeyPair();
    const invites = [
      {
        status: "redeemed" as const,
        inviterKey: inviter.publicKey,
        redeemedBy: vouchee.publicKey,
      },
    ];
    expect(
      trustStatusWithInvites(vouchee.publicKey, { vouches: [], invites }),
    ).toBe("pending_trust");

    const secondVoucher = generateKeyPair();
    const v = createVouch({
      voucherKey: secondVoucher.publicKey,
      voucherSecretKey: secondVoucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    expect(
      trustStatusWithInvites(vouchee.publicKey, { vouches: [v], invites }),
    ).toBe("trusted");
  });

  it("does not double-count an invite from the same key as a manual vouch", () => {
    const voucher = generateKeyPair();
    const v = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    const invites = [
      {
        status: "redeemed" as const,
        inviterKey: voucher.publicKey,
        redeemedBy: vouchee.publicKey,
      },
    ];
    expect(
      trustStatusWithInvites(vouchee.publicKey, {
        vouches: [v],
        invites,
      }),
    ).toBe("pending_trust");
  });

  it("ignores non-redeemed invites", () => {
    const inviter1 = generateKeyPair();
    const inviter2 = generateKeyPair();
    expect(
      trustStatusWithInvites(vouchee.publicKey, {
        vouches: [],
        invites: [
          {
            status: "open",
            inviterKey: inviter1.publicKey,
            redeemedBy: null,
          },
          {
            status: "revoked",
            inviterKey: inviter2.publicKey,
            redeemedBy: null,
          },
        ],
      }),
    ).toBe("pending_trust");
  });
});

describe("vouchesFor", () => {
  it("returns only valid vouches addressed to the given member", () => {
    const vouchee = generateKeyPair();
    const other = generateKeyPair();
    const voucher = generateKeyPair();
    const vouchForOther = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: other.publicKey,
      kind: "manual",
    });
    const vouchForMe = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    const list = vouchesFor(vouchee.publicKey, [vouchForOther, vouchForMe]);
    expect(list).toHaveLength(1);
    expect(list[0].voucheeKey).toBe(vouchee.publicKey);
  });
});
