# Rich Tour Packages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Veena World–style package detail page, a matching admin form, home/itinerary visibility toggles, the 30% cancellation policy, and working uploaded images.

**Architecture:** Additive optional fields on the existing `PackageTitleMaster` / `PackageDescDetails` Mongoose models; pure helpers in `src/lib/packages.ts` + `src/lib/media.ts` (client-safe) and `src/lib/media.server.ts` (fs); uploads served by a `/uploads/[...path]` route handler and rendered with `unoptimized`. Public page stays a server component with three small client islands.

**Tech Stack:** Next.js 16.3 (App Router, webpack build), React 19, Mongoose 9, Tailwind 4, react-icons, Node 26 built-in test runner via `tsx --test`.

**Spec:** `docs/superpowers/specs/2026-10-16-package-details-design.md`

## Global Constraints

- Repo rule: no commits or pushes without the user's go-ahead. Work on branch `feature/rich-packages`; "Checkpoint" steps mean run checks, not commit.
- Local `.env.local` `MONGODB_URI` must point at `guidewala_app_dev` while testing — never write to `guidewala_app`.
- Default policy copy (verbatim): "If a booking is cancelled after confirmation, 30% of the booking amount is non-refundable and will be deducted as cancellation charges. The remaining 70% will be refunded."
- Missing `SHOW_ON_HOME` / `IS_ACTIVE` = shown. Query fragment `{ $ne: "N" }`.
- Include options: `Hotel, Meals, Transport, Sightseeing, Guide, Flight`. Meal options: `Breakfast, Lunch, Dinner`. Tour types: `Private Tour, Group Tour, Guide Only`.
- Upload dirs: `pkgTitleImg`, `pkgItinImg`, `pkgGallery`, `pkgBrochure`, `PromoCode`.
- Public JSON APIs only gain keys; existing keys keep their meaning.
- Before touching any Next API, check the installed docs under `node_modules/next/dist/docs/` (AGENTS.md).

## Review Focus

1. Legacy package with none of the new fields (e.g. #12 Delhi) must render exactly like a sensible single-day tour — no empty headings/tabs. → Task 7 check.
2. Uploaded filename that no longer exists on disk → placeholder, never a broken `<img>`. → Task 2 test + Task 7 check.
3. `/uploads/..%2F..%2F.env.local` and similar traversal → 404. → Task 1 test.
4. Editing a legacy HTML description (`<p>Dekho Rajasthan&nbsp; 7 Nights…</p>`) shows clean text and saves without losing paragraphs or links' text. → Task 3 test.
5. Edit form saved without touching the gallery keeps existing gallery/brochure. → Task 4 check.

---

### Task 0: Environment

- [ ] `git switch -c feature/rich-packages`; `npm install`.
- [ ] Copy DB: one-off script in the session scratchpad (not the repo) that reads every collection from `guidewala_app` and `insertMany`s into `guidewala_app_dev` (drop dev collections first). Expected: counts match per collection.
- [ ] Point `.env.local` `MONGODB_URI` at `/guidewala_app_dev` (keep the prod URI commented on the line above for restore).
- [ ] Add `"test": "tsx --test \"src/**/*.test.ts\""` to `package.json` scripts. Run `npm test` → "tests 0".

### Task 1: Media helpers + uploads route

**Files:** Create `src/lib/media.ts`, `src/lib/media.server.ts`, `src/lib/media.test.ts`, `src/app/uploads/[...path]/route.ts`. Modify `src/lib/upload.ts`.

**Interfaces — Produces:**
- `media.ts` (client-safe): `type UploadDir = "pkgTitleImg" | "pkgItinImg" | "pkgGallery" | "pkgBrochure" | "PromoCode"`; `mediaPath(dir: UploadDir, file?: string | null): string | null` → `/uploads/<dir>/<encodeURIComponent(file)>` or `null` when file empty; `mediaUrl(dir, file): string | null` → `${NEXT_PUBLIC_SITE_URL ?? ""}` + path.
- `media.server.ts`: `UPLOAD_ROOT: string` (`process.env.UPLOAD_DIR` or `path.join(cwd, "public", "img")`); `resolveUploadPath(segments: string[]): string | null` (null if any segment is empty, `.`, `..`, contains `/` or `\`, or first segment isn't an `UploadDir`); `mediaExists(dir, file): boolean`; `existingMediaPath(dir, file): string | null` (path only if the file exists); `contentTypeFor(file: string): string` (jpg/jpeg/png/webp/gif/svg/avif/pdf, else `application/octet-stream`).
- `saveAdminUpload(file, dir: UploadDir)` writes into `UPLOAD_ROOT/<dir>`.

- [ ] **Test** `media.test.ts`: `mediaPath("pkgTitleImg","a b.jpg") === "/uploads/pkgTitleImg/a%20b.jpg"`; `mediaPath("pkgTitleImg","") === null`; `resolveUploadPath(["pkgTitleImg","..",".env.local"]) === null`; `resolveUploadPath(["etc","passwd"]) === null`; `resolveUploadPath(["pkgTitleImg","x.jpg"]) === path.join(UPLOAD_ROOT,"pkgTitleImg","x.jpg")`; `contentTypeFor("b.PDF") === "application/pdf"`.
- [ ] Run `npm test` → FAIL (module missing). Implement. Run → PASS.
- [ ] Route `GET`: `resolveUploadPath` → `fs.stat` → stream with `Content-Type`, `Cache-Control: public, max-age=31536000, immutable`; else 404.
- [ ] Checkpoint: `curl -I localhost:3000/uploads/pkgTitleImg/<existing>` → 200 image/*; `/uploads/pkgTitleImg/..%2F..%2F..%2F.env.local` → 404.

### Task 2: Use helpers everywhere + placeholder

**Files:** Create `src/components/UploadedImage.tsx`. Modify `src/app/book-guide/page.tsx`, `src/components/home/FeaturedTours.tsx`, `src/components/home/CouponsSection.tsx`, `src/app/coupons/page.tsx`, `src/app/api/packages/route.ts`, `src/app/api/packages/[pkgId]/route.ts`, `src/app/api/coupons/route.ts`, `src/app/admin/(app)/promo-codes/page.tsx`, `src/app/vendor/(app)/promo-codes/page.tsx`, `src/components/home/ToursCarousel.tsx`.

**Interfaces — Produces:** `<UploadedImage src: string | null; alt: string; sizes: string; className?: string; placeholderLabel?: string />` — `fill` + `unoptimized` next/image when `src`; else gradient (`from-gw-brand/80 to-slate-900`) block with a map icon and `placeholderLabel`. Parent supplies the positioned box.

- [ ] Server pages use `existingMediaPath`; JSON APIs use `mediaUrl` (keep key names). Remove every `IMG_BASE` constant listed in the spec. `ToursCarousel` slide `img` becomes `string | null` rendered through `UploadedImage` (curated `/assets/...` slides keep working because they're non-null paths).
- [ ] Checkpoint: `grep -rn IMG_BASE src` → only guide/vendor-photo code that still uses the remote host (none expected for packages/coupons). Book-guide page for Delhi shows placeholder (legacy file missing), Bikaner shows its photo.

### Task 3: Shared package helpers + model fields

**Files:** Create `src/lib/packages.ts`, `src/lib/packages.test.ts`, `src/lib/policies.ts`. Modify `src/models/PackageTitleMaster.ts`, `src/models/PackageDescDetails.ts`.

**Interfaces — Produces:**
- Constants `INCLUDE_OPTIONS`, `MEAL_OPTIONS`, `TOUR_TYPES` (Global Constraints values), `SHOWN = { $ne: "N" }`.
- `linesToList(text: string): string[]` (split `\n`, trim, drop empty); `listToLines(list?: string[]): string`.
- `htmlToText(html?: string): string` — `<br>` and `</p>`/`</div>`/`</li>` → `\n`, strip tags, decode `&nbsp; &amp; &lt; &gt; &quot; &#39;`, collapse 3+ newlines to 2, trim.
- `looksLikeHtml(s: string): boolean` (`/<[a-z][\s\S]*>/i`).
- `sortItinerary<T extends { DAY_NO?: number | null; ID: number }>(items: T[]): T[]` (with day first by day, then ID).
- `durationLabel(days?: number, nights?: number): string` → `"8D / 7N"`, `"1 Day"` when only days=1, `""` when none.
- Types `PackageDoc`, `ItineraryDoc` mirroring the schemas.
- `policies.ts`: `DEFAULT_CANCELLATION_POLICY` (verbatim copy), `cancellationPolicyFor(pkg: { CANCELLATION_POLICY?: string }): string`.
- Schema fields exactly as the spec tables (`ROUTE: [{ CITY: String, NIGHTS: Number, _id: false }]`).

- [ ] **Test** `packages.test.ts`: `htmlToText("<p>Dekho Rajasthan&nbsp; 7 Nights and 8 Days</p><p><br></p><p><br></p>") === "Dekho Rajasthan  7 Nights and 8 Days"`; `linesToList(" a \n\n b ") → ["a","b"]`; `sortItinerary([{ID:3},{ID:1,DAY_NO:2},{ID:2,DAY_NO:1}]).map(i=>i.ID) → [2,1,3]`; `durationLabel(8,7) === "8D / 7N"`; `durationLabel() === ""`; `cancellationPolicyFor({}) === DEFAULT_CANCELLATION_POLICY`; `cancellationPolicyFor({CANCELLATION_POLICY:"  "}) === DEFAULT_CANCELLATION_POLICY`.
- [ ] `npm test` FAIL → implement → PASS.

### Task 4: Admin package API

**Files:** Modify `src/app/api/admin/packages/route.ts`, `src/app/api/admin/packages/[id]/route.ts`. Create `src/app/api/admin/packages/fields.ts`.

**Interfaces:**
- Consumes Task 1 `saveAdminUpload`, `mediaExists`; Task 3 helpers.
- Produces `parsePackageForm(form: FormData): Promise<Record<string, unknown>>` in `fields.ts` covering every new field. Multipart keys: `title, cityId, amount, desc, isActive, showOnHome, priceNote, tourType, durationDays, durationNights, route` (JSON `[{city,nights}]`), `includes, highlights, inclusions, exclusions, documents, thingsToCarry, notes` (JSON string arrays), `cancellationPolicy`, `image` (File), `gallery` (File[] via `getAll`), `keepGallery` (JSON filenames), `brochure` (File), `removeBrochure` ("1").
- `GET /api/admin/packages` and `GET /api/admin/packages/[id]` add `imageMissing: boolean`; `[id]` also returns `galleryMissing: string[]`.
- `PATCH /api/admin/packages/[id]` JSON `{ showOnHome: "Y" | "N" }` → `{ pkg }`; 400 on other values.

- [ ] Description saved as text (`desc` already plain from the form). `GALLERY = keepGallery ∩ existing + new uploads`. Brochure: new file replaces; `removeBrochure` clears; neither → unchanged.
- [ ] Checkpoint (dev DB, logged-in cookie): curl `PATCH` toggles and `GET` reflects it; PUT without `gallery`/`keepGallery` keys leaves `GALLERY` unchanged (Review Focus 5 — treat a missing `keepGallery` key as "keep all").

### Task 5: Admin package form, list toggle

**Files:** Modify `src/components/admin/PackageForm.tsx`, `src/components/admin/ui.tsx`, `src/app/admin/(app)/packages/page.tsx`, `src/app/admin/(app)/packages/[id]/edit/page.tsx`, `src/app/admin/(app)/packages/new/page.tsx`. Create `src/components/admin/ListField.tsx` (textarea + "one per line" hint), `src/components/admin/HomeToggle.tsx`.

**Interfaces:**
- `ui.tsx` adds `Toggle({ checked, onChange, label, disabled })` and `Section({ title, description?, children })`.
- `HomeToggle({ pkgId: number; initial: "Y" | "N" })` — optimistic PATCH, reverts + alerts on failure.
- `PackageForm` `initial` becomes `Partial<PackageFormValues>`; `PackageFormValues` exported from `PackageForm.tsx` with one key per multipart field (lists as strings, route as `{city:string;nights:string}[]`, `gallery: string[]`, `brochure: string`). Edit page maps the API doc → values (`htmlToText` for `PKG_DESC`, `listToLines` for lists).
- [ ] Sections per spec §3; cancellation textarea placeholder = `DEFAULT_CANCELLATION_POLICY`.
- [ ] List cards: `UploadedImage` + red "Missing image — re-upload" badge when `imageMissing`; `HomeToggle` under the price.
- [ ] Checkpoint (browser): create a package with every section filled, 2 gallery images and a PDF; edit it, remove one gallery image, save; toggle Show on Home from the list and reload → persists.

### Task 6: Itinerary admin

**Files:** Modify `src/app/api/admin/packages/[id]/itinerary/route.ts`, `src/app/api/admin/itinerary/[id]/route.ts`, `src/app/admin/(app)/packages/[id]/itinerary/page.tsx`.

**Interfaces:** Multipart adds `dayNo` (blank → unset), `meals` (JSON array), `stay`, `isActive`. `GET` returns items through `sortItinerary` with `imageMissing`. `PATCH /api/admin/itinerary/[id]` JSON `{ isActive: "Y" | "N" }`.

- [ ] Page: header `HomeToggle`; form fields Day / Meals checkboxes / Stay; description textarea filled via `htmlToText`; item cards show "Day N" badge, meals, stay, `Toggle` "Shown on site" (hidden items dimmed).
- [ ] Checkpoint: add Day 1/Day 2 items, hide one, reload → order and state persist.

### Task 7: Public package page + API

**Files:** Modify `src/app/packages/[pkgId]/page.tsx`, `src/app/api/packages/[pkgId]/route.ts`. Create `src/components/package/Gallery.tsx` (client: cover + 4 thumbs + lightbox with prev/next/Esc), `src/components/package/SectionNav.tsx` (client: sticky tabs, `IntersectionObserver` active state), `src/components/package/ItineraryDays.tsx` (client: accordion, first open, expand/collapse all), `src/components/package/PlacesGrid.tsx`, `src/components/package/PriceCard.tsx`, `src/components/package/RichText.tsx` (HTML via `dangerouslySetInnerHTML` if `looksLikeHtml`, else `whitespace-pre-line` paragraphs).

**Interfaces:** Page loads package + `SHOWN` itinerary via `sortItinerary`, builds gallery `[cover, ...GALLERY].map(existingMediaPath).filter(Boolean)`. Day-wise iff any shown item has `DAY_NO`. Section nav entries only for sections with content. Public API adds `durationDays, durationNights, route, tourType, priceNote, gallery[], includes, highlights, inclusions, exclusions, documents, thingsToCarry, notes, brochure, cancellationPolicy` and per-item `dayNo, meals, stay`; hidden items filtered.

- [ ] Layout per spec §4 (1–13), brand tokens `gw-brand`, `gw-red`, `gw-yellow`, `font-display`, same container `max-w-7xl mx-auto px-6`. Mobile sticky bar `lg:hidden`. WhatsApp link pattern from `tour-packages/page.tsx` (`919829185267`).
- [ ] Checkpoint (browser, desktop + 375px): #12 Delhi (legacy, placeholder + places grid, no empty sections — Review Focus 1); Task 5 test package (all sections, gallery lightbox, brochure link, accordion); hidden itinerary item absent.

### Task 8: Home toggle, policy copy

**Files:** Modify `src/components/home/FeaturedTours.tsx`, `src/app/api/packages/route.ts`, `src/app/terms-and-conditions/page.tsx`, `src/components/booking/GuideBookingForm.tsx`.

- [ ] FeaturedTours query adds `SHOW_ON_HOME: SHOWN`; `/api/packages` adds `showOnHome` per item.
- [ ] T&C: replace the "Payment Policy" and "Cancellation & Refunds" paragraphs with `DEFAULT_CANCELLATION_POLICY` plus the existing "guide doesn't contact you" paragraph.
- [ ] Booking form: new optional prop `cancellationPolicy: string`; render it as a small note above the submit button ("By confirming you agree to our cancellation policy: …").
- [ ] Checkpoint: toggle a package off → gone from home carousel; T&C shows new copy.

### Task 9: Dekho Rajasthan seed

**Files:** Create `scripts/seed-dekho-rajasthan.ts` (pattern of `scripts/seed-blog.ts`); export the `ITINERARY`/`INCLUSIONS`/route arrays from `src/app/tour-packages/dekho-rajasthan/page.tsx` into `src/app/tour-packages/dekho-rajasthan/content.ts` so page and script share one source.

- [ ] Script upserts package 19 fields (8D/7N, route from `ROUTE`, inclusions/exclusions/highlights from the page) and replaces day items (`DAY_NO` 1–8) — idempotent: deletes package 19's items that have a `DAY_NO` before inserting, sets the legacy PDF item (no `DAY_NO`) `IS_ACTIVE: "N"`. Prints the DB name before writing and refuses unless `--yes` is passed.
- [ ] Run against dev only → `/packages/19` shows the 8-day accordion. Production run + redirect/slide removal wait for the user's approval (spec §5).

### Task 10: Final verification

- [ ] `npm test`, `npm run lint`, `npx tsc --noEmit` → clean.
- [ ] `npm run build && npm start`; upload a new itinerary image in admin **after** the build; it renders on the public page (production failure mode from spec §1).
- [ ] Restore note for user: `.env.local` still points at dev DB; production deploy needs `UPLOAD_DIR` decision and the seed run.
