"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaEye } from "react-icons/fa";
import { PageHeader, Card, EmptyState, Loading } from "@/components/admin/ui";

type Booking = {
  BOOLING_ID: string;
  TITLE_NAME: string;
  CITY_NAME: string;
  CUST_NAME: string;
  DOS: string;
  NO_OF_PASSENGERS: number;
  PHONE_NO: string;
  BOOKING_DATE: string;
};

export default function GuideBookingListPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/bookings/guide")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader title="Guide Booking List" subtitle="Enquiries submitted from tour package pages" />

      {bookings === null ? (
        <Loading />
      ) : bookings.length === 0 ? (
        <EmptyState message="No guide bookings yet." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="px-5 py-3">Package</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">DOS</th>
                <th className="px-5 py-3">Pass.</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Order Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.BOOLING_ID} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{b.TITLE_NAME || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{b.CITY_NAME || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{b.CUST_NAME}</td>
                  <td className="px-5 py-3 text-slate-600">{b.DOS ? new Date(b.DOS).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{b.NO_OF_PASSENGERS}</td>
                  <td className="px-5 py-3 text-slate-600">{b.PHONE_NO}</td>
                  <td className="px-5 py-3 text-slate-400">{b.BOOKING_DATE ? new Date(b.BOOKING_DATE).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/bookings/guide/${b.BOOLING_ID}`} className="text-gw-brand p-2 inline-block">
                      <FaEye />
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
