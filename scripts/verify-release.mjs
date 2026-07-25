#!/usr/bin/env node
/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Verifies a signed release (docs/release-signing.md): the manifest
 * signature against the committed release public keys, then every
 * artifact's size and sha256 against the manifest. Runnable from
 * inside an unpacked source tree — no dependency beyond tweetnacl
 * (already vendored via the lockfile) and node:crypto.
 *
 *   node scripts/verify-release.mjs <artifact-dir> [--pubkey <path>]
 *
 * <artifact-dir> must contain release-manifest.json and
 * release-manifest.sig alongside the artifacts they cover.
 * --pubkey defaults to the scripts/release-pubkey.json next to this
 * script (the in-repo trust anchor); passing a path lets you verify
 * against an INDEPENDENTLY OBTAINED copy — another node's source
 * pack, the mirror, an old clone — which is the honest first-contact
 * posture (TOFU + cross-channel comparison, see the doc).
 *
 * Exit 0 = verified. Anything else exits nonzero, loudly.
 */
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import crypto from "node:crypto";
import nacl from "tweetnacl";

function fail(msg) {
  process.stderr.write(`verify-release: FAIL — ${msg}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const dir = args[0];
if (!dir || dir.startsWith("--")) {
  fail("usage: node scripts/verify-release.mjs <artifact-dir> [--pubkey <path>]");
}
let pubkeyPath = path.join(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "release-pubkey.json",
);
for (let i = 1; i < args.length; i++) {
  if (args[i] === "--pubkey") pubkeyPath = args[++i] ?? "";
  else fail(`unknown argument: ${args[i]}`);
}

const { keys } = JSON.parse(fs.readFileSync(pubkeyPath, "utf8"));
if (!Array.isArray(keys) || keys.length === 0) {
  fail(
    `no release keys registered in ${pubkeyPath} — no release has ever been signed. ` +
      "A maintainer must generate one offline (scripts/generate-release-key.mjs) " +
      "and commit its public half.",
  );
}

const manifestPath = path.join(dir, "release-manifest.json");
const sigPath = path.join(dir, "release-manifest.sig");
if (!fs.existsSync(manifestPath)) fail(`missing ${manifestPath}`);
if (!fs.existsSync(sigPath)) fail(`missing ${sigPath}`);

const manifestBytes = fs.readFileSync(manifestPath);
const sig = Buffer.from(fs.readFileSync(sigPath, "utf8").trim(), "base64");

const signedBy = keys.find((k) =>
  nacl.sign.detached.verify(
    new Uint8Array(manifestBytes),
    new Uint8Array(sig),
    new Uint8Array(Buffer.from(k.publicKey, "base64")),
  ),
);
if (!signedBy) {
  fail("manifest signature does not verify against ANY registered release key");
}

const manifest = JSON.parse(manifestBytes.toString("utf8"));
if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length === 0) {
  fail("manifest lists no artifacts");
}
for (const a of manifest.artifacts) {
  const p = path.join(dir, a.name);
  if (!fs.existsSync(p)) fail(`artifact missing: ${a.name}`);
  const bytes = fs.readFileSync(p);
  if (bytes.length !== a.bytes) {
    fail(`${a.name}: size ${bytes.length} != manifest ${a.bytes}`);
  }
  const sha = crypto.createHash("sha256").update(bytes).digest("hex");
  if (sha !== a.sha256) fail(`${a.name}: sha256 mismatch`);
}

process.stderr.write(
  `verify-release: OK — ${manifest.tag ?? "(untagged)"}: ` +
    `${manifest.artifacts.length} artifact(s) verified, signed by key id "${signedBy.id}"\n`,
);
