"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBook, FaTaxi, FaUserGraduate, FaUsers } from "react-icons/fa";
import { PageHeader, Card, EmptyState, Loading } from "@/components/admin/ui";

type PendingGuide = {
  GUIDE_ID: number;
  FIRST_NAME: string;
  LAST_NAME: string;
  PHONE_NO: string;
  EMAIL: string;
  CITY: string;
  STATE: string;
  COUNTRY: string;
  PIN_CODE: string;
  REGISTRED_ON: string;
};

type Dashboard = {
  totalGuideBooking: number;
  totalTaxiBooking: number;
  totalHotelBooking: number;
  totalGuide: number;
  totalVendor: number;
  pendingGuides: PendingGuide[];
};

const STAT_CARDS = [
  { key: "totalGuideBooking", label: "Guide Bookings", icon: FaUserGraduate, tone: "bg-emerald-500" },
  { key: "totalTaxiBooking", label: "Taxi Bookings", icon: FaTaxi, tone: "bg-amber-500" },
  { key: "totalGuide", label: "Our Guides", icon: FaUsers, tone: "bg-blue-500" },
  { key: "totalVendor", label: "Our Vendors", icon: FaBook, tone: "bg-purple-500" },
] as const;

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader title="Welcome, Guidewala Admin!" subtitle="Overview of bookings, guides, and vendors" />

      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {STAT_CARDS.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.key} className="p-5 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl ${s.tone} text-white flex items-center justify-center shrink-0`}>
                    <Icon />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-slate-900 leading-none">{data[s.key]}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card>
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Pending Guide Registrations</h2>
            </div>
            {data.pendingGuides.length === 0 ? (
              <div className="p-8">
                <EmptyState message="No pending guide registrations." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Phone</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">City</th>
                      <th className="px-6 py-3">Registered</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pendingGuides.map((g) => (
                      <tr key={g.GUIDE_ID} className="border-b border-slate-50 last:border-0">
                        <td className="px-6 py-3 font-semibold text-slate-800">
                          {g.FIRST_NAME} {g.LAST_NAME}
                        </td>
                        <td className="px-6 py-3 text-slate-600">{g.PHONE_NO}</td>
                        <td className="px-6 py-3 text-slate-600">{g.EMAIL}</td>
                        <td className="px-6 py-3 text-slate-600">
                          {g.CITY}, {g.STATE}
                        </td>
                        <td className="px-6 py-3 text-slate-400">
                          {g.REGISTRED_ON ? new Date(g.REGISTRED_ON).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Link href={`/admin/guides/${g.GUIDE_ID}`} className="text-gw-brand font-bold hover:underline">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
