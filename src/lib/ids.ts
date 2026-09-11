import { Model } from "mongoose";

/** New collision-safe string ID for records the source schema keys by a
 * free-form string column (VENDOR_ID, PROMO_ID, CUST_ID, ...). */
export function newStringId(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

/** Next sequential numeric ID for records keyed like the old SQL IDENTITY
 * columns (PKG_ID, HOTEL_ID, ...) — highest existing value + 1. */
export async function nextNumericId(model: Model<unknown>, field: string): Promise<number> {
  const last = (await model.findOne().sort({ [field]: -1 }).select(`${field} -_id`).lean()) as
    | Record<string, number>
    | null;
  return (last?.[field] || 0) + 1;
}
