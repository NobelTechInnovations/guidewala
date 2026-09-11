"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { FaCheckCircle, FaTimesCircle, FaClock, FaArrowLeft } from "react-icons/fa";
import { PageHeader, Card, Badge, Loading } from "@/components/admin/ui";

type Guide = {
  GUIDE_ID: number;
  FIRST_NAME: string;
  LAST_NAME: string;
  PHONE_NO: string;
  EMAIL: string;
  ADDRESS1: string;
  ADDRESS2: string;
  CITY: string;
  PIN_CODE: string;
  STATE: string;
  COUNTRY: string;
  LANGUAGE: string;
  EXP_GUIDE_CITIES: string;
  GUIDE_DESC: string;
  PAN_NO: string;
  BANK_DETAILS: string;
  STATUS: string;
};

const STATUS_LABEL: Record<string, { label: string; tone: "green" | "yellow" | "red" }> = {
  A: { label: "Accepted", tone: "green" },
  P: { label: "Pending", tone: "yellow" },
  R: { label: "Rejected", tone: "red" },
};

export default function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/admin/guides/${id}`);
    const data = await res.json();
    setGuide(data.guide);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setStatus = async (status: string) => {
    setBusy(true);
    await fetch(`/api/admin/guides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setBusy(false);
  };

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Loading />
      </div>
    );
  }

  const s = STATUS_LABEL[guide.STATUS] || STATUS_LABEL.P;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/admin/guides" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <FaArrowLeft /> Back to Guide List
      </Link>
      <PageHeader
        title={`${guide.FIRST_NAME} ${guide.LAST_NAME}`}
        subtitle={`Guide #${guide.GUIDE_ID}`}
        action={
          <div className="flex items-center gap-2">
            <button
              disabled={busy}
              onClick={() => setStatus("P")}
              className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 font-bold px-3 py-2 rounded-lg text-xs hover:bg-slate-50 disabled:opacity-50"
            >
              <FaClock /> Pending
            </button>
            <button
              disabled={busy}
              onClick={() => setStatus("A")}
              className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 font-bold px-3 py-2 rounded-lg text-xs hover:bg-green-100 disabled:opacity-50"
            >
              <FaCheckCircle /> Accept
            </button>
            <button
              disabled={busy}
              onClick={() => setStatus("R")}
              className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 font-bold px-3 py-2 rounded-lg text-xs hover:bg-red-100 disabled:opacity-50"
            >
              <FaTimesCircle /> Reject
            </button>
          </div>
        }
      />

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Badge tone={s.tone}>{s.label}</Badge>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-xs font-bold text-slate-400 uppercase">Phone</dt>
            <dd className="text-slate-800 mt-0.5">{guide.PHONE_NO}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-slate-400 uppercase">Email</dt>
            <dd className="text-slate-800 mt-0.5">{guide.EMAIL}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-slate-400 uppercase">Language(s)</dt>
            <dd className="text-slate-800 mt-0.5">{guide.LANGUAGE || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-slate-400 uppercase">Experience Cities</dt>
            <dd className="text-slate-800 mt-0.5">{guide.EXP_GUIDE_CITIES || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold text-slate-400 uppercase">Address</dt>
            <dd className="text-slate-800 mt-0.5">
              {[guide.ADDRESS1, guide.ADDRESS2, guide.CITY, guide.STATE, guide.COUNTRY, guide.PIN_CODE]
                .filter(Boolean)
                .join(", ") || "—"}
            </dd>
          </div>
          {guide.GUIDE_DESC && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold text-slate-400 uppercase">About</dt>
              <dd className="text-slate-800 mt-0.5">{guide.GUIDE_DESC}</dd>
            </div>
          )}
          {(guide.PAN_NO || guide.BANK_DETAILS) && (
            <>
              <div>
                <dt className="text-xs font-bold text-slate-400 uppercase">PAN No.</dt>
                <dd className="text-slate-800 mt-0.5">{guide.PAN_NO || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-400 uppercase">Bank Details</dt>
                <dd className="text-slate-800 mt-0.5">{guide.BANK_DETAILS || "—"}</dd>
              </div>
            </>
          )}
        </dl>
      </Card>
    </div>
  );
}
