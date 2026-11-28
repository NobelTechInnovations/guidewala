# Guidewala — project handoff (for any Claude account)

Last updated: 2026-11-28. Read this first, then `AGENTS.md`.

## Project
- Next.js **16.3** App Router site + admin panel (`/admin/*`, also `admin.guidewala.co.in` via `src/middleware.ts`), Mongoose 9 on MongoDB Atlas, Tailwind 4, react-icons. Deployed on **Hostinger** (Node.js app, `npm run build` = `next build --webpack`).
- Repo: `github.com/NobelTechInnovations/guidewala`, default branch `main`. All feature PRs (#3, #6, #7, #8) are merged.
- Live site: https://guidewala.co.in. Live DB: `guidewala_app` (URI in `.env.local`).

## Working preferences (from the owner)
- Keep chat replies short; don't burn tokens: no extra reviewer subagents, no long test runs unless asked — write code, run `npx tsc --noEmit`, one quick curl/browser check.
- Ask before writing to the **live** DB, pushing, or opening PRs. Commit only when asked; work on a feature branch.

## Local setup
- `npm install`, then `npm run dev` (or the `guidewala-nextjs` config in `.claude/launch.json`).
- `.env.local` = **live** secrets (gitignored). `.env.development.local` = dev overrides used by `next dev`: `MONGODB_URI` → `guidewala_app_dev` (a copy of live), a local `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`. Never point scripts at `.env.local` unless you mean live.
- Scripts that load dotenv read `.env.local` (live) — export the dev `MONGODB_URI` first. Guarded scripts refuse live writes without `--yes --production`.
- Tests: `npm test` (node:test via tsx, `src/**/*.test.ts`). Typecheck: `npx tsc --noEmit` (`LayoutProps` error before first build is normal).

## What's built (all merged)
- **Images/uploads:** uploads served by `src/app/uploads/[...path]/route.ts` from `UPLOAD_ROOT` (`src/lib/media.server.ts`): `UPLOAD_DIR` env, else `~/guidewala-uploads` in production (survives Hostinger deploys), else `public/img` in dev. `UploadedImage` (unoptimized + placeholder). MIME-allowlisted extensions (`src/lib/upload.ts`).
- **Packages** (`PackageTitleMaster`): rich fields (duration, route, gallery, includes, highlights, inclusions/exclusions, need-to-know, brochure, cancellation override, `SHOW_ON_HOME`), `PKG_TYPE` = `tour` | `guide` (missing = tour), stable `SLUG`. Itinerary (`PackageDescDetails`): `DAY_NO`, `MEALS`, `STAY`, `IS_ACTIVE`.
- **Admin:** Tour Packages + Guide Services (shared `PackageForm`/`PackageList`, guides have no itinerary), Cities, Hotel List (address/contact), Vouchers (`/admin/vouchers`, print page `/admin/voucher-print/[id]`, autofill from bookings), Blog (image upload, Markdown/plain-text content → `src/lib/markdown.ts`), SEO (Settings → SEO).
- **Public:** `/packages/[slug]` Veena-World-style detail page (numeric ids 308 → slug); Book Guide shows guide services; Tour Packages page, Featured Tours, Trending Destinations are DB-driven; 30% cancellation policy (`src/lib/policies.ts`) on package pages, booking form, T&C.
- **SEO:** `sitemap.ts` + `robots.ts` (dynamic), `metadataBase`, every page uses `seoMeta()` (`src/lib/seo.server.ts`) = defaults + admin overrides per path; JSON-LD (Organization/TravelAgency in layout, TouristTrip, BlogPosting, Breadcrumbs, FAQPage); admin footer keyword links; admin FAQs (`FaqSection`); `/llms.txt` (GEO) from DB + admin AI summary.
- **Data changes done on live:** all itinerary items wiped (backup in local `backups/`), Dekho Rajasthan (pkg 19) seeded with 8 days; 14 old packages deleted (backup in `backups/`); blog slug `…what-to-check-2` renamed (old URL redirects).

## Pending / to do
1. Add team photos to `public/assets/img/team/` (`jitender-sain.jpg`, `prateek-kumar-sain.jpg`, `sanjeev-sharma.jpg`) — initials avatars show until then.
2. Re-upload images lost on earlier deploys (admin shows "Missing image" tags) — after the `~/guidewala-uploads` deploy; verify an upload survives a redeploy.
3. Add Guide Services (Book Guide is empty until then) and fill Hotel List address/contact for vouchers.
4. Fill Admin → SEO: footer keywords, 5–10 FAQs for `/` and `/book-guide`, AI/GEO summary; per-page titles if needed.
5. Mobile app: use `/api/packages?type=guide` for its Book Guide screen; `image` can be `null`.
6. Dekho Rajasthan content to confirm (meals days 4/5/7, "Group Tour" vs "Private Tour"); remove/redirect old `/tour-packages/dekho-rajasthan` static page once the DB page is complete.
7. Optional cleanups: `DEAD_PARTNER_SITES` in `src/app/coupons/page.tsx` (thanibani.com), Next 16 `middleware` → `proxy` rename, pre-existing lint errors in untouched admin pages.

## Key specs/plans
`docs/superpowers/specs/` and `docs/superpowers/plans/` (rich packages, vouchers, rulings).
