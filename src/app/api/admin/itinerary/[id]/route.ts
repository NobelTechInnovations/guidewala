import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PackageDescDetails } from "@/models";
import { readForm, formErrorResponse, toUpdateDoc } from "../../packages/fields";
import { parseItineraryForm, parseIntId } from "../fields";

const NOT_FOUND = { error: "Itinerary item not found." };

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itemId = parseIntId(id);
  if (itemId === null) return NextResponse.json(NOT_FOUND, { status: 404 });

  let changes;
  try {
    const form = await readForm(req);
    await dbConnect();
    // Checked before parsing so an unknown item 404s without saving the image.
    if (!(await PackageDescDetails.exists({ ID: itemId }))) return NextResponse.json(NOT_FOUND, { status: 404 });
    changes = await parseItineraryForm(form, "update");
  } catch (e) {
    return formErrorResponse(e);
  }

  const item = await PackageDescDetails.findOneAndUpdate({ ID: itemId }, toUpdateDoc(changes), {
    returnDocument: "after",
  }).lean();
  if (!item) return NextResponse.json(NOT_FOUND, { status: 404 });
  return NextResponse.json({ item });
}

/** Instant "Shown on site" toggle: JSON `{ isActive: "Y" | "N" }`. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: unknown = await req.json().catch(() => null);
  const isActive =
    typeof body === "object" && body !== null ? (body as { isActive?: unknown }).isActive : undefined;
  if (isActive !== "Y" && isActive !== "N") {
    return NextResponse.json({ error: 'isActive must be "Y" or "N".' }, { status: 400 });
  }

  const itemId = parseIntId(id);
  if (itemId === null) return NextResponse.json(NOT_FOUND, { status: 404 });
  await dbConnect();
  const item = await PackageDescDetails.findOneAndUpdate(
    { ID: itemId },
    { $set: { IS_ACTIVE: isActive } },
    { returnDocument: "after" }
  ).lean();
  if (!item) return NextResponse.json(NOT_FOUND, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  await PackageDescDetails.deleteOne({ ID: Number(id) });
  return NextResponse.json({ ok: true });
}
