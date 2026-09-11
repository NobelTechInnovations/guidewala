"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { PageHeader, Card, Loading } from "@/components/admin/ui";

type Booking = {
  DATE_OD_TRAVEL: string;
  TYPE_OF_VEHICLE: string;
  CREATED_ON: string;
  TAXI_ID: string;
  TOUR_PLAN: string;
  CUST_NAME: string;
  EMAIL_ADDRESS: string;
  PHONE_NO: string;
  WHATSAPP_NO: string;
  NO_OF_PASSENGERS: number;
  CITY: string;
  ADDRESS: string;
};

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-bold text-slate-400 uppercase">{label}</dt>
      <dd className="text-slate-800 mt-0.5">{value || value === 0 ? value : "—"}</dd>
    </div>
  );
}

export default function TaxiBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [b, setB] = useState<Booking | null>(null);

  useEffect(() => {
    fetch(`/api/admin/bookings/taxi/${id}`)
      .then((r) => r.json())
      .then((d) => setB(d.booking));
  }, [id]);

  if (!b) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/admin/bookings/taxi" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <FaArrowLeft /> Back to Taxi Booking List
      </Link>
      <PageHeader title="Taxi Booking Details" />

      <Card className="p-6 mb-5">
        <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wide">Booking Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <Row label="Date of Travel" value={b.DATE_OD_TRAVEL ? new Date(b.DATE_OD_TRAVEL).toLocaleDateString() : "—"} />
          <Row label="Type of Vehicle" value={b.TYPE_OF_VEHICLE} />
          <Row label="Booking Date" value={b.CREATED_ON ? new Date(b.CREATED_ON).toLocaleString() : "—"} />
          <Row label="Transaction Id" value={b.TAXI_ID} />
          <div className="sm:col-span-2">
            <Row label="Tour Plan" value={b.TOUR_PLAN} />
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wide">Customer Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <Row label="Name" value={b.CUST_NAME} />
          <Row label="E-mail Address" value={b.EMAIL_ADDRESS} />
          <Row label="Phone No." value={b.PHONE_NO} />
          <Row label="WhatsApp No." value={b.WHATSAPP_NO} />
          <Row label="Number of Person" value={b.NO_OF_PASSENGERS} />
          <Row label="City" value={b.CITY} />
          <div className="sm:col-span-2">
            <Row label="Address" value={b.ADDRESS} />
          </div>
        </dl>
      </Card>
    </div>
  );
}
