/**
 * Minimal built-in admin auth — no external service, just an env password
 * and a signed cookie (HMAC via Web Crypto, so it also works in Edge
 * middleware). Good enough for a single-admin content tool; swap for a
 * real auth provider if more than one admin user is ever needed.
 */

const COOKIE_NAME = "gw_admin_session";

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Buffer.from(sig).toString("base64url");
}

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET environment variable.");
  }
  return secret;
}

/** The cookie value to set after a successful login. */
export async function createSessionToken() {
  return sign("admin", getSecret());
}

/** Verify a cookie value against the expected signed token. */
export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const expected = await sign("admin", getSecret());
  // Constant-time-ish comparison is overkill for a single-admin tool, but cheap to do right.
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export { COOKIE_NAME };
