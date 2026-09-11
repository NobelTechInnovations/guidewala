import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PackageTitleMaster, CityMaster } from "@/models";
import { nextNumericId } from "@/lib/ids";
import { saveAdminUpload } from "@/lib/upload";

export async function GET() {
  await dbConnect();
  const [packages, cities] = await Promise.all([
    PackageTitleMaster.find({}).sort({ CREATED_ON: -1 }).lean(),
    CityMaster.find({}).select("CITY_ID CITY_NAME -_id").lean(),
  ]);
  const cityMap = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));
  return NextResponse.json({
    packages: packages.map((p) => ({ ...p, CITY_NAME: cityMap.get(p.CITY_ID) || "" })),
  });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const title = form.get("title") as string;
  const cityId = form.get("cityId") as string;
  const amount = form.get("amount") as string;
  const desc = form.get("desc") as string;
  const isActive = (form.get("isActive") as string) || "Y";
  const image = form.get("image") as File | null;

  if (!title || !cityId || !amount) {
    return NextResponse.json({ error: "Title, City and Amount are required." }, { status: 400 });
  }
  if (!image || image.size === 0) {
    return NextResponse.json({ error: "Package image is required." }, { status: 400 });
  }

  await dbConnect();
  const pkgId = await nextNumericId(PackageTitleMaster, "PKG_ID");
  const filename = await saveAdminUpload(image, "pkgTitleImg");

  await PackageTitleMaster.create({
    PKG_ID: pkgId,
    TITLE_NAME: title,
    CITY_ID: cityId,
    PKG_AMOUNT: Number(amount),
    PKG_IMAGE: filename,
    PKG_DESC: desc || "",
    IS_ACTIVE: isActive,
    CREATED_ON: new Date(),
  });

  return NextResponse.json({ pkgId }, { status: 201 });
}
