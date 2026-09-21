import { NextRequest } from "next/server";

/**
 * Resolves a possibly-relative path (e.g. "/assets/img/foo.jpg") to an
 * absolute URL. API consumers that aren't the web app itself (the mobile
 * app, in particular) need full URLs since they have no concept of "this
 * site's root".
 *
 * Prefers NEXT_PUBLIC_SITE_URL when set — behind Hostinger's reverse proxy
 * (and most Node.js hosts), the request Next.js actually sees is bound to
 * an internal address like 0.0.0.0:3000, not the real public domain, so
 * deriving the origin from req.nextUrl.origin silently bakes that internal
 * address into API responses instead of the real site URL.
 */
export function toAbsoluteUrl(path: string | undefined | null, req: NextRequest): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  return new URL(path, origin).toString();
}
