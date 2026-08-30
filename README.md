# Guidewala — Next.js Rewrite

A from-scratch Next.js (App Router + TypeScript + Tailwind v4) rewrite of the original
ASP.NET WebForms site, backed by MongoDB instead of SQL Server. The original `.aspx` project
in `../gudewala-11-8-26` is untouched — this lives in its own folder.

## Stack

- **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Database:** MongoDB (via Mongoose) — data migrated from the original SQL Server (`GUIDEWALA_DB`)
- **Email:** Nodemailer over the same Gmail SMTP relay the original app used
- **No payment gateway** — booking forms submit as enquiries (`BOOKING_STATUS: "P"` / pending),
  matching how the original site's taxi/hotel forms already worked. Guide bookings note that
  payment is collected manually via UPI/GPay, same as the legacy package-details flow.

## Local setup

1. **Start MongoDB** (Docker):

   ```bash
   docker run -d --name guidewala-mongo \
     -e MONGO_INITDB_ROOT_USERNAME=guidewala \
     -e MONGO_INITDB_ROOT_PASSWORD=guidewaladev123 \
     -e MONGO_INITDB_DATABASE=guidewala \
     -p 27017:27017 \
     -v guidewala-mongo-data:/data/db \
     --restart unless-stopped \
     mongo:7
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment** — copy `.env.example` to `.env.local` and fill in real values
   (SMTP password, Mongo URI if different, etc).

4. **Seed the database** from the production SQL Server (read-only pull, safe to re-run):

   ```bash
   npx tsx scripts/migrate-sql-to-mongo.ts
   ```

5. **Run the dev server:**

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000

## Production build

```bash
npm run build
npm run start
```

## Project structure

- `src/app/` — pages (App Router)
- `src/app/api/` — API routes (booking forms, coupon send, contact form)
- `src/components/` — shared UI (Header, Footer, booking forms, etc.)
- `src/models/` — Mongoose schemas, one per original SQL table (field names kept identical
  to the source columns for a clean mapping)
- `src/lib/mongodb.ts` — DB connection (cached across hot reloads / serverless invocations)
- `src/lib/mailer.ts` — email helper (fails soft — never blocks a booking if SMTP is down)
- `scripts/migrate-sql-to-mongo.ts` — one-time/re-runnable data migration from SQL Server

## Known simplifications vs. the original

- The original `.aspx.cs` code-behind files were not available (only a compiled DLL), so
  server-side logic was rebuilt from the live site's visible behavior + the DB schema rather
  than being a byte-for-byte port.
- Several pages had duplicate/dated variants in the original project (e.g. `index-15-12-23.aspx`,
  `about-us-16-10-23.aspx`) — only the currently-live version of each page was ported.
- Guide photo/license file uploads (hidden fields in the current live registration form) were
  not rebuilt since they're disabled on the live site too — verification happens manually after
  registration, matching current production behavior.
