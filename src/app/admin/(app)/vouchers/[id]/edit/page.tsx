"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { PageHeader, Loading, EmptyState } from "@/components/admin/ui";
import VoucherForm from "@/components/admin/VoucherForm";
import type { VoucherDoc } from "@/lib/vouchers";

type State = { voucher: VoucherDoc } | { error: string } | null;

export default function EditVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // the voucher number, e.g. GW-V-0001
  const [state, setState] = useState<State>(null);

  useEffect(() => {
    fetch(`/api/admin/vouchers/${encodeURIComponent(id)}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        setState(r.ok ? { voucher: d.voucher } : { error: d.error || "Could not load this voucher." });
      })
      .catch(() => setState({ error: "Could not load this voucher." }));
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <PageHeader title={`Edit Voucher ${id}`} />
      {state === null ? (
        <Loading />
      ) : "error" in state ? (
        <>
          <EmptyState message={state.error} />
          <Link href="/admin/vouchers" className="inline-block mt-4 text-sm font-bold text-gw-brand hover:underline">
            ← Back to vouchers
          </Link>
        </>
      ) : (
        <VoucherForm key={state.voucher.VOUCHER_NO} voucher={state.voucher} />
      )}
    </div>
  );
}
