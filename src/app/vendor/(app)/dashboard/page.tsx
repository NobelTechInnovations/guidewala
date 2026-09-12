"use client";

import { useEffect, useState } from "react";
import { FaTicketAlt, FaUsers, FaBuilding } from "react-icons/fa";
import { PageHeader, Card, Loading } from "@/components/admin/ui";

type Me = {
  vendor: { COMPANY_NAME: string; CONTACT_PERSON: string; EMAIL1: string; PHONENO1: string };
  promoCount: number;
  custCount: number;
};

export default function VendorDashboardPage() {
  const [data, setData] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/vendor/me")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <PageHeader
        title={data ? `Welcome, ${data.vendor.COMPANY_NAME}!` : "Welcome!"}
        subtitle="Manage your promo codes and customers"
      />

      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <FaTicketAlt />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 leading-none">{data.promoCount}</p>
                <p className="text-xs text-slate-500 mt-1">Promo Codes</p>
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                <FaUsers />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 leading-none">{data.custCount}</p>
                <p className="text-xs text-slate-500 mt-1">Customers</p>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wide flex items-center gap-2">
              <FaBuilding /> Your Company
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="text-xs font-bold text-slate-400 uppercase">Contact Person</dt>
                <dd className="text-slate-800 mt-0.5">{data.vendor.CONTACT_PERSON}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-400 uppercase">Email</dt>
                <dd className="text-slate-800 mt-0.5">{data.vendor.EMAIL1}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-400 uppercase">Phone</dt>
                <dd className="text-slate-800 mt-0.5">{data.vendor.PHONENO1}</dd>
              </div>
            </dl>
          </Card>
        </>
      )}
    </div>
  );
}
