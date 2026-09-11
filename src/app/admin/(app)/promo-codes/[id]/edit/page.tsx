"use client";

import { useEffect, useState, use } from "react";
import { PageHeader, Loading } from "@/components/admin/ui";
import PromoCodeForm, { PromoInitial } from "@/components/admin/PromoCodeForm";

const toDateInput = (v: string) => (v ? new Date(v).toISOString().slice(0, 10) : "");

export default function EditPromoCodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<PromoInitial | null>(null);

  useEffect(() => {
    fetch(`/api/admin/promo-codes/${id}`)
      .then((r) => r.json())
      .then((d) =>
        setInitial({
          vendorId: d.promo.VENDER_ID,
          title: d.promo.PROMO_TITLE,
          code: d.promo.PROMO_CODE,
          validFrom: toDateInput(d.promo.VALID_FROM),
          validTo: toDateInput(d.promo.VALID_TO),
          desc: d.promo.PROMO_DESC || "",
          isActive: d.promo.IS_ACTIVE,
        })
      );
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader title="Edit Promo Code" />
      {initial ? <PromoCodeForm promoId={id} initial={initial} /> : <Loading />}
    </div>
  );
}
