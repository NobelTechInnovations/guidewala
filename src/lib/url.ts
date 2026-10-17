import { NextRequest } from "next/server";
import { mediaPath, type UploadDir } from "./media";

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

/**
 * Absolute URL for an uploaded file (for the mobile JSON API); null when there's
 * no filename. Resolved per request (NEXT_PUBLIC_SITE_URL, else the request
 * origin) rather than from a build-time constant, so the mobile app never
 * receives a relative path.
 */
export function mediaAbsoluteUrl(dir: UploadDir, file: string | null | undefined, req: NextRequest): string | null {
  const p = mediaPath(dir, file);
  return p ? toAbsoluteUrl(p, req) : null;
}
