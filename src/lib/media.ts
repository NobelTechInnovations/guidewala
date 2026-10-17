/**
 * Client-safe media helpers — no `fs`/`path`, so admin client components can
 * import these. Anything that touches the filesystem lives in media.server.ts.
 *
 * Uploaded files are served by the /uploads/[...path] route handler rather
 * than Next's `public/` folder + image optimizer: files written after
 * `next build` aren't known to the optimizer, and absolute IMG_BASE URLs
 * aren't in `images.remotePatterns`. Records store just the bare filename;
 * these helpers turn (dir, filename) into the URL to render.
 */

/** Sub-folders of the upload root. Also the only first segments the route serves. */
export const UPLOAD_DIRS = [
  "pkgTitleImg",
  "pkgItinImg",
  "pkgGallery",
  "pkgBrochure",
  "PromoCode",
] as const;

export type UploadDir = (typeof UPLOAD_DIRS)[number];

export function isUploadDir(value: string): value is UploadDir {
  return (UPLOAD_DIRS as readonly string[]).includes(value);
}

/** Site-relative URL for an uploaded file (for pages); null when there's no filename. */
export function mediaPath(dir: UploadDir, file?: string | null): string | null {
  if (!file) return null;
  return `/uploads/${dir}/${encodeURIComponent(file)}`;
}
