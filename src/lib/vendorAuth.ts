/**
 * Vendor portal session — same signed-cookie approach as adminAuth.ts, but
 * scoped to a specific vendor (the payload carries VENDOR_ID + VLOG_ID) so
 * a vendor can only ever act on their own promo codes / customers.
 */

const COOKIE_NAME = "gw_vendor_session";

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
  const secret = process.env.VENDOR_SESSION_SECRET;
  if (!secret) throw new Error("Missing VENDOR_SESSION_SECRET environment variable.");
  return secret;
}

type VendorPayload = { vendorId: string; vlogId: string };

/** The cookie value to set after a successful vendor login: `<payload-json-base64url>.<signature>`. */
export async function createVendorSessionToken(payload: VendorPayload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = await sign(data, getSecret());
  return `${data}.${sig}`;
}

/** Verifies and decodes a vendor session cookie, or returns null if invalid/missing. */
export async function verifyVendorSessionToken(token: string | undefined | null): Promise<VendorPayload | null> {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = await sign(data, getSecret());
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as VendorPayload;
  } catch {
    return null;
  }
}

/** Reads and verifies the vendor session from an API route's request cookies. */
export async function getVendorSession(req: { cookies: { get(name: string): { value: string } | undefined } }) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return verifyVendorSessionToken(token);
}

export { COOKIE_NAME };
