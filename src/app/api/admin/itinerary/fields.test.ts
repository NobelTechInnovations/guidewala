import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// UPLOAD_ROOT is read when media.server loads, so point it at a temp dir
// before ./fields (-> upload -> media.server) is imported.
const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "gw-itin-fields-"));
let f: typeof import("./fields");
let PackageFormError: typeof import("../packages/fields").PackageFormError;

before(async () => {
  process.env.UPLOAD_DIR = uploadDir;
  f = await import("./fields");
  ({ PackageFormError } = await import("../packages/fields"));
});
after(() => fs.rmSync(uploadDir, { recursive: true, force: true }));

function form(entries: Record<string, string | File>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.append(k, v);
  return fd;
}
const img = (name = "a.jpg") => new File(["x"], name, { type: "image/jpeg" });

function rejects(fn: () => unknown, pattern: RegExp) {
  assert.throws(fn, (e) => e instanceof PackageFormError && pattern.test(e.message));
}

test("create applies defaults and maps every field", () => {
  assert.deepEqual(f.parseItineraryFields(form({ name: " Day 1 " }), "create"), {
    set: { ITINERARY: "Day 1", PACKAGE_DESC: "", MEALS: [], IS_ACTIVE: "Y" },
    unset: [],
  });

  const { set } = f.parseItineraryFields(
    form({
      name: "Bikaner",
      desc: "  plain\n\ntext  ",
      dayNo: " 2 ",
      meals: JSON.stringify(["Dinner", "Breakfast"]),
      stay: "  Hotel Lalgarh ",
      isActive: "N",
    }),
    "create"
  );
  assert.deepEqual(set, {
    ITINERARY: "Bikaner",
    PACKAGE_DESC: "  plain\n\ntext  ", // stored as given
    DAY_NO: 2,
    MEALS: ["Breakfast", "Dinner"],
    STAY: "Hotel Lalgarh",
    IS_ACTIVE: "N",
  });
});

test("create requires a name; update rejects blanking it", () => {
  rejects(() => f.parseItineraryFields(form({}), "create"), /required/);
  rejects(() => f.parseItineraryFields(form({ name: "  " }), "create"), /required/);
  rejects(() => f.parseItineraryFields(form({ name: "  " }), "update"), /empty/);
});

test("update only touches keys that are present", () => {
  assert.deepEqual(f.parseItineraryFields(form({}), "update"), { set: {}, unset: [] });
  assert.deepEqual(f.parseItineraryFields(form({ desc: "x" }), "update"), { set: { PACKAGE_DESC: "x" }, unset: [] });
  // A blank isActive behaves like an absent one: unchanged on update, "Y" on create.
  assert.deepEqual(f.parseItineraryFields(form({ isActive: "" }), "update"), { set: {}, unset: [] });
  assert.equal(f.parseItineraryFields(form({ name: "n", isActive: " " }), "create").set.IS_ACTIVE, "Y");
});

test("blank dayNo / stay are unset on update and omitted on create", () => {
  const upd = f.parseItineraryFields(form({ dayNo: "", stay: "   " }), "update");
  assert.deepEqual(upd.set, {});
  assert.deepEqual(upd.unset.sort(), ["DAY_NO", "STAY"]);

  const created = f.parseItineraryFields(form({ name: "n", dayNo: "", stay: "" }), "create");
  assert.deepEqual(created.unset, []);
  assert.ok(!("DAY_NO" in created.set) && !("STAY" in created.set));
});

test("dayNo must be a positive whole number", () => {
  for (const bad of ["0", "-1", "1.5", "abc", "1e3", "99999999999999999999", "+2"]) {
    rejects(() => f.parseItineraryFields(form({ name: "n", dayNo: bad }), "create"), /Day number/);
  }
  assert.equal(f.parseItineraryFields(form({ name: "n", dayNo: "12" }), "create").set.DAY_NO, 12);
});

test("meals: known options only, de-duplicated, canonical order", () => {
  assert.deepEqual(f.parseMeals(JSON.stringify(["Dinner", "Brunch", 3, "Breakfast", "Dinner"])), ["Breakfast", "Dinner"]);
  assert.deepEqual(f.parseMeals("[]"), []);
  assert.deepEqual(f.parseMeals(""), []);
  rejects(() => f.parseMeals("{not json"), /Meals.*JSON/);
  rejects(() => f.parseMeals('"Breakfast"'), /Meals.*list/);
  // On update an explicit empty list clears the meals.
  assert.deepEqual(f.parseItineraryFields(form({ meals: "[]" }), "update").set, { MEALS: [] });
});

test("isActive must be Y or N", () => {
  rejects(() => f.parseItineraryFields(form({ name: "n", isActive: "yes" }), "create"), /isActive/);
  assert.equal(f.parseItineraryFields(form({ isActive: "N" }), "update").set.IS_ACTIVE, "N");
});

test("parseIntId accepts whole numbers only", () => {
  assert.equal(f.parseIntId("7"), 7);
  for (const bad of ["abc", "1.5", "NaN", "Infinity"]) assert.equal(f.parseIntId(bad), null);
});

test("image must be an image; an empty file input is ignored", () => {
  rejects(() => f.readItineraryImage(form({ image: new File(["x"], "a.pdf", { type: "application/pdf" }) })), /image/);
  assert.equal(f.readItineraryImage(form({})), undefined);
  assert.equal(f.readItineraryImage(form({ image: new File([], "a.jpg", { type: "image/jpeg" }) })), undefined);
  assert.ok(f.readItineraryImage(form({ image: img() })));
});

test("parseItineraryForm saves the image only after validation passes", async () => {
  const dir = path.join(uploadDir, "pkgItinImg");

  await assert.rejects(
    f.parseItineraryForm(form({ name: "n", dayNo: "0", image: img() }), "create"),
    PackageFormError
  );
  assert.ok(!fs.existsSync(dir) || fs.readdirSync(dir).length === 0, "no orphan upload on a 400");

  const created = await f.parseItineraryForm(form({ name: "n", image: img("x.png") }), "create");
  const saved = created.set.PKG_IMAGE as string;
  assert.match(saved, /\.jpg$/); // extension comes from the MIME type (image/jpeg), not the "x.png" name
  assert.ok(fs.existsSync(path.join(dir, saved)));

  // No image: create stores "" (legacy convention); update leaves PKG_IMAGE alone.
  assert.equal((await f.parseItineraryForm(form({ name: "n" }), "create")).set.PKG_IMAGE, "");
  assert.ok(!("PKG_IMAGE" in (await f.parseItineraryForm(form({ name: "n" }), "update")).set));
});
