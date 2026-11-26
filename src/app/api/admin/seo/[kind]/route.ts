import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { SiteSetting } from "@/models";
import { SEO_KINDS, isSeoKind, parseSeoBody } from "../fields";

type Ctx = { params: Promise<{ kind: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { kind } = await params;
  await dbConnect();
  if (kind === "settings") {
    const s = (await SiteSetting.findOne({ KEY: "site" }).lean()) as { SITE_SUMMARY?: string } | null;
    return NextResponse.json({ settings: { siteSummary: s?.SITE_SUMMARY || "" } });
  }
  if (!isSeoKind(kind)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const { model, sort } = SEO_KINDS[kind];
  return NextResponse.json({ items: await model.find({}).sort(sort).lean() });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { kind } = await params;
  if (!isSeoKind(kind)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const parsed = parseSeoBody(kind, body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  await dbConnect();
  try {
    const item = await SEO_KINDS[kind].model.create(parsed.doc);
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return NextResponse.json({ error: "That page already has SEO settings — edit it instead." }, { status: 400 });
    throw e;
  }
}

/** Settings only: { siteSummary }. */
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { kind } = await params;
  if (kind !== "settings") return NextResponse.json({ error: "Not found." }, { status: 404 });
  const body = (await req.json().catch(() => null)) as { siteSummary?: unknown } | null;
  const summary = typeof body?.siteSummary === "string" ? body.siteSummary.trim().slice(0, 4000) : "";
  await dbConnect();
  await SiteSetting.updateOne({ KEY: "site" }, { $set: { SITE_SUMMARY: summary } }, { upsert: true });
  return NextResponse.json({ settings: { siteSummary: summary } });
}
