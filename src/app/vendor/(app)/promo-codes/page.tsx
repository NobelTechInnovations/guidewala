"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { PageHeader, Card, Badge, EmptyState, Loading, PrimaryLink } from "@/components/admin/ui";

type Promo = {
  PROMO_ID: string;
  PROMO_TITLE: string;
  PROMO_CODE: string;
  PROMO_CODE_IMG: string;
  VALID_FROM: string;
  VALID_TO: string;
  IS_ACTIVE: string;
};

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || "";

export default function VendorPromoCodeListPage() {
  const [promos, setPromos] = useState<Promo[] | null>(null);

  const load = () =>
    fetch("/api/vendor/promo-codes")
      .then((r) => r.json())
      .then((d) => setPromos(d.promos));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/vendor/promo-codes/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader
        title="Promo Codes"
        subtitle="Coupons shown to travelers on the public Coupons page"
        action={
          <PrimaryLink href="/vendor/promo-codes/new">
            <FaPlus /> New Promo Code
          </PrimaryLink>
        }
      />

      {promos === null ? (
        <Loading />
      ) : promos.length === 0 ? (
        <EmptyState message="No promo codes yet." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="px-5 py-3">Image</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Valid</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.PROMO_ID} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    {p.PROMO_CODE_IMG && (
                      <div className="relative w-20 h-11 rounded-md overflow-hidden bg-slate-100">
                        <Image src={`${IMG_BASE}/img/PromoCode/${p.PROMO_CODE_IMG}`} alt={p.PROMO_TITLE} fill sizes="80px" className="object-cover" />
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{p.PROMO_TITLE}</td>
                  <td className="px-5 py-3 text-slate-600 font-mono">{p.PROMO_CODE}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {new Date(p.VALID_FROM).toLocaleDateString()} – {new Date(p.VALID_TO).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={p.IS_ACTIVE === "Y" ? "green" : "slate"}>{p.IS_ACTIVE === "Y" ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <Link href={`/vendor/promo-codes/${p.PROMO_ID}/edit`} className="text-slate-400 hover:text-gw-brand p-2 inline-block">
                      <FaEdit />
                    </Link>
                    <button onClick={() => remove(p.PROMO_ID, p.PROMO_TITLE)} className="text-slate-400 hover:text-red-500 p-2 inline-block">
                      <FaTrash />
                    </button>
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
