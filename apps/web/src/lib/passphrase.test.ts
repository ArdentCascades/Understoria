import { describe, expect, it } from "vitest";
import {
  DEFAULT_ITERATIONS,
  deriveMasterKey,
  newSalt,
  unwrap,
  validatePassphrase,
  wrap,
  type WrappedBlob,
} from "./passphrase";
import { b64decode } from "./bytes";
import { generateKeyPair } from "./crypto";

// PBKDF2 at 600k iterations takes ~400ms under jsdom. Pin tests to a
// much smaller iteration count — the algorithm is identical, so behavior
// coverage is preserved and CI doesn't grind.
const TEST_ITERATIONS = 1000;

describe("validatePassphrase", () => {
  it("rejects short passphrases", () => {
    expect(validatePassphrase("short")).toMatch(/at least/);
  });
  it("rejects whitespace-only passphrases", () => {
    expect(validatePassphrase("        ")).toMatch(/whitespace/);
  });
  it("accepts a reasonable passphrase", () => {
    expect(validatePassphrase("correct horse battery staple")).toBeNull();
  });
});

describe("deriveMasterKey", () => {
  it("returns 32 bytes regardless of passphrase length", async () => {
    const salt = newSalt();
    const k1 = await deriveMasterKey("short12", salt, TEST_ITERATIONS);
    const k2 = await deriveMasterKey(
      "a substantially longer passphrase than the first",
      salt,
      TEST_ITERATIONS,
    );
    expect(k1).toHaveLength(32);
    expect(k2).toHaveLength(32);
    expect(Array.from(k1)).not.toEqual(Array.from(k2));
  });

  it("yields different keys for different salts even with the same passphrase", async () => {
    const k1 = await deriveMasterKey("samepass", newSalt(), TEST_ITERATIONS);
    const k2 = await deriveMasterKey("samepass", newSalt(), TEST_ITERATIONS);
    expect(Array.from(k1)).not.toEqual(Array.from(k2));
  });

  it("is deterministic for a given (passphrase, salt, iterations) triple", async () => {
    const salt = newSalt();
    const k1 = await deriveMasterKey("samepass", salt, TEST_ITERATIONS);
    const k2 = await deriveMasterKey("samepass", salt, TEST_ITERATIONS);
    expect(Array.from(k1)).toEqual(Array.from(k2));
  });
});

describe("wrap + unwrap", () => {
  it("round-trips an Ed25519 secret key through a passphrase", async () => {
    const { secretKey } = generateKeyPair();
    const salt = newSalt();
    const master = await deriveMasterKey("my-passphrase", salt, TEST_ITERATIONS);
    const blob = wrap(secretKey, master, salt, TEST_ITERATIONS);
    const recovered = unwrap(blob, master);
    expect(recovered).toBe(secretKey);
  });

  it("returns null when the passphrase is wrong", async () => {
    const { secretKey } = generateKeyPair();
    const salt = newSalt();
    const rightMaster = await deriveMasterKey(
      "right-passphrase",
      salt,
      TEST_ITERATIONS,
    );
    const wrongMaster = await deriveMasterKey(
      "wrong-passphrase",
      salt,
      TEST_ITERATIONS,
    );
    const blob = wrap(secretKey, rightMaster, salt, TEST_ITERATIONS);
    expect(unwrap(blob, wrongMaster)).toBeNull();
  });

  it("returns null when the ciphertext is tampered with", async () => {
    const { secretKey } = generateKeyPair();
    const salt = newSalt();
    const master = await deriveMasterKey("pass1234", salt, TEST_ITERATIONS);
    const blob = wrap(secretKey, master, salt, TEST_ITERATIONS);
    const raw = b64decode(blob.ciphertext);
    raw[0] = raw[0] ^ 0x01;
    const tampered: WrappedBlob = {
      ...blob,
      ciphertext: Buffer.from(raw).toString("base64"),
    };
    expect(unwrap(tampered, master)).toBeNull();
  });

  it("produces distinct ciphertexts for repeated wraps of the same key", async () => {
    const { secretKey } = generateKeyPair();
    const salt = newSalt();
    const master = await deriveMasterKey("same-pass", salt, TEST_ITERATIONS);
    const blob1 = wrap(secretKey, master, salt, TEST_ITERATIONS);
    const blob2 = wrap(secretKey, master, salt, TEST_ITERATIONS);
    expect(blob1.ciphertext).not.toBe(blob2.ciphertext);
    expect(blob1.nonce).not.toBe(blob2.nonce);
  });

  it("embeds the iteration count so callers can re-derive correctly", async () => {
    const { secretKey } = generateKeyPair();
    const salt = newSalt();
    const master = await deriveMasterKey(
      "pass1234",
      salt,
      TEST_ITERATIONS,
    );
    const blob = wrap(secretKey, master, salt, TEST_ITERATIONS);
    expect(blob.iterations).toBe(TEST_ITERATIONS);
    expect(blob.v).toBe(1);
    expect(blob.kdf).toBe("pbkdf2-sha256");
  });
});

describe("DEFAULT_ITERATIONS", () => {
  it("meets the current NIST recommendation (>= 600,000)", () => {
    expect(DEFAULT_ITERATIONS).toBeGreaterThanOrEqual(600_000);
  });
});
