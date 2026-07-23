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
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { TrustGateCard } from "@/components/InviteTrustGateCard";
import { removalQuorum } from "@/lib/memberRemoval";
import { trustStatusWithInvites, trustedCircleSize } from "@/lib/vouch";

// Removal/reinstatement co-signing is a trusted-member power: the
// node refuses quorums containing untrusted signers. The client half
// mirrors `inviteIssuanceAllowed`'s posture — with NO founder capture
// the rooted computation has no anchor, so the device stays quiet and
// lets the node enforce; with a capture, every ceremony surface
// (propose, reinstate, co-sign) announces the gate at the point of
// action (operator ruling: "the system should be very clear as
// someone is trying to take an action, they need to be vouched").
//
// `circle_short` is the honest low-circle state on top: the member IS
// trusted, but the whole rooted circle is smaller than the quorum, so
// no valid record can exist yet however many people agree — a tiny
// circle can't be pressured into expulsions; it handles problems
// socially.

export type RemovalGateState =
  | { kind: "allowed" }
  | { kind: "pending_trust" }
  | { kind: "circle_short"; have: number; need: number };

export function useRemovalGate(): RemovalGateState {
  const { currentMember, vouches, invites, founderRoots } = useApp();
  const [quorum, setQuorum] = useState(3);
  useEffect(() => {
    // Cancellation-guarded (the useVouchDiscoveryNudge pattern): the
    // promise can resolve after unmount — in tests, after the whole
    // environment is torn down — and an unguarded setState then is an
    // unhandled rejection.
    let cancelled = false;
    void removalQuorum().then((q) => {
      if (!cancelled) setQuorum(q);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return useMemo<RemovalGateState>(() => {
    // No capture (or no identity yet): the device can't judge — same
    // exception as inviteIssuanceAllowed. Optional chaining because
    // test mocks of AppContext may omit founderRoots entirely.
    if (!currentMember || (founderRoots?.size ?? 0) === 0)
      return { kind: "allowed" };
    const ctx = { vouches, invites, founderRoots };
    if (trustStatusWithInvites(currentMember.publicKey, ctx) !== "trusted")
      return { kind: "pending_trust" };
    const have = trustedCircleSize(ctx);
    if (have !== null && have < quorum)
      return { kind: "circle_short", have, need: quorum };
    return { kind: "allowed" };
  }, [currentMember, vouches, invites, founderRoots, quorum]);
}

/**
 * Rendered in place of a ceremony affordance when the gate is closed.
 * The trust card takes NO `have` progress: the removal gate renders
 * on ANOTHER member's page (MemberDetail), where numeric vouch
 * progress reads as a score (no-leaderboards tripwire). The
 * circle-short note's numbers are fine — a community-level count,
 * never a member's — and it must not list who is trusted.
 */
export function RemovalGateNotice({
  gate,
}: {
  gate: Exclude<RemovalGateState, { kind: "allowed" }>;
}) {
  const { t } = useTranslation();
  if (gate.kind === "pending_trust") {
    return <TrustGateCard i18nBase="removals.gate" />;
  }
  return (
    <p className="rounded-xl bg-moss-50 p-3 text-sm text-moss-700 dark:bg-moss-900 dark:text-moss-200">
      {t("removals.circleShort", { have: gate.have, need: gate.need })}
    </p>
  );
}
