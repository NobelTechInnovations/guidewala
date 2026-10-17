import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PackageTitleMaster, PackageDescDetails } from "@/models";
import { nextNumericId } from "@/lib/ids";
import { sortItinerary } from "@/lib/packages";
import { mediaExists } from "@/lib/media.server";
import { readForm, formErrorResponse } from "../../fields";
import { parseItineraryForm, parseIntId } from "../../../itinerary/fields";

const NOT_FOUND = { error: "Package not found." };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkgId = parseIntId(id);
  if (pkgId === null) return NextResponse.json(NOT_FOUND, { status: 404 });
  await dbConnect();
  const rows = await PackageDescDetails.find({ PKG_ID: pkgId }).lean();
  // Day-wise order (see sortItinerary). An item with a filename but no file on
  // disk is flagged so the page can ask for a re-upload; no image at all isn't "missing".
  const itinerary = sortItinerary(rows).map((item) => ({
    ...item,
    imageMissing: !!item.PKG_IMAGE && !mediaExists("pkgItinImg", item.PKG_IMAGE),
  }));
  return NextResponse.json({ itinerary });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkgId = parseIntId(id);
  if (pkgId === null) return NextResponse.json(NOT_FOUND, { status: 404 });

  let changes;
  try {
    const form = await readForm(req);
    await dbConnect();
    // Checked before parsing so an unknown package 404s without saving the image.
    if (!(await PackageTitleMaster.exists({ PKG_ID: pkgId }))) return NextResponse.json(NOT_FOUND, { status: 404 });
    changes = await parseItineraryForm(form, "create");
  } catch (e) {
    return formErrorResponse(e);
  }

  const nextId = await nextNumericId(PackageDescDetails, "ID");
  const item = await PackageDescDetails.create({ ID: nextId, PKG_ID: pkgId, ...changes.set });
  return NextResponse.json({ item }, { status: 201 });
}
