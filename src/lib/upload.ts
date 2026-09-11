import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Saves an uploaded admin image into public/img/<dir>/ under a
 * collision-safe filename and returns just the filename — callers store
 * that bare filename on the record (matching the source system's
 * convention) and build the display URL as `${IMG_BASE}img/<dir>/<filename>`.
 *
 * Storage lives inside this app's own `public/` folder so the new admin
 * panel is fully self-contained — it no longer depends on the old
 * (retired) admin.guidewala.co.in file server.
 */
export async function saveAdminUpload(file: File, dir: string): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  const destDir = path.join(process.cwd(), "public", "img", dir);
  await mkdir(destDir, { recursive: true });
  await writeFile(path.join(destDir, safeName), bytes);

  return safeName;
}
