"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Loading } from "@/components/admin/ui";

type Lead = { ID: number; NAME: string; PHONE_NO: string; EMAIL: string; PROMO_TITLE: string; CREATED_ON: string };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/leads/coupons")
      .then((r) => r.json())
      .then((d) => setLeads(d.leads));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader title="Coupon Leads" subtitle="People who unlocked a coupon code with their email" />

      {leads === null ? (
        <Loading />
      ) : leads.length === 0 ? (
        <EmptyState message="No leads yet." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Coupon</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.ID} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-semibold text-slate-800">{l.NAME || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{l.PHONE_NO || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{l.EMAIL}</td>
                  <td className="px-5 py-3 text-slate-600">{l.PROMO_TITLE || "—"}</td>
                  <td className="px-5 py-3 text-slate-400">{l.CREATED_ON ? new Date(l.CREATED_ON).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
