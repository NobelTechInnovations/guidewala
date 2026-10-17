import { INCLUDE_OPTIONS, TOUR_TYPES } from "@/lib/packages";
import { UploadError, isImageFile, saveAdminUpload } from "@/lib/upload";

/**
 * Multipart <-> package-document mapping shared by POST /api/admin/packages
 * and PUT /api/admin/packages/[id], so both accept exactly the same keys and
 * apply the same validation. Route files only wire this to the database.
 *
 * Keys (all optional unless noted): title*, cityId*, amount*, desc, isActive,
 * showOnHome, priceNote, tourType, durationDays, durationNights,
 * route (JSON [{city,nights}]), includes / highlights / inclusions /
 * exclusions / documents / thingsToCarry / notes (JSON string arrays),
 * cancellationPolicy, image (File, required on create), gallery (File[]),
 * keepGallery (JSON filenames), brochure (File), removeBrochure ("1").
 * (* = required on create; on update a key that is present must not be blank.)
 *
 * On update only keys that are present in the form are touched (`form.has`),
 * so a client that omits e.g. `gallery`/`keepGallery` or `brochure` leaves
 * those fields exactly as stored.
 */

/** Invalid input — routes turn this into a 400 `{ error }` response. */
export class PackageFormError extends Error {}

export type FormMode = "create" | "update";

/** What to write: fields to `$set` and field names to `$unset` (update only). */
export interface PackageChanges {
  set: Record<string, unknown>;
  unset: string[];
}

/** Validated file parts of the form (zero-byte parts — an empty file input — are dropped). */
export interface PackageUploads {
  image?: File;
  gallery: File[];
  brochure?: File;
}

/** Text lists stored one-per-line in the admin UI; form key -> document field. */
const LIST_FIELDS = [
  ["highlights", "HIGHLIGHTS"],
  ["inclusions", "INCLUSIONS"],
  ["exclusions", "EXCLUSIONS"],
  ["documents", "DOCUMENTS"],
  ["thingsToCarry", "THINGS_TO_CARRY"],
  ["notes", "NOTES"],
] as const;

// ---------------------------------------------------------------------------
// Small parsers (exported for unit tests)
// ---------------------------------------------------------------------------

function parseJson(raw: string, label: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new PackageFormError(`${label} is not valid JSON.`);
  }
}

export function parseArray(raw: string, label: string): unknown[] {
  if (!raw.trim()) return [];
  const value = parseJson(raw, label);
  if (!Array.isArray(value)) throw new PackageFormError(`${label} must be a JSON list.`);
  return value;
}

/** Blank -> undefined; otherwise a non-negative integer (days, nights, route nights). */
export function parseCount(raw: unknown, label: string): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === "number") {
    if (Number.isSafeInteger(raw) && raw >= 0) return raw;
    throw new PackageFormError(`${label} must be a whole number, 0 or more.`);
  }
  if (typeof raw !== "string") throw new PackageFormError(`${label} must be a whole number, 0 or more.`);
  const s = raw.trim();
  if (!s) return undefined;
  if (!/^\d+$/.test(s) || !Number.isSafeInteger(Number(s))) {
    throw new PackageFormError(`${label} must be a whole number, 0 or more.`);
  }
  return Number(s);
}

/** JSON string array -> trimmed items, empty ones dropped. */
export function parseTextList(raw: string, label: string): string[] {
  const out: string[] = [];
  for (const item of parseArray(raw, label)) {
    if (typeof item !== "string") throw new PackageFormError(`${label} must be a list of text.`);
    const t = item.trim();
    if (t) out.push(t);
  }
  return out;
}

/** JSON `[{city,nights}]` -> `[{CITY,NIGHTS}]`; city required, nights blank -> 0. */
export function parseRoute(raw: string): { CITY: string; NIGHTS: number }[] {
  return parseArray(raw, "Route").map((stop, i) => {
    if (typeof stop !== "object" || stop === null || Array.isArray(stop)) {
      throw new PackageFormError(`Route stop ${i + 1} must be an object with a city and nights.`);
    }
    const { city, nights } = stop as { city?: unknown; nights?: unknown };
    const name = typeof city === "string" ? city.trim() : "";
    if (!name) throw new PackageFormError(`Route stop ${i + 1} needs a city.`);
    return { CITY: name, NIGHTS: parseCount(nights, `Route stop ${i + 1} nights`) ?? 0 };
  });
}

/** JSON string array -> only known include options, de-duplicated, order kept. */
export function parseIncludes(raw: string): string[] {
  const known = new Set<string>(INCLUDE_OPTIONS);
  const out: string[] = [];
  for (const item of parseArray(raw, "Includes")) {
    if (typeof item === "string" && known.has(item) && !out.includes(item)) out.push(item);
  }
  return out;
}

/**
 * JSON string array of retained gallery filenames. Stricter than the text
 * lists: a blank value is an error, not "keep nothing", so a client bug can't
 * silently wipe the gallery (send `[]` to remove everything).
 */
export function parseKeepGallery(raw: string): string[] {
  const value = parseJson(raw, "keepGallery");
  if (!Array.isArray(value)) throw new PackageFormError("keepGallery must be a JSON list.");
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") throw new PackageFormError("keepGallery must be a list of filenames.");
    out.push(item);
  }
  return out;
}

// Shared with the promo-code routes, so it lives in lib/upload; re-exported here.
export { isImageFile };

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

/**
 * New gallery = retained files that really exist on the package (in the
 * order given) followed by the newly uploaded ones. With no `keep` list the
 * uploads are simply appended to what's there.
 */
export function mergeGallery(current: string[], keep: string[] | undefined, added: string[]): string[] {
  if (keep === undefined) return [...current, ...added];
  const existing = new Set(current);
  const kept: string[] = [];
  for (const name of keep) {
    if (existing.has(name) && !kept.includes(name)) kept.push(name);
  }
  return [...kept, ...added];
}

// ---------------------------------------------------------------------------
// Form parsing
// ---------------------------------------------------------------------------

/** String value of a text part; undefined when the key is absent. */
export function readText(form: FormData, key: string): string | undefined {
  if (!form.has(key)) return undefined;
  const v = form.get(key);
  if (typeof v !== "string") throw new PackageFormError(`${key} must be text.`);
  return v;
}

export function readFlag(form: FormData, key: string): "Y" | "N" | undefined {
  const v = readText(form, key)?.trim();
  if (!v) return undefined; // blank behaves like absent: default on create, unchanged on update
  if (v !== "Y" && v !== "N") throw new PackageFormError(`${key} must be "Y" or "N".`);
  return v;
}

/** The non-empty File in a part, if any (an empty <input type=file> submits a zero-byte part). */
export function filePart(v: FormDataEntryValue | null): File | undefined {
  return v !== null && typeof v !== "string" && v.size > 0 ? v : undefined;
}

/**
 * Validates and maps every non-file field. Pure (no I/O) so it can be unit
 * tested. Create applies the defaults (empty lists, SHOW_ON_HOME/IS_ACTIVE
 * "Y") and never produces `unset`; update only touches keys present in the form.
 */
export function parseScalarFields(form: FormData, mode: FormMode): PackageChanges {
  const create = mode === "create";
  const set: Record<string, unknown> = {};
  const unset: string[] = [];
  /** Blank optional value: remove the field on update, just omit it on create. */
  const clear = (field: string) => {
    if (!create) unset.push(field);
  };

  // Required basics. Create demands all three; update rejects blanking them.
  const title = readText(form, "title")?.trim();
  const cityId = readText(form, "cityId")?.trim();
  const amountRaw = readText(form, "amount")?.trim();
  if (create && (!title || !cityId || !amountRaw)) {
    throw new PackageFormError("Title, City and Amount are required.");
  }
  if (title !== undefined) {
    if (!title) throw new PackageFormError("Title cannot be empty.");
    set.TITLE_NAME = title;
  }
  if (cityId !== undefined) {
    if (!cityId) throw new PackageFormError("City cannot be empty.");
    set.CITY_ID = cityId;
  }
  if (amountRaw !== undefined) {
    const amount = amountRaw ? Number(amountRaw) : NaN;
    if (!Number.isFinite(amount) || amount < 0) {
      throw new PackageFormError("Amount must be a number, 0 or more.");
    }
    set.PKG_AMOUNT = amount;
  }

  // Description is stored as given (the form sends plain text).
  const desc = readText(form, "desc");
  if (desc !== undefined) set.PKG_DESC = desc;
  else if (create) set.PKG_DESC = "";

  const isActive = readFlag(form, "isActive");
  if (isActive) set.IS_ACTIVE = isActive;
  else if (create) set.IS_ACTIVE = "Y";

  const showOnHome = readFlag(form, "showOnHome");
  if (showOnHome) set.SHOW_ON_HOME = showOnHome;
  else if (create) set.SHOW_ON_HOME = "Y";

  // Optional text: blank clears.
  for (const [key, field] of [
    ["priceNote", "PRICE_NOTE"],
    ["cancellationPolicy", "CANCELLATION_POLICY"],
  ] as const) {
    const v = readText(form, key)?.trim();
    if (v === undefined) continue;
    if (v) set[field] = v;
    else clear(field);
  }

  const tourType = readText(form, "tourType")?.trim();
  if (tourType !== undefined) {
    if (!tourType) clear("TOUR_TYPE");
    else if (!(TOUR_TYPES as readonly string[]).includes(tourType)) {
      throw new PackageFormError(`Tour type must be one of: ${TOUR_TYPES.join(", ")}.`);
    } else set.TOUR_TYPE = tourType;
  }

  for (const [key, field, label] of [
    ["durationDays", "DURATION_DAYS", "Duration (days)"],
    ["durationNights", "DURATION_NIGHTS", "Duration (nights)"],
  ] as const) {
    const raw = readText(form, key);
    if (raw === undefined) continue;
    const n = parseCount(raw, label);
    if (n === undefined) clear(field);
    else set[field] = n;
  }

  // JSON lists. Absent: default [] on create, untouched on update.
  const route = readText(form, "route");
  if (route !== undefined) set.ROUTE = parseRoute(route);
  else if (create) set.ROUTE = [];

  const includes = readText(form, "includes");
  if (includes !== undefined) set.INCLUDES = parseIncludes(includes);
  else if (create) set.INCLUDES = [];

  for (const [key, field] of LIST_FIELDS) {
    const raw = readText(form, key);
    if (raw !== undefined) set[field] = parseTextList(raw, key);
    else if (create) set[field] = [];
  }

  return { set, unset };
}

/** Validates the file parts (type checks, required cover on create). Pure. */
export function readUploads(form: FormData, mode: FormMode): PackageUploads {
  const image = filePart(form.get("image"));
  if (mode === "create" && !image) throw new PackageFormError("Package image is required.");
  if (image && !isImageFile(image)) throw new PackageFormError("Package image must be an image file.");

  const gallery: File[] = [];
  for (const part of form.getAll("gallery")) {
    const file = filePart(part);
    if (!file) continue;
    if (!isImageFile(file)) throw new PackageFormError(`Gallery file "${file.name}" must be an image.`);
    gallery.push(file);
  }

  const brochure = filePart(form.get("brochure"));
  if (brochure && !isPdfFile(brochure)) throw new PackageFormError("Brochure must be a PDF file.");

  return { image, gallery, brochure };
}

/**
 * Parses and validates the whole package form, saves its uploaded files and
 * returns the field changes. Everything is validated before the first file is
 * written, so a 400 never leaves orphaned uploads behind.
 *
 * `currentGallery` is the stored GALLERY (update only); `keepGallery` is
 * intersected with it so a client can never keep a filename the package
 * didn't have. Replaced or removed files are not deleted from disk.
 */
export async function parsePackageForm(
  form: FormData,
  opts: { mode: FormMode; currentGallery?: string[] }
): Promise<PackageChanges> {
  const { mode } = opts;
  const changes = parseScalarFields(form, mode);
  const uploads = readUploads(form, mode);
  const keepRaw = readText(form, "keepGallery");
  const keep = keepRaw === undefined ? undefined : parseKeepGallery(keepRaw);

  // ---- validation done; nothing above touches the disk ----
  const { set, unset } = changes;

  if (uploads.image) set.PKG_IMAGE = await saveAdminUpload(uploads.image, "pkgTitleImg");

  const added: string[] = [];
  for (const file of uploads.gallery) added.push(await saveAdminUpload(file, "pkgGallery"));
  if (mode === "create") set.GALLERY = added;
  else if (keep !== undefined || added.length > 0) {
    set.GALLERY = mergeGallery(opts.currentGallery ?? [], keep, added);
  }

  if (uploads.brochure) {
    // saveAdminUpload derives the extension from the MIME type, so a PDF
    // accepted by its ".pdf" name alone (blank/odd MIME) needs the right type.
    const pdf =
      uploads.brochure.type === "application/pdf"
        ? uploads.brochure
        : new File([uploads.brochure], "brochure.pdf", { type: "application/pdf" });
    set.BROCHURE = await saveAdminUpload(pdf, "pkgBrochure");
  } else if (mode === "update" && readText(form, "removeBrochure") === "1") {
    unset.push("BROCHURE");
  }

  return { set, unset };
}

/** Mongo update document for `findOneAndUpdate`: only non-empty operators. */
export function toUpdateDoc({ set, unset }: PackageChanges): Record<string, unknown> {
  const doc: Record<string, unknown> = {};
  if (Object.keys(set).length > 0) doc.$set = set;
  if (unset.length > 0) doc.$unset = Object.fromEntries(unset.map((field) => [field, 1]));
  return doc;
}

/** `req.formData()` that reports an unreadable / truncated body as a form error. */
export async function readForm(req: Request): Promise<FormData> {
  try {
    return await req.formData();
  } catch {
    throw new PackageFormError("Could not read the upload — the form data was invalid or too large.");
  }
}

/** 400 response for a `PackageFormError` (or a rejected `UploadError`); anything else is rethrown. */
export function formErrorResponse(e: unknown): Response {
  if (e instanceof PackageFormError || e instanceof UploadError) return Response.json({ error: e.message }, { status: 400 });
  throw e;
}
