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
/**
 * Release signing round-trip + tamper detection
 * (docs/project-continuity-plan.md §2 C2): the sign/verify scripts
 * are exercised as the CLIs they are — spawned with node, exactly as
 * a maintainer and CI run them. Every tamper case must fail LOUDLY
 * (nonzero exit): flipped byte in an artifact, edited manifest,
 * wrong key, and the empty-keys anchor (no key registered → verify
 * refuses rather than vacuously passing).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import nacl from "tweetnacl";

const SCRIPTS = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../scripts",
);
const SIGN = path.join(SCRIPTS, "sign-release.mjs");
const VERIFY = path.join(SCRIPTS, "verify-release.mjs");

let dir: string;
let pubkeyFile: string;
let secretB64: string;

function run(script: string, args: string[], env: Record<string, string> = {}) {
  try {
    execFileSync("node", [script, ...args], {
      env: { ...process.env, ...env },
      stdio: "pipe",
    });
    return { ok: true, stderr: "" };
  } catch (err) {
    const e = err as { status?: number; stderr?: Buffer };
    return { ok: false, stderr: e.stderr?.toString() ?? "" };
  }
}

let keyDir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "release-test-"));
  // Keys live OUTSIDE the artifact dir — sign treats every file in
  // the dir as an artifact.
  keyDir = fs.mkdtempSync(path.join(os.tmpdir(), "release-keys-"));
  const kp = nacl.sign.keyPair();
  secretB64 = Buffer.from(kp.secretKey).toString("base64");
  pubkeyFile = path.join(keyDir, "pubkey.json");
  fs.writeFileSync(
    pubkeyFile,
    JSON.stringify({
      keys: [
        {
          id: "test-key",
          publicKey: Buffer.from(kp.publicKey).toString("base64"),
          since: "2026-07-25",
        },
      ],
    }),
  );
  fs.writeFileSync(path.join(dir, "understoria-source.tar.gz"), "tar bytes");
  fs.writeFileSync(path.join(dir, "SHA256SUMS"), "sums bytes");
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(keyDir, { recursive: true, force: true });
});

function signOk() {
  const res = run(SIGN, [dir, "--tag", "v0.0.0-test"], {
    RELEASE_SIGNING_SECRET_KEY: secretB64,
  });
  expect(res.ok, res.stderr).toBe(true);
}

describe("release signing", () => {
  it("round-trips: sign writes a deterministic manifest + sig that verify accepts", () => {
    signOk();
    const manifest = JSON.parse(
      fs.readFileSync(path.join(dir, "release-manifest.json"), "utf8"),
    );
    expect(manifest.tag).toBe("v0.0.0-test");
    expect(manifest.artifacts.map((a: { name: string }) => a.name)).toEqual([
      "SHA256SUMS",
      "understoria-source.tar.gz",
    ]);
    const res = run(VERIFY, [dir, "--pubkey", pubkeyFile]);
    expect(res.ok, res.stderr).toBe(true);
  });

  it("a flipped byte in an artifact fails verification", () => {
    signOk();
    fs.appendFileSync(path.join(dir, "understoria-source.tar.gz"), "!");
    const res = run(VERIFY, [dir, "--pubkey", pubkeyFile]);
    expect(res.ok).toBe(false);
    expect(res.stderr).toContain("size");
  });

  it("an edited manifest fails the signature check", () => {
    signOk();
    const p = path.join(dir, "release-manifest.json");
    fs.writeFileSync(
      p,
      fs.readFileSync(p, "utf8").replace("v0.0.0-test", "v9.9.9"),
    );
    const res = run(VERIFY, [dir, "--pubkey", pubkeyFile]);
    expect(res.ok).toBe(false);
    expect(res.stderr).toContain("signature");
  });

  it("a manifest signed by the WRONG key is rejected", () => {
    const rogue = nacl.sign.keyPair();
    const res1 = run(SIGN, [dir, "--tag", "v0.0.0-test"], {
      RELEASE_SIGNING_SECRET_KEY: Buffer.from(rogue.secretKey).toString(
        "base64",
      ),
    });
    expect(res1.ok).toBe(true);
    const res2 = run(VERIFY, [dir, "--pubkey", pubkeyFile]);
    expect(res2.ok).toBe(false);
    expect(res2.stderr).toContain("ANY registered release key");
  });

  it("an empty key registry refuses instead of vacuously passing", () => {
    signOk();
    const emptyKeys = path.join(dir, "empty.json");
    fs.writeFileSync(emptyKeys, JSON.stringify({ keys: [] }));
    const res = run(VERIFY, [dir, "--pubkey", emptyKeys]);
    expect(res.ok).toBe(false);
    expect(res.stderr).toContain("no release keys registered");
  });

  it("sign refuses to run without a secret", () => {
    const res = run(SIGN, [dir, "--tag", "v0.0.0-test"], {
      RELEASE_SIGNING_SECRET_KEY: "",
    });
    expect(res.ok).toBe(false);
    expect(res.stderr).toContain("no secret");
  });
});
