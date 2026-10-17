/**
 * Pure parsing/validation for the voucher admin API (no mongoose / next), so
 * it's unit-tested in fields.test.ts and the route files stay thin.
 *
 * Dates arrive as "YYYY-MM-DD" (or a full ISO string) and are stored as
 * UTC-midnight Dates — the same convention src/lib/vouchers.ts counts nights in.
 */
import {
  MEAL_PLANS,
  ROW_STATUSES,
  PAYMENT_TERMS,
  formatVoucherNo,
  parseVoucherSeq,
  nightsBetween,
  serviceLabel,
  type VoucherDoc,
  type VoucherRow,
  type MealPlan,
  type RowStatus,
  type PaymentTerms,
} from "@/lib/vouchers";

export const MAX_ROWS = 20;

const SOURCE_TYPES = ["hotel", "guide", "vendor", "manual"] as const;
type SourceType = (typeof SOURCE_TYPES)[number];

export type VoucherInput = Omit<VoucherDoc, "VOUCHER_NO" | "CREATED_ON" | "UPDATED_ON">;
export type ParseResult = { ok: true; value: VoucherInput } | { ok: false; error: string };

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

/** Trimmed text; numbers are stringified (phone fields), anything else is blank. */
function str(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
}

/** Blank -> fallback; otherwise the value must be one of `allowed` (exact match) or null. */
function pick<T extends string>(v: unknown, allowed: readonly T[], fallback: T | ""): T | "" | null {
  const s = str(v);
  if (!s) return fallback;
  return (allowed as readonly string[]).includes(s) ? (s as T) : null;
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T/;

/** "YYYY-MM-DD" or full ISO -> UTC-midnight Date; null when absent/invalid. */
export function parseDateInput(v: unknown): Date | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  const m = DATE_ONLY.exec(s);
  if (m) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const date = new Date(Date.UTC(y, mo - 1, d));
    // Date.UTC rolls 2026-02-30 into March; reject it rather than shift a night.
    const same = date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
    return same ? date : null;
  }
  if (ISO_DATETIME.test(s)) {
    const t = new Date(s);
    if (Number.isNaN(t.getTime())) return null;
    return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
  }
  return null;
}

function parseRow(raw: unknown, n: number): { ok: true; row: VoucherRow } | { ok: false; error: string } {
  const fail = (msg: string) => ({ ok: false as const, error: `Row ${n}: ${msg}` });
  if (!isObject(raw)) return fail("must be an object");

  const hotelName = str(raw.hotelName);
  if (!hotelName) return fail("hotel name is required");

  const checkIn = parseDateInput(raw.checkIn);
  if (!checkIn) return fail("check-in date is missing or invalid");
  const checkOut = parseDateInput(raw.checkOut);
  if (!checkOut) return fail("check-out date is missing or invalid");
  // Never store a zero/negative-night row (it would print no dates at all).
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) return fail("check-out must be after check-in");

  let hotelId: number | undefined;
  const rawId = raw.hotelId;
  if (rawId !== undefined && rawId !== null && rawId !== "") {
    const id = typeof rawId === "number" || typeof rawId === "string" ? Number(rawId) : NaN;
    if (!Number.isInteger(id) || id < 1) return fail("hotel id must be a positive whole number");
    hotelId = id;
  }

  const mealPlan = pick<MealPlan>(raw.mealPlan, MEAL_PLANS, "");
  if (mealPlan === null) return fail(`meal plan must be one of ${MEAL_PLANS.join(", ")} (or blank)`);
  const status = pick<RowStatus>(raw.status, ROW_STATUSES, "Confirm");
  if (status === null || status === "") return fail(`status must be one of ${ROW_STATUSES.join(", ")}`);

  const row: VoucherRow = {
    HOTEL_NAME: hotelName,
    ADDRESS: str(raw.address),
    CHECK_IN: checkIn,
    CHECK_OUT: checkOut,
    SERVICE: str(raw.service) || serviceLabel(nights),
    MEAL_PLAN: mealPlan,
    STATUS: status,
    REF_CODE: str(raw.refCode),
    CONTACT: str(raw.contact),
  };
  if (hotelId !== undefined) row.HOTEL_ID = hotelId;
  return { ok: true, row };
}

/** Validates and normalises a create/update JSON body into editable voucher fields. */
export function parseVoucherBody(body: unknown): ParseResult {
  if (!isObject(body)) return { ok: false, error: "Request body must be a JSON object" };

  const guestName = str(body.guestName);
  if (!guestName) return { ok: false, error: "Guest name is required" };

  const paymentTerms = pick<PaymentTerms>(body.paymentTerms, PAYMENT_TERMS, "Prepaid");
  if (paymentTerms === null || paymentTerms === "") {
    return { ok: false, error: `Payment terms must be one of ${PAYMENT_TERMS.join(", ")}` };
  }

  let sourceType: SourceType = "manual";
  let refId = "";
  if (body.source !== undefined && body.source !== null) {
    if (!isObject(body.source)) return { ok: false, error: "Source must be an object" };
    const t = pick<SourceType>(body.source.type, SOURCE_TYPES, "manual");
    if (t === null || t === "") return { ok: false, error: `Source type must be one of ${SOURCE_TYPES.join(", ")}` };
    sourceType = t;
    refId = str(body.source.refId);
  }

  const rawRows = body.rows;
  if (!Array.isArray(rawRows) || rawRows.length < 1) return { ok: false, error: "Add at least one hotel row" };
  if (rawRows.length > MAX_ROWS) return { ok: false, error: `A voucher can have at most ${MAX_ROWS} hotel rows` };

  const rows: VoucherRow[] = [];
  for (let i = 0; i < rawRows.length; i++) {
    const r = parseRow(rawRows[i], i + 1);
    if (!r.ok) return r;
    rows.push(r.row);
  }

  return {
    ok: true,
    value: {
      GUEST_NAME: guestName,
      GUEST_NOTE: str(body.guestNote),
      NATIONALITY: str(body.nationality) || "Indian",
      CONTACT_NO: str(body.contactNo),
      PAYMENT_TERMS: paymentTerms,
      SOURCE: { TYPE: sourceType, REF_ID: refId },
      NOTES: str(body.notes),
      ROWS: rows,
    },
  };
}

/** Escapes user text for use inside a RegExp (q searches must not be regex injection). */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Next voucher number = highest existing sequence + 1 (malformed numbers count as 0). */
export function nextVoucherNo(existing: string[]): string {
  const max = existing.reduce((m, no) => Math.max(m, parseVoucherSeq(no)), 0);
  return formatVoucherNo(max + 1);
}

// ---- booking sources (autofill) ----

export type SourceItem = {
  refId: string;
  name: string;
  phone: string;
  guests: number | null;
  from: string | null;
  to: string | null;
  label: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const validDate = (v: unknown): Date | null => (v instanceof Date && !Number.isNaN(v.getTime()) ? v : null);

/** "YYYY-MM-DD" from UTC date parts — matches how the booking dates are stored. */
function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "16 Oct 2026" from UTC parts (locale-independent). */
function shortDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Normalises a booking/customer record into the autofill shape; missing parts stay empty/null. */
export function buildSourceItem(input: {
  refId?: unknown;
  name?: unknown;
  phone?: unknown;
  guests?: unknown;
  from?: unknown;
  to?: unknown;
}): SourceItem {
  const refId = str(input.refId);
  const name = str(input.name);
  const from = validDate(input.from);
  const to = validDate(input.to);
  const guests = typeof input.guests === "number" && Number.isFinite(input.guests) ? input.guests : null;

  let dates = "";
  if (from && to) dates = `${shortDate(from)} → ${shortDate(to)}`;
  else if (from) dates = shortDate(from);
  else if (to) dates = `→ ${shortDate(to)}`;

  return {
    refId,
    name,
    phone: str(input.phone),
    guests,
    from: from ? isoDay(from) : null,
    to: to ? isoDay(to) : null,
    label: [refId, name, dates].filter(Boolean).join(" · "),
  };
}
