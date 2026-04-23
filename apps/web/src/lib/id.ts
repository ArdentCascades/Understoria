/**
 * UUID v4 generator with a fallback for older browsers.
 * Used only for local IDs; real member identity is an Ed25519 public key
 * (see Agent 2: Crypto & Identity).
 */
export function uuid(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

/**
 * Placeholder key generator. Produces a 32-byte hex string that resembles
 * an Ed25519 public key. Agent 2 will replace this with real key generation.
 */
export function placeholderPublicKey(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Placeholder signature. Agent 2 will replace with real Ed25519 signatures.
 */
export function placeholderSignature(payload: string, key: string): string {
  // Deterministic non-cryptographic hash so tests can verify shape, not security.
  let h = 2166136261 >>> 0;
  const data = `${payload}:${key}`;
  for (let i = 0; i < data.length; i++) {
    h ^= data.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `stub_${(h >>> 0).toString(16).padStart(8, "0")}_${key.slice(0, 8)}`;
}
