"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaEye } from "react-icons/fa";
import { PageHeader, Card, EmptyState, Loading } from "@/components/admin/ui";

type Booking = {
  TAXI_BOOKING_ID: string;
  CUST_NAME: string;
  PHONE_NO: string;
  DATE_OD_TRAVEL: string;
  TYPE_OF_VEHICLE: string;
  NO_OF_PASSENGERS: number;
  CITY: string;
  CREATED_ON: string;
};

export default function TaxiBookingListPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/bookings/taxi")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader title="Taxi Booking List" subtitle="Enquiries submitted from the Taxi Service page" />

      {bookings === null ? (
        <Loading />
      ) : bookings.length === 0 ? (
        <EmptyState message="No taxi bookings yet." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Travel Date</th>
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Pass.</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Order Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.TAXI_BOOKING_ID} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{b.CUST_NAME}</td>
                  <td className="px-5 py-3 text-slate-600">{b.PHONE_NO}</td>
                  <td className="px-5 py-3 text-slate-600">{b.DATE_OD_TRAVEL ? new Date(b.DATE_OD_TRAVEL).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{b.TYPE_OF_VEHICLE}</td>
                  <td className="px-5 py-3 text-slate-600">{b.NO_OF_PASSENGERS}</td>
                  <td className="px-5 py-3 text-slate-600">{b.CITY}</td>
                  <td className="px-5 py-3 text-slate-400">{b.CREATED_ON ? new Date(b.CREATED_ON).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/bookings/taxi/${b.TAXI_BOOKING_ID}`} className="text-gw-brand p-2 inline-block">
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
