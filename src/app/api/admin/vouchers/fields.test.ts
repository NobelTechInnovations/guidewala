import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_ROWS,
  parseVoucherBody,
  parseDateInput,
  escapeRegex,
  nextVoucherNo,
  buildSourceItem,
} from "./fields";

const row = (over: Record<string, unknown> = {}) => ({
  hotelName: "Hotel Pearl Palace",
  checkIn: "2026-10-16",
  checkOut: "2026-10-18",
  ...over,
});
const body = (over: Record<string, unknown> = {}) => ({
  guestName: "Anas Khan",
  rows: [row()],
  ...over,
});

function ok(input: unknown) {
  const r = parseVoucherBody(input);
  assert.equal(r.ok, true, r.ok ? "" : r.error);
  if (!r.ok) throw new Error("unreachable");
  return r.value;
}
function fail(input: unknown): string {
  const r = parseVoucherBody(input);
  assert.equal(r.ok, false, "expected a validation error");
  if (r.ok) throw new Error("unreachable");
  return r.error;
}

test("parseVoucherBody: full valid body maps to UPPER_SNAKE doc fields", () => {
  const v = ok({
    guestName: "  Anas Khan ",
    guestNote: " x 3 Guests (2 Year Child) ",
    nationality: " Indian ",
    contactNo: " +91 98290 00000 ",
    paymentTerms: "Pay at Hotel",
    source: { type: "hotel", refId: " HB1307220008 " },
    notes: " Early check-in ",
    rows: [
      {
        hotelId: 7,
        hotelName: " Hotel Pearl Palace ",
        address: " Hari Kishan Somani Marg ",
        checkIn: "2026-10-16",
        checkOut: "2026-10-18",
        service: " 2D/2N Deluxe ",
        mealPlan: "MAP",
        status: "Pending",
        refCode: " ABC123 ",
        contact: " 0141-1234567 ",
      },
    ],
  });
  assert.equal(v.GUEST_NAME, "Anas Khan");
  assert.equal(v.GUEST_NOTE, "x 3 Guests (2 Year Child)");
  assert.equal(v.NATIONALITY, "Indian");
  assert.equal(v.CONTACT_NO, "+91 98290 00000");
  assert.equal(v.PAYMENT_TERMS, "Pay at Hotel");
  assert.deepEqual(v.SOURCE, { TYPE: "hotel", REF_ID: "HB1307220008" });
  assert.equal(v.NOTES, "Early check-in");
  assert.equal(v.ROWS.length, 1);
  const r = v.ROWS[0];
  assert.equal(r.HOTEL_ID, 7);
  assert.equal(r.HOTEL_NAME, "Hotel Pearl Palace");
  assert.equal(r.ADDRESS, "Hari Kishan Somani Marg");
  assert.equal(r.SERVICE, "2D/2N Deluxe");
  assert.equal(r.MEAL_PLAN, "MAP");
  assert.equal(r.STATUS, "Pending");
  assert.equal(r.REF_CODE, "ABC123");
  assert.equal(r.CONTACT, "0141-1234567");
  // Stored as UTC-midnight Dates.
  assert.ok(r.CHECK_IN instanceof Date && r.CHECK_OUT instanceof Date);
  assert.equal((r.CHECK_IN as Date).toISOString(), "2026-10-16T00:00:00.000Z");
  assert.equal((r.CHECK_OUT as Date).toISOString(), "2026-10-18T00:00:00.000Z");
});

test("parseVoucherBody: minimal body gets the documented defaults", () => {
  const v = ok(body());
  assert.equal(v.GUEST_NOTE, "");
  assert.equal(v.NATIONALITY, "Indian");
  assert.equal(v.CONTACT_NO, "");
  assert.equal(v.PAYMENT_TERMS, "Prepaid");
  assert.deepEqual(v.SOURCE, { TYPE: "manual", REF_ID: "" });
  assert.equal(v.NOTES, "");
  const r = v.ROWS[0];
  assert.equal(r.MEAL_PLAN, "");
  assert.equal(r.STATUS, "Confirm");
  assert.equal(r.ADDRESS, "");
  assert.equal(r.REF_CODE, "");
  assert.equal(r.CONTACT, "");
  assert.equal("HOTEL_ID" in r, false);
});

test("parseVoucherBody: blank enum strings fall back to defaults", () => {
  const v = ok(body({ paymentTerms: "  ", nationality: "   ", rows: [row({ mealPlan: "", status: " " })] }));
  assert.equal(v.PAYMENT_TERMS, "Prepaid");
  assert.equal(v.NATIONALITY, "Indian");
  assert.equal(v.ROWS[0].MEAL_PLAN, "");
  assert.equal(v.ROWS[0].STATUS, "Confirm");
});

test("parseVoucherBody: every listed enum value is accepted", () => {
  for (const mealPlan of ["EP", "CP", "MAP", "AP"]) ok(body({ rows: [row({ mealPlan })] }));
  for (const status of ["Confirm", "Pending", "Cancelled"]) ok(body({ rows: [row({ status })] }));
  for (const paymentTerms of ["Prepaid", "Pay at Hotel", "Partially Paid"]) ok(body({ paymentTerms }));
  for (const type of ["hotel", "guide", "vendor", "manual"]) ok(body({ source: { type } }));
});

test("parseVoucherBody: guest name is required", () => {
  assert.match(fail(body({ guestName: "" })), /guest name is required/i);
  assert.match(fail(body({ guestName: "   " })), /guest name is required/i);
  assert.match(fail({ rows: [row()] }), /guest name is required/i);
  assert.match(fail(body({ guestName: null })), /guest name is required/i);
  assert.match(fail(body({ guestName: { first: "A" } })), /guest name is required/i);
});

test("parseVoucherBody: rejects non-object bodies", () => {
  for (const bad of [null, undefined, "x", 3, [], true]) assert.match(fail(bad), /json object/i);
});

test("parseVoucherBody: needs at least one row and at most MAX_ROWS", () => {
  assert.match(fail(body({ rows: [] })), /at least one hotel/i);
  assert.match(fail({ guestName: "A" }), /at least one hotel/i);
  assert.match(fail(body({ rows: "nope" })), /at least one hotel/i);
  assert.equal(MAX_ROWS, 20);
  ok(body({ rows: Array.from({ length: 20 }, () => row()) }));
  assert.match(fail(body({ rows: Array.from({ length: 21 }, () => row()) })), /at most 20/i);
});

test("parseVoucherBody: each row needs a hotel name; errors name the row number", () => {
  assert.equal(fail(body({ rows: [row(), row({ hotelName: "  " })] })), "Row 2: hotel name is required");
  assert.equal(fail(body({ rows: [row({ hotelName: undefined })] })), "Row 1: hotel name is required");
  assert.equal(fail(body({ rows: [row(), "not-an-object"] })), "Row 2: must be an object");
});

test("parseVoucherBody: bad or missing dates are rejected", () => {
  assert.equal(fail(body({ rows: [row({ checkIn: "" })] })), "Row 1: check-in date is missing or invalid");
  assert.equal(fail(body({ rows: [row({ checkIn: "16/10/2026" })] })), "Row 1: check-in date is missing or invalid");
  assert.equal(fail(body({ rows: [row({ checkIn: undefined })] })), "Row 1: check-in date is missing or invalid");
  assert.equal(fail(body({ rows: [row({ checkOut: "not a date" })] })), "Row 1: check-out date is missing or invalid");
  assert.equal(fail(body({ rows: [row({ checkOut: 20261018 })] })), "Row 1: check-out date is missing or invalid");
  // Calendar-invalid dates must not roll over into the next month.
  assert.equal(fail(body({ rows: [row({ checkOut: "2026-02-30" })] })), "Row 1: check-out date is missing or invalid");
});

test("parseVoucherBody: check-out must be after check-in (never zero/negative nights)", () => {
  assert.equal(
    fail(body({ rows: [row({ checkIn: "2026-10-18", checkOut: "2026-10-18" })] })),
    "Row 1: check-out must be after check-in"
  );
  assert.equal(
    fail(body({ rows: [row(), row({ checkIn: "2026-10-18", checkOut: "2026-10-16" })] })),
    "Row 2: check-out must be after check-in"
  );
  // Same calendar day but different times still means zero nights.
  assert.equal(
    fail(body({ rows: [row({ checkIn: "2026-10-18T05:00:00.000Z", checkOut: "2026-10-18T20:00:00.000Z" })] })),
    "Row 1: check-out must be after check-in"
  );
});

test("parseVoucherBody: invalid enum values are rejected", () => {
  assert.match(fail(body({ paymentTerms: "Cash" })), /payment terms must be one of Prepaid, Pay at Hotel, Partially Paid/i);
  assert.match(fail(body({ rows: [row({ mealPlan: "BB" })] })), /^Row 1: meal plan must be one of EP, CP, MAP, AP/);
  assert.match(fail(body({ rows: [row({ status: "Done" })] })), /^Row 1: status must be one of Confirm, Pending, Cancelled/);
  assert.match(fail(body({ rows: [row(), row({ mealPlan: "ep" })] })), /^Row 2: meal plan/);
  assert.match(fail(body({ source: { type: "taxi" } })), /source type must be one of hotel, guide, vendor, manual/i);
  assert.match(fail(body({ source: "hotel" })), /source/i);
});

test("parseVoucherBody: SERVICE auto-fills from the nights when blank, keeps edits", () => {
  assert.equal(ok(body()).ROWS[0].SERVICE, "2D/2N");
  assert.equal(ok(body({ rows: [row({ service: "   " })] })).ROWS[0].SERVICE, "2D/2N");
  assert.equal(ok(body({ rows: [row({ checkIn: "2026-10-31", checkOut: "2026-11-03" })] })).ROWS[0].SERVICE, "3D/3N");
  assert.equal(ok(body({ rows: [row({ service: "Suite, 1 night extra" })] })).ROWS[0].SERVICE, "Suite, 1 night extra");
});

test("parseVoucherBody: full ISO datetimes are accepted and normalised to UTC midnight", () => {
  const v = ok(body({ rows: [row({ checkIn: "2026-10-16T00:00:00.000Z", checkOut: "2026-10-18T13:45:00.000Z" })] }));
  assert.equal((v.ROWS[0].CHECK_IN as Date).toISOString(), "2026-10-16T00:00:00.000Z");
  assert.equal((v.ROWS[0].CHECK_OUT as Date).toISOString(), "2026-10-18T00:00:00.000Z");
  assert.equal(v.ROWS[0].SERVICE, "2D/2N");
});

test("parseVoucherBody: hotelId is optional but must be a positive whole number", () => {
  for (const hotelId of [undefined, null, ""]) assert.equal("HOTEL_ID" in ok(body({ rows: [row({ hotelId })] })).ROWS[0], false);
  assert.equal(ok(body({ rows: [row({ hotelId: "12" })] })).ROWS[0].HOTEL_ID, 12);
  for (const hotelId of [0, -3, 1.5, "abc", "1.5", NaN, true]) {
    assert.equal(fail(body({ rows: [row({ hotelId })] })), "Row 1: hotel id must be a positive whole number");
  }
});

test("parseVoucherBody: source refId is optional and trimmed; numbers become strings", () => {
  assert.deepEqual(ok(body({ source: { type: "guide" } })).SOURCE, { TYPE: "guide", REF_ID: "" });
  assert.deepEqual(ok(body({ source: { refId: " X1 " } })).SOURCE, { TYPE: "manual", REF_ID: "X1" });
  assert.deepEqual(ok(body({ source: { type: "vendor", refId: 1690000000000 } })).SOURCE, {
    TYPE: "vendor",
    REF_ID: "1690000000000",
  });
  assert.deepEqual(ok(body({ source: null })).SOURCE, { TYPE: "manual", REF_ID: "" });
});

test("parseVoucherBody: non-string text fields are treated as blank, not crashed on", () => {
  const v = ok(body({ guestNote: { a: 1 }, notes: ["x"], contactNo: 9829185267 }));
  assert.equal(v.GUEST_NOTE, "");
  assert.equal(v.NOTES, "");
  assert.equal(v.CONTACT_NO, "9829185267");
});

test("parseDateInput: strict YYYY-MM-DD, ISO accepted, anything else null", () => {
  assert.equal(parseDateInput("2026-10-16")?.toISOString(), "2026-10-16T00:00:00.000Z");
  assert.equal(parseDateInput(" 2026-10-16 ")?.toISOString(), "2026-10-16T00:00:00.000Z");
  assert.equal(parseDateInput("2024-02-29")?.toISOString(), "2024-02-29T00:00:00.000Z");
  assert.equal(parseDateInput("2026-02-29"), null);
  assert.equal(parseDateInput("2026-13-01"), null);
  assert.equal(parseDateInput("2026-10-16T25:00:00Z"), null);
  assert.equal(parseDateInput("0050-01-01"), null);
  assert.equal(parseDateInput(""), null);
  assert.equal(parseDateInput(null), null);
  assert.equal(parseDateInput(1760572800000), null);
  assert.equal(parseDateInput(new Date()), null);
});

test("escapeRegex neutralises every regex metacharacter", () => {
  assert.equal(escapeRegex("a.b*c"), "a\\.b\\*c");
  const nasty = "(.*)+[x]{2}?|^$\\";
  assert.equal(new RegExp(escapeRegex(nasty)).test(nasty), true);
  assert.equal(new RegExp(escapeRegex(".*")).test("anything"), false);
  assert.equal(escapeRegex("GW-V-0001"), "GW-V-0001");
});

test("nextVoucherNo: highest sequence + 1, ignores malformed, grows past 4 digits", () => {
  assert.equal(nextVoucherNo([]), "GW-V-0001");
  assert.equal(nextVoucherNo(["GW-V-0001", "GW-V-0002"]), "GW-V-0003");
  assert.equal(nextVoucherNo(["GW-V-0005", "GW-V-0002"]), "GW-V-0006"); // order-independent
  assert.equal(nextVoucherNo(["junk", "", "GW-V-0007", "GW-X-9999"]), "GW-V-0008");
  // Lexically "GW-V-9999" > "GW-V-10000"; the numeric max must still win.
  assert.equal(nextVoucherNo(["GW-V-9999", "GW-V-10000"]), "GW-V-10001");
});

test("buildSourceItem: full booking -> normalised item with label", () => {
  const item = buildSourceItem({
    refId: "HB1307220008",
    name: "ANAS",
    phone: "8401155993",
    guests: 5,
    from: new Date("2026-10-16T00:00:00.000Z"),
    to: new Date("2026-10-18T00:00:00.000Z"),
  });
  assert.deepEqual(item, {
    refId: "HB1307220008",
    name: "ANAS",
    phone: "8401155993",
    guests: 5,
    from: "2026-10-16",
    to: "2026-10-18",
    label: "HB1307220008 · ANAS · 16 Oct 2026 → 18 Oct 2026",
  });
});

test("buildSourceItem: missing phone/guests/dates still produce an item (Review Focus 4)", () => {
  const item = buildSourceItem({ refId: "C1", name: "Ravi", phone: undefined, guests: null, from: null, to: undefined });
  assert.deepEqual(item, { refId: "C1", name: "Ravi", phone: "", guests: null, from: null, to: null, label: "C1 · Ravi" });
});

test("buildSourceItem: one-sided dates and label parts are omitted, not faked", () => {
  assert.equal(buildSourceItem({ refId: "G1", name: "Mo", from: new Date("2026-08-10T00:00:00.000Z") }).label, "G1 · Mo · 10 Aug 2026");
  assert.equal(buildSourceItem({ refId: "G1", name: "Mo", to: new Date("2026-08-10T00:00:00.000Z") }).label, "G1 · Mo · → 10 Aug 2026");
  assert.equal(buildSourceItem({ refId: "G1", name: "" }).label, "G1");
  assert.equal(buildSourceItem({ refId: "", name: "Mo" }).label, "Mo");
  // Invalid Dates and non-finite guests are treated as missing.
  const bad = buildSourceItem({ refId: "G1", name: "Mo", guests: NaN, from: new Date("nope"), to: "2026-01-01" });
  assert.equal(bad.guests, null);
  assert.equal(bad.from, null);
  assert.equal(bad.to, null);
});
