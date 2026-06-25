import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";

/**
 * Authenticated symmetric encryption for sensitive fields at rest
 * (Steam passwords, backup codes). AES-256-GCM with a per-record random IV.
 *
 * Stored format: base64(iv).base64(authTag).base64(ciphertext)
 * The GCM auth tag makes tampering detectable on decrypt.
 */

const ALGO = "aes-256-gcm";
const IV_LEN = 12; // 96-bit nonce recommended for GCM

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY is not set — cannot encrypt/decrypt credentials.",
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes (base64-encoded).");
  }
  return key;
}

export function isEncryptionConfigured(): boolean {
  try {
    getKey();
    return true;
  } catch {
    return false;
  }
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${ciphertext.toString("base64")}`;
}

export function decrypt(payload: string): string {
  const key = getKey();
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Malformed ciphertext.");
  }
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/** Encrypt only when non-empty; returns null for blank input. */
export function encryptNullable(value?: string | null): string | null {
  if (!value || value.trim().length === 0) return null;
  return encrypt(value);
}
