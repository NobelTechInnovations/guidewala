import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// UPLOAD_ROOT is read when media.server loads, so point it at a temp dir
// before ./upload is imported.
const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "gw-upload-"));
let u: typeof import("./upload");

before(async () => {
  process.env.UPLOAD_DIR = uploadDir;
  u = await import("./upload");
});
after(() => fs.rmSync(uploadDir, { recursive: true, force: true }));

test("uploadExtension maps allowed MIME types (case/params ignored) and nothing else", () => {
  assert.equal(u.uploadExtension("image/jpeg"), ".jpg");
  assert.equal(u.uploadExtension("image/png"), ".png");
  assert.equal(u.uploadExtension("image/webp"), ".webp");
  assert.equal(u.uploadExtension("image/gif"), ".gif");
  assert.equal(u.uploadExtension("image/avif"), ".avif");
  assert.equal(u.uploadExtension("application/pdf"), ".pdf");
  assert.equal(u.uploadExtension("IMAGE/PNG; charset=binary"), ".png");
  for (const bad of ["text/html", "image/svg+xml", "text/plain", "application/octet-stream", "image/", ""]) {
    assert.equal(u.uploadExtension(bad), null, bad);
  }
  assert.equal(u.uploadExtension(undefined as unknown as string), null);
});

test("isImageFile accepts allowlisted raster images only", () => {
  assert.equal(u.isImageFile({ type: "image/jpeg" }), true);
  assert.equal(u.isImageFile({ type: "image/avif" }), true);
  assert.equal(u.isImageFile({ type: "image/svg+xml" }), false);
  assert.equal(u.isImageFile({ type: "application/pdf" }), false);
  assert.equal(u.isImageFile({ type: "text/html" }), false);
  assert.equal(u.isImageFile({} as { type: string }), false);
});

test("saveAdminUpload ignores the client filename's extension", async () => {
  const name = await u.saveAdminUpload(new File(["x"], "evil.html", { type: "image/png" }), "PromoCode");
  assert.match(name, /^\d+-[a-z0-9]+\.png$/);
  assert.ok(fs.existsSync(path.join(uploadDir, "PromoCode", name)));

  const pdf = await u.saveAdminUpload(new File(["%PDF"], "brochure", { type: "application/pdf" }), "pkgBrochure");
  assert.match(pdf, /\.pdf$/);
});

test("saveAdminUpload rejects other types and writes nothing", async () => {
  for (const [fname, type] of [
    ["x.html", "text/html"],
    ["x.svg", "image/svg+xml"],
    ["x.txt", "text/plain"],
    ["x.jpg", ""],
  ]) {
    await assert.rejects(u.saveAdminUpload(new File(["x"], fname, { type }), "pkgGallery"), u.UploadError, fname);
  }
  assert.ok(!fs.existsSync(path.join(uploadDir, "pkgGallery")) || fs.readdirSync(path.join(uploadDir, "pkgGallery")).length === 0);
});
