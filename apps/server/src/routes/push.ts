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
import type { FastifyInstance } from "fastify";
import {
  canonicalPushAuthMessage,
  isNotificationCategory,
  verify,
} from "@understoria/shared";
import type { PushSubscriptionStore } from "../db.js";
import type { MembershipResolver } from "../readAuth.js";
import { READ_AUTH_MAX_SKEW_MS } from "../readAuth.js";

/**
 * Push-subscription lifecycle (docs/notifications.md — quiet by
 * default). Every write is member-signed over
 * `canonicalPushAuthMessage` with a bounded timestamp (the read-auth
 * skew window; these writes are idempotent, so a nonce buys nothing
 * further), and membership is checked against the same resolver the
 * read guard uses — no new membership register.
 *
 * What is deliberately NOT here: the member's lock-screen tier and
 * custom notification title (device-only, applied by the service
 * worker at display time), and any send trigger — this PR ships the
 * lifecycle dark; categories gate what the node MAY send once the
 * trigger PR lands.
 */

/** Devices per member — generous for real households of devices,
 *  tight enough to bound a hostile member filling the table. */
const MAX_SUBSCRIPTIONS_PER_MEMBER = 10;

/** Browser push endpoints are long URLs; anything longer than this
 *  is not one. */
const MAX_ENDPOINT_CHARS = 2048;

export interface PushRouteDeps {
  store: PushSubscriptionStore;
  resolver: MembershipResolver;
  vapidPublicKey: string;
  now?: () => number;
}

interface AuthedBody {
  memberKey: string;
  deviceId: string;
  timestamp: number;
  signature: string;
}

function checkAuth(
  deps: PushRouteDeps,
  body: AuthedBody,
  action: "push-subscribe" | "push-renew" | "push-delete",
  endpoint: string,
  categories: readonly string[],
): string | null {
  const now = (deps.now ?? Date.now)();
  if (
    typeof body.memberKey !== "string" ||
    typeof body.deviceId !== "string" ||
    typeof body.signature !== "string" ||
    typeof body.timestamp !== "number" ||
    body.memberKey === "" ||
    body.deviceId === "" ||
    body.deviceId.length > 128
  ) {
    return "bad_shape";
  }
  if (Math.abs(now - body.timestamp) > READ_AUTH_MAX_SKEW_MS) {
    return "stale_timestamp";
  }
  const message = canonicalPushAuthMessage(
    action,
    body.memberKey,
    body.deviceId,
    endpoint,
    categories,
    body.timestamp,
  );
  if (!verify(message, body.signature, body.memberKey)) {
    return "bad_signature";
  }
  if (!deps.resolver.isMember(body.memberKey)) {
    return "not_a_member";
  }
  return null;
}

export async function registerPushRoutes(
  app: FastifyInstance,
  deps: PushRouteDeps,
): Promise<void> {
  // The public half of the node's VAPID pair — what a device
  // subscribes against. Public by nature (it ships in every push the
  // vendor relays), so it sits on the open surface like /config.
  app.get("/push/vapid-key", async () => ({
    publicKey: deps.vapidPublicKey,
  }));

  app.post("/push/subscriptions", async (req, reply) => {
    const body = req.body as {
      memberKey: string;
      deviceId: string;
      timestamp: number;
      signature: string;
      subscription?: {
        endpoint?: string;
        keys?: { p256dh?: string; auth?: string };
      };
      categories?: unknown[];
    } | null;
    const sub = body?.subscription;
    if (
      !body ||
      !sub ||
      typeof sub.endpoint !== "string" ||
      sub.endpoint === "" ||
      sub.endpoint.length > MAX_ENDPOINT_CHARS ||
      !sub.endpoint.startsWith("https://") ||
      typeof sub.keys?.p256dh !== "string" ||
      typeof sub.keys?.auth !== "string" ||
      !Array.isArray(body.categories) ||
      body.categories.length === 0 ||
      !body.categories.every(isNotificationCategory)
    ) {
      reply.code(400);
      return { error: "bad_shape" };
    }
    const categories = [...new Set(body.categories)];
    const authErr = checkAuth(
      deps,
      body,
      "push-subscribe",
      sub.endpoint,
      categories,
    );
    if (authErr) {
      reply.code(authErr === "not_a_member" ? 403 : 401);
      return { error: authErr };
    }
    // Cap check BEFORE touching the device's old row, counting only
    // OTHER devices — re-subscribing an existing device must neither
    // hit the cap nor lose its old subscription to a rejection.
    const others = deps.store
      .listForMember(body.memberKey)
      .filter((r) => r.deviceId !== body.deviceId);
    if (others.length >= MAX_SUBSCRIPTIONS_PER_MEMBER) {
      reply.code(409);
      return { error: "too_many_devices" };
    }
    // One row per device: a re-subscribe with a fresh endpoint
    // replaces the device's old row instead of accumulating ghosts.
    deps.store.deleteByDevice(body.memberKey, body.deviceId);
    const now = (deps.now ?? Date.now)();
    deps.store.upsert({
      endpoint: sub.endpoint,
      memberKey: body.memberKey,
      deviceId: body.deviceId,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      categories,
      createdAt: now,
      renewedAt: now,
    });
    return { ok: true };
  });

  app.post("/push/subscriptions/renew", async (req, reply) => {
    const body = req.body as (AuthedBody & { endpoint?: string }) | null;
    if (!body || typeof body.endpoint !== "string" || body.endpoint === "") {
      reply.code(400);
      return { error: "bad_shape" };
    }
    const authErr = checkAuth(deps, body, "push-renew", body.endpoint, []);
    if (authErr) {
      reply.code(authErr === "not_a_member" ? 403 : 401);
      return { error: authErr };
    }
    const renewed = deps.store.renew(
      body.endpoint,
      body.memberKey,
      (deps.now ?? Date.now)(),
    );
    if (!renewed) {
      // The row expired or was pruned — tell the device to
      // re-subscribe rather than silently pretending.
      reply.code(404);
      return { error: "unknown_subscription" };
    }
    return { ok: true };
  });

  app.post("/push/subscriptions/delete", async (req, reply) => {
    // Two shapes on purpose: with an endpoint it removes that one
    // subscription (self-unsubscribe); without, it removes every
    // subscription the named DEVICE holds — the lost-phone path,
    // callable from any of the member's devices (the signature
    // binds the member; the device being pruned need not sign).
    const body = req.body as (AuthedBody & { endpoint?: string }) | null;
    if (!body) {
      reply.code(400);
      return { error: "bad_shape" };
    }
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
    const authErr = checkAuth(deps, body, "push-delete", endpoint, []);
    if (authErr) {
      reply.code(authErr === "not_a_member" ? 403 : 401);
      return { error: authErr };
    }
    const removed = endpoint
      ? deps.store.deleteByEndpoint(endpoint, body.memberKey)
        ? 1
        : 0
      : deps.store.deleteByDevice(body.memberKey, body.deviceId);
    return { ok: true, removed };
  });
}
