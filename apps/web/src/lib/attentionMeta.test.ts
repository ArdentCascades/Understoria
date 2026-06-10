/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { ATTENTION_EMOJI } from "./attentionMeta";
import type { AttentionItem } from "./attention";

describe("ATTENTION_EMOJI", () => {
  // Compile-time enumeration of the discriminant union. If a kind is
  // missing from ATTENTION_EMOJI's Record type, TypeScript refuses to
  // compile this file — the runtime loop below is a smoke check that
  // complements that lock.
  const kinds: AttentionItem["kind"][] = [
    "confirm_exchange",
    "confirm_task",
    "post_claimed",
    "vouch_received",
    "project_deadline_approaching",
    "project_paused_long",
    "task_check_in",
    "coorganizer_invitation_received",
    "event_today",
    "event_cancelled",
    "event_capacity_reached",
  ];

  it("has a glyph for every AttentionItem kind", () => {
    for (const kind of kinds) {
      expect(ATTENTION_EMOJI[kind]).toBeTruthy();
      expect(ATTENTION_EMOJI[kind].length).toBeGreaterThan(0);
    }
  });

  // Distinct kinds may legitimately share a glyph (confirm_exchange
  // and confirm_task both use ✅) — this is by design, not asserted
  // against.
});
