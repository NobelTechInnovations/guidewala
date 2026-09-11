"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaSave } from "react-icons/fa";
import { Card, Field, inputCls } from "@/components/admin/ui";

type Lookups = {
  cities: { CITY_ID: string; CITY_NAME: string }[];
  states: { STATE_ID: string; STATE_NAME: string }[];
  countries: { COUNTRY_ID: string; COUNTRY_NAME: string }[];
  vendorTypes: { VEN_TYP_ID: number; VEN_TYP_NAME: string }[];
};

export type VendorFormValues = {
  companyName: string;
  venTypId: string;
  address1: string;
  address2: string;
  contactPerson: string;
  email1: string;
  email2: string;
  phone1: string;
  phone2: string;
  website: string;
  cityId: string;
  stateId: string;
  countryId: string;
  pinCode: string;
  isActive: string;
  userName: string;
  loginId: string;
  password: string;
  loginActive: string;
};

const BLANK: VendorFormValues = {
  companyName: "",
  venTypId: "",
  address1: "",
  address2: "",
  contactPerson: "",
  email1: "",
  email2: "",
  phone1: "",
  phone2: "",
  website: "",
  cityId: "",
  stateId: "",
  countryId: "",
  pinCode: "",
  isActive: "Y",
  userName: "",
  loginId: "",
  password: "",
  loginActive: "Y",
};

export default function VendorForm({
  initial,
  vendorId,
}: {
  initial?: Partial<VendorFormValues>;
  vendorId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<VendorFormValues>({ ...BLANK, ...initial });
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/lookups")
      .then((r) => r.json())
      .then(setLookups);
  }, []);

  const set = (key: keyof VendorFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!values.companyName || !values.address1 || !values.contactPerson || !values.email1 || !values.phone1) {
      setError("Please fill in all required company fields.");
      return;
    }
    if (!values.cityId || !values.stateId || !values.countryId) {
      setError("Please select City, State and Country.");
      return;
    }
    if (!values.userName || !values.loginId || (!vendorId && !values.password)) {
      setError("Please fill in all required login fields.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(vendorId ? `/api/admin/vendors/${vendorId}` : "/api/admin/vendors", {
        method: vendorId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed.");
      router.push("/admin/vendors");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <Card className="p-6 mb-5">
        <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wide">Company / Vendor Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="Company Type" required>
            <select className={inputCls} value={values.venTypId} onChange={set("venTypId")}>
              <option value="">--</option>
              {lookups?.vendorTypes.map((t) => (
                <option key={t.VEN_TYP_ID} value={t.VEN_TYP_ID}>
                  {t.VEN_TYP_NAME}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Company Name" required>
            <input className={inputCls} value={values.companyName} onChange={set("companyName")} placeholder="Company Name" />
          </Field>
        </div>
        <Field label="Company Address" required>
          <input className={inputCls} value={values.address1} onChange={set("address1")} placeholder="Company Address" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
          <Field label="Contact Person" required>
            <input className={inputCls} value={values.contactPerson} onChange={set("contactPerson")} placeholder="Contact Person" />
          </Field>
          <Field label="Email Address 1" required>
            <input className={inputCls} value={values.email1} onChange={set("email1")} placeholder="Email Address 1" />
          </Field>
          <Field label="Email Address 2">
            <input className={inputCls} value={values.email2} onChange={set("email2")} placeholder="Email Address 2" />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
          <Field label="Phone No. 1" required>
            <input className={inputCls} value={values.phone1} onChange={set("phone1")} placeholder="Phone No. 1" />
          </Field>
          <Field label="Phone No. 2">
            <input className={inputCls} value={values.phone2} onChange={set("phone2")} placeholder="Phone No. 2" />
          </Field>
          <Field label="Website">
            <input className={inputCls} value={values.website} onChange={set("website")} placeholder="www.website.com" />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
          <Field label="City" required>
            <select className={inputCls} value={values.cityId} onChange={set("cityId")}>
              <option value="">--</option>
              {lookups?.cities.map((c) => (
                <option key={c.CITY_ID} value={c.CITY_ID}>
                  {c.CITY_NAME}
                </option>
              ))}
            </select>
          </Field>
          <Field label="State" required>
            <select className={inputCls} value={values.stateId} onChange={set("stateId")}>
              <option value="">--</option>
              {lookups?.states.map((s) => (
                <option key={s.STATE_ID} value={s.STATE_ID}>
                  {s.STATE_NAME}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Country" required>
            <select className={inputCls} value={values.countryId} onChange={set("countryId")}>
              <option value="">--</option>
              {lookups?.countries.map((c) => (
                <option key={c.COUNTRY_ID} value={c.COUNTRY_ID}>
                  {c.COUNTRY_NAME}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
          <Field label="Pin Code">
            <input className={inputCls} value={values.pinCode} onChange={set("pinCode")} placeholder="Pin Code" />
          </Field>
          <Field label="Status" required>
            <select className={inputCls} value={values.isActive} onChange={set("isActive")}>
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wide">Login Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="User Name" required>
            <input className={inputCls} value={values.userName} onChange={set("userName")} placeholder="User Name" />
          </Field>
          <Field label="Active" required>
            <select className={inputCls} value={values.loginActive} onChange={set("loginActive")}>
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="Login Id" required>
            <input className={inputCls} value={values.loginId} onChange={set("loginId")} placeholder="Login Id" />
          </Field>
          <Field label={vendorId ? "Password (leave blank to keep)" : "Password"} required={!vendorId}>
            <input
              className={inputCls}
              type="text"
              value={values.password}
              onChange={set("password")}
              placeholder="Password"
            />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/vendors")}
          className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60"
        >
          <FaSave /> {saving ? "Saving…" : vendorId ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}
