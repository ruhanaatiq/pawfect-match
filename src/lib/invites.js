// src/lib/invites.js
import crypto from "crypto";
export function makeToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url"); // URL-safe
}
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
