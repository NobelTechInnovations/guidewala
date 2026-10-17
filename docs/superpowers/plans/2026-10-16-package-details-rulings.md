# Rich packages — decisions made during execution

Each: what was decided — why — cost if wrong.

- R0 no commits; per-task review diffs come from tree snapshots (snap.sh/pkg.sh) — repo rule "commit only when asked" beats SDD commit loop — cost if wrong: none (same diff content).
- R1 dev overrides live in .env.development.local, .env.local untouched — nothing to restore, next dev prefers it — cost if wrong: scripts using dotenv(.env.local) would hit live DB (see R6).
- R2 Task 2 also swaps admin packages list + itinerary page img src to mediaPath (minimal) — keeps T2 checkpoint true; T5/T6 restyle later — cost: small overlap.
- R3 Task 2 also swaps package detail page image URLs to existingMediaPath (+UploadedImage) — spec §1 lists it — cost: T7 rewrites it anyway.
- R4 Task 8 passes cancellationPolicyFor(pkg) to GuideBookingForm in packages/[pkgId]/page.tsx — prop doesn't exist until T8 — cost: none.
- R5 htmlToText decodes &nbsp; to an ASCII space — matches the plan's test literal — cost: none.
- R6 seed script refuses without --yes, and if db name is exactly guidewala_app also requires --production; dispatch gives dev command with env from scratchpad/dev.env — prevents live writes — cost: one extra flag for prod run.
- R7 Task 10 build/start run with MONGODB_URI/UPLOAD_DIR/ADMIN_PASSWORD from dev.env exported inline — controller runs it — cost: none.
- R8 implementers verify with npm test, tsc, lint and curl against :3000; controller does the browser checkpoints after each UI task — subagents shouldn't start servers — cost: browser issues found one step later.
- R9 Task 0 done by controller (env + live-DB credential handling, no product code) — cost: no review of env setup.
- R10 home (/) and /coupons are statically prerendered, so admin changes (images, Show on Home) wouldn't appear until rebuild — Task 8 adds on-demand revalidation (revalidatePath) in package/itinerary/promo-code mutation routes — cost if wrong: stale home until next build.
- R11 (supersedes R10) review Important #1 — make `/` and `/coupons` request-time dynamic (Next 16 mechanism per docs) instead of build-time existence checks; Show on Home then needs no revalidatePath — why: build-time stat bakes placeholders, worst with UPLOAD_DIR mounted at runtime — cost if wrong: one DB query per home/coupons request.
- R12 Tasks 5/6 call htmlToText only when looksLikeHtml(value) — double safety against stripping plain text — cost: none.
- R13 Task 4 PUT updates only fields whose multipart keys are present (missing key = unchanged), generalising Review Focus 5 — POST applies defaults — cost: a client that omits a key can't clear it (form always sends all keys).
- R14 Task 4 validates upload types: cover/gallery must be image/*, brochure must be PDF; includes/tourType filtered to the allowed option lists; blank numeric fields are unset — spec silent, prevents junk data — cost: none.
- R15 Task 5 raises proxyClientMaxBodySize to 40mb per Next docs — middleware buffers bodies at 10MB, gallery uploads can exceed — cost: larger request bodies accepted on all routes.
- R16 allow export-keyword-only change in packages/fields.ts so itinerary/fields.ts imports readText/readFlag/parseArray/filePart (overrides my "don't modify fields.ts" dispatch line) — removes verbatim duplication — cost: none.

## Deferred minor items (triaged "can wait" by final review)

- Task 1: minor (deferred): route buffers (readFile) instead of streaming; no Range support.
- Task 1: minor (deferred): no positive-path tests for mediaExists/existingMediaPath; no route handler test.
- Task 1: minor (deferred): mediaUrl test doesn't exercise NEXT_PUBLIC_SITE_URL set/unset branches.
- Task 1: minor (deferred): unreachable startsWith guard comment media.server.ts:121.
- Task 2: minor (deferred): UploadedImage forces unoptimized on curated /assets slides (gate on src.startsWith("/uploads/")).
- Task 2: minor (deferred): public API `image` may now be null for empty filename; base URL now NEXT_PUBLIC_SITE_URL only — tell user (mobile app).
- Task 2: minor (deferred): no UploadedImage/null-path tests (no component test setup).
- Task 2: minor (deferred): sync fs.statSync per image on dynamic pages.
- Task 3: minor (deferred): htmlToText attr values containing ">" break stripping.
- Task 3: minor (deferred): whitespace-only lines survive (<p>&nbsp;</p> → " " lines; trailing spaces before \n).
- Task 3: minor (deferred): CRLF not normalized before collapse.
- Task 3: minor (deferred): <br class="x"> not recognized.
- Task 3: minor (deferred): opening block tags add no break (spec-literal).
- Task 3: minor (deferred): numeric/named entities beyond six left raw (&#039; &rsquo; ...).
- Task 3: minor (deferred): test gaps for above edge cases.
- Task 3: minor (deferred): PackageDoc.PKG_ID/ItineraryDoc.ID required vs schema optional.
- Task 3: minor (deferred): durationLabel signature doesn't accept null.
- Task 3: minor (deferred): "a <b and c> d" plain text still read as a tag by both helpers (consistent with looksLikeHtml).
- Task 4: minor (deferred): desc stored with \r\n from multipart; renderers split on /\r?\n/; htmlToText collapse misses \r\n (see T3 minor).
- Task 4: minor (deferred): upload.ts keeps user extension for images (no-ext or .svg served oddly).
- Task 4: minor (deferred): DELETE [id] Number(id) unguarded (cast 500 on non-numeric).
- Task 4: minor (deferred): next.config CORS Allow-Methods lacks PATCH.
- Task 4: minor (deferred): route handlers lack automated tests.
- Task 5: minor (deferred): no client-side total upload size guard vs 40MB cap.
- Task 5: minor (deferred): HomeToggle switches share accessible name "Show on Home".
- Task 5: minor (deferred): Remove brochure stays ticked after picking new PDF (cosmetic).
- Task 5: minor (deferred): nightsCls via inputCls.replace fragile.
- Task 6: minor (deferred): itinerary DELETE Number(id) unguarded (cast 500).
- Task 6: minor (deferred): client dayNo regex stricter than server ("01").
- Task 6: minor (deferred): looksLikeHtml?htmlToText ternary duplicated (edit page + itinerary page) — shared plainText() optional.
- Task 6: minor (deferred): no tests for imageMissing / PATCH handler.
- Task 7: minor (deferred): API dayNo returns 0/negative as-is (use hasDayNo).
- Task 7: minor (deferred): TourIncludes empty card if INCLUDES only unknown values and no highlights.
- Task 7: minor (deferred): PlacesGrid placeholder repeats title (label + alt + h3).
- Task 7: minor (deferred): "N days" counts items not distinct days.
- Task 7: minor (deferred): duplicate h2 "Book this tour" above form's h2.
- Task 7: minor (deferred): InfoTabs no Home/End, tabpanels no tabIndex.
- Task 7: minor (deferred): lightbox scroll lock layout shift.
- Task 7: minor (deferred): "+N photos" (6+ images) untested in browser.
- Task 8: minor (deferred): booking note renders custom policy as plain text — HTML policy would show raw tags (pass htmlToText).
- Task 8: minor (deferred): long custom policy pushes Confirm button down (clamp optional).
- Task 9: minor (deferred): seed hides legacy item before inserting days (crash midway leaves no visible itinerary; rerun fixes).
- Task 9: minor (deferred): seed doesn't print TITLE_NAME of pkg 19 before writing.
- Task 9: minor (deferred): --production guard branch untested.
- Task 9: minor (deferred): content to confirm with user — inferred meals days 4/5/7, TOUR_TYPE "Group Tour" vs "Private Tour", NOTES wording.
