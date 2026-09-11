"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FaSearch, FaEye } from "react-icons/fa";
import { PageHeader, Card, Badge, EmptyState, Loading, inputCls } from "@/components/admin/ui";

type Guide = {
  GUIDE_ID: number;
  FIRST_NAME: string;
  LAST_NAME: string;
  PHONE_NO: string;
  EMAIL: string;
  CITY: string;
  STATE: string;
  COUNTRY: string;
  REGISTRED_ON: string;
  STATUS: string;
};

const STATUS_LABEL: Record<string, { label: string; tone: "green" | "yellow" | "red" }> = {
  A: { label: "Accepted", tone: "green" },
  P: { label: "Pending", tone: "yellow" },
  R: { label: "Rejected", tone: "red" },
};

export default function GuideListPage() {
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("ALL");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (status !== "ALL") params.set("status", status);
    const res = await fetch(`/api/admin/guides?${params}`);
    const data = await res.json();
    setGuides(data.guides);
  }, [city, status]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader title="Guide List" subtitle="Government-approved guide registrations" />

      <Card className="p-4 mb-5 flex flex-wrap items-end gap-3">
        <div className="w-40">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} placeholder="Search city" />
        </div>
        <div className="w-40">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="ALL">All</option>
            <option value="A">Accepted</option>
            <option value="P">Pending</option>
            <option value="R">Rejected</option>
          </select>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-lg text-sm"
        >
          <FaSearch /> Search
        </button>
      </Card>

      {guides === null ? (
        <Loading />
      ) : guides.length === 0 ? (
        <EmptyState message="No guides found." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="px-5 py-3">Guide Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Registered</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {guides.map((g) => {
                const s = STATUS_LABEL[g.STATUS] || STATUS_LABEL.P;
                return (
                  <tr key={g.GUIDE_ID} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {g.FIRST_NAME} {g.LAST_NAME}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{g.PHONE_NO}</td>
                    <td className="px-5 py-3 text-slate-600">{g.EMAIL}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {g.CITY}, {g.STATE}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {g.REGISTRED_ON ? new Date(g.REGISTRED_ON).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/guides/${g.GUIDE_ID}`} className="text-gw-brand p-2 inline-block">
                        <FaEye />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
