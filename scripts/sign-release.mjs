#!/usr/bin/env node
/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Maintainer-side, OFFLINE release signing (docs/release-signing.md).
 * Takes a directory of release artifacts (pack-source output, plus
 * the AppImage when present), writes:
 *
 *   release-manifest.json  deterministic bytes: fixed key order,
 *                          2-space indent, LF, trailing newline —
 *                          so the signature is over stable content
 *   release-manifest.sig   base64 nacl.sign.detached over the exact
 *                          manifest file bytes
 *
 *   node scripts/sign-release.mjs <artifact-dir> --tag v0.3.0
 *
 * The secret comes from the RELEASE_SIGNING_SECRET_KEY env var or
 * `--key-file <path>` (a file whose first non-comment line is the
 * base64 secret or a KEY=value line). It is NEVER read from a
 * default location — no ambient key on disk, no CI secret. CI only
 * verifies (scripts/verify-release.mjs).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import nacl from "tweetnacl";

function fail(msg) {
  process.stderr.write(`sign-release: ${msg}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const dir = args[0];
if (!dir || dir.startsWith("--")) {
  fail("usage: node scripts/sign-release.mjs <artifact-dir> --tag <tag> [--key-file <path>]");
}
let tag = "";
let keyFile = "";
for (let i = 1; i < args.length; i++) {
  if (args[i] === "--tag") tag = args[++i] ?? "";
  else if (args[i] === "--key-file") keyFile = args[++i] ?? "";
  else fail(`unknown argument: ${args[i]}`);
}
if (!tag) fail("--tag is required (e.g. --tag v0.3.0)");

let secretB64 = process.env.RELEASE_SIGNING_SECRET_KEY ?? "";
if (keyFile) {
  const raw = fs.readFileSync(keyFile, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    secretB64 = trimmed.includes("=")
      ? trimmed.slice(trimmed.indexOf("=") + 1)
      : trimmed;
    break;
  }
}
if (!secretB64) {
  fail("no secret: set RELEASE_SIGNING_SECRET_KEY or pass --key-file");
}
const secretKey = Buffer.from(secretB64, "base64");
if (secretKey.length !== nacl.sign.secretKeyLength) {
  fail(`secret key must be ${nacl.sign.secretKeyLength} bytes, got ${secretKey.length}`);
}

const entries = fs
  .readdirSync(dir)
  .filter(
    (name) =>
      name !== "release-manifest.json" &&
      name !== "release-manifest.sig" &&
      fs.statSync(path.join(dir, name)).isFile(),
  )
  .sort();
if (entries.length === 0) fail(`no artifacts found in ${dir}`);

const artifacts = entries.map((name) => {
  const bytes = fs.readFileSync(path.join(dir, name));
  return {
    name,
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  };
});

// Deterministic manifest bytes: fixed key order via explicit object
// literal, 2-space JSON, trailing newline. generatedAt makes two
// signings of identical artifacts distinguishable on purpose — the
// signature covers whichever manifest actually shipped.
const manifest = {
  name: "understoria",
  tag,
  generatedAt: new Date().toISOString(),
  artifacts,
};
const manifestBytes = Buffer.from(JSON.stringify(manifest, null, 2) + "\n");
const sig = nacl.sign.detached(new Uint8Array(manifestBytes), new Uint8Array(secretKey));

fs.writeFileSync(path.join(dir, "release-manifest.json"), manifestBytes);
fs.writeFileSync(
  path.join(dir, "release-manifest.sig"),
  Buffer.from(sig).toString("base64") + "\n",
);
process.stderr.write(
  `sign-release: signed ${artifacts.length} artifact(s) for ${tag} in ${dir}\n`,
);
