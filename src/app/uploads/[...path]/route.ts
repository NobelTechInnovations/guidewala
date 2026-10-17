import { NextRequest } from "next/server";
import { readFile, stat } from "fs/promises";
import { contentTypeFor, resolveUploadPath } from "@/lib/media.server";

/**
 * Serves admin/vendor uploads from UPLOAD_ROOT. Uploads land on disk after
 * `next build`, so neither `public/` nor the image optimizer can see them —
 * this handler reads them straight off disk instead. Filenames are
 * timestamp+random and never reused, hence the immutable cache header.
 * Anything invalid or missing is a bare 404 (no detail about why).
 */
const notFound = () =>
  new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const filePath = resolveUploadPath(segments);
  if (!filePath) return notFound();

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return notFound();

    const body = await readFile(filePath);
    const contentType = contentTypeFor(filePath);
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": String(body.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    };
    // An SVG opened directly (not via <img>) runs its scripts with this site's
    // origin; vendors can upload promo images, so lock that down.
    if (contentType === "image/svg+xml") {
      headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    }
    return new Response(new Uint8Array(body), { headers });
  } catch {
    return notFound();
  }
}
