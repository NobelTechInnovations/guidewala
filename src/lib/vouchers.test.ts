import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MEAL_PLANS,
  ROW_STATUSES,
  PAYMENT_TERMS,
  COMPANY,
  formatVoucherNo,
  parseVoucherSeq,
  nightsBetween,
  serviceLabel,
  nightDates,
} from "./vouchers";

test("option lists match the spec values and order", () => {
  assert.deepEqual([...MEAL_PLANS], ["EP", "CP", "MAP", "AP"]);
  assert.deepEqual([...ROW_STATUSES], ["Confirm", "Pending", "Cancelled"]);
  assert.deepEqual([...PAYMENT_TERMS], ["Prepaid", "Pay at Hotel", "Partially Paid"]);
});

test("COMPANY holds the verbatim company block", () => {
  assert.deepEqual(COMPANY, {
    name: "G8 Guidewala Services LLP",
    phone: "+91 9829185267",
    email: "booking@guidewala.co.in",
    office: "1st floor, E 69, Ganga Marg, Prem Nagar, Jhotwara, Jaipur, Rajasthan -302012",
  });
});

test("formatVoucherNo zero-pads to 4 digits and grows past 9999", () => {
  assert.equal(formatVoucherNo(1), "GW-V-0001");
  assert.equal(formatVoucherNo(9999), "GW-V-9999");
  assert.equal(formatVoucherNo(12345), "GW-V-12345");
});

test("parseVoucherSeq reads the sequence and returns 0 when malformed", () => {
  assert.equal(parseVoucherSeq("GW-V-0042"), 42);
  assert.equal(parseVoucherSeq("GW-V-12345"), 12345);
  assert.equal(parseVoucherSeq("x"), 0);
  assert.equal(parseVoucherSeq(""), 0);
  assert.equal(parseVoucherSeq("GW-V-"), 0);
  assert.equal(parseVoucherSeq("GW-V-12ab"), 0);
  assert.equal(parseVoucherSeq("XX-V-0042"), 0);
});

test("formatVoucherNo and parseVoucherSeq round-trip", () => {
  for (const n of [1, 42, 9999, 10000, 123456]) assert.equal(parseVoucherSeq(formatVoucherNo(n)), n);
});

test("nightsBetween counts calendar days from ISO dates, full ISO strings and Dates", () => {
  assert.equal(nightsBetween("2026-10-16", "2026-10-18"), 2);
  assert.equal(nightsBetween("2026-10-16", "2026-10-17"), 1);
  assert.equal(nightsBetween("2026-10-16T00:00:00.000Z", "2026-10-19T00:00:00.000Z"), 3);
  assert.equal(nightsBetween(new Date("2026-10-16"), new Date("2026-10-18")), 2);
  // across a month/year boundary
  assert.equal(nightsBetween("2026-12-30", "2027-01-02"), 3);
});

test("nightsBetween uses UTC date parts, so time of day never shifts the count", () => {
  assert.equal(nightsBetween("2026-10-16T23:30:00.000Z", "2026-10-18T00:15:00.000Z"), 2);
});

test("nightsBetween returns 0 for invalid dates or check-out on/before check-in", () => {
  assert.equal(nightsBetween("2026-10-16", "2026-10-16"), 0);
  assert.equal(nightsBetween("2026-10-18", "2026-10-16"), 0);
  assert.equal(nightsBetween("nope", "2026-10-16"), 0);
  assert.equal(nightsBetween("2026-10-16", ""), 0);
  assert.equal(nightsBetween(new Date("x"), new Date("2026-10-16")), 0);
});

test("serviceLabel is <n>D/<n>N", () => {
  assert.equal(serviceLabel(2), "2D/2N");
  assert.equal(serviceLabel(1), "1D/1N");
});

test("nightDates lists each night, check-in through check-out minus one, as dd/mm/yyyy", () => {
  assert.deepEqual(nightDates("2026-10-16", "2026-10-18"), ["16/10/2026", "17/10/2026"]);
  assert.deepEqual(nightDates("2026-10-11", "2026-10-12"), ["11/10/2026"]);
  assert.deepEqual(nightDates("2026-12-30", "2027-01-02"), ["30/12/2026", "31/12/2026", "01/01/2027"]);
  assert.deepEqual(nightDates(new Date("2026-10-16"), new Date("2026-10-17")), ["16/10/2026"]);
});

test("nightDates returns [] when there are no nights", () => {
  assert.deepEqual(nightDates("2026-10-16", "2026-10-16"), []);
  assert.deepEqual(nightDates("2026-10-18", "2026-10-16"), []);
  assert.deepEqual(nightDates("bad", "2026-10-16"), []);
});
