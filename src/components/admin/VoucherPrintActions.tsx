"use client";

import { FaPrint, FaWhatsapp } from "react-icons/fa";

/** Screen-only buttons above the printable voucher (hidden when printing). */
export default function VoucherPrintActions({ phone, text }: { phone: string; text: string }) {
  const digits = phone.replace(/\D/g, "");
  const waPhone = digits.length === 10 ? `91${digits}` : digits;
  const waHref = `https://api.whatsapp.com/send/?${waPhone ? `phone=${waPhone}&` : ""}text=${encodeURIComponent(text)}`;

  return (
    <div className="print:hidden flex justify-center gap-3 mb-6">
      <button
        type="button"
        onClick={() => window.print()}
        className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm"
      >
        <FaPrint /> Print / Save PDF
      </button>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] hover:opacity-90 text-white font-bold px-5 py-2.5 rounded-lg text-sm"
      >
        <FaWhatsapp /> Share on WhatsApp
      </a>
    </div>
  );
}
