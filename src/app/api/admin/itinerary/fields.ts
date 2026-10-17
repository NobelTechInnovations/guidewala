import { MEAL_OPTIONS } from "@/lib/packages";
import { saveAdminUpload } from "@/lib/upload";
import {
  PackageFormError,
  filePart,
  isImageFile,
  parseArray,
  readFlag,
  readText,
  type FormMode,
  type PackageChanges,
} from "../packages/fields";

/**
 * Multipart <-> itinerary-item mapping shared by POST
 * /api/admin/packages/[id]/itinerary and PUT /api/admin/itinerary/[id], so
 * both accept exactly the same keys with the same validation. Errors are the
 * packages form's `PackageFormError` (routes turn them into 400 `{ error }`
 * via `formErrorResponse`), and the result is the same `{ set, unset }` shape
 * that `toUpdateDoc` turns into a Mongo update.
 *
 * Keys: name* (itinerary title), desc, image (File), dayNo (blank = not
 * day-wise), meals (JSON list), stay, isActive ("Y" | "N"). (* = required on
 * create; on update a key that is present must not be blank.)
 *
 * On update only keys present in the form are touched (`form.has`), so a
 * client that omits e.g. `image` or `isActive` leaves those exactly as stored.
 */

/** Numeric id from a URL segment, or null when it isn't a whole number (-> 404, not a cast error). */
export function parseIntId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

/** Blank -> undefined; otherwise a positive whole number (a day can't be 0 or negative). */
export function parseDayNo(raw: string): number | undefined {
  const s = raw.trim();
  if (!s) return undefined;
  const n = Number(s);
  if (!/^\d+$/.test(s) || !Number.isSafeInteger(n) || n < 1) {
    throw new PackageFormError("Day number must be a whole number, 1 or more.");
  }
  return n;
}

/**
 * JSON string array -> only known meals, de-duplicated, in Breakfast / Lunch /
 * Dinner order whatever order they were sent in. Blank = none; anything that
 * isn't a JSON list is an error.
 */
export function parseMeals(raw: string): string[] {
  const sent = parseArray(raw, "Meals");
  return MEAL_OPTIONS.filter((meal) => sent.includes(meal));
}

/**
 * Validates and maps every non-file field. Pure (no I/O) so it can be unit
 * tested. Create applies the defaults (MEALS [], IS_ACTIVE "Y") and never
 * produces `unset`; update only touches keys present in the form.
 */
export function parseItineraryFields(form: FormData, mode: FormMode): PackageChanges {
  const create = mode === "create";
  const set: Record<string, unknown> = {};
  const unset: string[] = [];
  /** Blank optional value: remove the field on update, just omit it on create. */
  const clear = (field: string) => {
    if (!create) unset.push(field);
  };

  const name = readText(form, "name")?.trim();
  if (create && !name) throw new PackageFormError("Itinerary Name is required.");
  if (name !== undefined) {
    if (!name) throw new PackageFormError("Itinerary Name cannot be empty.");
    set.ITINERARY = name;
  }

  // Description is stored as given (the form sends plain text).
  const desc = readText(form, "desc");
  if (desc !== undefined) set.PACKAGE_DESC = desc;
  else if (create) set.PACKAGE_DESC = "";

  const dayRaw = readText(form, "dayNo");
  if (dayRaw !== undefined) {
    const day = parseDayNo(dayRaw);
    if (day === undefined) clear("DAY_NO");
    else set.DAY_NO = day;
  }

  const meals = readText(form, "meals");
  if (meals !== undefined) set.MEALS = parseMeals(meals);
  else if (create) set.MEALS = [];

  const stay = readText(form, "stay")?.trim();
  if (stay !== undefined) {
    if (stay) set.STAY = stay;
    else clear("STAY");
  }

  // Blank behaves like absent: default "Y" on create, unchanged on update.
  const isActive = readFlag(form, "isActive");
  if (isActive) set.IS_ACTIVE = isActive;
  else if (create) set.IS_ACTIVE = "Y";

  return { set, unset };
}

/** The itinerary image, if one was sent (an empty file input submits a zero-byte part). Pure. */
export function readItineraryImage(form: FormData): File | undefined {
  const image = filePart(form.get("image"));
  if (image && !isImageFile(image)) throw new PackageFormError("Itinerary image must be an image file.");
  return image;
}

/**
 * Parses and validates the whole itinerary form, saves the uploaded image and
 * returns the field changes. Everything is validated before the file is
 * written, so a 400 never leaves an orphaned upload behind. A replaced image
 * is not deleted from disk.
 */
export async function parseItineraryForm(form: FormData, mode: FormMode): Promise<PackageChanges> {
  const changes = parseItineraryFields(form, mode);
  const image = readItineraryImage(form);

  // ---- validation done; nothing above touches the disk ----
  if (image) changes.set.PKG_IMAGE = await saveAdminUpload(image, "pkgItinImg");
  else if (mode === "create") changes.set.PKG_IMAGE = "";
  return changes;
}
