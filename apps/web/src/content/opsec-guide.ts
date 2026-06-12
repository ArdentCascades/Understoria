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

// Condensed in-app opsec guide. Source of truth is
// docs/opsec-guide.md; this is the version that ships to members
// offline, kept short enough to scan in a few minutes. English-only
// for now (same rationale as the member guide).

import type { GuideSection } from "./member-guide";

export const OPSEC_GUIDE: readonly GuideSection[] = [
  {
    id: "device",
    title: "On your device",
    body: [
      "Lock your phone with a six-digit PIN or strong passphrase. Turn on full-disk encryption (every modern phone has it on by default; on a laptop use FileVault, BitLocker, or LUKS). Keep your OS updated — most real-world attacks exploit bugs that have been patched.",
    ],
  },
  {
    id: "accounts",
    title: "On your identity",
    body: [
      "Understoria does not ask for an email or phone number. If anyone claiming to be from Understoria asks for these, that is a phishing attempt.",
      "Your identity is a cryptographic key on this device. You can export a backup — keep it somewhere safe and offline. A printed paper in a drawer is often better than a cloud service.",
      "If your phone is lost or stolen, the passphrase lock is what protects the key on it — that's why we suggest setting one. There is no central revocation and no one who can flip a switch for you: tell your community what happened so people know to stop trusting that identity, then start fresh with a new key (Profile → Emergency → Hard purge on any device that still holds the old one).",
    ],
  },
  {
    id: "communication",
    title: "On your communication",
    body: [
      "Do not discuss organizing on employer devices or networks. Work laptops and corporate WiFi log and sometimes monitor activity.",
      "Do not screenshot platform content and share it outside the group. Once it leaves Understoria it is no longer protected.",
      "For sensitive conversations, meet in person. A ten-minute walk beats a two-hour message thread.",
    ],
  },
  {
    id: "social",
    title: "On your social footprint",
    body: [
      "Keep your Understoria display name separate from your work identity. A pseudonym is a feature, not a sign of bad faith.",
      "Don't post about organizing work on public social media with your legal name attached. Even \"general inspiration\" posts create a pattern that a determined observer can map.",
    ],
  },
  {
    id: "wrong",
    title: "If something feels wrong",
    body: [
      "If someone you don't know wants to be added, go slow. Ask for a vouch.",
      "If an existing member starts asking strange questions about membership lists or who helped whom — note it. Talk to another member. Infiltration happens.",
      "If a vendor, employer, or officer asks you to share information about members or activity: you do not have to. Don't handle it alone — talk with members you trust before answering anything.",
    ],
  },
  {
    id: "rights",
    title: "Know your rights",
    body: [
      "You do not have to answer questions from police without a lawyer present. You do not have to consent to a device search — they usually need a warrant. You do not have to identify other members. You do have the right to remain silent.",
      "Your local legal organizations (NLG in the US, LDAN in the UK) can provide jurisdiction-specific \"Know Your Rights\" cards. Keep one in your wallet.",
    ],
  },
];
