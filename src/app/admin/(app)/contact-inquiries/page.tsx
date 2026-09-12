"use client";

import { useEffect, useState } from "react";
import { FaEnvelopeOpen, FaEnvelope } from "react-icons/fa";
import { PageHeader, Card, Badge, EmptyState, Loading } from "@/components/admin/ui";

type Inquiry = {
  _id: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  PHONE: string;
  EMAIL: string;
  SUBJECT: string;
  MESSAGE: string;
  IS_READ: boolean;
  CREATED_ON: string;
};

export default function ContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);

  const load = () =>
    fetch("/api/admin/contact-inquiries")
      .then((r) => r.json())
      .then((d) => setInquiries(d.inquiries));

  useEffect(() => {
    load();
  }, []);

  const toggleRead = async (id: string, isRead: boolean) => {
    await fetch(`/api/admin/contact-inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: !isRead }),
    });
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader title="Contact Inquiries" subtitle="Messages submitted through the Contact Us page" />

      {inquiries === null ? (
        <Loading />
      ) : inquiries.length === 0 ? (
        <EmptyState message="No contact inquiries yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {inquiries.map((i) => (
            <Card key={i._id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">
                      {i.FIRST_NAME} {i.LAST_NAME}
                    </h3>
                    {!i.IS_READ && <Badge tone="green">New</Badge>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {i.EMAIL} · {i.PHONE} · {i.CREATED_ON ? new Date(i.CREATED_ON).toLocaleString() : "—"}
                  </p>
                </div>
                <button
                  onClick={() => toggleRead(i._id, i.IS_READ)}
                  className="text-slate-400 hover:text-gw-brand p-2 shrink-0"
                  title={i.IS_READ ? "Mark as unread" : "Mark as read"}
                >
                  {i.IS_READ ? <FaEnvelopeOpen /> : <FaEnvelope />}
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">{i.SUBJECT}</p>
              <p className="text-sm text-slate-600">{i.MESSAGE}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
