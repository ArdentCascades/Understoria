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
  createInviteStore,
  createPeerPullStore,
  createPostStore,
  createTaskCommentStore,
  createVouchStore,
} from "./db.js";
import { startPeerPullWorker } from "./peerPull.js";

async function main(): Promise<void> {
  const config = readConfigFromEnv();
  const { app, database } = await buildServer({ config });

  // Start the federation pull worker after the server is built so it
  // shares the same database. Without configured peers this is a
  // no-op and unref'd timers won't keep the process alive on their own.
  const worker = startPeerPullWorker({
    peerUrls: config.peerNodeUrls,
    intervalMs: config.peerPullIntervalMs,
    store: createExchangeStore(database),
    vouchStore: createVouchStore(database),
    postStore: createPostStore(database),
    inviteStore: createInviteStore(database),
    taskCommentStore: createTaskCommentStore(database),
    coorgInvitationStore: createCoOrganizerInvitationStore(database),
    coorgInvitationResponseStore:
      createCoOrganizerInvitationResponseStore(database),
    coorgInvitationRevocationStore:
      createCoOrganizerInvitationRevocationStore(database),
    eventStore: createEventStore(database),
    eventCancellationStore: createEventCancellationStore(database),
    pullStore: createPeerPullStore(database),
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

  const stop = async (signal: string) => {
    app.log.info(`received ${signal}, closing`);
    try {
      worker.stop();
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
