import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/mongodb";
import { Voucher } from "@/models";
import { COMPANY, nightDates, type VoucherDoc } from "@/lib/vouchers";
import VoucherPrintActions from "@/components/admin/VoucherPrintActions";

// Outside the (app) group on purpose: no admin shell, just the A4 sheet.
// Still behind admin auth — middleware guards every /admin/* path.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Service Confirmation | Guidewala" };

export default async function VoucherPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const v = (await Voucher.findOne({ VOUCHER_NO: decodeURIComponent(id) }).lean()) as unknown as VoucherDoc | null;
  if (!v) notFound();

  const rows = v.ROWS || [];
  const shareText = [
    `Service Confirmation ${v.VOUCHER_NO} — ${COMPANY.name}`,
    `Guest: ${v.GUEST_NAME}${v.GUEST_NOTE ? ` ${v.GUEST_NOTE}` : ""}`,
    ...rows.map((r) => {
      const d = nightDates(r.CHECK_IN, r.CHECK_OUT);
      return `• ${r.HOTEL_NAME}: ${d[0] || ""}${d.length > 1 ? ` – ${d[d.length - 1]}` : ""} (${r.SERVICE || ""}${r.MEAL_PLAN ? ` ${r.MEAL_PLAN}` : ""}) ${r.STATUS || "Confirm"}${r.REF_CODE ? `, Ref ${r.REF_CODE}` : ""}`;
    }),
    `Contact: ${COMPANY.phone}`,
  ].join("\n");

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:bg-white print:py-0">
      <style>{`@page { size: A4; margin: 12mm; }`}</style>
      <VoucherPrintActions phone={v.CONTACT_NO || ""} text={shareText} />

      <div className="mx-auto bg-white w-[210mm] max-w-full min-h-[297mm] p-[12mm] shadow-lg print:shadow-none print:w-auto print:min-h-0 print:p-0 text-slate-900">
        {/* Header */}
        <div className="flex justify-between gap-6">
          <div>
            <Image src="/assets/img/logo11.png" alt="Guidewala" width={200} height={60} loading="eager" className="h-14 w-auto" />
            <p className="mt-1 text-sm">{COMPANY.name}</p>
          </div>
          <div className="text-sm leading-snug text-right sm:text-left">
            <p>{COMPANY.phone}</p>
            <p>{COMPANY.email}</p>
            <p className="italic mt-1">Registered Office :</p>
            <p className="max-w-[60mm]">{COMPANY.office}</p>
          </div>
        </div>

        <h1 className="text-center font-bold text-lg mt-6 mb-6">Service Confirmation</h1>
        <p className="text-right text-xs text-slate-500 -mt-4 mb-4">Voucher No. {v.VOUCHER_NO}</p>

        {/* Guest */}
        <div className="space-y-3 text-lg font-bold">
          <p>
            Guest Name: {v.GUEST_NAME} {v.GUEST_NOTE && <span className="font-normal">{v.GUEST_NOTE}</span>}
          </p>
          <p>
            Nationality: {v.NATIONALITY || "Indian"}
            {v.CONTACT_NO && <> &nbsp;Contact Number: {v.CONTACT_NO}</>}
          </p>
          <p>Payment Terms = {v.PAYMENT_TERMS || "Prepaid"}</p>
        </div>

        {/* Hotels */}
        <table className="w-full mt-6 border-collapse border border-slate-800 text-sm">
          <thead>
            <tr className="text-left text-base">
              {["Hotel", "Service Details", "Dates", "Status", "Contact"].map((h) => (
                <th key={h} className="border border-slate-800 px-2 py-1 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="align-top break-inside-avoid">
                <td className="border border-slate-800 px-2 py-2 w-[28%]">
                  <p className="font-bold">
                    {i + 1}. {r.HOTEL_NAME}
                  </p>
                  {r.ADDRESS && <p className="mt-3 whitespace-pre-line">{r.ADDRESS}</p>}
                </td>
                <td className="border border-slate-800 px-2 py-2 font-bold text-base">
                  <p>{r.SERVICE}</p>
                  {r.MEAL_PLAN && <p className="mt-4">{r.MEAL_PLAN}</p>}
                </td>
                <td className="border border-slate-800 px-2 py-2 font-bold text-base">
                  {nightDates(r.CHECK_IN, r.CHECK_OUT).map((d) => (
                    <p key={d} className="mb-3">
                      {d}
                    </p>
                  ))}
                </td>
                <td className="border border-slate-800 px-2 py-2">
                  <p className="font-bold text-base">{r.STATUS || "Confirm"}</p>
                  {r.REF_CODE && <p className="mt-4 font-bold break-all">Ref Code: {r.REF_CODE}</p>}
                </td>
                <td className="border border-slate-800 px-2 py-2 font-bold text-base whitespace-pre-line">
                  {r.CONTACT}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {v.NOTES && (
          <div className="mt-6 text-sm">
            <p className="font-bold">Notes</p>
            <p className="whitespace-pre-line">{v.NOTES}</p>
          </div>
        )}
      </div>
    </div>
  );
}
