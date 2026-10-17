import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { mediaExists } from "@/lib/media.server";
import { mediaAbsoluteUrl } from "@/lib/url";
import { SHOWN, sortItinerary, type ItineraryDoc, type PackageDoc } from "@/lib/packages";
import { cancellationPolicyFor } from "@/lib/policies";
import { PackageTitleMaster, PackageDescDetails, CityMaster, HotelMaster } from "@/models";

const NOT_FOUND = { error: "Package not found." };

// Public read-only endpoint — single package with itinerary + nearby
// hotels, matching what the web app's /packages/[pkgId] page shows.
// Keys only ever get added (the mobile app reads it): the rich-package
// fields follow the original ones; hidden itinerary items are left out and
// the rest come in day order (see sortItinerary).
export async function GET(req: NextRequest, { params }: { params: Promise<{ pkgId: string }> }) {
  const { pkgId } = await params;
  const id = Number(pkgId);
  if (!Number.isSafeInteger(id)) return NextResponse.json(NOT_FOUND, { status: 404 });
  await dbConnect();

  const pkg = (await PackageTitleMaster.findOne({ PKG_ID: id, IS_ACTIVE: "Y" }).lean()) as unknown as PackageDoc | null;
  if (!pkg) return NextResponse.json(NOT_FOUND, { status: 404 });

  const [city, itinerary, hotels] = await Promise.all([
    CityMaster.findOne({ CITY_ID: pkg.CITY_ID }).select("CITY_NAME -_id").lean() as unknown as { CITY_NAME?: string } | null,
    PackageDescDetails.find({ PKG_ID: id, IS_ACTIVE: SHOWN })
      .select("ID ITINERARY PACKAGE_DESC PKG_IMAGE DAY_NO MEALS STAY -_id")
      .lean() as unknown as ItineraryDoc[],
    HotelMaster.find({ CITY_ID: pkg.CITY_ID, IS_ACTIVE: "Y" }).select("HOTEL_NAME -_id").lean() as unknown as {
      HOTEL_NAME: string;
    }[],
  ]);

  return NextResponse.json({
    pkgId: pkg.PKG_ID,
    title: pkg.TITLE_NAME,
    cityId: pkg.CITY_ID,
    cityName: city?.CITY_NAME || "",
    amount: pkg.PKG_AMOUNT,
    image: mediaAbsoluteUrl("pkgTitleImg", pkg.PKG_IMAGE, req),
    description: pkg.PKG_DESC,
    itinerary: sortItinerary(itinerary).map((i) => ({
      title: i.ITINERARY,
      description: i.PACKAGE_DESC,
      image: mediaAbsoluteUrl("pkgItinImg", i.PKG_IMAGE, req),
      dayNo: i.DAY_NO ?? null,
      meals: i.MEALS ?? [],
      stay: i.STAY || null,
    })),
    hotels: hotels.map((h) => h.HOTEL_NAME),

    // Rich-package fields (all optional on the record: null / [] when unset).
    durationDays: pkg.DURATION_DAYS ?? null,
    durationNights: pkg.DURATION_NIGHTS ?? null,
    route: (pkg.ROUTE ?? []).map((s) => ({ city: s.CITY ?? "", nights: s.NIGHTS ?? 0 })),
    tourType: pkg.TOUR_TYPE || null,
    priceNote: pkg.PRICE_NOTE || null,
    // Files missing on disk are dropped / nulled so the app never gets a 404 URL.
    gallery: (pkg.GALLERY ?? [])
      .filter((f) => mediaExists("pkgGallery", f))
      .map((f) => mediaAbsoluteUrl("pkgGallery", f, req))
      .filter((u): u is string => u !== null),
    includes: pkg.INCLUDES ?? [],
    highlights: pkg.HIGHLIGHTS ?? [],
    inclusions: pkg.INCLUSIONS ?? [],
    exclusions: pkg.EXCLUSIONS ?? [],
    documents: pkg.DOCUMENTS ?? [],
    thingsToCarry: pkg.THINGS_TO_CARRY ?? [],
    notes: pkg.NOTES ?? [],
    brochure: mediaExists("pkgBrochure", pkg.BROCHURE) ? mediaAbsoluteUrl("pkgBrochure", pkg.BROCHURE, req) : null,
    // The effective policy: the package's own, else the site default.
    cancellationPolicy: cancellationPolicyFor(pkg),
  });
}
