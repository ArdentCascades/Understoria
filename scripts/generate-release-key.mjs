#!/usr/bin/env node
/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Generates the Ed25519 release-signing keypair
 * (docs/release-signing.md). Run OFFLINE on a maintainer machine —
 * the secret must never live in CI secrets or on a server: CI only
 * VERIFIES releases, it never signs them, which is exactly what makes
 * a captured forge account unable to mint valid releases.
 *
 *   node scripts/generate-release-key.mjs
 *
 * Then: keep the secret line with the same discipline as
 * NODE_SYSTEM_SECRET_KEY (offline, escrowed, never committed), and
 * append the PUBLIC half to scripts/release-pubkey.json so it travels
 * inside every source pack and on every forge.
 */
import nacl from "tweetnacl";

const kp = nacl.sign.keyPair();
const secret = Buffer.from(kp.secretKey).toString("base64");
const pub = Buffer.from(kp.publicKey).toString("base64");

process.stdout.write(`# Generated ${new Date().toISOString()}\n`);
process.stdout.write(`# Public key — append to scripts/release-pubkey.json:\n`);
process.stdout.write(`#   ${pub}\n`);
process.stdout.write(`RELEASE_SIGNING_SECRET_KEY=${secret}\n`);
