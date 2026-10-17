import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PackageTitleMaster, CityMaster } from "@/models";
import { nextNumericId } from "@/lib/ids";
import { mediaExists } from "@/lib/media.server";
import { parsePackageForm, readForm, formErrorResponse } from "./fields";

export async function GET() {
  await dbConnect();
  const [packages, cities] = await Promise.all([
    PackageTitleMaster.find({}).sort({ CREATED_ON: -1 }).lean(),
    CityMaster.find({}).select("CITY_ID CITY_NAME -_id").lean(),
  ]);
  const cityMap = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));
  return NextResponse.json({
    packages: packages.map((p) => ({
      ...p,
      CITY_NAME: cityMap.get(p.CITY_ID) || "",
      // Cover missing from disk (legacy rows whose file never made it over)
      // — lets the list tag packages that need a re-upload.
      imageMissing: !mediaExists("pkgTitleImg", p.PKG_IMAGE),
    })),
  });
}

export async function POST(req: NextRequest) {
  let changes;
  try {
    changes = await parsePackageForm(await readForm(req), { mode: "create" });
  } catch (e) {
    return formErrorResponse(e);
  }

  await dbConnect();
  const pkgId = await nextNumericId(PackageTitleMaster, "PKG_ID");
  await PackageTitleMaster.create({ ...changes.set, PKG_ID: pkgId, CREATED_ON: new Date() });

  return NextResponse.json({ pkgId }, { status: 201 });
}
