import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

/** Human-readable order number, e.g. RUP-7K3D9Q. */
export function generateOrderNumber(): string {
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return `RUP-${out}`;
}
