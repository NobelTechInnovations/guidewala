import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PackageTitleMaster, PackageDescDetails } from "@/models";
import { saveAdminUpload } from "@/lib/upload";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const pkg = await PackageTitleMaster.findOne({ PKG_ID: Number(id) }).lean();
  if (!pkg) return NextResponse.json({ error: "Package not found." }, { status: 404 });
  return NextResponse.json({ pkg });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await req.formData();
  const title = form.get("title") as string;
  const cityId = form.get("cityId") as string;
  const amount = form.get("amount") as string;
  const desc = form.get("desc") as string;
  const isActive = form.get("isActive") as string;
  const image = form.get("image") as File | null;

  await dbConnect();
  const update: Record<string, unknown> = {
    TITLE_NAME: title,
    CITY_ID: cityId,
    PKG_AMOUNT: Number(amount),
    PKG_DESC: desc || "",
    IS_ACTIVE: isActive,
  };
  if (image && image.size > 0) {
    update.PKG_IMAGE = await saveAdminUpload(image, "pkgTitleImg");
  }

  const pkg = await PackageTitleMaster.findOneAndUpdate({ PKG_ID: Number(id) }, update, { returnDocument: "after" }).lean();
  if (!pkg) return NextResponse.json({ error: "Package not found." }, { status: 404 });
  return NextResponse.json({ pkg });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  await Promise.all([
    PackageTitleMaster.deleteOne({ PKG_ID: Number(id) }),
    PackageDescDetails.deleteMany({ PKG_ID: Number(id) }),
  ]);
  return NextResponse.json({ ok: true });
}
