"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { FaArrowLeft, FaEdit } from "react-icons/fa";
import { PageHeader, Card, Badge, Loading, PrimaryLink } from "@/components/admin/ui";

type VendorView = {
  VENDOR_ID: string;
  COMPANY_NAME: string;
  VEN_TYP_NAME: string;
  ADDRESS1: string;
  ADDRESS2: string;
  CONTACT_PERSON: string;
  EMAIL1: string;
  EMAIL2: string;
  PHONENO1: string;
  PHONENO2: string;
  WEBSITE: string;
  CITY_NAME: string;
  STATE_NAME: string;
  COUNTRY_NAME: string;
  PINCODE: string;
  IS_ACTIVE: string;
};

type Login = { USER_NAME: string; LOGIN_ID: string; IS_ACTIVE: string };

export default function VendorViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vendor, setVendor] = useState<VendorView | null>(null);
  const [login, setLogin] = useState<Login | null>(null);

  useEffect(() => {
    fetch(`/api/admin/vendors/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setVendor(d.vendor);
        setLogin(d.login);
      });
  }, [id]);

  if (!vendor) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/admin/vendors" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <FaArrowLeft /> Back to Vendor List
      </Link>
      <PageHeader
        title={vendor.COMPANY_NAME}
        subtitle={vendor.VEN_TYP_NAME}
        action={
          <PrimaryLink href={`/admin/vendors/${id}/edit`}>
            <FaEdit /> Edit
          </PrimaryLink>
        }
      />

      <Card className="p-6 mb-5">
        <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wide">Company / Vendor Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <Row label="Company Address" value={[vendor.ADDRESS1, vendor.ADDRESS2].filter(Boolean).join(", ")} full />
          <Row label="Contact Person" value={vendor.CONTACT_PERSON} />
          <Row label="Email Address 1" value={vendor.EMAIL1} />
          <Row label="Email Address 2" value={vendor.EMAIL2 || "—"} />
          <Row label="Phone No. 1" value={vendor.PHONENO1} />
          <Row label="Phone No. 2" value={vendor.PHONENO2 || "—"} />
          <Row label="Website" value={vendor.WEBSITE || "—"} />
          <Row label="City / State" value={`${vendor.CITY_NAME}, ${vendor.STATE_NAME}`} />
          <Row label="Country" value={vendor.COUNTRY_NAME} />
          <Row label="Pin Code" value={vendor.PINCODE || "—"} />
          <div>
            <dt className="text-xs font-bold text-slate-400 uppercase">Status</dt>
            <dd className="mt-1">
              <Badge tone={vendor.IS_ACTIVE === "Y" ? "green" : "slate"}>
                {vendor.IS_ACTIVE === "Y" ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
        </dl>
      </Card>

      {login && (
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wide">Login Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <Row label="User Name" value={login.USER_NAME} />
            <Row label="Login Id" value={login.LOGIN_ID} />
            <div>
              <dt className="text-xs font-bold text-slate-400 uppercase">Active</dt>
              <dd className="mt-1">
                <Badge tone={login.IS_ACTIVE === "Y" ? "green" : "slate"}>{login.IS_ACTIVE === "Y" ? "Yes" : "No"}</Badge>
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-xs font-bold text-slate-400 uppercase">{label}</dt>
      <dd className="text-slate-800 mt-0.5">{value || "—"}</dd>
    </div>
  );
}
