#!/usr/bin/env node
/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Generates a fresh Ed25519 keypair for the auto-confirm system key
 * and prints a ready-to-paste `NODE_SYSTEM_SECRET_KEY=` line. Run
 * once per node; treat the secret like a TLS private key.
 *
 *   node scripts/generate-system-key.mjs
 *
 * Or, when the node_modules are inside the container:
 *
 *   docker compose run --rm -T --no-deps --entrypoint node understoria \
 *     /app/scripts/generate-system-key.mjs
 *
 * Output goes to stdout. The public key is printed alongside for
 * sanity-checking; only the secret line needs to land in `.env`.
 */
import nacl from "tweetnacl";

const kp = nacl.sign.keyPair();
const secret = Buffer.from(kp.secretKey).toString("base64");
const pub = Buffer.from(kp.publicKey).toString("base64");

process.stdout.write(`# Generated ${new Date().toISOString()}\n`);
process.stdout.write(`# Public key (sanity check, NOT a secret):\n`);
process.stdout.write(`#   ${pub}\n`);
process.stdout.write(`NODE_SYSTEM_SECRET_KEY=${secret}\n`);
