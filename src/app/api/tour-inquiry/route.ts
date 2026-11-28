import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PackageTitleMaster, TourInquiry } from "@/models";
import { packageHref } from "@/lib/packageSlugs";
import { absUrl, titleCase } from "@/lib/seo";
import { sendTemplateMail } from "@/lib/emailTemplates";

/** Tour package page enquiry. The package title + link are looked up here, not trusted from the client. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name ?? "").trim().slice(0, 50);
  const phone = String(body.phone ?? "").replace(/\D/g, "");
  const travelDate = String(body.travelDate ?? "");
  const persons = Math.floor(Number(body.persons));
  const pkgId = Number(body.pkgId);

  if (!name || !/^\d{10}$/.test(phone) || !/^\d{4}-\d{2}-\d{2}$/.test(travelDate) || !(persons >= 1 && persons <= 500)) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  await dbConnect();
  const pkg = (await PackageTitleMaster.findOne({ PKG_ID: pkgId, IS_ACTIVE: "Y" }).select("PKG_ID SLUG TITLE_NAME -_id").lean()) as
    | { PKG_ID: number; SLUG?: string; TITLE_NAME?: string }
    | null;
  if (!pkg) return NextResponse.json({ error: "This tour package is no longer available." }, { status: 404 });

  const pkgTitle = titleCase(pkg.TITLE_NAME ?? "") || `Package #${pkg.PKG_ID}`;
  const pkgUrl = absUrl(packageHref(pkg));

  await TourInquiry.create({
    NAME: name,
    PHONE: phone,
    TRAVEL_DATE: new Date(travelDate),
    NO_OF_PERSONS: persons,
    PKG_ID: pkg.PKG_ID,
    PKG_TITLE: pkgTitle,
    PKG_URL: pkgUrl,
    IS_READ: false,
    CREATED_ON: new Date(),
  });

  const notifyTo = process.env.SEND_PKG_BOOKING_TO || "booking@guidewala.co.in";
  await sendTemplateMail("TOUR_INQUIRY_ADMIN", notifyTo, {
    name,
    phone,
    travelDate,
    persons,
    pkgTitle,
    pkgUrl,
  });

  return NextResponse.json({ ok: true });
}
