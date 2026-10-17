// Server-only: filesystem side of the media helpers (see media.ts for the
// client-safe half). Don't import this from a client component.
import fs from "fs";
import path from "path";
import { isUploadDir, mediaPath, type UploadDir } from "./media";

/**
 * Where uploads live on disk. Defaults to <cwd>/public/img (the original
 * location); set UPLOAD_DIR to move it outside the app folder so a redeploy
 * can't wipe uploads. Files are served by /uploads/[...path]; note that with
 * the default (inside public/) Next's static handler can also serve them
 * directly after a restart, so prefer UPLOAD_DIR outside public/ in production.
 * (saveAdminUpload only ever stores allowlisted image/PDF extensions either way.)
 */
export const UPLOAD_ROOT: string = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "public", "img");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
};

export function contentTypeFor(file: string): string {
  return CONTENT_TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

function isSafeSegment(seg: string): boolean {
  return (
    seg !== "" &&
    seg !== "." &&
    seg !== ".." &&
    !seg.includes("/") &&
    !seg.includes("\\") &&
    !seg.includes("\0")
  );
}

/**
 * Maps URL path segments (`["pkgTitleImg", "x.jpg"]`) to an absolute file path
 * under UPLOAD_ROOT, or null if they could escape it. Uploads are flat — exactly
 * <dir>/<filename>, with <dir> one of the known upload folders — so anything
 * nested, empty, dotted or separator-bearing is rejected outright. (Next
 * decodes `%2F` in catch-all params, so "..%2F..%2Fx" arrives as one segment
 * containing "/" and is caught by the same check.)
 */
export function resolveUploadPath(segments: string[]): string | null {
  if (segments.length !== 2) return null;
  const [dir, file] = segments;
  if (!isUploadDir(dir) || !isSafeSegment(file)) return null;

  const resolved = path.join(UPLOAD_ROOT, dir, file);
  // Belt and braces: the checks above already make escape impossible.
  return resolved.startsWith(UPLOAD_ROOT + path.sep) ? resolved : null;
}

/** True when the record's filename is actually present on disk. */
export function mediaExists(dir: UploadDir, file?: string | null): boolean {
  if (!file) return false;
  const p = resolveUploadPath([dir, file]);
  if (!p) return false;
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * The /uploads URL path for a file, but only if it exists on disk — lets pages
 * and admin APIs fall back to a placeholder for legacy records whose files
 * never made it over, instead of rendering a broken <img>.
 */
export function existingMediaPath(dir: UploadDir, file?: string | null): string | null {
  return mediaExists(dir, file) ? mediaPath(dir, file) : null;
}
