import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VendorLogin, VendorDetails } from "@/models";
import { createVendorSessionToken, COOKIE_NAME } from "@/lib/vendorAuth";

export async function POST(req: NextRequest) {
  const { loginId, password } = (await req.json()) as { loginId?: string; password?: string };
  if (!loginId || !password) {
    return NextResponse.json({ error: "Please enter your Login Id and Password." }, { status: 400 });
  }

  await dbConnect();
  const login = await VendorLogin.findOne({ LOGIN_ID: loginId }).lean();
  if (!login || login.PASSWORD !== password || login.IS_ACTIVE !== "Y") {
    return NextResponse.json({ error: "Invalid Login Id or Password." }, { status: 401 });
  }

  const vendor = await VendorDetails.findOne({ VENDOR_ID: login.VENDOR_ID }).select("IS_ACTIVE -_id").lean();
  if (!vendor || vendor.IS_ACTIVE !== "Y") {
    return NextResponse.json({ error: "This vendor account is inactive. Contact Guidewala support." }, { status: 403 });
  }

  const token = await createVendorSessionToken({ vendorId: login.VENDOR_ID, vlogId: login.VLOG_ID });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
