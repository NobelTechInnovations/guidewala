import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mediaPath } from "./media";
import { UPLOAD_ROOT, resolveUploadPath, contentTypeFor, mediaExists, existingMediaPath } from "./media.server";

test("mediaPath builds an encoded relative /uploads path", () => {
  assert.equal(mediaPath("pkgTitleImg", "a b.jpg"), "/uploads/pkgTitleImg/a%20b.jpg");
});

test("mediaPath returns null for an empty or missing filename", () => {
  assert.equal(mediaPath("pkgTitleImg", ""), null);
  assert.equal(mediaPath("pkgTitleImg", null), null);
  assert.equal(mediaPath("pkgTitleImg", undefined), null);
});

test("resolveUploadPath maps a valid dir/file onto UPLOAD_ROOT", () => {
  assert.equal(
    resolveUploadPath(["pkgTitleImg", "x.jpg"]),
    path.join(UPLOAD_ROOT, "pkgTitleImg", "x.jpg"),
  );
});

test("resolveUploadPath rejects traversal, unknown dirs and odd shapes", () => {
  assert.equal(resolveUploadPath(["pkgTitleImg", "..", ".env.local"]), null);
  // Next decodes %2F in catch-all params, so a one-segment "../../x" must be rejected too.
  assert.equal(resolveUploadPath(["pkgTitleImg", "../../.env.local"]), null);
  assert.equal(resolveUploadPath(["pkgTitleImg", "..\\secret"]), null);
  assert.equal(resolveUploadPath(["pkgTitleImg", "."]), null);
  assert.equal(resolveUploadPath(["pkgTitleImg", ""]), null);
  assert.equal(resolveUploadPath(["etc", "passwd"]), null);
  assert.equal(resolveUploadPath(["pkgTitleImg"]), null);
  assert.equal(resolveUploadPath(["pkgTitleImg", "sub", "x.jpg"]), null);
  assert.equal(resolveUploadPath([]), null);
});

test("contentTypeFor is case-insensitive and falls back to octet-stream", () => {
  assert.equal(contentTypeFor("b.PDF"), "application/pdf");
  assert.equal(contentTypeFor("a.jpg"), "image/jpeg");
  assert.equal(contentTypeFor("a.JPEG"), "image/jpeg");
  assert.equal(contentTypeFor("a.png"), "image/png");
  assert.equal(contentTypeFor("a.webp"), "image/webp");
  assert.equal(contentTypeFor("a.gif"), "image/gif");
  assert.equal(contentTypeFor("a.svg"), "image/svg+xml");
  assert.equal(contentTypeFor("a.avif"), "image/avif");
  assert.equal(contentTypeFor("a.exe"), "application/octet-stream");
  assert.equal(contentTypeFor("noext"), "application/octet-stream");
});

test("mediaExists / existingMediaPath are false/null for a missing or empty file", () => {
  assert.equal(mediaExists("pkgTitleImg", "definitely-not-there-123.jpg"), false);
  assert.equal(existingMediaPath("pkgTitleImg", "definitely-not-there-123.jpg"), null);
  assert.equal(mediaExists("pkgTitleImg", ""), false);
  assert.equal(existingMediaPath("pkgTitleImg", "../../.env.local"), null);
});
