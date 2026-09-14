import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PackageDescDetails } from "@/models";
import { saveAdminUpload } from "@/lib/upload";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await req.formData();
  const name = form.get("name") as string;
  const desc = form.get("desc") as string;
  const image = form.get("image") as File | null;

  await dbConnect();
  const update: Record<string, unknown> = { ITINERARY: name, PACKAGE_DESC: desc || "" };
  if (image && image.size > 0) {
    update.PKG_IMAGE = await saveAdminUpload(image, "pkgItinImg");
  }
  const item = await PackageDescDetails.findOneAndUpdate({ ID: Number(id) }, update, { returnDocument: "after" }).lean();
  if (!item) return NextResponse.json({ error: "Itinerary item not found." }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  await PackageDescDetails.deleteOne({ ID: Number(id) });
  return NextResponse.json({ ok: true });
}
