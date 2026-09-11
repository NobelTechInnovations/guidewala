"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { PageHeader, Card, Loading } from "@/components/admin/ui";

type Booking = {
  DOS: string;
  TOGR: string;
  HOGR: number;
  OTHER_HOGR: string;
  TITLE_NAME: string;
  CITY_NAME: string;
  GUIDE_LANGUAGE: string;
  NO_OF_PASSENGERS: number;
  EXISTING_CUST: string;
  CUST_NAME: string;
  EMAIL_ADDRESS: string;
  PHONE_NO: string;
  WHATSAPP_NO: string;
  CUST_MSG: string;
  COUPON_TITLE: string;
  COUPON_CODE: string;
  COUPON_VENDOR: string;
  BOOKING_AMOUNT: number;
  BOOKING_DATE: string;
  PAYMENT_STATUS: string;
  PAYMENT_ID: string;
  TRANSACTION_ID: string;
};

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-bold text-slate-400 uppercase">{label}</dt>
      <dd className="text-slate-800 mt-0.5">{value || value === 0 ? value : "—"}</dd>
    </div>
  );
}

export default function GuideBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [b, setB] = useState<Booking | null>(null);

  useEffect(() => {
    fetch(`/api/admin/bookings/guide/${id}`)
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
      <Link href="/admin/bookings/guide" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <FaArrowLeft /> Back to Guide Booking List
      </Link>
      <PageHeader title="Guide Booking Details" />

      <Card className="p-6 mb-5">
        <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wide">Booking Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <Row label="Date of Sightseeing" value={b.DOS ? new Date(b.DOS).toLocaleDateString() : "—"} />
          <Row label="Time of Guide Reporting" value={b.TOGR} />
          <Row label="Package Name" value={b.TITLE_NAME} />
          <Row label="Package City" value={b.CITY_NAME} />
          <Row label="Guide Language" value={b.GUIDE_LANGUAGE} />
          <Row label="Number of Person" value={b.NO_OF_PASSENGERS} />
          <Row label="Existing Customer" value={b.EXISTING_CUST} />
        </dl>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wide">Customer Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <Row label="Name" value={b.CUST_NAME} />
          <Row label="E-mail Address" value={b.EMAIL_ADDRESS} />
          <Row label="Phone No." value={b.PHONE_NO} />
          <Row label="WhatsApp No." value={b.WHATSAPP_NO} />
          <div className="sm:col-span-2">
            <Row label="Customer Message" value={b.CUST_MSG} />
          </div>
        </dl>
      </Card>

      {b.COUPON_CODE && (
        <Card className="p-6 mb-5">
          <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wide">Coupon Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <Row label="Coupon Title" value={b.COUPON_TITLE} />
            <Row label="Coupon Code" value={b.COUPON_CODE} />
            <div className="sm:col-span-2">
              <Row label="Company / Vendor" value={b.COUPON_VENDOR} />
            </div>
          </dl>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wide">Payment Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <Row label="Booking Amount" value={b.BOOKING_AMOUNT ? `₹${b.BOOKING_AMOUNT}` : "—"} />
          <Row label="Booking Date" value={b.BOOKING_DATE ? new Date(b.BOOKING_DATE).toLocaleString() : "—"} />
          <Row label="Payment Status" value={b.PAYMENT_STATUS || "Pending (no payment gateway)"} />
          <Row label="Payment ID" value={b.PAYMENT_ID} />
          <div className="sm:col-span-2">
            <Row label="Transaction ID" value={b.TRANSACTION_ID} />
          </div>
        </dl>
      </Card>
    </div>
  );
}
