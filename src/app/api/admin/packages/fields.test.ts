import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// UPLOAD_ROOT is read when media.server loads, so point it at a temp dir
// before ./fields (-> upload -> media.server) is imported.
const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "gw-fields-"));
let f: typeof import("./fields");

before(async () => {
  process.env.UPLOAD_DIR = uploadDir;
  f = await import("./fields");
});
after(() => fs.rmSync(uploadDir, { recursive: true, force: true }));

function form(entries: Record<string, string | File | (string | File)[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    for (const item of Array.isArray(v) ? v : [v]) fd.append(k, item);
  }
  return fd;
}
const img = (name = "a.jpg") => new File(["x"], name, { type: "image/jpeg" });
const pdf = (name = "b.pdf") => new File(["%PDF-1.4"], name, { type: "application/pdf" });
const BASICS = { title: "T", cityId: "c1", amount: "100" };

function rejects(fn: () => unknown, pattern: RegExp) {
  assert.throws(fn, (e) => e instanceof f.PackageFormError && pattern.test(e.message));
}

test("create applies defaults and maps every scalar field", () => {
  const { set, unset } = f.parseScalarFields(form(BASICS), "create");
  assert.deepEqual(unset, []);
  assert.deepEqual(set, {
    TITLE_NAME: "T",
    CITY_ID: "c1",
    PKG_AMOUNT: 100,
    PKG_DESC: "",
    IS_ACTIVE: "Y",
    SHOW_ON_HOME: "Y",
    ROUTE: [],
    INCLUDES: [],
    HIGHLIGHTS: [],
    INCLUSIONS: [],
    EXCLUSIONS: [],
    DOCUMENTS: [],
    THINGS_TO_CARRY: [],
    NOTES: [],
  });
});

test("create with every field set", () => {
  const { set } = f.parseScalarFields(
    form({
      ...BASICS,
      desc: "  plain\n\ntext  ",
      isActive: "N",
      showOnHome: "N",
      priceNote: " per person ",
      tourType: "Group Tour",
      durationDays: "8",
      durationNights: "7",
      route: JSON.stringify([{ city: " Jaipur ", nights: 2 }, { city: "Udaipur", nights: "" }]),
      includes: JSON.stringify(["Hotel", "Bogus", "Hotel", "Guide"]),
      highlights: JSON.stringify([" a ", "", "b"]),
      cancellationPolicy: " custom ",
    }),
    "create"
  );
  assert.equal(set.PKG_DESC, "  plain\n\ntext  "); // stored as given
  assert.equal(set.IS_ACTIVE, "N");
  assert.equal(set.SHOW_ON_HOME, "N");
  assert.equal(set.PRICE_NOTE, "per person");
  assert.equal(set.TOUR_TYPE, "Group Tour");
  assert.equal(set.DURATION_DAYS, 8);
  assert.equal(set.DURATION_NIGHTS, 7);
  assert.deepEqual(set.ROUTE, [
    { CITY: "Jaipur", NIGHTS: 2 },
    { CITY: "Udaipur", NIGHTS: 0 },
  ]);
  assert.deepEqual(set.INCLUDES, ["Hotel", "Guide"]);
  assert.deepEqual(set.HIGHLIGHTS, ["a", "b"]);
  assert.equal(set.CANCELLATION_POLICY, "custom");
});

test("create still requires title, city and amount", () => {
  rejects(() => f.parseScalarFields(form({ cityId: "c", amount: "1" }), "create"), /required/);
  rejects(() => f.parseScalarFields(form({ title: "t", amount: "1" }), "create"), /required/);
  rejects(() => f.parseScalarFields(form({ title: "t", cityId: "c", amount: " " }), "create"), /required/);
});

test("update only touches keys that are present", () => {
  const { set, unset } = f.parseScalarFields(form(BASICS), "update");
  assert.deepEqual(set, { TITLE_NAME: "T", CITY_ID: "c1", PKG_AMOUNT: 100 });
  assert.deepEqual(unset, []);
  assert.deepEqual(f.parseScalarFields(form({}), "update"), { set: {}, unset: [] });
});

test("update: blank optional values are unset, blank required ones rejected", () => {
  const { set, unset } = f.parseScalarFields(
    form({ durationDays: "", durationNights: " ", tourType: "", priceNote: "", cancellationPolicy: "  " }),
    "update"
  );
  assert.deepEqual(set, {});
  assert.deepEqual(unset.sort(), [
    "CANCELLATION_POLICY",
    "DURATION_DAYS",
    "DURATION_NIGHTS",
    "PRICE_NOTE",
    "TOUR_TYPE",
  ]);
  rejects(() => f.parseScalarFields(form({ title: "  " }), "update"), /Title/);
  rejects(() => f.parseScalarFields(form({ cityId: "" }), "update"), /City/);
  rejects(() => f.parseScalarFields(form({ amount: "" }), "update"), /Amount/);
});

test("create omits blank optional values instead of unsetting", () => {
  const { set, unset } = f.parseScalarFields(form({ ...BASICS, durationDays: "", tourType: "" }), "create");
  assert.deepEqual(unset, []);
  assert.ok(!("DURATION_DAYS" in set) && !("TOUR_TYPE" in set));
});

test("amount must be a finite number >= 0", () => {
  for (const bad of ["abc", "-1", "Infinity", "NaN"]) {
    rejects(() => f.parseScalarFields(form({ ...BASICS, amount: bad }), "create"), /Amount/);
  }
  assert.equal(f.parseScalarFields(form({ ...BASICS, amount: "0" }), "create").set.PKG_AMOUNT, 0);
  assert.equal(f.parseScalarFields(form({ ...BASICS, amount: "1999.5" }), "create").set.PKG_AMOUNT, 1999.5);
});

test("durations are non-negative integers", () => {
  for (const bad of ["-1", "1.5", "x", "1e3"]) {
    rejects(() => f.parseScalarFields(form({ durationDays: bad }), "update"), /whole number/);
  }
  assert.equal(f.parseScalarFields(form({ durationNights: "0" }), "update").set.DURATION_NIGHTS, 0);
});

test("tourType must be a known value; flags must be Y/N", () => {
  rejects(() => f.parseScalarFields(form({ tourType: "Solo" }), "update"), /Tour type/);
  rejects(() => f.parseScalarFields(form({ showOnHome: "X" }), "update"), /showOnHome/);
  rejects(() => f.parseScalarFields(form({ isActive: "yes" }), "update"), /isActive/);
  // Blank flag = unchanged on update, default on create.
  assert.deepEqual(f.parseScalarFields(form({ showOnHome: "" }), "update").set, {});
  assert.equal(f.parseScalarFields(form({ ...BASICS, showOnHome: "" }), "create").set.SHOW_ON_HOME, "Y");
});

test("route: city required, nights blank -> 0, else non-negative int", () => {
  assert.deepEqual(f.parseRoute("[]"), []);
  assert.deepEqual(f.parseRoute('[{"city":"A"},{"city":" B ","nights":"3"}]'), [
    { CITY: "A", NIGHTS: 0 },
    { CITY: "B", NIGHTS: 3 },
  ]);
  rejects(() => f.parseRoute('[{"city":"  ","nights":1}]'), /needs a city/);
  rejects(() => f.parseRoute('[{"nights":1}]'), /needs a city/);
  rejects(() => f.parseRoute('[{"city":"A","nights":-1}]'), /nights/);
  rejects(() => f.parseRoute('[{"city":"A","nights":1.5}]'), /nights/);
  rejects(() => f.parseRoute('["A"]'), /object/);
  rejects(() => f.parseRoute('{"city":"A"}'), /list/);
  rejects(() => f.parseRoute("[{"), /JSON/);
});

test("text lists: trimmed, empties dropped, malformed JSON rejected", () => {
  assert.deepEqual(f.parseTextList('[" a ","","  ","b"]', "highlights"), ["a", "b"]);
  assert.deepEqual(f.parseTextList("", "highlights"), []);
  rejects(() => f.parseTextList("not json", "highlights"), /highlights is not valid JSON/);
  rejects(() => f.parseTextList('"a"', "highlights"), /list/);
  rejects(() => f.parseTextList("[1]", "highlights"), /text/);
  rejects(
    () => f.parseScalarFields(form({ inclusions: "{oops" }), "update"),
    /inclusions is not valid JSON/
  );
});

test("includes keeps only known options, de-duplicated", () => {
  assert.deepEqual(f.parseIncludes('["Flight","Nope","Meals","Flight",3]'), ["Flight", "Meals"]);
  rejects(() => f.parseIncludes("{"), /JSON/);
});

test("keepGallery must be a JSON list of filenames (blank is an error)", () => {
  assert.deepEqual(f.parseKeepGallery('["a.jpg","b.jpg"]'), ["a.jpg", "b.jpg"]);
  assert.deepEqual(f.parseKeepGallery("[]"), []);
  rejects(() => f.parseKeepGallery(""), /JSON/);
  rejects(() => f.parseKeepGallery('{"a":1}'), /list/);
  rejects(() => f.parseKeepGallery("[1]"), /filenames/);
});

test("mergeGallery: keep ∩ current then new; append when no keep list", () => {
  assert.deepEqual(f.mergeGallery(["a", "b", "c"], ["c", "a", "zzz", "a"], ["n"]), ["c", "a", "n"]);
  assert.deepEqual(f.mergeGallery(["a", "b"], [], ["n"]), ["n"]);
  assert.deepEqual(f.mergeGallery(["a", "b"], undefined, ["n"]), ["a", "b", "n"]);
  assert.deepEqual(f.mergeGallery(["a", "b"], undefined, []), ["a", "b"]);
});

test("file type checks", () => {
  assert.equal(f.isImageFile(img()), true);
  assert.equal(f.isImageFile(new File(["x"], "a.txt", { type: "text/plain" })), false);
  // Only allowlisted raster types: SVG/HTML can carry script, so they're not "images" here.
  assert.equal(f.isImageFile(new File(["<svg/>"], "a.svg", { type: "image/svg+xml" })), false);
  assert.equal(f.isImageFile(new File(["x"], "a.png", { type: "image/png" })), true);
  assert.equal(f.isPdfFile(pdf()), true);
  assert.equal(f.isPdfFile(new File(["x"], "B.PDF", { type: "" })), true);
  assert.equal(f.isPdfFile(new File(["x"], "b", { type: "application/pdf" })), true);
  assert.equal(f.isPdfFile(new File(["x"], "b.txt", { type: "text/plain" })), false);
});

test("readUploads validates cover, gallery and brochure", () => {
  const txt = new File(["x"], "n.txt", { type: "text/plain" });
  rejects(() => f.readUploads(form({}), "create"), /image is required/);
  assert.deepEqual(f.readUploads(form({}), "update"), { image: undefined, gallery: [], brochure: undefined });
  rejects(() => f.readUploads(form({ image: txt }), "update"), /Package image must be an image/);
  rejects(() => f.readUploads(form({ gallery: [img(), txt] }), "update"), /Gallery file "n.txt"/);
  rejects(() => f.readUploads(form({ brochure: txt }), "update"), /Brochure must be a PDF/);
  // Zero-byte parts (an untouched file input) are ignored, not rejected.
  const empty = new File([], "", { type: "application/octet-stream" });
  const ok = f.readUploads(form({ image: empty, gallery: [empty], brochure: empty }), "update");
  assert.deepEqual(ok, { image: undefined, gallery: [], brochure: undefined });
});

test("toUpdateDoc emits only non-empty operators", () => {
  assert.deepEqual(f.toUpdateDoc({ set: {}, unset: [] }), {});
  assert.deepEqual(f.toUpdateDoc({ set: { A: 1 }, unset: [] }), { $set: { A: 1 } });
  assert.deepEqual(f.toUpdateDoc({ set: {}, unset: ["X", "Y"] }), { $unset: { X: 1, Y: 1 } });
});

test("parsePackageForm (create) saves cover, gallery and brochure", async () => {
  const { set } = await f.parsePackageForm(
    form({ ...BASICS, image: img("cover.jpg"), gallery: [img("g1.jpg"), img("g2.jpg")], brochure: pdf() }),
    { mode: "create" }
  );
  const gallery = set.GALLERY as string[];
  assert.equal(gallery.length, 2);
  assert.ok(fs.existsSync(path.join(uploadDir, "pkgTitleImg", set.PKG_IMAGE as string)));
  for (const g of gallery) assert.ok(fs.existsSync(path.join(uploadDir, "pkgGallery", g)));
  assert.match(set.BROCHURE as string, /\.pdf$/);
  assert.ok(fs.existsSync(path.join(uploadDir, "pkgBrochure", set.BROCHURE as string)));
});

test("parsePackageForm (update) leaves gallery/brochure alone when their keys are absent", async () => {
  const { set, unset } = await f.parsePackageForm(form(BASICS), { mode: "update", currentGallery: ["a.jpg"] });
  assert.ok(!("GALLERY" in set) && !("BROCHURE" in set) && !("PKG_IMAGE" in set));
  assert.deepEqual(unset, []);
});

test("parsePackageForm (update) gallery: keep ∩ current + new, or append", async () => {
  const kept = await f.parsePackageForm(
    form({ keepGallery: '["a.jpg","ghost.jpg"]', gallery: img("n.jpg") }),
    { mode: "update", currentGallery: ["a.jpg", "b.jpg"] }
  );
  const g = kept.set.GALLERY as string[];
  assert.equal(g.length, 2);
  assert.equal(g[0], "a.jpg");
  assert.ok(fs.existsSync(path.join(uploadDir, "pkgGallery", g[1])));

  const appended = await f.parsePackageForm(form({ gallery: img("n2.jpg") }), {
    mode: "update",
    currentGallery: ["a.jpg", "b.jpg"],
  });
  const a = appended.set.GALLERY as string[];
  assert.deepEqual(a.slice(0, 2), ["a.jpg", "b.jpg"]);
  assert.equal(a.length, 3);

  const cleared = await f.parsePackageForm(form({ keepGallery: "[]" }), { mode: "update", currentGallery: ["a.jpg"] });
  assert.deepEqual(cleared.set.GALLERY, []);
});

test("parsePackageForm (update) brochure: removeBrochure clears, new file wins", async () => {
  const removed = await f.parsePackageForm(form({ removeBrochure: "1" }), { mode: "update" });
  assert.deepEqual(removed.unset, ["BROCHURE"]);
  assert.ok(!("BROCHURE" in removed.set));

  const replaced = await f.parsePackageForm(form({ removeBrochure: "1", brochure: pdf("new.pdf") }), {
    mode: "update",
  });
  assert.deepEqual(replaced.unset, []);
  assert.match(replaced.set.BROCHURE as string, /\.pdf$/);

  // A PDF-by-MIME upload without a .pdf name is stored with the extension.
  const noExt = await f.parsePackageForm(
    form({ brochure: new File(["%PDF"], "brochure", { type: "application/pdf" }) }),
    { mode: "update" }
  );
  assert.match(noExt.set.BROCHURE as string, /\.pdf$/);

  // A PDF accepted by its ".pdf" name alone (blank MIME) is still stored as a .pdf.
  const blankMime = await f.parsePackageForm(form({ brochure: new File(["%PDF"], "B.PDF", { type: "" }) }), {
    mode: "update",
  });
  assert.match(blankMime.set.BROCHURE as string, /\.pdf$/);
});

test("parsePackageForm writes no files when validation fails", async () => {
  const before = fs.existsSync(path.join(uploadDir, "pkgGallery")) ? fs.readdirSync(path.join(uploadDir, "pkgGallery")).length : 0;
  await assert.rejects(
    f.parsePackageForm(
      form({ ...BASICS, image: img(), gallery: [img(), new File(["x"], "n.txt", { type: "text/plain" })] }),
      { mode: "create" }
    ),
    f.PackageFormError
  );
  const after = fs.existsSync(path.join(uploadDir, "pkgGallery")) ? fs.readdirSync(path.join(uploadDir, "pkgGallery")).length : 0;
  assert.equal(after, before);
});
