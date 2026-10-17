"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaEdit, FaPlus, FaPrint, FaSearch, FaTrash } from "react-icons/fa";
import { PageHeader, Card, EmptyState, Loading, PrimaryLink, inputCls } from "@/components/admin/ui";
import type { VoucherDoc } from "@/lib/vouchers";

const pad = (n: number) => String(n).padStart(2, "0");

/** dd/mm/yyyy from UTC parts: stay dates are stored as UTC midnight, so local time would shift them. */
function stayDate(v: string | Date): string {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

function firstCheckIn(v: VoucherDoc): string {
  const times = (v.ROWS || []).map((r) => new Date(r.CHECK_IN).getTime()).filter((t) => !Number.isNaN(t));
  return times.length ? stayDate(new Date(Math.min(...times))) : "—";
}

export default function VoucherListPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [vouchers, setVouchers] = useState<VoucherDoc[] | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0); // bumped after a delete to refetch

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/admin/vouchers?q=${encodeURIComponent(debouncedQ)}`, { signal: ctrl.signal })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || "Failed to load vouchers.");
        setVouchers(d.vouchers);
        setError("");
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setError(err?.message || "Failed to load vouchers.");
      });
    return () => ctrl.abort();
  }, [debouncedQ, reload]);

  const remove = async (v: VoucherDoc) => {
    if (!confirm(`Delete voucher ${v.VOUCHER_NO} for ${v.GUEST_NAME}? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/vouchers/${encodeURIComponent(v.VOUCHER_NO)}`, { method: "DELETE" });
    if (res.ok) {
      setReload((n) => n + 1);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Could not delete the voucher.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader
        title="Vouchers"
        subtitle="Service confirmations for guests' hotel stays"
        action={
          <PrimaryLink href="/admin/vouchers/new">
            <FaPlus /> New Voucher
          </PrimaryLink>
        }
      />

      <div className="relative mb-5 max-w-md">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" aria-hidden />
        <input
          className={`${inputCls} pl-9 bg-white`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search voucher no., guest or contact"
          aria-label="Search vouchers"
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {vouchers === null ? (
        error ? null : <Loading />
      ) : vouchers.length === 0 ? (
        <EmptyState message={debouncedQ ? `No vouchers match “${debouncedQ}”.` : "No vouchers yet."} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="px-5 py-3">No.</th>
                <th className="px-5 py-3">Guest</th>
                <th className="px-5 py-3">First check-in</th>
                <th className="px-5 py-3">Hotels</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => {
                const names = (v.ROWS || []).map((r) => r.HOTEL_NAME).join(", ");
                return (
                  <tr key={v.VOUCHER_NO} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">{v.VOUCHER_NO}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800">{v.GUEST_NAME}</div>
                      {v.CONTACT_NO && <div className="text-xs text-slate-500">{v.CONTACT_NO}</div>}
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{firstCheckIn(v)}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {(v.ROWS || []).length}
                      <div className="text-xs text-slate-400 max-w-xs truncate" title={names}>
                        {names}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                      {v.CREATED_ON ? new Date(v.CREATED_ON).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/vouchers/${v.VOUCHER_NO}/edit`}
                        aria-label={`Edit ${v.VOUCHER_NO}`}
                        title="Edit"
                        className="text-slate-400 hover:text-gw-brand p-2 inline-block"
                      >
                        <FaEdit />
                      </Link>
                      <Link
                        href={`/admin/voucher-print/${v.VOUCHER_NO}`}
                        target="_blank"
                        aria-label={`Print ${v.VOUCHER_NO}`}
                        title="Print"
                        className="text-slate-400 hover:text-gw-brand p-2 inline-block"
                      >
                        <FaPrint />
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(v)}
                        aria-label={`Delete ${v.VOUCHER_NO}`}
                        title="Delete"
                        className="text-slate-400 hover:text-red-500 p-2"
                      >
                        <FaTrash />
                      </button>
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
