/**
 * Client-safe helpers/types for the rich package fields — no mongoose, no
 * `fs`, so admin client components can import this. The Mongoose schemas
 * live in src/models/PackageTitleMaster.ts and PackageDescDetails.ts.
 *
 * Every new field is optional: legacy documents have none of them, so
 * readers treat missing as empty / shown.
 */

export const INCLUDE_OPTIONS = ["Hotel", "Meals", "Transport", "Sightseeing", "Guide", "Flight"] as const;
export const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner"] as const;
export const TOUR_TYPES = ["Private Tour", "Group Tour", "Guide Only"] as const;

export type IncludeOption = (typeof INCLUDE_OPTIONS)[number];
export type MealOption = (typeof MEAL_OPTIONS)[number];
export type TourType = (typeof TOUR_TYPES)[number];

/**
 * Mongo filter for the "Y"/"N" visibility flags (SHOW_ON_HOME, IS_ACTIVE):
 * a missing flag counts as shown, so we exclude "N" rather than match "Y".
 */
export const SHOWN = { $ne: "N" } as const;

/** In-memory twin of `SHOWN`: true unless the flag is explicitly "N". */
export function isShown(flag?: string | null): boolean {
  return flag !== "N";
}

export interface RouteStop {
  CITY?: string;
  NIGHTS?: number;
}

/** A package as stored / returned by the JSON APIs (not a Mongoose document). */
export interface PackageDoc {
  // Legacy fields
  PKG_ID: number;
  TITLE_NAME?: string;
  CITY_ID?: string;
  PKG_AMOUNT?: number;
  PKG_IMAGE?: string; // filename in pkgTitleImg/
  IS_ACTIVE?: string;
  CREATED_ON?: Date | string; // Date from Mongoose, ISO string over JSON
  PKG_DESC?: string; // HTML (legacy) or plain text
  // Rich fields
  DURATION_DAYS?: number;
  DURATION_NIGHTS?: number;
  ROUTE?: RouteStop[];
  TOUR_TYPE?: string; // one of TOUR_TYPES
  PRICE_NOTE?: string;
  GALLERY?: string[]; // filenames in pkgGallery/
  INCLUDES?: string[]; // subset of INCLUDE_OPTIONS
  HIGHLIGHTS?: string[];
  INCLUSIONS?: string[];
  EXCLUSIONS?: string[];
  DOCUMENTS?: string[];
  THINGS_TO_CARRY?: string[];
  NOTES?: string[];
  BROCHURE?: string; // filename in pkgBrochure/
  CANCELLATION_POLICY?: string; // blank = site default
  SHOW_ON_HOME?: string; // "Y" | "N", missing = shown
}

/** One itinerary entry (package_desc_details row). */
export interface ItineraryDoc {
  // Legacy fields
  ID: number;
  PKG_ID: number;
  ITINERARY?: string;
  PACKAGE_DESC?: string;
  PKG_IMAGE?: string; // filename in pkgItinImg/
  // Rich fields
  DAY_NO?: number | null; // blank = not day-wise
  MEALS?: string[]; // subset of MEAL_OPTIONS
  STAY?: string; // overnight location/hotel
  IS_ACTIVE?: string; // "Y" | "N", missing = shown
}

/** Textarea value -> list: one item per line, trimmed, blanks dropped. */
export function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** List -> textarea value (inverse of `linesToList`). */
export function listToLines(list?: string[]): string {
  return (list ?? []).join("\n");
}

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/**
 * Legacy PKG_DESC is rich HTML; the admin edits plain text. Block-level
 * closers and <br> become newlines so paragraphs survive, other tags are
 * dropped (link text is kept). Only real tags (`<` or `</` followed by a
 * letter, matching `looksLikeHtml`) and comments are stripped, so plain-text
 * angle brackets like "Kids <5 free, adults >12 pay" survive. Entities are
 * decoded in a single pass, after tag stripping, so `&amp;lt;` stays `&lt;`
 * and an escaped `&lt;b&gt;` isn't mistaken for a tag. `&nbsp;` becomes a
 * normal space.
 */
export function htmlToText(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<!--[\s\S]*?-->/g, "") // first, so markup inside a comment adds no newlines
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity])
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Plain text from the admin form (stored with \r\n) -> paragraphs of lines:
 * a blank line starts a new paragraph, a single newline is a line break.
 * Lines are trimmed; empty input gives [].
 */
export function textToParagraphs(text?: string): string[][] {
  const paragraphs: string[][] = [];
  let current: string[] = [];
  for (const raw of (text ?? "").split(/\r?\n/)) {
    const line = raw.trim();
    if (line) current.push(line);
    else if (current.length > 0) {
      paragraphs.push(current);
      current = [];
    }
  }
  if (current.length > 0) paragraphs.push(current);
  return paragraphs;
}

/**
 * True for legacy HTML (render as HTML), false for the plain text the admin now
 * writes. Every legacy description starts with a tag, so only `<` + letter, `/`
 * or `!` at the very start counts — plain text that merely contains angle
 * brackets ("Pickup <hotel lobby>") stays text and survives an edit round-trip.
 */
export function looksLikeHtml(s: string): boolean {
  return /^\s*<[a-z/!]/i.test(s);
}

/** True for a usable day number (a positive finite number); null/0/NaN mean "not day-wise". */
export function hasDayNo(n?: number | null): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** A package's itinerary is shown day-wise as soon as any (shown) item has a day number. */
export function isDayWise(items: { DAY_NO?: number | null }[]): boolean {
  return items.some((item) => hasDayNo(item.DAY_NO));
}

/**
 * Day-wise entries first by DAY_NO, then entries without a day; ties (and the
 * undayed group) fall back to ID ascending. Returns a new array.
 */
export function sortItinerary<T extends { DAY_NO?: number | null; ID: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aDay = hasDayNo(a.DAY_NO);
    const bDay = hasDayNo(b.DAY_NO);
    if (aDay !== bDay) return aDay ? -1 : 1;
    if (aDay && bDay && a.DAY_NO !== b.DAY_NO) return (a.DAY_NO as number) - (b.DAY_NO as number);
    return a.ID - b.ID;
  });
}

/** "8D / 7N" badge text; "1 Day" / "N Days" when there are no nights; "" with no days. */
export function durationLabel(days?: number, nights?: number): string {
  if (!days || days <= 0) return "";
  if (nights && nights > 0) return `${days}D / ${nights}N`;
  return days === 1 ? "1 Day" : `${days} Days`;
}
