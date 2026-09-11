"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Loading } from "@/components/admin/ui";

type Booking = {
  HOTEL_BOOKING_ID: string;
  CUST_NAME: string;
  PHONE_NO: string;
  EMAIL_ADDRESS: string;
  NO_OF_GUESTS: number;
  NO_OF_ROOMS: number;
  HOTEL_CITY: string;
  ROOM_TYPE: string;
  HOTEL_CATEGORY: string;
  ARRIVAL_DATE: string;
  DEPARTURE_DATE: string;
  CREATED_ON: string;
};

export default function HotelBookingListPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/bookings/hotel")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader title="Hotel Booking List" subtitle="Enquiries submitted from the Hotel Booking page" />

      {bookings === null ? (
        <Loading />
      ) : bookings.length === 0 ? (
        <EmptyState message="No hotel bookings yet." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Room / Category</th>
                <th className="px-5 py-3">Guests / Rooms</th>
                <th className="px-5 py-3">Arrival – Departure</th>
                <th className="px-5 py-3">Order Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.HOTEL_BOOKING_ID} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-semibold text-slate-800">{b.CUST_NAME}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {b.PHONE_NO}
                    <div className="text-xs text-slate-400">{b.EMAIL_ADDRESS}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{b.HOTEL_CITY}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {b.ROOM_TYPE} / {b.HOTEL_CATEGORY}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {b.NO_OF_GUESTS} guests, {b.NO_OF_ROOMS} rooms
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {b.ARRIVAL_DATE ? new Date(b.ARRIVAL_DATE).toLocaleDateString() : "—"} –{" "}
                    {b.DEPARTURE_DATE ? new Date(b.DEPARTURE_DATE).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-400">{b.CREATED_ON ? new Date(b.CREATED_ON).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
