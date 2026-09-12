"use client";

import { useEffect, useState, use } from "react";
import { PageHeader, Loading } from "@/components/admin/ui";
import VendorPromoCodeForm, { VendorPromoInitial } from "@/components/vendor/VendorPromoCodeForm";

const toDateInput = (v: string) => (v ? new Date(v).toISOString().slice(0, 10) : "");

export default function EditVendorPromoCodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<VendorPromoInitial | null>(null);

  useEffect(() => {
    fetch(`/api/vendor/promo-codes/${id}`)
      .then((r) => r.json())
      .then((d) =>
        setInitial({
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
      {initial ? <VendorPromoCodeForm promoId={id} initial={initial} /> : <Loading />}
    </div>
  );
}
