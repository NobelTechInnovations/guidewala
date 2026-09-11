"use client";

import { useEffect, useState, use } from "react";
import { PageHeader, Loading } from "@/components/admin/ui";
import VendorForm, { VendorFormValues } from "@/components/admin/VendorForm";

export default function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<Partial<VendorFormValues> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/vendors/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const v = d.vendor;
        const l = d.login;
        setInitial({
          companyName: v.COMPANY_NAME,
          venTypId: v.VEN_TYP_ID ? String(v.VEN_TYP_ID) : "",
          address1: v.ADDRESS1,
          address2: v.ADDRESS2,
          contactPerson: v.CONTACT_PERSON,
          email1: v.EMAIL1,
          email2: v.EMAIL2,
          phone1: v.PHONENO1,
          phone2: v.PHONENO2,
          website: v.WEBSITE,
          cityId: v.CITY_ID,
          stateId: v.STATE_ID,
          countryId: v.COUNTRY_ID,
          pinCode: v.PINCODE,
          isActive: v.IS_ACTIVE,
          userName: l?.USER_NAME || "",
          loginId: l?.LOGIN_ID || "",
          password: "",
          loginActive: l?.IS_ACTIVE || "Y",
        });
      });
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <PageHeader title="Edit Vendor" subtitle="Update company / promo-code partner" />
      {initial ? <VendorForm initial={initial} vendorId={id} /> : <Loading />}
    </div>
  );
}
