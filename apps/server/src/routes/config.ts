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

// Agent 11: public node config endpoint. Exposes (only) the operator
// / hosting transparency block — members and peer nodes can see who
// runs the node and how it's sustained without authenticating.
//
// Deliberately not exposed:
// - Internal `nodeId` (used in stored exchanges, not a public secret
//   but not a useful thing to show either)
// - Database path, rate-limit values, log settings, CORS origin
//   (operational details that don't belong on the public surface)
// - Member or exchange counts (would leak community size to passive
//   observers; "minimal surface" per docs/threat-model.md §6)
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
}

export async function registerConfigRoutes(
  app: FastifyInstance,
  options: { config: Config },
): Promise<void> {
  const { config } = options;

  app.get("/config", async () => {
    const operator = buildOperatorBlock(config);
    const response: PublicConfigResponse = {};
    if (operator) response.operator = operator;
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
