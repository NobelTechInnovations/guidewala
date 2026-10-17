# Rich tour packages, image fix, home toggles & cancellation policy — design

Date: 2026-10-16 · Status: approved in chat

## Goal

Make `/packages/[pkgId]` a full tour-detail page in the style of Veena World's
package page, give admins a form that captures that detail, let admins pick
which packages appear on the home page and which itinerary items are shown,
fix images that don't display, and publish the 30% cancellation rule.

Out of scope (explicitly declined): departure-date calendar, seat
availability, reviews, EMI.

## 1. Image fix

### Root causes (verified against production on 2026-10-16)

1. Production sets `NEXT_PUBLIC_IMG_BASE=https://www.guidewala.co.in/`, so
   pages pass absolute URLs to `next/image`. `www.guidewala.co.in` is not in
   `images.remotePatterns`, so `/_next/image` answers **400 "url" parameter
   is not allowed** for every package/coupon image, including fresh uploads.
2. With a relative URL, the optimizer still answers **400 "isn't a valid
   image"** for files written to `public/` after `next build` — Next only
   knows about public files present at build/start time.
3. Legacy files (`pkg-1701….png`, `Itin-….png`) 404 — they lived only on the
   retired server. They must be re-uploaded; the UI must degrade gracefully.

### Fix

- `src/lib/media.ts`
  - `UPLOAD_ROOT` = `process.env.UPLOAD_DIR` or `<cwd>/public/img` (unchanged
    location by default; can be moved outside the app folder so redeploys
    can't wipe uploads).
  - `mediaPath(dir, file)` → `/uploads/<dir>/<file>` (relative, for pages).
  - `mediaUrl(dir, file)` → absolute `${NEXT_PUBLIC_SITE_URL}/uploads/...`
    (for the mobile JSON API).
  - `mediaExists(dir, file)` → server-side `fs` existence check, so pages and
    admin APIs can return `null` for missing files.
- `saveAdminUpload` writes into `UPLOAD_ROOT/<dir>`.
- Route handler `src/app/uploads/[...path]/route.ts` streams the file from
  `UPLOAD_ROOT` with the right `Content-Type` and a long cache header;
  rejects path traversal; 404 otherwise. `/uploads/` is already treated as a
  public asset by `middleware.ts`.
- Every `<Image>` showing an uploaded file gets `unoptimized`.
- All `IMG_BASE` string-building for package, itinerary and promo-code images
  is replaced by the helpers (book-guide, package page, FeaturedTours,
  coupons page, CouponsSection, admin & vendor lists, public JSON APIs).
- Missing image → a styled placeholder (gradient + icon + title) on public
  pages and a "Missing image — re-upload" tag in admin.

## 2. Data model (additive, all optional)

`PackageTitleMaster` (`package_title_master`) new fields:

| Field | Type | Notes |
|---|---|---|
| `DURATION_DAYS`, `DURATION_NIGHTS` | Number | "8D / 7N" badge |
| `ROUTE` | `[{ CITY: String, NIGHTS: Number }]` | route chips |
| `TOUR_TYPE` | String | `Private Tour` / `Group Tour` / `Guide Only` |
| `PRICE_NOTE` | String | e.g. "per person on twin sharing" |
| `GALLERY` | `[String]` | filenames in `pkgGallery/` |
| `INCLUDES` | `[String]` | subset of `Hotel, Meals, Transport, Sightseeing, Guide, Flight` |
| `HIGHLIGHTS`, `INCLUSIONS`, `EXCLUSIONS` | `[String]` | |
| `DOCUMENTS`, `THINGS_TO_CARRY`, `NOTES` | `[String]` | "Need to know" |
| `BROCHURE` | String | PDF filename in `pkgBrochure/` |
| `CANCELLATION_POLICY` | String | blank = site default |
| `SHOW_ON_HOME` | `"Y"`/`"N"` | missing = shown |

`PackageDescDetails` (`package_desc_details`) new fields:

| Field | Type | Notes |
|---|---|---|
| `DAY_NO` | Number | blank = not day-wise |
| `MEALS` | `[String]` | subset of `Breakfast, Lunch, Dinner` |
| `STAY` | String | overnight location/hotel |
| `IS_ACTIVE` | `"Y"`/`"N"` | missing = shown |

Ordering: `DAY_NO` ascending (items without a day after those with one),
then `ID` ascending.

Backward compatibility: legacy documents have none of these fields; every
reader treats missing as empty / shown. Public JSON API responses only gain
keys. `PKG_DESC` stays HTML-or-text (see 3).

Shared constants/types live in `src/lib/packages.ts` (include options, meal
options, tour types, list (de)serialisers, `isShown()` helpers, the
`activeFilter` query fragment `{ $ne: "N" }`).

## 3. Admin

### Package form (`PackageForm`, new + edit)

Sectioned single page (cards with headings):

1. **Basics** — title*, city*, amount*, price note, status, Show on Home.
2. **Trip info** — days, nights, tour type, route (repeatable rows: city +
   nights, add/remove), "Tour includes" checkboxes.
3. **Overview** — description as plain text. Legacy HTML is converted to text
   for editing (tags stripped, `&nbsp;` decoded, `<p>`/`<br>` → newlines);
   saved as text. Renderer: HTML if it contains tags, else paragraphs.
4. **Media** — cover image (required on create), gallery (multi-upload,
   thumbnails with remove), brochure PDF (upload / remove).
5. **Highlights & inclusions** — Highlights, Inclusions, Exclusions as
   one-item-per-line textareas.
6. **Need to know** — Documents required, Things to carry, Important notes
   (one per line).
7. **Cancellation policy** — textarea; placeholder shows the default; blank
   uses the default.

API: `POST /api/admin/packages`, `PUT /api/admin/packages/[id]` accept the
new fields in the same multipart form (lists as JSON strings; `gallery`
files appended, `keepGallery` JSON list of retained filenames,
`removeBrochure`). `PATCH /api/admin/packages/[id]` with JSON
`{ showOnHome: "Y"|"N" }` for the instant toggle. Admin `GET` responses add
`imageMissing: boolean` to each package / itinerary item (from
`mediaExists`) so the UI can tag files that need re-uploading.

### Package list

Card shows a **Show on Home** switch (instant PATCH) and a missing-image tag.

### Itinerary page

- Header shows the package's Show on Home switch.
- Form adds Day number, Meals checkboxes, Overnight stay.
- Each item shows Day badge, meals, stay, and a **Shown on site** switch
  (`PATCH /api/admin/itinerary/[id]` JSON `{ isActive }`).
- Description edited as plain text (same legacy-HTML conversion).

## 4. Public package page `/packages/[pkgId]`

Server component; small client components for gallery lightbox, section
tabs and itinerary accordion.

1. Breadcrumb.
2. **Gallery header** — large cover + up to 4 thumbnails, "+N photos" opens a
   lightbox; placeholder when no images exist.
3. **Title block** — tour-type and duration badges, title, city, route chips
   (`Jaipur 2N → Pushkar 1N`), "View day-wise itinerary" anchor.
4. **Sticky price card** (desktop right column) — "Starts from ₹X" + price
   note, Book Now (scrolls to form), WhatsApp enquiry, Download brochure
   (if any), one-line cancellation summary.
5. **Tour includes** icon row + **Tour highlights** list.
6. **Sticky section nav** — Itinerary · Tour Information · Need to Know ·
   Cancellation Policy (only sections with content).
7. **Itinerary** — if any shown item has `DAY_NO`: day-wise accordion
   ("Day 1 · Title", meals icons, stay, image, description; first day open,
   expand/collapse all). Otherwise "Places you'll visit" grid.
8. **Tour information** — Inclusions / Exclusions tabs. If both empty, the
   current universal inclusions are shown.
9. **Need to know** — Documents / Things to carry / Notes lists.
10. **Cancellation policy & payment terms** — policy text (package override or
    default) + existing GPay/UPI payment note.
11. **Booking form** (existing `GuideBookingForm`) with a policy line above
    Confirm Booking.
12. **More in {city}** related packages.
13. **Mobile** — sticky bottom bar: price + Book Now.

Only shown itinerary items are rendered. Public JSON API
`/api/packages/[pkgId]` adds the new fields and filters hidden items.

## 5. Home page, policy, Dekho Rajasthan

- `FeaturedTours` queries `SHOW_ON_HOME: { $ne: "N" }`; `/api/packages`
  gains `showOnHome` per package (the list itself is unchanged for the
  mobile Book-Guide screen).
- Default policy (`src/lib/policies.ts`): "If a booking is cancelled after
  confirmation, 30% of the booking amount is non-refundable and will be
  deducted as cancellation charges. The remaining 70% will be refunded."
  Shown on every package page, above Confirm Booking, and replaces the
  Cancellation & Refunds / Payment Policy text on Terms & Conditions.
- `scripts/seed-dekho-rajasthan.ts` copies the hardcoded content of
  `/tour-packages/dekho-rajasthan` into package 19 (fields + 8 day-wise
  items; the old "click for PDF" item set to hidden). Takes the target DB
  from `MONGODB_URI`. Running it against production needs explicit
  approval. After it has run in production, the special-case slide in
  `FeaturedTours` is removed and `/tour-packages/dekho-rajasthan` redirects
  to `/packages/19`; until then both stay as they are.

## 6. Verification

- Copy `guidewala_app` → `guidewala_app_dev` (same cluster) and point local
  `.env.local` at the dev DB while testing.
- Browser checks: admin create/edit with all sections, gallery & brochure
  upload/remove, itinerary day fields & hide switch, home toggle effect on
  the home carousel, detail page (multi-day and single-day packages, missing
  images, mobile width), T&C text.
- `next build` + `next start`: upload an image after the build and confirm it
  renders on the public page (the production failure mode).
- `npm run lint` and `tsc --noEmit` clean.
