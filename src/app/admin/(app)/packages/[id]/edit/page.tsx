"use client";

import { useEffect, useState, use } from "react";
import { PageHeader, Loading } from "@/components/admin/ui";
import PackageForm from "@/components/admin/PackageForm";

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<{ title: string; cityId: string; amount: string; desc: string; isActive: string } | null>(
    null
  );

  useEffect(() => {
    fetch(`/api/admin/packages/${id}`)
      .then((r) => r.json())
      .then((d) =>
        setInitial({
          title: d.pkg.TITLE_NAME,
          cityId: d.pkg.CITY_ID,
          amount: String(d.pkg.PKG_AMOUNT),
          desc: d.pkg.PKG_DESC || "",
          isActive: d.pkg.IS_ACTIVE,
        })
      );
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader title="Edit Package" />
      {initial ? <PackageForm pkgId={Number(id)} initial={initial} /> : <Loading />}
    </div>
  );
}
