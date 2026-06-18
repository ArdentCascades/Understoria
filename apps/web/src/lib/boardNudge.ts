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
import type { ReactNode } from "react";

// The contract every Board-nudge status hook returns, so the
// orchestrator (components/BoardNudges.tsx) can pick at most one prompt
// to show by a fixed priority without ever flashing a lower-priority
// one while a higher-priority one is still resolving. Each hook keeps
// its own eligibility / dismiss / self-retire rules unchanged — the
// status object only exposes WHICH prompt, if any, is ready to show.
export interface BoardNudgeStatus {
  /** Async gating resolved (dismiss flag, paired-device, install env).
   *  Until this is true the orchestrator must wait rather than fall
   *  through to a lower-priority prompt — that's the flash-free rule. */
  ready: boolean;
  /** ready && eligible && not-dismissed && not-self-retired. The
   *  negation of the prompt's old union of `return null` guards. */
  visible: boolean;
  /** The card to render when this prompt is chosen. Built eagerly; only
   *  read by the orchestrator when `visible`. */
  node: ReactNode;
}
