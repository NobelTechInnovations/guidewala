/**
 * Client-safe helpers/types for hotel vouchers ("Service Confirmation") — no
 * mongoose, no `fs`, so admin client components can import this. The Mongoose
 * schema lives in src/models/Voucher.ts.
 *
 * All date maths uses UTC date parts: dates come from <input type="date">
 * ("YYYY-MM-DD", parsed as UTC midnight) and are stored as UTC Dates, so the
 * server/browser timezone must never shift a night.
 */

export const MEAL_PLANS = ["EP", "CP", "MAP", "AP"] as const;
export const ROW_STATUSES = ["Confirm", "Pending", "Cancelled"] as const;
export const PAYMENT_TERMS = ["Prepaid", "Pay at Hotel", "Partially Paid"] as const;

export type MealPlan = (typeof MEAL_PLANS)[number];
export type RowStatus = (typeof ROW_STATUSES)[number];
export type PaymentTerms = (typeof PAYMENT_TERMS)[number];

/** Company block printed on every voucher. */
export const COMPANY = {
  name: "G8 Guidewala Services LLP",
  phone: "+91 9829185267",
  email: "booking@guidewala.co.in",
  office: "1st floor, E 69, Ganga Marg, Prem Nagar, Jhotwara, Jaipur, Rajasthan -302012",
} as const;

/** One hotel line on a voucher. Dates are Date in the DB, ISO strings over JSON. */
export type VoucherRow = {
  HOTEL_ID?: number;
  HOTEL_NAME: string;
  ADDRESS?: string;
  CHECK_IN: string | Date;
  CHECK_OUT: string | Date;
  SERVICE?: string;
  MEAL_PLAN?: MealPlan | ""; // "" = not chosen
  STATUS?: RowStatus;
  REF_CODE?: string;
  CONTACT?: string;
};

export type VoucherDoc = {
  VOUCHER_NO: string;
  GUEST_NAME: string;
  GUEST_NOTE?: string;
  NATIONALITY?: string;
  CONTACT_NO?: string;
  PAYMENT_TERMS?: PaymentTerms;
  SOURCE?: { TYPE?: "hotel" | "guide" | "vendor" | "manual"; REF_ID?: string };
  NOTES?: string;
  ROWS: VoucherRow[];
  CREATED_ON?: string | Date;
  UPDATED_ON?: string | Date;
};

const VOUCHER_PREFIX = "GW-V-";

/** 1 -> "GW-V-0001"; grows past 4 digits instead of truncating. */
export function formatVoucherNo(n: number): string {
  return VOUCHER_PREFIX + String(n).padStart(4, "0");
}

/** "GW-V-0042" -> 42; 0 when the string isn't a voucher number. */
export function parseVoucherSeq(no: string): number {
  const m = /^GW-V-(\d+)$/.exec(no);
  return m ? Number(m[1]) : 0;
}

/** Day index since epoch (UTC calendar day), or NaN for an invalid date. */
function utcDay(d: Date | string): number {
  const date = d instanceof Date ? d : new Date(d);
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
}

/** Calendar nights between two dates; 0 when invalid or check-out <= check-in (callers validate). */
export function nightsBetween(checkIn: Date | string, checkOut: Date | string): number {
  const nights = utcDay(checkOut) - utcDay(checkIn);
  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

/** Default SERVICE text for a stay: 2 nights -> "2D/2N". */
export function serviceLabel(nights: number): string {
  return `${nights}D/${nights}N`;
}

/** Each night's date (check-in … check-out − 1) as dd/mm/yyyy; [] when there are no nights. */
export function nightDates(checkIn: Date | string, checkOut: Date | string): string[] {
  const nights = nightsBetween(checkIn, checkOut);
  const start = utcDay(checkIn);
  const out: string[] = [];
  for (let i = 0; i < nights; i++) {
    const d = new Date((start + i) * 86_400_000);
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    out.push(`${dd}/${mm}/${d.getUTCFullYear()}`);
  }
  return out;
}
