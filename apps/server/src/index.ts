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
import { readConfigFromEnv } from "./config.js";
import { buildServer } from "./server.js";
import {
  createCoOrganizerInvitationResponseStore,
  createCoOrganizerInvitationRevocationStore,
  createCoOrganizerInvitationStore,
  createEventCancellationStore,
  createEventStore,
  createExchangeStore,
  createMirrorPullStore,
  createPeerPullStore,
  createPostStore,
  createTaskCommentStore,
  createVouchStore,
} from "./db.js";
import { startPeerPullWorker } from "./peerPull.js";
import { startMirrorPullWorker } from "./mirrorPull.js";
import { createSystemSignerFromSecret } from "./systemSigner.js";

async function main(): Promise<void> {
  const config = readConfigFromEnv();
  const { app, database, internalBypassToken } = await buildServer({ config });

  // Start the federation pull worker after the server is built so it
  // shares the same database. Without configured peers this is a
  // no-op and unref'd timers won't keep the process alive on their own.
  const worker = startPeerPullWorker({
    peerUrls: config.peerNodeUrls,
    intervalMs: config.peerPullIntervalMs,
    store: createExchangeStore(database),
    vouchStore: createVouchStore(database),
    postStore: createPostStore(database),
    taskCommentStore: createTaskCommentStore(database),
    coorgInvitationStore: createCoOrganizerInvitationStore(database),
    coorgInvitationResponseStore:
      createCoOrganizerInvitationResponseStore(database),
    coorgInvitationRevocationStore:
      createCoOrganizerInvitationRevocationStore(database),
    eventStore: createEventStore(database),
    eventCancellationStore: createEventCancellationStore(database),
    pullStore: createPeerPullStore(database),
    // When a peer enforces member-authenticated reads, our pulls
    // present the shared token agreed for that peering pair
    // (PEER_READ_TOKENS — docs/member-authenticated-reads.md §1).
    // Peers without a mapped token get the plain fetch, exactly as
    // before.
    fetcher: (url) => {
      const base = Object.keys(config.peerReadTokens).find((peer) =>
        url.startsWith(peer),
      );
      return base
        ? fetch(url, {
            headers: {
              authorization: `Bearer ${config.peerReadTokens[base]}`,
            },
          })
        : fetch(url);
    },
    onError: (peerUrl, err) =>
      app.log.warn({ peerUrl, err }, "peer pull failed"),
    onPull: (result) =>
      app.log.info(
        {
          peerUrl: result.peerUrl,
          kind: result.kind,
          insertedCount: result.insertedCount,
          duplicateCount: result.duplicateCount,
          rejectedCount: result.rejectedCount,
        },
        "peer pull completed",
      ),
  });

  // Mirror replication (docs/community-resilience.md §B.1): pull every
  // durable kind from each same-community mirror and apply it through
  // this node's own routes. Without configured mirrors this is a no-op.
  // The own-key entry lets rows this node auto-confirmed itself verify
  // when they come back around through a mirror.
  const ownSigner = createSystemSignerFromSecret(config.systemSecretKey);
  const mirrorWorker = startMirrorPullWorker({
    app,
    internalToken: internalBypassToken,
    mirrorUrls: config.mirrorNodeUrls,
    readTokens: config.mirrorReadTokens,
    intervalMs: config.mirrorPullIntervalMs,
    cursorStore: createMirrorPullStore(database),
    exchangeStore: createExchangeStore(database),
    ownSystemKey: ownSigner
      ? {
          nodeId: config.nodeId,
          current: ownSigner.publicKey,
          history: [...config.systemKeyHistory],
        }
      : null,
    onResult: (result) => {
      if (result.applied > 0 || result.refused > 0 || result.halted) {
        app.log.info(
          {
            mirrorUrl: result.mirrorUrl,
            kind: result.kind,
            applied: result.applied,
            refused: result.refused,
            halted: result.halted,
            haltReason: result.haltReason,
          },
          "mirror pull",
        );
      }
    },
  });

  const stop = async (signal: string) => {
    app.log.info(`received ${signal}, closing`);
    try {
      worker.stop();
      mirrorWorker.stop();
      await app.close();
    } catch (err) {
      app.log.error({ err }, "error during close");
      process.exit(1);
    }
    process.exit(0);
  };
  process.on("SIGTERM", () => void stop("SIGTERM"));
  process.on("SIGINT", () => void stop("SIGINT"));

  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (err) {
    app.log.error({ err }, "failed to start");
    process.exit(1);
  }
}

void main();
