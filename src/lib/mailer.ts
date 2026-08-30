import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

/**
 * Sends an email and swallows failures (logs only). Booking/coupon flows
 * should never fail the user-facing request just because SMTP is down or
 * unconfigured in a given environment.
 */
export async function sendMailSafe(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[mailer] SMTP not configured — skipping email:", opts.subject);
    return { sent: false };
  }
  try {
    await getTransporter().sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Guidewala"}" <${process.env.SMTP_USER}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { sent: true };
  } catch (err) {
    console.error("[mailer] Failed to send email:", err);
    return { sent: false, error: err };
  }
}
