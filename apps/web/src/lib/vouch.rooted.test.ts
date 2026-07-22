// Founder-rooted trust (@understoria/shared/trust wired through
// trustStatusWithInvites): vouches only count toward "trusted" when
// the voucher is themselves trusted, computed as a fixpoint from the
// founder roots. The scenario that motivated this — two accounts
// invited by one member vouching EACH OTHER into the tier — must
// stay pending forever.
import { describe, expect, it } from "vitest";
import { computeTrustedSet } from "@understoria/shared/trust";
import { generateKeyPair } from "@understoria/shared/crypto";
import {
  createVouch,
  trustStatusWithInvites,
  type RedeemedInviteLike,
  type SignedVouch,
} from "./vouch";

const founder = generateKeyPair();
const alice = generateKeyPair();
const bob = generateKeyPair();
const botA = generateKeyPair();
const botB = generateKeyPair();

function redeemed(
  inviterKey: string,
  redeemedBy: string,
): RedeemedInviteLike {
  return { status: "redeemed", inviterKey, redeemedBy };
}

function vouch(
  voucher: { publicKey: string; secretKey: string },
  voucheeKey: string,
): SignedVouch {
  return createVouch({
    voucherKey: voucher.publicKey,
    voucherSecretKey: voucher.secretKey,
    voucheeKey,
    kind: "manual",
  });
}

const roots = new Set([founder.publicKey]);

describe("computeTrustedSet", () => {
  it("roots at the founders and propagates through trusted vouchers", () => {
    // founder invites alice and bob; founder + alice vouch chains:
    // alice gets founder(invite) + bob(manual)? bob isn't trusted yet.
    // Classic healthy path: founder invites both, then each vouches
    // the other — founder + a trusted peer once one crosses.
    const edges = [
      { voucherKey: founder.publicKey, voucheeKey: alice.publicKey },
      { voucherKey: founder.publicKey, voucheeKey: bob.publicKey },
      { voucherKey: alice.publicKey, voucheeKey: bob.publicKey },
      { voucherKey: bob.publicKey, voucheeKey: alice.publicKey },
    ];
    // Neither alice nor bob can reach 2 TRUSTED vouchers: each has
    // founder (trusted) + the other (pending). Correct — one founder
    // alone cannot mint trusted members; it takes a second trusted
    // voice (another founder or an already-trusted member).
    const trusted = computeTrustedSet(roots, edges);
    expect(trusted.has(founder.publicKey)).toBe(true);
    expect(trusted.has(alice.publicKey)).toBe(false);
    expect(trusted.has(bob.publicKey)).toBe(false);
  });

  it("promotes through the fixpoint once a second trusted voice exists", () => {
    const founder2 = generateKeyPair();
    const edges = [
      // Both founders vouch alice → alice trusted (2 trusted vouchers).
      { voucherKey: founder.publicKey, voucheeKey: alice.publicKey },
      { voucherKey: founder2.publicKey, voucheeKey: alice.publicKey },
      // bob: founder + alice → trusted only BECAUSE alice was promoted
      // in an earlier fixpoint pass.
      { voucherKey: founder.publicKey, voucheeKey: bob.publicKey },
      { voucherKey: alice.publicKey, voucheeKey: bob.publicKey },
    ];
    const trusted = computeTrustedSet(
      new Set([founder.publicKey, founder2.publicKey]),
      edges,
    );
    expect(trusted.has(alice.publicKey)).toBe(true);
    expect(trusted.has(bob.publicKey)).toBe(true);
  });

  it("a sybil cluster vouching itself never becomes trusted", () => {
    const edges = [
      // alice (pending: only the founder's invite) invites two bots...
      { voucherKey: founder.publicKey, voucheeKey: alice.publicKey },
      { voucherKey: alice.publicKey, voucheeKey: botA.publicKey },
      { voucherKey: alice.publicKey, voucheeKey: botB.publicKey },
      // ...and the bots vouch each other. Flat counting would make
      // both trusted (inviter + sibling = 2). Rooted: never.
      { voucherKey: botA.publicKey, voucheeKey: botB.publicKey },
      { voucherKey: botB.publicKey, voucheeKey: botA.publicKey },
    ];
    const trusted = computeTrustedSet(roots, edges);
    expect(trusted.has(botA.publicKey)).toBe(false);
    expect(trusted.has(botB.publicKey)).toBe(false);
  });

  it("ignores self-vouches", () => {
    const edges = [
      { voucherKey: founder.publicKey, voucheeKey: alice.publicKey },
      { voucherKey: alice.publicKey, voucheeKey: alice.publicKey },
    ];
    expect(computeTrustedSet(roots, edges).has(alice.publicKey)).toBe(false);
  });
});

describe("trustStatusWithInvites (rooted wiring)", () => {
  it("keeps the mutual-vouch cluster pending when founder roots are known", () => {
    const invites = [
      redeemed(founder.publicKey, alice.publicKey),
      redeemed(alice.publicKey, botA.publicKey),
      redeemed(alice.publicKey, botB.publicKey),
    ];
    const vouches = [vouch(botA, botB.publicKey), vouch(botB, botA.publicKey)];
    const ctx = { vouches, invites, founderRoots: roots };
    expect(trustStatusWithInvites(botA.publicKey, ctx)).toBe("pending_trust");
    expect(trustStatusWithInvites(botB.publicKey, ctx)).toBe("pending_trust");
    // The flat legacy fallback (no founder capture) would have said
    // trusted — that permissiveness is why the node enforces too.
    const legacy = { vouches, invites };
    expect(trustStatusWithInvites(botA.publicKey, legacy)).toBe("trusted");
  });

  it("trusts through a healthy founder-rooted chain", () => {
    const founder2 = generateKeyPair();
    const ctx = {
      vouches: [vouch(founder2, alice.publicKey)],
      invites: [redeemed(founder.publicKey, alice.publicKey)],
      founderRoots: new Set([founder.publicKey, founder2.publicKey]),
    };
    expect(trustStatusWithInvites(alice.publicKey, ctx)).toBe("trusted");
  });
});
