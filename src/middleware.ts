import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/adminAuth";
import { verifyVendorSessionToken, COOKIE_NAME as VENDOR_COOKIE_NAME } from "@/lib/vendorAuth";

const ADMIN_HOST_PREFIX = "admin.";
const PUBLIC_ASSET_PREFIXES = ["/img/", "/assets/", "/uploads/"];

/**
 * The admin panel lives at /admin/* in this same Next.js app — one
 * codebase, one API layer, one database, matching the rest of the site.
 * In production it's also reachable on its own subdomain
 * (admin.guidewala.co.in) with clean paths ("/", "/login", "/guides") —
 * this middleware transparently maps those onto the real /admin/* routes
 * via a rewrite, so visitors on that host never see "/admin" in the URL.
 * The main domain keeps serving /admin/* directly (handy for local dev,
 * where there's no subdomain to point at localhost).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") || "").toLowerCase();
  const isAdminHost = host.startsWith(ADMIN_HOST_PREFIX);

  const isAlreadyAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isPublicAsset = PUBLIC_ASSET_PREFIXES.some((p) => pathname.startsWith(p));

  const logicalPath =
    isAdminHost && !isAlreadyAdminPath && !isPublicAsset
      ? pathname === "/"
        ? "/admin/dashboard"
        : `/admin${pathname}`
      : pathname;

  const isLoginPage = logicalPath === "/admin/login";
  const isAdminArea = logicalPath.startsWith("/admin");
  const isAdminApi = logicalPath.startsWith("/api/admin") && logicalPath !== "/api/admin/login";

  if ((isAdminArea && !isLoginPage) || isAdminApi) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const valid = await verifySessionToken(token);

    if (!valid) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
      }
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = isAdminHost ? "/login" : "/admin/login";
      const nextPath = isAdminHost ? logicalPath.replace(/^\/admin/, "") || "/" : logicalPath;
      loginUrl.searchParams.set("next", nextPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (logicalPath !== pathname) {
    const url = req.nextUrl.clone();
    url.pathname = logicalPath;
    return NextResponse.rewrite(url);
  }

  // Vendor self-service portal — separate login/session from the admin
  // panel, stays on the main domain at /vendor/* (no subdomain).
  const isVendorLoginPage = pathname === "/vendor/login";
  const isVendorArea = pathname.startsWith("/vendor");
  const isVendorApi = pathname.startsWith("/api/vendor") && pathname !== "/api/vendor/login";

  if ((isVendorArea && !isVendorLoginPage) || isVendorApi) {
    const token = req.cookies.get(VENDOR_COOKIE_NAME)?.value;
    const session = await verifyVendorSessionToken(token);

    if (!session) {
      if (isVendorApi) {
        return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
      }
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/vendor/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Runs on every request (needed so the admin-subdomain rewrite above can
  // catch any path) except Next's own static build assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
