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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Entry point for the device-pairing flow (docs/device-pairing.md).
// Lives in Settings' "On this device" zone beside Recovery Kit and
// Guardian Shards — the three together are the identity-continuity
// cluster ("keep your account, and be on more than one device"):
//   • Add another device — live pairing to a device you hold now.
//   • Recovery Kit       — restore onto a fresh device from a file.
//   • Guardian Shards    — social recovery if you lose everything.
// It was previously buried at the bottom of Profile's account index,
// which under-surfaced it. The paired-device INVENTORY (PairingLog
// section) deliberately stays on Profile next to Emergency: removing a
// device has no revocation primitive, so its only path is Emergency →
// Hard purge. Adding is a device preference; removing is a panic act —
// they belong in different homes.
//
// A card with an explicit CTA, matching the sibling recovery cards.
// The button IS the one deliberate step before the sensitive flow at
// /add-device (the same target the old Profile disclosure navigated
// to); the flow itself is unchanged.
export function AddDeviceSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <section className="card mb-4" aria-labelledby="profile-addDevice-heading">
      <h2
        id="profile-addDevice-heading"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("profile.addDevice.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.addDevice.subtitle")}
      </p>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => navigate("/add-device")}
      >
        {t("profile.addDevice.cta")}
      </button>
    </section>
  );
}
