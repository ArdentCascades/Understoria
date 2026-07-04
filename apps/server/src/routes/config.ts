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
// `nodeId` IS exposed, but only alongside a published system key: a
// system-signed exchange carries `autoConfirmedBy: "system:<nodeId>"`,
// and a verifying peer needs an authenticated binding from that
// nodeId to the pubkey — which is exactly "this URL, whose records I
// pull, says it is node N with key K". The id was never a secret (it
// is stamped on every federated record); without a system key there
// is no verification need, so it stays unpublished in that case.
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
   * Rotation note: `history` is always `[]` in PR-A. Rotating the
   * key requires a deploy-time procedure (regenerate, archive the
   * old pubkey into a static history list, restart) that is
   * documented separately and intentionally out of scope for code
   * in this PR. A future agent that wires rotation into the
   * operator UI will fill this array.
   */
  systemKey?: {
    current: string;
    history: { pubkey: string; retiredAt: number }[];
  };
  /** Present exactly when `systemKey` is — the node id the key signs
   *  for, binding `autoConfirmedBy: "system:<nodeId>"` claims to the
   *  published pubkey. */
  nodeId?: string;
}

export async function registerConfigRoutes(
  app: FastifyInstance,
  options: { config: Config; signer: SystemSigner | null },
): Promise<void> {
  const { config, signer } = options;

  app.get("/config", async () => {
    const operator = buildOperatorBlock(config);
    const response: PublicConfigResponse = {};
    if (operator) response.operator = operator;
    if (signer) {
      response.systemKey = { current: signer.publicKey, history: [] };
      response.nodeId = config.nodeId;
    }
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
