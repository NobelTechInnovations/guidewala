import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PackageTitleMaster, PackageDescDetails } from "@/models";
import { mediaExists } from "@/lib/media.server";
import { parsePackageForm, readForm, formErrorResponse, toUpdateDoc } from "../fields";

const NOT_FOUND = { error: "Package not found." };

/** PKG_ID from the URL, or null when it isn't a whole number (-> 404, not a cast error). */
function parsePkgId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) ? n : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkgId = parsePkgId(id);
  if (pkgId === null) return NextResponse.json(NOT_FOUND, { status: 404 });
  await dbConnect();
  const pkg = await PackageTitleMaster.findOne({ PKG_ID: pkgId }).lean();
  if (!pkg) return NextResponse.json(NOT_FOUND, { status: 404 });
  return NextResponse.json({
    pkg,
    // Files that no longer exist on disk, so the form can flag them for re-upload.
    imageMissing: !mediaExists("pkgTitleImg", pkg.PKG_IMAGE),
    galleryMissing: ((pkg.GALLERY ?? []) as string[]).filter((f) => !mediaExists("pkgGallery", f)),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkgId = parsePkgId(id);
  if (pkgId === null) return NextResponse.json(NOT_FOUND, { status: 404 });

  let changes;
  try {
    const form = await readForm(req);
    await dbConnect();
    // Looked up before parsing so an unknown package 404s without saving files,
    // and so keepGallery can be intersected with what's actually stored.
    const current = await PackageTitleMaster.findOne({ PKG_ID: pkgId }).select("GALLERY").lean();
    if (!current) return NextResponse.json(NOT_FOUND, { status: 404 });
    changes = await parsePackageForm(form, { mode: "update", currentGallery: current.GALLERY ?? [] });
  } catch (e) {
    return formErrorResponse(e);
  }

  const pkg = await PackageTitleMaster.findOneAndUpdate({ PKG_ID: pkgId }, toUpdateDoc(changes), {
    returnDocument: "after",
  }).lean();
  if (!pkg) return NextResponse.json(NOT_FOUND, { status: 404 });
  return NextResponse.json({ pkg });
}

/** Instant "Show on Home" toggle: JSON `{ showOnHome: "Y" | "N" }`. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: unknown = await req.json().catch(() => null);
  const showOnHome =
    typeof body === "object" && body !== null ? (body as { showOnHome?: unknown }).showOnHome : undefined;
  if (showOnHome !== "Y" && showOnHome !== "N") {
    return NextResponse.json({ error: 'showOnHome must be "Y" or "N".' }, { status: 400 });
  }

  const pkgId = parsePkgId(id);
  if (pkgId === null) return NextResponse.json(NOT_FOUND, { status: 404 });
  await dbConnect();
  const pkg = await PackageTitleMaster.findOneAndUpdate(
    { PKG_ID: pkgId },
    { $set: { SHOW_ON_HOME: showOnHome } },
    { returnDocument: "after" }
  ).lean();
  if (!pkg) return NextResponse.json(NOT_FOUND, { status: 404 });
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
