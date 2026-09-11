import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PackageDescDetails } from "@/models";
import { nextNumericId } from "@/lib/ids";
import { saveAdminUpload } from "@/lib/upload";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const itinerary = await PackageDescDetails.find({ PKG_ID: Number(id) }).sort({ ID: 1 }).lean();
  return NextResponse.json({ itinerary });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await req.formData();
  const name = form.get("name") as string;
  const desc = form.get("desc") as string;
  const image = form.get("image") as File | null;

  if (!name) return NextResponse.json({ error: "Itinerary Name is required." }, { status: 400 });

  await dbConnect();
  const nextId = await nextNumericId(PackageDescDetails, "ID");
  const filename = image && image.size > 0 ? await saveAdminUpload(image, "pkgItinImg") : "";

  const item = await PackageDescDetails.create({
    ID: nextId,
    PKG_ID: Number(id),
    ITINERARY: name,
    PACKAGE_DESC: desc || "",
    PKG_IMAGE: filename,
  });

  return NextResponse.json({ item }, { status: 201 });
}
