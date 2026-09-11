import { NextRequest } from "next/server";

/**
 * Resolves a possibly-relative path (e.g. "/assets/img/foo.jpg") to an
 * absolute URL using the incoming request's own origin. API consumers that
 * aren't the web app itself (the mobile app, in particular) need full URLs
 * since they have no concept of "this site's root".
 */
export function toAbsoluteUrl(path: string | undefined | null, req: NextRequest): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, req.nextUrl.origin).toString();
}
