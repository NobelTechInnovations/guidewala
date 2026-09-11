"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaEye, FaEdit, FaPlus } from "react-icons/fa";
import { PageHeader, Card, Badge, EmptyState, Loading, PrimaryLink } from "@/components/admin/ui";

type Vendor = {
  VENDOR_ID: string;
  COMPANY_NAME: string;
  VEN_TYP_NAME: string;
  CONTACT_PERSON: string;
  PHONENO1: string;
  CITY_NAME: string;
  STATE_NAME: string;
  IS_ACTIVE: string;
  CREATED_ON: string;
};

export default function VendorListPage() {
  const [vendors, setVendors] = useState<Vendor[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/vendors")
      .then((r) => r.json())
      .then((d) => setVendors(d.vendors));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader
        title="Vendor List"
        subtitle="Companies and promo-code partners"
        action={
          <PrimaryLink href="/admin/vendors/new">
            <FaPlus /> New Vendor
          </PrimaryLink>
        }
      />

      {vendors === null ? (
        <Loading />
      ) : vendors.length === 0 ? (
        <EmptyState message="No vendors yet." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="px-5 py-3">Vendor / Company</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.VENDOR_ID} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{v.COMPANY_NAME}</td>
                  <td className="px-5 py-3 text-slate-600">{v.VEN_TYP_NAME || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{v.CONTACT_PERSON}</td>
                  <td className="px-5 py-3 text-slate-600">{v.PHONENO1}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {v.CITY_NAME}, {v.STATE_NAME}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={v.IS_ACTIVE === "Y" ? "green" : "slate"}>{v.IS_ACTIVE === "Y" ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <Link href={`/admin/vendors/${v.VENDOR_ID}`} className="text-slate-400 hover:text-gw-brand p-2 inline-block">
                      <FaEye />
                    </Link>
                    <Link href={`/admin/vendors/${v.VENDOR_ID}/edit`} className="text-slate-400 hover:text-gw-brand p-2 inline-block">
                      <FaEdit />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
