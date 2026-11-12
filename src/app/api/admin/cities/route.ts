import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { CityMaster, StateMaster } from "@/models";

/** All cities (any status) with their state name, for the admin Cities page. */
export async function GET() {
  await dbConnect();
  const [cities, states] = await Promise.all([
    CityMaster.find({}).sort({ CITY_NAME: 1 }).select("CITY_ID CITY_NAME STATE_ID IS_ACTIVE -_id").lean(),
    StateMaster.find({}).sort({ STATE_NAME: 1 }).select("STATE_ID STATE_NAME COUNTRY_ID -_id").lean(),
  ]);
  const stateName = new Map(states.map((s) => [s.STATE_ID, s.STATE_NAME]));
  return NextResponse.json({
    cities: cities.map((c) => ({ ...c, STATE_NAME: stateName.get(c.STATE_ID) || "" })),
    states,
  });
}

/** Adds a city: { name, stateId }. IDs continue the CT001, CT002… sequence. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { name?: string; stateId?: string } | null;
  const name = body?.name?.trim().replace(/\s+/g, " ");
  if (!name) return NextResponse.json({ error: "City name is required." }, { status: 400 });

  await dbConnect();
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (await CityMaster.exists({ CITY_NAME: new RegExp(`^${escaped}$`, "i") })) {
    return NextResponse.json({ error: `"${name}" already exists.` }, { status: 400 });
  }

  const state = body?.stateId
    ? ((await StateMaster.findOne({ STATE_ID: body.stateId }).lean()) as { STATE_ID: string; COUNTRY_ID?: string } | null)
    : null;
  if (body?.stateId && !state) return NextResponse.json({ error: "Unknown state." }, { status: 400 });

  const ids = (await CityMaster.find({}).select("CITY_ID -_id").lean()) as { CITY_ID?: string }[];
  const max = Math.max(0, ...ids.map((c) => Number(/^CT(\d+)$/.exec(c.CITY_ID || "")?.[1] || 0)));
  const city = await CityMaster.create({
    CITY_ID: `CT${String(max + 1).padStart(3, "0")}`,
    CITY_NAME: name,
    STATE_ID: state?.STATE_ID || "",
    COUNTRY_ID: state?.COUNTRY_ID || "CI001",
    IS_ACTIVE: "Y",
  });
  return NextResponse.json({ city }, { status: 201 });
}

/** Renames or shows/hides a city: { cityId, name?, isActive? ("Y" | "N") }. */
export async function PATCH(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { cityId?: string; name?: string; isActive?: string } | null;
  if (!body?.cityId) return NextResponse.json({ error: "cityId is required." }, { status: 400 });
  const update: Record<string, string> = {};
  if (body.isActive !== undefined) {
    if (body.isActive !== "Y" && body.isActive !== "N")
      return NextResponse.json({ error: 'isActive must be "Y" or "N".' }, { status: 400 });
    update.IS_ACTIVE = body.isActive;
  }
  if (body.name !== undefined) {
    const name = body.name.trim().replace(/\s+/g, " ");
    if (!name) return NextResponse.json({ error: "City name can't be empty." }, { status: 400 });
    update.CITY_NAME = name;
  }
  await dbConnect();
  const city = await CityMaster.findOneAndUpdate({ CITY_ID: body.cityId }, update, { returnDocument: "after" }).lean();
  if (!city) return NextResponse.json({ error: "City not found." }, { status: 404 });
  return NextResponse.json({ city });
}
