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
import type { FastifyInstance } from "fastify";
import { founderKeyHash } from "@understoria/shared/crypto";
import type { Config } from "../config.js";
import type { SystemSigner } from "../systemSigner.js";

// Agent 11: public node config endpoint. Exposes (only) the operator
// / hosting transparency block — members and peer nodes can see who
// runs the node and how it's sustained without authenticating.
//
// Deliberately not exposed:
// - Database path, rate-limit values, log settings, CORS origin
//   (operational details that don't belong on the public surface)
// - Member or exchange counts (would leak community size to passive
//   observers; "minimal surface" per docs/threat-model.md §6)
//
// `nodeId` IS exposed, but only when something published here needs
// it for verification: a system-signed exchange carries
// `autoConfirmedBy: "system:<nodeId>"`, and a verifying peer needs an
// authenticated binding from that nodeId to the pubkey — which is
// exactly "this URL, whose records I pull, says it is node N with
// key K". The same applies to `founderKeyHashes`, whose salt is the
// nodeId. The id was never a secret (it is stamped on every
// federated record); with neither a system key nor founders there is
// no verification need, so it stays unpublished in that case.
//
// When the operator hasn't set any of the OPERATOR_* env vars, the
// response is `{}` rather than `{operator: null}`. Empty-object is
// a clearer signal than a null field that the operator chose not
// to publish identifying info.

export interface PublicConfigResponse {
  operator?: {
    name: string | null;
    fundingNote: string | null;
    contact: string | null;
  };
  /**
   * Auto-confirm system key — published so members' PWAs and peer
   * nodes can verify the helped-side signature on system-signed
   * exchanges. `current` is the live pubkey; `history` is the
   * rotation trail. Omitted when the operator hasn't supplied
   * `NODE_SYSTEM_SECRET_KEY`. See `docs/auto-confirm-key.md` §4.
   *
   * Rotation: `history` serves the operator-published trail from
   * `NODE_SYSTEM_KEY_HISTORY` (see `docs/system-key-rotation.md` for
   * the procedure). The verifier side is live on pulling peers: they
   * select the key that was current at each record's
   * `autoConfirmedAt`, so past records verify against the retired
   * key and post-retirement claims of it fail.
   */
  systemKey?: {
    current: string;
    history: { pubkey: string; retiredAt: number }[];
  };
  /** Present exactly when `systemKey` is — the node id the key signs
   *  for, binding `autoConfirmedBy: "system:<nodeId>"` claims to the
   *  published pubkey. */
  nodeId?: string;
  /**
   * Mirror nodes of THIS community (`MIRROR_ANNOUNCE_URLS`) — the
   * addresses member apps may fail over to when this node is
   * unreachable. Announcing is an invitation, not a command: the PWA
   * shows a consent card naming each newly announced mirror and only
   * adopts it after the member accepts (`docs/community-resilience.md`
   * §B.2). Omitted when the operator announces none. Config is an
   * open pre-membership surface, so mirrors listed here are public —
   * operators should only announce addresses that are meant to be
   * exactly as reachable as this node itself.
   */
  mirrors?: string[];
  /** Co-signature quorum for member removal / reinstatement records
   *  (docs/member-removal.md). Always present: member devices verify
   *  pulled records against this instead of hard-coding a number,
   *  and an open /config keeps the rule auditable by everyone.
   *  (Optional only for the builder's `{}` literal — the route sets
   *  it unconditionally.) */
  removalQuorum?: number;
  /** Whether this node has a founding trust root (env founder keys
   *  or an in-band claimed founder). `false` = a fresh node waiting
   *  for its founder to present the boot-log setup code — the PWA's
   *  Founder setup card keys off this. Always present; /config is
   *  the pre-membership surface, and "is this node ready?" must be
   *  answerable before membership is provable. */
  claimed?: boolean;
  /**
   * Salted one-way commitments to the node's founding trust roots —
   * `founderKeyHash(nodeId, key)` for every env founder key and every
   * in-band claimed founder (see the shared helper's doc for the
   * disclosure analysis). Member devices capture this on their
   * regular /config fetch and treat a member whose key hashes to a
   * published value as trusted-by-construction, which is what breaks
   * the vouch-bootstrap deadlock: a fresh community's founder has
   * zero vouchers, and only trusted members can meaningfully vouch —
   * without a published root, nobody could ever reach trusted.
   * Sorted for a stable wire shape; omitted while the node is
   * unclaimed (there are no roots to publish). `nodeId` is always
   * present alongside, since it is the hash salt.
   */
  founderKeyHashes?: string[];
}

export async function registerConfigRoutes(
  app: FastifyInstance,
  options: {
    config: Config;
    signer: SystemSigner | null;
    /** Live claim state (env founders OR claimed_founders row) —
     *  a function because the claim can land mid-process. */
    isClaimed: () => boolean;
    /** The current founder-key set (env NODE_FOUNDER_KEYS ∪
     *  claimed_founders rows) — a function for the same reason as
     *  `isClaimed`: a claim can land mid-process and must show up on
     *  the very next /config fetch. */
    listFounderKeys: () => readonly string[];
  },
): Promise<void> {
  const { config, signer, isClaimed, listFounderKeys } = options;

  app.get("/config", async () => {
    const operator = buildOperatorBlock(config);
    const response: PublicConfigResponse = {};
    if (operator) response.operator = operator;
    if (signer) {
      response.systemKey = {
        current: signer.publicKey,
        history: config.systemKeyHistory,
      };
      response.nodeId = config.nodeId;
    }
    if (config.mirrorAnnounceUrls.length > 0) {
      response.mirrors = [...config.mirrorAnnounceUrls];
    }
    const founderKeys = listFounderKeys();
    if (founderKeys.length > 0) {
      response.founderKeyHashes = [
        ...new Set(founderKeys.map((k) => founderKeyHash(config.nodeId, k))),
      ].sort();
      // The hashes are salted with the node id, so the id must ride
      // along for a device to verify them (see the header comment).
      response.nodeId = config.nodeId;
    }
    response.removalQuorum = config.removalQuorum;
    response.claimed = isClaimed();
    return response;
  });
}

function buildOperatorBlock(
  config: Config,
): PublicConfigResponse["operator"] | null {
  if (
    config.operatorName === null &&
    config.operatorFundingNote === null &&
    config.operatorContact === null
  ) {
    return null;
  }
  return {
    name: config.operatorName,
    fundingNote: config.operatorFundingNote,
    contact: config.operatorContact,
  };
}
