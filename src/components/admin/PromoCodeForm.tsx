"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaSave } from "react-icons/fa";
import { Card, Field, inputCls } from "@/components/admin/ui";

export type PromoInitial = {
  vendorId: string;
  title: string;
  code: string;
  validFrom: string;
  validTo: string;
  desc: string;
  isActive: string;
};

export default function PromoCodeForm({ promoId, initial }: { promoId?: string; initial?: PromoInitial }) {
  const router = useRouter();
  const [vendorId, setVendorId] = useState(initial?.vendorId || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [code, setCode] = useState(initial?.code || "");
  const [validFrom, setValidFrom] = useState(initial?.validFrom || "");
  const [validTo, setValidTo] = useState(initial?.validTo || "");
  const [desc, setDesc] = useState(initial?.desc || "");
  const [isActive, setIsActive] = useState(initial?.isActive || "Y");
  const [image, setImage] = useState<File | null>(null);
  const [vendors, setVendors] = useState<{ VENDOR_ID: string; COMPANY_NAME: string }[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/promo-codes")
      .then((r) => r.json())
      .then((d) => setVendors(d.vendors));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!vendorId || !title || !code || !validFrom || !validTo) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!promoId && !image) {
      setError("Promo Code image is required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("vendorId", vendorId);
      fd.set("title", title);
      fd.set("code", code);
      fd.set("validFrom", validFrom);
      fd.set("validTo", validTo);
      fd.set("desc", desc);
      fd.set("isActive", isActive);
      if (image) fd.set("image", image);

      const res = await fetch(promoId ? `/api/admin/promo-codes/${promoId}` : "/api/admin/promo-codes", {
        method: promoId ? "PUT" : "POST",
        body: fd,
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed.");
      router.push("/admin/promo-codes");
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="Vendor" required>
            <select className={inputCls} value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              <option value="">--</option>
              {vendors.map((v) => (
                <option key={v.VENDOR_ID} value={v.VENDOR_ID}>
                  {v.COMPANY_NAME}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Promo Code Name" required>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
          <Field label="Promo Code" required>
            <input className={inputCls} value={code} onChange={(e) => setCode(e.target.value)} />
          </Field>
          <Field label="From Date" required>
            <input type="date" className={inputCls} value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
          </Field>
          <Field label="To Date" required>
            <input type="date" className={inputCls} value={validTo} onChange={(e) => setValidTo(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label={promoId ? "Promo Code Image (leave blank to keep)" : "Promo Code Image (600 × 345 px)"} required={!promoId}>
            <input className={inputCls} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
          </Field>
          <Field label="Status">
            <select className={inputCls} value={isActive} onChange={(e) => setIsActive(e.target.value)}>
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </Field>
        </div>
        <Field label="Terms & Condition / Description">
          <textarea rows={4} className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Field>
      </Card>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push("/admin/promo-codes")} className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gw-brand hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60">
          <FaSave /> {saving ? "Saving…" : promoId ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}
