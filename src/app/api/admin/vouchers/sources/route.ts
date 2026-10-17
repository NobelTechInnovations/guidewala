import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { HotelBookingDetails, PkgBookingDetails, VendorCustDetails } from "@/models";
import { buildSourceItem, escapeRegex } from "../fields";

const MAX_ITEMS = 20;

type Rec = Record<string, unknown>;

// Per source: which collection, what q searches, newest-first order, and how its
// fields map onto the shared { refId, name, phone, guests, from, to } shape.
const SOURCES = {
  hotel: {
    model: HotelBookingDetails,
    searchFields: ["CUST_NAME", "PHONE_NO", "HOTEL_BOOKING_ID"],
    sort: { CREATED_ON: -1 },
    map: (r: Rec) => ({
      refId: r.HOTEL_BOOKING_ID,
      name: r.CUST_NAME,
      phone: r.PHONE_NO,
      guests: r.NO_OF_GUESTS,
      from: r.ARRIVAL_DATE,
      to: r.DEPARTURE_DATE,
    }),
  },
  guide: {
    model: PkgBookingDetails,
    searchFields: ["CUST_NAME", "PHONE_NO", "BOOLING_ID"], // BOOLING_ID typo matches the model
    sort: { BOOKING_DATE: -1 },
    // A guide booking has a single service date (DOS), so there's no end date.
    map: (r: Rec) => ({
      refId: r.BOOLING_ID,
      name: r.CUST_NAME,
      phone: r.PHONE_NO,
      guests: r.NO_OF_PASSENGERS,
      from: r.DOS,
      to: null,
    }),
  },
  vendor: {
    model: VendorCustDetails,
    searchFields: ["CUST_NAME", "PHONE_NO1", "PHONE_NO2", "CUST_ID"],
    sort: { CREATED_ON: -1 },
    map: (r: Rec) => ({
      refId: r.CUST_ID,
      name: r.CUST_NAME,
      phone: r.PHONE_NO1 || r.PHONE_NO2,
      guests: null,
      from: r.STAY_FROM_DT,
      to: r.STAY_TO_DT,
    }),
  },
} as const;

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") || "";
  if (!Object.hasOwn(SOURCES, type)) {
    return NextResponse.json({ error: "type must be one of hotel, guide, vendor" }, { status: 400 });
  }
  const src = SOURCES[type as keyof typeof SOURCES];

  await dbConnect();
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const filter: Record<string, unknown> = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = src.searchFields.map((f) => ({ [f]: rx }));
  }

  const rows = (await src.model
    .find(filter)
    .sort({ ...src.sort, _id: -1 })
    .limit(MAX_ITEMS)
    .lean()) as Rec[];

  return NextResponse.json({ items: rows.map((r) => buildSourceItem(src.map(r))) });
}
