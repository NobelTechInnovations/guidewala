import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { UPLOAD_ROOT } from "./media.server";
import type { UploadDir } from "./media";

/** Rejected upload (type not allowed) — routes turn this into a 400 `{ error }` response. */
export class UploadError extends Error {}

/**
 * The only file types an upload may have, keyed by MIME type -> the extension
 * the file is stored under. The extension never comes from the client's
 * filename: with the default UPLOAD_ROOT (public/img) Next serves these files
 * statically too, so a client-chosen ".html"/".svg" would be a stored-XSS hole.
 */
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
};

/** The stored extension for a MIME type (parameters/case ignored), or null if not allowed. */
export function uploadExtension(mime: string): string | null {
  // `?? ""`: callers cast form values to File, so a text part can reach here with no `type`.
  return EXTENSION_BY_MIME[(mime ?? "").split(";")[0].trim().toLowerCase()] ?? null;
}

/** True for an allowed raster image type (so SVG/HTML/text are rejected even as "image/*"). */
export function isImageFile(file: { type: string }): boolean {
  const ext = uploadExtension(file.type);
  return ext !== null && ext !== ".pdf";
}

/**
 * Saves an uploaded admin file into <UPLOAD_ROOT>/<dir>/ under a
 * collision-safe filename and returns just the filename — callers store
 * that bare filename on the record (matching the source system's
 * convention) and build the display URL with `mediaPath(dir, filename)`.
 * Throws UploadError for a file type outside the allowlist above.
 *
 * Storage is this app's own disk (UPLOAD_ROOT), so the admin panel is fully
 * self-contained — it no longer depends on the old (retired)
 * admin.guidewala.co.in file server. Files are served back by the
 * /uploads/[...path] route handler.
 */
export async function saveAdminUpload(file: File, dir: UploadDir): Promise<string> {
  const ext = uploadExtension(file.type);
  if (!ext) throw new UploadError("Unsupported file type. Upload a JPG, PNG, WebP, GIF, AVIF or PDF file.");

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  const destDir = path.join(UPLOAD_ROOT, dir);
  await mkdir(destDir, { recursive: true });
  await writeFile(path.join(destDir, safeName), bytes);

  return safeName;
}
