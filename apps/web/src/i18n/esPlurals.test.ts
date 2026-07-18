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
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import i18n from "./index";

// Spanish plural agreement guardrails. These caught a real screen bug:
// an event with one RSVP rendered "1 confirmadas" because the key had
// no _one/_other forms. Keep these cheap string-level assertions so a
// future retranslation can't quietly reintroduce the mismatch.

describe("es plural forms", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });

  afterAll(async () => {
    await i18n.changeLanguage("en");
  });

  it("agrees in number on the event attendee count", () => {
    expect(
      i18n.t("events.detail.attendeeCountLabel", { count: 1, maybe: 0 }),
    ).toBe("1 confirmada · 0 tal vez");
    expect(
      i18n.t("events.detail.attendeeCountLabel", { count: 4, maybe: 2 }),
    ).toBe("4 confirmadas · 2 tal vez");
  });
});
