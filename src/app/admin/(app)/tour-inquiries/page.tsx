"use client";

import { useEffect, useState } from "react";
import { FaEnvelopeOpen, FaEnvelope, FaExternalLinkAlt, FaPhoneAlt, FaTrash, FaWhatsapp } from "react-icons/fa";
import { PageHeader, Card, Badge, EmptyState, Loading } from "@/components/admin/ui";

type Inquiry = {
  _id: string;
  NAME: string;
  PHONE: string;
  TRAVEL_DATE?: string;
  NO_OF_PERSONS?: number;
  PKG_ID?: number;
  PKG_TITLE?: string;
  PKG_URL?: string;
  IS_READ: boolean;
  CREATED_ON?: string;
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "—";

export default function TourInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);

  const load = () =>
    fetch("/api/admin/tour-inquiries")
      .then((r) => r.json())
      .then((d) => setInquiries(d.inquiries ?? []));

  useEffect(() => {
    load();
  }, []);

  const toggleRead = async (id: string, isRead: boolean) => {
    await fetch(`/api/admin/tour-inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: !isRead }),
    });
    load();
  };

  const remove = async (i: Inquiry) => {
    if (!confirm(`Delete the enquiry from ${i.NAME}? This can't be undone.`)) return;
    await fetch(`/api/admin/tour-inquiries/${i._id}`, { method: "DELETE" });
    load();
  };

  const unread = inquiries?.filter((i) => !i.IS_READ).length ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader
        title="Tour Package Inquiries"
        subtitle={`Enquiries sent from tour package pages${unread ? ` · ${unread} new` : ""}`}
      />

      {inquiries === null ? (
        <Loading />
      ) : inquiries.length === 0 ? (
        <EmptyState message="No tour package enquiries yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {inquiries.map((i) => (
            <Card key={i._id} className={`p-5 ${i.IS_READ ? "" : "border-l-4 border-l-gw-brand"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900">{i.NAME}</h3>
                    {!i.IS_READ && <Badge tone="green">New</Badge>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Received {i.CREATED_ON ? new Date(i.CREATED_ON).toLocaleString("en-IN") : "—"}
                  </p>
                </div>
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => toggleRead(i._id, i.IS_READ)}
                    className="text-slate-400 hover:text-gw-brand p-2"
                    title={i.IS_READ ? "Mark as unread" : "Mark as read"}
                  >
                    {i.IS_READ ? <FaEnvelopeOpen /> : <FaEnvelope />}
                  </button>
                  <button onClick={() => remove(i)} className="text-slate-400 hover:text-red-600 p-2" title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide">Phone</dt>
                  <dd className="flex items-center gap-2 font-semibold text-slate-800">
                    <a href={`tel:${i.PHONE}`} className="hover:text-gw-brand inline-flex items-center gap-1">
                      <FaPhoneAlt className="text-xs" /> {i.PHONE}
                    </a>
                    <a
                      href={`https://wa.me/91${i.PHONE}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700"
                      title="Open in WhatsApp"
                    >
                      <FaWhatsapp />
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide">Travel date</dt>
                  <dd className="font-semibold text-slate-800">{fmtDate(i.TRAVEL_DATE)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide">Persons</dt>
                  <dd className="font-semibold text-slate-800">{i.NO_OF_PERSONS ?? "—"}</dd>
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tour package</dt>
                  <dd className="min-w-0">
                    {i.PKG_URL ? (
                      <a
                        href={i.PKG_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-gw-brand hover:underline break-all"
                      >
                        {i.PKG_TITLE || `Package #${i.PKG_ID}`} <FaExternalLinkAlt className="text-xs shrink-0" />
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-800">{i.PKG_TITLE || `Package #${i.PKG_ID}`}</span>
                    )}
                    {i.PKG_URL && <p className="text-xs text-slate-400 break-all">{i.PKG_URL}</p>}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
