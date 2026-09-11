"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaEdit, FaPlus } from "react-icons/fa";
import { PageHeader, Card, Badge, EmptyState, Loading, PrimaryLink } from "@/components/admin/ui";

type Hotel = { HOTEL_ID: number; HOTEL_NAME: string; CITY_NAME: string; IS_ACTIVE: string; CREATED_ON: string };

export default function HotelListPage() {
  const [hotels, setHotels] = useState<Hotel[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/hotels")
      .then((r) => r.json())
      .then((d) => setHotels(d.hotels));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader
        title="Hotel List"
        subtitle="Partner hotels shown alongside packages"
        action={
          <PrimaryLink href="/admin/hotels/new">
            <FaPlus /> New Hotel
          </PrimaryLink>
        }
      />

      {hotels === null ? (
        <Loading />
      ) : hotels.length === 0 ? (
        <EmptyState message="No hotels yet." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="px-5 py-3">Hotel Name</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((h) => (
                <tr key={h.HOTEL_ID} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{h.HOTEL_NAME}</td>
                  <td className="px-5 py-3 text-slate-600">{h.CITY_NAME}</td>
                  <td className="px-5 py-3">
                    <Badge tone={h.IS_ACTIVE === "Y" ? "green" : "slate"}>{h.IS_ACTIVE === "Y" ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{h.CREATED_ON ? new Date(h.CREATED_ON).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/hotels/${h.HOTEL_ID}/edit`} className="text-slate-400 hover:text-gw-brand p-2 inline-block">
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
