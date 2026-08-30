import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { CouponSendToMail, PromoCodeMaster } from "@/models";
import { sendMailSafe } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { promoId, name, phone, email } = body as {
    promoId?: string;
    name?: string;
    phone?: string;
    email?: string;
  };

  if (!promoId || !name || !phone || !email) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  await dbConnect();

  const promo = await PromoCodeMaster.findOne({ PROMO_ID: promoId }).lean();
  if (!promo) {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  }

  const nextId = (await CouponSendToMail.countDocuments()) + 1;
  await CouponSendToMail.create({
    ID: nextId,
    PROMO_ID: promoId,
    NAME: name,
    PHONE_NO: phone,
    EMAIL: email,
    CREATED_ON: new Date(),
  });

  const promoDoc = promo as unknown as {
    PROMO_TITLE?: string;
    PROMO_CODE?: string;
    VALID_TO?: Date;
  };

  await sendMailSafe({
    to: email,
    subject: `Your Guidewala coupon: ${promoDoc.PROMO_CODE ?? ""}`,
    html: `
      <p>Hi ${name},</p>
      <p>Here's your coupon <strong>${promoDoc.PROMO_TITLE ?? ""}</strong>:</p>
      <p style="font-size:20px;font-weight:bold;letter-spacing:2px;">${promoDoc.PROMO_CODE ?? ""}</p>
      <p>Valid until: ${promoDoc.VALID_TO ? new Date(promoDoc.VALID_TO).toLocaleDateString() : "—"}</p>
      <p>Use it on your next booking at guidewala.co.in</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
