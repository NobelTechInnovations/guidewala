# Admin hotel voucher (Service Confirmation) — design

Date: 2026-10-17 · Status: decisions agreed in chat

## Goal
Admin creates, saves, edits and prints a "Service Confirmation" voucher for a
customer: which hotels, which nights, meal plan, status, ref codes, contacts —
laid out like the sample voucher (logo + company block, guest block, hotel table).

## Decisions
- Delivery: A4 print page with Print / Save as PDF button and WhatsApp share link. No new libraries.
- Hotel List gains `ADDRESS` and `CONTACT_NO`; picking a hotel fills them (editable per voucher).
- Customer autofill from Hotel bookings, Guide bookings and Vendor customers (search by name/phone/booking id).
- Vouchers are saved with sequential numbers `GW-V-0001`; list, edit, reprint, delete.

## Data
`Voucher` (collection `vouchers`):
`VOUCHER_NO`, `GUEST_NAME`, `GUEST_NOTE` (e.g. "x 3 Guests (2 Year Child)"), `NATIONALITY`
(default "Indian"), `CONTACT_NO`, `PAYMENT_TERMS` (`Prepaid` | `Pay at Hotel` | `Partially Paid`),
`SOURCE: { TYPE: "hotel" | "guide" | "vendor" | "manual", REF_ID }`, `NOTES`,
`ROWS: [{ HOTEL_ID?, HOTEL_NAME, ADDRESS, CHECK_IN: Date, CHECK_OUT: Date, SERVICE, MEAL_PLAN
(`EP` | `CP` | `MAP` | `AP`), STATUS (`Confirm` | `Pending` | `Cancelled`), REF_CODE, CONTACT }]`,
`CREATED_ON`, `UPDATED_ON`.
- `SERVICE` auto-fills from dates as `"<nights>D/<nights>N"`, editable.
- Dates column prints each night's date (check-in … check-out − 1), dd/mm/yyyy.

`HotelMaster` adds `ADDRESS: String`, `CONTACT_NO: String` (HotelForm + hotel APIs updated).

## API (admin, cookie-protected by existing middleware)
- `GET/POST /api/admin/vouchers` (list newest first with search `?q=`; create → next number).
- `GET/PUT/DELETE /api/admin/vouchers/[id]` (id = VOUCHER_NO).
- `GET /api/admin/vouchers/sources?type=hotel|guide|vendor&q=` → normalized
  `{ refId, name, phone, guests, from, to, label }[]` (max 20).

## UI
- Nav "Vouchers" under Bookings & Leads.
- `/admin/vouchers` list (no., guest, first check-in, hotels count, actions: Edit, Print, Delete).
- `/admin/vouchers/new` + `/[id]/edit`: "Fill from booking" (source tabs + search) → guest fields and,
  for hotel bookings, a first row with dates; guest block; repeatable hotel rows (hotel picker from
  Hotel List → address/contact; dates; meal plan; status; ref code); notes.
- `/admin/voucher-print/[id]` (outside the admin shell): A4 voucher matching the sample —
  logo, "G8 Guidewala Services LLP", +91 9829185267, booking@guidewala.co.in, Registered Office
  "1st floor, E 69, Ganga Marg, Prem Nagar, Jhotwara, Jaipur, Rajasthan -302012", title
  "Service Confirmation", guest/nationality/contact/payment lines, table Hotel | Service Details |
  Dates | Status | Contact, notes; buttons (hidden in print): Print / Save PDF, Share on WhatsApp.

## Verification
Dev DB only. Create from each source type and manually; edit; print preview at A4; hotel list
address/contact round-trip; tsc, lint, unit tests for number generation + nights/service/date helpers.
